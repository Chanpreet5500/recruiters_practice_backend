import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS_CODES } from '@utilities/http-status-codes'

/**
 * @description Login method validations (email, password and role type)
 * @param req 
 * @param res 
 * @param next 
 */
export const loginValidation = (req: Request, res: Response, next: NextFunction) => {
    req.checkBody('email').notEmpty().isEmail()
    const errors = req.validationErrors(true)
    if (errors) {
        return res.status(HTTP_STATUS_CODES.BadRequest).json({errors})
    }
    next()
}
