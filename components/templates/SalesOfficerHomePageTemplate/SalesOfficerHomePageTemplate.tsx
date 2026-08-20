"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  TrendingUp,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Bell,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import { SalesOfficerService } from "@/services";
import { Lead, leadsStatusOptions, LeadStatus } from "@/types/Leads";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DayCounts, LeadStatsResponse, NeedsAttentionItem, NeedsAttentionMode } from "@/types";

// ── Brand palette ────────────────────────────────────────────────
const BRAND = "#029EC9";
const BRAND_LIGHT = "#00B7E8";
const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  in_progress: BRAND_LIGHT,
  completed: "#10b981",
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const REMINDER_INTERVAL_MS = 1 * 60 * 1000; // 1 minute

// ─ Date helpers ─────────────────────────────────────────────────
function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDateKey(d: Date) {
  // Use local date components instead of toISOString() to avoid timezone issues
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // YYYY-MM-DD in local time
}

// ── Reminder sound using MP3 file ───────────────────────────────
// ── Reminder beep (Web Audio API, robust & live-ready) ──────────
// Reusing a single AudioContext prevents browser limits and memory leaks.
let globalAudioContext: AudioContext | null = null;

function getAudioContext() {
  if (!globalAudioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      globalAudioContext = new AudioCtx();
    }
  }
  return globalAudioContext;
}

export function playReminderBeep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Modern browsers suspend audio until a user gesture (click/scroll).
    // We attempt to resume it silently so it's ready when needed.
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {
        // Silently ignore if the user hasn't interacted with the page yet
      });
    }

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now); // 880Hz (A5 note)

    // Create a smooth "beep-beep" envelope to avoid harsh clicking/popping sounds
    // First beep
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    // Second beep
    gainNode.gain.setValueAtTime(0.001, now + 0.25);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.55);
  } catch (e) {
    console.warn("Unable to play reminder sound", e);
  }
}

