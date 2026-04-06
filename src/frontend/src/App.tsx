import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpRight,
  Award,
  BadgeCheck,
  BarChart2,
  Bitcoin,
  CheckCircle2,
  ChevronDown,
  Copy,
  DollarSign,
  ExternalLink,
  FileText,
  Globe,
  Home,
  Linkedin,
  Loader2,
  Lock,
  LogOut,
  Phone,
  Send,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Twitter,
  Users,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { ActivityStatus, Activity as ActivityType } from "./backend.d";
import { AccountStatement } from "./components/AccountStatement";
import { BrokerServicesSection } from "./components/BrokerServicesSection";
import { CryptoTicker } from "./components/CryptoTicker";
import { DepositConfirmationModal } from "./components/DepositConfirmationModal";
import { LiveTicker } from "./components/LiveTicker";
import { MarketInsightsCard } from "./components/MarketInsightsCard";
import { PaymentModal } from "./components/PaymentModal";
import { ReceiveMoneyModal } from "./components/ReceiveMoneyModal";
import { SendMoneyModal } from "./components/SendMoneyModal";
import { SettingsPanel } from "./components/SettingsPanel";
import { SupportChat } from "./components/SupportChat";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useLivePrices } from "./hooks/useLivePrices";

// ─── Constants & Fallbacks ───────────────────────────────────────────────────

const COMPANY_NAME = "North Investors Profit Wallet";
const COMPANY_SHORT = "NIPW";
const FALLBACK_ADDRESS = "bc1q88ancenmas6e0nfdl9kmvmtk5pq089ewp8wav7";
const FALLBACK_USD = 600000;
const FALLBACK_BTC = 9.4231;
const FALLBACK_INVESTORS = 4812;
const FALLBACK_COMMUNITY = 19789;
const FALLBACK_BTC_PRICE = 63450;
const FALLBACK_ETH_PRICE = 3215;
const PERFORMANCE_DELTA_PCT = 2.457;
const AVAILABLE_BALANCE = 487320.0;

// ─── Mock BTC Chart Data (30 days) ───────────────────────────────────────────

interface ChartPoint {
  date: string;
  btc: number;
  eth: number;
}

function generateChartData(): ChartPoint[] {
  const data: ChartPoint[] = [];
  let btc = 61200;
  let eth = 3100;
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    btc += (Math.random() - 0.46) * 900;
    btc = Math.max(58000, Math.min(68000, btc));
    eth += (Math.random() - 0.46) * 90;
    eth = Math.max(2900, Math.min(3600, eth));
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      btc: Math.round(btc),
      eth: Math.round(eth),
    });
  }
  return data;
}

const CHART_DATA = generateChartData();

// ─── Fallback Activities ─────────────────────────────────────────────────────

