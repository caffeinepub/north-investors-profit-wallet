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
  ArrowDownToLine,
  CheckCircle2,
  Copy,
  LinkIcon,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const BTC_ADDRESS = "bc1q88ancenmas6e0nfdl9kmvmtk5pq089ewp8wav7";
const USDT_ADDRESS = "TMvJhTBW3stUmk2U98XZ7LEaF9MySkajoY";

function generateAccountNumber(name: string) {
  const seed = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `NIPW-${((seed * 7919) % 900000) + 100000}`;
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
    <div className="flex justify-center py-3">
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

export function ReceiveMoneyModal({
  open,
  onOpenChange,
  displayName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  displayName: string;
}) {
  const [gmail, setGmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savedGmail, setSavedGmail] = useState("");
  const [savedPhone, setSavedPhone] = useState("");
  const [linkSaved, setLinkSaved] = useState(false);

  const accountNumber = generateAccountNumber(displayName);

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied!`);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const shareAddress = async (addr: string, network: string) => {
    const text = `Send ${network} to my North Investors Profit Wallet address:\n${addr}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Share text copied!", {
        description: "Paste it anywhere to share.",
      });
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const handleSaveLink = () => {
    if (!gmail.trim() && !phone.trim()) {
      toast.error("Add at least one contact method.");
      return;
    }
    if (gmail.trim()) setSavedGmail(gmail.trim());
    if (phone.trim()) setSavedPhone(phone.trim());
    setLinkSaved(true);
    toast.success("Contact details saved!", {
      description:
        "You will receive notifications and codes at these addresses.",
    });
  };

  const addrBoxStyle = {
    background: "rgba(11,18,32,0.7)",
    borderRadius: "8px",
    padding: "10px 12px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.7rem",
    wordBreak: "break-all" as const,
    lineHeight: 1.6,
  };

  const copyBtnStyle = {
    background: "rgba(212,175,55,0.12)",
    border: "1px solid rgba(212,175,55,0.3)",
    color: "#D4AF37",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        style={{
          background: "linear-gradient(135deg, #0F1A2B 0%, #16263E 100%)",
          border: "1px solid #22324A",
          color: "#F2F5FA",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        data-ocid="receive_money.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(46,204,113,0.12)",
                border: "1px solid rgba(46,204,113,0.3)",
              }}
            >
              <ArrowDownToLine
                className="w-4 h-4"
                style={{ color: "#2ECC71" }}
              />
            </div>
            <DialogTitle
              className="text-base font-bold"
              style={{ color: "#F2F5FA" }}
            >
              Receive &amp; Account Details
            </DialogTitle>
          </div>
        </DialogHeader>

        <Tabs defaultValue="crypto" className="mt-2">
          <TabsList
            className="w-full grid grid-cols-3 mb-4"
            style={{
              background: "rgba(11,18,32,0.6)",
              border: "1px solid #22324A",
            }}
          >
            <TabsTrigger
              value="crypto"
              className="text-xs"
              style={{ color: "#A9B4C6" }}
              data-ocid="receive_money.crypto.tab"
            >
              Receive Crypto
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="text-xs"
              style={{ color: "#A9B4C6" }}
              data-ocid="receive_money.details.tab"
            >
              Account Details
            </TabsTrigger>
            <TabsTrigger
              value="link"
              className="text-xs"
              style={{ color: "#A9B4C6" }}
              data-ocid="receive_money.link.tab"
            >
              Link Account
            </TabsTrigger>
          </TabsList>

          {/* Receive Crypto Tab */}
          <TabsContent
            value="crypto"
            className="space-y-5"
            data-ocid="receive_money.crypto.panel"
          >
            {/* BTC */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
                border: "1px solid rgba(212,175,55,0.25)",
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: "#D4AF37" }}
                >
                  Bitcoin (BTC)
                </div>
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(212,175,55,0.12)",
                    color: "#D4AF37",
                  }}
                >
                  BTC Network
                </span>
              </div>
              <div
                style={{
                  ...addrBoxStyle,
                  border: "1px solid rgba(212,175,55,0.3)",
                  color: "#D4AF37",
                }}
              >
                {BTC_ADDRESS}
              </div>
              <QrCodeCanvas value={BTC_ADDRESS} color="#D4AF37" />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs gap-1.5"
                  style={copyBtnStyle}
                  onClick={() => copyText(BTC_ADDRESS, "BTC Address")}
                  data-ocid="receive_money.btc_copy.button"
                >
                  <Copy className="w-3 h-3" /> Copy Address
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5"
                  style={copyBtnStyle}
                  onClick={() => shareAddress(BTC_ADDRESS, "BTC")}
                  data-ocid="receive_money.btc_share.button"
                >
                  <Share2 className="w-3 h-3" /> Share
                </Button>
              </div>
            </div>

            {/* USDT */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
                border: "1px solid rgba(46,204,113,0.25)",
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: "#2ECC71" }}
                >
                  USDT TRC-20
                </div>
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(46,204,113,0.1)",
                    color: "#2ECC71",
                  }}
                >
                  TRC-20
                </span>
              </div>
              <div
                style={{
                  ...addrBoxStyle,
                  border: "1px solid rgba(46,204,113,0.3)",
                  color: "#2ECC71",
                }}
              >
                {USDT_ADDRESS}
              </div>
              <QrCodeCanvas value={USDT_ADDRESS} color="#2ECC71" />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs gap-1.5"
                  style={{
                    background: "rgba(46,204,113,0.1)",
                    border: "1px solid rgba(46,204,113,0.3)",
                    color: "#2ECC71",
                  }}
                  onClick={() => copyText(USDT_ADDRESS, "USDT Address")}
                  data-ocid="receive_money.usdt_copy.button"
                >
                  <Copy className="w-3 h-3" /> Copy Address
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5"
                  style={{
                    background: "rgba(46,204,113,0.1)",
                    border: "1px solid rgba(46,204,113,0.3)",
                    color: "#2ECC71",
                  }}
                  onClick={() => shareAddress(USDT_ADDRESS, "USDT")}
                  data-ocid="receive_money.usdt_share.button"
                >
                  <Share2 className="w-3 h-3" /> Share
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Account Details Tab */}
          <TabsContent
            value="details"
            className="space-y-4"
            data-ocid="receive_money.details.panel"
          >
            <div
              className="rounded-xl p-5 space-y-4"
              style={{
                background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
                border: "1px solid #22324A",
              }}
            >
              {[
                {
                  label: "Account Holder",
                  value: displayName,
                  color: "#F2F5FA",
                },
                {
                  label: "Account Number",
                  value: accountNumber,
                  color: "#D4AF37",
                },
                {
                  label: "Account Type",
                  value: "Institutional Investor",
                  color: "#F2F5FA",
                },
                {
                  label: "Platform",
                  value: "North Investors Profit Wallet",
                  color: "#A9B4C6",
                },
                {
                  label: "Status",
                  value: "Pending Activation",
                  color: "#FFA500",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-2"
                  style={{
                    borderBottom: "1px solid rgba(34,50,74,0.5)",
                    paddingBottom: "10px",
                  }}
                >
                  <span className="text-xs" style={{ color: "#8A95A8" }}>
                    {row.label}
                  </span>
                  <span
                    className="text-xs font-semibold text-right"
                    style={{ color: row.color }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Deposit instructions */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                background: "rgba(212,175,55,0.05)",
                border: "1px solid rgba(212,175,55,0.3)",
              }}
            >
              <div
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: "#D4AF37" }}
              >
                Deposit Instructions
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#C8D4E8" }}
              >
                Send your required activation deposit of{" "}
                <span style={{ color: "#D4AF37", fontWeight: 700 }}>
                  $120,000.00
                </span>{" "}
                to unlock your full portfolio and enable withdrawals.
              </p>
              <div className="space-y-2">
                <div>
                  <div className="text-xs mb-1" style={{ color: "#A9B4C6" }}>
                    BTC Address
                  </div>
                  <div
                    style={{
                      ...addrBoxStyle,
                      border: "1px solid rgba(212,175,55,0.3)",
                      color: "#D4AF37",
                    }}
                  >
                    {BTC_ADDRESS}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: "#A9B4C6" }}>
                    USDT TRC-20
                  </div>
                  <div
                    style={{
                      ...addrBoxStyle,
                      border: "1px solid rgba(46,204,113,0.3)",
                      color: "#2ECC71",
                    }}
                  >
                    {USDT_ADDRESS}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Link Account Tab */}
          <TabsContent
            value="link"
            className="space-y-4"
            data-ocid="receive_money.link.panel"
          >
            <div
              className="rounded-lg p-3 flex items-start gap-2"
              style={{
                background: "rgba(47,107,255,0.08)",
                border: "1px solid rgba(47,107,255,0.25)",
              }}
            >
              <LinkIcon
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "#2F6BFF" }}
              />
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#A9B4C6" }}
              >
                Link your Gmail and phone number to receive deposit
                confirmations and verification codes directly.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  className="text-xs font-medium"
                  style={{ color: "#A9B4C6" }}
                >
                  Gmail Address
                  <span className="ml-1" style={{ color: "#5A6880" }}>
                    — receive notifications
                  </span>
                </Label>
                <Input
                  type="email"
                  value={gmail}
                  onChange={(e) => setGmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  autoComplete="email"
                  className="text-sm"
                  style={{
                    background: "rgba(11,18,32,0.7)",
                    border: "1px solid #22324A",
                    color: "#F2F5FA",
                  }}
                  data-ocid="receive_money.gmail.input"
                />
                {savedGmail && (
                  <div
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "#2ECC71" }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Saved: {savedGmail}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  className="text-xs font-medium"
                  style={{ color: "#A9B4C6" }}
                >
                  Phone Number
                  <span className="ml-1" style={{ color: "#5A6880" }}>
                    — receive verification codes
                  </span>
                </Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  autoComplete="tel"
                  className="text-sm"
                  style={{
                    background: "rgba(11,18,32,0.7)",
                    border: "1px solid #22324A",
                    color: "#F2F5FA",
                  }}
                  data-ocid="receive_money.phone.input"
                />
                {savedPhone && (
                  <div
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "#2ECC71" }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Saved: {savedPhone}
                  </div>
                )}
              </div>

              {linkSaved && (
                <div
                  className="rounded-lg p-3 flex items-center gap-2"
                  style={{
                    background: "rgba(46,204,113,0.08)",
                    border: "1px solid rgba(46,204,113,0.3)",
                  }}
                  data-ocid="receive_money.link.success_state"
                >
                  <CheckCircle2
                    className="w-4 h-4"
                    style={{ color: "#2ECC71" }}
                  />
                  <p className="text-xs" style={{ color: "#2ECC71" }}>
                    Contact details saved. You will receive codes and
                    notifications.
                  </p>
                </div>
              )}

              <Button
                className="w-full font-semibold"
                onClick={handleSaveLink}
                style={{
                  background:
                    "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)",
                  color: "#0B1220",
                  border: "none",
                }}
                data-ocid="receive_money.save.button"
              >
                Save Contact Details
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
