const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const detCont = {}

/* ***************************
 *  Build vehicle by details view
 * ************************** */

detCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inventoryId

  if (isNaN(inv_id) || inv_id <= 0) {
    console.error("Invalid inventory ID:", req.params.inventoryId);
    const error = new Error("Invalid inventory ID. Must be a positive number.");
    error.status = 400; 
    return next(error)
  }

  try {
    const vehicleData = await invModel.getDetailsByInventoryId(inv_id)
    const reviewData = await invModel.getReviewsByInvId(inv_id)

    if (!vehicleData) {
      const error = new Error("Vehicle not found")
      error.status = 404
      return next(error)
    }

    const grid = await utilities.buildVehicleDetailsGrid(vehicleData)
    const reviewList = await utilities.buildReviewList(reviewData)
    let nav = await utilities.getNav()

    const className = + vehicleData.inv_year + ' ' + vehicleData.inv_make + ' ' + vehicleData.inv_model || "Unknown Vehicle"
    res.render("./inventory/detail", {
      title: className,
      nav,
      errors: null,
      grid,
      reviewList,
      reviewData,
      vehicleData
    })

  } catch (error) {
    console.error("Error in buildByInventoryId:", error)
    res.status(500).render("error", { error: "Internal Server Error" })
  }
}
  
detCont.submitReview = async function (req, res, next) {
  try {
    const { review_text, inv_id, account_id } = req.body

    if (!review_text || !account_id || !inv_id) {
      throw new Error("Missing required review data.");
    }
    
    const result = await invModel.addReview(review_text, inv_id, account_id)
    console.log("Review successfully added:", result)

    res.redirect(`/inv/detail/${inv_id}`)

  } catch (error) {
    console.error("Error submitting review:", error)
    next(error)
  }
}

module.exports = detCont