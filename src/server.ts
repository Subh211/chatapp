// import dotenv from 'dotenv';
// dotenv.config();

// import express from 'express';
// import http from 'http';
// import { Server } from 'socket.io';
// import connectDB from './config/db';
// import authRoutes from './routes/auth';
// import chatRoutes from './routes/chat';
// import client from './services/redisClient';
// import Message from './models/message';

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: '*',
//         methods: ['GET', 'POST'],
//         allowedHeaders: ['Content-Type'],
//         credentials: true
//     }
// });

// connectDB();

// app.use(express.json());
// app.use('/api/auth', authRoutes);
// app.use('/api/chat', chatRoutes);

// const PORT = process.env.PORT || 5000;
// const users: { [username: string]: string } = {}; 

// io.on('connection', (socket) => {
//     console.log('A user connected');

//     socket.on('join', function (username) {
//         username = username.trim();
//         users[username] = socket.id; 
//         console.log(`${username} joined the chat`);
//         console.log(users);
//     });

//     socket.on('message', async function (message, receiver, sender) {
//         message = message.trim();
//         receiver = receiver.trim();
//         sender = sender.trim();

//         console.log(`message: ${message}`);
//         console.log(`receiver: ${receiver}`);
//         console.log(`sender: ${sender}`);

//         const targetSocketId = users[receiver];

//         if (targetSocketId) {
//             io.to(targetSocketId).emit('receiveMessage', { sender, message });
//             console.log(`Message delivered to ${receiver}`);
//         } else {
//             console.log(`User ${receiver} not connected`);
//         }

//         await client.rPush('messages', JSON.stringify({ sender, receiver, message, timestamp: new Date() }));
//     });

//     socket.on('receiveMessage', (sender, message) => {
//         console.log(`Message received by ${sender}:`, message);
//     });

//     socket.on('disconnect', () => {
//         const disconnectedUser = Object.keys(users).find(key => users[key] === socket.id);
//         if (disconnectedUser) {
//             console.log(`${disconnectedUser} disconnected`);
//             delete users[disconnectedUser];
//         }
//     });
// });

// server.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });





import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import client from './services/redisClient';
import Message from './models/message';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

connectDB();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;
const users: { [username: string]: string } = {}; 

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', function (username) {
        username = username.trim();
        users[username] = socket.id; 
        console.log(`${username} joined the chat`);
        console.log(users);
    });

    socket.on('message', async function (message, receiver, sender) {
        message = message.trim();
        receiver = receiver.trim();
        sender = sender.trim();

        console.log(`message: ${message}`);
        console.log(`receiver: ${receiver}`);
        console.log(`sender: ${sender}`);

        const targetSocketId = users[receiver];

        if (targetSocketId) {
            io.to(targetSocketId).emit('receiveMessage', { sender, message });
            console.log(`Message delivered to ${receiver}`);
        } else {
            console.log(`User ${receiver} not connected`);
        }

        // Save message to Redis
        await client.rPush('messages', JSON.stringify({ sender, receiver, message, timestamp: new Date() }));
        const redisMessageCount = await client.lLen('messages');
        console.log(`Total messages in Redis: ${redisMessageCount}`);
    });

    socket.on('disconnect', () => {
        const disconnectedUser = Object.keys(users).find(key => users[key] === socket.id);
        if (disconnectedUser) {
            console.log(`${disconnectedUser} disconnected`);
            delete users[disconnectedUser];
        }
    });
});

// Move messages from Redis to MongoDB every 10 seconds
// setInterval(async () => {
//     const messageCount = await client.lLen('messages');
    
//     if (messageCount > 0) {
//         const messageData = await client.lPop('messages'); // Fetch one message
        
//         if (messageData) {
//             const message = JSON.parse(messageData);
//             const savedMessage = new Message(message);
//             await savedMessage.save();
//             console.log('Message saved to MongoDB:', message);
//         }
//     }
// }, 10000); // 10 seconds

// setInterval(async () => {
//     const messageCount = await client.lLen('messages');
    
//     if (messageCount > 0) {
//         const messageData = await client.lPopCount('messages',1); // Fetch one message
        
//         if (messageData) {
//             const message = JSON.parse(messageData[0]);
//             const savedMessage = new Message(message);
//             await savedMessage.save();
//             console.log('Message saved to MongoDB:', message);
//         }
//     }
// }, 30000); // 10 seconds

setInterval(async () => {
    const messageCount = await client.lLen('messages');
    
    if (messageCount > 0) {
        const messageData = await client.lPopCount('messages', 1); // Fetch one message as an array
        
        if (messageData && messageData.length > 0) {
            const message = JSON.parse(messageData[0]);
            const participants = [message.sender, message.receiver].sort(); // Ensure consistent ordering

            // Check if a document already exists for these participants
            let chat = await Message.findOne({ participants });

            if (!chat) {
                // If no document exists, create a new one
                chat = new Message({
                    participants,
                    messages: [{ sender: message.sender, message: message.message }]
                });
            } else {
                // If document exists, push the new message
                chat.messages.push({
                    sender: message.sender,
                    message: message.message
                });
            }

            await chat.save();
            console.log('Message saved to MongoDB:', message);
        }
    }
}, 20000); // 10 seconds




server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
