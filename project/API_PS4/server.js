const express = require("express")
const app = express()
const router = express.Router()
const bodyParser = require("body-parser")
const morgan = require('morgan')
const rateLimit = require("express-rate-limit")
const helmet = require('helmet')

//json web token
let jwt = require("jsonwebtoken")
import CONFIG from './config/config'
let middleware = require("./api/middleware")

class HandlerGenerator {
  login(req, res) {
    let username = req.body.username
    let password = req.body.password
    // For the given username fetch user from DB
    let mockedUsername = "admin"
    let mockedPassword = "password"

    if (username && password) {
      if (username === mockedUsername && password === mockedPassword) {
        let token = jwt.sign({ username: username }, CONFIG.secret, {
          expiresIn: "24h" // expires in 24 hours
        });
        // return the JWT token for the future API calls
        res.json({
          success: true,
          message: "Authentication successful!",
          token: token
        })
      } else {
        res.send(403).json({
          success: false,
          message: "Incorrect username or password"
        })
      }
    } else {
      res.send(400).json({
        success: false,
        message: "Authentication failed! Please check the request"
      })
    }
  }
  index(req, res) {
    res.json({
      success: true,
      message: "Index page",
      data: req.decoded
    })
  }
}

import cors from 'cors'
import routes from './api/routes'
import bird from './api/routes/router'
import uuidv4 from 'uuid/v4'
import 'dotenv/config'
console.log(process.env.MY_SECRET)

import models from './dummy/student'
//console.log(models);
import Database from './api/models/Database'
import cronjob from './api/cronjob'

// config
const port = process.env.PORT || 8989

//routes
const api_home = require('./api/routes/home')
const api_product = require('./api/routes/product')

// Use Node.js body parsing middleware : parses incoming post request data
app.use(morgan('combined'))
app.use(cors());
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
// app.use(helmet()) //  secure your Express apps by setting various HTTP headers

// cronjob
cronjob().then(x => console.log(x))
         .catch(e => console.error(e))

//run before middleware
app.get('/check', (req, res) => {
  let data = 'PASSED -> ' + uuidv4()
  res.json({data})
})

// async try...catch
app.get('/catch', async (req, res, next) => {
  try {
    throw new Error('2019')
  } catch(err) {
    next(err)
  }
})

//https://appdividend.com/2018/02/03/express-middleware-tutorial-example-scratch/
//Types of  Express Middleware : 5
// - Application-level middleware
// - Router-level middleware
// - Error-handling middleware
// - Built-in middleware
// - Third-party middleware

//Middleware Application
app.use((req, res, next) => {
    console.log('App Middleware : Hi')
    req.context = {
        models,
        me: models.users[1],
    }
    res.removeHeader('X-Powered-By') // remove X-Powered-By in response

  next()
})

//using jwt
let handlers = new HandlerGenerator()
app.post('/loginjwt', handlers.login)
app.get('/get_index', middleware.checkToken, handlers.index)

app.get("/api", (req, res) => {
  const sql = "SELECT * FROM users"
  new Database().query(sql).then(rows => res.json(rows))
})

// route middleware that will happen on every request
router.use((req, res, next) => {
  // log each request to the console
  console.log(req.method, req.url)
  console.log("Router Middleware: Hi")
  // continue doing what we were doing and go to the route
  next()
})
router.get("/", (req, res) => {
  res.send({
    message: "REST API Home"
  })
})
// route with parameters (http://localhost:8080/hello/:name)
router.get("/hello/:name", (req, res) => {
  res.send("hello " + req.params.name + "!")
})
// route middleware to validate :name
router.param("name", (req, res, next, name) => {
  console.log("doing name validations on " + name)

  // once validation is done save the new item in the req
  req.name = name
  // go to the next thing
  next()
});

// route with parameters (http://localhost:8080/midd/:name)
router.get("/midd/:name", (req, res) => {
  res.send("hello " + req.name + "!")
})

// CORS middleware
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization')
  
//   next()
// });

// apply the routes to our application
api_home(app)
api_product(app)
app.use('/api/v1', router)
app.use('/api/v2', bird)
app.use('/bird/', routes.bird)
app.use('/users', routes.user)

//api PS4
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message:
    'Too many accounts created from this IP, please try again after an hour'
})
const url_api = '/api/ps4/v1/'
app.use(url_api, apiLimiter) // only apply to requests that begin with
app.use(`${url_api}authen`, routes.authen)
app.use(`${url_api}history_login`, routes.history_login)
app.use(url_api, middleware.checkToken) // check JWT
app.use(`${url_api}user`, routes.user)
app.use(`${url_api}vendor`, routes.vendor)
app.use(`${url_api}item`, routes.item)
app.use(`${url_api}trans`, routes.transaction)
app.use(`${url_api}code`, routes.code)
app.use(`${url_api}inventory`, routes.inventory)
app.use(`${url_api}ps`, routes.ps)
app.use(`${url_api}point`, routes.point)
app.use(`${url_api}time`, routes.chamcong)
app.use(`${url_api}kiemke`, routes.kiemke)
app.use(`${url_api}upload`, routes.upload)
app.use(`${url_api}thuchi`, routes.thuchi)
app.use(`${url_api}setting`, routes.setting)
app.use(`${url_api}shop`, routes.shop)

//Error-handling middleware
//middleware để check nếu request API không tồn tại
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'ERR_INVALID_404',
    url: req.originalUrl + ' not found'
  })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    success: false,
    code: 'ERR_INVALID_500'
  })
})

//start Express server on defined port
app.listen(port, error => {
  if (error) {
    console.log(`Error: ${error}`)
    return
  }
  console.log(`Server listening on port ${port}`)
})

//log to console to let us know it's working
console.log("API running on port: " + port)
