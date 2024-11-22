import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Apple-inspired color palette
const LIGHT_COLORS = ["#007AFF", "#5856D6", "#FF2D55", "#FF9500"];
const DARK_COLORS = ["#0A84FF", "#5E5CE6", "#FF375F", "#FF9F0A"];

interface MemoryDataPoint {
  timestamp: number;
  usedHeap: number;
  totalHeap: number;
}

interface PerformanceChartsProps {
  metrics: {
    timing: {
      totalLoadTime?: number;
      domContentLoaded?: number;
      firstPaint?: number | "Not available";
      firstContentfulPaint?: number | "Not available";
    };
    memory: {
      usedJSHeapSize?: number;
      totalJSHeapSize?: number;
      jsHeapSizeLimit?: number;
    };
    resources: Array<{
      name: string;
      type: string;
      duration: number;
      size: number;
    }>;
    layout: {
      cumulativeLayoutShift?: string;
    };
  };
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ metrics }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [memoryTimeSeries, setMemoryTimeSeries] = useState<MemoryDataPoint[]>([]);

  useEffect(() => {
    // Check system color scheme
    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeMediaQuery.matches);

    // Listen for theme changes
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener("change", handler);
    return () => darkModeMediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    // Initialize memory monitoring
    const updateMemoryUsage = () => {
      const { memory } = performance as any;
      if (memory) {
        const newDataPoint = {
          timestamp: Date.now(),
          usedHeap: Math.round(memory.usedJSHeapSize / (1024 * 1024)), // Convert to MB
          totalHeap: Math.round(memory.totalJSHeapSize / (1024 * 1024)),
        };

        setMemoryTimeSeries((prev) => {
          const newData = [...prev, newDataPoint];
          // Keep last 30 seconds of data
          return newData.filter((point) => point.timestamp > Date.now() - 30000);
        });
      }
    };

    const intervalId = setInterval(updateMemoryUsage, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const gridColor = isDarkMode ? "#333333" : "#E5E5E5";
  const backgroundColor = isDarkMode ? "#1C1C1E" : "#FFFFFF";

  const timingData = [
    { name: "Total Load", time: metrics.timing.totalLoadTime },
    { name: "DOM Content", time: metrics.timing.domContentLoaded },
    { name: "First Paint", time: typeof metrics.timing.firstPaint === "number" ? metrics.timing.firstPaint : 0 },
    {
      name: "First Contentful",
      time: typeof metrics.timing.firstContentfulPaint === "number" ? metrics.timing.firstContentfulPaint : 0,
    },
  ];

  const memoryData = [
    { name: "Used Heap", value: metrics.memory.usedJSHeapSize },
    { name: "Total Heap", value: metrics.memory.totalJSHeapSize },
    { name: "Heap Limit", value: metrics.memory.jsHeapSizeLimit },
  ];

  const resourceData = metrics.resources
    .slice(0, 10) // Show only top 10 resources
    .sort((a, b) => b.duration - a.duration);

  const chartStyle = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor,
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "24px",
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getSeconds()}:${date.getMilliseconds().toString().padStart(3, "0")}`;
  };

  const isMemoryAPIAvailable = () => {
    return (performance as any).memory !== undefined;
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        backgroundColor,
        color: textColor,
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <div style={chartStyle}>
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Timing Metrics (ms)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timingData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fill: textColor }} />
            <YAxis tick={{ fill: textColor }} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? "#2C2C2E" : "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            />
            <Bar dataKey="time" fill={colors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {isMemoryAPIAvailable() ? (
        <div style={chartStyle}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Memory Usage Over Time (MB)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={memoryTimeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="timestamp"
                tick={{ fill: textColor }}
                tickFormatter={formatTimestamp}
                domain={["dataMin", "dataMax"]}
              />
              <YAxis tick={{ fill: textColor }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#2C2C2E" : "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
                labelFormatter={formatTimestamp}
              />
              <Line
                type="monotone"
                dataKey="usedHeap"
                stroke={colors[0]}
                name="Used Heap"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="totalHeap"
                stroke={colors[1]}
                name="Total Heap"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={chartStyle}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Memory Usage Over Time (MB)</h3>
          <p style={{ color: textColor }}>Memory monitoring is only available in Chromium-based browsers.</p>
        </div>
      )}

      <div style={chartStyle}>
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Resource Loading Times (ms)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={resourceData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fill: textColor }} />
            <YAxis tick={{ fill: textColor }} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? "#2C2C2E" : "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            />
            <Bar dataKey="duration" fill={colors[1]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
