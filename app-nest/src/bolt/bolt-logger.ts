import { LogLevel, Logger } from "@slack/bolt";
import { Logger as NestLogger } from "@nestjs/common";

const levelToInt = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

/**
 * Adapt Nest.js Logger to implement Bolt's Logger interface.
 */
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

  debug(msg: string): void {
    this.levelSensitiveLogger(LogLevel.DEBUG, () => this.logger.debug(msg));
  }

  info(msg: string): void {
    this.levelSensitiveLogger(LogLevel.INFO, () => this.logger.log(msg));
  }

  warn(msg: string): void {
    this.levelSensitiveLogger(LogLevel.WARN, () => this.logger.warn(msg));
  }

  error(msg: string): void {
    this.levelSensitiveLogger(LogLevel.ERROR, () => this.logger.error(msg));
  }

  private levelSensitiveLogger(level: LogLevel, logFn: () => void) {
    if (levelToInt[this.level] > levelToInt[level]) {
      return;
    }
    logFn();
  }
}
