type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: unknown;
}

class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, meta?: LogMeta) {
    const entry = {
      level,
      timestamp: new Date().toISOString(),
      context: this.context,
      message,
      ...meta,
    };

    const output = JSON.stringify(entry);

    if (level === 'error') {
      console.error(output);
    } else if (level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  debug(message: string, meta?: LogMeta) {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: LogMeta) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: LogMeta) {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error, meta?: LogMeta) {
    this.log('error', message, {
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
      ...meta,
    });
  }

  child(context: string): Logger {
    return new Logger(
      this.context ? `${this.context}:${context}` : context
    );
  }
}

export const logger = new Logger();
export { Logger };
