// api/discover.js

export default async function handler(req, res) {
  const { country, language, page } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'TMDB_API_KEY not configured' });
  }
  if (!country) {
    return res.status(400).json({ error: 'Missing "country" parameter' });
  }

  const url = new URL('https://api.themoviedb.org/3/discover/movie');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('with_origin_country', country);
  url.searchParams.set('language', language || 'en-US');
  url.searchParams.set('sort_by', 'popularity.desc');
  url.searchParams.set('include_adult', 'false');
  if (page) url.searchParams.set('page', page);

  try {
    const tmdbRes = await fetch(url);
    const data = await tmdbRes.json();
    return res.status(tmdbRes.status).json(data);
  } catch (err) {
    console.error('TMDB discover error', err);
    return res.status(500).json({ error: 'Failed to contact TMDB' });
  }
}
