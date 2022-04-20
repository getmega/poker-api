const mongoose = require('mongoose')
const { gameSchema } = require('../models/Game')

const HandHistory = mongoose.model('HandHistory', gameSchema)

module.exports = {
    HandHistory
}
