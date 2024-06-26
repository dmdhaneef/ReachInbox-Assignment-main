const Redis = require("ioredis")

const redisConnection = new Redis({
    port:process.env.REDIS_PORT,
    host:process.env.REDIS_HOST,
    password:process.env.REDIS_PASSWORD
},{maxRetriesPerRequest:null})

module.exports={
    redisConnection
}