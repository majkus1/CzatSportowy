import connectToDb from '@/lib/db';
import Message from '@/models/Message';

export default async (req, res) => {
  if (req.method === 'GET') {
    const chatId = req.query.chatId;

    try {
      await connectToDb();

      const messages = await Message.find({ chatId: chatId });
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Błąd podczas pobierania wiadomości.' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Nieobsługiwana metoda żądania.' });
  }
};

