import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity, Bitcoin, DollarSign, Users, X } from "lucide-react";
import { useState } from "react";
import type { TransactionDetail } from "./TransactionDetailModal";
import { TransactionDetailModal } from "./TransactionDetailModal";

// ─── Company constants ────────────────────────────────────────────────────────
const CO_BANK_NAME = "NORTHBANKING";
const CO_ACCOUNT_NUMBER = "44990623844";
const CO_BTC_ADDRESS = "bc1q88ancenmas6e0nfdl9kmvmtk5pq089ewp8wav7";

function fmtUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function activityIcon(type: TransactionDetail["activityType"]) {
  switch (type) {
    case "deposit":
      return <Bitcoin className="w-4 h-4" style={{ color: "#F0B90B" }} />;
    case "interestPayment":
      return <DollarSign className="w-4 h-4" style={{ color: "#2F6BFF" }} />;
    case "referralBonus":
      return <Users className="w-4 h-4" style={{ color: "#2ECC71" }} />;
    default:
      return <Activity className="w-4 h-4" style={{ color: "#A9B4C6" }} />;
  }
}

function typeColor(type: TransactionDetail["activityType"]) {
  switch (type) {
    case "deposit":
      return {
        bg: "rgba(240,185,11,0.15)",
        color: "#F0B90B",
        border: "rgba(240,185,11,0.3)",
      };
    case "interestPayment":
      return {
        bg: "rgba(47,107,255,0.15)",
        color: "#2F6BFF",
        border: "rgba(47,107,255,0.3)",
      };
    case "referralBonus":
      return {
        bg: "rgba(46,204,113,0.15)",
        color: "#2ECC71",
        border: "rgba(46,204,113,0.3)",
      };
    case "withdrawal":
      return {
        bg: "rgba(231,76,60,0.15)",
        color: "#E74C3C",
        border: "rgba(231,76,60,0.3)",
      };
    default:
      return {
        bg: "rgba(169,180,198,0.1)",
        color: "#A9B4C6",
        border: "rgba(169,180,198,0.2)",
      };
  }
}

function typeLabel(type: TransactionDetail["activityType"]) {
  switch (type) {
    case "deposit":
      return "BTC Acquisition";
    case "interestPayment":
      return "Interest";
    case "referralBonus":
      return "Referral Bonus";
    case "withdrawal":
      return "Withdrawal";
    default:
      return "Transfer";
  }
}

