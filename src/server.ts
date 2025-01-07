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
        origin: '*',  // Ensure this allows all origins or restrict it to specific ones
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

const users = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join',function(username) {
        console.log('inside join');
        username = username.trim();
        users[socket.id] = username;
        console.log(`${username} joined the chat`);
        }
    );

    socket.on('message', async function(message, receiver, sender) {
        console.log('inside message');
        // Trim whitespace from message, receiver, and sender
        message = message.trim();
        receiver = receiver.trim();
        sender = sender.trim();
        console.log(`message is ${message}`);
        console.log(`receiver is ${receiver}`);
        console.log(`sender is ${sender}`);
        const targetSocketId = Object.keys(users).find(
            (key) => users[key] === receiver
        );
        if (targetSocketId) {
            io.to(targetSocketId).emit('receiveMessage', { sender, message });
            console.log(`Message delivered to ${receiver}`);
        } else {
            console.log(`User ${receiver} not connected`);
        }
        await client.rPush('messages', JSON.stringify({ sender, receiver, message, timestamp: new Date() }));
    });
    

    // socket.on('sendMessage', async function({ sender, receiver, message }) {
    //     console.log(`sender ${sender}`);
    //     console.log(`receiver ${receiver}`);
    //     console.log(`message ${message}`);
    //     console.log(`Message from ${sender} to ${receiver}: ${message}`);
    //     const targetSocketId = Object.keys(users).find(
    //         (key) => users[key] === receiver
    //     );
    //     if (targetSocketId) {
    //         io.to(targetSocketId).emit('receiveMessage', { sender, message });
    //         console.log(`Message delivered to ${receiver}`);
    //     } else {
    //         console.log(`User ${receiver} not connected`);
    //     }
    //     await client.rPush('messages', JSON.stringify({ sender, receiver, message, timestamp: new Date() }));
    // });

    socket.on('sendMessage', async function({message }) {
        console.log(`message ${message}`);
        // const targetSocketId = Object.keys(users).find(
        //     (key) => users[key] === receiver
        // );
        // if (targetSocketId) {
        //     io.to(targetSocketId).emit('receiveMessage', { sender, message });
        //     console.log(`Message delivered to ${receiver}`);
        // } else {
        //     console.log(`User ${receiver} not connected`);
        // }
        // await client.rPush('messages', JSON.stringify({ sender, receiver, message, timestamp: new Date() }));
    });
    
    // socket.on('message', async (data) => {
    //     const { sender, receiver, message } = data;
    //     if (!sender || !receiver || !message) {
    //         console.log('Invalid message data received');
    //         return;
    //     }
    //     console.log(`sender ${sender}`);
    //     console.log(`receiver ${receiver}`);
    //     console.log(`message ${message}`);
        
    //     const targetSocketId = Object.keys(users).find(key => users[key] === receiver);
    //     if (targetSocketId) {
    //         io.to(targetSocketId).emit('receiveMessage', { sender, message });
    //         console.log(`Message delivered to ${receiver}`);
    //     } else {
    //         console.log(`User ${receiver} not connected`);
    //     }
    
    //     await client.rPush('messages', JSON.stringify({ sender, receiver, message, timestamp: new Date() }));
    // });
    

    setInterval(async () => {
        const message = await client.lPop('messages');
        if (message) {
            const parsedMessage = JSON.parse(message);
            await new Message(parsedMessage).save();
        }
    }, 60000);

    socket.on('disconnect', () => {
        console.log(`${users[socket.id]} disconnected`);
        delete users[socket.id];
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
