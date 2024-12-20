const utilities = require("../utilities/")
const invModel = require("../models/inventory-model")
const Util = require("../utilities/")

// Build Inventory Management View
async function buildInvManagement(req, res, next) {
  try {
    let nav = await utilities.getNav()

    const classificationList = await utilities.buildClassificationList()

    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classificationList
    })
  } catch (error) {
    console.error("Error building management view:", error);
    res.status(500).send("An error occurred while loading the management page.");
  }
}

// Build Add New Classification View
async function addNewClassification(req, res, next) {
  try {
    let nav = await utilities.getNav()

    res.render("./inventory/addClassification", {
      title: "Add New Classification",
      nav,
      errors: null
    })
  } catch (error) {
    console.error("Error building add new classification view:", error);
    res.status(500).send("An error occurred while loading the add new classification page.");
  }
}

// Build Add New Inventory Item View 
async function addNewInventory(req, res, next) {
  try {
    let nav  = await utilities.getNav()
    let classifications = await utilities.buildClassificationList()

    res.render("./inventory/addInventory", {
      title: "Add New Vehicle",
      nav,
      classifications,
      errors: null
    })
  } catch (error) {
    console.error("Error building add new vehicle view:", error);
    res.status(500).send("An error occurred while loading the add new inventory page.");
  }
}

// Build Edit Vehicle View
async function editVehicleView(req, res, next) {
  try {    
    const inv_id = parseInt(req.params.inv_id)

    let nav = await utilities.getNav()

    const itemData = await invModel.getDetailsByInventoryId(inv_id)

    const classifications = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    
    res.render("./inventory/editVehicle", {
      title: "Edit " + itemName,
      nav,
      classifications,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  } catch (error) {
    console.error("Error building edit vehicle view:", error);
    res.status(500).send("An error occurred while loading the edit inventory page.");
  }
}

// Build Delete Vehicle View
async function deleteVehicleView(req, res, next) {
  try {    
    const inv_id = parseInt(req.params.inv_id)

    let nav = await utilities.getNav()

    const itemData = await invModel.getDetailsByInventoryId(inv_id)

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    
    res.render("./inventory/deleteConfirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    })
  } catch (error) {
    console.error("Error building delete vehicle view:", error);
    res.status(500).send("An error occurred while loading the delete inventory page.");
  }
}


/* *********************************
*  Process CRUD Inventory Operations
* ******************************* */

// CREATE new Classification
async function insertNewClassification(req, res, next) {
  const { classification_name } = req.body

  const result = await invModel.insertClassification(classification_name)
  if (result) {
    let nav = await utilities.getNav()

    req.flash(
        "notice",
        `Congratulations, you added ${classification_name} to classifications.`
    )
    const classificationList = await utilities.buildClassificationList()

    res.status(201).render("./inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
        classificationList
    })
  } else {
    let nav = await utilities.getNav()

    req.flash("notice", "Sorry, adding the classification failed.")
    res.status(501).render("./inventory/addClassification", {
        title: "Add New Classification",
        nav,
    })    
  }
}

// CREATE new Vehicle
async function insertNewVehicle(req, res, next) {
  let nav = await utilities.getNav()

  const { inv_make, inv_model,inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body 

  const vehicleResult = await invModel.insertVehicle(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )

  if (vehicleResult) {
    req.flash(
        "notice",
        `Congratulations! You have added the ${vehicleResult.inv_make} ${vehicleResult.inv_model} to the inventory.`
    )
    const classificationList = await utilities.buildClassificationList()

    res.status(201).render("./inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
        classificationList
    })
  } else {
    req.flash("notice", "Sorry, adding the vehicle failed.")
    res.status(501).render("./inventory/addInventory", {
        title: "Add New Vehicle",
        nav,
    })  
  }
}

// UPDATE Vehicle in Inventory
async function updateInventory(req, res, next) {
  let nav = await utilities.getNav()

  const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body 

  const vehicleResult = await invModel.updateVehicle(
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )

  if (vehicleResult) {
    const itemName = `${vehicleResult.inv_make} ${vehicleResult.inv_model}`
    req.flash(
      "notice",
      `Congratulations! The ${itemName} was successfully updated.`
    )
    res.redirect("/inv/")
  } else {
    const classifications = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, adding the update failed.")
    res.status(501).render("./inventory/editVehicle", {
      title: "Edit " + itemName,
      nav,
      classifications,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })  
  }  
}

// DELETE a Vehicle from Inventory
async function deleteVehicle(req, res, next) {
  let nav = await utilities.getNav()

  const { inv_id, inv_make, inv_model, inv_year, inv_price } = req.body 
  const itemName = `${inv_make} ${inv_model}`

  const vehicleResult = await invModel.deleteVehicle(inv_id)

  if (vehicleResult) {
    req.flash(
      "notice",
      `Congratulations! The ${itemName} was successfully deleted.`
    )
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, deleting the vehicle failed.")
    res.status(501).render("./inventory/deleteConfirm", {
      title: "Edit " + itemName,
      nav,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price
    })  
  }  
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
async function getInventoryJSON(req, res, next) {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}



module.exports = { 
  buildInvManagement, 
  addNewClassification, 
  addNewInventory, 
  insertNewClassification, 
  insertNewVehicle,
  getInventoryJSON,
  editVehicleView,
  updateInventory,
  deleteVehicleView,
  deleteVehicle
}