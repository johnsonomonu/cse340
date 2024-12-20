const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    if (data.rows.length === 0) {
      return null
    }
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
    throw error
  }
}

/* ***************************
 *  Get all vehicle details for an inventory item inv_id
 * ************************** */
async function getDetailsByInventoryId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    )
    if (data.rows.length === 0) {
      return null
    }
    return data.rows[0]
  } catch (error) {
    console.error("getdetailsbyid error " + error)
    throw error
  }
}

/* ***************************
 *  Get all vehicle reviews for an inventory item by inv_id
 * ************************** */
async function getReviewsByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT r.review_id, r.review_text, r.review_date, r.inv_id, LEFT(a.account_firstname, 1) AS account_first_initial, a.account_lastname FROM review r JOIN account a ON r.account_id = a.account_id WHERE r.inv_id = $1 ORDER BY r.review_date DESC;`,
      [inv_id]
    )
   
    return data.rows || [];
  } catch (error) {
    console.error("getreviewssbyid error " + error)
    throw error
  }
}

/* ***************************
 *  Submit review for an inventory item by inv_id
 * ************************** */
async function addReview(review_text, inv_id, account_id) {

  try {
    const sql= `INSERT INTO review (review_text, review_date, inv_id, account_id) VALUES ($1, now(), $2, $3) RETURNING *`
    const data = await pool.query(sql, [review_text, inv_id, account_id])
    
    if (data.rowCount > 0) {
      const reviewData = data.rows[0]
      return reviewData
    } else {
      console.log('Could not add review vehicle.')
    }
  } catch (error) {
    return error.message
  }
}

/* ***************************************
 *  Insert a new classification into table
 * ************************************ */
async function insertClassification(classification_name) {
  try{
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

/* *************************************
 *  Insert a new vehicle into inventory
 * ********************************** */
async function insertVehicle(
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
) { 
  try{

    const sql = "INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    const result = await pool.query(sql, [
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
    ])

    if (result.rowCount > 0) {
      const vehicle = result.rows[0]
      return vehicle      
    } else {
      console.log('Could not find vehicle.')
    }

  } catch (error) {
    console.error('Error inserting vehicle:', error.message)
    return error.message
  }
}

/* *************************************
 *  UPDATE a vehicle in inventory
 * ********************************** */
async function updateVehicle(
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
) { 
  try{

    const sql = `UPDATE public.inventory 
      SET inv_make = $1, inv_model = $2, inv_year = $3, inv_description = $4, inv_image = $5, inv_thumbnail = $6, inv_price = $7, inv_miles = $8, inv_color = $9, classification_id = $10 
      WHERE inv_id = $11 RETURNING *`

    const result = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])

    if (result.rowCount > 0) {
      const vehicle = result.rows[0]
      return vehicle      
    } else {
      console.log('Could not find vehicle.')
    }

  } catch (error) {
    console.error('Error updating vehicle:', error.message)
    return error.message
  }
}

/* *************************************
 *  DELETE a vehicle from inventory
 * ********************************** */
async function deleteVehicle(
  inv_id,
  inv_make,
  inv_model,
  inv_year,
  inv_price
) { 
  try{
    const sql = "DELETE FROM inventory WHERE inv_id = $1"

    const result = await pool.query(sql, [inv_id])

    return result

  } catch (error) {
    console.error('Error deleting vehicle:', error.message)
    return error.message
  }
}

module.exports = {
  getClassifications, 
  getInventoryByClassificationId, 
  getDetailsByInventoryId,
  getReviewsByInvId,
  addReview,
  insertClassification,
  insertVehicle,
  updateVehicle,
  deleteVehicle
}
