import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Copy, FileText, Printer } from "lucide-react";
import { toast } from "sonner";

const BTC_ADDRESS = "bc1q88ancenmas6e0nfdl9kmvmtk5pq089ewp8wav7";
const USDT_ADDRESS = "TMvJhTBW3stUmk2U98XZ7LEaF9MySkajoY";

function NIPWCrestSmall() {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold"
      style={{
        width: 48,
        height: 48,
        background: "linear-gradient(135deg, #1a2840 0%, #22324a 100%)",
        border: "2px solid #D4AF37",
        color: "#D4AF37",
        fontSize: 20,
        boxShadow: "0 0 16px rgba(212,175,55,0.35)",
        flexShrink: 0,
      }}
    >
      ₦
    </div>
  );
}

function fmtUSD(v: number) {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function generateAccountId(name: string) {
  const cleaned = name.replace(/\s+/g, "").toUpperCase().slice(0, 4);
  const num =
    (Math.abs(
      name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) * 7919,
    ) %
      900000) +
    100000;
  return `NIPW-${cleaned}-${num}`;
}

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    date: "Mar 15, 2025",
    type: "Deposit — BTC",
    amount: 48750.0,
    status: "Completed",
    ref: "TXN-8A4C2F",
  },
  {
    id: 2,
    date: "Mar 01, 2025",
    type: "Monthly Interest",
    amount: 14567.8,
    status: "Completed",
    ref: "TXN-6E1B9D",
  },
  {
    id: 3,
    date: "Feb 18, 2025",
    type: "Deposit — BTC",
    amount: 49147.7,
    status: "Completed",
    ref: "TXN-3C7A4E",
  },
  {
    id: 4,
    date: "Feb 01, 2025",
    type: "Referral Bonus",
    amount: 2850.0,
    status: "Completed",
    ref: "TXN-1F5D8B",
  },
  {
    id: 5,
    date: "Jan 15, 2025",
    type: "Portfolio Yield",
    amount: 18240.5,
    status: "Completed",
    ref: "TXN-9A2C6E",
  },
];

