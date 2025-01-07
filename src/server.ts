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

        await client.rPush('messages', JSON.stringify({ sender, receiver, message, timestamp: new Date() }));
    });

    socket.on('receiveMessage', (sender, message) => {
        console.log(`Message received by ${sender}:`, message);
    });

    socket.on('disconnect', () => {
        const disconnectedUser = Object.keys(users).find(key => users[key] === socket.id);
        if (disconnectedUser) {
            console.log(`${disconnectedUser} disconnected`);
            delete users[disconnectedUser];
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
