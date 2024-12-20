const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel= require("../models/inventory-model")

/* **********************************
*  Vehicle Data Validation Rules
* ********************************* */
validate.vehicleRules = () => {
  return [
    // Valid classification_id
    body("classification_id")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Error with classification id."),

    // Make is required and must be string
    body("inv_make")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("Please provide a valid Vehicle Make."),

    // Model is required and must be string
    body("inv_model")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("Please provide a valid Vehicle Model."),
    
    // Description is required and must be string
    body("inv_description")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 3, max: 350 })
    .withMessage("Please provide a valid Vehicle description."),

    // Image path is required and must be a file
    body("inv_image")
    .trim()
    // .escape()
    .notEmpty()
    .withMessage("Please provide a path to a vehicle image."),

    // Image thumbnail path is required and must be a file
    body("inv_thumbnail")
    .trim()
    // .escape()
    .notEmpty()
    .withMessage("Please provide a path to a vehicle image thumbnail."),

    // Vehicle price can be a number or decimal
    body("inv_price")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a valid number (integer or decimal."),

    // Vehicle year must be valid and exactly 4 digits
    body("inv_year")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Year is required")
    .isInt({ min:1000, max:9999})
    .withMessage("Year must be a 4-digit number between 1000 and 9999")
    .matches(/^\d{4}$/)
    .withMessage("Year must be exactly 4 digits"),

    // Vehicle miles must be numbers only, no commas
    body("inv_miles")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Miles are required")
    .isNumeric()
    .withMessage("Enter miles with only digits, and no commas."),

    // A color is required
    body("inv_color")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Color is required")
  
  ]
  }
  
  validate.checkVehicleData = async (req, res, next) => {
      const { inv_make, inv_model,inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body 

      let errors = []

      errors = validationResult(req)

      if (!errors.isEmpty()) {
          let nav = await utilities.getNav()
          let classifications = await invModel.getClassifications();
        
          res.render("./inventory/addInventory", {
              errors,
              title: "Add New Vehicle",
              nav,
              classifications: classifications.rows,
              inv_make,
              inv_model,  
              inv_description, 
              inv_image, 
              inv_thumbnail, 
              inv_price,
              inv_year, 
              inv_miles, 
              inv_color,
              classification_id              
          })
          return
      }
      next()
  }

  validate.checkUpdateData = async (req, res, next) => {
    const { inv_id, inv_make, inv_model,inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body 

    let errors = []

    errors = validationResult(req)
    const itemName = `${inv_make} ${inv_model}`


    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classifications = await invModel.getClassifications();
      
        res.render("./inventory/editVehicle", {
            errors,
            title: "Edit " + itemName,
            nav,
            classifications: classifications.rows,
            inv_id,
            inv_make,
            inv_model,  
            inv_description, 
            inv_image, 
            inv_thumbnail, 
            inv_price,
            inv_year, 
            inv_miles, 
            inv_color,
            classification_id              
        })
        return
    }
    next()
}
  
  module.exports = validate