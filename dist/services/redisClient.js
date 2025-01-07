"use strict";
// import redis from 'redis';
Object.defineProperty(exports, "__esModule", { value: true });
// const client = redis.createClient();
// client.connect().catch(console.error);
// client.on('error', (err) => {
//     console.error('Redis Client Error', err);
// });
// export default client;
const redis_1 = require("redis");
const client = (0, redis_1.createClient)();
client.on('error', (err) => {
    console.error('Redis Client Error', err);
});
client.connect().catch(console.error);
exports.default = client;
