import { LoggerServiceInterface } from '@/domain/services/logger-service.interface'
import { PubSubServiceInterface } from '@/domain/services/pub-sub-service.interface'
import { LoggerService } from './logger.service'
import Redis from 'ioredis'

export class PubSubService implements PubSubServiceInterface {
  private readonly redisSubscriber: Redis
  private readonly redisPublisher: Redis
  private readonly loggerService: LoggerServiceInterface

  constructor () {
    this.loggerService = new LoggerService()

    this.redisSubscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10)
    })

    this.redisPublisher = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10)
    })
  }

  async publish (channel: string, message: string): Promise<void> {
    try {
      await this.redisPublisher.publish(channel, message)
    } catch (error) {
      this.loggerService.error(`Failed to publish message to channel ${channel}:`, { error })
      throw error
    }
  }

  async subscribe (channel: string, handler: (message: string) => void): Promise<void> {
    try {
      await this.redisSubscriber.subscribe(channel)

      this.redisSubscriber.on('message', (receivedChannel: string, message: string) => {
        if (receivedChannel === channel) {
          handler(message)
        }
      })
    } catch (error) {
      this.loggerService.error(`Failed to subscribe to channel ${channel}:`, { error })
      throw error
    }
  }

  async close (): Promise<void> {
    try {
      await this.redisPublisher.quit()
      await this.redisSubscriber.quit()
    } catch (error) {
      this.loggerService.error('Error closing Redis connections:', { error })
    }
  }
}
