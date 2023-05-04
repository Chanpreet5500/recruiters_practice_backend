import * as express from 'express'
import { Response } from 'express-serve-static-core'
import { isNil, isString } from 'lodash'
import { HTTP_STATUS_CODES } from '@utilities/http-status-codes'

/*declare global {
    namespace Express {
        interface Response {
            ack(message?: string, messageCode?: string): express.Response
            success(data: Record<string, unknown> | Record<string, unknown>[], messageCode?: string): express.Response
            error(err: Error | string, messageCode?: string): express.Response
            created(data: any): express.Response
            unauthenticated(message?: string, messageCode?: string): express.Response
            forbidden(message?: string): express.Response
            badRequest(message?: string, messageCode?: string): express.Response
            notFound(message?: string): express.Response
            unprocessableEntity(err?: Error | string, messageCode?: string): express.Response
        }
    }
}*/
express.response.ack = function (message?: string, messageCode?: string): express.Response {
    const response = this as Response
    const data = { success: true, } as Record<string, unknown>
    if (!isNil(message)) {
        data.message = message
        data.messageCode = messageCode || ''
    }
    return response.json(data)
}

express.response.created = function (data: any): express.Response {
    const response = this as Response
    return response
        .status(HTTP_STATUS_CODES.Created)
        .json({
            success: true,
            data,
        })
}

express.response.success = function (data: Record<string, unknown> | Record<string, unknown>[], messageCode?: string): express.Response {
    const response = this as Response
    return response
        .status(HTTP_STATUS_CODES.OK)
        .json({
            success: true,
            messageCode: messageCode || '',
            data,
        })
}

express.response.error = function (err: Error | string, messageCode?: string): express.Response {
    const response = this as Response
    return response
        .status(HTTP_STATUS_CODES.InternalServerError)
        .json({
            success: false,
            messageCode: messageCode || '',
            message: isString(err) ? err : (process.env.NODE_ENV === 'production' ? response.__('errors.500') : err.message),
        })
}

express.response.notFound = function (message?: string): express.Response {
    const response = this as Response
    return response
        .status(HTTP_STATUS_CODES.NotFound)
        .json({
            success: false,
            message: message || 'Not Found',
        })
}

express.response.badRequest = function (message?: string, messageCode?: string): express.Response {
    const response = this as Response
    return response
        .status(HTTP_STATUS_CODES.BadRequest)
        .json({
            success: false,
            messageCode: messageCode || '',
            message: message || 'Bad Request',
        })
}

express.response.unauthenticated = function (message?: string, messageCode?: string): express.Response {
    const response = this as Response
    return response
        .status(HTTP_STATUS_CODES.Unauthenticated)
        .json({
            success: false,
            message: message || 'Unauthenticated',
            messageCode: messageCode || '',
        })
}

express.response.forbidden = function (message?: string): express.Response {
    const response = this as Response
    return response
        .status(HTTP_STATUS_CODES.Forbidden)
        .json({
            success: false,
            message: message || 'Forbidden',
        })
}

express.response.unprocessableEntity = function (message?: string, messageCode?: string): express.Response {
    const response = this as Response
    return response
        .status(HTTP_STATUS_CODES.UnprocessableEntity)
        .json({
            success: false,
            messageCode: messageCode || '',
            message: message || 'UnprocessableEntity',
        })
}
