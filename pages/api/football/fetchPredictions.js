import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' }); return;
  }

  const { fixtureId } = req.body;
  if (!fixtureId) {
    res.status(400).json({ error: 'Missing fixtureId in request body' }); return;
  }

  const options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/predictions',
    params: { fixture: fixtureId },
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    const prediction = response.data.response[0]?.predictions?.advice || null;
    res.status(200).json({ prediction });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
}
