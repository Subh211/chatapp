import { createClient } from 'redis';

const client = createClient();

client.on('error', (err) => {
    console.error('Redis Client Error', err);
});

client.connect().catch(console.error);

export default client;
