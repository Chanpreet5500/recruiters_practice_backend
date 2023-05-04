import {  IUser, IUserRole, IReportTemplate, IParams} from 'src/interfaces'
import { Request, Response } from 'express'
import { User, UserRoles, ReportTemplate, Jobs, Param, TestResult } from '@schema'
import bcrypt from 'bcryptjs'
import moment from 'moment'
import randomize from 'randomatic'
import { isNil } from 'lodash'
import logger from '@utilities/logger'
import commonQuery from '@utilities/commonQueries'
import { __ } from 'i18n'
import i18n from 'i18n'
import endOfDay from 'date-fns/endOfDay'
import startOfDay from 'date-fns/startOfDay'

import { sendEmail, encrypt, decrypt } from '@utilities/functions'
/**
 * @category Controllers
 * @classdesc Admin controller
 */
class Admin {


    private  generatePassword = () =>  {
        const length = 8,
            charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$^&*()'
        let retVal = ''
        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n))
        }
        return retVal
    }

    /**
    * @description getProfile
    */
    public getProfile = async (req: Request, res: Response) => {
        const {email} = req.body
        const userData: IUser | null = await User.findOne({email: email}).exec()
        return res.success({message: __('success.welcome'), user: {email: userData!.email, firstname: userData!.firstName, lastname: userData!.lastName, street_address: userData!.street_address}}, 'welcome')
    };

    /**
    * @description changeStatus
    */
    public changeStatus = async (req: Request, res: Response) => {
        const {clientId, status} = req.body
        const userData: IUser | null = await User.findOneAndUpdate({_id: clientId}, {status: status}, {new: true}).exec()
        if(userData)
        
            this.getClients(req, res)
    };

    public paramChangeStatus = async (req: Request, res: Response) => {
        const {paramId, status} = req.body
        const paramsData: IParams | null = await Param.findOneAndUpdate({_id: paramId}, {status: status}, {new: true}).exec()
        if(paramsData)

            this.getParams(req, res)
    };

    /**
    * @description deleteClient
    */
    public deleteClient = async (req: Request, res: Response) => {
        const {clientId, status} = req.body
        const userData: IUser | null = await User.findOneAndUpdate({_id: clientId}, {is_deleted: 1}, {new: true}).exec()
        
        this.getClients(req, res)
    };

    /**
    * @description deleteTemplate
    */
    public deleteTemplate = async (req: Request, res: Response) => {
        const {templateId, status} = req.body
        const templatesData: IReportTemplate | null = await ReportTemplate.findOneAndUpdate({_id: templateId}, {is_deleted: 1}, {new: true}).exec()
        
        this.getTemplates(req, res)
    };


    /**
    * @description getClients
    */
    public getClients = async (req: Request, res: Response) => {
        const roleData = await UserRoles.findOne({role_name: 'client'}).exec()
        if(roleData) {
            const userData = await User.find({user_role_id: roleData._id, is_deleted: 0}).sort('-date_created').exec()
            return res.success({message: __('success.welcome'), clients: userData}, 'welcome')

        } else {
            return res.badRequest(req.__('errors.userRoleNotFound'), 'userRoleNotFound')
        }
    };

    /**
    * @description getTemplates
    */
    public getTemplates = async (req: Request, res: Response) => {
        const templatesData = await ReportTemplate.find({is_deleted: 0}).sort('-date_created').exec()
        return res.success({message: __('success.welcome'), templates: templatesData}, 'welcome')
    };

    /**
    * @description getCandidates
    */
    public getCandidates = async (req: Request, res: Response) => {
        const roleData = await UserRoles.findOne({role_name: 'candidate'}).exec()
        if(roleData) {

            const userData = await User.aggregate([ {
                $lookup: {
                    from: 'users', // collection to join
                    localField: 'candidate_client_id',//field from the input documents
                    foreignField: '_id',//field from the documents of the 'from' collection
                    as: 'client'// output array field
                }},
            { $match : {user_role_id: roleData._id, is_deleted: 0} },
            ]).exec()


            return res.success({message: __('success.welcome'), candidates: userData}, 'welcome')

        } else {
            return res.badRequest(req.__('errors.userRoleNotFound'), 'userRoleNotFound')
        }
    };

    /**
    * @description getClient
    */
    public getClient = async (req: Request, res: Response) => {
        const {id} = req.params
        const userData = await User.findOne({_id: id}).exec()
        if(!isNil(userData)) {
            return res.success({message: __('success.welcome'), client: userData}, 'welcome')
        } else {
            return res.badRequest(req.__('errors.userNotFound'), 'userNotFound')
        }
    };

    /**
    * @description sendCredentials
    */
    public sendCredentials = async (req: Request, res: Response) => {
        const {id} = req.params
        const userData: IUser | null = await User.findOne({_id: id}).exec()
        if(!isNil(userData)) {
            const mailOptions = {
                to: userData.email,
                subject: req.__('emails.sendCredentialsSubject'),
                template: 'send-credentials',
                data: {
                    name: userData.firstName || '',
                    email: userData.email || '',
                    password: decrypt(userData.passObj) || '',
                    link: process.env.CLIENT_APP_URL + '/login/'
                },
            }
            sendEmail(mailOptions)
                .catch((err) => { 
                    logger.info(err)
                })
            return res.success({message:res. __('credentialsEmailSent', '1')}, 'credentialsEmailSent')
        } else {
            return res.badRequest(req.__('errors.userNotFound'), 'userNotFound')
        }
    };

    /**
     * @description New Client Creation
     * @param req 
     * @param res 
     */
    public createClient  = async (req: Request, res: Response) => {
        const token = randomize('A1', 32)
        const activationLink = process.env.CLIENT_APP_URL + '/verify-sign-up/' + token
        const roleType = 'client'
        const {first_name, ein, last_name, email, phone, company_name, company_number, company_phone_number, street_address, city, zip_code, country, preferredLanguage} = req.body

        console.log(country,preferredLanguage, ' => _______--------COUNTRY')

        let {password} = req.body
        const defaultLanguage = 'en'
        if(!password) {
            password = this.generatePassword()
        }
        const passObj = encrypt(password)
        const roleData: IUserRole | null = await UserRoles.findOne({role_name: roleType}).exec()

        if (isNil(roleData)) { return res.badRequest(req.__('errors.userRoleNotFound'), 'userRoleNotFound') }
        
        try{
            return new User({
                userRoleId: roleData._id,
                firstName: first_name || '',
                lastName: last_name || '',
                email,
                phone,
                company_name,
                company_number,
                company_phone_number,
                city,
                ein,
                street_address,
                zip_code,
                country: country?.value,
                password: bcrypt.hashSync(password),
                passObj,
                status: 0,
                verificationToken: token,
                dateCreated: moment().toDate(),
                dateUpdated: moment().toDate(),
                isDeleted: 0,
                preferredLanguage : preferredLanguage || defaultLanguage
            }).save()
                .then((user: IUser) => {
                    i18n.setLocale(preferredLanguage || defaultLanguage)
                    const mailOptions = {
                        to: email,
                        subject: (preferredLanguage || defaultLanguage == 'en') ? req.__('emails.welcomeEmailSubjecten') : req.__('emails.welcomeEmailSubjectes'),
                        template: 'sign-up',
                        data: {
                            name: first_name,
                            link: activationLink,
                            preferredLanguage : defaultLanguage
                        },
                    }
                    console.log(mailOptions, '===>> MAIL----OPTIONS')
                    sendEmail(mailOptions)
                        .catch((err) => {
                            logger.info(err)
                        })
                
                    return res.success({}, 'clientCreatedSuccessfully')
                })
                .catch((err) => {
                    return res.error(err, 'internalServerError')
                })
        } catch(err) {
            return res.error(err, 'internalServerError')
        }
        
    };
    //creating params
    

    
    // getting All params 
    public getAllParams = async (req: Request, res:Response) => {
        const getAllParam = await Param.find().exec()
        if(getAllParam){

            return res.success({param: getAllParam}, 'successGettingParamsWithId')
        }else{

            return res.badRequest('paramsNotFound')
        }

    }

    // update param
    public updateParam = async (req: Request, res: Response) => {
        try{
            const { id } = req.params               
            const updateParam = await Param.findOneAndUpdate({_id: id}, req.body, {new: true}).exec()
            return res.success({message: 'paramUpdatedSuccessfully'},req.body)
        } catch(err) {
            console.log(err)
        }
    }

    /**
     * @description  Client updation
     * @param req 
     * @param res 
     */
    public updateClient  = async (req: Request, res: Response) => {
        const {id} = req.body
        const userData: IUser | null = await User.findOneAndUpdate({_id: id}, req.body, {new: true}).exec()        
        this.getClients(req, res)        
        
    };

    /**
     * @description  Template updation
     * @param req 
     * @param res 
     */
    public updateTemplate  = async (req: Request, res: Response) => {
        const {id} = req.body
        const templatesData: IReportTemplate | null = await ReportTemplate.findOneAndUpdate({_id: id}, req.body, {new: true}).exec()        
        this.getTemplates(req, res)        
        
    };

    public updateUser  = async (req: Request, res: Response) => {
        const {email} = req.body
        const userData: IUser | null = await User.findOneAndUpdate({email: email}, req.body, {new: true}).exec()        
        return res.success({message: __('success.profileUpdatedSuccessfully'), user: {email: userData!.email, firstname: userData!.firstName, lastname: userData!.lastName, street_address: userData!.street_address}}, 'profileUpdatedSuccessfully')
    };


    /**
     * @description New Template Creation
     * @param req 
     * @param res 
     */
    public createTemplate  = async (req: Request, res: Response) => {
        const {report_name, report_data} = req.body
        return new ReportTemplate({
            report_data,
            report_name,
            dateCreated: moment().toDate(),
            dateUpdated: moment().toDate(),
            isDeleted: 0,
        }).save().then((template: IReportTemplate) => {
            return res.success({}, 'templateCreatedSuccessfully')
        }).catch((err) => {
            return res.error(err, 'internalServerError')
        })
    }

    /**
    * @description getTemplate
    */
    public getTemplate = async (req: Request, res: Response) => {
        const {id} = req.params
        const templatesData = await ReportTemplate.findOne({_id: id}).exec()
        if(!isNil(templatesData)) {
            return res.success({message: __('success.welcome'), template: templatesData}, 'welcome')
        } else {
            return res.badRequest(req.__('errors.templateNotFound'), 'templateNotFound')
        }
    };

