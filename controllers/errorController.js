const errorController = {};

/* ***************************
 *  Create 500 Error
 * ************************** */
errorController.triggerError = async function (req, res, next) {
  try {
    throw new Error("This is an intentional 500 error.");
  } catch (error) {
    next(error);
  }
};

module.exports = errorController;