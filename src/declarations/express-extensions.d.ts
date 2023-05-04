import * as e from 'express'
declare global {
    namespace Express {
        interface Response {
            ack(message?: string, messageCode?: string): e.Response
            success(data: Record<string, unknown> | Record<string, unknown>[], messageCode?: string): e.Response
            error(err: Error | string, messageCode?: string): e.Response
            created(data: any): e.Response
            unauthenticated(message?: string, messageCode?: string): e.Response
            forbidden(message?: string): e.Response
            badRequest(message?: string, messageCode?: string): e.Response
            notFound(message?: string): e.Response
            unprocessableEntity(err?: Error | string, messageCode?: string): e.Response
        }
    }
}