export function TransactionHistoryModal({
  open,
  onOpenChange,
  transactions,
  displayName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  transactions: TransactionDetail[];
  displayName: string;
}) {
  const [selectedTx, setSelectedTx] = useState<TransactionDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const totalPortfolio = 6000000;
  const totalReceived = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const creditCount = transactions.filter(
    (tx) => tx.activityType !== "withdrawal",
  ).length;

  function openDetail(tx: TransactionDetail) {
    setSelectedTx(tx);
    setDetailOpen(true);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-2xl w-full p-0 overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #0d1f38 0%, #081526 100%)",
            border: "1px solid rgba(212,175,55,0.3)",
            boxShadow:
              "0 0 60px rgba(212,175,55,0.08), 0 32px 64px rgba(0,0,0,0.7)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
          data-ocid="tx-history.dialog"
        >
          {/* Gold accent top */}
          <div
            className="h-0.5 w-full flex-shrink-0"
            style={{
              background:
                "linear-gradient(90deg, transparent, #D4AF37 30%, #FFD700 50%, #D4AF37 70%, transparent)",
            }}
          />

          {/* Header */}
          <DialogHeader
            className="px-6 pt-5 pb-4 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(34,50,74,0.8)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle
                  className="text-base font-bold font-display"
                  style={{ color: "#F2F5FA" }}
                >
                  Transaction History — {displayName}
                </DialogTitle>
                <p
                  className="text-xs font-mono mt-0.5"
                  style={{ color: "#A9B4C6" }}
                >
                  {transactions.length} Transactions · {creditCount} credits
                  received
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:brightness-125"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  color: "#A9B4C6",
                }}
                aria-label="Close transaction history"
                data-ocid="tx-history.close.button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Portfolio summary */}
            <div
              className="mt-3 rounded-xl px-4 py-3"
              style={{
                background: "rgba(212,175,55,0.07)",
                border: "1px solid rgba(212,175,55,0.2)",
              }}
            >
              {/* Top row: portfolio value + asset */}
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <div
                    className="text-xs font-mono uppercase tracking-widest mb-0.5"
                    style={{ color: "#A9B4C6" }}
                  >
                    Total Portfolio Value
                  </div>
                  <div
                    className="text-xl font-bold font-display"
                    style={{ color: "#D4AF37" }}
                    data-ocid="tx-history.portfolio-value.display"
                  >
                    {fmtUSD(totalPortfolio)}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-xs font-mono uppercase tracking-widest mb-0.5"
                    style={{ color: "#A9B4C6" }}
                  >
                    Asset
                  </div>
                  <div
                    className="text-sm font-bold font-mono"
                    style={{ color: "#F0B90B" }}
                  >
                    Bitcoin (BTC)
                  </div>
                </div>
              </div>

              {/* Total received */}
              <div
                className="flex items-center justify-between py-1.5"
                style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}
              >
                <span
                  className="text-xs font-mono uppercase tracking-wider"
                  style={{ color: "#A9B4C6" }}
                >
                  Total Received
                </span>
                <span
                  className="text-xs font-semibold font-mono"
                  style={{ color: "#2ECC71" }}
                >
                  +{fmtUSD(totalReceived)} ({creditCount} credits)
                </span>
              </div>

              {/* Company details */}
              <div
                className="pt-1.5 mt-1.5 space-y-1"
                style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-mono uppercase tracking-wider"
                    style={{ color: "#A9B4C6" }}
                  >
                    Account
                  </span>
                  <span
                    className="text-xs font-bold font-mono"
                    style={{ color: "#F2F5FA" }}
                  >
                    {CO_BANK_NAME} #{CO_ACCOUNT_NUMBER}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-mono uppercase tracking-wider"
                    style={{ color: "#A9B4C6" }}
                  >
                    Company BTC
                  </span>
                  <span
                    className="text-xs font-mono"
                    style={{ color: "#F0B90B" }}
                  >
                    {CO_BTC_ADDRESS.slice(0, 10)}…{CO_BTC_ADDRESS.slice(-8)}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable transactions list */}
          <div
            className="overflow-y-auto flex-1 px-6 py-4 space-y-2"
            data-ocid="tx-history.list"
          >
            {transactions.map((tx, idx) => {
              const { bg, color, border } = typeColor(tx.activityType);
              return (
                <button
                  type="button"
                  key={tx.id}
                  onClick={() => openDetail(tx)}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all hover:brightness-110 cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(34,50,74,0.7)",
                  }}
                  data-ocid={`tx-history.item.${idx + 1}`}
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: bg, border: `1.5px solid ${border}` }}
                  >
                    {activityIcon(tx.activityType)}
                  </div>

                  {/* Description + date */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs font-semibold truncate"
                      style={{ color: "#F2F5FA" }}
                    >
                      {tx.description}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs font-mono"
                        style={{ color: "#A9B4C6" }}
                      >
                        {fmtDate(tx.timestamp)}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0 rounded-full"
                        style={{
                          background: bg,
                          color,
                          border: `1px solid ${border}`,
                          fontSize: "10px",
                        }}
                      >
                        {typeLabel(tx.activityType)}
                      </span>
                    </div>
                    <div
                      className="text-xs font-mono mt-0.5"
                      style={{ color: "rgba(212,175,55,0.65)" }}
                    >
                      Ref: {tx.referenceId}
                    </div>
                  </div>

                  {/* Amounts + status */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div
                      className="text-sm font-bold font-mono"
                      style={{ color: "#D4AF37" }}
                    >
                      +{fmtUSD(tx.amount)}
                    </div>
                    <div
                      className="text-xs font-mono"
                      style={{ color: "#A9B4C6" }}
                    >
                      {tx.btcAmount}
                    </div>
                    <Badge
                      className="text-xs px-1.5 py-0"
                      style={{
                        background:
                          tx.status === "completed"
                            ? "rgba(46,204,113,0.15)"
                            : "rgba(255,165,0,0.15)",
                        color:
                          tx.status === "completed" ? "#2ECC71" : "#FFA500",
                        border:
                          tx.status === "completed"
                            ? "1px solid rgba(46,204,113,0.3)"
                            : "1px solid rgba(255,165,0,0.3)",
                      }}
                    >
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(34,50,74,0.8)" }}
          >
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full text-sm font-medium"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#A9B4C6",
              }}
              data-ocid="tx-history.close-bottom.button"
            >
              Close
            </Button>
          </div>

          {/* Bottom gold accent */}
          <div
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(212,175,55,0.25) 50%, transparent)",
            }}
          />
        </DialogContent>
      </Dialog>

      <TransactionDetailModal
        transaction={selectedTx}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