public createParams = async (req: Request, res: Response) =>{

    const {name, description} = req.body['enData']
    const { esName, esDescription } = req.body['esData']
 
    const parameters = await Param.insertMany(
        [{
            name: name,
            description:description,
            user_id: req.body.user_id,
            dateCreated: moment().toDate(),
            dateUpdated: moment().toDate(),
            isDeleted: 0,
            language:'en',
            status:1 
        },
        {   name: esName,
            description: esDescription,
            user_id: req.body.user_id,
            dateCreated: moment().toDate(),
            dateUpdated: moment().toDate(),
            isDeleted: 0,
            language:'es',
            status:1
        }
        ])

    this.getActiveParams(req, res)
}

public getDashboardData = async(req: Request, res: Response) => {
    const {clientId, startDate, endDate} = req.body

    // get number of clients
    const roleType = 'client'
    const roleData: IUserRole | null = await UserRoles.findOne({role_name: roleType}).exec()
    const clientCondition = {
        is_deleted: 0,
        '$expr' : { $eq: [ '$user_role_id' , { $toObjectId: roleData._id } ] },
        date_created: {
            $gte: startOfDay(new Date(startDate)),
            $lte: endOfDay(new Date(endDate))
        }
    }
    const clientsGroup = {
        _id : { $dateToString: { format: '%m-%d-%Y', date: '$date_created'} },
        count : {$sum : 1}
    }

    const clientsPromise = await commonQuery.aggregateSum(User, clientsGroup, clientCondition)

    // get number of jobs added by client
    const jobsCondition = {
        is_deleted: 0,
        date_created: {
            $gte: startOfDay(new Date(startDate)),
            $lte: endOfDay(new Date(endDate))
        }
    }
    const jobsGroup = {
        _id : { $dateToString: { format: '%m-%d-%Y', date: '$date_created'} },
        count : {$sum : 1}
    }

    const jobsPromise = await commonQuery.aggregateSum(Jobs, jobsGroup, jobsCondition)

    // get number of candidates invited per job 
    const candidatesPerJobCondition = {
        is_deleted: 0,
        date_created: {
            $gte: startOfDay(new Date(startDate)),
            $lte: endOfDay(new Date(endDate))
        }
    }
    const jobsProject = {
        name: 1,
        candidates: {$size: '$candidates'}
    }

    const candidatesPerJobPromise = await commonQuery.aggregateProject(Jobs, jobsProject, candidatesPerJobCondition)

    const[clients, jobs, candidatesPerJob] = await Promise.all([clientsPromise, jobsPromise, candidatesPerJobPromise])

    return res.success({message: __('success.dashboardData'), dashboardData : {clients, jobs, candidatesPerJob}}, 'dashboardDataSuccess')

}

