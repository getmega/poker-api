const mongoose = require('mongoose')
const Joi = require('joi')
const { PREFLOP } = require('../constants')


const roomSchema = new mongoose.Schema({
    players: {
        type: Array,
        required: true
    },
    maxPlayers: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    hand: {
        type: Array,
        required: false
    },
    maxBuyIn: {
        type: Number,
        required: true
    },
    bigBlind: {
        type: Number,
        required: true
    },
    smallBlind: {
        type: Number,
        required: true
    },
    bets: {
        type: Array,
        required: true,
        default: []
    },
    lastToRaiseId: {
        type: String,
        required: false
    },
    pot: {
        type: Number,
        required: true,
        default: 0
    },
    playersWaiting: {
        type: Array,
        required: true,
        default: []
    },
    phase: {
        type: String,
        required: true,
        default: PREFLOP
    },
    deck: {
        type: Array,
        required: true,
        default: []
    },
    communityCards: {
        type: Array,
        required: true,
        default: []
    },
    allInHands: {
        type: Array,
        required: true,
        default: []
    },
    sidePots: {
        type: Array,
        required: true,
        default: []
    },
    winners: {
        type: Array,
        required: true,
        default: []
    },
    endedByFold: {
        type: Boolean,
        required: true,
        default: false
    },
    numBots: {
        type: Number,
        required: true,
        default: 0
    },
    moveHistory: {
        type: Array,
        default: []
    }
})

const Room = mongoose.model('Room', roomSchema)

module.exports = {
    Room
}