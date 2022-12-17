const Redis = require("ioredis");


export default class redisdb {
    constructor() {
        this.client = new Redis({
            host: 'redis-14138.c259.us-central1-2.gce.cloud.redislabs.com',
            port: 14138,
            password: 'Pj74-qDMbM7BVEpPu'
        });
        this.lock = require('./public_modules/ioredis-lock').createLock(client, {
            retries: 10,
            delay: 10000
        });
        this.waitList = 0;
        this.activeSingles = 0;
    }
    
}