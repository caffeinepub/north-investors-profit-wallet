import { Badge } from "@/components/ui/badge";
import {
  BarChart2,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

interface BrokerService {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "Available" | "Coming Soon" | "Beta" | "Active";
  iconColor: string;
  iconBg: string;
}

const BROKER_SERVICES: BrokerService[] = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Buy & Sell Crypto",
    description:
      "Execute instant market and limit orders across 50+ crypto pairs with institutional-grade liquidity and zero slippage on major pairs.",
    status: "Active",
    iconColor: "#D4AF37",
    iconBg: "rgba(212,175,55,0.12)",
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: "Portfolio Management",
    description:
      "Automated rebalancing keeps your portfolio aligned with your target allocation. Set your strategy once and let our algorithms handle the rest.",
    status: "Active",
    iconColor: "#2F6BFF",
    iconBg: "rgba(47,107,255,0.12)",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Dollar-Cost Averaging",
    description:
      "Schedule recurring purchases (daily, weekly, monthly) to reduce volatility risk and build wealth systematically with DCA plans starting from $50.",
    status: "Active",
    iconColor: "#2ECC71",
    iconBg: "rgba(46,204,113,0.12)",
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    title: "Margin Trading",
    description:
      "Access up to 5x leverage on BTC and ETH positions. Amplify your returns with our risk management tools, stop-loss automation, and liquidation protection.",
    status: "Beta",
    iconColor: "#FF6B35",
    iconBg: "rgba(255,107,53,0.12)",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "OTC Trading",
    description:
      "Large-volume trades executed privately with zero market impact. Our OTC desk handles blocks from $500K+ with competitive spreads and dedicated support.",
    status: "Available",
    iconColor: "#9945FF",
    iconBg: "rgba(153,69,255,0.12)",
  },
  {
    icon: <DollarSign className="w-5 h-5" />,
    title: "Crypto Staking",
    description:
      "Earn passive yield on your idle crypto holdings. Stake ETH, ADA, SOL, and more to earn up to 18% APY with flexible and locked staking options.",
    status: "Coming Soon",
    iconColor: "#F39C12",
    iconBg: "rgba(243,156,18,0.12)",
  },
];

const STATUS_STYLES: Record<
  BrokerService["status"],
  { bg: string; color: string; border: string }
> = {
  Active: {
    bg: "rgba(46,204,113,0.12)",
    color: "#2ECC71",
    border: "1px solid rgba(46,204,113,0.3)",
  },
  Available: {
    bg: "rgba(47,107,255,0.12)",
    color: "#2F6BFF",
    border: "1px solid rgba(47,107,255,0.3)",
  },
  Beta: {
    bg: "rgba(212,175,55,0.12)",
    color: "#D4AF37",
    border: "1px solid rgba(212,175,55,0.3)",
  },
  "Coming Soon": {
    bg: "rgba(163,163,163,0.1)",
    color: "#A9B4C6",
    border: "1px solid rgba(163,163,163,0.2)",
  },
};

export function BrokerServicesSection() {
  return (
    <section className="mt-8" data-ocid="broker.section">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div
            className="w-1 h-6 rounded-full"
            style={{
              background: "linear-gradient(180deg, #D4AF37 0%, #B8972A 100%)",
            }}
          />
          <h2
            className="text-lg font-bold font-display"
            style={{ color: "#F2F5FA" }}
          >
            Brokerage Services
          </h2>
        </div>
        <div className="flex-1 h-px" style={{ background: "#22324A" }} />
        <Badge
          className="text-xs font-mono"
          style={{
            background: "rgba(212,175,55,0.12)",
            color: "#D4AF37",
            border: "1px solid rgba(212,175,55,0.3)",
          }}
        >
          NIPW Broker
        </Badge>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BROKER_SERVICES.map((service, idx) => {
          const statusStyle = STATUS_STYLES[service.status];
          return (
            <div
              key={service.title}
              className="rounded-xl p-5 flex flex-col gap-3 group transition-all duration-200 hover:scale-[1.02] cursor-default"
              style={{
                background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
                border: "1px solid #22324A",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
              }}
              data-ocid={`broker.service.item.${idx + 1}`}
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: service.iconBg,
                    border: `1px solid ${service.iconColor}30`,
                    color: service.iconColor,
                  }}
                >
                  {service.icon}
                </div>
                <Badge
                  className="text-xs"
                  style={{
                    background: statusStyle.bg,
                    color: statusStyle.color,
                    border: statusStyle.border,
                  }}
                >
                  {service.status}
                </Badge>
              </div>

              <div>
                <h3
                  className="text-sm font-bold mb-1.5"
                  style={{ color: "#F2F5FA" }}
                >
                  {service.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#A9B4C6" }}
                >
                  {service.description}
                </p>
              </div>

              <div
                className="mt-auto pt-3"
                style={{ borderTop: "1px solid rgba(34,50,74,0.7)" }}
              >
                <button
                  type="button"
                  className="text-xs font-semibold transition-colors hover:opacity-80"
                  style={{ color: service.iconColor }}
                  data-ocid={`broker.service.button.${idx + 1}`}
                >
                  {service.status === "Coming Soon"
                    ? "Notify Me →"
                    : "Learn More →"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
