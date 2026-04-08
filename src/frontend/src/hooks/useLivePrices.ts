import { useEffect, useRef, useState } from "react";

export interface LivePrice {
  symbol: string;
  price: number;
  changePercent: number;
  prevPrice: number;
  direction: "up" | "down" | "neutral";
}

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];

const COIN_META: Record<string, { name: string; icon: string; color: string }> =
  {
    BTCUSDT: { name: "Bitcoin", icon: "₿", color: "#D4AF37" },
    ETHUSDT: { name: "Ethereum", icon: "Ξ", color: "#2F6BFF" },
    SOLUSDT: { name: "Solana", icon: "◎", color: "#9945FF" },
    BNBUSDT: { name: "BNB", icon: "◈", color: "#F3BA2F" },
  };

const COINGECKO_IDS: Record<string, string> = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  SOLUSDT: "solana",
  BNBUSDT: "binancecoin",
};

type CoinGeckoResponse = Record<
  string,
  { usd: number; usd_24h_change: number }
>;

export function useLivePrices() {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [connected, setConnected] = useState(false);
  const prevPrices = useRef<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const ids = Object.values(COINGECKO_IDS).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

    async function fetchPrices() {
      // Cancel any in-flight request before starting a new one
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch(url, { signal: abortRef.current.signal });
        if (!res.ok) return;
        const data: CoinGeckoResponse = await res.json();

        setPrices((old) => {
          const updated = { ...old };
          for (const [sym, geckoId] of Object.entries(COINGECKO_IDS)) {
            const coin = data[geckoId];
            if (!coin) continue;
            const price = coin.usd;
            const changePercent = coin.usd_24h_change ?? 0;
            const prev = prevPrices.current[sym] ?? price;
            const direction: LivePrice["direction"] =
              price > prev ? "up" : price < prev ? "down" : "neutral";
            prevPrices.current[sym] = price;
            updated[sym] = {
              symbol: sym,
              price,
              changePercent,
              prevPrice: prev,
              direction,
            };
          }
          return updated;
        });
        setConnected(true);
      } catch (err) {
        // Ignore AbortError (unmount cleanup) — keep previous prices on other errors
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    // Defer first fetch by 2.5s so the dashboard renders and becomes interactive first
    const initialDelay = setTimeout(() => {
      fetchPrices();
      intervalRef.current = setInterval(fetchPrices, 30_000);
    }, 2500);

    return () => {
      clearTimeout(initialDelay);
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Build display array
  const priceList = SYMBOLS.map((sym) => {
    const meta = COIN_META[sym];
    const priceData = prices[sym] ?? {
      price: 0,
      changePercent: 0,
      prevPrice: 0,
      direction: "neutral" as const,
    };
    return {
      name: meta.name,
      icon: meta.icon,
      color: meta.color,
      price: priceData.price,
      changePercent: priceData.changePercent,
      prevPrice: priceData.prevPrice,
      direction: priceData.direction,
      symbol: sym.replace("USDT", ""),
      live: !!prices[sym],
    };
  });

  return { priceList, connected };
}
