import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bitcoin, Check, Copy, CreditCard, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── QR Code Canvas ───────────────────────────────────────────────────────────

function QrCodeCanvas({
  value,
  size = 160,
}: {
  value: string;
  size?: number;
  color?: string;
}) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=0B1220&color=D4AF37&margin=2`;
  return (
    <div className="flex justify-center py-4">
      <img
        src={qrUrl}
        alt="QR Code"
        width={size}
        height={size}
        style={{ borderRadius: "8px", border: "1px solid rgba(34,50,74,0.8)" }}
      />
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CopyableAddress({
  address,
  label,
  ocid,
}: {
  address: string;
  label: string;
  ocid: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2"
      style={{ background: "#0B1220", border: "1px solid #22324A" }}
    >
      <span
        className="flex-1 text-xs font-mono truncate"
        style={{ color: "#A9B4C6" }}
      >
        {address}
      </span>
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg transition-all hover:brightness-110 active:scale-95 flex-shrink-0"
        style={{
          background: copied ? "rgba(34,197,94,0.15)" : "rgba(212,175,55,0.12)",
          border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(212,175,55,0.3)"}`,
        }}
        type="button"
        aria-label={`Copy ${label}`}
        data-ocid={ocid}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5" style={{ color: "#22C55E" }} />
        ) : (
          <Copy className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} />
        )}
      </button>
    </div>
  );
}

// ─── Card Tab ─────────────────────────────────────────────────────────────────

