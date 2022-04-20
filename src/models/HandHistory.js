const mongoose = require('mongoose')
const Joi = require('joi')
const { PREFLOP } = require('../constants')
const { gameSchema } = require('../models/Game')

const HandHistory = mongoose.model('HandHistory', gameSchema)

module.exports = {
    HandHistory
}
