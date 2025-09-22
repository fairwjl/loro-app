// client/src/components/Effectiveness.jsx
import { useEffect, useMemo, useState } from "react";
import { loadJSON, saveJSON } from "../lib/storage.js";

/**
 * Effectiveness Log
 * Reads/writes localStorage key: "effect:sessions"
 * Row shape:
 *  {
 *    tool: "Bilateral Stim" | "Breath" | ...,
 *    before: number,  // SUDS before (0-10 or 0-100)
 *    after: number,   // SUDS after
 *    delta: number,   // before - after
 *    dateISO: "YYYY-MM-DD",
 *    ts: number,      // timestamp (ms)
 *    origin: "manual" | "auto",
 *    notes?: string
 *  }
 */

const STORE_KEY = "effect:sessions";

function fmt(n, d = 1) {
  if (n == null || Number.isNaN(n)) return "–";
  return Number(n).toFixed(d);
}
function toISODate(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function clampRangeDays(v, min, max) {
  const n = Number(v);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export default function Effectiveness() {
  const [rows, setRows] = useState(() => loadJSON(STORE_KEY, []));
  const [toolFilter, setToolFilter] = useState("All");
  const [rangeDays, setRangeDays] = useState(30); // lookback
  const [query, setQuery] = useState(""); // notes search

  // keep in sync with localStorage if another tab modifies it
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === `loro:${STORE_KEY}`) {
        setRows(loadJSON(STORE_KEY, []));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // unique tool list
  const tools = useMemo(() => {
    const set = new Set(rows.map((r) => r.tool).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [rows]);

  // date window
  const filtered = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - (clampRangeDays(rangeDays, 1, 365) - 1));
    start.setHours(0, 0, 0, 0);
    const startMs = start.getTime();

    const q = query.trim().toLowerCase();

    return rows
      .filter((r) => {
        if (toolFilter !== "All" && r.tool !== toolFilter) return false;
        if (r.ts == null || r.ts < startMs) return false;
        if (q && !(r.notes || "").toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => b.ts - a.ts);
  }, [rows, toolFilter, rangeDays, query]);

  // KPIs
  const kpis = useMemo(() => {
    if (!filtered.length) {
      return { n: 0, avgBefore: null, avgAfter: null, avgDelta: null };
    }
    const n = filtered.length;
    const sumBefore = filtered.reduce((s, r) => s + Number(r.before || 0), 0);
    const sumAfter = filtered.reduce((s, r) => s + Number(r.after || 0), 0);
    const sumDelta = filtered.reduce((s, r) => s + Number(r.delta || 0), 0);
    return {
      n,
      avgBefore: sumBefore / n,
      avgAfter: sumAfter / n,
      avgDelta: sumDelta / n,
    };
  }, [filtered]);

  // group by date
  const byDate = useMemo(() => {
    const map = new Map();
    for (const r of filtered) {
      const d = r.dateISO || toISODate(r.ts || Date.now());
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(r);
    }
    // newest date first
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  // local mutations
  const removeRow = (ts) => {
    const next = rows.filter((r) => r.ts !== ts);
    setRows(next);
    saveJSON(STORE_KEY, next);
  };
  const clearAll = () => {
    if (!confirm("This will delete ALL effectiveness entries on this device. Continue?")) return;
    setRows([]);
    saveJSON(STORE_KEY, []);
  };

  // export CSV
  const exportCSV = () => {
    const header = ["date", "tool", "before", "after", "delta", "origin", "notes"];
    const lines = [header.join(",")];
    for (const r of filtered.slice().reverse()) {
      lines.push([
        r.dateISO || toISODate(r.ts || Date.now()),
        JSON.stringify(r.tool || ""),
        r.before ?? "",
        r.after ?? "",
        r.delta ?? "",
        JSON.stringify(r.origin || ""),
        r.notes ? JSON.stringify(r.notes) : ""
      ].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const start = filtered[filtered.length - 1]?.dateISO || "start";
    const end = filtered[0]?.dateISO || "end";
    a.download = `loro_effectiveness_${start}_to_${end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="card">
      <h2>Effectiveness</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        Average change in SUDS after using tools. Entries are stored only on this device.
      </p>

      {/* KPIs */}
      <div className="kpis" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 8 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="muted">Entries</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{kpis.n}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="muted">Avg Before</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{fmt(kpis.avgBefore)}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="muted">Avg After</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{fmt(kpis.avgAfter)}</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="muted">Avg Δ</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{fmt(kpis.avgDelta)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="list" style={{ marginTop: 12 }}>
        <div className="list-row" style={{ gap: 12, flexWrap: "wrap" }}>
          <label>
            Tool
            <select value={toolFilter} onChange={(e) => setToolFilter(e.target.value)}>
              {tools.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Lookback (days)
            <input
              type="number"
              min="1"
              max="365"
              value={rangeDays}
              onChange={(e) => setRangeDays(clampRangeDays(e.target.value, 1, 365))}
            />
          </label>
          <label style={{ flex: 1, minWidth: 180 }}>
            Search notes
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'fast', 'tone 440', 'park walk'"
            />
          </label>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <button className="secondary" onClick={exportCSV}>Export CSV</button>
            <button className="secondary danger" onClick={clearAll}>Clear All</button>
          </div>
        </div>
      </div>

      {/* Table */}
      {byDate.length === 0 ? (
        <p className="muted" style={{ marginTop: 12 }}>No entries in this window yet.</p>
      ) : (
        <div style={{ marginTop: 12 }}>
          {byDate.map(([date, items]) => (
            <div key={date} style={{ marginBottom: 12 }}>
              <h3 style={{ marginBottom: 8 }}>{date}</h3>
              <div className="list">
                {items.map((r) => (
                  <div key={r.ts} className="list-row" style={{ gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <div className="muted" style={{ minWidth: 110 }}>
                      {new Date(r.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div style={{ minWidth: 140 }}><strong>{r.tool || "Tool"}</strong></div>
                    <div>Before: <strong>{r.before}</strong></div>
                    <div>After: <strong>{r.after}</strong></div>
                    <div>Δ: <strong>{r.delta}</strong></div>
                    {r.notes && (
                      <div className="muted" title={r.notes} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
                        {r.notes}
                      </div>
                    )}
                    <div style={{ marginLeft: "auto" }}>
                      <button className="secondary danger" onClick={() => removeRow(r.ts)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}