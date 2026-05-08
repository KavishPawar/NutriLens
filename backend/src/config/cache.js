import Redis from 'ioredis'
import { config } from './config.js'

const redis = new Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD
})

redis.on('connection', () => {
    console.log("Server Connected w/ Redis. ")
})

redis.on('error', (err) => {
    console.log("Redis Error. " + err)
})

export default redis;