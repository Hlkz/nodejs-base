import express from 'express'
import path from 'path'
import favicon from 'serve-favicon'
import logger from 'morgan'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { CorePath, DataPath } from './path'

let app = express()

// view engine setup
app.set('dirname', __dirname)
app.set('views', path.join(CorePath, 'pug'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use('/data', express.static(DataPath))
app.use(favicon(path.join(DataPath, 'img/favicon.ico')))

// building and watching files (css, script)
require('./gulp')

let config = require(path.join(CorePath, 'site/config/config.json'))
app.set('config', config)

// database setup
import mysql from 'mysql'
let config_db = config.database
let db = mysql.createConnection({
  host     : config_db.host,
  user     : config_db.user,
  password : config_db.password,
  database : config_db.database
})
db.prefix = config_db.prefix
app.set('database', db)

// locale
import locale from './locale'
app.set('locale', locale)
locale.load(db)

import prefix from './prefix'
import Catch from './catch'
import Route from './route'

app.use('/', prefix)
Catch(app)
Route(app)

module.exports = app

console.log("end, server up!")