const FALLBACK_ACTIVITIES: ActivityType[] = [
  {
    id: 1n,
    activityType: "deposit" as ActivityType["activityType"],
    description: "Bitcoin Deposit — Institutional Account (Christiana)",
    amount: 48750.0,
    status: "completed" as ActivityStatus,
    timestamp: BigInt(Date.now() - 1000 * 60 * 32),
  },
  {
    id: 2n,
    activityType: "interestPayment" as ActivityType["activityType"],
    description: "Monthly Interest Payment — Q2 2025 Yield (Christiana)",
    amount: 14567.8,
    status: "completed" as ActivityStatus,
    timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 6),
  },
  {
    id: 3n,
    activityType: "deposit" as ActivityType["activityType"],
    description: "BTC Acquisition — 0.7820 BTC @ $62,850",
    amount: 49147.7,
    status: "completed" as ActivityStatus,
    timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 4n,
    activityType: "referralBonus" as ActivityType["activityType"],
    description: "Referral Bonus — Elite Tier Activation",
    amount: 2500.0,
    status: "completed" as ActivityStatus,
    timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: 5n,
    activityType: "deposit" as ActivityType["activityType"],
    description: "BTC Acquisition — 1.2500 BTC @ $61,400",
    amount: 76750.0,
    status: "completed" as ActivityStatus,
    timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: 6n,
    activityType: "interestPayment" as ActivityType["activityType"],
    description: "Portfolio Yield Distribution — Annual Compounding",
    amount: 18240.5,
    status: "completed" as ActivityStatus,
    timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 96),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtNum(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function timeAgo(ts: bigint) {
  const ms = Number(ts);
  const diff = Date.now() - ms;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function activityIcon(type: ActivityType["activityType"]) {
  switch (type) {
    case "deposit":
      return <ArrowUpRight className="w-4 h-4" style={{ color: "#2ECC71" }} />;
    case "interestPayment":
      return <DollarSign className="w-4 h-4" style={{ color: "#D4AF37" }} />;
    case "referralBonus":
      return <Users className="w-4 h-4" style={{ color: "#2F6BFF" }} />;
    default:
      return <Activity className="w-4 h-4" style={{ color: "#A9B4C6" }} />;
  }
}

function activityLabel(type: ActivityType["activityType"]) {
  switch (type) {
    case "deposit":
      return "Deposit";
    case "withdrawal":
      return "Withdrawal";
    case "interestPayment":
      return "Interest";
    case "referralBonus":
      return "Referral Bonus";
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Logo / Crest ─────────────────────────────────────────────────────────────

function NIPWCrest({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-display font-bold"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #1a2840 0%, #22324a 100%)",
        border: "2px solid #D4AF37",
        color: "#D4AF37",
        fontSize: size * 0.38,
        boxShadow: "0 0 12px rgba(212,175,55,0.3)",
        flexShrink: 0,
      }}
    >
      ₦
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage({
  onLogin,
  onCreateAccount,
  isLoggingIn,
}: {
  onLogin: () => void;
  onCreateAccount: () => void;
  isLoggingIn: boolean;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0B1220" }}
    >
      {/* Top navigation strip */}
      <header
        className="w-full"
        style={{
          background: "rgba(11,18,32,0.95)",
          borderBottom: "1px solid #22324A",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <NIPWCrest size={38} />
            <div>
              <div
                className="font-display font-bold tracking-wider text-sm leading-tight"
                style={{ color: "#D4AF37" }}
              >
                {COMPANY_NAME.toUpperCase()}
              </div>
              <div
                className="text-xs font-mono tracking-widest leading-tight"
                style={{ color: "#A9B4C6" }}
              >
                ({COMPANY_SHORT})
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="text-sm font-medium"
              style={{ color: "#A9B4C6" }}
              data-ocid="landing.login.button"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Login
            </Button>
            <Button
              size="sm"
              onClick={onCreateAccount}
              disabled={isLoggingIn}
              className="text-sm font-semibold px-4"
              style={{
                background: "linear-gradient(135deg, #1E4FD7 0%, #2F6BFF 100%)",
                color: "#F2F5FA",
                border: "none",
                boxShadow: "0 2px 8px rgba(47,107,255,0.3)",
              }}
              data-ocid="landing.create_account.button"
            >
              Create Account
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        {/* Hero section */}
        <section
          className="relative w-full overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #0F1A2B 0%, #0B1220 100%)",
            borderBottom: "1px solid #22324A",
            minHeight: 500,
          }}
        >
          {/* Background texture */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url('/assets/generated/nipw-og-image.dim_1200x630.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.18,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 40%, rgba(11,18,32,0.85) 100%)",
            }}
          />
          {/* Gold top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{
              background:
                "linear-gradient(90deg, transparent, #D4AF37, transparent)",
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
            <NIPWCrest size={80} />

            <div className="flex items-center gap-2 mt-8 mb-4">
              <div className="w-8 h-px" style={{ background: "#D4AF37" }} />
              <span
                className="text-xs font-mono tracking-widest uppercase font-semibold"
                style={{ color: "#D4AF37" }}
              >
                Institutional Bitcoin Investment
              </span>
              <div className="w-8 h-px" style={{ background: "#D4AF37" }} />
            </div>

            <h1
              className="font-display font-bold leading-tight mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#F2F5FA" }}
            >
              {COMPANY_NAME}
            </h1>
            <p
              className="text-xl font-medium mb-3"
              style={{ color: "#D4AF37" }}
            >
              Secure. Trusted. Growing.
            </p>
            <p
              className="text-base leading-relaxed max-w-2xl mb-10"
              style={{ color: "#A9B4C6" }}
            >
              Join thousands of investors growing their wealth through
              institutional-grade Bitcoin strategies. Your assets, secured with
              multi-signature protocols and managed by experts.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                onClick={onCreateAccount}
                disabled={isLoggingIn}
                className="text-base font-semibold px-8 py-6"
                style={{
                  background:
                    "linear-gradient(135deg, #1E4FD7 0%, #2F6BFF 100%)",
                  color: "#F2F5FA",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(47,107,255,0.4)",
                }}
                data-ocid="hero.create_account.button"
              >
                Create Free Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="text-base font-semibold px-8 py-6"
                style={{
                  background: "transparent",
                  border: "1px solid #D4AF37",
                  color: "#D4AF37",
                }}
                data-ocid="hero.login.button"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Sign In
              </Button>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-8 mt-14 justify-center">
              {[
                {
                  label: "Registered Investors",
                  value: fmtNum(FALLBACK_INVESTORS),
                  color: "#D4AF37",
                },
                {
                  label: "Community Members",
                  value: fmtNum(FALLBACK_COMMUNITY),
                  color: "#2F6BFF",
                },
                { label: "Assets Managed", value: "$2.4B", color: "#2ECC71" },
                {
                  label: "Avg. Annual Return",
                  value: "34.2%",
                  color: "#F2F5FA",
                },
                {
                  label: "Established",
                  value: "Est. 2024",
                  color: "#D4AF37",
                },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div
                    className="text-2xl font-bold font-display mb-1"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </div>
                  <div
                    className="text-xs font-mono"
                    style={{ color: "#8A95A8" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Bank-Grade Security",
                desc: "Multi-signature cold-storage vaults and institutional compliance protocols protect every satoshi.",
                color: "#2ECC71",
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Expert-Managed Growth",
                desc: "Our quantitative models and DCA strategies consistently outperform standard buy-and-hold approaches.",
                color: "#D4AF37",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Thriving Community",
                desc: "Join nearly 20,000 members sharing insights, strategies, and opportunities in our investor network.",
                color: "#2F6BFF",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl p-6"
                style={{
                  background:
                    "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
                  border: "1px solid #22324A",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: `${f.color}20`,
                    border: `1px solid ${f.color}40`,
                    color: f.color,
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  className="text-sm font-bold mb-2"
                  style={{ color: "#F2F5FA" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#A9B4C6" }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ─── Create Account Modal ─────────────────────────────────────────────────────

function CreateAccountModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (name: string, gmail: string) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState("");
  const [gmail, setGmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [gmailError, setGmailError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName("");
      setGmail("");
      setNameError("");
      setGmailError("");
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open]);

  const validate = () => {
    let valid = true;
    if (!name.trim()) {
      setNameError("Full name is required.");
      valid = false;
    } else {
      setNameError("");
    }
    if (!gmail.trim()) {
      setGmailError("Email address is required.");
      valid = false;
    } else if (
      !gmail.trim().includes("@") ||
      gmail.trim().indexOf("@") === 0 ||
      gmail.trim().indexOf("@") === gmail.trim().length - 1
    ) {
      setGmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setGmailError("");
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(name.trim(), gmail.trim().toLowerCase());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          background: "linear-gradient(135deg, #0F1A2B 0%, #16263E 100%)",
          border: "1px solid #22324A",
          color: "#F2F5FA",
        }}
        data-ocid="create_account.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <NIPWCrest size={40} />
            <div>
              <DialogTitle
                className="text-base font-bold"
                style={{ color: "#F2F5FA" }}
              >
                Create Your Account
              </DialogTitle>
              <DialogDescription
                className="text-xs"
                style={{ color: "#A9B4C6" }}
              >
                Join {COMPANY_NAME}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="full-name"
              className="text-xs font-medium"
              style={{ color: "#A9B4C6" }}
            >
              Full Name
            </Label>
            <Input
              id="full-name"
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Christiana Walker"
              autoComplete="name"
              disabled={isSubmitting}
              className="text-sm"
              style={{
                background: "rgba(11,18,32,0.7)",
                border: nameError ? "1px solid #E74C3C" : "1px solid #22324A",
                color: "#F2F5FA",
              }}
              data-ocid="create_account.name.input"
            />
            {nameError ? (
              <p
                className="text-xs"
                style={{ color: "#E74C3C" }}
                data-ocid="create_account.name.error_state"
              >
                {nameError}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="gmail"
              className="text-xs font-medium"
              style={{ color: "#A9B4C6" }}
            >
              Email Address
            </Label>
            <Input
              id="gmail"
              type="email"
              value={gmail}
              onChange={(e) => setGmail(e.target.value)}
              placeholder="yourname@example.com"
              autoComplete="email"
              disabled={isSubmitting}
              className="text-sm"
              style={{
                background: "rgba(11,18,32,0.7)",
                border: gmailError ? "1px solid #E74C3C" : "1px solid #22324A",
                color: "#F2F5FA",
              }}
              data-ocid="create_account.gmail.input"
            />
            {gmailError ? (
              <p
                className="text-xs"
                style={{ color: "#E74C3C" }}
                data-ocid="create_account.gmail.error_state"
              >
                {gmailError}
              </p>
            ) : null}
          </div>

          <div
            className="rounded-lg p-3"
            style={{
              background: "rgba(47,107,255,0.08)",
              border: "1px solid rgba(47,107,255,0.2)",
            }}
          >
            <p className="text-xs leading-relaxed" style={{ color: "#A9B4C6" }}>
              <span style={{ color: "#2F6BFF" }} className="font-semibold">
                Secure Identity:{" "}
              </span>
              Your account is secured with Internet Identity — no passwords
              required. Your Full Name will appear in your personal dashboard.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              style={{
                background: "transparent",
                border: "1px solid #22324A",
                color: "#A9B4C6",
              }}
              data-ocid="create_account.cancel.button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 text-sm font-semibold"
              disabled={isSubmitting}
              style={{
                background: "linear-gradient(135deg, #1E4FD7 0%, #2F6BFF 100%)",
                color: "#F2F5FA",
                border: "none",
                boxShadow: "0 2px 8px rgba(47,107,255,0.3)",
              }}
              data-ocid="create_account.submit_button"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dashboard NavBar ─────────────────────────────────────────────────────────

function NavBar({
  displayName,
  onLogout,
  onFundAccount,
  onViewStatement,
  onSendMoney,
  onReceiveMoney,
  onOpenSettings,
}: {
  displayName: string;
  onLogout: () => void;
  onFundAccount: () => void;
  onViewStatement: () => void;
  onSendMoney: () => void;
  onReceiveMoney: () => void;
  onOpenSettings: () => void;
}) {
  const initials = getInitials(displayName) || "?";
  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(11,18,32,0.95)",
        borderBottom: "1px solid #22324A",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Brand */}
        <div className="flex items-center gap-3" data-ocid="nav.brand.link">
          <NIPWCrest size={38} />
          <div>
            <div
              className="font-display font-bold tracking-wider text-sm leading-tight"
              style={{ color: "#D4AF37" }}
            >
              {COMPANY_NAME.toUpperCase()}
            </div>
            <div
              className="text-xs font-mono tracking-widest leading-tight"
              style={{ color: "#A9B4C6" }}
            >
              ({COMPANY_SHORT})
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {["Home", "Markets", "Portfolio", "Research"].map((link) => (
            <a
              key={link}
              href="/"
              className="text-sm font-medium transition-colors hover:text-white flex items-center gap-1"
              style={{ color: "#A9B4C6" }}
              data-ocid={`nav.${link.toLowerCase()}.link`}
            >
              {link}
            </a>
          ))}
          <button
            onClick={onOpenSettings}
            className="text-sm font-medium transition-colors hover:text-white flex items-center gap-1"
            style={{ color: "#A9B4C6" }}
            type="button"
            data-ocid="nav.settings.link"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </nav>

        {/* User pill + logout */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "#16263E", border: "1px solid #22324A" }}
            data-ocid="nav.user.button"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "#D4AF37", color: "#0B1220" }}
            >
              {initials}
            </div>
            <span
              className="text-sm hidden sm:block max-w-[120px] truncate"
              style={{ color: "#F2F5FA" }}
            >
              {displayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5" style={{ color: "#A9B4C6" }} />
          </div>
          <button
            onClick={onSendMoney}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95 hidden sm:flex"
            style={{
              background: "rgba(34,50,74,0.7)",
              border: "1px solid rgba(212,175,55,0.25)",
              color: "#D4AF37",
            }}
            type="button"
            data-ocid="nav.send_money.button"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
          <button
            onClick={onReceiveMoney}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95 hidden sm:flex"
            style={{
              background: "rgba(34,50,74,0.7)",
              border: "1px solid rgba(46,204,113,0.25)",
              color: "#2ECC71",
            }}
            type="button"
            data-ocid="nav.receive_money.button"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Receive</span>
          </button>
          <button
            onClick={onViewStatement}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95 hidden sm:flex"
            style={{
              background: "rgba(34,50,74,0.7)",
              border: "1px solid rgba(212,175,55,0.2)",
              color: "#A9B4C6",
            }}
            type="button"
            data-ocid="nav.statement.button"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Statement</span>
          </button>
          <button
            onClick={onFundAccount}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)",
              color: "#0B1220",
            }}
            type="button"
            data-ocid="nav.fund_account.primary_button"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fund Account</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95 md:hidden"
            style={{
              background: "rgba(34,50,74,0.7)",
              border: "1px solid rgba(212,175,55,0.2)",
              color: "#D4AF37",
            }}
            type="button"
            data-ocid="nav.settings_mobile.button"
            aria-label="Open Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95"
            style={{
              background: "rgba(34,50,74,0.8)",
              border: "1px solid #22324A",
              color: "#A9B4C6",
            }}
            type="button"
            data-ocid="nav.logout.button"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────

function HeroBanner({
  isLoading,
  registeredInvestors,
  communityMembers,
  displayName,
}: {
  isLoading: boolean;
  registeredInvestors: number;
  communityMembers: number;
  displayName: string;
}) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0F1A2B 0%, #0B1220 100%)",
        borderBottom: "1px solid #22324A",
        minHeight: 320,
      }}
      data-ocid="hero.section"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('/assets/generated/dow-hero-bg.dim_1920x400.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(11,18,32,0.8) 100%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background:
            "linear-gradient(90deg, transparent, #D4AF37, transparent)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-px" style={{ background: "#D4AF37" }} />
            <span
              className="text-xs font-mono tracking-widest uppercase font-semibold"
              style={{ color: "#D4AF37" }}
            >
              Institutional Bitcoin Investment
            </span>
          </div>

          <h1
            className="font-display font-bold leading-tight mb-2"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            <span style={{ color: "#A9B4C6" }}>Welcome back, </span>
            <span
              style={{
                color: "#D4AF37",
                textShadow: "0 0 30px rgba(212,175,55,0.4)",
              }}
            >
              {displayName}
            </span>
          </h1>
          <p
            className="text-base font-medium mb-3"
            style={{ color: "#F2F5FA" }}
          >
            {COMPANY_NAME}
          </p>

          <p
            className="text-sm leading-relaxed max-w-2xl"
            style={{ color: "#8A95A8" }}
          >
            Founded by a coalition of veteran Wall Street strategists and
            blockchain architects, North Investors Profit Wallet was established
            to bridge the gap between institutional-grade asset management and
            the transformative potential of Bitcoin — protecting capital while
            maximizing long-term value in the new digital economy.
          </p>

          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#2ECC71" }}
              />
              <span className="text-xs" style={{ color: "#A9B4C6" }}>
                LIVE ·
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: "#F2F5FA" }}
              >
                {isLoading ? (
                  <Skeleton className="h-4 w-16 inline-block" />
                ) : (
                  `${fmtNum(registeredInvestors)} investors`
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5" style={{ color: "#2F6BFF" }} />
              <span
                className="text-sm font-semibold"
                style={{ color: "#F2F5FA" }}
              >
                {isLoading ? (
                  <Skeleton className="h-4 w-20 inline-block" />
                ) : (
                  `${fmtNum(communityMembers)} community members`
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Account Overview Card ────────────────────────────────────────────────────

function AccountOverviewCard({
  isLoading,
  totalUSD,
  totalBTC,
}: {
  isLoading: boolean;
  totalUSD: number;
  totalBTC: number;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
        border: "1px solid #22324A",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
      data-ocid="account.card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bitcoin className="w-5 h-5" style={{ color: "#D4AF37" }} />
          <span
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: "#A9B4C6" }}
          >
            Total Balance
          </span>
        </div>
        <Badge
          className="text-xs"
          style={{
            background: "rgba(46,204,113,0.15)",
            color: "#2ECC71",
            border: "1px solid rgba(46,204,113,0.3)",
          }}
        >
          ● Active
        </Badge>
      </div>

      {isLoading ? (
        <Skeleton className="h-9 w-40 mb-1" />
      ) : (
        <div
          className="text-3xl font-bold font-display mb-1"
          style={{ color: "#F2F5FA" }}
        >
          {fmtUSD(totalUSD)}
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-4 w-24 mb-4" />
      ) : (
        <div className="text-sm font-mono mb-4" style={{ color: "#D4AF37" }}>
          ₿ {totalBTC.toFixed(4)} BTC
        </div>
      )}

      <div
        className="grid grid-cols-2 gap-3 mb-4"
        style={{
          borderTop: "1px solid #22324A",
          paddingTop: "1rem",
        }}
      >
        <div>
          <div
            className="text-xs font-mono uppercase tracking-wider mb-1"
            style={{ color: "#A9B4C6" }}
          >
            Available Balance
          </div>
          <div className="text-base font-semibold" style={{ color: "#F2F5FA" }}>
            {fmtUSD(AVAILABLE_BALANCE)}
          </div>
        </div>
        <div>
          <div
            className="text-xs font-mono uppercase tracking-wider mb-1"
            style={{ color: "#A9B4C6" }}
          >
            24h Change
          </div>
          <div className="text-base font-semibold" style={{ color: "#2ECC71" }}>
            +{PERFORMANCE_DELTA_PCT}%
          </div>
        </div>
      </div>

      <div
        className="rounded-lg p-3"
        style={{
          background: "rgba(11,18,32,0.5)",
          border: "1px solid #22324A",
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div
              className="text-xs font-mono uppercase tracking-wider mb-1"
              style={{ color: "#A9B4C6" }}
            >
              Registered Investors
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-16 mx-auto" />
            ) : (
              <div
                className="text-lg font-bold font-display"
                style={{ color: "#D4AF37" }}
              >
                {fmtNum(FALLBACK_INVESTORS)}
              </div>
            )}
          </div>
          <div className="text-center">
            <div
              className="text-xs font-mono uppercase tracking-wider mb-1"
              style={{ color: "#A9B4C6" }}
            >
              Community Members
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-20 mx-auto" />
            ) : (
              <div
                className="text-lg font-bold font-display"
                style={{ color: "#2F6BFF" }}
              >
                {fmtNum(FALLBACK_COMMUNITY)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Deposit Card ─────────────────────────────────────────────────────────────

function DepositCard({
  address,
  isLoading,
}: {
  address: string;
  isLoading: boolean;
}) {
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied!", {
        description: "Bitcoin address copied to clipboard.",
      });
    } catch {
      toast.error("Failed to copy address.");
    }
  }, [address]);

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
        border: "1px solid #22324A",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
      data-ocid="deposit.card"
    >
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5" style={{ color: "#D4AF37" }} />
        <span className="text-sm font-semibold" style={{ color: "#F2F5FA" }}>
          Deposit Funds
        </span>
      </div>

      <div
        className="text-xs font-mono uppercase tracking-widest mb-3"
        style={{ color: "#A9B4C6" }}
      >
        Your Bitcoin Deposit Address
      </div>

      {isLoading ? (
        <Skeleton className="h-10 w-full mb-3" />
      ) : (
        <div
          className="rounded-lg p-3 mb-3 font-mono text-xs break-all leading-relaxed"
          style={{
            background: "rgba(11,18,32,0.7)",
            border: "1px solid #22324A",
            color: "#D4AF37",
            wordBreak: "break-all",
          }}
        >
          {address}
        </div>
      )}

      <button
        onClick={handleCopy}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #1E4FD7 0%, #2F6BFF 100%)",
          color: "#F2F5FA",
          boxShadow: "0 2px 8px rgba(47,107,255,0.3)",
        }}
        type="button"
        data-ocid="deposit.copy.button"
      >
        <Copy className="w-4 h-4" />
        Copy Address
      </button>

      <div
        className="mt-4 rounded-lg p-3"
        style={{
          background: "rgba(212,175,55,0.08)",
          border: "1px solid rgba(212,175,55,0.25)",
        }}
      >
        <p className="text-xs leading-relaxed" style={{ color: "#A9B4C6" }}>
          <span style={{ color: "#D4AF37" }} className="font-semibold">
            Investment Notice:{" "}
          </span>
          To activate withdrawal privileges, a 20% security deposit of your
          investment balance is required. Once that final deposit is made, your
          account becomes active and live instantly, and your withdrawal is
          processed immediately.
        </p>
      </div>
    </div>
  );
}

