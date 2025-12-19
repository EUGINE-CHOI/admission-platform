"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  animate?: boolean;
  glass?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

export function Card({
  children,
  className = "",
  hover = false,
  animate = false,
  glass = false,
  padding = "md",
  onClick,
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const baseStyles = glass
    ? "backdrop-blur-md bg-white/70 dark:bg-slate-800/70"
    : "bg-white dark:bg-slate-800";

  const hoverStyles = hover
    ? "hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer"
    : "";

  const animateStyles = animate ? "animate-fade-in" : "";

  return (
    <div
      onClick={onClick}
      className={`
        ${baseStyles}
        rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm
        transition-all duration-200
        ${hoverStyles}
        ${animateStyles}
        ${paddings[padding]}
        ${className}
      `}
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
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{children}</h3>
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
    sky: "bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400",
    indigo: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400",
    emerald: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400",
    purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
  };

  return (
    <Card>
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl flex items-center justify-center ${colors[color]}`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</span>
            {suffix && (
              <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">{suffix}</span>
            )}
          </div>
        </div>
        {trend && (
          <div
            className={`text-xs sm:text-sm font-medium ${
              trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
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

