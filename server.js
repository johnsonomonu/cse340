/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const detailRoute = require("./routes/detailRoute");
const fakeError = require("./routes/errorRoute");
const accountRoute = require("./routes/accountRoute");
const baseController = require("./controllers/baseController");
const utilities = require("./utilities/index");
const session = require("express-session");
const pool = require("./database/");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

/* ***********************
 * Middleware
 *************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(bodyParser.urlencoded({ extended: true })) 
app.use(bodyParser.json())

app.use(cookieParser())

app.use(utilities.checkJWTToken)
app.use((req, res, next) => {
  res.locals.loggedin = !!req.cookies.jwt; 
  next();
});

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory Route
app.use("/inv", inventoryRoute)

// Detail Route
app.use("/inv/detail", detailRoute)

// Account Route
app.use("/account", accountRoute)

// Intention Error Route
app.use("/errors", fakeError)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: `Awwww... Don't Cry. It's just a 404 Error!`})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  console.log(err.message)
  res.render("errors/error", {
    title: err.status || 'Server Error',
    nav,
    message: err.message
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
