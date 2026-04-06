import { useLivePrices } from "@/hooks/useLivePrices";

export function LiveTicker() {
  const { priceList, connected } = useLivePrices();

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        background: "rgba(11,18,32,0.98)",
        borderBottom: "1px solid #22324A",
        padding: "6px 0",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2">
        {/* Status dot */}
        <div className="flex items-center gap-1.5 flex-shrink-0 mr-2">
          <div
            className={`w-2 h-2 rounded-full ${connected ? "animate-pulse" : ""}`}
            style={{ background: connected ? "#2ECC71" : "#FFA500" }}
          />
          <span
            className="text-xs font-mono"
            style={{ color: "#A9B4C6", fontSize: 10 }}
          >
            {connected ? "LIVE" : "LOADING"}
          </span>
        </div>

        {/* Prices */}
        <div
          className="flex items-center gap-6 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {priceList.map((coin) => (
            <div
              key={coin.symbol}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <span className="text-xs font-bold" style={{ color: coin.color }}>
                {coin.icon} {coin.symbol}
              </span>
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: "#F2F5FA" }}
              >
                {coin.live && coin.price > 0
                  ? `$${coin.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : "---"}
              </span>
              {coin.live && (
                <span
                  className="text-xs font-mono"
                  style={{
                    color: coin.changePercent >= 0 ? "#2ECC71" : "#E74C3C",
                  }}
                >
                  {coin.changePercent >= 0 ? "+" : ""}
                  {coin.changePercent.toFixed(2)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
