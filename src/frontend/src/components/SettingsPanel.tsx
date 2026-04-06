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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  Bell,
  Bitcoin,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Info,
  Key,
  Laptop,
  Loader2,
  Lock,
  LogOut,
  Monitor,
  Phone,
  RefreshCw,
  Settings,
  Shield,
  Smartphone,
  User,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Web3 } from "web3";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  displayName: string;
  gmail?: string;
  btcAddress?: string;
  onOpenSupportChat?: () => void;
}

type SettingsSection =
  | "account"
  | "security"
  | "notifications"
  | "privacy"
  | "blockchain"
  | "coinbase"
  | "appearance"
  | "about";

// ─── Constants ───────────────────────────────────────────────────────────────

const BTC_ADDRESS = "bc1q88ancenmas6e0nfdl9kmvmtk5pq089ewp8wav7";
const USDT_ADDRESS = "TMvJhTBW3stUmk2U98XZ7LEaF9MySkajoY";

function generateAccountId(name: string) {
  const hash =
    (Math.abs(
      name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) * 7919,
    ) %
      90000000) +
    10000000;
  return `NIPW-${hash}`;
}

const NAV_ITEMS: {
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "account", label: "Account", icon: <User className="w-4 h-4" /> },
  { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="w-4 h-4" />,
  },
  { id: "privacy", label: "Privacy", icon: <Eye className="w-4 h-4" /> },
  {
    id: "blockchain",
    label: "Blockchain & Wallet",
    icon: <Wallet className="w-4 h-4" />,
  },
  {
    id: "coinbase",
    label: "Coinbase",
    icon: <Bitcoin className="w-4 h-4" />,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: <Monitor className="w-4 h-4" />,
  },
  { id: "about", label: "About", icon: <Info className="w-4 h-4" /> },
];

