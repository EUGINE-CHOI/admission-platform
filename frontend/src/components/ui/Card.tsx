"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${
        hover ? "hover:shadow-md hover:border-slate-300 transition-all" : ""
      } ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({
  children,
  className = "",
  icon,
  action,
}: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-slate-900">{children}</h3>
      </div>
      {action}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  suffix?: string;
  trend?: { value: number; isPositive: boolean };
  color?: "sky" | "indigo" | "emerald" | "amber" | "rose" | "purple";
}

export function StatCard({
  icon,
  title,
  value,
  suffix,
  trend,
  color = "sky",
}: StatCardProps) {
  const colors = {
    sky: "bg-sky-100 text-sky-600",
    indigo: "bg-indigo-100 text-indigo-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-500">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{value}</span>
            {suffix && (
              <span className="text-sm text-slate-400">{suffix}</span>
            )}
          </div>
        </div>
        {trend && (
          <div
            className={`text-sm font-medium ${
              trend.isPositive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "+" : "-"}
            {trend.value}%
          </div>
        )}
      </div>
    </Card>
  );
}

