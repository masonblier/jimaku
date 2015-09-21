var express = require('express');

var api = module.exports = express.Router();

api.use(require('./scripts'));
api.use(require('./parse'));
api.use(require('./words'));