export function AccountStatement({
  displayName,
  btcAddress: _btcAddress,
  totalUSD,
  totalBTC,
  onBack,
}: {
  displayName: string;
  btcAddress: string;
  totalUSD: number;
  totalBTC: number;
  onBack: () => void;
}) {
  const statementDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const accountId = generateAccountId(displayName);
  const statementNum = `NIPW-2025-${(Math.abs(displayName.split("").reduce((a, c) => a + c.charCodeAt(0), 0) * 1847) % 900000) + 100000}`;

  const copyAddress = async (addr: string, label: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      toast.success(`${label} copied!`, {
        description: `${addr.slice(0, 20)}...`,
      });
    } catch {
      toast.error("Failed to copy.");
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0B1220" }}
      data-ocid="statement.page"
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-container {
            background: white !important;
            color: black !important;
            padding: 20mm !important;
          }
          .print-card {
            border: 1px solid #ccc !important;
            background: #f9f9f9 !important;
            break-inside: avoid;
          }
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      `}</style>

      {/* Action Bar (hidden on print) */}
      <div
        className="no-print sticky top-0 z-50 w-full flex items-center justify-between px-6 py-3"
        style={{
          background: "rgba(11,18,32,0.97)",
          borderBottom: "1px solid #22324A",
          backdropFilter: "blur(12px)",
        }}
      >
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2 text-sm"
          style={{ color: "#A9B4C6" }}
          data-ocid="statement.back.button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="flex items-center gap-2 text-xs font-semibold"
            style={{
              background: "rgba(212,175,55,0.1)",
              border: "1px solid rgba(212,175,55,0.35)",
              color: "#D4AF37",
            }}
            data-ocid="statement.print.button"
          >
            <Printer className="w-4 h-4" />
            Print Statement
          </Button>
        </div>
      </div>

      {/* Statement Container */}
      <div className="print-container max-w-4xl mx-auto px-4 sm:px-8 py-10">
        {/* Header */}
        <div
          className="print-card rounded-2xl p-8 mb-6"
          style={{
            background: "linear-gradient(135deg, #0F1E35 0%, #162638 100%)",
            border: "1px solid rgba(212,175,55,0.35)",
            boxShadow:
              "0 4px 32px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.06)",
          }}
        >
          {/* Top gold line */}
          <div
            className="h-0.5 w-full mb-6 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, #D4AF37, transparent)",
            }}
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <NIPWCrestSmall />
              <div>
                <div
                  className="text-xl font-bold tracking-widest uppercase"
                  style={{
                    color: "#D4AF37",
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                  }}
                >
                  North Investors Profit Wallet
                </div>
                <div
                  className="text-xs font-mono tracking-widest"
                  style={{ color: "#A9B4C6" }}
                >
                  NIPW — Est. 2024 · Institutional Investment Platform
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1">
              <div
                className="flex items-center gap-2 text-xs font-mono"
                style={{ color: "#A9B4C6" }}
              >
                <FileText className="w-3.5 h-3.5" />
                ACCOUNT STATEMENT
              </div>
              <div className="text-xs font-mono" style={{ color: "#D4AF37" }}>
                #{statementNum}
              </div>
              <div className="text-xs font-mono" style={{ color: "#A9B4C6" }}>
                {statementDate}
              </div>
            </div>
          </div>

          {/* Bottom gold line */}
          <div
            className="h-0.5 w-full mt-6 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, #D4AF37, transparent)",
            }}
          />
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold tracking-widest uppercase"
            style={{
              background: "rgba(255,165,0,0.12)",
              border: "2px solid rgba(255,165,0,0.55)",
              color: "#FFA500",
              boxShadow: "0 0 20px rgba(255,165,0,0.15)",
            }}
            data-ocid="statement.status.badge"
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#FFA500" }}
            />
            PENDING ACTIVATION — AWAITING FINAL DEPOSIT
          </div>
        </div>

        {/* Account Holder + Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Account Holder */}
          <div
            className="print-card rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
              border: "1px solid #22324A",
            }}
            data-ocid="statement.account_holder.card"
          >
            <div
              className="text-xs font-mono uppercase tracking-widest mb-4 pb-2"
              style={{
                color: "#D4AF37",
                borderBottom: "1px solid rgba(212,175,55,0.2)",
              }}
            >
              Account Holder
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs" style={{ color: "#A9B4C6" }}>
                  Full Name
                </div>
                <div
                  className="text-base font-bold"
                  style={{ color: "#F2F5FA" }}
                >
                  {displayName}
                </div>
              </div>
              <div>
                <div className="text-xs" style={{ color: "#A9B4C6" }}>
                  Account ID
                </div>
                <div className="text-sm font-mono" style={{ color: "#D4AF37" }}>
                  {accountId}
                </div>
              </div>
              <div>
                <div className="text-xs" style={{ color: "#A9B4C6" }}>
                  Account Type
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#F2F5FA" }}
                >
                  Institutional Investor Account
                </div>
              </div>
              <div>
                <div className="text-xs" style={{ color: "#A9B4C6" }}>
                  Account Status
                </div>
                <Badge
                  style={{
                    background: "rgba(255,165,0,0.15)",
                    color: "#FFA500",
                    border: "1px solid rgba(255,165,0,0.35)",
                  }}
                >
                  Pending Activation
                </Badge>
              </div>
            </div>
          </div>

          {/* Account Summary */}
          <div
            className="print-card rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
              border: "1px solid #22324A",
            }}
            data-ocid="statement.summary.card"
          >
            <div
              className="text-xs font-mono uppercase tracking-widest mb-4 pb-2"
              style={{
                color: "#D4AF37",
                borderBottom: "1px solid rgba(212,175,55,0.2)",
              }}
            >
              Account Summary
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "Total Portfolio Value",
                  value: fmtUSD(totalUSD),
                  color: "#F2F5FA",
                },
                {
                  label: "Bitcoin Holdings",
                  value: `${totalBTC.toFixed(4)} BTC`,
                  color: "#D4AF37",
                },
                {
                  label: "Available for Withdrawal",
                  value: fmtUSD(487320.0),
                  color: "#F2F5FA",
                },
                {
                  label: "Required Activation Deposit",
                  value: fmtUSD(120000),
                  color: "#E74C3C",
                  highlight: true,
                },
                {
                  label: "Account Status",
                  value: "Pending Activation",
                  color: "#FFA500",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-1.5"
                  style={{
                    borderBottom: "1px solid rgba(34,50,74,0.5)",
                    background: row.highlight
                      ? "rgba(231,76,60,0.06)"
                      : "transparent",
                    borderRadius: row.highlight ? "6px" : undefined,
                    padding: row.highlight ? "6px 8px" : undefined,
                    margin: row.highlight ? "-2px -4px" : undefined,
                  }}
                >
                  <span className="text-xs" style={{ color: "#A9B4C6" }}>
                    {row.label}
                  </span>
                  <span
                    className="text-sm font-semibold font-mono"
                    style={{ color: row.color }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Deposit Instructions */}
        <div
          className="print-card rounded-xl mb-6 overflow-hidden"
          style={{
            border: "1px solid rgba(212,175,55,0.4)",
            boxShadow: "0 0 24px rgba(212,175,55,0.07)",
          }}
          data-ocid="statement.deposit.card"
        >
          <div
            className="px-6 pt-5 pb-3"
            style={{
              background: "linear-gradient(135deg, #1a2840 0%, #152236 100%)",
              borderBottom: "1px solid rgba(212,175,55,0.25)",
            }}
          >
            <div
              className="text-xs font-mono uppercase tracking-widest mb-1"
              style={{ color: "#D4AF37" }}
            >
              Required Deposit to Activate Account
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#C8D4E8" }}>
              To unlock your full balance and initiate withdrawal, a final
              activation deposit of{" "}
              <span className="font-bold" style={{ color: "#D4AF37" }}>
                $120,000.00
              </span>{" "}
              is required. Once that final deposit is made, your account becomes
              active and live instantly, and your full withdrawal will be
              processed immediately.
            </p>
          </div>

          <div
            className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5"
            style={{
              background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
            }}
          >
            {/* BTC */}
            <div>
              <div
                className="text-xs font-mono uppercase tracking-widest mb-2"
                style={{ color: "#A9B4C6" }}
              >
                Bitcoin (BTC) Deposit Address
              </div>
              <div
                className="rounded-lg p-3 font-mono text-xs break-all leading-relaxed mb-2"
                style={{
                  background: "rgba(11,18,32,0.7)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  color: "#D4AF37",
                  wordBreak: "break-all",
                }}
              >
                {BTC_ADDRESS}
              </div>
              <button
                type="button"
                onClick={() => copyAddress(BTC_ADDRESS, "BTC Address")}
                className="no-print flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: "rgba(212,175,55,0.12)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  color: "#D4AF37",
                }}
                data-ocid="statement.btc_address.button"
              >
                <Copy className="w-3 h-3" />
                Copy BTC Address
              </button>
            </div>

            {/* USDT */}
            <div>
              <div
                className="text-xs font-mono uppercase tracking-widest mb-2"
                style={{ color: "#A9B4C6" }}
              >
                USDT TRC-20 Deposit Address
              </div>
              <div
                className="rounded-lg p-3 font-mono text-xs break-all leading-relaxed mb-2"
                style={{
                  background: "rgba(11,18,32,0.7)",
                  border: "1px solid rgba(46,204,113,0.3)",
                  color: "#2ECC71",
                  wordBreak: "break-all",
                }}
              >
                {USDT_ADDRESS}
              </div>
              <button
                type="button"
                onClick={() => copyAddress(USDT_ADDRESS, "USDT Address")}
                className="no-print flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: "rgba(46,204,113,0.1)",
                  border: "1px solid rgba(46,204,113,0.3)",
                  color: "#2ECC71",
                }}
                data-ocid="statement.usdt_address.button"
              >
                <Copy className="w-3 h-3" />
                Copy USDT Address
              </button>
            </div>
          </div>

          {/* Policy note */}
          <div
            className="px-6 py-4"
            style={{
              background: "rgba(212,175,55,0.05)",
              borderTop: "1px solid rgba(212,175,55,0.2)",
            }}
          >
            <p className="text-xs leading-relaxed" style={{ color: "#A9B4C6" }}>
              <span style={{ color: "#D4AF37" }} className="font-semibold">
                Policy:
              </span>{" "}
              Once that final deposit is made, your account becomes active and
              live instantly, and your full withdrawal will be processed
              immediately.
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div
          className="print-card rounded-xl mb-6 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
            border: "1px solid #22324A",
          }}
          data-ocid="statement.transactions.card"
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid #22324A" }}
          >
            <div
              className="text-xs font-mono uppercase tracking-widest"
              style={{ color: "#D4AF37" }}
            >
              Recent Transactions
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderBottom: "1px solid #22324A" }}>
                  {[
                    "Date",
                    "Transaction Type",
                    "Reference",
                    "Amount",
                    "Status",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-xs font-mono uppercase tracking-wider"
                      style={{ color: "#A9B4C6" }}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_TRANSACTIONS.map((tx, idx) => (
                  <TableRow
                    key={tx.id}
                    style={{ borderBottom: "1px solid rgba(34,50,74,0.5)" }}
                    data-ocid={`statement.transaction.item.${idx + 1}`}
                  >
                    <TableCell
                      className="text-xs font-mono"
                      style={{ color: "#A9B4C6" }}
                    >
                      {tx.date}
                    </TableCell>
                    <TableCell
                      className="text-xs font-medium"
                      style={{ color: "#F2F5FA" }}
                    >
                      {tx.type}
                    </TableCell>
                    <TableCell
                      className="text-xs font-mono"
                      style={{ color: "#A9B4C6" }}
                    >
                      {tx.ref}
                    </TableCell>
                    <TableCell
                      className="text-xs font-semibold font-mono"
                      style={{ color: "#2ECC71" }}
                    >
                      +{fmtUSD(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="text-xs"
                        style={{
                          background: "rgba(46,204,113,0.15)",
                          color: "#2ECC71",
                          border: "1px solid rgba(46,204,113,0.3)",
                        }}
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div
          className="print-card rounded-xl p-6 text-center"
          style={{
            background: "rgba(9,14,26,0.8)",
            border: "1px solid #22324A",
          }}
          data-ocid="statement.footer.card"
        >
          <div className="flex justify-center mb-3">
            <NIPWCrestSmall />
          </div>
          <div
            className="text-sm font-bold tracking-widest uppercase mb-1"
            style={{ color: "#D4AF37" }}
          >
            North Investors Profit Wallet
          </div>
          <div className="text-xs font-mono mb-1" style={{ color: "#A9B4C6" }}>
            Established 2024 · Institutional Bitcoin Investment Platform
          </div>
          <a
            href="tel:+12742015975"
            className="text-xs font-mono"
            style={{ color: "#D4AF37" }}
          >
            1 (274) 201-5975
          </a>
          <div
            className="mt-4 pt-4 text-xs leading-relaxed"
            style={{ color: "#5A6880", borderTop: "1px solid #22324A" }}
          >
            This statement is generated for informational purposes. All figures
            are subject to market fluctuations. North Investors Profit Wallet is
            not a registered securities broker-dealer. Investment in digital
            assets carries significant risk. Past performance does not guarantee
            future results. © {new Date().getFullYear()} North Investors Profit
            Wallet. All rights reserved.
          </div>
        </div>

        {/* Bottom action buttons */}
        <div
          className="no-print flex flex-col sm:flex-row gap-3 mt-6 justify-center"
          data-ocid="statement.actions.panel"
        >
          <Button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)",
              color: "#0B1220",
              border: "none",
              boxShadow: "0 2px 12px rgba(212,175,55,0.3)",
            }}
            data-ocid="statement.print_bottom.button"
          >
            <Printer className="w-4 h-4" />
            Print / Download Statement
          </Button>
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center justify-center gap-2 text-sm font-semibold"
            style={{
              background: "transparent",
              border: "1px solid #22324A",
              color: "#A9B4C6",
            }}
            data-ocid="statement.back_bottom.button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
