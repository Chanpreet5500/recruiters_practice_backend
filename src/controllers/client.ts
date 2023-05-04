import {  IUser, IUserRole, IJob, ITransaction} from 'src/interfaces'
import { Request, Response } from 'express'
import { User, UserRoles, Jobs, Transaction, Invite, TestResult, ReportTemplate, Param } from '@schema'
import moment from 'moment'
import randomize from 'randomatic'
import { isNil } from 'lodash'
import logger from '@utilities/logger'
import commonQuery from '@utilities/commonQueries'
import { __ } from 'i18n'
import puppeteer from 'puppeteer'
import Stripe from 'stripe'
import fs, { link } from 'fs'
import endOfDay from 'date-fns/endOfDay'
import startOfDay from 'date-fns/startOfDay'
import {sendEmail} from '@utilities/functions'
import { Twilio } from 'twilio'
import shortUrl from 'node-url-shortener'
const accountSid = 'AC19e69b6dd861dd3efd19e8d2b7a33d00' // Your Account SID from www.twilio.com/console
const authToken = '72debab841ac9593199bc424f26e75cf' // Your Auth Token from www.twilio.com/console

const clientTwilio = new Twilio(accountSid, authToken)

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || ''), {
    apiVersion: '2020-08-27',
})

/**
 * @category Controllers
 * @classdesc Client controller
 */
class Client {

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
        