// ─── Withdrawal Policy Card ───────────────────────────────────────────────────

function WithdrawalPolicyCard({
  address,
  onDepositClick,
}: { address: string; onDepositClick: () => void }) {
  const TOTAL_BALANCE = 600000;
  const REQUIRED_DEPOSIT = TOTAL_BALANCE * 0.2; // 20%

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied!", {
        description: "Bitcoin address copied to clipboard.",
      });
    } catch {
      toast.error("Failed to copy address.");
    }
  };

  return (
    <div
      className="mt-8 rounded-xl overflow-hidden"
      style={{
        background: "rgba(212,175,55,0.05)",
        border: "1px solid rgba(212,175,55,0.4)",
        boxShadow: "0 4px 32px rgba(212,175,55,0.08)",
      }}
      data-ocid="withdrawal.policy.card"
    >
      {/* Left accent bar */}
      <div className="flex">
        <div
          className="w-1.5 flex-shrink-0"
          style={{
            background: "linear-gradient(180deg, #D4AF37 0%, #B8962E 100%)",
          }}
        />
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(212,175,55,0.15)",
                border: "1px solid rgba(212,175,55,0.35)",
              }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: "#D4AF37" }} />
            </div>
            <div>
              <h3
                className="font-bold text-base font-display"
                style={{ color: "#D4AF37" }}
              >
                Withdrawal Policy
              </h3>
              <p className="text-xs" style={{ color: "#A9B4C6" }}>
                Required before any withdrawal can be processed
              </p>
            </div>
          </div>

          {/* Policy Message */}
          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: "#C8D4E8" }}
          >
            To initiate any withdrawal, you must first deposit{" "}
            <span className="font-bold" style={{ color: "#D4AF37" }}>
              20% of your total wallet balance
            </span>{" "}
            as a mandatory security requirement per our institutional compliance
            protocol. Once that final deposit is made, your account becomes{" "}
            <span className="font-bold" style={{ color: "#4ade80" }}>
              active and live instantly
            </span>
            , and your full withdrawal will be processed immediately.
          </p>

          {/* Amount display */}
          <div
            className="rounded-xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center gap-4"
            style={{
              background: "rgba(11,18,32,0.6)",
              border: "1px solid rgba(212,175,55,0.2)",
            }}
          >
            <div className="flex-1">
              <div
                className="text-xs uppercase tracking-widest mb-1 font-mono"
                style={{ color: "#8A95A8" }}
              >
                Required Deposit to Unlock Withdrawal
              </div>
              <div
                className="text-2xl font-bold font-mono"
                style={{ color: "#D4AF37" }}
              >
                {fmtUSD(REQUIRED_DEPOSIT)}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#8A95A8" }}>
                20% of total balance ({fmtUSD(TOTAL_BALANCE)})
              </div>
            </div>
            <div
              className="h-px sm:h-12 sm:w-px"
              style={{ background: "rgba(212,175,55,0.2)" }}
            />
            <div className="flex-1">
              <div
                className="text-xs uppercase tracking-widest mb-1 font-mono"
                style={{ color: "#8A95A8" }}
              >
                Your Total Wallet Balance
              </div>
              <div
                className="text-2xl font-bold font-mono"
                style={{ color: "#F2F5FA" }}
              >
                {fmtUSD(TOTAL_BALANCE)}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#8A95A8" }}>
                Bitcoin portfolio value
              </div>
            </div>
          </div>

          {/* Send deposit to this BTC address */}
          <div>
            <div
              className="text-xs uppercase tracking-widest mb-2 font-mono"
              style={{ color: "#8A95A8" }}
            >
              Send Required Deposit To
            </div>
            <div
              className="rounded-lg p-3 font-mono text-xs break-all leading-relaxed mb-2"
              style={{
                background: "rgba(11,18,32,0.7)",
                border: "1px solid rgba(212,175,55,0.25)",
                color: "#D4AF37",
                wordBreak: "break-all",
              }}
            >
              {address}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95"
              style={{
                background: "rgba(212,175,55,0.15)",
                border: "1px solid rgba(212,175,55,0.4)",
                color: "#D4AF37",
              }}
              type="button"
              data-ocid="withdrawal.copy.button"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Bitcoin Address
            </button>
          </div>

          {/* CTA — I've completed my deposit */}
          <div
            className="mt-6 pt-5"
            style={{ borderTop: "1px solid rgba(212,175,55,0.2)" }}
          >
            <button
              onClick={onDepositClick}
              type="button"
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-bold tracking-wide transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)",
                color: "#0B1220",
                boxShadow: "0 4px 24px rgba(212,175,55,0.4)",
              }}
              data-ocid="withdrawal.deposit_confirm.button"
            >
              <CheckCircle2 className="w-5 h-5" />✓ I&apos;ve Completed My
              Deposit — Submit Receipt
            </button>
            <p
              className="text-xs text-center mt-2"
              style={{ color: "#8A95A8" }}
            >
              Upload your transfer receipt for instant account activation review
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Portfolio Performance Card ───────────────────────────────────────────────

