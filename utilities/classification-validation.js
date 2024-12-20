const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/* **********************************
*  Classification Data Validation Rules
* ********************************* */
validate.classificationRules = () => {
  return [
    // firstname is required and must be string
    body("classification_name")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 3 })
    .isAlphanumeric()
    .withMessage("Please follow the name format requirements."), // on error this message is sent.

  ]
}

validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body 
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("./inventory/addClassification", {
            errors,
            title: "Add New Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}

module.exports = validate