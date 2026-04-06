import { useEffect, useRef, useState } from "react";

interface TickerCoin {
  symbol: string;
  name: string;
  price: number;
  change: number;
  icon: string;
}

const INITIAL_COINS: TickerCoin[] = [
  { symbol: "BTC", name: "Bitcoin", price: 63450, change: 2.457, icon: "₿" },
  { symbol: "ETH", name: "Ethereum", price: 3215, change: 1.832, icon: "Ξ" },
  { symbol: "SOL", name: "Solana", price: 148.7, change: 3.21, icon: "◎" },
  { symbol: "BNB", name: "BNB", price: 572.4, change: 0.94, icon: "⬡" },
  { symbol: "XRP", name: "XRP", price: 0.5821, change: -1.23, icon: "✕" },
  { symbol: "ADA", name: "Cardano", price: 0.4432, change: 2.11, icon: "₳" },
  { symbol: "DOGE", name: "Dogecoin", price: 0.1487, change: 4.55, icon: "Ð" },
  { symbol: "AVAX", name: "Avalanche", price: 34.82, change: -0.77, icon: "△" },
];

function fluctuate(price: number): number {
  const delta = price * (Math.random() * 0.004 - 0.002);
  return Math.max(0.001, price + delta);
}

function fluctuateChange(change: number): number {
  const delta = Math.random() * 0.2 - 0.1;
  const next = change + delta;
  return Math.max(-15, Math.min(15, next));
}

function fmtTickerPrice(price: number): string {
  if (price >= 1000)
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  if (price >= 1)
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(4)}`;
}

export function CryptoTicker() {
  const [coins, setCoins] = useState<TickerCoin[]>(INITIAL_COINS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCoins((prev) =>
        prev.map((c) => ({
          ...c,
          price: fluctuate(c.price),
          change: fluctuateChange(c.change),
        })),
      );
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Duplicate coins for seamless looping
  const items = [...coins, ...coins];

  return (
    <div
      className="crypto-ticker-bar w-full overflow-hidden"
      style={{
        background: "#0A1628",
        borderBottom: "1px solid #1E3050",
        height: 36,
        display: "flex",
        alignItems: "center",
      }}
      aria-label="Live cryptocurrency prices"
    >
      <div className="crypto-ticker-scroll flex items-center gap-0">
        {items.map((coin, idx) => {
          const positive = coin.change >= 0;
          return (
            <div
              key={`${coin.symbol}-${idx}`}
              className="flex items-center gap-1.5 px-5 flex-shrink-0"
              style={{
                borderRight: "1px solid rgba(34,50,74,0.6)",
              }}
            >
              <span
                className="text-xs font-bold font-mono"
                style={{ color: "#D4AF37", minWidth: 16, textAlign: "center" }}
              >
                {coin.icon}
              </span>
              <span
                className="text-xs font-semibold font-mono tracking-wide"
                style={{ color: "#F2F5FA" }}
              >
                {coin.symbol}
              </span>
              <span className="text-xs font-mono" style={{ color: "#A9B4C6" }}>
                {fmtTickerPrice(coin.price)}
              </span>
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: positive ? "#2ECC71" : "#E74C3C" }}
              >
                {positive ? "+" : ""}
                {coin.change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
