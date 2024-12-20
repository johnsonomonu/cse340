const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/* **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.loginRules = () => {
  return [
    // valid email is required and cannot already exist in the DB
    body("account_email")
    .trim()
    .escape()
    .notEmpty()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required."),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password should meet requirements."),
  ]
}
  
/* ******************************
* Check data and return errors or continue to registration
* ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors,
      account_email,
    })
  return
  }
  next()
}
  
validate.passwordRules = () => {
  return [

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password should meet requirements."),
  ]
}

/* ******************************
* Check data and return errors or continue to account management
* ***************************** */
validate.checkPWData = async (req, res, next) => {
  const { account_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email } = res.locals.accountData
    res.render("account/editAccount", {
      title: "Edit Account",
      nav,
      errors,
      account_id,
      account_firstname,
      account_lastname,
      account_email
    })
  return
  }
  next()
}

  module.exports = validate