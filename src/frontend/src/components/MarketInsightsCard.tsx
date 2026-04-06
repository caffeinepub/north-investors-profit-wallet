import { ExternalLink, Newspaper } from "lucide-react";

interface NewsItem {
  headline: string;
  source: string;
  date: string;
  category: string;
  categoryColor: string;
}

const NEWS_ITEMS: NewsItem[] = [
  {
    headline:
      "Bitcoin surpasses $65,000 amid record institutional demand as BlackRock ETF volumes reach all-time highs",
    source: "CoinDesk",
    date: "Apr 4, 2026",
    category: "Bitcoin",
    categoryColor: "#D4AF37",
  },
  {
    headline:
      "Ethereum Layer-2 adoption hits record highs — Base and Arbitrum now process more transactions than mainnet",
    source: "The Block",
    date: "Apr 3, 2026",
    category: "Ethereum",
    categoryColor: "#2F6BFF",
  },
  {
    headline:
      "Solana DeFi TVL tops $12 billion as institutional investors rotate capital into high-performance blockchains",
    source: "CryptoSlate",
    date: "Apr 2, 2026",
    category: "DeFi",
    categoryColor: "#9945FF",
  },
  {
    headline:
      "Global crypto market cap approaches $3 trillion — analysts project continued bull run through Q2 2026",
    source: "Bloomberg Crypto",
    date: "Apr 1, 2026",
    category: "Markets",
    categoryColor: "#2ECC71",
  },
];

export function MarketInsightsCard() {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
        border: "1px solid #22324A",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
      data-ocid="insights.card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5" style={{ color: "#D4AF37" }} />
          <span className="text-sm font-semibold" style={{ color: "#F2F5FA" }}>
            Market Insights
          </span>
        </div>
        <span className="text-xs font-mono" style={{ color: "#A9B4C6" }}>
          Latest Headlines
        </span>
      </div>

      <div className="space-y-3">
        {NEWS_ITEMS.map((item, idx) => (
          <div
            key={item.headline}
            className="flex gap-3 p-3 rounded-lg transition-all hover:brightness-110 cursor-pointer"
            style={{
              background: "rgba(11,18,32,0.4)",
              border: "1px solid rgba(34,50,74,0.6)",
            }}
            data-ocid={`insights.item.${idx + 1}`}
          >
            <div
              className="w-1.5 flex-shrink-0 rounded-full mt-1"
              style={{
                background: item.categoryColor,
                minHeight: 40,
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: `${item.categoryColor}18`,
                    color: item.categoryColor,
                    border: `1px solid ${item.categoryColor}30`,
                  }}
                >
                  {item.category}
                </span>
                <span
                  className="text-xs font-mono"
                  style={{ color: "#8A95A8" }}
                >
                  {item.date}
                </span>
              </div>
              <p
                className="text-xs leading-relaxed font-medium"
                style={{ color: "#F2F5FA" }}
              >
                {item.headline}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <ExternalLink
                  className="w-3 h-3 flex-shrink-0"
                  style={{ color: "#A9B4C6" }}
                />
                <span className="text-xs" style={{ color: "#A9B4C6" }}>
                  {item.source}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
