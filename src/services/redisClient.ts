// import redis from 'redis';

// const client = redis.createClient();
// client.connect().catch(console.error);

// client.on('error', (err) => {
//     console.error('Redis Client Error', err);
// });

// export default client;


import { createClient } from 'redis';

const client = createClient();

client.on('error', (err) => {
    console.error('Redis Client Error', err);
});

client.connect().catch(console.error);

export default client;
