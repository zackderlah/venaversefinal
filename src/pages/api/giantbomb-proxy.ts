import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;
  if (!query || typeof query !== 'string') {
    res.status(400).json({ error: 'Missing query parameter' });
    return;
  }
  const apiKey = "4ad067883d9d052b144b74cec0dcedb2c1c48431";
  const url = `https://www.giantbomb.com/api/search/?api_key=${apiKey}&format=json&query=${encodeURIComponent(query)}&resources=game`;
  try {
    const gbRes = await fetch(url, { headers: { 'User-Agent': 'johnnywebsite' } });
    const data = await gbRes.json();
    if (!data.results) {
      res.status(200).json({ results: [] });
      return;
    }
    // Fetch developer info for each result
    const detailedResults = await Promise.all(
      data.results.slice(0, 5).map(async (game: any) => {
        let developer = '';
        if (game.api_detail_url) {
          try {
            const detailRes = await fetch(`${game.api_detail_url}?api_key=${apiKey}&format=json`, { headers: { 'User-Agent': 'johnnywebsite' } });
            const detailData = await detailRes.json();
            if (detailData.results && detailData.results.developers && detailData.results.developers.length > 0) {
              developer = detailData.results.developers[0].name;
            }
          } catch {}
        }
        return {
          ...game,
          developer,
        };
      })
    );
    res.status(200).json({ results: detailedResults });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from GiantBomb' });
  }
} 