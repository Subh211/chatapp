import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
    sender: String,
    receiver: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

const Message = model('Message', messageSchema);

export default Message;
