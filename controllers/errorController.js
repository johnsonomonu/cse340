const utilities = require("../utilities")

const errorCont = {}

errorCont.buildFakeErrorByLink = async function (req, res, next) {
  let nav = await utilities.getNav()

  try{ 
    throw new Error("This is an intentional error demo.")
  } catch (err) {
    err.status = 500;
    console.log(err)
    res.render("errors/error", {
      title: err.status ||'Intentional Error',
      nav,
      message: err.message
    })
  }
  
}

module.exports = errorCont