const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const invModel = require("../models/inventory-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver Account Views
* *************************************** */
// Build Login View
async function buildLoginView(req, res, next) {
  try {
    let nav = await utilities.getNav()

    res.render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } catch (error) {
    console.error("Error building login view:", error);
    res.status(500).send("An error occurred while loading the login page.");
  }
}

// Build Register View
async function buildRegisterView(req, res, next) {
  try{
    let nav = await utilities.getNav()

    res.render("account/register", {
      title: "Register",
      nav,
      errors: null
    })
  } catch (error) {
    console.error("Error building login view:", error);
    res.status(500).send("An error occurred while building registration view.");
  }
}

// Build Account Management View
async function buildAcctManagement(req, res, next) {
  const account_id = parseInt(res.locals.accountData.account_id);

  try {
    let nav = await utilities.getNav()

    const reveiws = await accountModel.getReviewsByActId(account_id)
    const actReviewList = await utilities.buildActReviewList(reveiws)

    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      actReviewList
    })

  } catch (error) {
    console.error("Error building account management view: ", error);
    res.status(500).send("An error occurred while loading the account management page.");
  }
}

// Build Account Update View
async function buildEditView(req, res, next) {
  try {
    const account_id = parseInt(req.params.account_id)

    let nav = await utilities.getNav()

    const accountData = await accountModel.getAccountByAccountId(account_id)

    res.render("account/editAccount", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    })

  } catch (error) {
    console.error("Error building edit account view: ", error);
    res.status(500).send("An error occurred while loading the edit account page.");
  }
}

async function buildReviewEditView(req, res, next) {
  try {
    const reviewId = parseInt(req.params.review_id)

    let nav = await utilities.getNav()

    const reviewData = await accountModel.getReviewByReviewId(reviewId)

    if (!reviewData) {
      throw new Error("Review data not found")
    }

    const vehicleData = await invModel.getDetailsByInventoryId(reviewData.inv_id)

    if (!vehicleData) {
      throw new Error("Vehicle data not found")
    }

    const title = `Edit ${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model} Review`

    res.render("account/editReview", {
      title,
      nav,
      errors: null,
      reviewData,
      vehicleData
    })

  } catch (error) {
    console.error("Error building review edit view: ", error);
    res.status(500).send("An error occurred while loading the edit review page.");
  }
}

// DELETE Review View
async function buildDeleteReviewView(req, res, next) {

  const reviewId = parseInt(req.params.review_id)
  console.log(reviewId)

  try{    

    let nav = await utilities.getNav()

    const reviewData = await accountModel.getReviewByReviewId(reviewId)
    console.log(reviewData)
    if (!reviewData) {
      throw new Error("Review data not found")
    }

    const vehicleData = await invModel.getDetailsByInventoryId(reviewData.inv_id)
    console.log(vehicleData)
    if (!vehicleData) {
      throw new Error("Item data not found")
    }

    const title = `Delete ${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model} Review`
    console.log(title)


    res.render("account/deleteReview", {
      title,
      nav,
      errors: null,
      reviewData,
      vehicleData
    })

  } catch (error) {
    console.error("Error building delete review view:", error);
    res.status(500).send("An error occurred while loading the delete review page.");
  }
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )

    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* *************************
*  Process Login
* *********************** */
async function accountLogin(req, res, next) {
  let nav = await utilities.getNav()
  const { account_email, account_password} = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password

      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

// Edit the Account Information
async function editAccountDetails(req, res, next) {
  let nav = await utilities.getNav()

  const { account_id, account_firstname, account_lastname, account_email, } = req.body

  const editResult = await accountModel.editAccount
  (
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  )

  if (editResult) {
    delete editResult.account_password
    const accessToken = jwt.sign(editResult, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }

    req.flash(
      "notice",
      `Congratulations, ${editResult.account_firstname} ${editResult.account_lastname}. Your account has been updated.`
    )
    res.render('account/management', {
      title: 'Account Management',
      nav,
      errors: null,
      editResult
    })
    
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render(`account/editAccount`, {
      title: "Edit Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}

async function editPassword(req, res, next) {
  let nav = await utilities.getNav()

  const { account_id, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the password change.')
    res.status(500).render("/account/management", {
      title: "Account Management",
      nav,
      errors: null,
      account_id, 
    })
  }

  const editResult = await accountModel.editPassword(
    account_id,
    hashedPassword
  )

  if (editResult) {
    req.flash(
      "notice",
      `Congratulations, ${editResult.account_firstname} ${editResult.account_lastname}. Your password has been updated.`
    )

    return res.redirect("/account/")

  } else {
    req.flash("notice", "Sorry, the edit failed.")
    res.status(501).render("/account/management", {
      title: "Account Management",
      nav,
    })
  }
}

async function editReview(req, res, next) {
  
  let nav = await utilities.getNav()

  const { review_date, review_text, review_id } = req.body
  console.log("params to go to act model", req.body)
  const editResult = await accountModel.editReview(
    review_text, review_id
  )
  console.log("AC edit Results", editResult)
  if (editResult) {
    req.flash(
      "notice",
      `Congratulations,Your review has been updated.`
    )

    return res.redirect("/account/")

  } else {
    req.flash("notice", "Sorry, the review edit failed.")
    res.status(501).render("/account/management", {
      title: "Account Management",
      nav,
    })
  }
  
}

// DELETE a Review
async function deleteReview(req, res, next) {
    let nav = await utilities.getNav()    
    const { review_id, inv_id, account_id} = req.body

  try {
    const reviewResult = await accountModel.deleteReview(review_id)

    if (reviewResult) {
      const reveiws = await accountModel.getReviewsByActId(account_id)
      const actReviewList = await utilities.buildActReviewList(reveiws)

      req.flash(
        "notice",
        `Congratulations! Your review was successfully deleted.`
      )
      res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        actReviewList
      })
    }    

  } catch (error) {
    console.error("Error deleting review: ", error);
    res.status(500).send("An error occurred while deleting review.");
  }
  
}

async function accountLogout(req, res, next) {
  try {
    res.clearCookie('jwt')

    req.session.destroy((err) => {
      if (err) {
        return next(err)
      }
    res.redirect('/')
    })
  } catch (error) {
    console.error("Error during logout: ", error)
    res.status(500).send("An error occured while logging out.")
  }
}
  
module.exports = { 
  buildLoginView, 
  buildRegisterView,
  buildDeleteReviewView, 
  registerAccount, 
  accountLogin, 
  buildAcctManagement,
  buildEditView,
  buildReviewEditView,
  editAccountDetails,
  editPassword,
  editReview,
  deleteReview,
  accountLogout
}