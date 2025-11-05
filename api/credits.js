// api/credits.js

export default async function handler(req, res) {
  const { id, language } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'TMDB_API_KEY not configured' });
  }
  if (!id) {
    return res.status(400).json({ error: 'Missing "id" parameter' });
  }

  const url = new URL(`https://api.themoviedb.org/3/movie/${id}/credits`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('language', language || 'en-US');

  try {
    const tmdbRes = await fetch(url);
    const data = await tmdbRes.json();
    return res.status(tmdbRes.status).json(data);
  } catch (err) {
    console.error('TMDB credits error', err);
    return res.status(500).json({ error: 'Failed to contact TMDB' });
  }
}
