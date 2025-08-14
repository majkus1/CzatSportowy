import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { date } = req.query;
  const dt = date || new Date().toISOString().slice(0, 10);

  try {
    const response = await axios.get('https://today-football-prediction.p.rapidapi.com/predictions/list', {
      params: { date: dt },
      headers: {
        'x-rapidapi-key': process.env.TODAY_PREDICTION_KEY,
        'x-rapidapi-host': 'today-football-prediction.p.rapidapi.com',
      },
    });

    const matches = response.data.matches || [];
    const simplified = matches.map(m => ({
      id: m.id,
      home_team: m.home_team,
      away_team: m.away_team,
      date: m.date,
      prediction: m.prediction,
      prediction_odd: m.prediction_odd,
      prediction_probability: m.prediction_probability
    }));

    res.status(200).json({ matches: simplified });
  } catch (error) {
    console.error('Prediction API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
}
