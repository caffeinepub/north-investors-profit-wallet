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
import { useActor } from "@caffeineai/core-infrastructure";
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
  ShieldCheck,
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
import { createActor } from "./backend";
import type {
  ActivityStatus as BackendActivityStatus,
  ActivityType as BackendActivityType,
} from "./backend";
import { AccountStatement } from "./components/AccountStatement";
import { AdminPanel } from "./components/AdminPanel";
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
import type { TransactionDetail } from "./components/TransactionDetailModal";
import { TransactionDetailModal } from "./components/TransactionDetailModal";
import { TransactionHistoryModal } from "./components/TransactionHistoryModal";
import { useLivePrices } from "./hooks/useLivePrices";

// ─── Local Types ─────────────────────────────────────────────────────────────

// ActivityType is an alias for TransactionDetail to enable full detail support
type ActivityType = TransactionDetail;

// ─── Fire-and-forget activity logger ─────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fireLog(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actor: any,
  gmail: string,
  username: string,
  actType: BackendActivityType,
  amount: number | null,
  description: string,
  reference: string | null,
  status: BackendActivityStatus,
) {
  if (!actor) return;
  try {
    actor
      .logUserAction(
        gmail,
        username,
        actType,
        amount,
        description,
        reference,
        status,
      )
      .catch(() => {});
  } catch {
    // fire-and-forget: never block UI
  }
}
// ─── Constants & Fallbacks ───────────────────────────────────────────────────

const COMPANY_NAME = "North Investors Profit Wallet";
const COMPANY_SHORT = "NIPW";
const COMPANY_ACCOUNT_NUMBER = "44990623844";
const COMPANY_BANK_NAME = "NORTHBANKING";
const FALLBACK_ADDRESS = "bc1q88ancenmas6e0nfdl9kmvmtk5pq089ewp8wav7";
const FALLBACK_USD = 6000000;
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
    id: "1",
    activityType: "deposit",
    description: "Initial Institutional Deposit — Christiana Portfolio",
    amount: 2100000.0,
    currency: "BTC",
    status: "completed",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 540,
    btcAmount: "33.8920 BTC",
    referenceId: "TXN-2024-001",
    fromAccount: "NORTHBANKING — Account #44990623844",
    toAccount: "Christiana — NIPW Portfolio",
    txHash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
  },
  {
    id: "2",
    activityType: "deposit",
    description: "BTC Acquisition — 7.2140 BTC @ $61,350",
    amount: 442741.4,
    currency: "BTC",
    status: "completed",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 470,
    btcAmount: "7.2140 BTC",
    referenceId: "TXN-2024-002",
    fromAccount: "NORTHBANKING — Account #44990623844",
    toAccount: "Christiana — NIPW Portfolio",
    txHash: "b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678",
  },
  {
    id: "3",
    activityType: "deposit",
    description: "BTC Acquisition — 5.8210 BTC @ $63,720",
    amount: 370991.52,
    currency: "BTC",
    status: "completed",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 400,
    btcAmount: "5.8210 BTC",
    referenceId: "TXN-2024-003",
    fromAccount: "NORTHBANKING — Account #44990623844",
    toAccount: "Christiana — NIPW Portfolio",
    txHash: "c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: "4",
    activityType: "interestPayment",
    description: "Monthly Interest Payment — Q3 2024 Yield",
    amount: 42000.0,
    currency: "BTC",
    status: "completed",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 360,
    btcAmount: "0.6627 BTC",
    referenceId: "TXN-2024-004",
    fromAccount: "NORTHBANKING — Account #44990623844",
    toAccount: "Christiana — NIPW Portfolio",
    txHash: "d4e5f6789012345678901234567890abcdef1234567890abcdef12345678901a",
  },
  {
    id: "5",
    activityType: "deposit",
    description: "BTC Acquisition — 6.9400 BTC @ $65,100",
    amount: 451794.0,
    currency: "BTC",
    status: "completed",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 300,
    btcAmount: "6.9400 BTC",
    referenceId: "TXN-2024-005",
    fromAccount: "NORTHBANKING — Account #44990623844",
    toAccount: "Christiana — NIPW Portfolio",
    txHash: "e5f6789012345678901234567890abcdef1234567890abcdef12345678901ab2",
  },
  {
    id: "6",
    activityType: "referralBonus",
    description: "Referral Bonus — Elite Tier Activation",
    amount: 15000.0,
    currency: "BTC",
    status: "completed",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 265,
    btcAmount: "0.2302 BTC",
    referenceId: "TXN-2024-006",
    fromAccount: "NORTHBANKING — Account #44990623844",
    toAccount: "Christiana — NIPW Portfolio",
    txHash: "f6789012345678901234567890abcdef1234567890abcdef12345678901ab2c3",
  },
  {
    id: "7",
    activityType: "interestPayment",
    description: "Monthly Interest Payment — Q4 2024 Yield",
    amount: 56000.0,
    currency: "BTC",
    status: "completed",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 220,
    btcAmount: "0.8842 BTC",
    referenceId: "TXN-2024-007",
    fromAccount: "NORTHBANKING — Account #44990623844",
    toAccount: "Christiana — NIPW Portfolio",
    txHash: "789012345678901234567890abcdef1234567890abcdef12345678901ab2c3d4",
  },
  {
    id: "8",
    activityType: "deposit",
    description: "BTC Acquisition — 7.6820 BTC @ $68,400",
    amount: 525448.8,
    currency: "BTC",
    status: "completed",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 170,
    btcAmount: "7.6820 BTC",
    referenceId: "TXN-2025-001",
    fromAccount: "NORTHBANKING — Account #44990623844",
    toAccount: "Christiana — NIPW Portfolio",
    txHash: "8901234567890abcdef1234567890abcdef12345678901ab2c3d4e5f6789012",
  },
  {
    id: "9",
    activityType: "interestPayment",
    description: "Portfolio Yield Distribution — Annual Compounding",
    amount: 78000.0,
    currency: "BTC",
    status: "completed",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 120,
    btcAmount: "1.1931 BTC",
    referenceId: "TXN-2025-002",
    fromAccount: "NORTHBANKING — Account #44990623844",
    toAccount: "Christiana — NIPW Portfolio",
    txHash: "901234567890abcdef1234567890abcdef12345678901ab2c3d4e5f678901234",
  },
  {
    id: "10",
    activityType: "deposit",
    description: "BTC Acquisition — 5.1200 BTC @ $72,150",
    amount: 369408.0,
    currency: "BTC",
    status: "completed",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 72,
    btcAmount: "5.1200 BTC",
    referenceId: "TXN-2025-003",
    fromAccount: "NORTHBANKING — Account #44990623844",
    toAccount: "Christiana — NIPW Portfolio",
    txHash: "01234567890abcdef1234567890abcdef12345678901ab2c3d4e5f6789012345",
  },
  {
    id: "11",
    activityType: "interestPayment",
    description: "Monthly Interest Payment — Q2 2025 Yield",
    amount: 48750.0,
    currency: "BTC",
    status: "completed",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 30,
    btcAmount: "0.7682 BTC",
    referenceId: "TXN-2025-004",
    fromAccount: "NORTHBANKING — Account #44990623844",
    toAccount: "Christiana — NIPW Portfolio",
    txHash: "1234567890abcdef1234567890abcdef12345678901ab2c3d4e5f67890123456",
  },
  {
    id: "12",
    activityType: "deposit",
    description: "BTC Acquisition — 0.7820 BTC @ $62,850",
    amount: 49147.7,
    currency: "BTC",
    status: "completed",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
    btcAmount: "0.7820 BTC",
    referenceId: "TXN-2025-005",
    fromAccount: "NORTHBANKING — Account #44990623844",
    toAccount: "Christiana — NIPW Portfolio",
    txHash: "234567890abcdef1234567890abcdef12345678901ab2c3d4e5f6789012345678",
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

function timeAgo(ts: number) {
  const ms = ts;
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
      return (
        <DollarSign className="w-4 h-4" style={{ color: "var(--nipw-gold)" }} />
      );
    case "referralBonus":
      return <Users className="w-4 h-4" style={{ color: "#2F6BFF" }} />;
    default:
      return (
        <Activity
          className="w-4 h-4"
          style={{ color: "var(--nipw-text-secondary)" }}
        />
      );
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
        background: "var(--nipw-surface-alt)",
        border: "2px solid var(--nipw-gold)",
        color: "var(--nipw-gold)",
        fontSize: size * 0.38,
        boxShadow: "0 0 12px rgba(212,175,55,0.3)",
        flexShrink: 0,
      }}
    >
      ₦
    </div>
  );
}

