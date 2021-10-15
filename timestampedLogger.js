/**
 * Replaces all standard loggers with timestamped ones while retaining string formatting support.
 *
 * Yes, that's apparently a thing too. See https://developer.mozilla.org/en-US/docs/Web/API/console/log
 */
const replaceLoggers = () => {
  const util = require('util');

  ["log", "info", "error", "warn", "debug"].forEach((v) => {
    const origLogger = console[v]
    console[v] = (...args) => {
      // generate a timestamp prefix
      const ts = "[" + new Date().toISOString().replace('T', ' ') + "]"
      // do some crazy format shenanigans
      const firstArg = args[0]
      if (args.length > 1 && typeof firstArg === 'string') {
        // number of consumable parameters
        let formatCount = 0
        // whether this is a format string or not
        let isFmtStr = false
        // duplicate the inspected string as we don't want to modify it
        let inspect = "" + firstArg
        // see https://github.com/nodejs/node/blob/master/doc/api/util.md
        const formats = ["s", "d", "i", "f", "j", "o", "O", "c"]
        let idx = -1
        while ((idx = inspect.indexOf("%")) >= 0) {
          inspect = inspect.slice(idx + 1)
          let chr = inspect.charAt(0)
          if (chr === '%') {
            isFmtStr = true
            continue
          }
          if (formats.includes(chr)) {
            isFmtStr = true
            formatCount += 1
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
                  ...(args.slice(1, formatCount + 1))
                ),
                // like so
                ...(args.slice(formatCount + 1))
              ]
            )
          } else {
            // Because calling util.format() with just one parameter does not do what we
            // want it to do, we'll just do a simple replacement here.
            //   util.format("%%")           => "%%"
            //   util.format("%%", '')       => "% "
            //   util.format("%% %s", "foo") => "%foo"
            args[0] = args[0].replaceAll("%%", "%")
          }
        }
      }
      origLogger.apply(console, [ts, ...args])
    }
  })
}

module.exports = {
  replaceLoggers
}
