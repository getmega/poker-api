const local = {
    mongoURI: 'mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/poker-db?' +
        'replicaSet=rs',
    jwtPrivateKey: 'z&234!jsh9,',
    encryptionSalt: 'encryptionSalt'
}

const prod = {
    // mongoURI: process.env.mongoURI,
    mongoURI: 'mongodb://megapokerbot:mega123@cluster0-shard-00-00.vpwpq.mongodb.net:27017,cluster0-shard-00-01.vpwpq.mongodb.net:27017,cluster0-shard-00-02.vpwpq.mongodb.net:27017/poker-db?atlas-hugr40-shard-0&ssl=true&authSource=admin',
    jwtPrivateKey: 'z&234!jsh9,',
    encryptionSalt: 'encryptionSalt'
}

module.exports = process.env.NODE_ENV === 'production' ? prod : local