        return res.success({message: __('success.welcome'), user: {id: userData?._id, firstname: userData!.firstName, lastname: userData!.lastName, userName: userData!.username, email: userData!.email, phone: userData!.phone, companyName: userData!.company_name, companyNumber: userData!.company_number, streetAddress: userData!.street_address, city: userData!.city, country: userData!.country, zipCode: userData!.zip_code, profession: userData!.profession, education: userData!.education, experience: userData!.experience, ein: userData!.ein, totalTests: userData.total_tests}}, 'welcome')
    };

    /**
    * @description changeStatus
    */
    public changeStatus = async (req: Request, res: Response) => {
        const {candidateId, status} = req.body
        const userData: IUser | null = await User.findOneAndUpdate({_id: candidateId}, {status: status}, {new: true}).exec()
        if(userData)        
            this.getCandidates(req, res)
    };

    public jobChangeStatus = async (req: Request, res: Response) => {
        const {jobId, status} = req.body
        const jobsData: IJob | null = await Jobs.findOneAndUpdate({_id: jobId}, {status: status}, {new: true}).exec()
        
        this.getJobs(req, res)
    };

    /**
    * @description deleteCandidate
    */
    public deleteCandidate = async (req: Request, res: Response) => {
        const {candidateId, status} = req.body
        const userData: IUser | null = await User.findOneAndUpdate({_id: candidateId}, {is_deleted: 1}, {new: true}).exec()
        
        this.getCandidates(req, res)
    };
    /**
    * @description getCandidates
    */
    public getCandidates = async (req: Request, res: Response) => {
        const candidate_client_id = req.params.id
        const roleData = await UserRoles.findOne({role_name: 'candidate'}).exec()
        if(roleData) {
            const userData = await User.find({user_role_id: roleData._id, is_deleted: 0, candidate_client_id}).populate('jobs').exec()
            return res.success({message: __('success.welcome'), candidates: userData}, 'welcome')

        } else {
            return res.badRequest(req.__('errors.userRoleNotFound'), 'userRoleNotFound')
        }
    };

    /**
    * @description getCandidate
    */
    public getCandidate = async (req: Request, res: Response) => {
        const {id} = req.params
        const userData = await User.findOne({_id: id}).exec()

        if(!isNil(userData)) {
            return res.success({message: __('success.welcome'), candidate: userData}, 'welcome')
        } else {
            return res.badRequest(req.__('errors.userNotFound'), 'userNotFound')
        }
    };

    /**
     * @description New Client Creation
     * @param req 
     * @param res 
     * @param  {String} req.body.email email of user
     * @param  {String} req.body.password password of user
     * @param  {String} req.body.username user name
     */
  
    public createCandidate  = async (req: Request, res: Response) => {
        const token = randomize('A1', 32)
        const roleType = 'candidate'
        const {first_name, last_name, email, phone_number, profession, education, experience, street_address, city, zip_code, country, candidate_client_id} = req.body
        const password = this.generatePassword()
        const roleData: IUserRole | null = await UserRoles.findOne({role_name: roleType}).exec()
        if (isNil(roleData)) { return res.badRequest(req.__('errors.userRoleNotFound'), 'userRoleNotFound') }
        return new User({
            userRoleId: roleData._id,
            candidate_client_id,
            firstName: first_name || '',
            lastName: last_name || '',
            email,
            phone: phone_number,
            profession,
            education,
            experience,
            city,
            street_address,
            zip_code,
            country,
            status: 1,
            dateCreated: moment().toDate(),
            dateUpdated: moment().toDate(),
            isDeleted: 0,
        }).save()
            .then((user: IUser) => {               
                return res.success({}, 'clientCreatedSuccessfully')
            })
            .catch((err) => {
                return res.error(err, 'internalServerError')
            })
        
    };
    
    /**
     * @description  Client updation
     * @param req 
     * @param res 
     * @param  {String} req.body.id id of candidate
     */
    public updateCandidate  = async (req: Request, res: Response) => {
        const {id} = req.body
        const userData: IUser | null = await User.findOneAndUpdate({_id: id}, req.body, {new: true}).exec()        
        this.getCandidates(req, res)        
        
    };

    //new route getting all jobs
    public getAllJobs = async (req: Request, res:Response) => {
        const getAllJobs = await Jobs.find({is_deleted: 0}).exec()
   
        if(getAllJobs){   
            return res.success({Jobs: getAllJobs}, 'successGettingJobs')
        } else {   
            return res.badRequest('jobsNotFound')
        }
   
    }

    /**
    * @description getJobs
    */
    public getJobs = async (req: Request, res: Response) => {
        const client_id = req.params.id
        const condition = client_id ? {client_id, is_deleted: 0} : {is_deleted: 0}
        const roleData = await UserRoles.findOne({role_name: 'candidate'}).exec()
        if(roleData) {
            const jobsData = await Jobs.find(condition).exec()
            return res.success({message: __('success.welcome'), jobs: jobsData}, 'welcome')

        } else {
            return res.badRequest(req.__('errors.userRoleNotFound'), 'userRoleNotFound')
        }
    };

    /**
     * @description New Jobs Creation
     * @param req 
     * @param res 
     * @param  {String} req.body.email email of user
     * @param  {String} req.body.password password of user
     * @param  {String} req.body.username user name
     */
    public createJob  = async (req: Request, res: Response) => {
        return new Jobs({
            ...req.body,
            dateCreated: moment().toDate(),
            dateUpdated: moment().toDate(),
            isDeleted: 0,
        }).save()
            .then((job: IJob) => {
                return res.success({message: __('success.savedSuccessfully')}, 'savedSuccessfully')
            })
            .catch((err) => {
                return res.error(err, 'internalServerError')
            })
        
    };

    /**
     * @description  Update Job
     * @param req 
     * @param res 
     * @param  {String} req.body.id id of candidate
     */
    public updateJob  = async (req: Request, res: Response) => {
        const {id} = req.body
        const jobData: IJob | null = await Jobs.findOneAndUpdate({_id: id}, req.body, {new: true}).exec()        
        this.getJobs(req, res)        
        
    };



    /**
    * @description getJob
    */
    public getJob = async (req: Request, res: Response) => {
        const {id} = req.params
        const jobData = await Jobs.findOne({_id: id}).exec()
        if(!isNil(jobData)) {
            return res.success({message: __('success.welcome'), job: jobData}, 'welcome')
        } else {
            return res.badRequest(req.__('errors.userNotFound'), 'userNotFound')
        }
    };

    /**
    * @description deleteJob
    */
    public deleteJob = async (req: Request, res: Response) => {
        const {jobId} = req.body
        const jobData: IJob | null = await Jobs.findOneAndUpdate({_id: jobId}, {is_deleted: 1}, {new: true}).exec()
        
        this.getJobs(req, res)
    };

    /**
    * @description getCandidatesWithoutJob
    */
    public getCandidatesWithoutJob = async (req: Request, res: Response) => {
        //clientid and job id
        const {clientId, id} = req.body
        const roleData = await UserRoles.findOne({role_name: 'candidate'}).exec()
        if(roleData) {
            const userData = await User.find({user_role_id: roleData._id, is_deleted: 0, candidate_client_id: clientId}).exec()

            const responseData = userData.filter(e => (e.jobs.length == 0 || e.jobs.indexOf(id) == -1))// 

            return res.success({message: __('success.welcome'), candidates: responseData}, 'welcome')

        } else {
            return res.badRequest(req.__('errors.userRoleNotFound'), 'userRoleNotFound')
        }
    };

    public getCandidatesWithJob = async (req: Request, res: Response) => {
        //clientid and job id
        const {clientId, jobId} = req.body
        const roleData = await UserRoles.findOne({role_name: 'candidate'}).exec()
        if(roleData) {
            const userData = await User.find({user_role_id: roleData._id, is_deleted: 0, candidate_client_id: clientId}).exec()

            const responseData = userData.filter(e => ( e.jobs.indexOf(jobId) > -1))// 

            return res.success({message: __('success.welcome'), candidates: responseData}, 'welcome')

        } else {
            return res.badRequest(req.__('errors.userRoleNotFound'), 'userRoleNotFound')
        }
    };

    /**
    * @description sendInvite
    */
    public sendInvite = async (req: Request, res: Response) => {
        const {jobId, candidates, clientId, inviteText, invitedBy, inviteId} = req.body

        const client = await User.findOne({_id : clientId}).exec()
        
        ;(async() => {
            for (let i = 0; i < candidates.length; i++) {
                const candidate = candidates[i]
                if(!invitedBy) {
                    const userData: IUser | null = await User.findOneAndUpdate({_id: clientId}, {total_tests: client.total_tests - 1}, {new: true}).exec()
                }
                const candidateData = await User.findOne({_id : candidate._id}).exec()
                if(candidate) {
                    candidateData.jobs.push(jobId)
                    candidateData.save()            
                }


                const job = await Jobs.findOne({_id : jobId}).exec()
                if(job) {
                    job.candidates.push(candidate._id)
                    job.save()            
                }

                // to save jobId,  candidateId and inviteId in invite table
                const inviteCandidateById = Math.random().toString(36).slice(2)

                const invite = await Invite.create({candidateId: candidate._id, inviteId: inviteCandidateById, jobId : jobId, clientId : clientId })

                // const testLink = `https://recruiters.page.link/?link=https://recruiters.page.link/invite&testID=${inviteCandidateById}&apn=com.recruiters.candidate&ofl=https://recruitersai.com`
                const testLink = `https://recruiters.page.link/?link=https://recruiters.page.link/YMdR/?testID=${inviteCandidateById}&apn=com.recruiters.candidate&ofl=https://recruitersai.com`

                console.log(testLink, 'TEST LINK +_--------------')

                // shortUrl.short(testLink, function (err, url) {

                // console.log(err)
                
                const mailOptions = {
                    to: candidate.email,
                    subject: req.__('emails.sendInvite'),
                    template: 'send-invite',
                    data: {
                        name: candidate.first_name + ' ' + candidate.last_name,
                        link: testLink,
                        jobName: job.name,
                        jobId: job.job_id,
                        extraText: inviteText,
                        inviteId : inviteCandidateById
                    },
                }
                sendEmail(mailOptions)
                    .catch((err) => {
                        logger.info(err)
                    })
                
                const message = `Please click on link ${link} and read carefully the instructions to take the test.`

                // console.log(url, '=> url +_---------------------')

                console.log(message.toString())
                
                clientTwilio.messages
                    .create({
                        body: message.toString(),
                        to: candidate.phone ? '+' + candidate.phone.replace(' ', '').replace('(', '').replace(')', '') : '+919168117671', // Text this number
                        from: '+14245872760', // From a valid Twilio number
                    })
                    .then((message) => {
                        console.log(message.sid, 'message')
                    }).catch(e => { console.error('Got an error:', e.code, e.message) })
                // })
            }
            return res.success({message: __('success.candidateInvited'), user: {id: client._id, username: client.username, email: client.email, firstname: client.firstName, lastname: client.lastName, totalTests: client?.total_tests}}, 'candidateInvited')
        })()        
    };

    /**
    * @description getStripeProducts
    */
    public getStripeProducts = async (req: Request, res: Response) => {

        const products = await stripe.prices.list({
            limit: 20,
            expand: ['data.product']
        })

        return res.success({message: __('success.stripeProducts'), products: products?.data}, 'stripeProducts')

    };

    /**
    * @description getProductPrices
    */
    public getProductPrices = async (req: Request, res: Response) => {
        const {id} = req.params
        const prices = await stripe.prices.list({
            limit: 3,
            product: id,
            expand: ['data.tiers']
        })

        return res.success({message: __('success.stripeProducts'), prices: prices?.data}, 'stripeProducts')
    };

    public retrieveQuantityInOneProduct = (priceStr: string) => {
        if(priceStr) {
            const nameArr = priceStr.split(' ')
            return parseInt(nameArr[0])
        } else {
            return 0
        }
    }


    public createSession = async (req: Request, res: Response) => {
        const {lineItems, userId} = req.body
        const finalLineItems: Array<any> = []
        let totalTests = 0
        let totalAmount = 0
        lineItems.forEach((el) => {
            if(el.qty) {
                finalLineItems.push({price : el.id, quantity: el.qty})
                const qtyInProduct = this.retrieveQuantityInOneProduct(el.product.name)
                totalTests += (qtyInProduct * el.qty)
                totalAmount += ((el.unit_amount / 100) * el.qty)
            }
        })
        const session = await stripe.checkout.sessions.create({
            line_items: finalLineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_APP_URL}/checkout/failure?session_id={CHECKOUT_SESSION_ID}`,
        })
        const newTransaction = new Transaction({
            'total_amount': totalAmount,
            'session_id': session.id,
            'user_id' : userId,
            'status' : 'pending',
            'tests_purchased' : totalTests,
            dateCreated: moment().toDate(),
            dateUpdated: moment().toDate(),
            isDeleted: 0,
        })
        const saveTransaction = await newTransaction.save()
       
        return res.success({message: __('success.stripeCheckoutUrl'), redirectUrl: session.url}, 'stripeCheckoutUrl')
    }

    public retrievePaymentIntent = async(id: string) => {
        const paymentIntent: Stripe.PaymentIntent = await stripe.paymentIntents.retrieve(id)
        return paymentIntent
    }

    public getDashboardData = async(req: Request, res: Response) => {
        const {clientId, startDate, endDate} = req.body

        // get number of jobs added by client
        const jobsCondition = {
            is_deleted: 0,
            '$expr' : { $eq: [ '$client_id' , { $toObjectId: clientId } ] },
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
            '$expr' : { $eq: [ '$client_id' , { $toObjectId: clientId } ] },// $toObjectId used to convert string id into normal id
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

        // get test purchased

        const testPurchasedCondition = {
            is_deleted: 0,
            date_created: {
                $gte: startOfDay(new Date(startDate)),
                $lte: endOfDay(new Date(endDate))
            }
        }
        const testPurchasedGroup = {
            _id :'$user_id',
            totalTestPurchased: {$sum: '$tests_purchased'},
        }

        const testPurchasedPromise = await commonQuery.aggregateSum(Transaction, testPurchasedGroup, testPurchasedCondition)

        const[jobs, candidatesPerJob, testPurchased] = await Promise.all([jobsPromise, candidatesPerJobPromise, testPurchasedPromise])
        return res.success({message: __('success.dashboardData'), dashboardData : {jobs, candidatesPerJob, testPurchased}}, 'dashboardDataSuccess')

    }

    public getSessionDetails = async (req: Request, res: Response) => {
        const sessionId = req.params.sessionId

        const session = await stripe.checkout.sessions.retrieve(sessionId)
        const paymentIntentId  = session.payment_intent

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const payment = await this.retrievePaymentIntent(paymentIntentId)
        
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const transactionData: ITransaction | null = await Transaction.findOneAndUpdate({session_id: sessionId}, {status: payment.status, total_amount: payment.amount}, {new: true}).exec()
        const clientData: IUser | null = await User.findOne({_id: transactionData.user_id}).exec()


        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const userData: IUser | null = await User.findOneAndUpdate({_id: transactionData.user_id}, {total_tests: parseInt(clientData.total_tests + transactionData.tests_purchased)}, {new: true}).exec()
        

        // send email 
        if(userData){
            const mailOptions = {
                to: clientData.email,
                subject: req.__('emails.testPurchasedSubject'),
                template: 'send-mail',
                data: {
                    name: clientData.firstName + ' ' + clientData.lastName,
                    tests_purchased: transactionData.tests_purchased,
                    total_amount: transactionData.total_amount,
                    total_tests: clientData.total_tests,
                    company_name:clientData.company_name,
                    link: 'dummy link',
                },
            }
            sendEmail(mailOptions)
                .catch((err) => {
                    logger.info(err)
                })
        }

        return res.success({message: __('success.paymentSuccess'), user : {id: userData._id, email: userData!.email, firstname: userData!.firstName, lastname: userData!.lastName, totalTests: userData.total_tests}}, 'paymentSuccess')
    }

    // get totaltransaction through client
   public perTransactionOfClient = async(req: Request, res: Response) =>{
       const {user_id, startDate, endDate} = req.body

       const transCondition = {
           is_deleted: 0,
           date_created: {
               $gte: startOfDay(new Date(startDate)),
               $lte: endOfDay(new Date())
           }
       }
       const transGroup = {
           _id: '$user_id', 
           totalTansac: {$sum: '$total_amount'}, 
           count : { $sum : 1 }
       }

       const transacPromise = await commonQuery.aggregateSum(Transaction,transGroup,transCondition)
       return res.success({message:__('success'), trans : {transacPromise}})
   }
   
  // get totaltransaction amount by date 
  public allTransactions = async(req: Request, res: Response)=>{
      const {startDate, endDate} = req.body

      const allTransCondition = {
          is_deleted: 0,
          date_created: {
              $gte: startOfDay(new Date(startDate)),
              $lte: endOfDay(new Date(endDate))
          }
      }
      const allTransGroup = {
          _id: { $dateToString : { format: '%Y-%m-%d', date: '$date_created'} }, 
          totalTansac: {$sum: '$total_amount'}
      }
      const allTransacPromise = await commonQuery.aggregateSum(Transaction,allTransGroup,allTransCondition)
      return res.success({message:__('success'),allTrans : {allTransacPromise}})
  } 
    public getTransactionsPerDay = async (req:Request, res:Response) => {
        const {user_id, startDate, endDate} = req.body

        
        const transactionCondition = {
            is_deleted: 0,
            
            date_created: {
                $gte: startOfDay(new Date(startDate)),
                $lte: endOfDay(new Date())
            },

        }
        const transaction_group = {
            _id: '$user_id', 
            totalTran: { $sum: '$total_amount' },
            count: { $sum : 1 } 

        }

        const transactionPromise = await commonQuery.aggregateSum(Transaction, transaction_group, transactionCondition)

        const [ transaction ] = await Promise.all([ transactionPromise ]) 
        return res.success({message:__('success getting total amount'), data: {transaction}})
    }

    public getAllTransaction = async (req: Request , res: Response) => {
        const {client_id,startDate,endDate} = req.body

        const transactionCondition = {
            is_deleted: 0,

            date_created: {
                $gte: startOfDay(new Date(startDate)),
                $lte: endOfDay(new Date(endDate))
            },
        }

        const transaction_group = {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date_created' } },
            totalTran: { $sum: '$total_amount' },
        }

        const allTransactionPromise = await commonQuery.aggregateSum(Transaction, transaction_group, transactionCondition)

        const [ transactions ] = await Promise.all([ allTransactionPromise ])
        return res.success({mesage:__(`success getting all transaction between ${startDate} and ${endDate}`), data: { transactions } } )
    }
    public updateUser  = async (req: Request, res: Response) => {
        const {email} = req.body
        const userData: IUser | null = await User.findOneAndUpdate({email: email}, req.body, {new: true}).exec()        
        return res.success({message: __('success.profileUpdatedSuccessfully'), user: {email: userData!.email, firstname: userData!.firstName, lastname: userData!.lastName, street_address: userData!.street_address, userName: userData!.username, phone: userData!.phone, companyName: userData!.company_name, companyNumber: userData!.company_number, city: userData!.city, country: userData!.country, zipCode: userData!.zip_code, profession: userData!.profession, education: userData!.education, ein: userData!.ein, totalTests : userData.total_tests}}, 'profileUpdatedSuccessfully')
    };

    public importCandidates = async (req: Request, res: Response) => {
        const {candidates} = req.body
        const roleType = 'candidate'
        const roleData: IUserRole | null = await UserRoles.findOne({role_name: roleType}).exec()
        candidates.map((obj, idx) => {
            obj.user_role_id = roleData._id
            obj.status = 1
            obj.dateCreated = moment().toDate()
            obj.dateUpdated = moment().toDate()
            obj.isDeleted = 0
        })
        const importedPromise = await commonQuery.InsertManyIntoCollection(User, candidates)
        this.getCandidates(req, res)   
    }

    public getAllTransactions = async (req: Request, res: Response) => {
        const client_id = req.params.id
        if(client_id) {
            const condition = {user_id: client_id}
            const transactionsData = await commonQuery.findData(Transaction, condition)
            return res.success({message: __('success.welcome'), transactions: transactionsData.data}, 'welcome')

        } else {
            return res.badRequest(req.__('errors.transactionNotFound'), 'transactionNotFound')
        }
    };
    public deactivateAccount = async (req: Request, res: Response) => {
        const client_id = req.params.id
        if(client_id) {
            const userData: IUser | null = await User.findOneAndUpdate({_id: client_id}, {status: 0}, {new: true}).exec()
            return res.success({message: __('success.accountDeactivated')}, 'accountDeactivated')

        } else {
            return res.badRequest(req.__('errors.transactionNotFound'), 'transactionNotFound')
        }
    };

    public generatingPdf = async (req: Request, res: Response) => {
        const id = req.params.id
        const lang = req.params.lang
        const dataInviteId = await TestResult.findOne({inviteId:id}).exec()
        const template = await ReportTemplate.findOne({report_name : 'Stack Overflow'}).exec()
        const reportData = template.report_data
        const html = fs.readFileSync('./test/test.html', 'utf8')
        const options = { format: 'A4' }
        if(id) {           
            this.printPDF(id, lang).then(pdf => {
                res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
                res.send(pdf)
            })
        } else {
            return res.badRequest(req.__('errors.userRoleNotFound'), 'userRoleNotFound')
        }
       
    }


    public printPDF = async(id, lang) => {
        const browser = await puppeteer.launch({ headless: true })

        const page = await browser.newPage()

        const url = process.env.CLIENT_APP_URL + '/generate-pdf/'+id +'/'+lang

        await page.goto(url, {waitUntil: 'networkidle0'})
        const pdf = await page.pdf({ format: 'A4', printBackground: true })
       
        await browser.close()           
        return pdf
    }   

    
    public getJobsSkills = async(req : Request, res : Response) => {
    
        const data = await Param.find().exec()
        // const leggedIn = await Candidates.find().exec()

        if(data){

            return res.success({message: __('success.welcome'), skills: data})

        } else {
            return res.badRequest(req.__('errors.userRoleNotFound'), 'userRoleNotFound')
        }
        
    }
}

export default new Client()
