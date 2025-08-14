import connectToDb from '@/lib/db';
import PrivateChat from '@/models/PrivateChat';

export default async (req, res) => {
    if (req.method === 'POST') {
        const { user1, user2 } = req.body;

        const chatId = [user1, user2].sort().join('_');

        try {
            await connectToDb();

            let chat = await PrivateChat.findOne({ chatId });
            if (!chat) {
                chat = new PrivateChat({ user1, user2, chatId });
                await chat.save();
            }

            res.status(200).json({ success: true, chatId: chat.chatId });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Błąd podczas tworzenia czatu.' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Nieobsługiwana metoda żądania.' });
    }
};

