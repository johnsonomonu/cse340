const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="'+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build HTML for vehicle pages
* ************************************ */
Util.buildVehiclePage = async function (data) {
  let vehicleTemplate = "";

  if (data) {
    vehicleTemplate += '<section id="vehicle-details">';

    // Vehicle section container
    vehicleTemplate += '<div class="vehicle-container">';

    // Image - Left on desktop
    vehicleTemplate += '<div class="vehicle-image-container">';
    vehicleTemplate += `<img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">`;
    vehicleTemplate += "</div>";

    // Details - right on desktop
    vehicleTemplate += '<div class="vehicle-details-container">';
    vehicleTemplate += `<h2>${data.inv_make} ${data.inv_model}</h2>`;
    vehicleTemplate += "<p>";
    vehicleTemplate += `<strong>Year:</strong> ${data.inv_year}<br>`;
    vehicleTemplate += `<strong>Color:</strong> ${data.inv_color}<br>`;
    vehicleTemplate += `<strong>Miles:</strong> ${new Intl.NumberFormat('en-US').format(data.inv_miles)} miles<br>`;
    vehicleTemplate += "</p>";
    vehicleTemplate += `<p>${data.inv_description}</p>`;
    vehicleTemplate += `<p class="price">Price: $${new Intl.NumberFormat('en-US').format(data.inv_price)}</p>`;
    vehicleTemplate += "</div>";
    vehicleTemplate += "</div>";
    vehicleTemplate += "</section>";
  } else {
    vehicleTemplate = '<p class="notice">Sorry, the vehicle you are looking for could not be found.</p>';
  }

  return vehicleTemplate;
};


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util