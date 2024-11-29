const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);

    // If no data associated, throw error
    if (!data || data.length === 0) {
      const error = new Error("Vehicle classification not found");
      error.status = 404;
      throw error;
    }

    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: `${className} Vehicles`,
      nav,
      grid,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};


/* ***************************
 *  Build vehicle page by inventory id
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId;
    const data = await invModel.getDetailByVehicleId(inv_id);

    // If not data associated, throw error
    if (!data) {
      const error = new Error("Vehicle not found");
      error.status = 404;
      throw error;
    }

    const vehicleTemplate = await utilities.buildVehiclePage(data);
    const nav = await utilities.getNav();
    const vehicleName = `${data.inv_year} ${data.inv_make} ${data.inv_model}`;
    res.render("./inventory/vehicle", {
      title: vehicleName,
      nav,
      vehicleTemplate,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = invCont