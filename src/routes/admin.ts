import { AdminController } from  '../controllers'
import passport from 'passport'
import express = require('express')
import { registerValidation, ImportEmailValidation } from '../validations'
const router = express.Router()



/* clients routes */
router.post('/profile', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.getProfile)
router.post('/submit-contact', AdminController.submitContact)
router.post('/register-user',registerValidation, AdminController.createClient)
router.post('/create-client', ImportEmailValidation, passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.createClient)
router.put('/update-client', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.updateClient)
router.put('/update-profile', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.updateUser)
router.get('/get-clients', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.getClients)
router.get('/get-client/:id', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.getClient)
router.post('/change-status', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.changeStatus)
router.post('/change-param-status', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.paramChangeStatus)
router.post('/delete-client', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.deleteClient)
router.get('/send-credentials/:id', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.sendCredentials)

// candidate routes
router.get('/get-candidates', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.getCandidates)

// template routes
router.get('/get-templates', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.getTemplates)
router.get('/get-template/:id', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.getTemplate)
router.post('/create-template', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.createTemplate)
router.post('/delete-template', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.deleteTemplate)
router.put('/update-template', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.updateTemplate)

//params routes
router.post('/create-params', passport.authenticate('jwt',{ session: false, failWithError: true}), AdminController.createParams)
router.post('/delete-param/', passport.authenticate('jwt',{session: false, failWithError: true}),AdminController.deleteParam)
router.put('/update-param/', passport.authenticate('jwt',{session: false, failWithError: true}),AdminController.updateParams)
router.get('/get-parameters', passport.authenticate('jwt',{session: false, failWithError: true}),AdminController.getParams)
router.get('/get-active-parameters', passport.authenticate('jwt',{session: false, failWithError: true}),AdminController.getActiveParams)
router.get('/get-param-from/:id',passport.authenticate('jwt',{session:false, failWithError:true}),AdminController.manageParams)
router.get('/get-param-by/:id',passport.authenticate('jwt',{session:false, failWithError:true}),AdminController.getParamById)

router.get('/get-report-template',passport.authenticate('jwt',{session:false, failWithError:true}),AdminController.getReportTemplate)

router.post('/get-dashboard-data/', passport.authenticate('jwt', { session: false, failWithError: true }), AdminController.getDashboardData)

export default router
