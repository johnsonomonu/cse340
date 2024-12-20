const express = require("express")
const router = new express.Router() 
const managementController = require("../controllers/managementController")
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const classValidate = require("../utilities/classification-validation")
const vehicleValidate = require("../utilities/vehicle-validation")
/************************
 * Management View Route
 ***********************/
// Inv Management Route
router.get("/", utilities.handleErrors(managementController.buildInvManagement))
// Enter New Classification
router.get("/addClassification", utilities.handleErrors(managementController.addNewClassification))
// Enter New Vehicle
router.get("/addInventory", utilities.handleErrors(managementController.addNewInventory))
// Load Inventory Table by Classification
router.get("/getInventory/:classification_id", utilities.handleErrors(managementController.getInventoryJSON))
// Get Form to Edit Vehicle
router.get("/edit/:inv_id", utilities.handleErrors(managementController.editVehicleView))
// Load Delete Inventory Form
router.get("/delete/:inv_id", utilities.handleErrors(managementController.deleteVehicleView))

// Classification View Route
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

router.post(
    '/addClassification',
    classValidate.classificationRules(),
    classValidate.checkClassData,
    utilities.handleErrors(managementController.insertNewClassification)
)

router.post(
    '/addInventory',
    vehicleValidate.vehicleRules(),
    vehicleValidate.checkVehicleData,
    utilities.handleErrors(managementController.insertNewVehicle)
)

router.post(
    '/update/', 
    vehicleValidate.vehicleRules(),
    vehicleValidate.checkUpdateData,
    utilities.handleErrors(managementController.updateInventory))

router.post(
    '/delete/',
    utilities.handleErrors(managementController.deleteVehicle)
)

module.exports = router;