const express = require("express")
const router = new express.Router()
const detailController = require("../controllers/detailController")
const utilities = require("../utilities/")
const reviewValidate = require('../utilities/review-validation')

// Route to build details by inventory id
router.get("/:inventoryId", utilities.handleErrors(detailController.buildByInventoryId))
// Write a Review on a Vehicle
// router.get("/review/:inv_id", utilities.handleErrors(detailController.buildReviewByInvId))

router.post(
    '/review',
    reviewValidate.reviewRules(),
    reviewValidate.checkReviewData,
    utilities.handleErrors(detailController.submitReview)
)

module.exports = router;
