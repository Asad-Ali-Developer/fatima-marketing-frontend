"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  HardDrive,
  Cpu,
  MemoryStick,
  Server,
} from "lucide-react";
import { HealthService } from "@/services";

// ============================
// TYPES
// ============================
interface NodeHeap {
  used: string;
  total: string;
}

interface MemoryData {
  status: "healthy" | "warning";
  used: string;
  total: string;
  usagePercent: string;
  nodeHeap: NodeHeap;
}

interface DiskData {
  status: "healthy" | "warning";
  used: string;
  free: string;
  total: string;
  usagePercent: string;
  path: string;
}

interface CpuData {
  status: "healthy" | "warning";
  loadAverage: {
    "1min": string;
    "5min": string;
    "15min": string;
  };
  cores: number;
  model: string;
}

interface SystemMetrics {
  status: "up" | "down";
  memory: MemoryData;
  disk: DiskData;
  cpu: CpuData;
}

interface HealthResponse {
  status: "ok" | "error";
  info: {
    system_metrics: SystemMetrics;
  };
}

// ============================
// HELPER FUNCTIONS (Moved outside component)
// ============================
const getStatusConfig = (status: string) => {
  switch (status) {
    case "healthy":
    case "up":
    case "ok":
      return {
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
      };
    case "warning":
      return {
        icon: AlertTriangle,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
      };
    default:
      return {
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
      };
  }
};

