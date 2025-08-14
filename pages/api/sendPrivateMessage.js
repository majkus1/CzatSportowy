import connectToDb from '@/lib/db'
import PrivateChat from '@/models/PrivateChat'

export default async (req, res) => {
    console.log("Otrzymane dane:", req.body);

    const { username, content, chatId } = req.body;


    console.log("Utworzone chatId:", chatId);

    try {
        await connectToDb();

        let chat = await PrivateChat.findOne({ chatId });

        if (!chat) {
            chat = new PrivateChat({ chatId, messages: [] });
        }

        const newMessage = {
            username: username,
            content: content,
        }        

        chat.messages.push(newMessage);
        await chat.save();

        res.status(200).json({ success: true, message: 'Wiadomość zapisana pomyślnie.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Błąd podczas zapisywania wiadomości.' });
    }
}
