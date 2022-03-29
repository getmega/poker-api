const io = require('socket.io-client')
const pokerAI = require('../service/pokerAIService')

const MIN_WAIT_TIME_AT_START_MILLISECONDS = 4000
const PLAY_DELAY_MILLISECONDS = 2000

const botVariantOptions = Object.freeze({
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard'
})

class BotPlayer {
    constructor(botName, botVariant, gameObj) {
        this._id = botName
        this.username = botName
        this.name = botName
        this.variant = botVariant
        this.game = gameObj
        this.chips = 0
        this.socketId = ''
        this.hand = []
        this.playedOnceTS = false
        this.gameStartTS = null
    }

    initializeSocket(botMoveFunc, moveEnum) {
        const socket = io('http://localhost:8081')

        try {
            socket.emit('joinGame', this.game._id, this)

            socket.on('connect', () => {
                console.debug(`[${this.username}] connect. socket-id: ${socket.id}`)
                this.socketId = socket.id
            })

            socket.on('gameUpdate', game => {
                if (game) {
                    const nextDealer = game.players.find(p => p.isDealer)
                    const previousDealer = this.game.players.find(p => p.isDealer)

                    const dealerChanged = previousDealer && nextDealer && nextDealer._id !== previousDealer._id
                    if ((!previousDealer && nextDealer) || dealerChanged) {
                        console.log(`[${this.username}] ====================== GAME START`)
                        this.hand = []
                        this.gameStartTS = new Date()
                        this.playedOnceTS = false
                    } else if (game.phase != this.game.phase) {
                        // it is possible that the last mover of the previous phase is the first mover of the next phase
                        this.playedOnceTS = false
                    }

                    if (
                        (this.game.players.length !== 1 && dealerChanged) ||
                        (this.game.players.length > 1 && game.players.length === 1)
                    ) {
                        // showWinners
                        this.game = game
                        console.info(`[${this.username}] Winners of this round: ${JSON.stringify(game.winners)}`)
                    } else if (this.game.players.length === 1 && game.players.length > 1) {
                        this.game = game
                        // deal
                        console.debug(`[${this.username}] next round is getting dealt`)
                    } else {
                        if (this.checkTurn(this.game) && this.checkTurn(game) && this.playedOnceTS) {
                            // repeated game state
                            this.game = game
                            if (this.game.hand) {
                                this.hand = this.game.hand
                            }
                            console.debug(`[${this.username}] my turn, but repeated situation`)
                        } else {
                            this.game = game
                            if (this.game.hand) {
                                this.hand = this.game.hand
                            }
                            this.checkTurnAndPlay(botMoveFunc, moveEnum)
                        }
                    }
                } else {
                    // closeGame
                    console.warn(`[${this.username}] Bot has exitted the game with game-id: ${this.game._id}`)
                }
            })
        } catch (e) {
            console.warn(`[${this.username}] socket error: ${e}`)
        }
    }

    async buyIn() {
        let buyInAmount
        console.debug(`[${this.username}] asking remote server for buy-in`)
        buyInAmount = await pokerAI.getAIBuyIn(this.variant, this.game, this.username)
            .catch(e => {
                console.error(`[${this.username}] Caught error which contacting Python server`, e.message)
                return this.game.maxBuyIn // basic buy in
            })
        console.info(`[${this.username}] Buying in with ${buyInAmount}`)
        return buyInAmount
    }

    botPlayer(game) {
        return game.players.find(player => player._id === this._id)
    }

    isBotPlaying(game) {
        return !!this.botPlayer(game)
    }

    checkTurn(game) {
        return this.isBotPlaying(game) && this.botPlayer(game).isTurn
    }

    playerBet(game) {
        if (!this.isBotPlaying(game)) {
            return false
        }
        const bet = game.bets.find(b => b.playerId === this._id)
        return bet ? bet.amount : false
    }

    largestBet(game) {
        if (!game || game.bets.length === 0) {
            return 0
        }
        return Math.max(...game.bets.map(bet => bet.amount))
    }

    canCall(game) {
        return game.bets.length > 0 && this.playerBet(game) !== this.largestBet(game)
    }

    canCheck(game) {
        const playerBet = this.playerBet(game)
        if ((!playerBet && game.bets.length > 0) || (playerBet && playerBet < this.largestBet(game))) {
            return false
        }
        return true
    }

    amountToCall(game) {
        const playerBet = this.playerBet(game) || 0
        return this.largestBet(game) - playerBet
    }

    canRaise(game) {
        if (!this.isBotPlaying(game)) {
            return false
        }
        const amountToCall = this.amountToCall(game)
        return this.botPlayer(game).chips > amountToCall && game.lastToRaiseId !== this._id
    }

