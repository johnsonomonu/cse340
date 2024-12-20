const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  
  if (isNaN(classification_id) || classification_id <= 0) {
    console.error("Invalid classification ID:", req.params.classificationId)
    const error = new Error("Invalid classification ID. Must be a positive number.")
    error.status = 400
    next(error)
    return
  }

  try {
    const data = await invModel.getInventoryByClassificationId(classification_id)
  
    if (!data) {
      const error = new Error("Type not found")
      error.status = 404
      next(error)
      return  
    }
  
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (error) {
    console.error("Error in buildByClassificationId:", error)
  }
}

module.exports = invCont