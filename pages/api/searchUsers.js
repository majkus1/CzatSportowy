import connectToDb from '@/lib/db'
import User from '../../models/User';

export default async function handler(req, res) {
    await connectToDb();

    if (req.method === 'GET') {
        const { query } = req.query;

        if (!query) {
            res.status(400).json({ success: false, message: 'Query parameter is required.' }); return;
        }

        try {
            const users = await User.find({ username: new RegExp(query, 'i') }).select('username -_id');
            res.status(200).json({ success: true, users }); return;
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal Server Error.' }); return;
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed.' });
    }
}
