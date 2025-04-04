import { LoggerServiceInterface, LogLevel } from '@/domain/services/logger-service.interface'
import pino, { Logger as PinoLogger } from 'pino'
import { getNamespace } from 'cls-hooked'
import * as fs from 'fs'
import * as path from 'path'

type LogData = {
  level: LogLevel
  requestId?: string
  [key: string]: any
}

export class LoggerService implements LoggerServiceInterface {
  private readonly logger: PinoLogger

  constructor () {
    const logDirectory = path.resolve(__dirname, '../../../app-logs')
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true })
    }

    const logFilePath = path.join(logDirectory, 'payments-ms.log')

    const streams = [
      {
        stream: pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'message'
          }
        })
      },
      {
        stream: fs.createWriteStream(logFilePath, { flags: 'a' })
      }
    ]

    const appName = 'payments-ms'
    this.logger = pino(
      {
        level: 'info',
        name: appName,
        base: { appName }
      },
      pino.multistream(streams)
    )
  }

  private logWithTracking (level: LogLevel, message: string, obj?: object): void {
    const requestId = getNamespace('requestContext')?.get('requestId')
    const additionalInfo = { requestId, ...obj }

    const logObject: LogData = { level, ...additionalInfo }

    switch (level) {
      case LogLevel.INFO:
        this.logger.info(logObject, message)
        break
      case LogLevel.ERROR:
        this.logger.error(logObject, message)
        break
      case LogLevel.WARN:
        this.logger.warn(logObject, message)
        break
      case LogLevel.DEBUG:
        this.logger.debug(logObject, message)
        break
      case LogLevel.TRACE:
        this.logger.trace(logObject, message)
        break
      default:
        this.logger.info(logObject, message)
        break
    }
  }

  info (message: string, obj?: object): void {
    this.logWithTracking(LogLevel.INFO, message, obj)
  }

  error (message: string, obj?: object): void {
    this.logWithTracking(LogLevel.ERROR, message, obj)
  }

  warn (message: string, obj?: object): void {
    this.logWithTracking(LogLevel.WARN, message, obj)
  }

  debug (message: string, obj?: object): void {
    this.logWithTracking(LogLevel.DEBUG, message, obj)
  }

  trace (message: string, obj?: object): void {
    this.logWithTracking(LogLevel.TRACE, message, obj)
  }
}
