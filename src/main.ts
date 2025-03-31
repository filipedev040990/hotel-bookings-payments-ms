import 'module-alias/register'
import { LoggerService } from './shared/services/logger.service'
import cors from 'cors'
import express from 'express'
import { PubSubService } from './shared/services/pub-sub.service'
import { requestIdMiddleware } from './infra/middlewares/request-id.middleware'

async function init () {
  const loggerService = new LoggerService()
  const pubSubService = new PubSubService()

  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(requestIdMiddleware)

  const channel = 'reservation_request'

  loggerService.info(`Subscribed on channel: ${channel}`)

  await pubSubService.subscribe(channel, async (message: string) => {
    loggerService.info('Received message', { message })
    try {
      let data
      try {
        data = JSON.parse(message)
      } catch (parseError) {
        loggerService.error('Error parsing message', { message, parseError })
        return
      }
      //{"status":"confirmed","id":"745adbc5-d74b-48b4-a745-7cd3c4b5e13d","roomId":"008d0715-8144-41fd-aabb-3837511ff857"}
      const isPaid = Math.random() < 0.5

      const roomId = data.roomId
      const id = data.id
      const status = isPaid ? 'confirmed': 'refused'

      const channelToPublish = id
      const messageToPublish = JSON.stringify({
        status,
        id,
        roomId
      })

      setTimeout(async () => {
        await pubSubService.publish(channelToPublish, messageToPublish)
        loggerService.info('Published message success', { channelToPublish, messageToPublish })
      }, 30000);



    } catch (error) {
      loggerService.error('Error processing payment', { error })
    }
  })

  const port = process.env.PORT ?? 3000

  app.listen(port, () => loggerService.info(`Server running at port ${port}`))
}


void init()