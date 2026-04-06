import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart2,
  Bell,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface BrokerService {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "Available" | "Coming Soon" | "Beta" | "Active";
  iconColor: string;
  iconBg: string;
  details: {
    overview: string;
    features: string[];
    minAmount?: string;
    fees?: string;
    availability?: string;
  };
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
    details: {
      overview:
        "NIPW's Buy & Sell desk gives you access to deep liquidity across 50+ cryptocurrency pairs. All orders are executed at best-available market price with institutional-grade infrastructure.",
      features: [
        "Market and limit orders on 50+ crypto pairs",
        "Zero slippage guarantee on BTC, ETH, SOL major pairs",
        "Instant execution — orders settled in under 200ms",
        "Real-time order book depth and price feeds",
        "Automated tax lot accounting for every trade",
        "24/7 trading desk access with live support",
      ],
      minAmount: "$50 minimum order",
      fees: "0.1% maker / 0.2% taker",
      availability: "Available 24/7 — fully operational",
    },
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: "Portfolio Management",
    description:
      "Automated rebalancing keeps your portfolio aligned with your target allocation. Set your strategy once and let our algorithms handle the rest.",
    status: "Active",
    iconColor: "#2F6BFF",
    iconBg: "rgba(47,107,255,0.12)",
    details: {
      overview:
        "NIPW's Portfolio Management service uses quantitative models developed by veteran Wall Street strategists to dynamically rebalance and grow your holdings with minimal drawdown risk.",
      features: [
        "Automated rebalancing based on your target allocation",
        "Risk-adjusted returns optimised across BTC, ETH, and altcoins",
        "Custom allocation strategies (aggressive, balanced, conservative)",
        "Daily performance reports and P&L attribution",
        "Stop-loss and take-profit automation",
        "Multi-asset diversification across 20+ coins",
      ],
      minAmount: "$1,000 minimum portfolio value",
      fees: "1% annual management fee (billed monthly)",
      availability: "Active — enroll anytime from your dashboard",
    },
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Dollar-Cost Averaging",
    description:
      "Schedule recurring purchases (daily, weekly, monthly) to reduce volatility risk and build wealth systematically with DCA plans starting from $50.",
    status: "Active",
    iconColor: "#2ECC71",
    iconBg: "rgba(46,204,113,0.12)",
    details: {
      overview:
        "Dollar-Cost Averaging (DCA) is the most time-proven strategy for building long-term crypto wealth. NIPW automates the entire process — set your schedule once and we handle every purchase.",
      features: [
        "Recurring buys: daily, weekly, bi-weekly, or monthly",
        "Supports BTC, ETH, SOL, ADA, BNB, and 20+ more coins",
        "Flexible plan amounts starting from $50",
        "Automatic execution — never miss a planned purchase",
        "Full history and cost-basis tracking per DCA plan",
        "Pause or modify any plan at any time with no penalties",
      ],
      minAmount: "$50 per recurring order",
      fees: "Same as standard trading (0.1%–0.2%)",
      availability: "Active — set up your first DCA plan today",
    },
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    title: "Margin Trading",
    description:
      "Access up to 5x leverage on BTC and ETH positions. Amplify your returns with our risk management tools, stop-loss automation, and liquidation protection.",
    status: "Beta",
    iconColor: "#FF6B35",
    iconBg: "rgba(255,107,53,0.12)",
    details: {
      overview:
        "NIPW Margin Trading is currently in Beta for verified institutional clients. Leverage your BTC and ETH positions up to 5x with integrated risk management to protect against liquidation events.",
      features: [
        "Up to 5x leverage on BTC/USD and ETH/USD pairs",
        "Automatic stop-loss and liquidation protection triggers",
        "Margin call alerts via dashboard and SMS",
        "Real-time margin ratio monitoring",
        "Cross-margin and isolated-margin modes",
        "24/7 risk desk support for institutional positions",
      ],
      minAmount: "$5,000 minimum margin deposit",
      fees: "0.05% daily interest on open positions",
      availability: "Beta — contact support to apply for access",
    },
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "OTC Trading",
    description:
      "Large-volume trades executed privately with zero market impact. Our OTC desk handles blocks from $500K+ with competitive spreads and dedicated support.",
    status: "Available",
    iconColor: "#9945FF",
    iconBg: "rgba(153,69,255,0.12)",
    details: {
      overview:
        "NIPW's OTC (Over-The-Counter) desk handles large-block cryptocurrency transactions privately, ensuring zero market impact and competitive pricing for high-net-worth clients and institutions.",
      features: [
        "Block trades starting from $500,000",
        "Zero market impact — all orders settled off-exchange",
        "Dedicated account manager assigned per client",
        "Settlement in BTC, ETH, USDT, or fiat wire",
        "Competitive spreads (typically 0.05%–0.15%)",
        "Same-day settlement for verified accounts",
      ],
      minAmount: "$500,000 minimum block size",
      fees: "0.05%–0.15% depending on volume and asset",
      availability:
        "Available — contact your account manager or call 1 (274) 201-5975",
    },
  },
  {
    icon: <DollarSign className="w-5 h-5" />,
    title: "Crypto Staking",
    description:
      "Earn passive yield on your idle crypto holdings. Stake ETH, ADA, SOL, and more to earn up to 18% APY with flexible and locked staking options.",
    status: "Coming Soon",
    iconColor: "#F39C12",
    iconBg: "rgba(243,156,18,0.12)",
    details: {
      overview:
        "NIPW Crypto Staking will allow you to put your idle digital assets to work, earning competitive annual yields while helping secure the underlying blockchain networks.",
      features: [
        "Stake ETH, ADA, SOL, DOT, MATIC, and more",
        "Flexible staking: unstake anytime with no lock-up",
        "Locked staking options for higher APY (up to 18%)",
        "Automatic compounding of staking rewards",
        "Daily reward distributions to your NIPW account",
        "No minimum amount to start staking",
      ],
      minAmount: "No minimum — stake any amount",
      fees: "10% commission on staking rewards only",
      availability: "Coming soon — click Notify Me to be first to know",
    },
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

function ServiceDetailModal({
  service,
  open,
  onClose,
}: {
  service: BrokerService | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!service) return null;
  const statusStyle = STATUS_STYLES[service.status];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          background: "linear-gradient(135deg, #0F1A2B 0%, #16263E 100%)",
          border: "1px solid #22324A",
          color: "#F2F5FA",
        }}
      >
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: service.iconBg,
                border: `1px solid ${service.iconColor}30`,
                color: service.iconColor,
              }}
            >
              {service.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <DialogTitle
                  className="text-base font-bold"
                  style={{ color: "#F2F5FA" }}
                >
                  {service.title}
                </DialogTitle>
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
              <p className="text-xs" style={{ color: "#A9B4C6" }}>
                NIPW Brokerage Services
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Overview */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            background: "rgba(11,18,32,0.6)",
            border: "1px solid #22324A",
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: "#C8D4E8" }}>
            {service.details.overview}
          </p>
        </div>

        {/* Features */}
        <div className="mb-4">
          <h4
            className="text-xs font-mono uppercase tracking-widest mb-3"
            style={{ color: "#8A95A8" }}
          >
            What's Included
          </h4>
          <ul className="space-y-2">
            {service.details.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: service.iconColor }}
                />
                <span
                  className="text-sm leading-relaxed"
                  style={{ color: "#C8D4E8" }}
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {service.details.minAmount && (
            <div
              className="rounded-lg p-3"
              style={{
                background: "rgba(11,18,32,0.6)",
                border: "1px solid #22324A",
              }}
            >
              <div
                className="text-xs font-mono uppercase tracking-wider mb-1"
                style={{ color: "#8A95A8" }}
              >
                Minimum
              </div>
              <div
                className="text-xs font-semibold"
                style={{ color: "#F2F5FA" }}
              >
                {service.details.minAmount}
              </div>
            </div>
          )}
          {service.details.fees && (
            <div
              className="rounded-lg p-3"
              style={{
                background: "rgba(11,18,32,0.6)",
                border: "1px solid #22324A",
              }}
            >
              <div
                className="text-xs font-mono uppercase tracking-wider mb-1"
                style={{ color: "#8A95A8" }}
              >
                Fees
              </div>
              <div
                className="text-xs font-semibold"
                style={{ color: "#F2F5FA" }}
              >
                {service.details.fees}
              </div>
            </div>
          )}
          {service.details.availability && (
            <div
              className="rounded-lg p-3"
              style={{
                background: "rgba(11,18,32,0.6)",
                border: "1px solid #22324A",
              }}
            >
              <div
                className="text-xs font-mono uppercase tracking-wider mb-1"
                style={{ color: "#8A95A8" }}
              >
                Status
              </div>
              <div
                className="text-xs font-semibold"
                style={{ color: service.iconColor }}
              >
                {service.details.availability}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          {service.status === "Coming Soon" ? (
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
              style={{
                background: "rgba(243,156,18,0.15)",
                border: "1px solid rgba(243,156,18,0.4)",
                color: "#F39C12",
              }}
              onClick={onClose}
            >
              <Bell className="w-4 h-4" />
              Notify Me When Available
            </button>
          ) : (
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${service.iconColor}20 0%, ${service.iconColor}35 100%)`,
                border: `1px solid ${service.iconColor}50`,
                color: service.iconColor,
              }}
              onClick={onClose}
            >
              Get Started
            </button>
          )}
          <button
            type="button"
            className="px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
            style={{
              background: "rgba(34,50,74,0.7)",
              border: "1px solid #22324A",
              color: "#A9B4C6",
            }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BrokerServicesSection() {
  const [selectedService, setSelectedService] = useState<BrokerService | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const handleLearnMore = (service: BrokerService) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  return (
    <>
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
              <button
                key={service.title}
                type="button"
                className="rounded-xl p-5 flex flex-col gap-3 group transition-all duration-200 hover:scale-[1.02] cursor-pointer text-left w-full"
                style={{
                  background:
                    "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
                  border: "1px solid #22324A",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
                onClick={() => handleLearnMore(service)}
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
                    className="text-xs font-semibold transition-colors hover:opacity-80 group-hover:underline"
                    style={{ color: service.iconColor }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLearnMore(service);
                    }}
                    data-ocid={`broker.service.button.${idx + 1}`}
                  >
                    {service.status === "Coming Soon"
                      ? "Notify Me →"
                      : "Learn More →"}
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <ServiceDetailModal
        service={selectedService}
        open={modalOpen}
        onClose={handleClose}
      />
    </>
  );
}
