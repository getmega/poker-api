const axios = require('axios').default;

// FIXME: the endpoint should come from environment variables
const FLASK_ENDPOINT = "http://127.0.0.1:5000/"

const ping = async () => {
	return await axios.get(FLASK_ENDPOINT)
		.then((response) => {
			if (response.status == 200) {
				console.info(`[pokerAIService] ping: ${response.data}`);
				return true;
			}
			else {
				return false;
			}
		})
		.catch((err) => {
			console.error(`[pokerAIService] Ping failed`, err);
			return false;
		})
}

const getVariants = async (numBots) => {
	return await axios.get(`${FLASK_ENDPOINT}variants/${numBots}`)
		.then((response) => {
			return response.data;
		})
		.catch(err => {
			console.error(`[pokerAIService] getVariants error`, err);
			throw err;
		})
}

const getAIBuyIn = async (variant, game, botUsername) => {
	return await axios.post(`${FLASK_ENDPOINT}buyIn/${variant}`, { botId: botUsername, game })
		.then((response) => {
			return response.data;
		})
		.catch((err) => {
			console.error(`[pokerAIService] getAIBuyIn error`, err);
			throw err;
		})
}

const getAIMove = async (variant, game, hand, playOptions, botUsername) => {
	return await axios.post(`${FLASK_ENDPOINT}bot/${variant}`, { botId: botUsername, game, hand, playOptions })
		.then((response) => {
			return response.data;
		})
		.catch((err) => {
			console.error(`[pokerAIService] getAIMove error`, err);
			throw err;
		})

}

module.exports = {
	ping,
	getVariants,
	getAIBuyIn,
	getAIMove,
}