// api/getPrivateMessages.js

import connectToDb from '@/lib/db'
import PrivateChat from '@/models/PrivateChat'

export default async (req, res) => {
	if (req.method === 'GET') {
		const { chatId } = req.query

		try {
			await connectToDb()

			const chat = await PrivateChat.findOne({ chatId })
			if (!chat) {
				res.status(404).json({ success: false, message: 'Czat nie istnieje.' }); return;
			}
			console.log(chat.messages)
			res.status(200).json(chat.messages)
		} catch (error) {
			console.error(error)
			res.status(500).json({ success: false, message: 'Błąd podczas pobierania wiadomości.' })
			console.error(error)
		}
	} else {
		res.status(405).json({ success: false, message: 'Nieobsługiwana metoda żądania.' })
	}
}