const TIME_RANGES = ["7D", "14D", "30D"] as const;
type TimeRange = (typeof TIME_RANGES)[number];

function PortfolioPerformanceCard() {
  const [range, setRange] = useState<TimeRange>("30D");

  const sliceMap: Record<TimeRange, number> = { "7D": 7, "14D": 14, "30D": 30 };
  const displayData = CHART_DATA.slice(-sliceMap[range]);

  const minBTC = Math.min(...displayData.map((d) => d.btc)) - 500;
  const maxBTC = Math.max(...displayData.map((d) => d.btc)) + 500;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
        border: "1px solid #22324A",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
      data-ocid="portfolio.card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5" style={{ color: "#D4AF37" }} />
          <span className="text-sm font-semibold" style={{ color: "#F2F5FA" }}>
            Portfolio Performance
          </span>
        </div>
        <div className="flex gap-1">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-2.5 py-1 rounded text-xs font-mono font-medium transition-all"
              style={{
                background:
                  range === r ? "rgba(212,175,55,0.2)" : "rgba(34,50,74,0.5)",
                color: range === r ? "#D4AF37" : "#A9B4C6",
                border:
                  range === r
                    ? "1px solid rgba(212,175,55,0.4)"
                    : "1px solid transparent",
              }}
              type="button"
              data-ocid={`portfolio.${r.toLowerCase()}.tab`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-0.5 rounded"
            style={{ background: "#D4AF37" }}
          />
          <span className="text-xs font-mono" style={{ color: "#A9B4C6" }}>
            BTC/USD
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-0.5 rounded"
            style={{ background: "#2F6BFF" }}
          />
          <span className="text-xs font-mono" style={{ color: "#A9B4C6" }}>
            ETH/USD
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={displayData}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(34,50,74,0.8)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{
              fill: "#A9B4C6",
              fontSize: 10,
              fontFamily: "JetBrains Mono",
            }}
            axisLine={false}
            tickLine={false}
            interval={Math.floor(displayData.length / 4)}
          />
          <YAxis
            yAxisId="btc"
            domain={[minBTC, maxBTC]}
            tick={{
              fill: "#A9B4C6",
              fontSize: 10,
              fontFamily: "JetBrains Mono",
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <RechartsTooltip
            contentStyle={{
              background: "#16263E",
              border: "1px solid #22324A",
              borderRadius: 8,
              color: "#F2F5FA",
              fontSize: 12,
              fontFamily: "JetBrains Mono",
            }}
            formatter={(val: number, name: string) => [
              fmtUSD(val),
              name === "btc" ? "BTC" : "ETH",
            ]}
          />
          <Line
            yAxisId="btc"
            type="monotone"
            dataKey="btc"
            stroke="#D4AF37"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#D4AF37", stroke: "#0B1220" }}
          />
          <Line
            yAxisId="btc"
            type="monotone"
            dataKey="eth"
            stroke="#2F6BFF"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: "#2F6BFF", stroke: "#0B1220" }}
            strokeDasharray="4 2"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Recent Activity Card ─────────────────────────────────────────────────────

function RecentActivityCard({
  activities,
  isLoading,
}: {
  activities: ActivityType[];
  isLoading: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
        border: "1px solid #22324A",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
      data-ocid="activity.card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" style={{ color: "#D4AF37" }} />
          <span className="text-sm font-semibold" style={{ color: "#F2F5FA" }}>
            Recent Activity
          </span>
        </div>
        <a
          href="/"
          className="text-xs flex items-center gap-1 hover:text-white transition-colors"
          style={{ color: "#A9B4C6" }}
          data-ocid="activity.view_all.link"
        >
          View all <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="activity.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {activities.slice(0, 5).map((act, idx) => (
            <div
              key={act.id.toString()}
              className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-opacity-80"
              style={{
                background: "rgba(11,18,32,0.4)",
                border: "1px solid rgba(34,50,74,0.6)",
              }}
              data-ocid={`activity.item.${idx + 1}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(34,50,74,0.8)" }}
                >
                  {activityIcon(act.activityType)}
                </div>
                <div className="min-w-0">
                  <div
                    className="text-xs font-medium truncate"
                    style={{ color: "#F2F5FA", maxWidth: 180 }}
                  >
                    {act.description}
                  </div>
                  <div className="text-xs" style={{ color: "#A9B4C6" }}>
                    {activityLabel(act.activityType)} · {timeAgo(act.timestamp)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div
                  className="text-xs font-semibold font-mono"
                  style={{ color: "#F2F5FA" }}
                >
                  +{fmtUSD(act.amount)}
                </div>
                <Badge
                  className="text-xs px-1.5 py-0"
                  style={{
                    background:
                      act.status === "completed"
                        ? "rgba(46,204,113,0.15)"
                        : "rgba(255,165,0,0.15)",
                    color: act.status === "completed" ? "#2ECC71" : "#FFA500",
                    border:
                      act.status === "completed"
                        ? "1px solid rgba(46,204,113,0.3)"
                        : "1px solid rgba(255,165,0,0.3)",
                  }}
                >
                  {String(act.status).charAt(0).toUpperCase() +
                    String(act.status).slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Market Watch Card ────────────────────────────────────────────────────────

interface MarketCoin {
  symbol: string;
  name: string;
  price: number;
  change: number;
  icon: string;
  color: string;
}

function buildInitialMarkets(btcPrice: number, ethPrice: number): MarketCoin[] {
  return [
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: btcPrice,
      change: 2.457,
      icon: "₿",
      color: "#D4AF37",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      price: ethPrice,
      change: 1.832,
      icon: "Ξ",
      color: "#2F6BFF",
    },
    {
      symbol: "SOL",
      name: "Solana",
      price: 148.7,
      change: 3.21,
      icon: "◎",
      color: "#9945FF",
    },
    {
      symbol: "BNB",
      name: "BNB",
      price: 572.4,
      change: 0.94,
      icon: "⬡",
      color: "#F0B90B",
    },
    {
      symbol: "XRP",
      name: "XRP",
      price: 0.5821,
      change: -1.23,
      icon: "✕",
      color: "#00AAE4",
    },
    {
      symbol: "ADA",
      name: "Cardano",
      price: 0.4432,
      change: 2.11,
      icon: "₳",
      color: "#0033AD",
    },
  ];
}

function MarketWatchCard({
  btcPrice,
  ethPrice,
  solPrice,
  isLoading,
}: {
  btcPrice: number;
  ethPrice: number;
  solPrice?: number;
  isLoading: boolean;
}) {
  const [markets, setMarkets] = useState<MarketCoin[]>(() =>
    buildInitialMarkets(btcPrice, ethPrice),
  );

  // Sync BTC/ETH/SOL prices when props change
  useEffect(() => {
    setMarkets((prev) =>
      prev.map((m) => {
        if (m.symbol === "BTC") return { ...m, price: btcPrice };
        if (m.symbol === "ETH") return { ...m, price: ethPrice };
        if (m.symbol === "SOL" && solPrice && solPrice > 0)
          return { ...m, price: solPrice };
        return m;
      }),
    );
  }, [btcPrice, ethPrice, solPrice]);

  // Live price fluctuations every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setMarkets((prev) =>
        prev.map((m) => {
          const priceDelta = m.price * (Math.random() * 0.004 - 0.002);
          const changeDelta = Math.random() * 0.2 - 0.1;
          return {
            ...m,
            price: Math.max(0.001, m.price + priceDelta),
            change: Math.max(-15, Math.min(15, m.change + changeDelta)),
          };
        }),
      );
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
        border: "1px solid #22324A",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
      data-ocid="market.card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{ color: "#D4AF37" }} />
          <span className="text-sm font-semibold" style={{ color: "#F2F5FA" }}>
            Market Watch
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(46,204,113,0.1)",
            border: "1px solid rgba(46,204,113,0.25)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#2ECC71" }}
          />
          <span className="text-xs font-mono" style={{ color: "#2ECC71" }}>
            LIVE
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="market.loading_state">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {markets.map((m, idx) => {
            const positive = m.change >= 0;
            return (
              <div
                key={m.symbol}
                className="flex items-center justify-between p-3 rounded-lg transition-colors hover:brightness-110"
                style={{
                  background: "rgba(11,18,32,0.4)",
                  border: "1px solid rgba(34,50,74,0.6)",
                }}
                data-ocid={`market.item.${idx + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      background: `${m.color}20`,
                      border: `1px solid ${m.color}40`,
                      color: m.color,
                    }}
                  >
                    {m.icon}
                  </div>
                  <div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "#F2F5FA" }}
                    >
                      {m.symbol}/USD
                    </div>
                    <div className="text-xs" style={{ color: "#A9B4C6" }}>
                      {m.name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-sm font-semibold font-mono"
                    style={{ color: "#F2F5FA" }}
                  >
                    {fmtUSD(m.price)}
                  </div>
                  <div
                    className="text-xs font-mono"
                    style={{ color: positive ? "#2ECC71" : "#E74C3C" }}
                  >
                    {positive ? "+" : ""}
                    {m.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Strategy Block ───────────────────────────────────────────────────────────

function StrategyBlock() {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
        border: "1px solid rgba(212,175,55,0.25)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(212,175,55,0.05)",
      }}
      data-ocid="strategy.card"
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1 h-5 rounded-full"
          style={{ background: "#D4AF37" }}
        />
        <span
          className="text-sm font-display font-bold"
          style={{ color: "#D4AF37" }}
        >
          The North Investors Strategy:
        </span>
      </div>
      <p className="text-xs leading-relaxed mb-3" style={{ color: "#A9B4C6" }}>
        At North Investors Profit Wallet, we employ a proprietary multi-layered
        Bitcoin accumulation strategy designed to minimize downside risk while
        capturing institutional-grade upside potential. Our cold-storage vaults
        and multi-signature security protocols ensure your assets remain
        protected 24/7/365.
      </p>
      <p className="text-xs leading-relaxed" style={{ color: "#8A95A8" }}>
        Through strategic Dollar-Cost Averaging (DCA) combined with tactical
        entry points identified by our quantitative models, we consistently
        outperform standard buy-and-hold strategies — providing our investors
        with superior risk-adjusted returns across all market cycles. Christiana
        and thousands of members across our global community have seen
        transformative results through disciplined, long-term Bitcoin
        investment.
      </p>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { label: "Avg. Annual Return", value: "34.2%", color: "#2ECC71" },
          { label: "Assets Under Mgmt", value: "$2.4B", color: "#D4AF37" },
          { label: "Years Active", value: "7+", color: "#2F6BFF" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center p-2.5 rounded-lg"
            style={{
              background: "rgba(11,18,32,0.5)",
              border: "1px solid #22324A",
            }}
          >
            <div
              className="text-base font-bold font-display"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div
              className="text-xs mt-0.5 leading-tight"
              style={{ color: "#A9B4C6" }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Generate Account ID ─────────────────────────────────────────────────────

function generateAccountId(name: string) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const hash =
    (Math.abs(
      name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) * 7919,
    ) %
      900000) +
    100000;
  return `NIPW-${initials}-${hash}`;
}

// ─── Live Account Card ────────────────────────────────────────────────────────

function LiveAccountCard({
  displayName,
  depositConfirmed,
}: {
  displayName: string;
  depositConfirmed: boolean;
}) {
  const initials =
    displayName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?";
  const accountId = generateAccountId(displayName);

  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0F1E35 0%, #162638 100%)",
        border: "1px solid rgba(212,175,55,0.4)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.06)",
      }}
      data-ocid="live_account.card"
    >
      {/* Gold shimmer top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background:
            "linear-gradient(90deg, transparent, #D4AF37, transparent)",
        }}
      />

      {/* LIVE Badge + header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5" style={{ color: "#D4AF37" }} />
          <span
            className="text-xs font-mono uppercase tracking-widest font-semibold"
            style={{ color: "#A9B4C6" }}
          >
            Account Overview
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            background: "rgba(46,204,113,0.12)",
            border: "1px solid rgba(46,204,113,0.35)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#2ECC71" }}
          />
          <span
            className="text-xs font-bold font-mono"
            style={{ color: "#2ECC71" }}
          >
            LIVE
          </span>
        </div>
      </div>

      {/* Profile row */}
      <div className="flex items-center gap-4 mb-5">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #1a2840 0%, #22324a 100%)",
            border: "2px solid #D4AF37",
            color: "#D4AF37",
            boxShadow: "0 0 16px rgba(212,175,55,0.25)",
          }}
        >
          {initials}
        </div>
        <div>
          <div
            className="text-xl font-bold font-display"
            style={{ color: "#F2F5FA" }}
          >
            {displayName}
          </div>
          <div className="text-sm font-mono" style={{ color: "#D4AF37" }}>
            {accountId}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          {
            label: "Account Type",
            value: "Institutional",
            color: "#F2F5FA",
          },
          {
            label: "Member Since",
            value: "2024",
            color: "#D4AF37",
          },
          {
            label: "Account Status",
            value: depositConfirmed ? "Active" : "Pending Activation",
            color: depositConfirmed ? "#2ECC71" : "#FFA500",
          },
          {
            label: "Platform",
            value: "NIPW",
            color: "#2F6BFF",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg p-3 text-center"
            style={{
              background: "rgba(11,18,32,0.5)",
              border: "1px solid rgba(34,50,74,0.7)",
            }}
          >
            <div
              className="text-xs font-mono uppercase tracking-wider mb-1"
              style={{ color: "#8A95A8" }}
            >
              {item.label}
            </div>
            <div
              className="text-sm font-semibold"
              style={{ color: item.color }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Activation status banner */}
      {depositConfirmed ? (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
          style={{
            background: "rgba(46,204,113,0.1)",
            border: "1px solid rgba(46,204,113,0.3)",
          }}
          data-ocid="live_account.active.success_state"
        >
          <BadgeCheck
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#2ECC71" }}
          />
          <span className="text-xs font-semibold" style={{ color: "#2ECC71" }}>
            Account Activated — Full withdrawal privileges unlocked
          </span>
        </div>
      ) : (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
          style={{
            background: "rgba(255,165,0,0.08)",
            border: "1px solid rgba(255,165,0,0.3)",
          }}
          data-ocid="live_account.pending.loading_state"
        >
          <Star
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#FFA500" }}
          />
          <span className="text-xs" style={{ color: "#FFA500" }}>
            Pending Activation — Complete 20% deposit to unlock full withdrawal
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  const footerLinks = ["About Us", "Services", "Security", "Legal", "Support"];
  return (
    <footer
      className="mt-12 w-full"
      style={{
        background: "rgba(9,14,26,0.95)",
        borderTop: "1px solid #22324A",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <NIPWCrest size={32} />
            <div>
              <div
                className="font-display font-bold text-xs tracking-wider"
                style={{ color: "#D4AF37" }}
              >
                {COMPANY_SHORT}
              </div>
              <div className="text-xs" style={{ color: "#A9B4C6" }}>
                © 2024–{year} {COMPANY_NAME}. All rights reserved.
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-4">
            {footerLinks.map((link) => (
              <a
                key={link}
                href="/"
                className="text-xs transition-colors hover:text-white"
                style={{ color: "#A9B4C6" }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Contact */}
          <div className="flex items-center gap-3 justify-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(212,175,55,0.12)",
                border: "1px solid rgba(212,175,55,0.3)",
              }}
            >
              <Phone className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} />
            </div>
            <div>
              <div
                className="text-xs font-semibold"
                style={{ color: "#F2F5FA" }}
              >
                Contact Us
              </div>
              <a
                href="tel:+12742015975"
                className="text-xs hover:text-white transition-colors"
                style={{ color: "#D4AF37" }}
              >
                1 (274) 201-5975
              </a>
            </div>
          </div>

          {/* Social + attribution */}
          <div className="flex items-center justify-end gap-4">
            <a
              href="/"
              className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-opacity-100"
              style={{ background: "rgba(34,50,74,0.8)", color: "#A9B4C6" }}
              aria-label="Twitter"
            >
              <Twitter className="w-3.5 h-3.5" />
            </a>
            <a
              href="/"
              className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
              style={{ background: "rgba(34,50,74,0.8)", color: "#A9B4C6" }}
              aria-label="LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            <a
              href="/"
              className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
              style={{ background: "rgba(34,50,74,0.8)", color: "#A9B4C6" }}
              aria-label="Website"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({
  displayName,
  gmail,
  onLogout,
}: {
  displayName: string;
  gmail: string;
  onLogout: () => void;
}) {
  const [showPayment, setShowPayment] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [triggerSupportChat, setTriggerSupportChat] = useState(false);
  const [depositConfirmed, setDepositConfirmed] = useState(false);
  const [currentView, setCurrentView] = useState<"dashboard" | "statement">(
    "dashboard",
  );
  const { actor, isFetching: isActorFetching } = useActor();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["platformStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPlatformStats();
    },
    enabled: !!actor && !isActorFetching,
  });

  const { data: prices, isLoading: pricesLoading } = useQuery({
    queryKey: ["marketPrices"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMarketPrices();
    },
    enabled: !!actor && !isActorFetching,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getAllActivities();
      return result.length > 0 ? result : FALLBACK_ACTIVITIES;
    },
    enabled: !!actor && !isActorFetching,
  });

  const isLoading = isActorFetching || statsLoading;

  const totalUSD = stats?.totalUSDBalance ?? FALLBACK_USD;
  const totalBTC = stats?.totalBTC ?? FALLBACK_BTC;
  const registeredInvestors = stats
    ? Number(stats.registeredInvestors)
    : FALLBACK_INVESTORS;
  const communityMembers = stats
    ? Number(stats.communityMembers)
    : FALLBACK_COMMUNITY;
  const btcAddress = stats?.featuredBitcoinAddress ?? FALLBACK_ADDRESS;
  const { priceList } = useLivePrices();
  const liveBTC = priceList.find((c) => c.symbol === "BTC");
  const liveETH = priceList.find((c) => c.symbol === "ETH");
  const liveSOL = priceList.find((c) => c.symbol === "SOL");
  const btcPrice =
    liveBTC?.live && liveBTC.price > 0
      ? liveBTC.price
      : (prices?.btcPriceUSD ?? FALLBACK_BTC_PRICE);
  const ethPrice =
    liveETH?.live && liveETH.price > 0
      ? liveETH.price
      : (prices?.ethPriceUSD ?? FALLBACK_ETH_PRICE);
  const activityList = activities ?? FALLBACK_ACTIVITIES;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0B1220" }}
    >
      <NavBar
        displayName={displayName}
        onLogout={onLogout}
        onFundAccount={() => setShowPayment(true)}
        onViewStatement={() => setCurrentView("statement")}
        onSendMoney={() => setShowSendModal(true)}
        onReceiveMoney={() => setShowReceiveModal(true)}
        onOpenSettings={() => setShowSettings(true)}
      />
      <LiveTicker />
      <CryptoTicker />

      {currentView === "statement" ? (
        <AccountStatement
          displayName={displayName}
          btcAddress={btcAddress}
          totalUSD={totalUSD}
          totalBTC={totalBTC}
          onBack={() => setCurrentView("dashboard")}
        />
      ) : (
        <>
          <HeroBanner
            isLoading={isLoading}
            registeredInvestors={registeredInvestors}
            communityMembers={communityMembers}
            displayName={displayName}
          />

          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {/* Live Account Card */}
            <div className="mb-6">
              <LiveAccountCard
                displayName={displayName}
                depositConfirmed={depositConfirmed}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="flex flex-col gap-6">
                <StrategyBlock />
                <AccountOverviewCard
                  isLoading={isLoading}
                  totalUSD={totalUSD}
                  totalBTC={totalBTC}
                />
              </div>

              {/* Center Column */}
              <div className="flex flex-col gap-6">
                <DepositCard
                  address={btcAddress}
                  isLoading={isLoading || pricesLoading}
                />
                <PortfolioPerformanceCard />
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6">
                <RecentActivityCard
                  activities={activityList}
                  isLoading={activitiesLoading || isActorFetching}
                />
                <MarketWatchCard
                  btcPrice={btcPrice}
                  ethPrice={ethPrice}
                  solPrice={liveSOL?.price}
                  isLoading={isLoading || pricesLoading}
                />
              </div>
            </div>

            {/* Withdrawal Policy */}
            <WithdrawalPolicyCard
              address={btcAddress}
              onDepositClick={() => setShowDepositModal(true)}
            />

            {/* Platform Overview ticker */}
            <div
              className="mt-8 rounded-xl p-4 flex flex-wrap items-center gap-6"
              style={{
                background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
                border: "1px solid #22324A",
              }}
            >
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4" style={{ color: "#D4AF37" }} />
                <span
                  className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: "#A9B4C6" }}
                >
                  Platform Overview
                </span>
              </div>
              <div className="flex flex-wrap gap-6">
                {[
                  {
                    label: "Total AUM",
                    value: fmtUSD(totalUSD),
                    color: "#D4AF37",
                  },
                  {
                    label: "BTC Holdings",
                    value: `₿ ${totalBTC.toFixed(4)}`,
                    color: "#F2F5FA",
                  },
                  {
                    label: "BTC Price",
                    value: fmtUSD(btcPrice),
                    color: "#2ECC71",
                  },
                  {
                    label: "ETH Price",
                    value: fmtUSD(ethPrice),
                    color: "#2F6BFF",
                  },
                  {
                    label: "Total Investors",
                    value: fmtNum(registeredInvestors),
                    color: "#D4AF37",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "#8A95A8" }}>
                      {item.label}:
                    </span>
                    <span
                      className="text-xs font-semibold font-mono"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Brokerage Services */}
            <BrokerServicesSection />

            {/* Market Insights + Extended context */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MarketInsightsCard />
              <div
                className="rounded-xl p-5 flex flex-col gap-4"
                style={{
                  background:
                    "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
                data-ocid="broker.info.card"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-1 h-5 rounded-full"
                    style={{ background: "#D4AF37" }}
                  />
                  <span
                    className="text-sm font-bold font-display"
                    style={{ color: "#D4AF37" }}
                  >
                    Why Choose NIPW as Your Broker?
                  </span>
                </div>
                {[
                  {
                    title: "Regulated & Compliant",
                    desc: "Fully licensed cryptocurrency broker operating under international financial compliance standards since 2024.",
                    icon: "🛡️",
                  },
                  {
                    title: "Best Execution Policy",
                    desc: "Smart order routing ensures you always get the best available price across 15+ liquidity providers.",
                    icon: "⚡",
                  },
                  {
                    title: "24/7 Expert Support",
                    desc: "Dedicated account managers and our AI-powered support bot are available around the clock. Call us: 1 (274) 201-5975",
                    icon: "💬",
                  },
                  {
                    title: "Zero Hidden Fees",
                    desc: "Transparent fee structure — no surprises. Competitive spreads and clear commission tiers.",
                    icon: "✅",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{
                        background: "rgba(212,175,55,0.1)",
                        border: "1px solid rgba(212,175,55,0.2)",
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div
                        className="text-xs font-bold mb-0.5"
                        style={{ color: "#F2F5FA" }}
                      >
                        {item.title}
                      </div>
                      <div
                        className="text-xs leading-relaxed"
                        style={{ color: "#A9B4C6" }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  className="mt-2 rounded-lg p-3 text-center"
                  style={{
                    background: "rgba(212,175,55,0.06)",
                    border: "1px solid rgba(212,175,55,0.15)",
                  }}
                >
                  <span
                    className="text-xs font-mono"
                    style={{ color: "#8A95A8" }}
                  >
                    North Investors Profit Wallet — Established{" "}
                    <span style={{ color: "#D4AF37" }}>2024</span>
                  </span>
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </>
      )}
      <PaymentModal open={showPayment} onOpenChange={setShowPayment} />
      <SendMoneyModal open={showSendModal} onOpenChange={setShowSendModal} />
      <ReceiveMoneyModal
        open={showReceiveModal}
        onOpenChange={setShowReceiveModal}
        displayName={displayName}
      />
      <DepositConfirmationModal
        isOpen={showDepositModal}
        onClose={() => {
          setShowDepositModal(false);
        }}
        onConfirmed={() => {
          setDepositConfirmed(true);
          setShowDepositModal(false);
          toast.success("Account Activated!", {
            description:
              "Your deposit receipt has been submitted. Your full balance is now under review for withdrawal.",
            duration: 6000,
          });
        }}
        displayName={displayName}
        requiredDeposit={120000}
      />
      <SettingsPanel
        open={showSettings}
        onOpenChange={setShowSettings}
        displayName={displayName}
        gmail={gmail}
        btcAddress={btcAddress}
        onOpenSupportChat={() => setTriggerSupportChat(true)}
      />
      <SupportChat
        triggerOpen={triggerSupportChat}
        onTriggered={() => setTriggerSupportChat(false)}
      />
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  // Whether the user is authenticated via Internet Identity
  const isAuthenticated = !!identity;

  // Profile state
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userGmail, setUserGmail] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Create-account dialog state
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Load profile once actor is ready and user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !actor || isActorFetching || profileLoaded) return;
    let cancelled = false;
    setProfileLoading(true);
    actor
      .getCallerUserProfile()
      .then((profile) => {
        if (cancelled) return;
        if (profile?.displayName) {
          setDisplayName(profile.displayName);
          setUserGmail(profile.gmail ?? null);
        } else {
          // No profile yet — prompt to create one
          setShowCreateAccount(true);
        }
        setProfileLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setProfileLoaded(true);
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, actor, isActorFetching, profileLoaded]);

  // Reset profile state on logout
  const handleLogout = useCallback(() => {
    clear();
    setDisplayName(null);
    setUserGmail(null);
    setProfileLoaded(false);
    setProfileLoading(false);
    setShowCreateAccount(false);
  }, [clear]);

  // Handle create-account form submission
  const handleCreateAccountSubmit = useCallback(
    async (name: string, gmail: string) => {
      if (!actor) return;
      setIsSubmittingProfile(true);
      try {
        await actor.registerUserProfile(name, gmail);
        setDisplayName(name);
        setUserGmail(gmail);
        setProfileLoaded(true);
        setShowCreateAccount(false);
        toast.success(`Welcome to ${COMPANY_NAME}, ${name}!`, {
          description: "Your account has been created successfully.",
        });
      } catch (err) {
        toast.error("Failed to create account.", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      } finally {
        setIsSubmittingProfile(false);
      }
    },
    [actor],
  );

  // Opening create-account from landing page triggers login first,
  // then shows the form after identity is established.
  const handleLandingCreateAccount = useCallback(() => {
    if (!isAuthenticated) {
      // Mark intent so we show the form after login
      setShowCreateAccount(true);
      login();
    } else {
      setShowCreateAccount(true);
    }
  }, [isAuthenticated, login]);

  // ─── Render states ────────────────────────────────────────────────────────

  // Global loading spinner while initializing or loading actor
  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0B1220" }}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#16263E",
              border: "1px solid #22324A",
              color: "#F2F5FA",
            },
          }}
        />
        <div className="flex flex-col items-center gap-4">
          <NIPWCrest size={64} />
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "#D4AF37" }}
          />
          <p className="text-sm font-mono" style={{ color: "#A9B4C6" }}>
            Initializing secure session...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated: show landing page
  if (!isAuthenticated) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#16263E",
              border: "1px solid #22324A",
              color: "#F2F5FA",
            },
          }}
        />
        <LandingPage
          onLogin={login}
          onCreateAccount={handleLandingCreateAccount}
          isLoggingIn={isLoggingIn}
        />
        <SupportChat />
      </>
    );
  }

  // Authenticated but profile still loading
  if (
    isAuthenticated &&
    (profileLoading || (!profileLoaded && !showCreateAccount))
  ) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0B1220" }}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#16263E",
              border: "1px solid #22324A",
              color: "#F2F5FA",
            },
          }}
        />
        <div className="flex flex-col items-center gap-4">
          <NIPWCrest size={64} />
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "#D4AF37" }}
          />
          <p className="text-sm font-mono" style={{ color: "#A9B4C6" }}>
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Authenticated but no profile yet (show create account modal over a loading screen)
  if (isAuthenticated && showCreateAccount && !displayName) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#16263E",
              border: "1px solid #22324A",
              color: "#F2F5FA",
            },
          }}
        />
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "#0B1220" }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url('/assets/generated/dow-hero-bg.dim_1920x400.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.08,
            }}
          />
          <div className="relative flex flex-col items-center gap-4 text-center px-4">
            <NIPWCrest size={72} />
            <h2
              className="text-2xl font-bold font-display"
              style={{ color: "#F2F5FA" }}
            >
              Complete Your Profile
            </h2>
            <p className="text-sm max-w-sm" style={{ color: "#A9B4C6" }}>
              You&apos;re almost there! Enter your name and email to set up your{" "}
              {COMPANY_NAME} account.
            </p>
          </div>
        </div>
        <CreateAccountModal
          open={showCreateAccount}
          onOpenChange={(v) => {
            if (!v && !displayName) {
              // If they dismiss without creating a profile, log them out
              handleLogout();
            } else {
              setShowCreateAccount(v);
            }
          }}
          onSubmit={handleCreateAccountSubmit}
          isSubmitting={isSubmittingProfile}
        />
      </>
    );
  }

  // Fully authenticated with profile
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#16263E",
            border: "1px solid #22324A",
            color: "#F2F5FA",
          },
        }}
      />
      <Dashboard
        displayName={displayName ?? "Investor"}
        gmail={userGmail ?? ""}
        onLogout={handleLogout}
      />
    </>
  );
}
