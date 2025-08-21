import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { fetchStockData, StockData } from "./functions/parseData";
// import './App.css';

function App() {
  const [symbol, setSymbol] = useState("");
  const [interval, setInterval] = useState<"1min" | "5min" | "15min" | "30min" | "60min">("5min");
  const [rows, setRows] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [controller, setController] = useState<AbortController | null>(null);

  const onSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const s = e.target.value.toUpperCase();
    setSymbol(s);
    if (!s.trim()) {
      setRows([]);
      setError(null);
    }
  };

  useEffect(() => {
    if (!symbol.trim()) {
      setRows([]);
    }
  }, [symbol]);

  const loadData = async () => {
    const s = symbol.trim().toUpperCase();
    setSymbol(s);

    if(!s){
      setRows([]);
      setError("Enter a valid stock symbol");
      return;
    }

    controller?.abort();
    const ctrl = new AbortController();
    setController(ctrl);
    setLoading(true);
    setError(null);
    setRows([]);

    try {
      const data = await fetchStockData(s, interval, "Compact");
      setRows(data);
    } catch (e: any) {
      if (e.name === "CanceledError" || e.name === "AbortError") {
      } else {
        setError(e.message || "Error fetching stock data");
      }
    } finally {
      setLoading(false);
    }

  }

  const labels = rows.map((r) => r.time);
  const closePrices = rows.map((r) => r.close);

  const chartData = {
    labels,
    datasets: [
      {
        label: `${symbol || "--"} Close Price`,
        data: closePrices,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.3, // smooth curve
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "white" },
      },
      title: {
        display: true,
        text: `${symbol || "--"} (${interval}) Intraday Prices`,
        color: "white",
      },
    },
    scales: {
      x: {
        ticks: { color: "white", maxRotation: 45, minRotation: 45 },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "white" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-[#0a143a] to-[#0c1c54] text-white p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Value-Glance's Stock Price Dashboard</h1>

        <div className="flex gap-2">
          <input
            className="w-full rounded-lg px-3 py-2 text-black"
            value = {symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol (e.g., IBM)"
          />

          <select
            className="rounded-lg px-3 py-2 text-black"
            value = {interval}
            onChange={(e) => setInterval(e.target.value as any)}
          >
            <option>1min</option>
            <option>5min</option>
            <option>15min</option>
            <option>30min</option>
            <option>60min</option>

          </select>
          <button onClick={loadData} className="rounded-lg px-3 py-2 bg-white text-black font-semibold">
            Fetch Data
          </button>

        </div>

        {loading && <div className="text-gray-400">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}

        
        {rows.length > 0 && (
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

      </div>
    </div>
    </>

  );
}

export default App;
