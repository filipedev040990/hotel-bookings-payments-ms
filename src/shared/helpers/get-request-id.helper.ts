import { getNamespace } from 'cls-hooked'

export const getRequestId = (): string => {
  return getNamespace('requestContext')?.get('requestId')
}
