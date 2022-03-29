const local = {
    mongoURI: 'mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/poker-db?' + 'replicaSet=rs',
    jwtPrivateKey: 'z&234!jsh9,',
    encryptionSalt: 'encryptionSalt',
    POKER_AI_ENDPOINT: 'http://127.0.0.1:5000'
}

const prod = {
    mongoURI: process.env.mongoURI,
    jwtPrivateKey: process.env.jwtPrivateKey,
    encryptionSalt: process.env.encryptionSalt,
    POKER_AI_ENDPOINT: process.env.pokerAIEndpoint
}

module.exports = process.env.NODE_ENV === 'production' ? prod : local
