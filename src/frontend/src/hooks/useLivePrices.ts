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

export function useLivePrices() {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const prevPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    const streams = SYMBOLS.map((s) => `${s.toLowerCase()}@ticker`).join("/");
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    function connect() {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          const d = msg.data;
          if (!d || !d.s) return;
          const sym = d.s as string;
          const price = Number.parseFloat(d.c);
          const changePercent = Number.parseFloat(d.P);
          const prev = prevPrices.current[sym] ?? price;
          const direction: LivePrice["direction"] =
            price > prev ? "up" : price < prev ? "down" : "neutral";
          prevPrices.current[sym] = price;

          setPrices((old) => ({
            ...old,
            [sym]: {
              symbol: sym,
              price,
              changePercent,
              prevPrice: prev,
              direction,
            },
          }));
        } catch {
          // ignore parse errors
        }
      };
    }

    connect();
    return () => {
      wsRef.current?.close();
    };
  }, []);

  // Build display array - put explicit symbol last so it overrides the LivePrice.symbol
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
