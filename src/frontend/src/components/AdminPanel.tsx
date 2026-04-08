import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Filter,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createActor } from "../backend";
import type {
  ActivityStats,
  Activity as BackendActivity,
  UserProfile,
} from "../backend";
import { ActivityStatus, ActivityType } from "../backend";

// ─── Types ─────────────────────────────────────────────────────────────────────

type AdminTab = "overview" | "activities" | "loginlog" | "users" | "usersearch";

type DateFilter = "today" | "week" | "month" | "all";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtTS(ts: bigint | number) {
  const ms = typeof ts === "bigint" ? Number(ts) / 1_000_000 : ts;
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function isToday(ts: bigint | number) {
  const ms = typeof ts === "bigint" ? Number(ts) / 1_000_000 : ts;
  const d = new Date(ms);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function isThisWeek(ts: bigint | number) {
  const ms = typeof ts === "bigint" ? Number(ts) / 1_000_000 : ts;
  const d = new Date(ms);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo;
}

function isThisMonth(ts: bigint | number) {
  const ms = typeof ts === "bigint" ? Number(ts) / 1_000_000 : ts;
  const d = new Date(ms);
  const now = new Date();
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
}

function passesDFilter(ts: bigint | number, df: DateFilter) {
  if (df === "all") return true;
  if (df === "today") return isToday(ts);
  if (df === "week") return isThisWeek(ts);
  if (df === "month") return isThisMonth(ts);
  return true;
}

// ─── Activity Type Label & Badge ──────────────────────────────────────────────

const TYPE_META: Record<
  ActivityType,
  { label: string; color: string; bg: string }
> = {
  [ActivityType.login]: {
    label: "Login",
    color: "#2ECC71",
    bg: "rgba(46,204,113,0.15)",
  },
  [ActivityType.loginFailed]: {
    label: "Login Failed",
    color: "#E74C3C",
    bg: "rgba(231,76,60,0.15)",
  },
  [ActivityType.accountCreation]: {
    label: "Account Created",
    color: "#2F6BFF",
    bg: "rgba(47,107,255,0.15)",
  },
  [ActivityType.deposit]: {
    label: "Deposit",
    color: "#D4AF37",
    bg: "rgba(212,175,55,0.15)",
  },
  [ActivityType.withdrawal]: {
    label: "Withdrawal",
    color: "#FFA500",
    bg: "rgba(255,165,0,0.15)",
  },
  [ActivityType.sendMoney]: {
    label: "Send Money",
    color: "#9945FF",
    bg: "rgba(153,69,255,0.15)",
  },
  [ActivityType.receiveMoney]: {
    label: "Receive Money",
    color: "#00AAE4",
    bg: "rgba(0,170,228,0.15)",
  },
  [ActivityType.receiptUpload]: {
    label: "Receipt Upload",
    color: "#F0B90B",
    bg: "rgba(240,185,11,0.15)",
  },
  [ActivityType.keyVerification]: {
    label: "Key Verification",
    color: "#D4AF37",
    bg: "rgba(212,175,55,0.15)",
  },
  [ActivityType.settingsChange]: {
    label: "Settings Change",
    color: "#A9B4C6",
    bg: "rgba(169,180,198,0.12)",
  },
  [ActivityType.referralBonus]: {
    label: "Referral Bonus",
    color: "#2ECC71",
    bg: "rgba(46,204,113,0.15)",
  },
  [ActivityType.interestPayment]: {
    label: "Interest Payment",
    color: "#D4AF37",
    bg: "rgba(212,175,55,0.15)",
  },
};

function TypeBadge({ type }: { type: ActivityType }) {
  const meta = TYPE_META[type] ?? {
    label: type,
    color: "#A9B4C6",
    bg: "rgba(169,180,198,0.12)",
  };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono whitespace-nowrap"
      style={{
        background: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.color}40`,
      }}
    >
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  const isCompleted = status === ActivityStatus.completed;
  const isFailed = status === ActivityStatus.failed;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: isCompleted
          ? "rgba(46,204,113,0.15)"
          : isFailed
            ? "rgba(231,76,60,0.15)"
            : "rgba(255,165,0,0.15)",
        color: isCompleted ? "#2ECC71" : isFailed ? "#E74C3C" : "#FFA500",
        border: `1px solid ${isCompleted ? "rgba(46,204,113,0.3)" : isFailed ? "rgba(231,76,60,0.3)" : "rgba(255,165,0,0.3)"}`,
      }}
    >
      {isCompleted ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : isFailed ? (
        <XCircle className="w-3 h-3" />
      ) : null}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-4"
      style={{
        background: "var(--nipw-surface)",
        border: "1px solid var(--nipw-border)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: `${color}20`,
          border: `1px solid ${color}40`,
          color,
        }}
      >
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold font-display" style={{ color }}>
          {value}
        </div>
        <div
          className="text-xs font-mono uppercase tracking-wider"
          style={{ color: "var(--nipw-text-muted)" }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────

function ActivityRow({
  activity,
  index,
  onClick,
}: {
  activity: BackendActivity;
  index: number;
  onClick: () => void;
}) {
  return (
    <tr
      className="cursor-pointer transition-colors hover:brightness-110"
      style={{ borderBottom: "1px solid rgba(34,50,74,0.6)" }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      tabIndex={0}
      data-ocid={`admin.activity.row.${index}`}
    >
      <td
        className="px-3 py-3 text-xs font-mono"
        style={{ color: "var(--nipw-text-muted)" }}
      >
        {index + 1}
      </td>
      <td className="px-3 py-3">
        <TypeBadge type={activity.activityType} />
      </td>
      <td
        className="px-3 py-3 text-xs max-w-[140px] truncate"
        style={{ color: "var(--nipw-text-primary)" }}
      >
        {activity.userGmail || "—"}
      </td>
      <td
        className="px-3 py-3 text-xs font-mono"
        style={{ color: "var(--nipw-text-secondary)" }}
      >
        {activity.username || "—"}
      </td>
      <td
        className="px-3 py-3 text-xs font-mono text-right"
        style={{ color: "var(--nipw-gold)" }}
      >
        {activity.amount > 0 ? fmtUSD(activity.amount) : "—"}
      </td>
      <td
        className="px-3 py-3 text-xs max-w-[180px] truncate"
        style={{ color: "var(--nipw-text-secondary)" }}
      >
        {activity.description}
      </td>
      <td
        className="px-3 py-3 text-xs font-mono"
        style={{ color: "var(--nipw-text-muted)" }}
      >
        {activity.reference || "—"}
      </td>
      <td className="px-3 py-3">
        <StatusBadge status={activity.status} />
      </td>
      <td
        className="px-3 py-3 text-xs font-mono whitespace-nowrap"
        style={{ color: "var(--nipw-text-muted)" }}
      >
        {fmtTS(activity.timestamp)}
      </td>
    </tr>
  );
}

// ─── Activity Table ────────────────────────────────────────────────────────────

function ActivityTable({
  activities,
  loading,
}: {
  activities: BackendActivity[];
  loading: boolean;
}) {
  const [expandedId, setExpandedId] = useState<bigint | null>(null);
  const HEADERS = [
    "#",
    "Type",
    "Gmail",
    "Username",
    "Amount",
    "Description",
    "Reference",
    "Status",
    "Timestamp",
  ];

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 gap-3"
        data-ocid="admin.activities.empty_state"
      >
        <Activity
          className="w-10 h-10 opacity-30"
          style={{ color: "var(--nipw-text-secondary)" }}
        />
        <div
          className="text-sm"
          style={{ color: "var(--nipw-text-secondary)" }}
        >
          No activities found
        </div>
      </div>
    );
  }

  const expanded = activities.find((a) => a.id === expandedId);

  return (
    <>
      {/* Expanded detail */}
      {expanded && (
        <div
          className="mx-4 my-3 rounded-xl p-4 space-y-2"
          style={{
            background: "rgba(212,175,55,0.06)",
            border: "1px solid rgba(212,175,55,0.25)",
          }}
          data-ocid="admin.activity.detail"
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-xs font-bold"
              style={{ color: "var(--nipw-gold)" }}
            >
              Activity Detail — #{expanded.id.toString()}
            </span>
            <button
              type="button"
              className="text-xs"
              onClick={() => setExpandedId(null)}
              style={{ color: "var(--nipw-text-secondary)" }}
            >
              Close ✕
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { k: "Gmail", v: expanded.userGmail },
              { k: "Username", v: expanded.username },
              { k: "Type", v: expanded.activityType },
              { k: "Status", v: expanded.status },
              {
                k: "Amount",
                v: expanded.amount > 0 ? fmtUSD(expanded.amount) : "—",
              },
              { k: "Reference", v: expanded.reference || "—" },
              { k: "Session ID", v: expanded.sessionId || "—" },
              { k: "Timestamp", v: fmtTS(expanded.timestamp) },
            ].map(({ k, v }) => (
              <div key={k}>
                <div
                  className="text-xs font-mono uppercase tracking-wider"
                  style={{ color: "var(--nipw-text-muted)" }}
                >
                  {k}
                </div>
                <div
                  className="text-xs font-semibold truncate"
                  style={{ color: "var(--nipw-text-primary)" }}
                >
                  {v}
                </div>
              </div>
            ))}
            <div className="col-span-2 md:col-span-4">
              <div
                className="text-xs font-mono uppercase tracking-wider"
                style={{ color: "var(--nipw-text-muted)" }}
              >
                Description
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--nipw-text-primary)" }}
              >
                {expanded.description}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(34,50,74,0.8)" }}>
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-xs font-mono uppercase tracking-wider"
                  style={{ color: "var(--nipw-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activities.map((act, idx) => (
              <ActivityRow
                key={act.id.toString()}
                activity={act}
                index={idx}
                onClick={() =>
                  setExpandedId(expandedId === act.id ? null : act.id)
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  dateFilter,
  setDateFilter,
  statusFilter,
  setStatusFilter,
}: {
  search: string;
  setSearch: (v: string) => void;
  typeFilter: ActivityType | "all";
  setTypeFilter: (v: ActivityType | "all") => void;
  dateFilter: DateFilter;
  setDateFilter: (v: DateFilter) => void;
  statusFilter: ActivityStatus | "all";
  setStatusFilter: (v: ActivityStatus | "all") => void;
}) {
  const typeOptions: Array<{ value: ActivityType | "all"; label: string }> = [
    { value: "all", label: "All Types" },
    { value: ActivityType.login, label: "Login" },
    { value: ActivityType.loginFailed, label: "Login Failed" },
    { value: ActivityType.accountCreation, label: "Account Created" },
    { value: ActivityType.deposit, label: "Deposit" },
    { value: ActivityType.sendMoney, label: "Send Money" },
    { value: ActivityType.receiveMoney, label: "Receive Money" },
    { value: ActivityType.receiptUpload, label: "Receipt Upload" },
    { value: ActivityType.keyVerification, label: "Key Verification" },
    { value: ActivityType.settingsChange, label: "Settings Change" },
  ];

  const selectStyle = {
    background: "var(--nipw-row-bg)",
    border: "1px solid var(--nipw-border)",
    color: "var(--nipw-text-primary)",
    fontSize: "12px",
    padding: "6px 8px",
    borderRadius: "8px",
    outline: "none",
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-4 py-3"
      style={{ borderBottom: "1px solid rgba(34,50,74,0.5)" }}
    >
      <div className="relative flex-1 min-w-[180px]">
        <Search
          className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
          style={{ color: "var(--nipw-text-muted)" }}
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Gmail or username..."
          className="pl-7 text-xs h-8"
          style={{
            background: "var(--nipw-row-bg)",
            border: "1px solid var(--nipw-border)",
            color: "var(--nipw-text-primary)",
          }}
          data-ocid="admin.filter.search"
        />
      </div>
      <Filter
        className="w-3.5 h-3.5 flex-shrink-0"
        style={{ color: "var(--nipw-text-muted)" }}
      />
      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value as ActivityType | "all")}
        style={selectStyle}
        data-ocid="admin.filter.type"
      >
        {typeOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value as DateFilter)}
        style={selectStyle}
        data-ocid="admin.filter.date"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
      <select
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value as ActivityStatus | "all")
        }
        style={selectStyle}
        data-ocid="admin.filter.status"
      >
        <option value="all">All Status</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
      </select>
    </div>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────

export function AdminPanel({ onExit }: { onExit: () => void }) {
  const { actor: rawActor, isFetching: isActorFetching } =
    useActor(createActor);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actor = rawActor as any;

  const [tab, setTab] = useState<AdminTab>("overview");
  const [activities, setActivities] = useState<BackendActivity[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filters for All Activities
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ActivityType | "all">("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | "all">(
    "all",
  );

  // Per-user search
  const [userSearchGmail, setUserSearchGmail] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<BackendActivity[]>(
    [],
  );
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchDone, setUserSearchDone] = useState(false);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!actor || isActorFetching) return;
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const [allActs, allProfiles, actStats] = await Promise.allSettled([
          actor.getAllUserActivities(),
          actor.getAllUserProfiles(),
          actor.getActivityStats(),
        ]);
        if (allActs.status === "fulfilled")
          setActivities(allActs.value as BackendActivity[]);
        if (allProfiles.status === "fulfilled")
          setProfiles(allProfiles.value as UserProfile[]);
        if (actStats.status === "fulfilled")
          setStats(actStats.value as ActivityStats);
        setLastRefreshed(new Date());
      } catch {
        // silently fail
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [actor, isActorFetching],
  );

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => fetchData(true), 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  const handleUserSearch = async () => {
    if (!userSearchGmail.trim() || !actor) return;
    setUserSearchLoading(true);
    setUserSearchDone(false);
    try {
      const results = await actor.getUserActivitiesByGmail(
        userSearchGmail.trim(),
      );
      setUserSearchResults(results as BackendActivity[]);
    } catch {
      setUserSearchResults([]);
    } finally {
      setUserSearchLoading(false);
      setUserSearchDone(true);
    }
  };

  // ─── Derived data ─────────────────────────────────────────────────────────

  const filteredActivities = activities.filter((a) => {
    const matchSearch =
      !search ||
      a.userGmail.toLowerCase().includes(search.toLowerCase()) ||
      a.username.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || a.activityType === typeFilter;
    const matchDate = passesDFilter(a.timestamp, dateFilter);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchType && matchDate && matchStatus;
  });

  const loginActivities = activities.filter(
    (a) =>
      a.activityType === ActivityType.login ||
      a.activityType === ActivityType.loginFailed,
  );

  const recentActivities = [...activities]
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, 10);

  const depositsToday = activities.filter(
    (a) => a.activityType === ActivityType.deposit && isToday(a.timestamp),
  ).length;

  const TABS: Array<{ id: AdminTab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "activities", label: "All Activities" },
    { id: "loginlog", label: "Login Log" },
    { id: "users", label: "Users" },
    { id: "usersearch", label: "Per-User Search" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--nipw-bg)" }}
      data-ocid="admin.panel"
    >
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; color: black !important; }
          table { border-collapse: collapse; }
          td, th { border: 1px solid #ccc; padding: 4px 8px; font-size: 11px; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Admin Header */}
      <header
        className="sticky top-0 z-50 w-full no-print"
        style={{
          background: "var(--nipw-nav-bg)",
          borderBottom: "1px solid rgba(212,175,55,0.35)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(212,175,55,0.15)",
                border: "1px solid rgba(212,175,55,0.4)",
              }}
            >
              <Shield
                className="w-4 h-4"
                style={{ color: "var(--nipw-gold)" }}
              />
            </div>
            <div>
              <div
                className="font-display font-bold text-sm tracking-wider leading-tight"
                style={{ color: "var(--nipw-gold)" }}
              >
                NIPW — Site Administration
              </div>
              <div
                className="text-xs font-mono"
                style={{ color: "var(--nipw-text-muted)" }}
              >
                {refreshing ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Refreshing…
                  </span>
                ) : (
                  `Last refresh: ${lastRefreshed.toLocaleTimeString()}`
                )}
              </div>
            </div>
            <Badge
              className="ml-2 text-xs"
              style={{
                background: "rgba(231,76,60,0.15)",
                color: "#E74C3C",
                border: "1px solid rgba(231,76,60,0.3)",
              }}
            >
              ADMIN
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
              style={{
                background: "var(--nipw-row-bg)",
                border: "1px solid var(--nipw-border)",
                color: "var(--nipw-text-secondary)",
              }}
              data-ocid="admin.refresh.button"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
              style={{
                background: "rgba(212,175,55,0.12)",
                border: "1px solid rgba(212,175,55,0.35)",
                color: "var(--nipw-gold)",
              }}
              data-ocid="admin.print.button"
            >
              <Download className="w-3.5 h-3.5" />
              Print Report
            </button>
            <button
              type="button"
              onClick={onExit}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
              style={{
                background: "var(--nipw-row-bg)",
                border: "1px solid var(--nipw-border)",
                color: "var(--nipw-text-secondary)",
              }}
              data-ocid="admin.exit.button"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <LogOut className="w-3.5 h-3.5" />
              Exit Admin
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 no-print">
          <StatCard
            label="Total Users"
            value={loading ? "—" : Number(stats?.totalUsers ?? profiles.length)}
            color="var(--nipw-gold)"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            label="Total Activities"
            value={
              loading
                ? "—"
                : Number(stats?.totalActivities ?? activities.length)
            }
            color="#2F6BFF"
            icon={<Activity className="w-5 h-5" />}
          />
          <StatCard
            label="Successful Logins"
            value={loading ? "—" : Number(stats?.totalLogins ?? 0)}
            color="#2ECC71"
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
          <StatCard
            label="Failed Logins"
            value={loading ? "—" : Number(stats?.failedLogins ?? 0)}
            color="#E74C3C"
            icon={<AlertTriangle className="w-5 h-5" />}
          />
          <StatCard
            label="Deposits Today"
            value={loading ? "—" : depositsToday}
            color="#D4AF37"
            icon={<Shield className="w-5 h-5" />}
          />
        </div>

        {/* Tab Navigation */}
        <div
          className="flex gap-1 mb-5 rounded-xl p-1 no-print"
          style={{
            background: "var(--nipw-surface)",
            border: "1px solid var(--nipw-border)",
          }}
          data-ocid="admin.tabs"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background:
                  tab === t.id ? "rgba(212,175,55,0.2)" : "transparent",
                color:
                  tab === t.id
                    ? "var(--nipw-gold)"
                    : "var(--nipw-text-secondary)",
                border:
                  tab === t.id
                    ? "1px solid rgba(212,175,55,0.4)"
                    : "1px solid transparent",
              }}
              data-ocid={`admin.tab.${t.id}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--nipw-surface)",
            border: "1px solid var(--nipw-border)",
          }}
        >
          {/* ─── Overview Tab ──────────────────────────────── */}
          {tab === "overview" && (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <Activity
                  className="w-4 h-4"
                  style={{ color: "var(--nipw-gold)" }}
                />
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--nipw-text-primary)" }}
                >
                  Recent Activity (Last 10)
                </span>
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div
                  className="space-y-2"
                  data-ocid="admin.overview.activity_list"
                >
                  {recentActivities.map((act, i) => (
                    <div
                      key={act.id.toString()}
                      className="flex flex-wrap items-center gap-3 p-3 rounded-lg"
                      style={{
                        background: "var(--nipw-row-bg)",
                        border: "1px solid rgba(34,50,74,0.6)",
                      }}
                      data-ocid={`admin.overview.activity.${i + 1}`}
                    >
                      <TypeBadge type={act.activityType} />
                      <span
                        className="text-xs font-mono flex-1 truncate"
                        style={{ color: "var(--nipw-text-secondary)" }}
                      >
                        {act.userGmail || "—"}
                      </span>
                      {act.amount > 0 && (
                        <span
                          className="text-xs font-mono font-semibold"
                          style={{ color: "var(--nipw-gold)" }}
                        >
                          {fmtUSD(act.amount)}
                        </span>
                      )}
                      <StatusBadge status={act.status} />
                      <span
                        className="text-xs font-mono"
                        style={{ color: "var(--nipw-text-muted)" }}
                      >
                        {fmtTS(act.timestamp)}
                      </span>
                    </div>
                  ))}
                  {recentActivities.length === 0 && (
                    <div
                      className="text-center py-10 text-sm"
                      style={{ color: "var(--nipw-text-muted)" }}
                      data-ocid="admin.overview.empty_state"
                    >
                      No activities recorded yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─── All Activities Tab ────────────────────────── */}
          {tab === "activities" && (
            <>
              <FilterBar
                search={search}
                setSearch={setSearch}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
              <div
                className="px-4 py-2 text-xs font-mono"
                style={{ color: "var(--nipw-text-muted)" }}
              >
                Showing {filteredActivities.length} of {activities.length}{" "}
                activities
              </div>
              <ActivityTable
                activities={filteredActivities}
                loading={loading}
              />
            </>
          )}

          {/* ─── Login Log Tab ─────────────────────────────── */}
          {tab === "loginlog" && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield
                  className="w-4 h-4"
                  style={{ color: "var(--nipw-gold)" }}
                />
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--nipw-text-primary)" }}
                >
                  Login Activity Log
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--nipw-text-muted)" }}
                >
                  ({loginActivities.length} events)
                </span>
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2" data-ocid="admin.loginlog.list">
                  {loginActivities
                    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                    .map((act, i) => {
                      const isSuccess = act.activityType === ActivityType.login;
                      return (
                        <div
                          key={act.id.toString()}
                          className="flex flex-wrap items-center gap-3 p-3 rounded-lg"
                          style={{
                            background: isSuccess
                              ? "rgba(46,204,113,0.05)"
                              : "rgba(231,76,60,0.05)",
                            border: `1px solid ${isSuccess ? "rgba(46,204,113,0.2)" : "rgba(231,76,60,0.2)"}`,
                          }}
                          data-ocid={`admin.loginlog.item.${i + 1}`}
                        >
                          {isSuccess ? (
                            <CheckCircle2
                              className="w-4 h-4 flex-shrink-0"
                              style={{ color: "#2ECC71" }}
                            />
                          ) : (
                            <XCircle
                              className="w-4 h-4 flex-shrink-0"
                              style={{ color: "#E74C3C" }}
                            />
                          )}
                          <span
                            className="text-xs font-semibold"
                            style={{
                              color: isSuccess ? "#2ECC71" : "#E74C3C",
                            }}
                          >
                            {isSuccess ? "Success" : "Failed"}
                          </span>
                          <span
                            className="text-xs font-mono flex-1 truncate"
                            style={{ color: "var(--nipw-text-primary)" }}
                          >
                            {act.username || "—"}
                          </span>
                          <span
                            className="text-xs font-mono"
                            style={{ color: "var(--nipw-text-secondary)" }}
                          >
                            {act.userGmail || "—"}
                          </span>
                          {act.reference && (
                            <span
                              className="text-xs font-mono"
                              style={{ color: "var(--nipw-text-muted)" }}
                            >
                              Session: {act.reference}
                            </span>
                          )}
                          <span
                            className="text-xs font-mono ml-auto"
                            style={{ color: "var(--nipw-text-muted)" }}
                          >
                            {fmtTS(act.timestamp)}
                          </span>
                        </div>
                      );
                    })}
                  {loginActivities.length === 0 && (
                    <div
                      className="text-center py-10 text-sm"
                      style={{ color: "var(--nipw-text-muted)" }}
                      data-ocid="admin.loginlog.empty_state"
                    >
                      No login events recorded yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─── Users Tab ─────────────────────────────────── */}
          {tab === "users" && (
            <div className="overflow-x-auto" data-ocid="admin.users.table">
              {loading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded" />
                  ))}
                </div>
              ) : (
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(34,50,74,0.8)",
                      }}
                    >
                      {[
                        "#",
                        "Username",
                        "Gmail",
                        "Display Name",
                        "Role",
                        "Activities",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider"
                          style={{
                            color: "var(--nipw-text-muted)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p, i) => {
                      const actCount = activities.filter(
                        (a) => a.userGmail === p.gmail,
                      ).length;
                      return (
                        <tr
                          key={p.gmail}
                          className="cursor-pointer transition-colors hover:brightness-110"
                          style={{
                            borderBottom: "1px solid rgba(34,50,74,0.5)",
                          }}
                          onClick={() => {
                            setUserSearchGmail(p.gmail);
                            setTab("usersearch");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setUserSearchGmail(p.gmail);
                              setTab("usersearch");
                            }
                          }}
                          tabIndex={0}
                          data-ocid={`admin.users.row.${i + 1}`}
                        >
                          <td
                            className="px-4 py-3 text-xs font-mono"
                            style={{ color: "var(--nipw-text-muted)" }}
                          >
                            {i + 1}
                          </td>
                          <td
                            className="px-4 py-3 text-xs font-semibold"
                            style={{ color: "var(--nipw-text-primary)" }}
                          >
                            {p.username}
                          </td>
                          <td
                            className="px-4 py-3 text-xs font-mono"
                            style={{ color: "var(--nipw-text-secondary)" }}
                          >
                            {p.gmail}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: "var(--nipw-text-secondary)" }}
                          >
                            {p.displayName || "—"}
                          </td>
                          <td className="px-4 py-3">
                            {p.isAdmin ? (
                              <Badge
                                className="text-xs"
                                style={{
                                  background: "rgba(212,175,55,0.15)",
                                  color: "var(--nipw-gold)",
                                  border: "1px solid rgba(212,175,55,0.3)",
                                }}
                              >
                                Admin
                              </Badge>
                            ) : (
                              <Badge
                                className="text-xs"
                                style={{
                                  background: "rgba(47,107,255,0.12)",
                                  color: "#2F6BFF",
                                  border: "1px solid rgba(47,107,255,0.25)",
                                }}
                              >
                                User
                              </Badge>
                            )}
                          </td>
                          <td
                            className="px-4 py-3 text-xs font-mono font-bold text-right"
                            style={{ color: "var(--nipw-gold)" }}
                          >
                            {actCount}
                          </td>
                        </tr>
                      );
                    })}
                    {profiles.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-10 text-sm"
                          style={{ color: "var(--nipw-text-muted)" }}
                        >
                          No user profiles found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ─── Per-User Search Tab ────────────────────────── */}
          {tab === "usersearch" && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-5">
                <Search
                  className="w-4 h-4"
                  style={{ color: "var(--nipw-gold)" }}
                />
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--nipw-text-primary)" }}
                >
                  Per-User Activity Search
                </span>
              </div>
              <div className="flex gap-2 mb-4">
                <Input
                  value={userSearchGmail}
                  onChange={(e) => setUserSearchGmail(e.target.value)}
                  placeholder="Enter Gmail address..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUserSearch();
                  }}
                  className="text-sm flex-1"
                  style={{
                    background: "var(--nipw-row-bg)",
                    border: "1px solid var(--nipw-border)",
                    color: "var(--nipw-text-primary)",
                  }}
                  data-ocid="admin.usersearch.gmail_input"
                />
                <Button
                  onClick={handleUserSearch}
                  disabled={userSearchLoading || !userSearchGmail.trim()}
                  className="text-sm font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, #D4AF37 0%, #B8952E 100%)",
                    color: "var(--nipw-bg)",
                    border: "none",
                  }}
                  data-ocid="admin.usersearch.submit_button"
                >
                  {userSearchLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Search
                </Button>
              </div>
              {userSearchDone && (
                <div
                  className="text-xs mb-3 font-mono"
                  style={{ color: "var(--nipw-text-muted)" }}
                >
                  {userSearchResults.length} activities found for "
                  {userSearchGmail}"
                </div>
              )}
              <ActivityTable
                activities={userSearchResults}
                loading={userSearchLoading}
              />
            </div>
          )}
        </div>

        {/* Print-only table */}
        <div className="print-only mt-4">
          <h1
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            NIPW — Activity Report
          </h1>
          <p style={{ fontSize: "11px", marginBottom: "12px" }}>
            Generated: {new Date().toLocaleString()}
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "#",
                  "Type",
                  "Gmail",
                  "Username",
                  "Amount",
                  "Description",
                  "Status",
                  "Timestamp",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      border: "1px solid #ccc",
                      padding: "4px 8px",
                      fontSize: "11px",
                      textAlign: "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.map((act, i) => (
                <tr key={act.id.toString()}>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "4px 8px",
                      fontSize: "10px",
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "4px 8px",
                      fontSize: "10px",
                    }}
                  >
                    {act.activityType}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "4px 8px",
                      fontSize: "10px",
                    }}
                  >
                    {act.userGmail}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "4px 8px",
                      fontSize: "10px",
                    }}
                  >
                    {act.username}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "4px 8px",
                      fontSize: "10px",
                    }}
                  >
                    {act.amount > 0 ? fmtUSD(act.amount) : "—"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "4px 8px",
                      fontSize: "10px",
                    }}
                  >
                    {act.description}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "4px 8px",
                      fontSize: "10px",
                    }}
                  >
                    {act.status}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "4px 8px",
                      fontSize: "10px",
                    }}
                  >
                    {fmtTS(act.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
