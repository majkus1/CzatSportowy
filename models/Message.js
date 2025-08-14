import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    username: String,
    content: String,
    chatId: String,
    timestamp: { type: Date, default: Date.now }
});


let Message;

try {
    Message = mongoose.model('Message');
} catch {
    Message = mongoose.model('Message', messageSchema);
}

export default Message;