// ─── Section Components ───────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(212,175,55,0.12)",
            border: "1px solid rgba(212,175,55,0.3)",
            color: "#D4AF37",
          }}
        >
          {icon}
        </div>
        <h2
          className="text-lg font-bold font-display"
          style={{ color: "#F2F5FA" }}
        >
          {title}
        </h2>
      </div>
      {description && (
        <p className="text-xs ml-12" style={{ color: "#8A95A8" }}>
          {description}
        </p>
      )}
      <Separator className="mt-4" style={{ background: "#22324A" }} />
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
  mono,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between py-3 px-4 rounded-xl"
      style={{
        background: "rgba(11,18,32,0.4)",
        border: "1px solid rgba(34,50,74,0.7)",
        marginBottom: "0.5rem",
      }}
    >
      <div className="flex-1 min-w-0 pr-4">
        <div
          className={`text-sm font-medium ${mono ? "font-mono" : ""}`}
          style={{ color: "#F2F5FA" }}
        >
          {label}
        </div>
        {description && (
          <div className="text-xs mt-0.5" style={{ color: "#8A95A8" }}>
            {description}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ─── Account Section ──────────────────────────────────────────────────────────

function AccountSection({
  displayName,
  gmail,
}: {
  displayName: string;
  gmail: string;
}) {
  const accountId = generateAccountId(displayName);
  return (
    <div data-ocid="settings.account.section">
      <SectionHeader
        icon={<User className="w-4 h-4" />}
        title="Account Settings"
        description="Your profile and account information."
      />

      <SettingRow
        label="Display Name"
        description="Your name shown across the platform"
      >
        <span className="text-sm font-semibold" style={{ color: "#D4AF37" }}>
          {displayName}
        </span>
      </SettingRow>

      <SettingRow
        label="Gmail Address"
        description="Email linked to your account"
      >
        <span className="text-xs font-mono" style={{ color: "#A9B4C6" }}>
          {gmail || "Not linked"}
        </span>
      </SettingRow>

      <SettingRow label="Account ID" description="Your unique NIPW identifier">
        <span
          className="text-xs font-mono px-2 py-1 rounded"
          style={{
            background: "rgba(47,107,255,0.1)",
            border: "1px solid rgba(47,107,255,0.2)",
            color: "#2F6BFF",
          }}
        >
          {accountId}
        </span>
      </SettingRow>

      <SettingRow
        label="Verification Status"
        description="Identity verification level"
      >
        <Badge
          style={{
            background: "rgba(46,204,113,0.15)",
            color: "#2ECC71",
            border: "1px solid rgba(46,204,113,0.3)",
          }}
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      </SettingRow>

      <SettingRow
        label="Account Type"
        description="Your current membership tier"
      >
        <Badge
          style={{
            background: "rgba(212,175,55,0.12)",
            color: "#D4AF37",
            border: "1px solid rgba(212,175,55,0.3)",
          }}
        >
          ★ Premium Investor
        </Badge>
      </SettingRow>

      <SettingRow label="Member Since" description="Account creation date">
        <span className="text-sm" style={{ color: "#A9B4C6" }}>
          2024
        </span>
      </SettingRow>
    </div>
  );
}

// ─── Security Section ─────────────────────────────────────────────────────────

function SecuritySection() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

  const handleToggle2FA = (checked: boolean) => {
    setTwoFAEnabled(checked);
    if (checked) {
      toast.success("Two-Factor Authentication Enabled", {
        description: "Your account is now protected with 2FA.",
      });
    } else {
      toast("2FA Disabled", {
        description: "Two-factor authentication has been turned off.",
      });
    }
  };

  const handleSignOutAll = async () => {
    setSignOutLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSignOutLoading(false);
    toast.success("All Devices Signed Out", {
      description: "All active sessions have been terminated successfully.",
    });
  };

  const mockSessions = [
    {
      device: "Chrome on MacBook Pro",
      location: "New York, US",
      lastActive: "Active now",
      icon: <Laptop className="w-4 h-4" />,
      current: true,
    },
    {
      device: "Safari on iPhone 15",
      location: "Miami, FL",
      lastActive: "2 hours ago",
      icon: <Smartphone className="w-4 h-4" />,
      current: false,
    },
    {
      device: "Firefox on Windows 11",
      location: "London, UK",
      lastActive: "1 day ago",
      icon: <Monitor className="w-4 h-4" />,
      current: false,
    },
  ];

  const loginHistory = [
    { time: "Today, 9:42 AM", location: "New York, US", status: "success" },
    { time: "Yesterday, 6:18 PM", location: "Miami, FL", status: "success" },
    {
      time: "Apr 4, 2026, 11:05 AM",
      location: "London, UK",
      status: "success",
    },
  ];

  return (
    <div data-ocid="settings.security.section">
      <SectionHeader
        icon={<Shield className="w-4 h-4" />}
        title="Security"
        description="Manage your account security and active sessions."
      />

      {/* 2FA Toggle */}
      <SettingRow
        label="Two-Factor Authentication"
        description={
          twoFAEnabled
            ? "Your account is protected with 2FA"
            : "Add an extra layer of security"
        }
      >
        <Switch
          checked={twoFAEnabled}
          onCheckedChange={handleToggle2FA}
          data-ocid="settings.2fa.switch"
        />
      </SettingRow>

      {twoFAEnabled && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl mb-2"
          style={{
            background: "rgba(46,204,113,0.08)",
            border: "1px solid rgba(46,204,113,0.25)",
          }}
          data-ocid="settings.2fa.success_state"
        >
          <CheckCircle2
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#2ECC71" }}
          />
          <span className="text-xs" style={{ color: "#2ECC71" }}>
            2FA is active — Your account is secured with an authenticator app.
          </span>
        </div>
      )}

      {/* Active Sessions */}
      <div className="mt-5 mb-3">
        <div
          className="text-xs font-mono uppercase tracking-widest mb-3"
          style={{ color: "#A9B4C6" }}
        >
          Active Sessions
        </div>
        <div className="space-y-2">
          {mockSessions.map((session) => (
            <div
              key={session.device}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "rgba(11,18,32,0.4)",
                border: `1px solid ${session.current ? "rgba(46,204,113,0.3)" : "rgba(34,50,74,0.7)"}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: session.current
                    ? "rgba(46,204,113,0.12)"
                    : "rgba(34,50,74,0.8)",
                  color: session.current ? "#2ECC71" : "#A9B4C6",
                }}
              >
                {session.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-medium"
                  style={{ color: "#F2F5FA" }}
                >
                  {session.device}
                </div>
                <div className="text-xs" style={{ color: "#8A95A8" }}>
                  {session.location} · {session.lastActive}
                </div>
              </div>
              {session.current && (
                <Badge
                  style={{
                    background: "rgba(46,204,113,0.12)",
                    color: "#2ECC71",
                    border: "1px solid rgba(46,204,113,0.25)",
                    fontSize: "10px",
                  }}
                >
                  Current
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sign Out All */}
      <Button
        variant="outline"
        className="w-full mt-2 text-sm"
        onClick={handleSignOutAll}
        disabled={signOutLoading}
        style={{
          background: "rgba(231,76,60,0.06)",
          border: "1px solid rgba(231,76,60,0.3)",
          color: "#E74C3C",
        }}
        data-ocid="settings.sign_out_all.button"
      >
        {signOutLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <LogOut className="w-4 h-4 mr-2" />
        )}
        {signOutLoading ? "Signing out all devices..." : "Sign Out All Devices"}
      </Button>

      {/* Login History */}
      <div className="mt-6">
        <div
          className="text-xs font-mono uppercase tracking-widest mb-3"
          style={{ color: "#A9B4C6" }}
        >
          Login History
        </div>
        <div className="space-y-2">
          {loginHistory.map((entry) => (
            <div
              key={entry.time}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                background: "rgba(11,18,32,0.4)",
                border: "1px solid rgba(34,50,74,0.6)",
              }}
            >
              <div className="flex items-center gap-3">
                <Clock
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "#A9B4C6" }}
                />
                <div>
                  <div
                    className="text-xs font-medium"
                    style={{ color: "#F2F5FA" }}
                  >
                    {entry.time}
                  </div>
                  <div className="text-xs" style={{ color: "#8A95A8" }}>
                    {entry.location}
                  </div>
                </div>
              </div>
              <Badge
                style={{
                  background: "rgba(46,204,113,0.12)",
                  color: "#2ECC71",
                  border: "1px solid rgba(46,204,113,0.2)",
                  fontSize: "10px",
                }}
              >
                Success
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Section ────────────────────────────────────────────────────

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    depositConfirmations: true,
    withdrawalAlerts: true,
    priceAlerts: true,
    weeklyReports: true,
    promotionalUpdates: false,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      toast(updated[key] ? "Notification enabled" : "Notification disabled", {
        description: `${key.replace(/([A-Z])/g, " $1").trim()} preference updated.`,
      });
      return updated;
    });
  };

  const items: {
    key: keyof typeof prefs;
    label: string;
    description: string;
  }[] = [
    {
      key: "depositConfirmations",
      label: "Deposit Confirmations",
      description: "Get notified when deposits are confirmed on-chain",
    },
    {
      key: "withdrawalAlerts",
      label: "Withdrawal Alerts",
      description: "Receive alerts when withdrawals are processed",
    },
    {
      key: "priceAlerts",
      label: "Price Alerts",
      description: "BTC and ETH price movement notifications",
    },
    {
      key: "weeklyReports",
      label: "Weekly Portfolio Reports",
      description: "Summary of your portfolio performance every Monday",
    },
    {
      key: "promotionalUpdates",
      label: "Promotional Updates",
      description: "News, feature announcements, and promotions",
    },
  ];

  return (
    <div data-ocid="settings.notifications.section">
      <SectionHeader
        icon={<Bell className="w-4 h-4" />}
        title="Notifications"
        description="Choose which alerts and updates you receive."
      />
      {items.map((item) => (
        <SettingRow
          key={item.key}
          label={item.label}
          description={item.description}
        >
          <Switch
            checked={prefs[item.key]}
            onCheckedChange={() => toggle(item.key)}
            data-ocid={`settings.${item.key}.switch`}
          />
        </SettingRow>
      ))}
    </div>
  );
}

// ─── Privacy Section ──────────────────────────────────────────────────────────

function PrivacySection() {
  const [hideBalance, setHideBalance] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState<
    "Private" | "Public"
  >("Private");

  const handleHideBalance = (checked: boolean) => {
    setHideBalance(checked);
    toast(checked ? "Balance hidden" : "Balance visible", {
      description: checked
        ? "Your account balance is now masked on screen."
        : "Your account balance is now displayed.",
    });
  };

  const handleVisibilityToggle = () => {
    setProfileVisibility((prev) => {
      const next = prev === "Private" ? "Public" : "Private";
      toast(`Profile set to ${next}`, {
        description:
          next === "Private"
            ? "Only you can see your profile details."
            : "Your profile is now publicly visible.",
      });
      return next;
    });
  };

  return (
    <div data-ocid="settings.privacy.section">
      <SectionHeader
        icon={<Eye className="w-4 h-4" />}
        title="Privacy"
        description="Control your visibility and data preferences."
      />

      <SettingRow
        label="Hide Balance"
        description={
          hideBalance
            ? "Balances are masked as *****"
            : "Balances are shown in clear"
        }
      >
        <Switch
          checked={hideBalance}
          onCheckedChange={handleHideBalance}
          data-ocid="settings.hide_balance.switch"
        />
      </SettingRow>

      {hideBalance && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl mb-2"
          style={{
            background: "rgba(47,107,255,0.08)",
            border: "1px solid rgba(47,107,255,0.2)",
          }}
        >
          <EyeOff
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#2F6BFF" }}
          />
          <span className="text-xs" style={{ color: "#2F6BFF" }}>
            Balances are now masked. Toggle off to reveal.
          </span>
        </div>
      )}

      <SettingRow
        label="Profile Visibility"
        description="Control who can view your investor profile"
      >
        <button
          onClick={handleVisibilityToggle}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
          style={{
            background:
              profileVisibility === "Private"
                ? "rgba(34,50,74,0.8)"
                : "rgba(46,204,113,0.12)",
            border:
              profileVisibility === "Private"
                ? "1px solid #22324A"
                : "1px solid rgba(46,204,113,0.3)",
            color: profileVisibility === "Private" ? "#A9B4C6" : "#2ECC71",
          }}
          type="button"
          data-ocid="settings.profile_visibility.toggle"
        >
          {profileVisibility === "Private" ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <Globe className="w-3.5 h-3.5" />
          )}
          {profileVisibility}
        </button>
      </SettingRow>
    </div>
  );
}

// ─── Blockchain & Wallet Section ──────────────────────────────────────────────

function BlockchainSection({
  btcAddress,
}: {
  btcAddress: string;
}) {
  const [feePreference, setFeePreference] = useState<
    "Standard" | "Fast" | "Instant"
  >("Standard");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportConfirmed, setExportConfirmed] = useState(false);
  const [exportKeyVisible, setExportKeyVisible] = useState(false);
  const [generatedEthWallet, setGeneratedEthWallet] = useState<{
    address: string;
    privateKey: string;
  } | null>(null);

  const fees = {
    Standard: { display: "~$2.40", time: "~30 min" },
    Fast: { display: "~$5.80", time: "~5 min" },
    Instant: { display: "~$12.20", time: "~1 min" },
  };

  const handleCopy = async (address: string, label: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success(`${label} copied!`, {
        description: "Address copied to clipboard.",
      });
    } catch {
      toast.error("Failed to copy address.");
    }
  };

  return (
    <div data-ocid="settings.blockchain.section">
      <SectionHeader
        icon={<Wallet className="w-4 h-4" />}
        title="Blockchain & Wallet"
        description="Manage your wallet addresses, networks, and transaction settings."
      />

      {/* BTC Address */}
      <div className="mb-3">
        <div
          className="text-xs font-mono uppercase tracking-widest mb-2"
          style={{ color: "#8A95A8" }}
        >
          Bitcoin (BTC) Wallet
        </div>
        <div
          className="px-4 py-3 rounded-xl"
          style={{
            background: "rgba(11,18,32,0.4)",
            border: "1px solid rgba(212,175,55,0.25)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  style={{
                    background: "rgba(212,175,55,0.12)",
                    color: "#D4AF37",
                    border: "1px solid rgba(212,175,55,0.3)",
                    fontSize: "10px",
                  }}
                >
                  Bitcoin Mainnet
                </Badge>
              </div>
              <div
                className="font-mono text-xs break-all leading-relaxed"
                style={{ color: "#D4AF37" }}
              >
                {btcAddress}
              </div>
            </div>
            <button
              onClick={() => handleCopy(btcAddress, "BTC address")}
              className="flex-shrink-0 p-1.5 rounded-lg transition-all hover:brightness-110"
              style={{
                background: "rgba(212,175,55,0.1)",
                border: "1px solid rgba(212,175,55,0.2)",
                color: "#D4AF37",
              }}
              type="button"
              data-ocid="settings.btc_address.button"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* USDT Address */}
      <div className="mb-4">
        <div
          className="text-xs font-mono uppercase tracking-widest mb-2"
          style={{ color: "#8A95A8" }}
        >
          USDT (TRC-20) Wallet
        </div>
        <div
          className="px-4 py-3 rounded-xl"
          style={{
            background: "rgba(11,18,32,0.4)",
            border: "1px solid rgba(46,204,113,0.25)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  style={{
                    background: "rgba(46,204,113,0.12)",
                    color: "#2ECC71",
                    border: "1px solid rgba(46,204,113,0.3)",
                    fontSize: "10px",
                  }}
                >
                  Tron (TRC-20)
                </Badge>
              </div>
              <div
                className="font-mono text-xs break-all leading-relaxed"
                style={{ color: "#2ECC71" }}
              >
                {USDT_ADDRESS}
              </div>
            </div>
            <button
              onClick={() => handleCopy(USDT_ADDRESS, "USDT address")}
              className="flex-shrink-0 p-1.5 rounded-lg transition-all hover:brightness-110"
              style={{
                background: "rgba(46,204,113,0.1)",
                border: "1px solid rgba(46,204,113,0.2)",
                color: "#2ECC71",
              }}
              type="button"
              data-ocid="settings.usdt_address.button"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Fee Preference */}
      <div className="mb-4">
        <div
          className="text-xs font-mono uppercase tracking-widest mb-3"
          style={{ color: "#8A95A8" }}
        >
          Transaction Fee Preference
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["Standard", "Fast", "Instant"] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setFeePreference(tier)}
              className="flex flex-col items-center p-3 rounded-xl transition-all hover:brightness-110"
              style={{
                background:
                  feePreference === tier
                    ? "rgba(212,175,55,0.12)"
                    : "rgba(11,18,32,0.4)",
                border:
                  feePreference === tier
                    ? "1px solid rgba(212,175,55,0.4)"
                    : "1px solid rgba(34,50,74,0.7)",
              }}
              type="button"
              data-ocid={`settings.fee_${tier.toLowerCase()}.toggle`}
            >
              <div className="mb-1">
                {tier === "Standard" ? (
                  <Clock
                    className="w-4 h-4"
                    style={{
                      color: feePreference === tier ? "#D4AF37" : "#A9B4C6",
                    }}
                  />
                ) : tier === "Fast" ? (
                  <Zap
                    className="w-4 h-4"
                    style={{
                      color: feePreference === tier ? "#D4AF37" : "#A9B4C6",
                    }}
                  />
                ) : (
                  <RefreshCw
                    className="w-4 h-4"
                    style={{
                      color: feePreference === tier ? "#D4AF37" : "#A9B4C6",
                    }}
                  />
                )}
              </div>
              <div
                className="text-xs font-semibold"
                style={{
                  color: feePreference === tier ? "#D4AF37" : "#F2F5FA",
                }}
              >
                {tier}
              </div>
              <div
                className="text-xs font-mono mt-0.5"
                style={{
                  color: feePreference === tier ? "#D4AF37" : "#8A95A8",
                }}
              >
                {fees[tier].display}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "#8A95A8", fontSize: "10px" }}
              >
                {fees[tier].time}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Gas Fee Estimator */}
      <div
        className="px-4 py-3 rounded-xl mb-4"
        style={{
          background: "rgba(47,107,255,0.06)",
          border: "1px solid rgba(47,107,255,0.15)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5" style={{ color: "#2F6BFF" }} />
          <span className="text-xs font-semibold" style={{ color: "#2F6BFF" }}>
            Gas Fee Estimator
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(fees).map(([tier, val]) => (
            <div key={tier} className="text-center">
              <div className="text-xs" style={{ color: "#8A95A8" }}>
                {tier}
              </div>
              <div
                className="text-sm font-semibold font-mono"
                style={{ color: "#F2F5FA" }}
              >
                {val.display}
              </div>
              <div
                className="text-xs"
                style={{ color: "#8A95A8", fontSize: "10px" }}
              >
                {val.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Web3.js ETH Wallet Generator */}
      <div
        className="mt-3 mb-4 p-3 rounded-lg"
        style={{
          background: "rgba(47,107,255,0.08)",
          border: "1px solid rgba(47,107,255,0.2)",
        }}
      >
        <div
          className="text-xs font-semibold mb-2"
          style={{ color: "#F2F5FA" }}
        >
          Web3.js ETH Wallet Generator
        </div>
        <p className="text-xs mb-3" style={{ color: "#A9B4C6" }}>
          Generate a new Ethereum wallet address using Web3.js directly in your
          browser.
        </p>
        <button
          type="button"
          onClick={() => {
            const web3 = new Web3();
            const account = web3.eth.accounts.create();
            setGeneratedEthWallet({
              address: account.address,
              privateKey: account.privateKey,
            });
          }}
          className="w-full py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #1E4FD7 0%, #2F6BFF 100%)",
            color: "#F2F5FA",
          }}
          data-ocid="settings.generate_eth_wallet.button"
        >
          Generate New ETH Address
        </button>
        {generatedEthWallet && (
          <div className="mt-3 space-y-2">
            <div
              className="rounded p-2"
              style={{
                background: "rgba(11,18,32,0.7)",
                border: "1px solid #22324A",
              }}
            >
              <div className="text-xs font-mono" style={{ color: "#A9B4C6" }}>
                Address:
              </div>
              <div
                className="text-xs font-mono break-all"
                style={{ color: "#2ECC71" }}
              >
                {generatedEthWallet.address}
              </div>
            </div>
            <div
              className="rounded p-2"
              style={{
                background: "rgba(231,76,60,0.1)",
                border: "1px solid rgba(231,76,60,0.3)",
              }}
            >
              <div className="text-xs font-mono" style={{ color: "#E74C3C" }}>
                ⚠ Private Key (never share):
              </div>
              <div
                className="text-xs font-mono break-all"
                style={{ color: "#F2F5FA" }}
              >
                {generatedEthWallet.privateKey}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Wallet */}
      <button
        onClick={() => setShowExportDialog(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
        style={{
          background: "rgba(231,76,60,0.06)",
          border: "1px solid rgba(231,76,60,0.3)",
          color: "#E74C3C",
        }}
        type="button"
        data-ocid="settings.export_wallet.button"
      >
        <Key className="w-4 h-4" />
        Export Wallet Private Key
      </button>

      {/* Export Wallet Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            background: "linear-gradient(135deg, #0F1A2B 0%, #16263E 100%)",
            border: "1px solid rgba(231,76,60,0.4)",
            color: "#F2F5FA",
          }}
          data-ocid="settings.export_wallet.dialog"
        >
          <DialogHeader>
            <DialogTitle
              className="flex items-center gap-2"
              style={{ color: "#E74C3C" }}
            >
              <AlertTriangle className="w-5 h-5" />
              Export Private Key — Warning
            </DialogTitle>
          </DialogHeader>
          <div
            className="rounded-xl p-4 mb-4"
            style={{
              background: "rgba(231,76,60,0.06)",
              border: "1px solid rgba(231,76,60,0.3)",
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: "#C8D4E8" }}>
              This is{" "}
              <span className="font-bold" style={{ color: "#E74C3C" }}>
                extremely sensitive information
              </span>
              . Never share your private key with anyone. Anyone with access to
              your private key has full control over your wallet.
            </p>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <input
              type="checkbox"
              id="export-confirm"
              checked={exportConfirmed}
              onChange={(e) => setExportConfirmed(e.target.checked)}
              className="mt-0.5 rounded"
              style={{ accentColor: "#D4AF37" }}
              data-ocid="settings.export_confirm.checkbox"
            />
            <Label
              htmlFor="export-confirm"
              className="text-sm cursor-pointer"
              style={{ color: "#A9B4C6" }}
            >
              I understand the risks. I will keep this key secure and never
              share it with anyone.
            </Label>
          </div>

          {exportConfirmed && (
            <div>
              <button
                onClick={() => setExportKeyVisible((v) => !v)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold mb-2 transition-all hover:brightness-110"
                style={{
                  background: "rgba(212,175,55,0.1)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  color: "#D4AF37",
                }}
                type="button"
              >
                {exportKeyVisible ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {exportKeyVisible ? "Hide Private Key" : "Reveal Private Key"}
              </button>
              {exportKeyVisible && (
                <div
                  className="rounded-xl p-3 font-mono text-xs break-all"
                  style={{
                    background: "rgba(11,18,32,0.8)",
                    border: "1px solid rgba(231,76,60,0.3)",
                    color: "#E74C3C",
                  }}
                  data-ocid="settings.export_key.panel"
                >
                  ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                  <br />
                  <span style={{ color: "#8A95A8", fontSize: "10px" }}>
                    [Private key not accessible — contact support for secure key
                    export]
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowExportDialog(false);
                setExportConfirmed(false);
                setExportKeyVisible(false);
              }}
              style={{
                background: "transparent",
                border: "1px solid #22324A",
                color: "#A9B4C6",
              }}
              data-ocid="settings.export_wallet.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Coinbase Section ─────────────────────────────────────────────────────────

function CoinbaseSection() {
  const [connected, setConnected] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleConnect = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      toast.error("Please fill in both API Key and API Secret.");
      return;
    }
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setConnecting(false);
    setConnected(true);
    setShowConnectDialog(false);
    setApiKey("");
    setApiSecret("");
    toast.success("Coinbase Connected!", {
      description: "Your Coinbase account is now synced with NIPW.",
    });
  };

  const handleSync = async () => {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSyncing(false);
    toast.success("Portfolio Synced", {
      description: "Your Coinbase portfolio data has been refreshed.",
    });
  };

  const handleDisconnect = () => {
    setConnected(false);
    toast("Coinbase Disconnected", {
      description: "Your Coinbase account has been unlinked.",
    });
  };

  return (
    <div data-ocid="settings.coinbase.section">
      <SectionHeader
        icon={<Bitcoin className="w-4 h-4" />}
        title="Coinbase Integration"
        description="Connect your Coinbase account for automatic portfolio syncing."
      />

      {/* Coinbase Brand Header */}
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-xl mb-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(4,113,215,0.08) 0%, rgba(0,82,255,0.05) 100%)",
          border: "1px solid rgba(4,113,215,0.25)",
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0"
          style={{
            background: "#0471D7",
            color: "#fff",
          }}
        >
          C
        </div>
        <div>
          <div className="text-base font-bold" style={{ color: "#F2F5FA" }}>
            Coinbase
          </div>
          <div className="text-xs" style={{ color: "#8A95A8" }}>
            America&apos;s most trusted crypto exchange
          </div>
        </div>
        {connected && (
          <Badge
            className="ml-auto"
            style={{
              background: "rgba(46,204,113,0.15)",
              color: "#2ECC71",
              border: "1px solid rgba(46,204,113,0.3)",
            }}
            data-ocid="settings.coinbase.success_state"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        )}
      </div>

      {!connected ? (
        <>
          <p
            className="text-sm leading-relaxed mb-5 px-1"
            style={{ color: "#A9B4C6" }}
          >
            Connect your Coinbase account to sync your portfolio automatically,
            enable real-time price feeds, and allow instant transfers between
            platforms.
          </p>
          <Button
            className="w-full text-sm font-semibold"
            onClick={() => setShowConnectDialog(true)}
            style={{
              background: "linear-gradient(135deg, #0052FF 0%, #0471D7 100%)",
              color: "#fff",
              border: "none",
              boxShadow: "0 2px 12px rgba(0,82,255,0.35)",
            }}
            data-ocid="settings.coinbase_connect.button"
          >
            Connect Coinbase Account
          </Button>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              className="px-4 py-3 rounded-xl"
              style={{
                background: "rgba(11,18,32,0.4)",
                border: "1px solid rgba(34,50,74,0.7)",
              }}
            >
              <div className="text-xs mb-1" style={{ color: "#8A95A8" }}>
                Last Synced
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: "#F2F5FA" }}
              >
                2 minutes ago
              </div>
            </div>
            <div
              className="px-4 py-3 rounded-xl"
              style={{
                background: "rgba(11,18,32,0.4)",
                border: "1px solid rgba(34,50,74,0.7)",
              }}
            >
              <div className="text-xs mb-1" style={{ color: "#8A95A8" }}>
                Status
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: "#2ECC71" }}
              >
                Active
              </div>
            </div>
          </div>

          <div
            className="px-4 py-4 rounded-xl mb-4"
            style={{
              background: "rgba(11,18,32,0.4)",
              border: "1px solid rgba(34,50,74,0.6)",
            }}
          >
            <div
              className="text-xs font-mono uppercase tracking-widest mb-3"
              style={{ color: "#A9B4C6" }}
            >
              Active Features
            </div>
            <div className="space-y-2">
              {[
                "Auto-Sync Portfolio",
                "Real-Time Price Feeds",
                "Instant Transfers",
                "Advanced Trading Analytics",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle2
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ color: "#2ECC71" }}
                  />
                  <span className="text-sm" style={{ color: "#F2F5FA" }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 text-sm font-semibold"
              onClick={handleSync}
              disabled={syncing}
              style={{
                background: "linear-gradient(135deg, #0052FF 0%, #0471D7 100%)",
                color: "#fff",
                border: "none",
              }}
              data-ocid="settings.coinbase_sync.button"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {syncing ? "Syncing..." : "Sync Now"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-sm"
              onClick={handleDisconnect}
              style={{
                background: "rgba(231,76,60,0.06)",
                border: "1px solid rgba(231,76,60,0.3)",
                color: "#E74C3C",
              }}
              data-ocid="settings.coinbase_disconnect.button"
            >
              Disconnect
            </Button>
          </div>
        </>
      )}

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            background: "linear-gradient(135deg, #0F1A2B 0%, #16263E 100%)",
            border: "1px solid rgba(4,113,215,0.3)",
            color: "#F2F5FA",
          }}
          data-ocid="settings.coinbase_connect.dialog"
        >
          <DialogHeader>
            <DialogTitle
              className="flex items-center gap-2"
              style={{ color: "#F2F5FA" }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: "#0471D7", color: "#fff" }}
              >
                C
              </div>
              Connect Coinbase Account
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label
                className="text-xs font-medium"
                style={{ color: "#A9B4C6" }}
              >
                API Key
              </Label>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Coinbase API key"
                disabled={connecting}
                style={{
                  background: "rgba(11,18,32,0.7)",
                  border: "1px solid #22324A",
                  color: "#F2F5FA",
                }}
                data-ocid="settings.coinbase_api_key.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                className="text-xs font-medium"
                style={{ color: "#A9B4C6" }}
              >
                API Secret
              </Label>
              <Input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter your Coinbase API secret"
                disabled={connecting}
                style={{
                  background: "rgba(11,18,32,0.7)",
                  border: "1px solid #22324A",
                  color: "#F2F5FA",
                }}
                data-ocid="settings.coinbase_api_secret.input"
              />
            </div>
            <div
              className="rounded-lg p-3"
              style={{
                background: "rgba(47,107,255,0.06)",
                border: "1px solid rgba(47,107,255,0.15)",
              }}
            >
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#A9B4C6" }}
              >
                <span style={{ color: "#2F6BFF" }} className="font-semibold">
                  Secure:{" "}
                </span>
                Your API credentials are encrypted and stored securely. NIPW
                uses read-only API access — no trading permissions required.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConnectDialog(false)}
                disabled={connecting}
                style={{
                  background: "transparent",
                  border: "1px solid #22324A",
                  color: "#A9B4C6",
                }}
                data-ocid="settings.coinbase_connect.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 font-semibold"
                onClick={handleConnect}
                disabled={connecting}
                style={{
                  background:
                    "linear-gradient(135deg, #0052FF 0%, #0471D7 100%)",
                  color: "#fff",
                  border: "none",
                }}
                data-ocid="settings.coinbase_connect.submit_button"
              >
                {connecting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {connecting ? "Connecting..." : "Connect Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Appearance Section ───────────────────────────────────────────────────────

function AppearanceSection() {
  const [currency, setCurrency] = useState("USD");

  return (
    <div data-ocid="settings.appearance.section">
      <SectionHeader
        icon={<Monitor className="w-4 h-4" />}
        title="Appearance"
        description="Customize the look and feel of your dashboard."
      />

      {/* Theme selection */}
      <div className="mb-5">
        <div
          className="text-xs font-mono uppercase tracking-widest mb-3"
          style={{ color: "#8A95A8" }}
        >
          Theme
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "dark", label: "Dark", icon: "🌙", active: true },
            { id: "light", label: "Light", icon: "☀️", active: false },
            { id: "auto", label: "Auto", icon: "💻", active: false },
          ].map((theme) => (
            <div
              key={theme.id}
              className="relative flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all hover:brightness-110"
              style={{
                background: theme.active
                  ? "rgba(212,175,55,0.12)"
                  : "rgba(11,18,32,0.4)",
                border: theme.active
                  ? "1px solid rgba(212,175,55,0.4)"
                  : "1px solid rgba(34,50,74,0.7)",
              }}
              data-ocid={`settings.theme_${theme.id}.toggle`}
            >
              <span className="text-2xl mb-2">{theme.icon}</span>
              <span
                className="text-xs font-semibold"
                style={{ color: theme.active ? "#D4AF37" : "#F2F5FA" }}
              >
                {theme.label}
              </span>
              {!theme.active && (
                <Badge
                  className="absolute top-1.5 right-1.5"
                  style={{
                    background: "rgba(34,50,74,0.9)",
                    color: "#8A95A8",
                    border: "1px solid #22324A",
                    fontSize: "9px",
                    padding: "1px 5px",
                  }}
                >
                  Soon
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Currency Display */}
      <SettingRow
        label="Currency Display"
        description="Primary currency for balance display"
      >
        <div className="flex gap-2">
          {["USD", "BTC", "EUR"].map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
              style={{
                background:
                  currency === c
                    ? "rgba(212,175,55,0.15)"
                    : "rgba(34,50,74,0.6)",
                border:
                  currency === c
                    ? "1px solid rgba(212,175,55,0.4)"
                    : "1px solid #22324A",
                color: currency === c ? "#D4AF37" : "#A9B4C6",
              }}
              type="button"
              data-ocid={`settings.currency_${c.toLowerCase()}.toggle`}
            >
              {c}
            </button>
          ))}
        </div>
      </SettingRow>

      {/* Language */}
      <SettingRow label="Language" description="Platform display language">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "#F2F5FA" }}>
            English
          </span>
          <Badge
            style={{
              background: "rgba(34,50,74,0.8)",
              color: "#8A95A8",
              border: "1px solid #22324A",
              fontSize: "10px",
            }}
          >
            Other languages coming soon
          </Badge>
        </div>
      </SettingRow>
    </div>
  );
}

// ─── About Section ────────────────────────────────────────────────────────────

function AboutSection({
  onOpenSupportChat,
  onClose,
}: {
  onOpenSupportChat?: () => void;
  onClose: () => void;
}) {
  const handleDocLink = (doc: string) => {
    toast(`${doc}`, {
      description: "Document available on request. Contact our support team.",
    });
  };

  return (
    <div data-ocid="settings.about.section">
      <SectionHeader
        icon={<Info className="w-4 h-4" />}
        title="About"
        description="Platform information and legal documents."
      />

      {/* App Info */}
      <div
        className="px-5 py-5 rounded-xl mb-4"
        style={{
          background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
          border: "1px solid rgba(212,175,55,0.25)",
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)",
              color: "#0B1220",
            }}
          >
            N
          </div>
          <div>
            <div
              className="text-base font-bold font-display"
              style={{ color: "#F2F5FA" }}
            >
              North Investors Profit Wallet
            </div>
            <div className="text-xs font-mono" style={{ color: "#D4AF37" }}>
              NIPW
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Version", value: "v2.4.1" },
            { label: "Company", value: "Est. 2024" },
            { label: "Platform", value: "Internet Computer" },
            { label: "Security", value: "Bank-Grade" },
          ].map((item) => (
            <div
              key={item.label}
              className="px-3 py-2 rounded-lg"
              style={{
                background: "rgba(11,18,32,0.5)",
                border: "1px solid #22324A",
              }}
            >
              <div className="text-xs" style={{ color: "#8A95A8" }}>
                {item.label}
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: "#F2F5FA" }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div
        className="flex items-center gap-4 px-4 py-3 rounded-xl mb-4"
        style={{
          background: "rgba(11,18,32,0.4)",
          border: "1px solid rgba(34,50,74,0.7)",
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(212,175,55,0.12)",
            border: "1px solid rgba(212,175,55,0.3)",
          }}
        >
          <Phone className="w-4 h-4" style={{ color: "#D4AF37" }} />
        </div>
        <div>
          <div className="text-xs" style={{ color: "#8A95A8" }}>
            Support Phone
          </div>
          <a
            href="tel:+12742015975"
            className="text-sm font-semibold hover:text-white transition-colors"
            style={{ color: "#D4AF37" }}
          >
            1 (274) 201-5975
          </a>
        </div>
      </div>

      {/* Legal Links */}
      <div className="space-y-2 mb-4">
        {["Terms of Service", "Privacy Policy", "Cookie Policy"].map((doc) => (
          <button
            key={doc}
            onClick={() => handleDocLink(doc)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-left transition-all hover:brightness-110"
            style={{
              background: "rgba(11,18,32,0.4)",
              border: "1px solid rgba(34,50,74,0.7)",
              color: "#A9B4C6",
            }}
            type="button"
            data-ocid={`settings.${doc.toLowerCase().replace(/ /g, "_")}.button`}
          >
            {doc}
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Contact Support */}
      <Button
        className="w-full text-sm font-semibold"
        onClick={() => {
          onClose();
          setTimeout(() => {
            if (onOpenSupportChat) onOpenSupportChat();
          }, 300);
        }}
        style={{
          background: "linear-gradient(135deg, #1E4FD7 0%, #2F6BFF 100%)",
          color: "#F2F5FA",
          border: "none",
          boxShadow: "0 2px 8px rgba(47,107,255,0.3)",
        }}
        data-ocid="settings.contact_support.button"
      >
        Contact Support
      </Button>
    </div>
  );
}

// ─── Main Settings Panel ──────────────────────────────────────────────────────

export function SettingsPanel({
  open,
  onOpenChange,
  displayName,
  gmail,
  btcAddress,
  onOpenSupportChat,
}: SettingsPanelProps) {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("account");

  const resolvedBtcAddress = btcAddress ?? BTC_ADDRESS;

  const renderSection = () => {
    switch (activeSection) {
      case "account":
        return <AccountSection displayName={displayName} gmail={gmail ?? ""} />;
      case "security":
        return <SecuritySection />;
      case "notifications":
        return <NotificationsSection />;
      case "privacy":
        return <PrivacySection />;
      case "blockchain":
        return <BlockchainSection btcAddress={resolvedBtcAddress} />;
      case "coinbase":
        return <CoinbaseSection />;
      case "appearance":
        return <AppearanceSection />;
      case "about":
        return (
          <AboutSection
            onOpenSupportChat={onOpenSupportChat}
            onClose={() => onOpenChange(false)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="p-0 flex flex-col"
        style={{
          width: "min(640px, 100vw)",
          maxWidth: "100vw",
          background: "#0B1220",
          border: "none",
          borderLeft: "1px solid #22324A",
        }}
        data-ocid="settings.sheet"
      >
        {/* Header */}
        <SheetHeader
          className="px-6 py-4 flex-shrink-0"
          style={{
            background: "rgba(11,18,32,0.98)",
            borderBottom: "1px solid #22324A",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(212,175,55,0.12)",
                  border: "1px solid rgba(212,175,55,0.3)",
                }}
              >
                <Settings className="w-4 h-4" style={{ color: "#D4AF37" }} />
              </div>
              <SheetTitle
                className="text-base font-bold"
                style={{ color: "#F2F5FA" }}
              >
                Settings
              </SheetTitle>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:brightness-110"
              style={{
                background: "rgba(34,50,74,0.8)",
                border: "1px solid #22324A",
                color: "#A9B4C6",
              }}
              type="button"
              data-ocid="settings.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </SheetHeader>

        {/* Body — sidebar + content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div
            className="hidden sm:flex flex-col w-52 flex-shrink-0 overflow-y-auto py-4"
            style={{
              background: "rgba(9,14,26,0.8)",
              borderRight: "1px solid #22324A",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all text-left"
                style={{
                  background:
                    activeSection === item.id
                      ? "rgba(212,175,55,0.1)"
                      : "transparent",
                  border:
                    activeSection === item.id
                      ? "1px solid rgba(212,175,55,0.2)"
                      : "1px solid transparent",
                  color: activeSection === item.id ? "#D4AF37" : "#A9B4C6",
                }}
                type="button"
                data-ocid={`settings.nav_${item.id}.link`}
              >
                <span
                  style={{
                    color: activeSection === item.id ? "#D4AF37" : "#8A95A8",
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile tabs */}
          <div
            className="flex sm:hidden overflow-x-auto flex-shrink-0 absolute top-[65px] left-0 right-0 z-10"
            style={{
              background: "rgba(9,14,26,0.98)",
              borderBottom: "1px solid #22324A",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-all"
                style={{
                  color: activeSection === item.id ? "#D4AF37" : "#8A95A8",
                  borderBottom:
                    activeSection === item.id
                      ? "2px solid #D4AF37"
                      : "2px solid transparent",
                }}
                type="button"
              >
                {item.icon}
                <span style={{ fontSize: "9px" }}>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6 pb-10 sm:mt-0 mt-16">{renderSection()}</div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
