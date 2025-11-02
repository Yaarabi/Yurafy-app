/**
 * Structured logging utility
 * Replaces console.log with proper logging
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  userId?: string;
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    // In production, only log WARN and ERROR
    return level === LogLevel.WARN || level === LogLevel.ERROR;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.formatLog(LogLevel.DEBUG, message, data);
      console.debug(JSON.stringify(entry));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.formatLog(LogLevel.INFO, message, data);
      console.info(JSON.stringify(entry));
    }
  }

  warn(message: string, data?: any): void {
    const entry = this.formatLog(LogLevel.WARN, message, data);
    console.warn(JSON.stringify(entry));
  }

  error(message: string, error?: Error | unknown, data?: any): void {
    const entry = this.formatLog(LogLevel.ERROR, message, {
      ...data,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      } : error,
    });
    console.error(JSON.stringify(entry));
  }
}

export const logger = new Logger();

