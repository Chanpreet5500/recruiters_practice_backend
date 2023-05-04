import { CandidateController, AdminController, TestResultController } from  '../controllers'
import { registerValidation, ImportEmailValidation } from '../validations'

import passport from 'passport'
import express = require('express')
import { TestResult } from 'src/models'
const router = express.Router()
/* auth routes listing. */
router.post('/profile', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.getProfile)
router.put('/update-my-profile', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.updateUser)
router.post('/create-candidate', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.createCandidate)
router.put('/update-candidate', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.updateCandidate)
router.get('/get-candidates/:id', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.getCandidates)
router.get('/get-candidate/:id', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.getCandidate)
router.post('/change-status/:id', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.changeStatus)
router.post('/change-job-status/:id?', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.jobChangeStatus)

router.post('/delete-candidate/:id', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.deleteCandidate)
  
// JOBS ROUTES
router.get('/get-jobs/:id', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.getJobs)
router.get('/get-all-jobs',passport.authenticate('jwt',{session:false, failWithError:true}),CandidateController.getAllJobs)

router.get('/get-job/:id', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.getJob)
router.post('/get-candidates-without-job', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.getCandidatesWithoutJob)
router.post('/get-candidates-with-job', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.getCandidatesWithJob)
router.post('/create-job', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.createJob)
router.post('/update-job', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.updateJob)
router.post('/delete-job', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.deleteJob)
router.post('/send-invite', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.sendInvite)
router.post('/get-products', CandidateController.getStripeProducts)
router.get('/get-prices/:id', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.getProductPrices)
router.post('/create-session', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.createSession)
router.get('/save-transaction-details/:sessionId', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.getSessionDetails)
router.post('/get-dashboard-data', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.getDashboardData)

// Transaction routes
router.post('/get-transaction', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.getTransactionsPerDay)
router.post('/get-all-transaction', passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.getAllTransaction)
router.get('/get-all-transactions/:id', passport.authenticate('jwt', { session: false, failWithError: true}), CandidateController.getAllTransactions)
router.get('/deactivate-account/:id', passport.authenticate('jwt', { session: false, failWithError: true}), CandidateController.deactivateAccount)
//candidate
router.post('/import-candidates', ImportEmailValidation, passport.authenticate('jwt', {session: false, failWithError: true}), CandidateController.importCandidates)

// Transaction Routes
router.post('/get-trans',passport.authenticate('jwt', { session: false, failWithError: true }), CandidateController.perTransactionOfClient)
router.post('/get-all-trans',passport.authenticate('jwt', { session: false, failWithError: true}), CandidateController.allTransactions)
router.get('/download-pdf/:id/:lang',passport.authenticate('jwt', { session: false, failWithError: true}), CandidateController.generatingPdf),

router.get('/get-params',passport.authenticate('jwt', { session: false, failWithError: true}), CandidateController.getJobsSkills)

export default router
