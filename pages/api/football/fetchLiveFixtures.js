import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' }); return;
  }

  const options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
    params: { live: 'all' },
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    res.status(200).json({ fixtures: response.data.response });
  } catch (error) {
    console.error('Error fetching live fixtures:', error);
    res.status(500).json({ error: 'Failed to fetch live fixtures' });
  }
}
