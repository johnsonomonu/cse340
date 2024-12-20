const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')
const logValidate = require('../utilities/login-validation')
const reviewValidate = require('../utilities/review-validation')

// Account View Route
router.get(
    "/",
    utilities.checkLogin, 
    utilities.handleErrors(accountController.buildAcctManagement)
)
router.get("/login", utilities.handleErrors(accountController.buildLoginView))
router.get("/register", utilities.handleErrors(accountController.buildRegisterView))
router.get("/edit/:account_id", utilities.handleErrors(accountController.buildEditView))
router.get("/review/edit/:review_id", utilities.handleErrors(accountController.buildReviewEditView))
router.get("/logout", utilities.handleErrors(accountController.accountLogout))
router.get("/review/delete/:review_id", utilities.handleErrors(accountController.buildDeleteReviewView))

// Process Registration Post method
router.post(
    '/register',
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process login to verify login data
router.post(
    '/login',
    logValidate.loginRules(), 
    logValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

// Process to edit account information
router.post(
    '/edit/',
    regValidate.editDataRules(),
    regValidate.checkEditData,
    utilities.handleErrors(accountController.editAccountDetails)
)

// Process to change account password
router.post (
    '/edit/pw/',
    logValidate.passwordRules(),
    logValidate.checkPWData,
    utilities.handleErrors(accountController.editPassword)
)

router.post(
    '/review/edit/',
    reviewValidate.reviewRules(),
    reviewValidate.checkReviewEdit,
    utilities.handleErrors(accountController.editReview)
)

router.post(
    '/review/delete/',
    utilities.handleErrors(accountController.deleteReview)
)

module.exports = router;