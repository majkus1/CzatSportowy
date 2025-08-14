import connectToDb from '@/lib/db';
import Message from '@/models/Message';

export default async (req, res) => {
  if (req.method === 'POST') {
    const { username, content, chatId } = req.body;

    try {
      await connectToDb();

      const newMessage = new Message({
        username: username,
        content: content,
        chatId: chatId
      });
      await newMessage.save();

      res.status(200).json({ success: true, message: 'Wiadomość zapisana pomyślnie.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Błąd podczas zapisywania wiadomości.' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Nieobsługiwana metoda żądania.' });
  }
};

