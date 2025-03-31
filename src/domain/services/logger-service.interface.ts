export enum LogLevel {
  INFO = 'info',
  ERROR = 'error',
  WARN = 'warn',
  DEBUG = 'debug',
  TRACE = 'trace'
}

export interface LoggerServiceInterface {
  info: (message: string, obj?: object) => void
  error: (message: string, obj?: object) => void
  warn: (message: string, obj?: object) => void
  debug: (message: string, obj?: object) => void
  trace: (message: string, obj?: object) => void
}
