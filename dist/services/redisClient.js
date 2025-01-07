"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const client = (0, redis_1.createClient)();
client.on('error', (err) => {
    console.error('Redis Client Error', err);
});
client.connect().catch(console.error);
exports.default = client;
// import { createClient } from 'redis';
// const client = createClient();
// client.on('error', (err) => {
//     console.error('Redis Client Error', err);
// });
// client.connect().catch(console.error);
// const clearRedis = async () => {
//     try {
//         await client.flushDb(); // Clears the current database only
//         console.log('Redis database cleared');
//     } catch (error) {
//         console.error('Error clearing Redis:', error);
//     }
// };
// export {client,clearRedis};
