const local = {
    mongoURI: 'mongodb://megapokerbot:mega123@cluster0-shard-00-00.vpwpq.mongodb.net:27017,cluster0-shard-00-01.vpwpq.mongodb.net:27017,cluster0-shard-00-02.vpwpq.mongodb.net:27017/poker-db?' +
        'replicaSet=atlas-hugr40-shard-0&ssl=true&authSource=admin',
    jwtPrivateKey: 'z&234!jsh9,',
    encryptionSalt: 'encryptionSalt'
}

const prod = {
    mongoURI: process.env.mongoURI,
    jwtPrivateKey: process.env.jwtPrivateKey,
    encryptionSalt: process.env.encryptionSalt
}

module.exports = process.env.NODE_ENV === 'production' ? prod : local
