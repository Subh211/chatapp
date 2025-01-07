"use strict";
// import dotenv from 'dotenv';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
// const users: { [username: string]: string } = {}; // Use username as key now
// io.on('connection', (socket) => {
//     console.log('A user connected');
//     socket.on('join', function (username) {
//         username = username.trim();
//         users[username] = socket.id; // Store the username as key and socket.id as value
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
//         console.log(users);
//         const targetSocketId = users[receiver]; // Access receiver directly by username now
//         if (targetSocketId) {
//             io.to(targetSocketId).emit('receiveMessage', { sender, message });
//             console.log(`Message delivered to ${receiver}`);
//         } else {
//             console.log(`User ${receiver} not connected`);
//         }
//         await client.rPush('messages', JSON.stringify({ sender, receiver, message, timestamp: new Date() }));
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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const db_1 = __importDefault(require("./config/db"));
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const redisClient_1 = __importDefault(require("./services/redisClient"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});
(0, db_1.default)();
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/chat', chat_1.default);
const PORT = process.env.PORT || 5000;
const users = {};
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('join', function (username) {
        username = username.trim();
        users[username] = socket.id;
        console.log(`${username} joined the chat`);
        console.log(users);
        // Automatically register the receiveMessage listener for this user
        // socket.on('receiveMessage', (data) => {
        //     console.log(`Message received by ${username}:`, data);
        // });
    });
    socket.on('message', function (message, receiver, sender) {
        return __awaiter(this, void 0, void 0, function* () {
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
            }
            else {
                console.log(`User ${receiver} not connected`);
            }
            yield redisClient_1.default.rPush('messages', JSON.stringify({ sender, receiver, message, timestamp: new Date() }));
        });
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