public deleteParam = async (req: Request, res: Response) =>{
    const {paramId} = req.body

    const paramsData: IParams | null = await Param.findOneAndUpdate({_id: paramId}, {is_deleted: 1}, {new: true}).exec()
    this.getParams(req, res)
} 

public updateParams = async(req: Request, res: Response) =>{
    const {id} = req.body
    const paramData = await Param.findOneAndUpdate({_id: id}, req.body,{new: true}).exec()
    
    if(isNil(paramData)){
        return res.badRequest(req.__('errors.credentialsMisMatch'), 'credentialsMisMatch')
    }
    else{
        return res.success({message: __('success.paramsUpdatedSuccessfully')},req.body)
    } 
}

public getParams = async (req: Request, res: Response) => {
    const allParams = await Param.find({is_deleted: 0}).exec()
    if(!isNil(allParams)) {
        return res.success({message: __('success.welcome'), parameters: allParams}, 'welcome')
    } else {
        return res.badRequest(req.__('errors.paramNotFound'), 'paramNotFound')
    }
}

public getActiveParams = async (req: Request, res: Response) => {
    const allParams = await Param.find({is_deleted: 0, status: 1}).exec()
    if(!isNil(allParams)) {
        return res.success({message: __('success.welcome'), parameters: allParams}, 'welcome')
    } else {
        return res.badRequest(req.__('errors.paramNotFound'), 'paramNotFound')
    }
}

