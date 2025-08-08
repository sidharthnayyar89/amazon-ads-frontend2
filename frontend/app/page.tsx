'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/sp/keywords?limit=500&lookback_days=14&buffer_days=1');
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Amazon Ads Keywords</h1>
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>Keyword</th>
            <th>Match Type</th>
            <th>Bid</th>
            <th>Clicks</th>
            <th>Sales</th>
            <th>ACOS</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row: any) => (
            <tr key={row.keyword_id}>
              <td>{row.keyword_text}</td>
              <td>{row.match_type}</td>
              <td>{row.bid}</td>
              <td>{row.metrics.clicks}</td>
              <td>{row.metrics.sales}</td>
              <td>{row.metrics.acos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