    checkTurnAndPlay(botMoveFunc, moveEnum) {
        if (!this.isBotPlaying(this.game)) {
            // console.debug(`[${this.username}] not yet part of the game...`)
            return
        }
        const botPlayer = this.botPlayer(this.game)
        if (botPlayer.isTurn) {
            if (!this.playedOnceTS) {
                console.debug(`[${this.username}] turn to play. playing...`)
                if (this.hand && this.hand.length > 0) {
                    this.playedOnceTS = new Date() // play finalized

                    const timeLapsed = new Date() - this.gameStartTS
                    const playDelayMS = Math.max(
                        PLAY_DELAY_MILLISECONDS,
                        MIN_WAIT_TIME_AT_START_MILLISECONDS - timeLapsed
                    )
                    console.debug(`[${this.username}] waiting for ${playDelayMS / 1000} seconds`)
                    setTimeout(this.playTurn, playDelayMS, this, botMoveFunc, moveEnum)
                } else {
                    console.warn(`[${this.username}] Did not receive hand details. Waiting...`)
                }
            } else {
                console.debug(`[${this.username}] turn to play. just played. Waiting for changes to reflect...`)
            }
        } else {
            this.playedOnceTS = false
            console.debug(`[${this.username}] waiting for turn...`) // TODO: remove this console
        }
    }

    localPlayLogic(variant, game, hand, playOptions, moveEnum) {
        const moveDetails = (move, raiseAmount = 0) => ({
            move,
            raiseAmount
        })
        switch (variant) {
            case botVariantOptions.EASY:
                // this stupid bot always folds!
                return moveDetails(moveEnum.FOLD)
            case botVariantOptions.MEDIUM:
                const moveIndex = Math.floor(Math.random() * playOptions.length)
                const move = playOptions[moveIndex]
                if (move != moveEnum.RAISE) {
                    return moveDetails(move)
                } else {
                    // when we want to raise
                    const raiseLimit = this.botPlayer(game).chips - this.amountToCall(game)
                    const raiseAmount = Math.ceil(Math.random() * raiseLimit)
                    return moveDetails(move, raiseAmount)
                }
            case botVariantOptions.HARD:
                if (!hand || hand.length == 0) {
                    return moveDetails(moveEnum.FOLD) // folds if no information is available
                }
                const playInPriorityOrder = order => {
                    for (const move of order) {
                        if (playOptions.includes(move)) {
                            if (move != moveEnum.RAISE) {
                                return moveDetails(move)
                            } else {
                                // when we want to raise
                                const raiseLimit = this.botPlayer(game).chips - this.amountToCall(game)
                                const raiseAmount = Math.min(raiseLimit, Math.max(this.amountToCall(game), 10))
                                if (raiseAmount > 0) {
                                    return moveDetails(move, raiseAmount)
                                }
                            }
                        }
                    }
                }
                const isFaceCard = card => {
                    const faceCardNum = ['T', 'J', 'Q', 'K', 'A']
                    return faceCardNum.includes(card[0])
                }
                if (isFaceCard(hand[0]) && isFaceCard(hand[1]) && hand[0][0] == hand[1][0]) {
                    return playInPriorityOrder([moveEnum.RAISE, moveEnum.CALL, moveEnum.CHECK, moveEnum.FOLD])
                } else if (isFaceCard(hand[0]) && isFaceCard(hand[1])) {
                    return playInPriorityOrder([moveEnum.CALL, moveEnum.RAISE, moveEnum.CHECK, moveEnum.FOLD])
                } else if (isFaceCard(hand[0]) || isFaceCard(hand[1])) {
                    return playInPriorityOrder([moveEnum.CALL, moveEnum.CHECK, moveEnum.FOLD])
                } else {
                    return playInPriorityOrder([moveEnum.CHECK, moveEnum.FOLD])
                }
            default:
                console.error(`[${this.username}] This variant (${variant}), is not handled. Defaulting to fold...`)
                return moveDetails(moveEnum.FOLD)
        }
    }

    async playTurn(botPlayer, botMoveFunc, moveEnum) {
        /**
         * Evaluation all available options
         * Call Python code with list of options
         * Return action
         */
        const playOptions = [moveEnum.FOLD]
        if (botPlayer.canCheck(botPlayer.game)) {
            playOptions.push(moveEnum.CHECK)
        }
        if (botPlayer.canCall(botPlayer.game)) {
            playOptions.push(moveEnum.CALL)
        }
        if (botPlayer.canRaise(botPlayer.game)) {
            playOptions.push(moveEnum.RAISE)
        }

        let moveDetails
        console.log(`[${botPlayer.username}] asking remote server for moves`)
        moveDetails = await pokerAI.getAIMove(
            botPlayer.variant,
            botPlayer.game,
            botPlayer.hand,
            playOptions,
            botPlayer.username
        )
            .catch(e => {
                console.error(`[${botPlayer.username}] Could not get move from AI server. Playing local logic...`, e.message)
                console.log(`[${botPlayer.username}] =========> this is the moveDetails object sent: ${botPlayer.localPlayLogic(botPlayer.variant, botPlayer.game, botPlayer.hand, playOptions, moveEnum)}`)
                return botPlayer.localPlayLogic(botPlayer.variant, botPlayer.game, botPlayer.hand, playOptions, moveEnum)
            })
        console.log(`[${botPlayer.username}] =========< this is the moveDetails object received: ${moveDetails}`)

        const retObj = botMoveFunc(botPlayer, botPlayer.game._id, moveDetails.move, moveDetails.raiseAmount)
        console.info(`
        [${botPlayer.username}] Executed ${moveDetails.move} (${moveDetails.raiseAmount}). hand:
        ${botPlayer.hand} [game has: ${botPlayer.game.hand}].\n\t\tReceived: ${JSON.stringify(retObj)}`)
    }
}

module.exports = {
    BotPlayer,
    botVariantOptions
}