public manageParams = async(req:Request, res:Response) =>{
    const {id} = req.params
    const paramData = await Param.findOne({_id: id}, req.body,{new: true}).exec()
    
    if(isNil(paramData)){
        return res.badRequest(req.__('errors.credentialsMisMatch'), 'credentialsMisMatch')
    }
    else{
        return res.success({message: __('success.paramsUpdatedSuccessfully')})
    } 
}
 public getParamById = async(req: Request, res: Response) =>{

     const {id} = req.params
     const paramData = await Param.findOne({_id: id}).exec()
    
     if(isNil(paramData)){
         return res.badRequest(req.__('errors.credentialsMisMatch'), 'credentialsMisMatch')
     }
     else{
         return res.success({message: __('success.paramsUpdatedSuccessfully'), params: paramData})
     } 
 }

 public submitContact = async(req: Request, res: Response) =>{

     const {name, email, subject, message, mobile } = req.body
     const mailOptions = {
         to: process.env.MAIL_FROM,
         subject: req.__('emails.newContactRequest'),
         template: 'submit-contact',
         data: {
             name,
             email,
             subject,
             message,
             mobile
         },
     }
     sendEmail(mailOptions)
         .catch((err) => {
             logger.info(err)
         })
   
     return res.success({message : 'Submitted successfully!'}, 'submittedSuccessfully')
 }
 public getReportTemplate = async (req: Request, res: Response) => {
     const local = await TestResult.find().exec()
     const template = await ReportTemplate.findOne({report_name : 'Stack Overflow'}).exec()
     if(!isNil(template)) {
         return res.success({message: __('success.welcome'), fetchedTemplate: template, pdfInviteId : local}, 'welcome')
     } else {
         return res.badRequest(req.__('errors.paramNotFound'), 'paramNotFound')
     }
 }   
 

}

export default new Admin()
