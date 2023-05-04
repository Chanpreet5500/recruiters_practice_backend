import {  TestResultController } from  '../controllers'

import express = require('express')
const passport = require('passport')
const router = express.Router() 
    
//TestResult Routes
router.post('/save-result', passport.authenticate('jwt', { session: false, failWithError: true }), TestResultController.saveTestResult)
router.get('/get-jobdata/:id',  passport.authenticate('jwt', { session: false, failWithError: true }), TestResultController.getJobDetailsByInvite)
router.get('/get-test-result-data/:id',  passport.authenticate('jwt', { session: false, failWithError: true }), TestResultController.getTestResultData)
router.get('/get-pdf-details/:id', TestResultController.getJobDetailsByInvite)

export default router