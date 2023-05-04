import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS_CODES } from '@utilities/http-status-codes'
import { User } from '@schema'
import { socialLoginTypes, userRoles} from '@utilities/constants'
import { IUser } from 'src/interfaces'
import jwt from 'jsonwebtoken'
import passport from 'passport'
/**
 * @description Login method validations (email, password)
 * @param req 
 * @param res 
 * @param next 
 */
export const loginValidation = (req: Request, res: Response, next: NextFunction) => {
    req.checkBody('email').notEmpty()
    req.checkBody('password').notEmpty()
    const errors = req.validationErrors(true)
    if (errors) {
        return res.status(HTTP_STATUS_CODES.UnprocessableEntity).json({errors})
    }
    next()
}
/**
 * @description username validation
 * @param req 
 * @param res 
 * @param next 
 */
export const usernameValidation  = async (req: Request, res: Response, next: NextFunction) => {
    req.checkBody('username', req.__('validations.required', 'Username')).notEmpty().isLength({ min: 3 })
        .matches('^[a-zA-Z0-9_]*$').withMessage(req.__('validations.usernameNotMatch'))
    const errors = req.validationErrors(true)
    if (errors) {
        return res.status(HTTP_STATUS_CODES.UnprocessableEntity).json({errors})
    }
    next()
}
/**
 * @description email validation
 * @param req 
 * @param res 
 * @param next 
 */
export const emailValidation  = async (req: Request, res: Response, next: NextFunction) => {
    req.checkBody('email', req.__('validations.required', 'Email')).notEmpty().isEmail().withMessage(req.__('validations.invalidEmail'))
    const errors = req.validationErrors(true)
    if (errors) {
        return res.status(HTTP_STATUS_CODES.UnprocessableEntity).json({errors})
    }
    next()
}
/**
 * @description username validation
 * @param req 
 * @param res 
 * @param next 
 */
export const socialUserValidation  = async (req: Request, res: Response, next: NextFunction) => {
    // req.checkBody('email', req.__('validations.required', 'Email')).notEmpty().isEmail().withMessage(req.__('validations.invalidEmail'))
    req.checkBody('token').notEmpty()
    req.checkBody('socialType', req.__('validations.required', 'Social Type')).notEmpty().isIn(socialLoginTypes).withMessage(req.__('validations.invalidValue'))
    const errors = req.validationErrors(true)
    if (errors) {
        return res.status(HTTP_STATUS_CODES.UnprocessableEntity).json({errors})
    }
    next()
}
/**
 * @description forgot password validation
 * @param req 
 * @param res 
 * @param next 
 */
export const forgotPasswordValidation = async (req: Request, res: Response, next: NextFunction) => {
    req.checkBody('email', req.__('validations.required', 'Email')).notEmpty().isEmail().withMessage(req.__('validations.invalidEmail')) 
    const errors = req.validationErrors(true)
    if (errors) {
        return res.status(HTTP_STATUS_CODES.UnprocessableEntity).json({errors})
    }
    next()
}
/**
 * @description reset password validation
 * @param req 
 * @param res 
 * @param next 
 */
export const resetPasswordValidation = async (req: Request, res: Response, next: NextFunction) => {
    req.checkBody('token').notEmpty()
    req.checkBody('password').notEmpty()
    const errors = req.validationErrors(true)
    if (errors) {
        return res.status(HTTP_STATUS_CODES.UnprocessableEntity).json({errors})
    }
    next()
}
/**
 * @description register validation
 * @param req 
 * @param res 
 * @param next 
 */
