import { NextFunction, Request, Response } from 'express'
import { AuthController } from '@controller'

// TODO implement user type
export const validateToken = (req: Request, res: Response, next: NextFunction) => {
    return AuthController.authenticate((err: Error, user: any, info: any) => {
        if (err) { return res.error(err) }
        if (!user) {
            if (info.name === 'TokenExpiredError') {
                return res.unauthenticated(res.__('errors.tokenExpired'), 'tokenExpired')
            } else {
                return res.unauthenticated(info.message)
            }
        }
        req.app.set('user', user)
        return next()
    })(req, res, next)
}
