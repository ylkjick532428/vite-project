import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ metrics }) => {
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

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <h3>Timing Metrics (ms)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={timingData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="time" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h3>Memory Usage (MB)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={memoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {memoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <h3>Resource Loading Times (ms)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={resourceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="duration" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
