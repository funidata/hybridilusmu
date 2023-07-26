import { LogLevel, Logger } from "@slack/bolt";
import { Logger as NestLogger } from "@nestjs/common";

const levelToInt = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

export class BoltLogger implements Logger {
  private level = LogLevel.INFO;
  private name = "Bolt";
  private logger: NestLogger;

  constructor() {
    this.logger = new NestLogger(this.name);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  // No-op. Only here to implement Logger interface.
  setName(): void {
    return;
  }

  debug(...msgs: string[]): void {
    this.levelSensitiveLogger(msgs, LogLevel.DEBUG, (msg: string) =>
      this.logger.debug(msg),
    );
  }

  info(...msgs: string[]): void {
    this.levelSensitiveLogger(msgs, LogLevel.INFO, (msg: string) =>
      this.logger.log(msg),
    );
  }

  warn(...msgs: string[]): void {
    this.levelSensitiveLogger(msgs, LogLevel.WARN, (msg: string) =>
      this.logger.warn(msg),
    );
  }

  error(...msgs: string[]): void {
    this.levelSensitiveLogger(msgs, LogLevel.ERROR, (msg: string) =>
      this.logger.error(msg),
    );
  }

  private levelSensitiveLogger(
    msgs: string[],
    level: LogLevel,
    logFn: (s: string) => void,
  ) {
    if (levelToInt[this.level] > levelToInt[level]) {
      return;
    }

    msgs.forEach((msg) => logFn(msg));
  }
}