// ─── Investor Key Gate ────────────────────────────────────────────────────────

const INVESTOR_KEY = "NWAU6984C";
const KEY_OPTIONS = [
  { label: "A", value: "NWAU1234X" },
  { label: "B", value: "NWAU7721B" },
  { label: "C", value: "NIPW8800K" },
  { label: "D", value: "NWAU0000Z" },
];

function InvestorKeyGate({ onVerified }: { onVerified: () => void }) {
  const [inputVal, setInputVal] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "locked">(
    "idle",
  );
  const [attempts, setAttempts] = useState(0);
  const [lockCountdown, setLockCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startLockTimer() {
    setLockCountdown(30);
    timerRef.current = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setStatus("idle");
          setAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleOptionSelect(val: string) {
    setSelected(val);
    setInputVal(val);
    setStatus("idle");
  }

  function handleVerify() {
    if (status === "locked") return;
    const key = inputVal.trim().toUpperCase();
    if (key === INVESTOR_KEY) {
      setStatus("success");
      localStorage.setItem("nipw-investor-key", "verified");
      setTimeout(() => onVerified(), 1600);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setStatus("locked");
        startLockTimer();
      } else {
        setStatus("error");
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #050e1a 0%, #0a1628 50%, #050e1a 100%)",
      }}
      data-ocid="investor-key-gate"
    >
      {/* Subtle radial glow behind card */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(240,185,11,0.06) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0d1f38 0%, #081526 100%)",
          border: "1px solid rgba(240,185,11,0.35)",
          boxShadow:
            "0 0 60px rgba(240,185,11,0.12), 0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(240,185,11,0.15)",
        }}
      >
        {/* Top gold accent bar */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, #F0B90B 30%, #FFD700 50%, #F0B90B 70%, transparent)",
          }}
        />

        <div className="px-8 py-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            {/* Shield icon with gold glow */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(240,185,11,0.15) 0%, rgba(240,185,11,0.05) 100%)",
                border: "1.5px solid rgba(240,185,11,0.5)",
                boxShadow: "0 0 24px rgba(240,185,11,0.2)",
              }}
            >
              <Shield className="w-8 h-8" style={{ color: "#F0B90B" }} />
            </div>

            {/* NIPW wordmark */}
            <div className="flex items-center gap-2 mb-3">
              <NIPWCrest size={28} />
              <div>
                <div
                  className="font-display font-bold text-xs tracking-widest leading-tight"
                  style={{ color: "#F0B90B" }}
                >
                  NORTH INVESTORS PROFIT WALLET
                </div>
                <div
                  className="text-xs font-mono tracking-wider"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  (NIPW) — EST. 2024
                </div>
              </div>
            </div>

            <h1
              className="text-xl font-display font-bold mb-2 tracking-wide"
              style={{ color: "#ffffff" }}
            >
              Investor Key Required
            </h1>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Access to North Investors Profit Wallet is restricted to verified
              investors. Please enter your{" "}
              <span style={{ color: "#F0B90B" }}>Investor Key</span> to proceed.
            </p>
          </div>

          {/* Success state */}
          {status === "success" && (
            <div
              className="flex flex-col items-center gap-3 py-6 rounded-xl"
              style={{
                background: "rgba(46,204,113,0.08)",
                border: "1px solid rgba(46,204,113,0.3)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(46,204,113,0.15)",
                  border: "2px solid #2ECC71",
                }}
              >
                <CheckCircle2
                  className="w-6 h-6"
                  style={{ color: "#2ECC71" }}
                />
              </div>
              <div
                className="font-semibold text-sm tracking-wide"
                style={{ color: "#2ECC71" }}
              >
                Correct Investor Key — Access Granted
              </div>
              <div
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Redirecting to platform…
              </div>
            </div>
          )}

          {/* Input form */}
          {status !== "success" && (
            <>
              {/* Multiple choice options */}
              <div className="mb-5">
                <div
                  className="text-xs font-semibold tracking-widest mb-3 uppercase"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Select or type your investor key
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {KEY_OPTIONS.map((opt) => {
                    const isSelected = selected === opt.value;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleOptionSelect(opt.value)}
                        className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-150"
                        style={{
                          background: isSelected
                            ? "rgba(240,185,11,0.12)"
                            : "rgba(255,255,255,0.04)",
                          border: isSelected
                            ? "1.5px solid rgba(240,185,11,0.6)"
                            : "1.5px solid rgba(255,255,255,0.1)",
                          boxShadow: isSelected
                            ? "0 0 12px rgba(240,185,11,0.1)"
                            : "none",
                        }}
                        data-ocid={`key-option-${opt.label.toLowerCase()}`}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: isSelected
                              ? "#F0B90B"
                              : "rgba(255,255,255,0.08)",
                            color: isSelected
                              ? "#050e1a"
                              : "rgba(255,255,255,0.5)",
                          }}
                        >
                          {opt.label}
                        </div>
                        <span
                          className="font-mono text-xs tracking-wider font-medium"
                          style={{
                            color: isSelected
                              ? "#F0B90B"
                              : "rgba(255,255,255,0.65)",
                          }}
                        >
                          {opt.value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text input */}
              <div className="mb-4">
                <Label
                  htmlFor="investor-key-input"
                  className="text-xs font-semibold tracking-widest uppercase mb-1.5 block"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Enter Investor Key
                </Label>
                <Input
                  id="investor-key-input"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value.toUpperCase());
                    setSelected(null);
                    if (status === "error") setStatus("idle");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerify();
                  }}
                  placeholder="Enter your investor key"
                  disabled={status === "locked"}
                  className="font-mono tracking-widest text-sm h-11"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border:
                      status === "error"
                        ? "1.5px solid rgba(231,76,60,0.6)"
                        : "1.5px solid rgba(255,255,255,0.15)",
                    color: "#ffffff",
                  }}
                  data-ocid="investor-key-input"
                />
              </div>

              {/* Error message */}
              {status === "error" && (
                <div
                  className="flex items-center gap-2 text-sm mb-4 px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(231,76,60,0.1)",
                    border: "1px solid rgba(231,76,60,0.3)",
                    color: "#e74c3c",
                  }}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Incorrect Investor Key. Please try again.</span>
                </div>
              )}

              {/* Locked message */}
              {status === "locked" && (
                <div
                  className="flex items-start gap-2 text-sm mb-4 px-3 py-3 rounded-lg"
                  style={{
                    background: "rgba(231,76,60,0.1)",
                    border: "1px solid rgba(231,76,60,0.3)",
                    color: "#e74c3c",
                  }}
                >
                  <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-0.5">
                      Too many failed attempts
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "rgba(231,76,60,0.8)" }}
                    >
                      Please contact support at{" "}
                      <span className="font-mono">1 (274) 201-5975</span>. Form
                      unlocks in{" "}
                      <span className="font-semibold">{lockCountdown}s</span>.
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="button"
                onClick={handleVerify}
                disabled={status === "locked" || !inputVal.trim()}
                className="w-full h-11 rounded-lg font-display font-bold text-sm tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background:
                    status === "locked" || !inputVal.trim()
                      ? "rgba(240,185,11,0.25)"
                      : "linear-gradient(135deg, #F0B90B 0%, #FFD700 50%, #F0B90B 100%)",
                  color:
                    status === "locked" || !inputVal.trim()
                      ? "rgba(255,255,255,0.3)"
                      : "#050e1a",
                  cursor:
                    status === "locked" || !inputVal.trim()
                      ? "not-allowed"
                      : "pointer",
                  boxShadow:
                    status === "locked" || !inputVal.trim()
                      ? "none"
                      : "0 4px 24px rgba(240,185,11,0.3)",
                }}
                data-ocid="verify-key-button"
              >
                <Shield className="w-4 h-4" />
                Verify Key
              </button>

              {/* Bottom hint */}
              <p
                className="text-center text-xs mt-4"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                This platform is restricted to verified investors only.
                <br />
                Your investor key was provided at account enrollment.
              </p>
            </>
          )}
        </div>

        {/* Bottom gold accent bar */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(240,185,11,0.3) 50%, transparent)",
          }}
        />
        <div
          className="px-8 py-3 flex items-center justify-center gap-1"
          style={{ background: "rgba(0,0,0,0.2)" }}
        >
          <Lock
            className="w-3 h-3"
            style={{ color: "rgba(255,255,255,0.25)" }}
          />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            Secured by North Investors Profit Wallet — 256-bit encrypted
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage({
  onOpenLoginModal,
  onCreateAccount,
  isLoggingIn,
}: {
  onOpenLoginModal: () => void;
  onCreateAccount: () => void;
  isLoggingIn: boolean;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--nipw-bg)" }}
    >
      {/* Top navigation strip */}
      <header
        className="w-full"
        style={{
          background: "var(--nipw-nav-bg)",
          borderBottom: "1px solid var(--nipw-border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <NIPWCrest size={38} />
            <div>
              <div
                className="font-display font-bold tracking-wider text-sm leading-tight"
                style={{ color: "var(--nipw-gold)" }}
              >
                {COMPANY_NAME.toUpperCase()}
              </div>
              <div
                className="text-xs font-mono tracking-widest leading-tight"
                style={{ color: "var(--nipw-text-secondary)" }}
              >
                ({COMPANY_SHORT})
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenLoginModal}
              disabled={isLoggingIn}
              className="text-sm font-medium"
              style={{ color: "var(--nipw-text-secondary)" }}
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
                color: "var(--nipw-text-primary)",
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
            background: "var(--nipw-hero-bg)",
            borderBottom: "1px solid var(--nipw-border)",
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
              <div
                className="w-8 h-px"
                style={{ background: "var(--nipw-gold)" }}
              />
              <span
                className="text-xs font-mono tracking-widest uppercase font-semibold"
                style={{ color: "var(--nipw-gold)" }}
              >
                Institutional Bitcoin Investment
              </span>
              <div
                className="w-8 h-px"
                style={{ background: "var(--nipw-gold)" }}
              />
            </div>

            <h1
              className="font-display font-bold leading-tight mb-4"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: "var(--nipw-text-primary)",
              }}
            >
              {COMPANY_NAME}
            </h1>
            <p
              className="text-xl font-medium mb-3"
              style={{ color: "var(--nipw-gold)" }}
            >
              Secure. Trusted. Growing.
            </p>
            <p
              className="text-base leading-relaxed max-w-2xl mb-10"
              style={{ color: "var(--nipw-text-secondary)" }}
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
                  color: "var(--nipw-text-primary)",
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
                onClick={onOpenLoginModal}
                disabled={isLoggingIn}
                className="text-base font-semibold px-8 py-6"
                style={{
                  background: "transparent",
                  border: "1px solid #D4AF37",
                  color: "var(--nipw-gold)",
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
                  color: "var(--nipw-gold)",
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
                  color: "var(--nipw-text-primary)",
                },
                {
                  label: "Established",
                  value: "Est. 2024",
                  color: "var(--nipw-gold)",
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
                    style={{ color: "var(--nipw-text-muted)" }}
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
                color: "var(--nipw-gold)",
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
                  background: "var(--nipw-surface)",
                  border: "1px solid var(--nipw-border)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
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
                  style={{ color: "var(--nipw-text-primary)" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--nipw-text-secondary)" }}
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

// ─── Login Modal ──────────────────────────────────────────────────────────────

function LoginModal({
  open,
  onOpenChange,
  onLogin,
  onCreateAccount,
  isLoggingIn,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onLogin: (username: string, gmail: string, password: string) => void;
  onCreateAccount: () => void;
  isLoggingIn: boolean;
}) {
  const [username, setUsername] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUsername("");
      setLoginEmail("");
      setPassword("");
      setUsernameError("");
      setPasswordError("");
      setTimeout(() => usernameRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!username.trim()) {
      setUsernameError("Username is required.");
      valid = false;
    } else {
      setUsernameError("");
    }
    if (!password.trim()) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError("");
    }
    if (!valid) return;
    onLogin(username.trim(), loginEmail.trim(), password);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-sm"
        style={{
          background: "var(--nipw-surface)",
          border: "1px solid var(--nipw-border)",
          color: "var(--nipw-text-primary)",
        }}
        data-ocid="login.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <NIPWCrest size={40} />
            <div>
              <DialogTitle
                className="text-base font-bold"
                style={{ color: "var(--nipw-text-primary)" }}
              >
                Sign In
              </DialogTitle>
              <DialogDescription
                className="text-xs"
                style={{ color: "var(--nipw-text-secondary)" }}
              >
                Sign in with your account credentials
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="login-username"
              className="text-xs font-medium"
              style={{ color: "var(--nipw-text-secondary)" }}
            >
              Username
            </Label>
            <Input
              id="login-username"
              ref={usernameRef}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              disabled={isLoggingIn}
              className="text-sm"
              style={{
                background: "var(--nipw-input-bg)",
                border: usernameError
                  ? "1px solid #E74C3C"
                  : "1px solid var(--nipw-border)",
                color: "var(--nipw-text-primary)",
              }}
              data-ocid="login.username.input"
            />
            {usernameError ? (
              <p
                className="text-xs"
                style={{ color: "#E74C3C" }}
                data-ocid="login.username.error_state"
              >
                {usernameError}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="login-email"
              className="text-xs font-medium"
              style={{ color: "var(--nipw-text-secondary)" }}
            >
              Gmail Address
            </Label>
            <Input
              id="login-email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="yourname@gmail.com"
              autoComplete="email"
              disabled={isLoggingIn}
              className="text-sm"
              style={{
                background: "var(--nipw-input-bg)",
                border: "1px solid var(--nipw-border)",
                color: "var(--nipw-text-primary)",
              }}
              data-ocid="login.email.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="login-password"
              className="text-xs font-medium"
              style={{ color: "var(--nipw-text-secondary)" }}
            >
              Password
            </Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoggingIn}
              className="text-sm"
              style={{
                background: "var(--nipw-input-bg)",
                border: passwordError
                  ? "1px solid #E74C3C"
                  : "1px solid var(--nipw-border)",
                color: "var(--nipw-text-primary)",
              }}
              data-ocid="login.password.input"
            />
            {passwordError ? (
              <p
                className="text-xs"
                style={{ color: "#E74C3C" }}
                data-ocid="login.password.error_state"
              >
                {passwordError}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="w-full text-sm font-semibold"
            disabled={isLoggingIn}
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #B8952E 100%)",
              color: "var(--nipw-bg)",
              border: "none",
              boxShadow: "0 2px 8px rgba(212,175,55,0.35)",
            }}
            data-ocid="login.submit_button"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            {isLoggingIn ? "Signing In..." : "Sign In"}
          </Button>

          <p
            className="text-center text-xs"
            style={{ color: "var(--nipw-text-secondary)" }}
          >
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onCreateAccount();
              }}
              className="font-semibold underline underline-offset-2"
              style={{ color: "var(--nipw-gold)" }}
              data-ocid="login.create_account.link"
            >
              Create one
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
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
  onSubmit: (name: string, gmail: string, password?: string) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [username, setUsername] = useState("");
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [gmailError, setGmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const usernameRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setUsername("");
      setGmail("");
      setPassword("");
      setConfirmPassword("");
      setUsernameError("");
      setGmailError("");
      setPasswordError("");
      setConfirmPasswordError("");
      setTimeout(() => usernameRef.current?.focus(), 100);
    }
  }, [open]);

  const validate = () => {
    let valid = true;
    if (!username.trim()) {
      setUsernameError("Username is required.");
      valid = false;
    } else {
      setUsernameError("");
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
    if (!password.trim()) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your password.");
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      valid = false;
    } else {
      setConfirmPasswordError("");
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(username.trim(), gmail.trim().toLowerCase(), password);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          background: "var(--nipw-surface)",
          border: "1px solid var(--nipw-border)",
          color: "var(--nipw-text-primary)",
        }}
        data-ocid="create_account.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <NIPWCrest size={40} />
            <div>
              <DialogTitle
                className="text-base font-bold"
                style={{ color: "var(--nipw-text-primary)" }}
              >
                Create Your Account
              </DialogTitle>
              <DialogDescription
                className="text-xs"
                style={{ color: "var(--nipw-text-secondary)" }}
              >
                Join {COMPANY_NAME}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="reg-username"
              className="text-xs font-medium"
              style={{ color: "var(--nipw-text-secondary)" }}
            >
              Username
            </Label>
            <Input
              id="reg-username"
              ref={usernameRef}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              autoComplete="username"
              disabled={isSubmitting}
              className="text-sm"
              style={{
                background: "var(--nipw-input-bg)",
                border: usernameError
                  ? "1px solid #E74C3C"
                  : "1px solid var(--nipw-border)",
                color: "var(--nipw-text-primary)",
              }}
              data-ocid="create_account.name.input"
            />
            {usernameError ? (
              <p
                className="text-xs"
                style={{ color: "#E74C3C" }}
                data-ocid="create_account.name.error_state"
              >
                {usernameError}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="reg-gmail"
              className="text-xs font-medium"
              style={{ color: "var(--nipw-text-secondary)" }}
            >
              Gmail Address
            </Label>
            <Input
              id="reg-gmail"
              type="email"
              value={gmail}
              onChange={(e) => setGmail(e.target.value)}
              placeholder="yourname@example.com"
              autoComplete="email"
              disabled={isSubmitting}
              className="text-sm"
              style={{
                background: "var(--nipw-input-bg)",
                border: gmailError
                  ? "1px solid #E74C3C"
                  : "1px solid var(--nipw-border)",
                color: "var(--nipw-text-primary)",
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

          <div className="space-y-1.5">
            <Label
              htmlFor="reg-password"
              className="text-xs font-medium"
              style={{ color: "var(--nipw-text-secondary)" }}
            >
              Password
            </Label>
            <Input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min. 8 characters)"
              autoComplete="new-password"
              disabled={isSubmitting}
              className="text-sm"
              style={{
                background: "var(--nipw-input-bg)",
                border: passwordError
                  ? "1px solid #E74C3C"
                  : "1px solid var(--nipw-border)",
                color: "var(--nipw-text-primary)",
              }}
              data-ocid="create_account.password.input"
            />
            {passwordError ? (
              <p
                className="text-xs"
                style={{ color: "#E74C3C" }}
                data-ocid="create_account.password.error_state"
              >
                {passwordError}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="reg-confirm-password"
              className="text-xs font-medium"
              style={{ color: "var(--nipw-text-secondary)" }}
            >
              Confirm Password
            </Label>
            <Input
              id="reg-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              disabled={isSubmitting}
              className="text-sm"
              style={{
                background: "var(--nipw-input-bg)",
                border: confirmPasswordError
                  ? "1px solid #E74C3C"
                  : "1px solid var(--nipw-border)",
                color: "var(--nipw-text-primary)",
              }}
              data-ocid="create_account.confirm_password.input"
            />
            {confirmPasswordError ? (
              <p
                className="text-xs"
                style={{ color: "#E74C3C" }}
                data-ocid="create_account.confirm_password.error_state"
              >
                {confirmPasswordError}
              </p>
            ) : null}
          </div>

          <div
            className="rounded-lg p-3"
            style={{
              background: "rgba(212,175,55,0.07)",
              border: "1px solid rgba(212,175,55,0.18)",
            }}
          >
            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--nipw-text-secondary)" }}
            >
              <span
                style={{ color: "var(--nipw-gold)" }}
                className="font-semibold"
              >
                Security:{" "}
              </span>
              Your account is protected by advanced security protocols.
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
                border: "1px solid var(--nipw-border)",
                color: "var(--nipw-text-secondary)",
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
                color: "var(--nipw-text-primary)",
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
  isAdmin,
  onOpenAdmin,
}: {
  displayName: string;
  onLogout: () => void;
  onFundAccount: () => void;
  onViewStatement: () => void;
  onSendMoney: () => void;
  onReceiveMoney: () => void;
  onOpenSettings: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}) {
  const initials = getInitials(displayName) || "?";
  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "var(--nipw-nav-bg)",
        borderBottom: "1px solid var(--nipw-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 min-w-0"
          data-ocid="nav.brand.link"
        >
          <NIPWCrest size={36} />
          <div className="min-w-0">
            <div
              className="font-display font-black tracking-widest leading-none"
              style={{ color: "var(--nipw-gold)", fontSize: "18px" }}
            >
              {COMPANY_SHORT}
            </div>
            <div
              className="hidden sm:block font-mono tracking-wider leading-tight whitespace-nowrap"
              style={{ color: "var(--nipw-text-secondary)", fontSize: "9px" }}
            >
              {COMPANY_NAME}
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
              style={{ color: "var(--nipw-text-secondary)" }}
              data-ocid={`nav.${link.toLowerCase()}.link`}
            >
              {link}
            </a>
          ))}
          <button
            onClick={onOpenSettings}
            className="text-sm font-medium transition-colors hover:text-white flex items-center gap-1"
            style={{ color: "var(--nipw-text-secondary)" }}
            type="button"
            data-ocid="nav.settings.link"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="text-sm font-semibold transition-colors hover:brightness-110 flex items-center gap-1"
              style={{ color: "var(--nipw-gold)" }}
              type="button"
              data-ocid="nav.admin.link"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          )}
        </nav>

        {/* User pill + logout */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "var(--nipw-surface-alt)",
              border: "1px solid var(--nipw-border)",
            }}
            data-ocid="nav.user.button"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: "var(--nipw-gold)",
                color: "var(--nipw-bg)",
              }}
            >
              {initials}
            </div>
            <span
              className="text-sm hidden sm:block max-w-[120px] truncate"
              style={{ color: "var(--nipw-text-primary)" }}
            >
              {displayName}
            </span>
            <ChevronDown
              className="w-3.5 h-3.5"
              style={{ color: "var(--nipw-text-secondary)" }}
            />
          </div>
          <button
            onClick={onSendMoney}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95 hidden sm:flex"
            style={{
              background: "var(--nipw-row-bg)",
              border: "1px solid rgba(212,175,55,0.25)",
              color: "var(--nipw-gold)",
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
              background: "var(--nipw-row-bg)",
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
              background: "var(--nipw-row-bg)",
              border: "1px solid rgba(212,175,55,0.2)",
              color: "var(--nipw-text-secondary)",
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
              color: "var(--nipw-bg)",
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
              background: "var(--nipw-row-bg)",
              border: "1px solid rgba(212,175,55,0.2)",
              color: "var(--nipw-gold)",
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
              background: "var(--nipw-row-bg)",
              border: "1px solid var(--nipw-border)",
              color: "var(--nipw-text-secondary)",
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
        background: "var(--nipw-hero-bg)",
        borderBottom: "1px solid var(--nipw-border)",
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
            <div
              className="w-8 h-px"
              style={{ background: "var(--nipw-gold)" }}
            />
            <span
              className="text-xs font-mono tracking-widest uppercase font-semibold"
              style={{ color: "var(--nipw-gold)" }}
            >
              Institutional Bitcoin Investment
            </span>
          </div>

          <h1
            className="font-display font-bold leading-tight mb-2"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            <span style={{ color: "var(--nipw-text-secondary)" }}>
              Welcome back,{" "}
            </span>
            <span
              style={{
                color: "var(--nipw-gold)",
                textShadow: "0 0 30px rgba(212,175,55,0.4)",
              }}
            >
              {displayName}
            </span>
          </h1>
          <p
            className="text-base font-medium mb-3"
            style={{ color: "var(--nipw-text-primary)" }}
          >
            {COMPANY_NAME}
          </p>

          <p
            className="text-sm leading-relaxed max-w-2xl"
            style={{ color: "var(--nipw-text-muted)" }}
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
              <span
                className="text-xs"
                style={{ color: "var(--nipw-text-secondary)" }}
              >
                LIVE ·
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--nipw-text-primary)" }}
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
                style={{ color: "var(--nipw-text-primary)" }}
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
        background: "var(--nipw-surface)",
        border: "1px solid var(--nipw-border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
      }}
      data-ocid="account.card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bitcoin className="w-5 h-5" style={{ color: "var(--nipw-gold)" }} />
          <span
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: "var(--nipw-text-secondary)" }}
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
          style={{ color: "var(--nipw-text-primary)" }}
        >
          {fmtUSD(totalUSD)}
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-4 w-24 mb-4" />
      ) : (
        <div
          className="text-sm font-mono mb-4"
          style={{ color: "var(--nipw-gold)" }}
        >
          ₿ {totalBTC.toFixed(4)} BTC
        </div>
      )}

      <div
        className="grid grid-cols-2 gap-3 mb-4"
        style={{
          borderTop: "1px solid var(--nipw-border)",
          paddingTop: "1rem",
        }}
      >
        <div>
          <div
            className="text-xs font-mono uppercase tracking-wider mb-1"
            style={{ color: "var(--nipw-text-secondary)" }}
          >
            Available Balance
          </div>
          <div
            className="text-base font-semibold"
            style={{ color: "var(--nipw-text-primary)" }}
          >
            {fmtUSD(AVAILABLE_BALANCE)}
          </div>
        </div>
        <div>
          <div
            className="text-xs font-mono uppercase tracking-wider mb-1"
            style={{ color: "var(--nipw-text-secondary)" }}
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
          background: "var(--nipw-row-bg)",
          border: "1px solid var(--nipw-border)",
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div
              className="text-xs font-mono uppercase tracking-wider mb-1"
              style={{ color: "var(--nipw-text-secondary)" }}
            >
              Registered Investors
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-16 mx-auto" />
            ) : (
              <div
                className="text-lg font-bold font-display"
                style={{ color: "var(--nipw-gold)" }}
              >
                {fmtNum(FALLBACK_INVESTORS)}
              </div>
            )}
          </div>
          <div className="text-center">
            <div
              className="text-xs font-mono uppercase tracking-wider mb-1"
              style={{ color: "var(--nipw-text-secondary)" }}
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

      {/* Company / BTC Address details */}
      <div
        className="mt-3 rounded-lg p-3 space-y-2"
        style={{
          background: "rgba(212,175,55,0.05)",
          border: "1px solid rgba(212,175,55,0.2)",
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-mono uppercase tracking-wider"
            style={{ color: "var(--nipw-text-secondary)" }}
          >
            Receiving Account
          </span>
          <span
            className="text-xs font-semibold font-mono"
            style={{ color: "#D4AF37" }}
          >
            {COMPANY_BANK_NAME} #{COMPANY_ACCOUNT_NUMBER}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-mono uppercase tracking-wider flex-shrink-0"
            style={{ color: "var(--nipw-text-secondary)" }}
          >
            BTC Address
          </span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="text-xs font-mono truncate"
              style={{ color: "#D4AF37" }}
            >
              {FALLBACK_ADDRESS.slice(0, 8)}…{FALLBACK_ADDRESS.slice(-6)}
            </span>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(FALLBACK_ADDRESS);
                  toast.success("BTC address copied!");
                } catch {
                  toast.error("Failed to copy.");
                }
              }}
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all hover:brightness-125"
              style={{
                background: "rgba(212,175,55,0.12)",
                border: "1px solid rgba(212,175,55,0.3)",
                color: "#D4AF37",
              }}
              aria-label="Copy BTC address"
              data-ocid="account.copy_btc.button"
            >
              <Copy className="w-2.5 h-2.5" />
            </button>
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
        background: "var(--nipw-surface)",
        border: "1px solid var(--nipw-border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
      data-ocid="deposit.card"
    >
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5" style={{ color: "var(--nipw-gold)" }} />
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--nipw-text-primary)" }}
        >
          Deposit Funds
        </span>
      </div>

      <div
        className="text-xs font-mono uppercase tracking-widest mb-3"
        style={{ color: "var(--nipw-text-secondary)" }}
      >
        Your Bitcoin Deposit Address
      </div>

      {isLoading ? (
        <Skeleton className="h-10 w-full mb-3" />
      ) : (
        <div
          className="rounded-lg p-3 mb-3 font-mono text-xs break-all leading-relaxed"
          style={{
            background: "var(--nipw-input-bg)",
            border: "1px solid var(--nipw-border)",
            color: "var(--nipw-gold)",
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
          color: "var(--nipw-text-primary)",
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
        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--nipw-text-secondary)" }}
        >
          <span style={{ color: "var(--nipw-gold)" }} className="font-semibold">
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
  const TOTAL_BALANCE = 6000000;
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
              <AlertTriangle
                className="w-5 h-5"
                style={{ color: "var(--nipw-gold)" }}
              />
            </div>
            <div>
              <h3
                className="font-bold text-base font-display"
                style={{ color: "var(--nipw-gold)" }}
              >
                Withdrawal Policy
              </h3>
              <p
                className="text-xs"
                style={{ color: "var(--nipw-text-secondary)" }}
              >
                Required before any withdrawal can be processed
              </p>
            </div>
          </div>

          {/* Policy Message */}
          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: "var(--nipw-text-secondary)" }}
          >
            To initiate any withdrawal, you must first deposit{" "}
            <span className="font-bold" style={{ color: "var(--nipw-gold)" }}>
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
              background: "var(--nipw-row-bg)",
              border: "1px solid var(--nipw-border)",
            }}
          >
            <div className="flex-1">
              <div
                className="text-xs uppercase tracking-widest mb-1 font-mono"
                style={{ color: "var(--nipw-text-muted)" }}
              >
                Required Deposit to Unlock Withdrawal
              </div>
              <div
                className="text-2xl font-bold font-mono"
                style={{ color: "var(--nipw-gold)" }}
              >
                {fmtUSD(REQUIRED_DEPOSIT)}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--nipw-text-muted)" }}
              >
                20% of total balance ({fmtUSD(TOTAL_BALANCE)})
              </div>
            </div>
            <div
              className="h-px my-2 sm:my-0 sm:h-12 sm:w-px"
              style={{ background: "rgba(212,175,55,0.2)" }}
            />
            <div className="flex-1">
              <div
                className="text-xs uppercase tracking-widest mb-1 font-mono"
                style={{ color: "var(--nipw-text-muted)" }}
              >
                Your Total Wallet Balance
              </div>
              <div
                className="text-2xl font-bold font-mono"
                style={{ color: "var(--nipw-text-primary)" }}
              >
                {fmtUSD(TOTAL_BALANCE)}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--nipw-text-muted)" }}
              >
                Bitcoin portfolio value
              </div>
            </div>
          </div>

          {/* Send deposit to this BTC address */}
          <div>
            <div
              className="text-xs uppercase tracking-widest mb-2 font-mono"
              style={{ color: "var(--nipw-text-muted)" }}
            >
              Send Required Deposit To
            </div>
            <div
              className="rounded-lg p-3 font-mono text-xs break-all leading-relaxed mb-2"
              style={{
                background: "var(--nipw-input-bg)",
                border: "1px solid rgba(212,175,55,0.25)",
                color: "var(--nipw-gold)",
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
                color: "var(--nipw-gold)",
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
                color: "var(--nipw-bg)",
                boxShadow: "0 4px 24px rgba(212,175,55,0.4)",
              }}
              data-ocid="withdrawal.deposit_confirm.button"
            >
              <CheckCircle2 className="w-5 h-5" /> I&apos;ve Completed My
              Deposit — Submit Receipt
            </button>
            <p
              className="text-xs text-center mt-2"
              style={{ color: "var(--nipw-text-muted)" }}
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
        background: "var(--nipw-surface)",
        border: "1px solid var(--nipw-border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
      data-ocid="portfolio.card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2
            className="w-5 h-5"
            style={{ color: "var(--nipw-gold)" }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--nipw-text-primary)" }}
          >
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
                color: range === r ? "var(--nipw-gold)" : "#A9B4C6",
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
            style={{ background: "var(--nipw-gold)" }}
          />
          <span
            className="text-xs font-mono"
            style={{ color: "var(--nipw-text-secondary)" }}
          >
            BTC/USD
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-0.5 rounded"
            style={{ background: "#2F6BFF" }}
          />
          <span
            className="text-xs font-mono"
            style={{ color: "var(--nipw-text-secondary)" }}
          >
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
              background: "var(--nipw-surface-alt)",
              border: "1px solid var(--nipw-border)",
              borderRadius: 8,
              color: "var(--nipw-text-primary)",
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
            stroke="var(--nipw-gold)"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: "var(--nipw-gold)",
              stroke: "var(--nipw-bg)",
            }}
          />
          <Line
            yAxisId="btc"
            type="monotone"
            dataKey="eth"
            stroke="#2F6BFF"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: "#2F6BFF", stroke: "var(--nipw-bg)" }}
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
  onViewAll,
  onSelectActivity,
}: {
  activities: ActivityType[];
  isLoading: boolean;
  onViewAll: () => void;
  onSelectActivity: (act: ActivityType) => void;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "var(--nipw-surface)",
        border: "1px solid var(--nipw-border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
      data-ocid="activity.card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" style={{ color: "var(--nipw-gold)" }} />
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--nipw-text-primary)" }}
          >
            Recent Activity
          </span>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs flex items-center gap-1 hover:text-white transition-colors"
          style={{ color: "var(--nipw-text-secondary)" }}
          data-ocid="activity.view_all.link"
        >
          View all <ExternalLink className="w-3 h-3" />
        </button>
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
            <button
              type="button"
              key={act.id.toString()}
              onClick={() => onSelectActivity(act)}
              className="w-full flex items-center justify-between p-3 rounded-lg transition-all hover:brightness-110 cursor-pointer text-left"
              style={{
                background: "var(--nipw-row-bg)",
                border: "1px solid rgba(34,50,74,0.6)",
              }}
              data-ocid={`activity.item.${idx + 1}`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(34,50,74,0.8)" }}
                >
                  {activityIcon(act.activityType)}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-xs font-medium truncate"
                    style={{ color: "var(--nipw-text-primary)" }}
                  >
                    {act.description}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--nipw-text-secondary)" }}
                  >
                    {activityLabel(act.activityType)} · {timeAgo(act.timestamp)}
                  </div>
                  <div
                    className="text-xs font-mono mt-0.5"
                    style={{ color: "rgba(212,175,55,0.7)" }}
                  >
                    From: NORTHBANKING
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                <div
                  className="text-xs font-semibold font-mono"
                  style={{ color: "var(--nipw-gold)" }}
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
            </button>
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
      color: "var(--nipw-gold)",
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
        background: "var(--nipw-surface)",
        border: "1px solid var(--nipw-border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
      data-ocid="market.card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp
            className="w-5 h-5"
            style={{ color: "var(--nipw-gold)" }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--nipw-text-primary)" }}
          >
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
                  background: "var(--nipw-row-bg)",
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
                      style={{ color: "var(--nipw-text-primary)" }}
                    >
                      {m.symbol}/USD
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--nipw-text-secondary)" }}
                    >
                      {m.name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-sm font-semibold font-mono"
                    style={{ color: "var(--nipw-text-primary)" }}
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
        background: "var(--nipw-surface)",
        border: "1px solid rgba(212,175,55,0.25)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(212,175,55,0.05)",
      }}
      data-ocid="strategy.card"
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1 h-5 rounded-full"
          style={{ background: "var(--nipw-gold)" }}
        />
        <span
          className="text-sm font-display font-bold"
          style={{ color: "var(--nipw-gold)" }}
        >
          The North Investors Strategy:
        </span>
      </div>
      <p
        className="text-xs leading-relaxed mb-3"
        style={{ color: "var(--nipw-text-secondary)" }}
      >
        At North Investors Profit Wallet, we employ a proprietary multi-layered
        Bitcoin accumulation strategy designed to minimize downside risk while
        capturing institutional-grade upside potential. Our cold-storage vaults
        and multi-signature security protocols ensure your assets remain
        protected 24/7/365.
      </p>
      <p
        className="text-xs leading-relaxed"
        style={{ color: "var(--nipw-text-muted)" }}
      >
        Through strategic Dollar-Cost Averaging (DCA) combined with tactical
        entry points identified by our quantitative models, we consistently
        outperform standard buy-and-hold strategies — providing our investors
        with superior risk-adjusted returns across all market cycles. Our
        investors and thousands of members across our global community have seen
        transformative results through disciplined, long-term Bitcoin
        investment.
      </p>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { label: "Avg. Annual Return", value: "34.2%", color: "#2ECC71" },
          {
            label: "Assets Under Mgmt",
            value: "$2.4B",
            color: "var(--nipw-gold)",
          },
          { label: "Years Active", value: "7+", color: "#2F6BFF" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center p-2.5 rounded-lg"
            style={{
              background: "var(--nipw-row-bg)",
              border: "1px solid var(--nipw-border)",
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
              style={{ color: "var(--nipw-text-secondary)" }}
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

// ─── Future Status Card ───────────────────────────────────────────────────────

function FutureStatusCard() {
  const rows = [
    {
      label: "Account Status",
      value: "Active & Published",
      dot: "#2ECC71",
    },
    {
      label: "Investment Phase",
      value: "Growth Phase — Bitcoin Accumulation",
      dot: "#2ECC71",
    },
    {
      label: "Projected Return",
      value: "Est. 18–24% Annual Yield",
      dot: "#2ECC71",
    },
    {
      label: "Publication Status",
      value: "Live & Published on North Investors Profit Wallet",
      dot: "#2ECC71",
    },
    {
      label: "Broker Certification",
      value: "Certified Cryptocurrency Broker",
      dot: "var(--nipw-gold)",
    },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden relative"
      style={{
        background: "var(--nipw-surface)",
        border: "1px solid rgba(212,175,55,0.45)",
        boxShadow:
          "0 4px 32px rgba(0,0,0,0.45), 0 0 48px rgba(212,175,55,0.05)",
      }}
      data-ocid="future_status.card"
    >
      {/* Gold shimmer top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)",
        }}
      />

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(212,175,55,0.12)",
                border: "1px solid rgba(212,175,55,0.3)",
              }}
            >
              <TrendingUp
                className="w-4 h-4"
                style={{ color: "var(--nipw-gold)" }}
              />
            </div>
            <div>
              <h3
                className="font-bold font-display tracking-wide"
                style={{ color: "var(--nipw-text-primary)", fontSize: "15px" }}
              >
                Investment Future Status
              </h3>
              <p
                className="text-xs font-mono"
                style={{ color: "var(--nipw-text-muted)" }}
              >
                Real-time platform intelligence
              </p>
            </div>
          </div>
          {/* LIVE Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0"
            style={{
              background: "rgba(46,204,113,0.12)",
              border: "1px solid rgba(46,204,113,0.4)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full inline-block animate-pulse"
              style={{ background: "#2ECC71", boxShadow: "0 0 6px #2ECC71" }}
            />
            <span
              className="text-xs font-bold font-mono"
              style={{ color: "#2ECC71" }}
            >
              LIVE
            </span>
          </div>
        </div>

        {/* Gold divider */}
        <div
          className="h-px mb-5"
          style={{
            background:
              "linear-gradient(90deg, rgba(212,175,55,0.5) 0%, rgba(212,175,55,0.08) 100%)",
          }}
        />

        {/* Status rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-5">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-lg p-3"
              style={{
                background: "var(--nipw-row-bg)",
                border: "1px solid rgba(34,50,74,0.8)",
              }}
            >
              <div
                className="text-xs font-mono uppercase tracking-wider mb-1.5"
                style={{ color: "var(--nipw-text-muted)" }}
              >
                {row.label}
              </div>
              <div className="flex items-start gap-1.5">
                <span
                  className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0 animate-pulse"
                  style={{
                    background: row.dot,
                    boxShadow: `0 0 4px ${row.dot}`,
                  }}
                />
                <span
                  className="text-xs font-semibold leading-snug"
                  style={{ color: "var(--nipw-text-primary)" }}
                >
                  {row.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-lg"
          style={{
            background: "rgba(46,204,113,0.06)",
            border: "1px solid rgba(46,204,113,0.2)",
          }}
        >
          <Shield
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#2ECC71" }}
          />
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--nipw-text-secondary)" }}
          >
            Your investment is{" "}
            <span style={{ color: "#2ECC71", fontWeight: 600 }}>
              actively managed
            </span>{" "}
            and live on the platform. All broker activities are{" "}
            <span style={{ color: "var(--nipw-gold)", fontWeight: 600 }}>
              certified and operational
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

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
        background: "var(--nipw-surface)",
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
          <Award className="w-5 h-5" style={{ color: "var(--nipw-gold)" }} />
          <span
            className="text-xs font-mono uppercase tracking-widest font-semibold"
            style={{ color: "var(--nipw-text-secondary)" }}
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
            background: "var(--nipw-surface-alt)",
            border: "2px solid #D4AF37",
            color: "var(--nipw-gold)",
            boxShadow: "0 0 16px rgba(212,175,55,0.25)",
          }}
        >
          {initials}
        </div>
        <div>
          <div
            className="text-xl font-bold font-display"
            style={{ color: "var(--nipw-text-primary)" }}
          >
            {displayName}
          </div>
          <div
            className="text-sm font-mono"
            style={{ color: "var(--nipw-gold)" }}
          >
            {accountId}
          </div>
          <div
            className="text-xs font-mono mt-0.5"
            style={{ color: "rgba(212,175,55,0.65)" }}
          >
            Company: {COMPANY_BANK_NAME}
          </div>
          <div
            className="text-xs font-mono"
            style={{ color: "rgba(169,180,198,0.7)" }}
          >
            Account No: {COMPANY_ACCOUNT_NUMBER}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          {
            label: "Account Type",
            value: "Institutional",
            color: "var(--nipw-text-primary)",
          },
          {
            label: "Member Since",
            value: "2024",
            color: "var(--nipw-gold)",
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
              background: "var(--nipw-row-bg)",
              border: "1px solid rgba(34,50,74,0.7)",
            }}
          >
            <div
              className="text-xs font-mono uppercase tracking-wider mb-1"
              style={{ color: "var(--nipw-text-muted)" }}
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
        background: "var(--nipw-footer-bg)",
        borderTop: "1px solid var(--nipw-border)",
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
                style={{ color: "var(--nipw-gold)" }}
              >
                {COMPANY_SHORT}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--nipw-text-secondary)" }}
              >
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
                style={{ color: "var(--nipw-text-secondary)" }}
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
              <Phone
                className="w-3.5 h-3.5"
                style={{ color: "var(--nipw-gold)" }}
              />
            </div>
            <div>
              <div
                className="text-xs font-semibold"
                style={{ color: "var(--nipw-text-primary)" }}
              >
                Contact Us
              </div>
              <a
                href="tel:+12742015975"
                className="text-xs hover:text-white transition-colors"
                style={{ color: "var(--nipw-gold)" }}
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
  isAdmin,
  onOpenAdmin,
}: {
  displayName: string;
  gmail: string;
  onLogout: () => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
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
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(
    null,
  );
  const [showTxDetail, setShowTxDetail] = useState(false);
  const [showTxHistory, setShowTxHistory] = useState(false);
  const { actor: rawActor, isFetching: isActorFetching } =
    useActor(createActor);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actor = rawActor as any;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["platformStats"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getPlatformStats();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isActorFetching,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: prices, isLoading: pricesLoading } = useQuery({
    queryKey: ["marketPrices"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getMarketPrices();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isActorFetching,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getAllActivities();
        return result.length > 0 ? result : FALLBACK_ACTIVITIES;
      } catch {
        return FALLBACK_ACTIVITIES;
      }
    },
    enabled: !!actor && !isActorFetching,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
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
    <div className="flex flex-col" style={{ background: "var(--nipw-bg)" }}>
      <NavBar
        displayName={displayName}
        onLogout={onLogout}
        onFundAccount={() => setShowPayment(true)}
        onViewStatement={() => setCurrentView("statement")}
        onSendMoney={() => setShowSendModal(true)}
        onReceiveMoney={() => setShowReceiveModal(true)}
        onOpenSettings={() => setShowSettings(true)}
        isAdmin={isAdmin}
        onOpenAdmin={onOpenAdmin}
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

            {/* Future Status Card */}
            <div className="mb-6">
              <FutureStatusCard />
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
                  onViewAll={() => setShowTxHistory(true)}
                  onSelectActivity={(act) => {
                    setSelectedActivity(act);
                    setShowTxDetail(true);
                  }}
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
                background: "var(--nipw-surface)",
                border: "1px solid var(--nipw-border)",
              }}
            >
              <div className="flex items-center gap-2">
                <Home
                  className="w-4 h-4"
                  style={{ color: "var(--nipw-gold)" }}
                />
                <span
                  className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: "var(--nipw-text-secondary)" }}
                >
                  Platform Overview
                </span>
              </div>
              <div className="flex flex-wrap gap-6">
                {[
                  {
                    label: "Total AUM",
                    value: fmtUSD(totalUSD),
                    color: "var(--nipw-gold)",
                  },
                  {
                    label: "BTC Holdings",
                    value: `₿ ${totalBTC.toFixed(4)}`,
                    color: "var(--nipw-text-primary)",
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
                    color: "var(--nipw-gold)",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <span
                      className="text-xs"
                      style={{ color: "var(--nipw-text-muted)" }}
                    >
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
                  background: "var(--nipw-surface)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
                data-ocid="broker.info.card"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-1 h-5 rounded-full"
                    style={{ background: "var(--nipw-gold)" }}
                  />
                  <span
                    className="text-sm font-bold font-display"
                    style={{ color: "var(--nipw-gold)" }}
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
                        style={{ color: "var(--nipw-text-primary)" }}
                      >
                        {item.title}
                      </div>
                      <div
                        className="text-xs leading-relaxed"
                        style={{ color: "var(--nipw-text-secondary)" }}
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
                    style={{ color: "var(--nipw-text-muted)" }}
                  >
                    North Investors Profit Wallet — Established{" "}
                    <span style={{ color: "var(--nipw-gold)" }}>2024</span>
                  </span>
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </>
      )}
      <PaymentModal
        open={showPayment}
        onOpenChange={(v) => {
          setShowPayment(v);
          if (v) {
            fireLog(
              actor,
              gmail,
              displayName,
              "deposit" as BackendActivityType,
              null,
              "Fund Account modal opened",
              null,
              "pending" as BackendActivityStatus,
            );
          }
        }}
      />
      <SendMoneyModal
        open={showSendModal}
        onOpenChange={(v) => {
          setShowSendModal(v);
          if (!v && showSendModal) {
            // Log send money action on modal close (after interaction)
            fireLog(
              actor,
              gmail,
              displayName,
              "sendMoney" as BackendActivityType,
              null,
              "Send Money modal interacted",
              null,
              "pending" as BackendActivityStatus,
            );
          }
        }}
      />
      <ReceiveMoneyModal
        open={showReceiveModal}
        onOpenChange={(v) => {
          setShowReceiveModal(v);
          if (v) {
            fireLog(
              actor,
              gmail,
              displayName,
              "receiveMoney" as BackendActivityType,
              null,
              "Viewed wallet address / receive money screen",
              null,
              "completed" as BackendActivityStatus,
            );
          }
        }}
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
          fireLog(
            actor,
            gmail,
            displayName,
            "receiptUpload" as BackendActivityType,
            1200000,
            "Deposit receipt uploaded — account activation submitted",
            null,
            "pending" as BackendActivityStatus,
          );
          toast.success("Account Activated!", {
            description:
              "Your deposit receipt has been submitted. Your full balance is now under review for withdrawal.",
            duration: 6000,
          });
        }}
        displayName={displayName}
        requiredDeposit={1200000}
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
      <TransactionDetailModal
        transaction={selectedActivity}
        open={showTxDetail}
        onOpenChange={setShowTxDetail}
      />
      <TransactionHistoryModal
        open={showTxHistory}
        onOpenChange={setShowTxHistory}
        transactions={activityList}
        displayName={displayName}
      />
    </div>
  );
}

