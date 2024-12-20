const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel= require("../models/inventory-model")
const accountModel = require('../models/account-model')
const detCont = require("../controllers/detailController")

/* **********************************
*  Review Data Validation Rules
* ********************************* */
validate.reviewRules = () => {
    return [
    // Description is required and must be string
    body("review_text")
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 350 })
    .withMessage("Please provide a valid review.")
    ]
}

validate.checkReviewData = async (req, res, next) => {
    const { review_text, account_id, inv_id } = req.body 
    let errors = []

    errors = validationResult(req)

    if (!errors.isEmpty()) {        
        let nav = await utilities.getNav()
        
        const vehicleData = await invModel.getDetailsByInventoryId(inv_id)
        const reviewData = await invModel.getReviewsByInvId(inv_id)

        const grid = await utilities.buildVehicleDetailsGrid(vehicleData)
        const reviewList = await utilities.buildReviewList(reviewData)

        const className = `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`

        // return res.redirect(`/inv/detail/${inv_id}`)        
        return res.render("./inventory/detail", {
            errors,
            title: className,
            nav,  
            grid,
            reviewList,
            vehicleData,
            reviewData,
        })
    }
    next()
}

validate.checkReviewEdit = async (req, res, next) => {
    const { review_text, account_id, inv_id, review_id } = req.body 

    let errors = []

    errors = validationResult(req)

    if (!errors.isEmpty()) {
        try {
            const nav = await utilities.getNav();
            const vehicleData = await invModel.getDetailsByInventoryId(inv_id)
            const reviewData = await accountModel.getReviewByReviewId(review_id)

            const className = `Edit ${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model} Review`
            const accountData= res.locals.accountData

            return res.render("account/editReview", {
                title: className, 
                nav,
                errors,
                reviewData,
                vehicleData
            })

        } catch (err) {
            console.error("Error fetching necessary data for rendering:", err)
            return next(err)
        }
    }
    next()

}

module.exports = validate