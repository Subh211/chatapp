"use strict";
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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const db_1 = __importDefault(require("./config/db"));
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const redisClient_1 = __importDefault(require("./services/redisClient"));
const message_1 = __importDefault(require("./models/message"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // Ensure this allows all origins or restrict it to specific ones
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
        console.log('inside join');
        username = username.trim();
        users[socket.id] = username;
        console.log(`${username} joined the chat`);
    });
    socket.on('message', function (message, receiver, sender) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('inside message');
            // Trim whitespace from message, receiver, and sender
            message = message.trim();
            receiver = receiver.trim();
            sender = sender.trim();
            console.log(`message is ${message}`);
            console.log(`receiver is ${receiver}`);
            console.log(`sender is ${sender}`);
            const targetSocketId = Object.keys(users).find((key) => users[key] === receiver);
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
    socket.on('sendMessage', function (_a) {
        return __awaiter(this, arguments, void 0, function* ({ message }) {
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
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        const message = yield redisClient_1.default.lPop('messages');
        if (message) {
            const parsedMessage = JSON.parse(message);
            yield new message_1.default(parsedMessage).save();
        }
    }), 60000);
    socket.on('disconnect', () => {
        console.log(`${users[socket.id]} disconnected`);
        delete users[socket.id];
    });
});
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
