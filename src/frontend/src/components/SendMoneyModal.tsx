import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Step = "recipient" | "confirm" | "success";
type Network = "BTC" | "USDT";
type RecipientType = "gmail" | "phone";

const STEP_LABELS: Record<Exclude<Step, "success">, string> = {
  recipient: "Recipient Details",
  confirm: "Confirm Transfer",
};

function generateRef() {
  return `TRF-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function SendMoneyModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [step, setStep] = useState<Step>("recipient");
  const [recipientType, setRecipientType] = useState<RecipientType>("gmail");
  const [gmailInput, setGmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<Network>("BTC");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refNum] = useState(generateRef);

  const recipient = recipientType === "gmail" ? gmailInput : phoneInput;
  const fee = amount ? (Number.parseFloat(amount) * 0.005).toFixed(2) : "0.00";
  const total = amount
    ? (Number.parseFloat(amount) + Number.parseFloat(fee)).toFixed(2)
    : "0.00";

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("recipient");
      setGmailInput("");
      setPhoneInput("");
      setAmount("");
      setErrors({});
      setRecipientType("gmail");
      setNetwork("BTC");
    }, 300);
  };

  const validateRecipient = () => {
    const errs: Record<string, string> = {};
    if (recipientType === "gmail") {
      if (!gmailInput.trim()) errs.recipient = "Gmail address is required.";
      else if (!gmailInput.includes("@") || !gmailInput.includes("."))
        errs.recipient = "Enter a valid email address.";
    } else {
      if (!phoneInput.trim()) errs.recipient = "Phone number is required.";
      else if (phoneInput.replace(/\D/g, "").length < 7)
        errs.recipient = "Enter a valid phone number.";
    }
    if (!amount.trim() || Number.parseFloat(amount) <= 0)
      errs.amount = "Enter a valid amount greater than 0.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (!validateRecipient()) return;
    setStep("confirm");
  };

  const handleConfirm = () => {
    setStep("success");
    toast.success("Transfer Initiated", {
      description: `Reference: ${refNum}`,
    });
  };

  const toLabel =
    recipientType === "gmail" ? "To (Gmail Address)" : "To (Phone Number)";

  const cardStyle = {
    background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
    border: "1px solid #22324A",
    borderRadius: "10px",
    padding: "16px",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          background: "linear-gradient(135deg, #0F1A2B 0%, #16263E 100%)",
          border: "1px solid #22324A",
          color: "#F2F5FA",
        }}
        data-ocid="send_money.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(212,175,55,0.15)",
                border: "1px solid rgba(212,175,55,0.35)",
              }}
            >
              <Send className="w-4 h-4" style={{ color: "#D4AF37" }} />
            </div>
            <DialogTitle
              className="text-base font-bold"
              style={{ color: "#F2F5FA" }}
            >
              Send Money
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Stepper */}
        {step !== "success" && (
          <div className="flex items-center gap-2 mb-2">
            {(["recipient", "confirm"] as Exclude<Step, "success">[]).map(
              (s, idx) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background:
                        step === s || (s === "recipient" && step === "confirm")
                          ? "#D4AF37"
                          : "rgba(34,50,74,0.8)",
                      color:
                        step === s || (s === "recipient" && step === "confirm")
                          ? "#0B1220"
                          : "#A9B4C6",
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: step === s ? "#D4AF37" : "#A9B4C6" }}
                  >
                    {STEP_LABELS[s]}
                  </span>
                  {idx < 1 && (
                    <div
                      className="w-6 h-px"
                      style={{ background: "#22324A" }}
                    />
                  )}
                </div>
              ),
            )}
          </div>
        )}

        {/* Recipient Step */}
        {step === "recipient" && (
          <div className="space-y-4" data-ocid="send_money.recipient.panel">
            {/* Tab Switcher */}
            <div
              className="flex rounded-lg overflow-hidden"
              style={{
                border: "1px solid #22324A",
                background: "rgba(11,18,32,0.5)",
              }}
            >
              {(["gmail", "phone"] as RecipientType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setRecipientType(t);
                    setErrors({});
                  }}
                  className="flex-1 py-2 text-xs font-semibold capitalize transition-all"
                  style={{
                    background:
                      recipientType === t
                        ? "rgba(212,175,55,0.2)"
                        : "transparent",
                    color: recipientType === t ? "#D4AF37" : "#A9B4C6",
                    border: "none",
                  }}
                  data-ocid={`send_money.${t}.tab`}
                >
                  {t === "gmail" ? "Gmail Address" : "Phone Number"}
                </button>
              ))}
            </div>

            {/* Recipient Input */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "#A9B4C6" }}>
                {recipientType === "gmail"
                  ? "Recipient's Gmail Address"
                  : "Recipient's Phone Number"}
              </Label>
              {recipientType === "gmail" ? (
                <Input
                  type="email"
                  value={gmailInput}
                  onChange={(e) => setGmailInput(e.target.value)}
                  placeholder="recipient@gmail.com"
                  autoComplete="email"
                  className="text-sm"
                  style={{
                    background: "rgba(11,18,32,0.7)",
                    border: errors.recipient
                      ? "1px solid #E74C3C"
                      : "1px solid #22324A",
                    color: "#F2F5FA",
                  }}
                  data-ocid="send_money.gmail.input"
                />
              ) : (
                <Input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  autoComplete="tel"
                  className="text-sm"
                  style={{
                    background: "rgba(11,18,32,0.7)",
                    border: errors.recipient
                      ? "1px solid #E74C3C"
                      : "1px solid #22324A",
                    color: "#F2F5FA",
                  }}
                  data-ocid="send_money.phone.input"
                />
              )}
              {errors.recipient && (
                <p
                  className="text-xs"
                  style={{ color: "#E74C3C" }}
                  data-ocid="send_money.recipient.error_state"
                >
                  {errors.recipient}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "#A9B4C6" }}>
                Amount (USD)
              </Label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold"
                  style={{ color: "#D4AF37" }}
                >
                  $
                </span>
                <Input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7 text-sm"
                  style={{
                    background: "rgba(11,18,32,0.7)",
                    border: errors.amount
                      ? "1px solid #E74C3C"
                      : "1px solid #22324A",
                    color: "#F2F5FA",
                  }}
                  data-ocid="send_money.amount.input"
                />
              </div>
              {errors.amount && (
                <p
                  className="text-xs"
                  style={{ color: "#E74C3C" }}
                  data-ocid="send_money.amount.error_state"
                >
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Network */}
            <div className="space-y-1.5">
              <Label className="text-xs" style={{ color: "#A9B4C6" }}>
                Network
              </Label>
              <div className="flex gap-3">
                {(["BTC", "USDT"] as Network[]).map((n) => (
                  <label
                    key={n}
                    className="flex items-center gap-2 cursor-pointer flex-1 py-2.5 px-3 rounded-lg"
                    style={{
                      background:
                        network === n
                          ? "rgba(212,175,55,0.12)"
                          : "rgba(11,18,32,0.5)",
                      border:
                        network === n
                          ? "1px solid rgba(212,175,55,0.45)"
                          : "1px solid #22324A",
                    }}
                    data-ocid={`send_money.${n.toLowerCase()}.radio`}
                  >
                    <input
                      type="radio"
                      name="network"
                      value={n}
                      checked={network === n}
                      onChange={() => setNetwork(n)}
                      style={{ accentColor: "#D4AF37" }}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: network === n ? "#D4AF37" : "#A9B4C6" }}
                    >
                      {n === "USDT" ? "USDT TRC-20" : "Bitcoin (BTC)"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              className="w-full font-semibold"
              onClick={handleContinue}
              style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)",
                color: "#0B1220",
                border: "none",
              }}
              data-ocid="send_money.continue.button"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Confirm Step */}
        {step === "confirm" && (
          <div className="space-y-4" data-ocid="send_money.confirm.panel">
            <div style={cardStyle}>
              <div className="space-y-3">
                {[
                  { label: toLabel, value: recipient },
                  {
                    label: "Amount",
                    value: `$${Number.parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                  },
                  {
                    label: "Network",
                    value: network === "USDT" ? "USDT TRC-20" : "Bitcoin (BTC)",
                  },
                  { label: "Estimated Fee (0.5%)", value: `$${fee}` },
                  {
                    label: "Total Deducted",
                    value: `$${Number.parseFloat(total).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs" style={{ color: "#A9B4C6" }}>
                      {row.label}
                    </span>
                    <span
                      className="text-xs font-semibold font-mono"
                      style={{ color: "#F2F5FA" }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-lg p-3 flex items-start gap-2"
              style={{
                background: "rgba(231,76,60,0.08)",
                border: "1px solid rgba(231,76,60,0.3)",
              }}
            >
              <AlertTriangle
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "#E74C3C" }}
              />
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#C8D4E8" }}
              >
                Crypto transfers are irreversible. Verify all details before
                confirming. NIPW is not responsible for funds sent to incorrect
                addresses.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 text-sm"
                onClick={() => setStep("recipient")}
                style={{
                  background: "transparent",
                  border: "1px solid #22324A",
                  color: "#A9B4C6",
                }}
                data-ocid="send_money.back.button"
              >
                Back
              </Button>
              <Button
                className="flex-1 font-semibold text-sm"
                onClick={handleConfirm}
                style={{
                  background:
                    "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)",
                  color: "#0B1220",
                  border: "none",
                }}
                data-ocid="send_money.confirm.button"
              >
                Confirm &amp; Send
              </Button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div
            className="text-center py-4 space-y-4"
            data-ocid="send_money.success_state"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{
                background: "rgba(46,204,113,0.15)",
                border: "2px solid rgba(46,204,113,0.4)",
              }}
            >
              <CheckCircle2 className="w-8 h-8" style={{ color: "#2ECC71" }} />
            </div>
            <div>
              <div className="text-base font-bold" style={{ color: "#F2F5FA" }}>
                Transfer Initiated
              </div>
              <p className="text-xs mt-1" style={{ color: "#A9B4C6" }}>
                Your transfer is being processed on the {network} network.
              </p>
            </div>
            <div
              className="rounded-lg py-2 px-4 text-xs font-mono"
              style={{
                background: "rgba(11,18,32,0.7)",
                border: "1px solid #22324A",
                color: "#D4AF37",
              }}
            >
              Reference: {refNum}
            </div>
            <Button
              className="w-full font-semibold"
              onClick={handleClose}
              style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)",
                color: "#0B1220",
                border: "none",
              }}
              data-ocid="send_money.close.button"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
