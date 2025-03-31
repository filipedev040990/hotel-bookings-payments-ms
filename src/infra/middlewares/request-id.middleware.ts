import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'
import { createNamespace } from 'cls-hooked'

const requestContext = createNamespace('requestContext')

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  requestContext.run(() => {
    const requestId = req?.headers?.['x-request-id'] ?? randomUUID()

    requestContext.set('requestId', requestId)

    res.setHeader('X-Request-Id', requestId)

    next()
  })
}
