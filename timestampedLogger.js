const util = require('util');

/**
 * Replaces all standard loggers with timestamped ones while retaining string formatting support.
 *
 * Yes, that's apparently a thing too. See https://developer.mozilla.org/en-US/docs/Web/API/console/log
 */
const replaceLoggers = () => {
  ['log', 'info', 'error', 'warn', 'debug'].forEach((v) => {
    const origLogger = console[v]; //eslint-disable-line
    console[v] = (...args) => { //eslint-disable-line
      // generate a timestamp prefix
      const ts = `[${new Date().toISOString().replace('T', ' ')}]`;
      // do some crazy format shenanigans
      const firstArg = args[0];
      if (args.length > 1 && typeof firstArg === 'string') {
        // number of consumable parameters
        let formatCount = 0;
        // whether this is a format string or not
        let isFmtStr = false;
        // duplicate the inspected string as we don't want to modify it
        let inspect = `${firstArg}`;
        // see https://github.com/nodejs/node/blob/master/doc/api/util.md
        const formats = ['s', 'd', 'i', 'f', 'j', 'o', 'O', 'c'];
        let idx = -1;
        while ((idx = inspect.indexOf('%')) >= 0) { //eslint-disable-line
          inspect = inspect.slice(idx + 1);
          const chr = inspect.charAt(0);
          if (chr === '%') {
            isFmtStr = true;
            continue; //eslint-disable-line
          }
          if (formats.includes(chr)) {
            isFmtStr = true;
            formatCount += 1;
          }
        }
        if (isFmtStr) {
          if (formatCount > 0) {
            return origLogger.apply(
              console,
              [
                // timestamp
                ts,
                // we'll only pass the consumed parameters to util.format()
                // and leave the rest intact for the logger
                util.format(
                  firstArg,
                  ...(args.slice(1, formatCount + 1)),
                ),
                // like so
                ...(args.slice(formatCount + 1)),
              ],
            );
          }
          // Because calling util.format() with just one parameter does not do what we
          // want it to do, we'll just do a simple replacement here and fall back to our
          // non-formatted log behaviour. Here's an example of undesired behaviour:
          //   > console.log("%% yadda yadda", "foo", { foo: 2 })
          //   = %% yadda yadda foo { foo: 2 } // <- WRONG!
          // This would be correct behaviour:
          //   > console.log("%% yadda yadda", "foo", { foo: 2 })
          //   = % yadda yadda foo { foo: 2 }
          // This should fix up the behaviour to match normal console logging.
          //   util.format("%%")          => "%%"
          //   util.format("%%", '')      => "% "
          //   util.format("%%%s", "foo") => "%foo"
          // Note that a console.log("%%") call would still output "%%", which is also what we want.
          // Confused yet? No big deal, so am I.
          args[0] = args[0].replaceAll('%%', '%'); //eslint-disable-line
        }
      }
      origLogger.apply(console, [ts, ...args]);
    };
  });
};

module.exports = {
  replaceLoggers,
};
