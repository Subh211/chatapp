import { createClient } from 'redis';

const client = createClient();

client.on('error', (err) => {
    console.error('Redis Client Error', err);
});

client.connect().catch(console.error);

export default client;

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
