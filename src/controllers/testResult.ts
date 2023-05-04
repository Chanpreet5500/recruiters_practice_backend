import { Request, Response } from 'express'
import { User, TestResult, Invite } from '@schema'
import moment from 'moment'
import { __ } from 'i18n'
import Stripe from 'stripe'

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || ''), {
    apiVersion: '2020-08-27',
})

class Test {
    
    /**
     * @description Saving test result
     */
    
    public saveTestResult = async (req: Request, res: Response) => {

        const { testId, legibility, proportionality_ratio, pressure, black_pixel_percentage, letter_tilt, line_slope, seperation_between_the_letters, seperation_between_the_words, signature_legibility, signature_position, size, size_regularity, size_variability, speed, text_stability } = req.body

        await new TestResult({
            testId,
            legibility,
            proportionality_ratio,
            pressure,
            black_pixel_percentage,
            letter_tilt,
            line_slope,
            seperation_between_the_letters,
            seperation_between_the_words,
            signature_legibility,
            signature_position,
            size,
            size_regularity,
            size_variability,
            speed,
            text_stability,
            dateCreated: moment().toDate(),
            dateUpdated: moment().toDate(),
            isDeleted: 0,
        }).save()
            .then(() => {
                return res.success({}, 'Result saved Successfully')
            })
            .catch((err) => res.error(err, 'internalServerError'))


    }

    /**
    * @description getting job details by invite
    */

    public getJobDetailsByInvite = async (req: Request, res: Response) => {
        const inviteid = req.params.id
        const inviteDetails = await Invite.findOne({ inviteId: inviteid }).populate({path : 'jobId', populate:[{path : 'parameters' }]}).populate('candidateId').exec()

        const clientId = inviteDetails.jobId['client_id']

        const testIdResult = await TestResult.findOne({ testId: inviteid })
        const clientData = await User.findOne({_id : clientId})

        const inviteFinalData = {
            candidateId : inviteDetails.candidateId,
            jobId: {
                name : inviteDetails.jobId['name'],
                type : inviteDetails.jobId['type'],
                city : inviteDetails.jobId['city'],
                country : inviteDetails.jobId['country'],
                job_id : inviteDetails.jobId['job_id'],
                education : inviteDetails.jobId['education'],
                skills : inviteDetails.jobId['parameters']
            }
        }
        const clientFinalData = {
            first_name : clientData['first_name'],
            last_name : clientData['last_name'],
            email : clientData.email,
            phone : clientData.phone,
            company_name: clientData['company_name'],
            company_number : clientData['company_number'],
            company_phone_number : clientData['company_phone_number'],
            street_address : clientData['street_address'],
            city : clientData.city,
            zip_code : clientData['zip_code'],
            country : clientData.country
        }

        if (inviteDetails) {
            return res.success({ message: __('success.welcome'), name: inviteFinalData, testResult : testIdResult , client : clientFinalData }, 'Detailes fetched successfully')
        }
        else {
            return res.badRequest(req.__('errors.userRoleNotFound'), 'userRoleNotFound')
        }

    }

    /**
    * @description getting test result of the logged in client 
    */

    public getTestResultData = async (req: Request, res: Response) => {
        const clientId = req.params.id
        const allData = await Invite.find({clientId : clientId}).populate('jobId').populate('candidateId').exec();
        (async () => {
            const jobs = []


            for (let i = 0; i < allData.length; i++) {

                const job = {

                    jobId: null,
                    candidateId: null,
                    inviteId: null,
                    testResult: {}
                    
                }

                const testIdResult = await TestResult.find({ testId: allData[i].inviteId })

                if(testIdResult && testIdResult.length){

                    job.jobId = allData[i].jobId
                    job.candidateId = allData[i].candidateId
                    job.inviteId = allData[i].inviteId
                    job.testResult = testIdResult
                    jobs.push(job)

                }
               
            }
            if (jobs) {
                return res.success({ message: __('success.welcome'), data: jobs }, 'Detailes fetched successfully')
            }
            else {
                return res.badRequest(req.__('errors.userRoleNotFound'), 'userRoleNotFound')
            }

        })()

    }

}

export default new Test