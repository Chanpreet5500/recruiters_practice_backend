import logger from '@utilities/logger'
import  bcrypt  from 'bcryptjs'
import axios from 'axios'
import qs from 'qs'
import _, { defaults } from 'lodash'
import nodemailer from 'nodemailer'
import { MailOptions } from 'nodemailer/lib/sendmail-transport'
import { readFileSync } from 'fs'
import { join } from 'path'
import nodemailerSendgrid from 'nodemailer-sendgrid'
const mailDefaults = {
    data: {},
    subject: 'Recruiters AI',
    from: `${process.env.SENDER} ${process.env.MAIL_FROM}`,
}

const crypto = require('crypto')

const algorithm = 'aes-256-ctr'
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'
const iv = crypto.randomBytes(16)
/**
 * Mail options
 * @property {object} data Data for replace from template.
 * @property {string} subject.
 * @property {string} htmlTemplate Template name to be use.
 */
export interface IMailOptions extends MailOptions {
    data?: Record<string, unknown>
    template?: string
}
/**
 * @description Is empty object
 */
export const isEmptyObj = (obj: Record<string, unknown>): boolean =>  {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false
        }
    }
    return true
}
/**
 * @description combine String 
 */
export const prepareString = (message: string, data: string[]): string => {
    let msg: string = message
    if (data && data.length > 0) {
        data.forEach((value: string) => {
            msg = msg.replace(/%s/, value)
        })
    }
    return msg
}
/**
 * @description Compare user password with db encrypted password
 * @param  {string} candidatePassword
 * @param  {string} originalPassword
 * @returns Promise<boolean> Return true/false
 */
export const comparePassword = (originalPassword: string, candidatePassword: string) => {
    return new Promise((resolve_, reject_) => {
        console.log(originalPassword, candidatePassword)
        bcrypt.compare(candidatePassword, originalPassword, (err, success) => {
            if (err) { return reject_(err) }
            return resolve_(success)
        })
    })
}

/**
 * @description Validate facebook token
 * @param {string} token
 */
export const validateFBToken = async (token: string): Promise<boolean> => {
    const appLink = `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FB_APP_ID}&client_secret=${process.env.FB_APP_SECRET}&grant_type=client_credentials`
    const appToken = await axios.get(appLink)
        .then((response) => {
            return response.data.access_token
        })
        .catch((err) => {
            logger.debug(err)
            return false
        })

    if (!appToken) { return false}
    // verify access token
    const verifyLink = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appToken}`
    const isValidFBToken = await axios.get(verifyLink)
        .then((response) => { 
            return response.data.data.is_valid
        })
        .catch((err) => {
            logger.debug(err)
            return false
        })

    if (!isValidFBToken) {  
        return false
    }
    return true
}
/**
 * @description Validate linkdin access token
 * @param token 
 */
export const validateLIAccessToken = async (token: string): Promise<boolean> => {
    const url = 'https://www.linkedin.com/oauth/v2/introspectToken'
    const isValidLIToken = await axios.post(url, qs.stringify({client_id: process.env.LI_APP_ID, 
        client_secret: process.env.LI_APP_SECRET, token:token}),
    {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        .then(() => { 
            return true
        })
        .catch((err) => { 
            logger.debug(err)
            return false
        })
    if (!isValidLIToken) {  
        return false
    }
    return isValidLIToken
}
/**
 * @description Validate linkedIn token
 * @param token
 */
export const validateLIToken = async (token: string): Promise<boolean | any> => {
    const dataObj = {
        grant_type: 'authorization_code',
        code: token,
        redirect_uri: `${process.env.CLIENT_APP_LINKEDIN_HOST}/linkedin`,
        client_id: process.env.LI_APP_ID,
        client_secret: process.env.LI_APP_SECRET,
    }
    const liAccessToken =  await axios.post('https://www.linkedin.com/oauth/v2/accessToken', qs.stringify(dataObj), 
        {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        .then((response) => { 
            return response.data.access_token
        })
        .catch((err) => { 
            logger.debug(err)
            return false
        })
    if (!liAccessToken) {  
        return false
    }
    const headers = {
        'Authorization': `Bearer ${liAccessToken}`,
    }
    const emailData: any = await axios.get(
        'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', { 'headers': headers }
    ).then((data: any) => {
        return data.data.elements[0]['handle~']['emailAddress']
    })
        .catch(() => {
            return false
        })
    if (!emailData) {  
        return false
    }
    const url = 'https://www.linkedin.com/oauth/v2/introspectToken'
    const isValidLIToken = await axios.post(url, qs.stringify({client_id: process.env.LI_APP_ID, 
        client_secret: process.env.LI_APP_SECRET, token:liAccessToken}),
    {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        .then(() => { 
            return true
        })
        .catch((err) => { 
            logger.debug(err)
            return false
        })
    if (!isValidLIToken) {  
        return false
    }
    return {emailLI: emailData, accessToken: liAccessToken}
}
/**
 * @description Send email
 */
export const sendEmail =  (emailParams: IMailOptions) => {
    defaults(emailParams, mailDefaults)
    // create reusable transporter object using the default SMTP transport
    /*const transportOptions = {
        host: process.env.MAIL_SMTP_HOST,
        port: process.env.MAIL_SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAIL_SMTP_USER,
            pass: process.env.MAIL_SMTP_SECRET,
        },
    } as any*/

    const transporter = nodemailer.createTransport(nodemailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY
    }))

    return new Promise((resolve, reject_) => {
        if (emailParams.template) {
            console.log('in if')
            compiledTemplate({
                data: emailParams.data,
                templateName: emailParams.template,
            })
                .then((html: any) => {
                // send mail with defined transport object
                    console.log(transporter)
                    console.log(emailParams)
                    console.log(html)
                    return send(transporter, emailParams, html)
                })
                .catch((err) => {
                    console.log(err)
                    logger.info(err)
                    reject_(err)
                })

        } else {
            return send (transporter, emailParams, '')
        }
        
    })
}
/**
 * @description Send email
 * @param options 
 */
const send  = (transporterObj: any, emailParams: IMailOptions, html:  string): Promise<boolean> => {
    return new Promise((resolve, reject_) => {
        if (html) {
            emailParams.html = html
        }
        transporterObj.sendMail(emailParams)
            .then(() => {
                resolve(true)
            })
            .catch((err: Error) => {
                logger.info(err)
                reject_(false)
            })
    })
}
/**
 * @description compiled ejs template
 */
const compiledTemplate = (options: Record<string, unknown>) => {
    const { data, templateName} = options
    const viewsFolder = join(__dirname, '../templates')
    const htmlFile = join(viewsFolder, templateName + '.ejs')
    return new Promise((resolve, reject_) => {
        const templateHtml = readFileSync(htmlFile).toString('utf8')
        let compTemplate
        try {
            compTemplate = _.template(templateHtml)
        } catch (ex) {
            reject_(ex)
            return
        }
        const html = compTemplate(data as Record<string, unknown>)
        resolve(html)
    })
}
/**
 * @description Compare string without being case sensitive
 */
export const compareStrings = (str1: string, str2:string): boolean => {
    if (str1.toLowerCase() === str2.toLowerCase())
    {
        return true
    }
    return false
}



export const encrypt = (text: string) => {

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv)

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    }
}

export const decrypt = (hash: any) => {

    if(hash?.iv) {
        const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'))

        const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])

        return decrpyted.toString()        
    } else {
        return false
    }
}