function CardTab() {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  function formatCardNumber(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  function detectBrand(num: string): string | null {
    const n = num.replace(/\s/g, "");
    if (/^4/.test(n)) return "VISA";
    if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "MC";
    return null;
  }

  const brand = detectBrand(cardNumber);

  return (
    <div className="flex flex-col gap-4">
      {/* Card brand badges */}
      <div className="flex items-center gap-2">
        <span
          className="px-2.5 py-1 rounded text-xs font-bold tracking-wide"
          style={{
            background: brand === "VISA" ? "#1A3C8A" : "rgba(34,50,74,0.8)",
            border: `1px solid ${brand === "VISA" ? "#2E5CD6" : "#22324A"}`,
            color: brand === "VISA" ? "#6BA3FF" : "#A9B4C6",
          }}
        >
          VISA
        </span>
        <span
          className="px-2.5 py-1 rounded text-xs font-bold tracking-wide"
          style={{
            background:
              brand === "MC" ? "rgba(235,87,22,0.2)" : "rgba(34,50,74,0.8)",
            border: `1px solid ${
              brand === "MC" ? "rgba(235,87,22,0.5)" : "#22324A"
            }`,
            color: brand === "MC" ? "#F97316" : "#A9B4C6",
          }}
        >
          MASTERCARD
        </span>
        <span
          className="ml-auto flex items-center gap-1 text-xs"
          style={{ color: "#22C55E" }}
        >
          <Lock className="w-3 h-3" />
          256-bit SSL
        </span>
      </div>

      {/* Cardholder Name */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="card-name"
          className="text-xs font-medium"
          style={{ color: "#A9B4C6" }}
        >
          Cardholder Name
        </Label>
        <Input
          id="card-name"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="Full name on card"
          className="h-10 text-sm"
          style={{
            background: "#0B1220",
            border: "1px solid #22324A",
            color: "#F2F5FA",
          }}
          data-ocid="payment.card_name.input"
        />
      </div>

      {/* Card Number */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="card-number"
          className="text-xs font-medium"
          style={{ color: "#A9B4C6" }}
        >
          Card Number
        </Label>
        <Input
          id="card-number"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="XXXX XXXX XXXX XXXX"
          className="h-10 text-sm font-mono"
          style={{
            background: "#0B1220",
            border: "1px solid #22324A",
            color: "#F2F5FA",
          }}
          data-ocid="payment.card_number.input"
        />
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="card-expiry"
            className="text-xs font-medium"
            style={{ color: "#A9B4C6" }}
          >
            Expiry Date
          </Label>
          <Input
            id="card-expiry"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            className="h-10 text-sm font-mono"
            style={{
              background: "#0B1220",
              border: "1px solid #22324A",
              color: "#F2F5FA",
            }}
            data-ocid="payment.card_expiry.input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="card-cvv"
            className="text-xs font-medium"
            style={{ color: "#A9B4C6" }}
          >
            CVV
          </Label>
          <Input
            id="card-cvv"
            value={cvv}
            onChange={(e) =>
              setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="•••"
            type="password"
            className="h-10 text-sm font-mono"
            style={{
              background: "#0B1220",
              border: "1px solid #22324A",
              color: "#F2F5FA",
            }}
            data-ocid="payment.card_cvv.input"
          />
        </div>
      </div>

      {/* Pay Now button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                disabled
                className="w-full h-11 text-sm font-semibold rounded-xl cursor-not-allowed opacity-80"
                style={{
                  background:
                    "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)",
                  color: "#0B1220",
                }}
                data-ocid="payment.card.submit_button"
              >
                <Lock className="w-4 h-4 mr-2" />
                Pay Now — Secure Checkout
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent
            style={{
              background: "#16263E",
              border: "1px solid #22324A",
              color: "#F2F5FA",
            }}
          >
            Payments processed securely via 256-bit SSL encryption
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <p className="text-center text-xs" style={{ color: "#A9B4C6" }}>
        🔒 256-bit SSL encrypted. Your card details are safe.
      </p>
    </div>
  );
}

// ─── Bitcoin Tab ─────────────────────────────────────────────────────────────

const BTC_ADDRESS = "bc1q88ancenmas6e0nfdl9kmvmtk5pq089ewp8wav7";

function BitcoinTab() {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center gap-3 p-4 rounded-xl"
        style={{
          background: "linear-gradient(135deg, #1A1200 0%, #251C00 100%)",
          border: "1px solid rgba(212,175,55,0.2)",
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(212,175,55,0.15)" }}
        >
          <Bitcoin className="w-5 h-5" style={{ color: "#D4AF37" }} />
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: "#D4AF37" }}>
            Bitcoin (BTC)
          </div>
          <div className="text-xs" style={{ color: "#A9B4C6" }}>
            Bitcoin Network (BTC)
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium" style={{ color: "#A9B4C6" }}>
          Deposit Address
        </Label>
        <CopyableAddress
          address={BTC_ADDRESS}
          label="Bitcoin address"
          ocid="payment.btc_address.button"
        />
      </div>

      <QrCodeCanvas value={BTC_ADDRESS} color="#D4AF37" />

      <div
        className="rounded-xl p-3 flex flex-col gap-1"
        style={{
          background: "rgba(212,175,55,0.06)",
          border: "1px solid rgba(212,175,55,0.2)",
        }}
      >
        <p className="text-xs font-medium" style={{ color: "#D4AF37" }}>
          ⚠️ Important
        </p>
        <p className="text-xs" style={{ color: "#A9B4C6" }}>
          Send only <strong style={{ color: "#F2F5FA" }}>Bitcoin (BTC)</strong>{" "}
          to this address. Minimum deposit:{" "}
          <strong style={{ color: "#F2F5FA" }}>$100 equivalent</strong>. Sending
          any other asset to this address may result in permanent loss.
        </p>
      </div>
    </div>
  );
}

// ─── USDT Tab ─────────────────────────────────────────────────────────────────

const USDT_TRC20_ADDRESS = "TMvJhTBW3stUmk2U98XZ7LEaF9MySkajoY";
const USDT_ERC20_ADDRESS = "ERC20_WALLET_ADDRESS_PLACEHOLDER";

function USDTTab() {
  const [network, setNetwork] = useState<"trc20" | "erc20">("trc20");
  const address = network === "trc20" ? USDT_TRC20_ADDRESS : USDT_ERC20_ADDRESS;

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center gap-3 p-4 rounded-xl"
        style={{
          background: "linear-gradient(135deg, #001A10 0%, #00251A 100%)",
          border: "1px solid rgba(34,197,94,0.2)",
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(34,197,94,0.12)" }}
        >
          <span className="text-lg font-bold" style={{ color: "#22C55E" }}>
            ₮
          </span>
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: "#22C55E" }}>
            Tether (USDT)
          </div>
          <div className="text-xs" style={{ color: "#A9B4C6" }}>
            {network === "trc20"
              ? "Tron Network (TRC-20)"
              : "Ethereum Network (ERC-20)"}
          </div>
        </div>
      </div>

      {/* Network selector */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium" style={{ color: "#A9B4C6" }}>
          Network
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {(["trc20", "erc20"] as const).map((net) => (
            <button
              key={net}
              onClick={() => setNetwork(net)}
              className="py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background:
                  network === net
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(34,50,74,0.6)",
                border: `1px solid ${
                  network === net ? "rgba(34,197,94,0.4)" : "#22324A"
                }`,
                color: network === net ? "#22C55E" : "#A9B4C6",
              }}
              type="button"
              data-ocid={`payment.usdt_${net}.toggle`}
            >
              {net === "trc20" ? "TRC-20 (Tron)" : "ERC-20 (Ethereum)"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium" style={{ color: "#A9B4C6" }}>
          Deposit Address
        </Label>
        <CopyableAddress
          address={address}
          label="USDT address"
          ocid="payment.usdt_address.button"
        />
      </div>

      <QrCodeCanvas value={address} color="#22C55E" />

      <div
        className="rounded-xl p-3 flex flex-col gap-1"
        style={{
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
        }}
      >
        <p className="text-xs font-medium" style={{ color: "#EF4444" }}>
          ⚠️ Critical Warning
        </p>
        <p className="text-xs" style={{ color: "#A9B4C6" }}>
          Send only <strong style={{ color: "#F2F5FA" }}>USDT</strong> to this
          address on the selected{" "}
          <strong style={{ color: "#F2F5FA" }}>
            {network === "trc20" ? "TRC-20 (Tron)" : "ERC-20 (Ethereum)"}
          </strong>{" "}
          network. Sending wrong assets or wrong network will result in{" "}
          <strong style={{ color: "#EF4444" }}>permanent loss</strong>.
        </p>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md w-full p-0 gap-0 overflow-hidden rounded-2xl"
        style={{
          background: "#0F1B2D",
          border: "1px solid #22324A",
          boxShadow: "0 8px 48px rgba(0,0,0,0.7)",
        }}
        data-ocid="payment.modal"
      >
        <DialogHeader
          className="px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid #22324A" }}
        >
          <DialogTitle
            className="flex items-center gap-2 text-base font-bold"
            style={{ color: "#F2F5FA" }}
          >
            <CreditCard className="w-5 h-5" style={{ color: "#D4AF37" }} />
            Fund Your Account
          </DialogTitle>
          <p className="text-xs mt-1" style={{ color: "#A9B4C6" }}>
            Choose a payment method to deposit funds to your NIPW wallet.
          </p>
        </DialogHeader>

        <Tabs defaultValue="card" className="w-full">
          <TabsList
            className="w-full rounded-none h-10 p-0"
            style={{
              background: "#0B1220",
              borderBottom: "1px solid #22324A",
            }}
          >
            {[
              { value: "card", label: "💳 Card" },
              { value: "bitcoin", label: "₿ Bitcoin" },
              { value: "usdt", label: "₮ USDT" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-1 h-full rounded-none text-xs font-semibold transition-colors data-[state=active]:text-[#D4AF37]"
                style={{}}
                data-ocid={`payment.${tab.value}.tab`}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="px-6 py-5">
            <TabsContent value="card" className="mt-0">
              <CardTab />
            </TabsContent>
            <TabsContent value="bitcoin" className="mt-0">
              <BitcoinTab />
            </TabsContent>
            <TabsContent value="usdt" className="mt-0">
              <USDTTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
