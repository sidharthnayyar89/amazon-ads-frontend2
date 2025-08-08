"use client";
import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Metrics = {
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
  cpc: number;
  ctr: number;
  acos: number;
  roas: number;
};

type Row = {
  run_id: string;
  pulled_at: string;
  marketplace: string;
  campaign_id: string;
  campaign_name: string;
  ad_group_id: string;
  ad_group_name: string;
  entity_type: string;
  keyword_id: string;
  keyword_text: string;
  match_type: string;
  bid: number;
  lookback_days: number;
  buffer_days: number;
  metrics: Metrics;
};

export default function Dashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [marketplace, setMarketplace] = useState("IN");
  const [lookback, setLookback] = useState(14);
  const [buffer, setBuffer] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const url = new URL(`${API_BASE}/api/sp/keywords`);
      url.searchParams.set("marketplace", marketplace);
      url.searchParams.set("lookback_days", String(lookback));
      url.searchParams.set("buffer_days", String(buffer));
      url.searchParams.set("limit", "500");
      const res = await fetch(url.toString());
      const data: Row[] = await res.json();
      setRows(data);
      setLoading(false);
    };
    fetchData();
  }, [marketplace, lookback, buffer]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(r =>
      r.campaign_name.toLowerCase().includes(needle) ||
      r.ad_group_name.toLowerCase().includes(needle) ||
      r.keyword_text.toLowerCase().includes(needle)
    );
  }, [rows, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Amazon Ads — Pull Data</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          className="border rounded px-3 py-2"
          placeholder="Search campaign/ad group/keyword"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="border rounded px-3 py-2" value={marketplace} onChange={(e)=>setMarketplace(e.target.value)}>
          <option value="IN">IN</option>
          <option value="US">US</option>
          <option value="UK">UK</option>
        </select>
        <input
          type="number"
          className="border rounded px-3 py-2"
          value={lookback}
          min={1}
          max={60}
          onChange={(e)=>setLookback(parseInt(e.target.value||"14"))}
          placeholder="Lookback days"
        />
        <input
          type="number"
          className="border rounded px-3 py-2"
          value={buffer}
          min={0}
          max={7}
          onChange={(e)=>setBuffer(parseInt(e.target.value||"1"))}
          placeholder="Buffer days"
        />
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Campaign</th>
              <th className="text-left p-2">Ad Group</th>
              <th className="text-left p-2">Keyword</th>
              <th className="text-right p-2">Match</th>
              <th className="text-right p-2">Bid</th>
              <th className="text-right p-2">Clicks</th>
              <th className="text-right p-2">Impr</th>
              <th className="text-right p-2">Spend</th>
              <th className="text-right p-2">Sales</th>
              <th className="text-right p-2">Orders</th>
              <th className="text-right p-2">CTR</th>
              <th className="text-right p-2">CPC</th>
              <th className="text-right p-2">ACOS</th>
              <th className="text-right p-2">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4" colSpan={14}>Loading…</td></tr>
            ) : pageRows.length === 0 ? (
              <tr><td className="p-4" colSpan={14}>No results</td></tr>
            ) : (
              pageRows.map((r) => (
                <tr key={r.keyword_id} className="border-t">
                  <td className="p-2">{r.campaign_name}</td>
                  <td className="p-2">{r.ad_group_name}</td>
                  <td className="p-2">{r.keyword_text}</td>
                  <td className="p-2 text-right">{r.match_type}</td>
                  <td className="p-2 text-right">{r.bid.toFixed(2)}</td>
                  <td className="p-2 text-right">{r.metrics.clicks}</td>
                  <td className="p-2 text-right">{r.metrics.impressions}</td>
                  <td className="p-2 text-right">₹{r.metrics.spend.toFixed(2)}</td>
                  <td className="p-2 text-right">₹{r.metrics.sales.toFixed(2)}</td>
                  <td className="p-2 text-right">{r.metrics.orders}</td>
                  <td className="p-2 text-right">{(r.metrics.ctr*100).toFixed(2)}%</td>
                  <td className="p-2 text-right">₹{r.metrics.cpc.toFixed(2)}</td>
                  <td className="p-2 text-right">{(r.metrics.acos*100).toFixed(2)}%</td>
                  <td className="p-2 text-right">{r.metrics.roas.toFixed(2)}x</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">{filtered.length} rows</div>
        <div className="flex items-center gap-2">
          <button className="border rounded px-3 py-1" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
          <span className="text-sm">Page {page} / {totalPages}</span>
          <button className="border rounded px-3 py-1" disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
          <select className="border rounded px-2 py-1" value={pageSize} onChange={(e)=>{setPageSize(parseInt(e.target.value)); setPage(1);}}>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </main>
  );
}
