const mongoose = require('mongoose');

const privateChatSchema = new mongoose.Schema({
    user1: String,
    user2: String,
    chatId: String,
    messages: [{
        username: String,
        content: String,
        timestamp: { type: Date, default: Date.now }
    }]
});

const PrivateChat = mongoose.models.PrivateChat || mongoose.model('PrivateChat', privateChatSchema);

module.exports = PrivateChat;
