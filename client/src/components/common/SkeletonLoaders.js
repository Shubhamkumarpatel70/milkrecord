import React from 'react';

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-24"></div>
            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
          </div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-32 mb-2"></div>
          <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded-lg w-20"></div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs overflow-hidden my-4 animate-pulse">
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 flex justify-between">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-36"></div>
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-20"></div>
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-slate-200 dark:bg-slate-700/80 rounded-lg flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs animate-pulse space-y-4 my-4">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-40"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-28"></div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-2 flex flex-col justify-between">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-10"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SkeletonLoaders({ type = 'card' }) {
  if (type === 'table') return <TableSkeleton />;
  if (type === 'calendar') return <CalendarSkeleton />;
  return <CardSkeleton />;
}