export const registerValidation = async (req: Request, res: Response, next: NextFunction) => {
    
    req.checkBody('email', req.__('validations.required', 'Email')).notEmpty().isEmail().withMessage(req.__('validations.invalidEmail'))
    req.checkBody('password', req.__('validations.required', 'Password')).notEmpty()
        .matches('^(?=.*)(?=.*[a-z])(?=.*[A-Z]).{8,}$').withMessage(req.__('validations.passwordNotMatch'))
        //  req.checkBody('username', req.__('validations.required', 'Username')).notEmpty().isLength({ min: 3 })
        // .matches('^[a-zA-Z0-9_]*$').withMessage(req.__('validations.usernameNotMatch'))
    //TODO to true tnc
    //req.checkBody('tnC', req.__('validations.required', 'T&C')).notEmpty().isBoolean().withMessage(req.__('validations.invalidValue'))
    // req.checkBody('roleType', req.__('validations.required', 'Role')).notEmpty().isIn(userRoles).withMessage(req.__('validations.invalidValue'))

    const errors = req.validationErrors(true)
    if (errors) {
        return res.status(HTTP_STATUS_CODES.UnprocessableEntity).json({ errors })
    }
    // check if email exist
    const emailExist = await User.find({email: req.body.email}).exec()
    if (emailExist && emailExist.length > 0) {
        return res.status(HTTP_STATUS_CODES.BadRequest).json({
            errors: {
                email: {
                    param: 'email',
                    message: req.__('validations.duplicateEmail'),
                    value: req.body.email,
                },
            },
            messageCode: 'duplicateEmail',
        })
    }
    // check if username exist
    const usernameExist: IUser | null = await User.findOne({username: { '$regex': new RegExp(['^', req.body.username, '$'].join(''), 'i') }}).exec()
    if (usernameExist) {
        return res.status(HTTP_STATUS_CODES.BadRequest).json({
            errors: {
                name: {
                    param: 'name',
                    message: req.__('validations.duplicateUsername'),
                    value: req.body.name,
                },
            },
            messageCode: 'duplicateUsername',
        })
    }

    next()
}

export const ImportEmailValidation = async (req: Request, res: Response, next: NextFunction) => {

    const errors = req.validationErrors(true)
    if(errors) {
        return res.status(HTTP_STATUS_CODES.BadRequest).json({errors})
    }
    
    const {candidate} = req.body
    console.log('candidate', candidate)
    
    if(candidate){
        const emailArr = []
        candidate.map((candidate, idx) => {
            emailArr.push({ name: candidate.first_name + ' ' + candidate.last_name, email: candidate.email})
            return emailArr
        })
        console.log(emailArr)
    }
           
    const emailExist = await User.find({email: req.body.email}).exec()
    if (emailExist && emailExist.length > 0) {
        return res.status(HTTP_STATUS_CODES.BadRequest).json({
            errors: {
                email: {
                    param: 'email',
                    message: req.__('validations.duplicateEmail'),
                    value: req.body.email,
                },
            },
            messageCode: 'duplicateEmail',
        })
    }
    next()
    
}
/**
 * @description social sign up validation
 * @param req 
 * @param res 
 * @param next 
 */
export const socialSignUpValidation  = async (req: Request, res: Response, next: NextFunction) => {
    req.checkBody('email', req.__('validations.required', 'Email')).notEmpty().isEmail().withMessage(req.__('validations.invalidEmail'))
    req.checkBody('token').notEmpty()
    req.checkBody('socialType', req.__('validations.required', 'Social Type')).notEmpty().isIn(socialLoginTypes).withMessage(req.__('validations.invalidValue'))
    req.checkBody('username', req.__('validations.required', 'Username')).notEmpty().isLength({ min: 3 })
        .matches('^[a-zA-Z0-9_]*$').withMessage(req.__('validations.usernameNotMatch'))
    req.checkBody('roleType', req.__('validations.required', 'Role')).notEmpty().isIn(userRoles).withMessage(req.__('validations.invalidValue'))
    const errors = req.validationErrors(true)
    if (errors) {
        return res.status(HTTP_STATUS_CODES.BadRequest).json({errors})
    }
    // check if email exist
    const emailExist = await User.find({email: req.body.email}).exec()
    if (emailExist && emailExist.length > 0) {
        return res.status(HTTP_STATUS_CODES.BadRequest).json({
            errors: {
                email: {
                    param: 'email',
                    message: req.__('validations.duplicateEmail'),
                    value: req.body.email,
                },
            },
            messageCode: 'duplicateEmail',
        })
    }
    // check if username exist
    const usernameExist = await User.find({username: { '$regex': new RegExp(['^', req.body.username, '$'].join(''), 'i') }}).exec()
    if (usernameExist && usernameExist.length > 0) {
        return res.status(HTTP_STATUS_CODES.BadRequest).json({
            errors: {
                name: {
                    param: 'name',
                    message: req.__('validations.duplicateUsername'),
                    value: req.body.name,
                },
            },
            messageCode: 'duplicateUsername',
        })
    }
    next()
}

/**
 * @description JWT token validations (req header token)
 * @param req 
 * @param res 
 * @param next 
 */
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    return passport.authenticate('jwt', { session: false, failWithError: true }, next)
}