// ─── Local Account Storage ────────────────────────────────────────────────────

interface LocalAccount {
  username: string;
  gmail: string;
  password: string;
}

function getAccounts(): LocalAccount[] {
  try {
    return JSON.parse(localStorage.getItem("nipw-accounts") ?? "[]");
  } catch {
    return [];
  }
}

function saveAccount(acct: LocalAccount) {
  const accounts = getAccounts();
  const exists = accounts.findIndex((a) => a.gmail === acct.gmail);
  if (exists >= 0) {
    accounts[exists] = acct;
  } else {
    accounts.push(acct);
  }
  localStorage.setItem("nipw-accounts", JSON.stringify(accounts));
}

function findAccount(
  username: string,
  gmail: string,
  password: string,
): LocalAccount | null {
  const accounts = getAccounts();
  return (
    accounts.find(
      (a) =>
        a.username.toLowerCase() === username.toLowerCase() &&
        a.gmail.toLowerCase() === gmail.toLowerCase() &&
        a.password === password,
    ) ?? null
  );
}

function getSession(): { username: string; gmail: string } | null {
  try {
    const s = localStorage.getItem("nipw-session");
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

function setSession(username: string, gmail: string) {
  localStorage.setItem("nipw-session", JSON.stringify({ username, gmail }));
}

function clearSession() {
  localStorage.removeItem("nipw-session");
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const { actor: rawActor2, isFetching: isActorFetching } =
    useActor(createActor);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actor = rawActor2 as any;

  // Investor key gate state — persisted in localStorage
  const [keyVerified, setKeyVerified] = useState<boolean>(
    () => localStorage.getItem("nipw-investor-key") === "verified",
  );

  // Session state — read from localStorage on mount
  const [session, setSessionState] = useState<{
    username: string;
    gmail: string;
  } | null>(() => getSession());

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminView, setAdminView] = useState(false);

  const isAuthenticated = !!session;

  // Check admin status when actor and session are ready
  useEffect(() => {
    if (!actor || isActorFetching || !isAuthenticated) return;
    actor
      .isAdminCaller()
      .then((result: boolean) => setIsAdmin(result))
      .catch(() => setIsAdmin(false));
  }, [actor, isActorFetching, isAuthenticated]);

  // ─── Login handler ────────────────────────────────────────────────────────

  const handleLogin = useCallback(
    async (username: string, gmail: string, password: string) => {
      setIsLoggingIn(true);
      // Give the UI a moment to show loading state
      await new Promise((r) => setTimeout(r, 600));

      // First try backend if actor is ready
      if (actor && !isActorFetching) {
        try {
          const profile = await actor.getUserByCredentials?.(
            username,
            gmail,
            password,
          );
          if (profile?.displayName) {
            setSession(profile.displayName, profile.gmail ?? gmail);
            setSessionState({
              username: profile.displayName,
              gmail: profile.gmail ?? gmail,
            });
            setShowLoginModal(false);
            setIsLoggingIn(false);
            fireLog(
              actor,
              profile.gmail ?? gmail,
              profile.displayName,
              "login" as BackendActivityType,
              null,
              `Login successful — ${profile.displayName}`,
              null,
              "completed" as BackendActivityStatus,
            );
            toast.success(`Welcome back, ${profile.displayName}!`);
            return;
          }
        } catch {
          // Fall through to localStorage
        }
      }

      // Fallback: check localStorage
      const found = findAccount(username, gmail, password);
      if (found) {
        setSession(found.username, found.gmail);
        setSessionState({ username: found.username, gmail: found.gmail });
        setShowLoginModal(false);
        setIsLoggingIn(false);
        fireLog(
          actor,
          found.gmail,
          found.username,
          "login" as BackendActivityType,
          null,
          `Login successful — ${found.username}`,
          null,
          "completed" as BackendActivityStatus,
        );
        toast.success(`Welcome back, ${found.username}!`);
      } else {
        setIsLoggingIn(false);
        // Log failed login attempt
        fireLog(
          actor,
          gmail,
          username,
          "loginFailed" as BackendActivityType,
          null,
          `Failed login attempt — ${username} / ${gmail}`,
          null,
          "failed" as BackendActivityStatus,
        );
        toast.error("Invalid credentials", {
          description:
            "Username, Gmail, or password is incorrect. Please try again or create an account.",
        });
      }
    },
    [actor, isActorFetching],
  );

  // ─── Create account handler ───────────────────────────────────────────────

  const handleCreateAccountSubmit = useCallback(
    async (name: string, gmail: string, password?: string) => {
      setIsSubmittingProfile(true);
      await new Promise((r) => setTimeout(r, 600));

      // Save locally always
      const acct: LocalAccount = {
        username: name,
        gmail,
        password: password ?? "",
      };
      saveAccount(acct);

      // Also try backend
      if (actor && !isActorFetching) {
        try {
          await actor.registerUserProfile?.(name, gmail);
        } catch {
          // Non-blocking — localStorage covers it
        }
      }

      setSession(name, gmail);
      setSessionState({ username: name, gmail });
      setShowCreateAccount(false);
      setIsSubmittingProfile(false);
      fireLog(
        actor,
        gmail,
        name,
        "accountCreation" as BackendActivityType,
        null,
        `New account created — ${name}`,
        null,
        "completed" as BackendActivityStatus,
      );
      toast.success(`Welcome to ${COMPANY_NAME}, ${name}!`, {
        description: "Your account has been created successfully.",
      });
    },
    [actor, isActorFetching],
  );

  // ─── Key Verified handler ────────────────────────────────────────────────

  const handleKeyVerified = useCallback(() => {
    setKeyVerified(true);
    fireLog(
      actor,
      "",
      "",
      "keyVerification" as BackendActivityType,
      null,
      "Investor Key verified successfully",
      null,
      "completed" as BackendActivityStatus,
    );
  }, [actor]);

  // ─── Logout ───────────────────────────────────────────────────────────────

  const handleLogout = useCallback(() => {
    clearSession();
    setSessionState(null);
    setAdminView(false);
    setIsAdmin(false);
  }, []);

  // ─── Toaster style ────────────────────────────────────────────────────────

  const toasterStyle = {
    background: "var(--nipw-surface)",
    border: "1px solid var(--nipw-border)",
    color: "var(--nipw-text-primary)",
  };

  // ─── Render states ────────────────────────────────────────────────────────

  // Investor key gate — must pass before anything else
  if (!keyVerified) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ style: toasterStyle }} />
        <InvestorKeyGate onVerified={handleKeyVerified} />
      </>
    );
  }

  // Not authenticated: show landing page
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ style: toasterStyle }} />
        <LandingPage
          onOpenLoginModal={() => setShowLoginModal(true)}
          onCreateAccount={() => setShowCreateAccount(true)}
          isLoggingIn={isLoggingIn}
        />
        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          onLogin={handleLogin}
          onCreateAccount={() => {
            setShowLoginModal(false);
            setShowCreateAccount(true);
          }}
          isLoggingIn={isLoggingIn}
        />
        <CreateAccountModal
          open={showCreateAccount}
          onOpenChange={setShowCreateAccount}
          onSubmit={async (name, gmail, password) => {
            await handleCreateAccountSubmit(name, gmail, password);
          }}
          isSubmitting={isSubmittingProfile}
        />
        <SupportChat />
      </>
    );
  }

  // Admin view — full-screen admin panel
  if (adminView && isAdmin) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ style: toasterStyle }} />
        <AdminPanel onExit={() => setAdminView(false)} />
      </>
    );
  }

  // Fully authenticated with profile
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: toasterStyle }} />
      <Dashboard
        displayName={session.username}
        gmail={session.gmail}
        onLogout={handleLogout}
        isAdmin={isAdmin}
        onOpenAdmin={() => setAdminView(true)}
      />
    </>
  );
}
