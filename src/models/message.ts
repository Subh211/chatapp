// import { Schema, model } from 'mongoose';

// const messageSchema = new Schema({
//     sender: String,
//     receiver: String,
//     message: String,
//     timestamp: { type: Date, default: Date.now }
// });

// const Message = model('Message', messageSchema);

// export default Message;


import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
    participants: [String], // Store both sender and receiver in an array
    messages: [
        {
            sender: String,
            message: String,
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

const Message = model('Message', messageSchema);

export default Message;
