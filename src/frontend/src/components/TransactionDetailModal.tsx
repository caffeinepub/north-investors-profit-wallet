import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bitcoin,
  Building2,
  CheckCircle2,
  Copy,
  Download,
  X,
} from "lucide-react";
import { toast } from "sonner";

// ─── Company constants ────────────────────────────────────────────────────────
const CO_BANK_NAME = "NORTHBANKING";
const CO_ACCOUNT_NUMBER = "44990623844";
const CO_BTC_ADDRESS = "bc1q88ancenmas6e0nfdl9kmvmtk5pq089ewp8wav7";
const TOTAL_PORTFOLIO_USD = 6000000;
const TOTAL_TRANSACTION_COUNT = 12;

export interface TransactionDetail {
  id: string;
  activityType:
    | "deposit"
    | "withdrawal"
    | "interestPayment"
    | "referralBonus"
    | "transfer";
  amount: number;
  currency: string;
  description: string;
  timestamp: number;
  status: "completed" | "pending" | "failed";
  btcAmount: string;
  referenceId: string;
  fromAccount: string;
  toAccount: string;
  txHash: string;
}

function fmtUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtDateTime(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function activityTypeLabel(type: TransactionDetail["activityType"]) {
  switch (type) {
    case "deposit":
      return "BTC Acquisition";
    case "interestPayment":
      return "Interest Payment";
    case "referralBonus":
      return "Referral Bonus";
    case "withdrawal":
      return "Withdrawal";
    case "transfer":
      return "Transfer";
  }
}

function typeColor(type: TransactionDetail["activityType"]) {
  switch (type) {
    case "deposit":
      return {
        bg: "rgba(240,185,11,0.15)",
        color: "#F0B90B",
        border: "rgba(240,185,11,0.4)",
      };
    case "interestPayment":
      return {
        bg: "rgba(47,107,255,0.15)",
        color: "#2F6BFF",
        border: "rgba(47,107,255,0.4)",
      };
    case "referralBonus":
      return {
        bg: "rgba(46,204,113,0.15)",
        color: "#2ECC71",
        border: "rgba(46,204,113,0.4)",
      };
    case "withdrawal":
      return {
        bg: "rgba(231,76,60,0.15)",
        color: "#E74C3C",
        border: "rgba(231,76,60,0.4)",
      };
    default:
      return {
        bg: "rgba(169,180,198,0.15)",
        color: "#A9B4C6",
        border: "rgba(169,180,198,0.4)",
      };
  }
}

function DetailRow({
  label,
  value,
  mono = false,
  color,
}: {
  label: string;
  value: string;
  mono?: boolean;
  color?: string;
}) {
  return (
    <div
      className="flex items-start justify-between py-2.5 gap-4"
      style={{ borderBottom: "1px solid rgba(34,50,74,0.6)" }}
    >
      <span
        className="text-xs font-mono uppercase tracking-wider flex-shrink-0"
        style={{ color: "#A9B4C6" }}
      >
        {label}
      </span>
      <span
        className={`text-xs font-semibold text-right break-all ${mono ? "font-mono" : ""}`}
        style={{ color: color ?? "#F2F5FA" }}
      >
        {value}
      </span>
    </div>
  );
}

export function TransactionDetailModal({
  transaction,
  open,
  onOpenChange,
}: {
  transaction: TransactionDetail | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!transaction) return null;

  const { bg, color, border } = typeColor(transaction.activityType);

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(transaction.txHash);
      toast.success("Transaction hash copied!");
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const copyBtcAddress = async () => {
    try {
      await navigator.clipboard.writeText(CO_BTC_ADDRESS);
      toast.success("BTC address copied!");
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const handleDownload = () => {
    toast.success("Receipt generated!", {
      description: `Reference: ${transaction.referenceId}`,
      duration: 4000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg w-full p-0 overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0d1f38 0%, #081526 100%)",
          border: "1px solid rgba(212,175,55,0.35)",
          boxShadow:
            "0 0 60px rgba(212,175,55,0.08), 0 32px 64px rgba(0,0,0,0.7)",
        }}
        data-ocid="transaction-detail.dialog"
      >
        {/* Gold top accent */}
        <div
          className="h-0.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, #D4AF37 30%, #FFD700 50%, #D4AF37 70%, transparent)",
          }}
        />

        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: bg, border: `1.5px solid ${border}` }}
              >
                <Bitcoin className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <DialogTitle
                  className="text-base font-bold font-display"
                  style={{ color: "#F2F5FA" }}
                >
                  {transaction.description.split("—")[0].trim()}
                </DialogTitle>
                <div className="mt-0.5">
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded-full"
                    style={{
                      background: bg,
                      color,
                      border: `1px solid ${border}`,
                    }}
                  >
                    {activityTypeLabel(transaction.activityType)}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:brightness-125"
              style={{ background: "rgba(255,255,255,0.07)", color: "#A9B4C6" }}
              aria-label="Close"
              data-ocid="transaction-detail.close.button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Amount hero */}
        <div
          className="mx-6 my-4 rounded-xl px-5 py-4 text-center"
          style={{
            background: "rgba(212,175,55,0.06)",
            border: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <div
            className="text-xs font-mono uppercase tracking-widest mb-1"
            style={{ color: "#A9B4C6" }}
          >
            Transaction Amount
          </div>
          <div
            className="text-3xl font-bold font-display"
            style={{
              color: "#D4AF37",
              textShadow: "0 0 20px rgba(212,175,55,0.3)",
            }}
            data-ocid="transaction-detail.amount.display"
          >
            +{fmtUSD(transaction.amount)}
          </div>
          <div className="text-sm font-mono mt-1" style={{ color: "#F0B90B" }}>
            {transaction.btcAmount}
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <CheckCircle2
              className="w-3.5 h-3.5"
              style={{ color: "#2ECC71" }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: "#2ECC71" }}
            >
              {transaction.status.charAt(0).toUpperCase() +
                transaction.status.slice(1)}{" "}
              • 847 confirmations
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 pb-2 overflow-y-auto max-h-[55vh]">
          <DetailRow
            label="Date & Time"
            value={fmtDateTime(transaction.timestamp)}
          />
          <DetailRow
            label="Reference ID"
            value={transaction.referenceId}
            mono
            color="#D4AF37"
          />
          <DetailRow label="Network" value="Bitcoin Network (BTC)" mono />
          <DetailRow label="From" value={transaction.fromAccount} />
          <DetailRow label="To" value={transaction.toAccount} />

          {/* TX Hash row with copy */}
          <div
            className="flex items-center justify-between py-2.5 gap-3"
            style={{ borderBottom: "1px solid rgba(34,50,74,0.6)" }}
          >
            <span
              className="text-xs font-mono uppercase tracking-wider flex-shrink-0"
              style={{ color: "#A9B4C6" }}
            >
              TX Hash
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="text-xs font-mono truncate"
                style={{ color: "#F2F5FA", maxWidth: 160 }}
              >
                {transaction.txHash.slice(0, 16)}…{transaction.txHash.slice(-8)}
              </span>
              <button
                type="button"
                onClick={copyHash}
                className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-all hover:brightness-125"
                style={{
                  background: "rgba(212,175,55,0.12)",
                  border: "1px solid rgba(212,175,55,0.25)",
                  color: "#D4AF37",
                }}
                aria-label="Copy transaction hash"
                data-ocid="transaction-detail.copy-hash.button"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Portfolio total summary */}
          <div
            className="mt-3 px-3 py-2.5 rounded-lg"
            style={{
              background: "rgba(47,107,255,0.07)",
              border: "1px solid rgba(47,107,255,0.2)",
            }}
          >
            <p
              className="text-xs leading-relaxed text-center"
              style={{ color: "#A9B4C6" }}
            >
              Part of{" "}
              <span style={{ color: "#D4AF37", fontWeight: 600 }}>
                $6,000,000 BTC Portfolio
              </span>{" "}
              — North Investors Profit Wallet •{" "}
              <span style={{ color: "#F2F5FA", fontWeight: 600 }}>
                {TOTAL_TRANSACTION_COUNT} total transactions received
              </span>
            </p>
            <p
              className="text-xs text-center mt-1"
              style={{ color: "#A9B4C6" }}
            >
              Total Portfolio Value:{" "}
              <span style={{ color: "#D4AF37", fontWeight: 600 }}>
                {fmtUSD(TOTAL_PORTFOLIO_USD)} USD
              </span>
            </p>
          </div>

          {/* Company Details Section */}
          <div
            className="mt-3 rounded-lg overflow-hidden"
            style={{
              border: "1px solid rgba(212,175,55,0.3)",
            }}
            data-ocid="transaction-detail.company.section"
          >
            {/* Section header */}
            <div
              className="flex items-center gap-2 px-4 py-2.5"
              style={{
                background: "rgba(212,175,55,0.1)",
                borderBottom: "1px solid rgba(212,175,55,0.2)",
              }}
            >
              <Building2
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: "#D4AF37" }}
              />
              <span
                className="text-xs font-mono uppercase tracking-widest font-semibold"
                style={{ color: "#D4AF37" }}
              >
                Company Details
              </span>
            </div>

            <div
              className="px-4 py-3 space-y-2"
              style={{ background: "rgba(0,0,0,0.2)" }}
            >
              {/* Company Name */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-mono uppercase tracking-wider"
                  style={{ color: "#A9B4C6" }}
                >
                  Company Name
                </span>
                <span
                  className="text-xs font-bold font-mono"
                  style={{ color: "#F2F5FA" }}
                >
                  {CO_BANK_NAME}
                </span>
              </div>

              {/* Account Number */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-mono uppercase tracking-wider"
                  style={{ color: "#A9B4C6" }}
                >
                  Account Number
                </span>
                <span
                  className="text-xs font-bold font-mono"
                  style={{ color: "#D4AF37" }}
                >
                  {CO_ACCOUNT_NUMBER}
                </span>
              </div>

              {/* BTC Address with copy */}
              <div
                className="flex items-center justify-between gap-2 pt-1"
                style={{ borderTop: "1px solid rgba(34,50,74,0.5)" }}
              >
                <span
                  className="text-xs font-mono uppercase tracking-wider flex-shrink-0"
                  style={{ color: "#A9B4C6" }}
                >
                  BTC Address
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="text-xs font-mono"
                    style={{ color: "#F0B90B" }}
                  >
                    {CO_BTC_ADDRESS.slice(0, 10)}…{CO_BTC_ADDRESS.slice(-8)}
                  </span>
                  <button
                    type="button"
                    onClick={copyBtcAddress}
                    className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-all hover:brightness-125"
                    style={{
                      background: "rgba(240,185,11,0.12)",
                      border: "1px solid rgba(240,185,11,0.3)",
                      color: "#F0B90B",
                    }}
                    aria-label="Copy company BTC address"
                    data-ocid="transaction-detail.copy-btc.button"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3">
          <Button
            onClick={handleDownload}
            className="flex-1 text-sm font-semibold flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)",
              color: "#050e1a",
              border: "none",
              boxShadow: "0 2px 12px rgba(212,175,55,0.3)",
            }}
            data-ocid="transaction-detail.download-receipt.button"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="text-sm font-medium"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#A9B4C6",
            }}
            data-ocid="transaction-detail.close-bottom.button"
          >
            Close
          </Button>
        </div>

        {/* Bottom gold accent */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(212,175,55,0.3) 50%, transparent)",
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
