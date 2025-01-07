"use strict";
// import { Schema, model } from 'mongoose';
Object.defineProperty(exports, "__esModule", { value: true });
// const messageSchema = new Schema({
//     sender: String,
//     receiver: String,
//     message: String,
//     timestamp: { type: Date, default: Date.now }
// });
// const Message = model('Message', messageSchema);
// export default Message;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    participants: [String], // Store both sender and receiver in an array
    messages: [
        {
            sender: String,
            message: String,
            timestamp: { type: Date, default: Date.now }
        }
    ]
});
const Message = (0, mongoose_1.model)('Message', messageSchema);
exports.default = Message;
