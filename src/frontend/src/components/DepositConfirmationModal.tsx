import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, ChevronRight, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";

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

type Step = 1 | 2 | 3;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmed?: () => void;
  displayName: string;
  requiredDeposit: number;
}

function fmtUSD(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function DepositConfirmationModal({
  isOpen,
  onClose,
  onConfirmed,
  displayName,
  requiredDeposit,
}: Props) {
  const [step, setStep] = useState<Step>(1);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [amountSent, setAmountSent] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refNumber, setRefNumber] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accountId = generateAccountId(displayName);

  const handleClose = () => {
    setStep(1);
    setReceiptFile(null);
    setAmountSent("");
    setPaymentMethod("");
    setNotes("");
    setIsSubmitting(false);
    setRefNumber("");
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setReceiptFile(file);
  };

  const handleStep1Next = () => {
    if (!receiptFile || !amountSent || !paymentMethod) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate processing delay
    await new Promise((res) => setTimeout(res, 1800));
    const rndNum = Math.floor(100000 + Math.random() * 900000);
    setRefNumber(`NIPW-REF-${rndNum}`);
    setStep(3);
    setIsSubmitting(false);
    // Notify parent of confirmed deposit
    onConfirmed?.();
  };

  const step1Valid = !!receiptFile && !!amountSent && !!paymentMethod;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="sm:max-w-lg w-full"
        style={{
          background: "linear-gradient(135deg, #0F1A2B 0%, #162638 100%)",
          border: "1px solid rgba(212,175,55,0.35)",
          color: "#F2F5FA",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        data-ocid="deposit_confirm.dialog"
      >
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(212,175,55,0.15)",
                border: "1px solid rgba(212,175,55,0.35)",
              }}
            >
              <Upload className="w-5 h-5" style={{ color: "#D4AF37" }} />
            </div>
            <div>
              <DialogTitle
                className="text-base font-bold"
                style={{ color: "#F2F5FA" }}
              >
                Confirm Your Deposit
              </DialogTitle>
              <p className="text-xs" style={{ color: "#A9B4C6" }}>
                Required deposit: {fmtUSD(requiredDeposit)}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          {step < 3 && (
            <div className="flex items-center gap-2 mt-3">
              {([1, 2] as const).map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                    style={{
                      background:
                        step >= s
                          ? "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)"
                          : "rgba(34,50,74,0.8)",
                      color: step >= s ? "#0B1220" : "#A9B4C6",
                      border:
                        step >= s ? "none" : "1px solid rgba(34,50,74,0.8)",
                    }}
                  >
                    {s}
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: step >= s ? "#D4AF37" : "#A9B4C6" }}
                  >
                    {s === 1 ? "Receipt Upload" : "Account Details"}
                  </span>
                  {s < 2 && (
                    <ChevronRight
                      className="w-3.5 h-3.5"
                      style={{ color: "#A9B4C6" }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* ─── Step 1: Receipt Upload ───────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4 mt-2">
            {/* File Upload Area */}
            <div>
              <Label
                className="text-xs font-medium mb-2 block"
                style={{ color: "#A9B4C6" }}
              >
                Transfer Receipt / Screenshot *
              </Label>
              <button
                type="button"
                className="w-full rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:brightness-110"
                style={{
                  borderColor: receiptFile
                    ? "rgba(46,204,113,0.5)"
                    : "rgba(212,175,55,0.3)",
                  background: receiptFile
                    ? "rgba(46,204,113,0.05)"
                    : "rgba(11,18,32,0.5)",
                }}
                onClick={() => fileInputRef.current?.click()}
                data-ocid="deposit_confirm.dropzone"
              >
                <Upload
                  className="w-8 h-8"
                  style={{
                    color: receiptFile ? "#2ECC71" : "#D4AF37",
                  }}
                />
                {receiptFile ? (
                  <div className="text-center">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#2ECC71" }}
                    >
                      ✓ {receiptFile.name}
                    </p>
                    <p className="text-xs" style={{ color: "#A9B4C6" }}>
                      Click to replace
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#F2F5FA" }}
                    >
                      Upload your transfer receipt
                    </p>
                    <p className="text-xs" style={{ color: "#A9B4C6" }}>
                      PNG, JPG, PDF accepted · Click to browse
                    </p>
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                data-ocid="deposit_confirm.upload_button"
              />
            </div>

            {/* Amount Sent */}
            <div>
              <Label
                htmlFor="amount-sent"
                className="text-xs font-medium mb-1.5 block"
                style={{ color: "#A9B4C6" }}
              >
                Amount Sent (USD) *
              </Label>
              <Input
                id="amount-sent"
                type="number"
                placeholder={`${requiredDeposit}`}
                value={amountSent}
                onChange={(e) => setAmountSent(e.target.value)}
                className="text-sm"
                style={{
                  background: "rgba(11,18,32,0.7)",
                  border: "1px solid #22324A",
                  color: "#F2F5FA",
                }}
                data-ocid="deposit_confirm.amount.input"
              />
            </div>

            {/* Payment Method */}
            <div>
              <Label
                className="text-xs font-medium mb-1.5 block"
                style={{ color: "#A9B4C6" }}
              >
                Payment Method *
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger
                  className="text-sm"
                  style={{
                    background: "rgba(11,18,32,0.7)",
                    border: "1px solid #22324A",
                    color: paymentMethod ? "#F2F5FA" : "#A9B4C6",
                  }}
                  data-ocid="deposit_confirm.method.select"
                >
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "#162638",
                    border: "1px solid #22324A",
                    color: "#F2F5FA",
                  }}
                >
                  <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="usdt">USDT TRC-20</SelectItem>
                  <SelectItem value="debit">Debit / Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full font-semibold text-sm"
              disabled={!step1Valid}
              onClick={handleStep1Next}
              style={{
                background: step1Valid
                  ? "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)"
                  : "rgba(34,50,74,0.5)",
                color: step1Valid ? "#0B1220" : "#A9B4C6",
                border: "none",
              }}
              data-ocid="deposit_confirm.next.button"
            >
              Continue to Account Verification
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* ─── Step 2: Account Details ──────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4 mt-2">
            {/* Account Details Display */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                background: "rgba(11,18,32,0.6)",
                border: "1px solid rgba(212,175,55,0.25)",
              }}
              data-ocid="deposit_confirm.account.panel"
            >
              <div
                className="text-xs font-mono uppercase tracking-widest pb-2"
                style={{
                  color: "#D4AF37",
                  borderBottom: "1px solid rgba(212,175,55,0.2)",
                }}
              >
                Your Account Details
              </div>
              {[
                { label: "Account Name", value: displayName },
                {
                  label: "Account ID",
                  value: accountId,
                  mono: true,
                  color: "#D4AF37",
                },
                {
                  label: "Account Type",
                  value: "Institutional Investor Account",
                },
                {
                  label: "BTC Address",
                  value: "bc1q88ancenmas6e0nfdl9kmvmtk5pq089ewp8wav7",
                  mono: true,
                  truncate: true,
                  color: "#D4AF37",
                },
                {
                  label: "USDT (TRC-20)",
                  value: "TMvJhTBW3stUmk2U98XZ7LEaF9MySkajoY",
                  mono: true,
                  truncate: true,
                  color: "#2ECC71",
                },
                {
                  label: "Amount Confirmed",
                  value: fmtUSD(Number(amountSent) || requiredDeposit),
                  color: "#2ECC71",
                },
                {
                  label: "Payment Method",
                  value:
                    paymentMethod === "bitcoin"
                      ? "Bitcoin (BTC)"
                      : paymentMethod === "usdt"
                        ? "USDT TRC-20"
                        : "Debit / Credit Card",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-3"
                >
                  <span
                    className="text-xs flex-shrink-0"
                    style={{ color: "#8A95A8" }}
                  >
                    {row.label}
                  </span>
                  <span
                    className={`text-xs font-semibold text-right ${
                      row.mono ? "font-mono" : ""
                    } ${row.truncate ? "truncate max-w-[180px]" : ""}`}
                    style={{ color: row.color ?? "#F2F5FA" }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div>
              <Label
                htmlFor="notes"
                className="text-xs font-medium mb-1.5 block"
                style={{ color: "#A9B4C6" }}
              >
                Additional Notes (optional)
              </Label>
              <Input
                id="notes"
                placeholder="Any transaction reference or details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-sm"
                style={{
                  background: "rgba(11,18,32,0.7)",
                  border: "1px solid #22324A",
                  color: "#F2F5FA",
                }}
                data-ocid="deposit_confirm.notes.input"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 text-sm"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                style={{
                  background: "transparent",
                  border: "1px solid #22324A",
                  color: "#A9B4C6",
                }}
                data-ocid="deposit_confirm.back.button"
              >
                Back
              </Button>
              <Button
                className="flex-1 font-semibold text-sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  background:
                    "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)",
                  color: "#0B1220",
                  border: "none",
                  boxShadow: "0 2px 12px rgba(212,175,55,0.3)",
                }}
                data-ocid="deposit_confirm.submit_button"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {isSubmitting ? "Submitting..." : "Submit Receipt"}
              </Button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Confirmation ─────────────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center py-4 space-y-5">
            {/* Animated checkmark */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(46,204,113,0.15)",
                border: "2px solid rgba(46,204,113,0.5)",
                boxShadow: "0 0 32px rgba(46,204,113,0.2)",
              }}
              data-ocid="deposit_confirm.success_state"
            >
              <CheckCircle2
                className="w-10 h-10"
                style={{ color: "#2ECC71" }}
              />
            </div>

            <div>
              <h3
                className="text-xl font-bold font-display mb-1"
                style={{ color: "#F2F5FA" }}
              >
                Receipt Submitted Successfully
              </h3>
              <p className="text-sm" style={{ color: "#A9B4C6" }}>
                Your deposit confirmation has been received.
              </p>
            </div>

            {/* Reference number */}
            <div
              className="w-full rounded-xl p-4"
              style={{
                background: "rgba(46,204,113,0.08)",
                border: "1px solid rgba(46,204,113,0.3)",
              }}
            >
              <div
                className="text-xs font-mono uppercase tracking-widest mb-2"
                style={{ color: "#A9B4C6" }}
              >
                Reference Number
              </div>
              <div
                className="text-lg font-bold font-mono"
                style={{ color: "#2ECC71" }}
              >
                {refNumber}
              </div>
            </div>

            {/* Badge */}
            <Badge
              style={{
                background: "rgba(255,165,0,0.12)",
                color: "#FFA500",
                border: "1px solid rgba(255,165,0,0.35)",
                padding: "6px 14px",
                fontSize: "11px",
              }}
            >
              ⏳ Under Review — 24 Hour Processing
            </Badge>

            {/* Message */}
            <div
              className="rounded-xl p-4 text-left"
              style={{
                background: "rgba(11,18,32,0.6)",
                border: "1px solid rgba(212,175,55,0.2)",
              }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#C8D4E8" }}
              >
                Our team is reviewing your deposit. Your account will be
                activated within{" "}
                <span className="font-bold" style={{ color: "#D4AF37" }}>
                  24 hours
                </span>
                . Once confirmed, your full balance of{" "}
                <span className="font-bold" style={{ color: "#2ECC71" }}>
                  $600,000
                </span>{" "}
                will be available for withdrawal immediately.
              </p>
            </div>

            <p className="text-xs" style={{ color: "#5A6880" }}>
              Save your reference number: {refNumber}. Our support team may
              contact you for additional verification.
            </p>

            <Button
              className="w-full font-semibold text-sm"
              onClick={handleClose}
              style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)",
                color: "#0B1220",
                border: "none",
                boxShadow: "0 2px 12px rgba(212,175,55,0.3)",
              }}
              data-ocid="deposit_confirm.close.button"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
