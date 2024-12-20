const express = require("express")
const router = express.Router() 
const errorCont = require("../controllers/errorController")
const utilities = require("../utilities")

router.get("/error", errorCont.buildFakeErrorByLink);

module.exports = router;