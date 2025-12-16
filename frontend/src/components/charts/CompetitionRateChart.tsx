"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CompetitionData {
  name: string;
  rate: number;
  year: number;
}

interface CompetitionRateChartProps {
  data: CompetitionData[];
}

const COLORS = ["#0ea5e9", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];

export function CompetitionRateChart({ data }: CompetitionRateChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            tickFormatter={(value) => `${value}:1`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value: number) => [`${value}:1`, "경쟁률"]}
            labelStyle={{ fontWeight: 600 }}
          />
          <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}