export default function SalesOfficerHomePageTemplate() {
  const salesOfficerService = useMemo(() => new SalesOfficerService(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats (cards, pie chart, 7-day trend)
  const [stats, setStats] = useState<LeadStatsResponse | null>(null);

  // Today's leads (the only leads actually loaded into the browser)
  const [todayLeads, setTodayLeads] = useState<Lead[]>([]);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<"all" | LeadStatus>(
    "all",
  );

  // Weekly calendar
  const [weekOffset, setWeekOffset] = useState(0);
  const [calendarStatusFilter, setCalendarStatusFilter] = useState<
    "all" | LeadStatus
  >("all");
  const [calendarData, setCalendarData] = useState<Record<string, DayCounts>>(
    {},
  );

  // Needs Attention filters
  const [naMode, setNaMode] = useState<NeedsAttentionMode>("today");
  const [naDate, setNaDate] = useState<string>(toDateKey(new Date()));
  const [needsAttention, setNeedsAttention] = useState<NeedsAttentionItem[]>(
    [],
  );

  // Reminder modal
  const [showReminder, setShowReminder] = useState(false);
  const [reminderPendingCount, setReminderPendingCount] = useState(0);

  // ── Initial load: stats + today's leads ──────────────────────────
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, todayRes] = await Promise.all([
          salesOfficerService.getLeadStats(),
          salesOfficerService.getTodayLeadsForSO({}),
        ]);

        setStats(statsRes);
        setTodayLeads(todayRes?.data || []);
      } catch (err: any) {
        console.error("Failed to load dashboard data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [salesOfficerService]);

  // ── Weekly calendar: fetch only the 7 days currently in view ────
  const weekStart = useMemo(
    () => addDays(startOfWeek(new Date()), weekOffset * 7),
    [weekOffset],
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const start = weekDays[0];
        const end = weekDays[6];
        const res = await salesOfficerService.getLeadsCalendarForSO({
          startDate: toDateKey(start),
          endDate: toDateKey(end),
          status:
            calendarStatusFilter === "all" ? undefined : calendarStatusFilter,
        });
        setCalendarData(res || {});
      } catch (err) {
        console.error("Failed to load calendar:", err);
      }
    };
    fetchCalendar();
  }, [salesOfficerService, weekDays, calendarStatusFilter]);

  const dayReports = useMemo(() => {
    const today = new Date();
    return weekDays.map((date) => {
      const counts = calendarData[toDateKey(date)] || {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
      };
      return {
        date,
        isToday: isSameDay(date, today),
        ...counts,
      };
    });
  }, [weekDays, calendarData]);

  const weekRangeLabel = useMemo(() => {
    const end = weekDays[6];
    const sameMonth = weekStart.getMonth() === end.getMonth();
    const startLabel = weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endLabel = end.toLocaleDateString("en-US", {
      month: sameMonth ? undefined : "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startLabel} – ${endLabel}`;
  }, [weekStart, weekDays]);

  // ── Needs Attention: server does the staleness math ──────────────
  useEffect(() => {
    const fetchNeedsAttention = async () => {
      try {
        const params =
          naMode === "custom"
            ? { date: naDate }
            : { range: naMode as "today" | "7d" | "30d" };
        const res =
          await salesOfficerService.getNeedsAttentionLeadsForSO(params);
        setNeedsAttention(res || []);
      } catch (err) {
        console.error("Failed to load needs-attention leads:", err);
      }
    };
    fetchNeedsAttention();
  }, [salesOfficerService, naMode, naDate]);

  // ── Reminder: every 10 minutes, recheck today's pending leads ────
  useEffect(() => {
    const checkAndRemind = async () => {
      try {
        const res = await salesOfficerService.getTodayLeadsForSO({});
        const todays: Lead[] = res?.data || [];
        setTodayLeads(todays);

        const pendingToday = todays.filter(
          (l) => l.status === "pending",
        ).length;

        if (pendingToday > 0) {
          setReminderPendingCount(pendingToday);
          setShowReminder(true);
          playReminderBeep();
        } else {
          setShowReminder(false);
        }
      } catch (err) {
        console.error("Reminder check failed:", err);
      }
    };

    const interval = setInterval(checkAndRemind, REMINDER_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [salesOfficerService]);

  // ── Filtered today's-leads table ─────────────────────────────────
  const filteredTodayLeads = useMemo(() => {
    return todayLeads.filter((lead) => {
      const matchesSearch = [
        lead.userName,
        lead.location,
        lead.phoneNumber || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(leadSearch.toLowerCase());
      const matchesStatus =
        leadStatusFilter === "all" || lead.status === leadStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [todayLeads, leadSearch, leadStatusFilter]);

  const chartDataLeadStatus = stats
    ? [
        { name: "Pending", value: stats.pending, color: STATUS_COLORS.pending },
        {
          name: "In Progress",
          value: stats.inProgress,
          color: STATUS_COLORS.in_progress,
        },
        {
          name: "Completed",
          value: stats.completed,
          color: STATUS_COLORS.completed,
        },
      ]
    : [];

  const getLeadStatusColor = (status: LeadStatus) => {
    const option = leadsStatusOptions.find((opt) => opt.value === status);
    return option?.color || "bg-gray-100 text-gray-800";
  };

  const jumpToTodayLeads = useCallback(() => {
    setShowReminder(false);
    setLeadStatusFilter("pending");
    document
      .getElementById("today-leads-table")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-600">Error: {error || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-full mx-auto px-1 lg:px-6 py-10 overflow-x-hidden bg-gray-50 text-gray-900">
      {/* Header */}
      <header>
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00B7E8] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg lg:text-2xl font-bold">
                  Sales Officer Dashboard
                </h1>
                <p className="text-sm text-gray-500">Monitor your leads</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Welcome back</p>
              <p className="text-sm lg:text-lg font-semibold">Sales Officer</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Leads — area trend */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#00B7E8] transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Leads</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
              </div>
              <div className="w-12 h-12 bg-[#00B7E8]/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#00B7E8]" />
              </div>
            </div>
            <div className="h-14 mt-3 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.last7Days}>
                  <defs>
                    <linearGradient id="totalTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={BRAND_LIGHT}
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor={BRAND_LIGHT}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={BRAND_LIGHT}
                    strokeWidth={2}
                    fill="url(#totalTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending — bar trend */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#00B7E8] transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-3xl font-bold mt-2">{stats.pending}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Awaiting first touch
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="h-14 mt-3 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.last7Days}>
                  <Bar
                    dataKey="pending"
                    fill={STATUS_COLORS.pending}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* In Progress — line trend */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#00B7E8] transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-3xl font-bold mt-2">{stats.inProgress}</p>
                <p className="text-xs text-gray-500 mt-2">Being worked</p>
              </div>
              <div className="w-12 h-12 bg-[#029EC9]/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#029EC9]" />
              </div>
            </div>
            <div className="h-14 mt-3 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.last7Days}>
                  <Line
                    type="monotone"
                    dataKey="inProgress"
                    stroke={BRAND}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conversion Rate — radial gauge */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#00B7E8] transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Conversion Rate</p>
                <p className="text-3xl font-bold mt-2">
                  {stats.conversionRate.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.completed} of {stats.total} completed
                </p>
              </div>
              <div className="w-16 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={[{ value: stats.conversionRate, fill: "#10b981" }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      dataKey="value"
                      tick={false}
                      axisLine={false}
                    />
                    <RadialBar
                      dataKey="value"
                      cornerRadius={8}
                      background={{ fill: "#e5e7eb" }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white text-sm lg:text-normal border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Lead Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartDataLeadStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartDataLeadStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.375rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white text-sm lg:text-normal border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="lg:text-lg font-semibold mb-4">
              Weekly Leads Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#6b7280" />
                <YAxis stroke="#6b7280" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.375rem",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={BRAND_LIGHT}
                  strokeWidth={2}
                  dot={{ fill: BRAND_LIGHT }}
                  name="Total"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981" }}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Calendar — per-day lead report (fetched per visible week) */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#00B7E8]/10 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-[#00B7E8]" />
              </div>
              <div>
                <h3 className="font-semibold">Weekly Lead Report</h3>
                <p className="text-xs text-gray-500">{weekRangeLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset(0)}
                className="px-3 py-2 text-sm font-medium rounded border border-gray-200 hover:border-[#00B7E8] hover:text-[#00B7E8] transition-colors"
              >
                Today
              </button>
              <div className="flex items-center border border-gray-200 rounded">
                <button
                  onClick={() => setWeekOffset((w) => w - 1)}
                  aria-label="Previous week"
                  className="p-2 hover:text-[#00B7E8] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setWeekOffset((w) => w + 1)}
                  aria-label="Next week"
                  className="p-2 hover:text-[#00B7E8] transition-colors border-l border-gray-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Select
                  value={calendarStatusFilter}
                  onValueChange={(value) =>
                    setCalendarStatusFilter(value as "all" | LeadStatus)
                  }
                >
                  <SelectTrigger
                    className="w-[150px] bg-slate-100 border-0 rounded pl-9 pr-3 py-5 text-sm text-gray-900 shadow-none data-[placeholder]:text-gray-500"
                    aria-label="Filter calendar by status"
                  >
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 p-4 lg:p-6">
            {dayReports.map((day, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 transition-colors ${
                  day.isToday
                    ? "border-[#00B7E8] bg-[#00B7E8]/5"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">
                      {DAY_LABELS[i]}
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        day.isToday ? "text-[#00B7E8]" : "text-gray-900"
                      }`}
                    >
                      {day.date.getDate()}
                    </p>
                  </div>
                  {day.isToday && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#00B7E8] text-white">
                      Today
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-2">
                  {day.total} lead{day.total === 1 ? "" : "s"}
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS.pending }}
                      />
                      Pending
                    </span>
                    <span className="font-medium">{day.pending}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS.in_progress }}
                      />
                      In Progress
                    </span>
                    <span className="font-medium">{day.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS.completed }}
                      />
                      Completed
                    </span>
                    <span className="font-medium">{day.completed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Leads table */}
        <div
          id="today-leads-table"
          className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:p-6 border-b border-gray-200">
            <div>
              <h3 className="font-semibold">Today's Leads</h3>
              <p className="text-xs text-gray-500">
                {todayLeads.length} lead{todayLeads.length === 1 ? "" : "s"}{" "}
                assigned today
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Search name, location, phone"
                  className="pl-9 w-56"
                />
              </div>
              <Select
                value={leadStatusFilter}
                onValueChange={(value) =>
                  setLeadStatusFilter(value as "all" | LeadStatus)
                }
              >
                <SelectTrigger
                  className="w-[150px] py-6"
                  aria-label="Filter leads by status"
                >
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredTodayLeads.length > 0 ? (
              filteredTodayLeads.map((lead) => (
                <div
                  key={lead._id}
                  className="flex items-center justify-between px-4 lg:px-6 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{lead.userName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {lead.location}
                      {lead.phoneNumber ? ` • ${lead.phoneNumber}` : ""}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeadStatusColor(
                      lead.status || "pending",
                    )}`}
                  >
                    {leadsStatusOptions.find((opt) => opt.value === lead.status)
                      ?.label || "Pending"}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-gray-500">
                No leads match this filter.
              </div>
            )}
          </div>
        </div>

        {/* Needs Attention — server-computed staleness, date/range filterable */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold">Needs Attention</h3>
                <p className="text-xs text-gray-500">
                  Leads sitting untouched or stalled past their follow-up window
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={naMode}
                onValueChange={(value) =>
                  setNaMode(value as NeedsAttentionMode)
                }
              >
                <SelectTrigger
                  className="w-[160px]"
                  aria-label="Filter by date range"
                >
                  <SelectValue placeholder="Today" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="custom">Pick a date</SelectItem>
                </SelectContent>
              </Select>

              {naMode === "custom" && (
                <input
                  type="date"
                  value={naDate}
                  onChange={(e) => setNaDate(e.target.value)}
                  className="border border-gray-200 rounded px-3 py-2 text-sm"
                  aria-label="Choose a date to check leads assigned that day"
                />
              )}
            </div>
          </div>

          <div className="p-4 lg:p-6">
            {needsAttention.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {needsAttention.map((lead) => (
                  <div
                    key={lead._id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{lead.userName}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {lead.location}
                        {lead.phoneNumber ? ` • ${lead.phoneNumber}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeadStatusColor(
                          lead.status || "pending",
                        )}`}
                      >
                        {leadsStatusOptions.find(
                          (opt) => opt.value === lead.status,
                        )?.label || "Pending"}
                      </span>
                      {/* <span className="text-xs font-medium text-amber-600 whitespace-nowrap">
                        {lead.daysStale}d stale
                      </span> */}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-sm text-gray-500">
                  All caught up — no pending or stalled leads in this window.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50 mt-12">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-2 text-gray-900">
                Dashboard Info
              </h4>
              <p className="text-sm text-gray-600">
                Real-time lead tracking system
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-900">Last Updated</h4>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-900">Data Summary</h4>
              <p className="text-sm text-gray-600">{stats.total} Leads</p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>
              © {new Date().toLocaleDateString("en-US", { year: "numeric" })}{" "}
              Sales Officer Dashboard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Reminder modal — bottom-right, rechecked every 10 minutes,
          shows while today's leads still have any pending ones */}
      {showReminder && reminderPendingCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white border border-amber-300 rounded-lg shadow-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Leads waiting on you</p>
              <p className="text-xs text-gray-600 mt-1">
                {reminderPendingCount} lead
                {reminderPendingCount === 1 ? "" : "s"} assigned today{" "}
                {reminderPendingCount === 1 ? "is" : "are"} still pending. Keep
                going until none are left pending.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={jumpToTodayLeads}
                  className="text-xs font-medium px-3 py-1.5 rounded bg-[#00B7E8] text-white hover:bg-[#029EC9] transition-colors"
                >
                  Review now
                </button>
                <button
                  onClick={() => setShowReminder(false)}
                  className="text-xs font-medium px-3 py-1.5 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowReminder(false)}
              aria-label="Close reminder"
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
