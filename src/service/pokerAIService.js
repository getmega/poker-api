const axios = require('axios').default
const { POKER_AI_ENDPOINT } = require('../config')

const ping = async () => {
    return await axios
        .get(POKER_AI_ENDPOINT)
        .then(response => {
            if (response.status == 200) {
                console.info(`[pokerAIService] ping: ${response.data}`)
                return true
            } else {
                return false
            }
        })
        .catch(err => {
            console.error(`[pokerAIService] Ping failed`, err)
            return false
        })
}

const getVariants = async numBots => {
    return await axios
        .get(`${POKER_AI_ENDPOINT}/variants/${numBots}`)
        .then(response => {
            return response.data
        })
        .catch(err => {
            console.error(`[pokerAIService] getVariants error`, err.message)
            throw err
        })
}

const getAIBuyIn = async (variant, game, botUsername) => {
    return await axios
        .post(`${POKER_AI_ENDPOINT}/buyIn/${variant}`, { botId: botUsername, game })
        .then(response => {
            return response.data
        })
        .catch(err => {
            console.error(`[pokerAIService] getAIBuyIn error`, err.message)
            throw err
        })
}

const getAIMove = async (variant, game, hand, playOptions, botUsername) => {
    return await axios
        .post(`${POKER_AI_ENDPOINT}/bot/${variant}`, { botId: botUsername, game, hand, playOptions })
        .then(response => {
            return response.data
        })
        .catch(err => {
            console.error(`[pokerAIService] getAIMove error`, err.message)
            throw err
        })
}

module.exports = {
    ping,
    getVariants,
    getAIBuyIn,
    getAIMove
}
