import axios from "axios";

export type StockData = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function parseStockData(data: any, Interval: string): StockData[] {
  const key = `Time Series (${Interval})`;
  const series = data?.[key];
  if (!series) {
    const note = data?.Note || data?.Information || data?.["Error Message"];
    throw new Error(note || "No data found");
  }

  return Object.entries(series).map(([timestamp, v]: [string, any]) => ({
    time: timestamp,
    open: Number(v["1. open"]),
    high: Number(v["2. high"]),
    low: Number(v["3. low"]),
    close: Number(v["4. close"]),
    volume: Number(v["5. volume"]),
  })).sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

export async function fetchStockData(
  symbol: string,
  interval: "1min" | "5min" | "15min" | "30min" | "60min" = "5min",
  outputsize: "Compact" | "Full" = "Compact"
): Promise<StockData[]> {
  const params = {
    function: "TIME_SERIES_INTRADAY",
    symbol,
    interval,
    outputsize: outputsize.toLowerCase(),
    datatype: "json",
    apikey: process.env.REACT_APP_API_KEY,
    _: Date.now(),
  };

  const qs = new URLSearchParams(params as any).toString();
  const url = `https://www.alphavantage.co/query?${qs}`;
  console.log("Fetching data from:", url);

  try{
    const {data} = await axios.get(url);
    return parseStockData(data, interval);
  } catch (err: any) {
    console.error("Error fetching stock data:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      url,
    });
    throw new Error(err || "Failed to fetch stock data");
  }
}