// ============================
// MAIN COMPONENT
// ============================
const SystemHealthPageTemplate = () => {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const healthService = new HealthService();

  // Fetch health data from your NestJS API
  const fetchHealthData = async () => {
    setIsLoading(true);
    try {
      const data: HealthResponse = await healthService.check();
      setHealthData(data);
      setLastChecked(new Date());
    } catch (error) {
      console.error("Error fetching health data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  if (isLoading && !healthData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-[#00B7E8] animate-spin" />
          <p className="text-slate-500 font-medium">Loading system health...</p>
        </div>
      </div>
    );
  }

  const metrics = healthData?.info.system_metrics;
  const overallStatus = healthData?.status || "error";
  const statusConfig = getStatusConfig(overallStatus);
  const OverallIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans">
      <main className="max-w-[95%] mx-auto px-1 lg:px-6 py-10">
        {/* ===== HEADER ===== */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#00B7E8] font-bold text-xs uppercase tracking-widest mb-2 bg-slate-100 border border-slate-100 px-3 py-1 rounded-full w-max">
              <Activity className="text-base" />
              System Health
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#142C4B]">
              Server Status & Metrics
            </h2>
            <p className="text-slate-500 max-w-xl">
              Real-time monitoring of memory, disk, and CPU utilization.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {lastChecked && (
              <span className="text-xs text-slate-500">
                Last checked: {lastChecked.toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={fetchHealthData}
              disabled={isLoading}
              className="flex items-center gap-2 text-white bg-[#00B7E8] hover:bg-[#029ec9] transition-colors font-medium duration-150 cursor-pointer shadow-none rounded"
            >
              <RefreshCw
                className={cn("text-lg", isLoading && "animate-spin")}
              />
              {isLoading ? "Refreshing..." : "Refresh Status"}
            </Button>
          </div>
        </div>

        {/* ===== OVERALL STATUS CARD ===== */}
        <Card
          className={cn(
            "mb-8 border-2 shadow-sm transition-all",
            statusConfig.bg,
            statusConfig.border,
          )}
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-3 rounded-xl bg-white shadow-sm",
                  statusConfig.color,
                )}
              >
                <OverallIcon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Overall System Status
                </h3>
                <p className="text-sm text-slate-600">
                  {overallStatus === "ok"
                    ? "All systems are operational and running within normal parameters."
                    : "One or more systems are experiencing issues. Check details below."}
                </p>
              </div>
            </div>
            <div
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border",
                statusConfig.bg,
                statusConfig.color,
                statusConfig.border,
              )}
            >
              {overallStatus === "ok" ? "Operational" : "Degraded"}
            </div>
          </CardContent>
        </Card>

        {/* ===== METRICS GRID ===== */}
        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* MEMORY CARD */}
            <MetricCard
              title="Memory Usage"
              icon={<MemoryStick className="h-5 w-5" />}
              status={metrics.memory.status}
            >
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">
                      {metrics.memory.usagePercent}
                    </p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                      Utilization
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">
                      {metrics.memory.used}
                    </p>
                    <p className="text-xs text-slate-500">
                      of {metrics.memory.total}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-500",
                      metrics.memory.status === "healthy"
                        ? "bg-emerald-500"
                        : "bg-amber-500",
                    )}
                    style={{ width: metrics.memory.usagePercent }}
                  />
                </div>

                {/* Node Heap Details */}
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Node.js Heap
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Used</p>
                      <p className="text-sm font-bold text-slate-800">
                        {metrics.memory.nodeHeap.used}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="text-sm font-bold text-slate-800">
                        {metrics.memory.nodeHeap.total}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </MetricCard>

            {/* DISK CARD */}
            <MetricCard
              title="Disk Storage"
              icon={<HardDrive className="h-5 w-5" />}
              status={metrics.disk.status}
            >
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">
                      {metrics.disk.usagePercent}
                    </p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                      Utilization
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">
                      {metrics.disk.used}
                    </p>
                    <p className="text-xs text-slate-500">
                      of {metrics.disk.total}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-500",
                      metrics.disk.status === "healthy"
                        ? "bg-emerald-500"
                        : "bg-amber-500",
                    )}
                    style={{ width: metrics.disk.usagePercent }}
                  />
                </div>

                {/* Disk Details */}
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Storage Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Free Space</p>
                      <p className="text-sm font-bold text-slate-800">
                        {metrics.disk.free}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Mount Path</p>
                      <p
                        className="text-sm font-bold text-slate-800 truncate"
                        title={metrics.disk.path}
                      >
                        {metrics.disk.path}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </MetricCard>

            {/* CPU CARD */}
            <MetricCard
              title="CPU Performance"
              icon={<Cpu className="h-5 w-5" />}
              status={metrics.cpu.status}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {metrics.cpu.cores} Cores
                    </p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
                      Processor
                    </p>
                  </div>
                  <div className="text-right max-w-[60%]">
                    <p
                      className="text-xs font-bold text-slate-800 truncate"
                      title={metrics.cpu.model}
                    >
                      {metrics.cpu.model}
                    </p>
                  </div>
                </div>

                {/* Load Averages */}
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Load Average
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <LoadMetric
                      label="1 Min"
                      value={metrics.cpu.loadAverage["1min"]}
                    />
                    <LoadMetric
                      label="5 Min"
                      value={metrics.cpu.loadAverage["5min"]}
                    />
                    <LoadMetric
                      label="15 Min"
                      value={metrics.cpu.loadAverage["15min"]}
                    />
                  </div>
                </div>

                {/* CPU Status Indicator */}
                <div
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border",
                    metrics.cpu.status === "healthy"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-amber-50 border-amber-200 text-amber-700",
                  )}
                >
                  {metrics.cpu.status === "healthy" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span className="text-xs font-semibold">
                    {metrics.cpu.status === "healthy"
                      ? "CPU load is normal"
                      : "High CPU load detected"}
                  </span>
                </div>
              </div>
            </MetricCard>
          </div>
        )}

        {/* ===== SERVER INFO FOOTER ===== */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Server className="h-3 w-3" />
          <span>
            Monitoring Node.js Environment • Uptime tracked via Health API
          </span>
        </div>
      </main>
    </div>
  );
};

// ============================
// REUSABLE SUB-COMPONENTS
// ============================

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  status: "healthy" | "warning";
  children: React.ReactNode;
}

const MetricCard = ({ title, icon, status, children }: MetricCardProps) => {
  // Now this works because getStatusConfig is in the same scope (top-level)
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
      <CardHeader className="pb-2 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "p-2 rounded-lg",
                statusConfig.bg,
                statusConfig.color,
              )}
            >
              {icon}
            </div>
            <CardTitle className="text-base font-bold text-slate-800">
              {title}
            </CardTitle>
          </div>
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
              statusConfig.bg,
              statusConfig.color,
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {status.toUpperCase()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
};

interface LoadMetricProps {
  label: string;
  value: string;
}

const LoadMetric = ({ label, value }: LoadMetricProps) => (
  <div className="bg-slate-50 p-3 rounded-lg text-center">
    <p className="text-lg font-bold text-slate-800">{value}</p>
    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
      {label}
    </p>
  </div>
);

export default SystemHealthPageTemplate;
