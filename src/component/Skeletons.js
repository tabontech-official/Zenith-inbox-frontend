import React from "react";

/**
 * Base Shimmer component with smooth pulse animation
 */
export const Shimmer = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200/80 rounded-[8px] ${className}`} />
);

/**
 * Modern Skeleton for the Main Dashboard / Organization page
 */
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Organization Name */}
      <div className="flex items-center justify-between">
        <Shimmer className="h-8 w-48 rounded-lg" />
        <Shimmer className="h-9 w-32 rounded-lg" />
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-2 flex-1">
              <Shimmer className="h-3 w-28" />
              <Shimmer className="h-7 w-20" />
              <Shimmer className="h-2 w-36 mt-2" />
            </div>
            <Shimmer className="h-10 w-10 rounded-full shrink-0" />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configured Scenarios (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shimmer className="h-9 w-9 rounded-xl" />
              <div className="space-y-1.5">
                <Shimmer className="h-4 w-36" />
                <Shimmer className="h-3 w-24" />
              </div>
            </div>
            <Shimmer className="h-8 w-28 rounded-lg" />
          </div>

          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5 flex-1">
                <Shimmer className="h-10 w-10 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1 max-w-sm">
                  <Shimmer className="h-4 w-48" />
                  <Shimmer className="h-3 w-72" />
                </div>
              </div>
              <Shimmer className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>

        {/* Info / Right Card */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 text-white space-y-4">
          <Shimmer className="h-10 w-10 rounded-xl bg-slate-800" />
          <Shimmer className="h-5 w-48 bg-slate-800" />
          <Shimmer className="h-16 w-full bg-slate-800" />
          <Shimmer className="h-4 w-32 bg-slate-800 mt-4" />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-3">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-14 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-3">
          <Shimmer className="h-4 w-36" />
          <Shimmer className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

/**
 * Modern Skeleton for Table views (AllScenarios, Inbox, etc.)
 */
export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="rounded-[10px] border border-zinc-200 bg-white overflow-hidden shadow-xs animate-in fade-in duration-150">
      {/* Table Header */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3.5 flex items-center justify-between">
        <Shimmer className="h-3.5 w-32" />
        <Shimmer className="h-3.5 w-24" />
        <Shimmer className="h-3.5 w-20" />
        <Shimmer className="h-3.5 w-28" />
        <Shimmer className="h-3.5 w-16" />
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-zinc-100">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="px-5 py-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Shimmer className="h-9 w-9 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1 max-w-xs">
                <Shimmer className="h-4 w-40" />
                <Shimmer className="h-3 w-20" />
              </div>
            </div>
            <Shimmer className="h-3.5 w-44 hidden sm:block" />
            <Shimmer className="h-5 w-16 rounded-md hidden md:block" />
            <Shimmer className="h-6 w-20 rounded-full" />
            <Shimmer className="h-3.5 w-20 hidden lg:block" />
            <Shimmer className="h-7 w-7 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Modern Skeleton for Scenario Canvas / Builder
 */
export const ScenarioCanvasSkeleton = () => {
  return (
    <div className="flex-1 flex flex-col bg-[#FAF8F5] p-6 space-y-8 animate-in fade-in duration-150 min-h-[500px]">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Shimmer className="h-5 w-64 rounded-md" />
          <Shimmer className="h-3.5 w-48 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Shimmer className="h-8 w-24 rounded-full" />
          <Shimmer className="h-8 w-28 rounded-full" />
          <Shimmer className="h-8 w-16 rounded-full" />
        </div>
      </div>

      {/* Flow Cards on Canvas */}
      <div className="flex items-center gap-6 overflow-x-auto py-8">
        {[1, 2, 3, 4].map((i) => (
          <React.Fragment key={i}>
            <div className="w-64 h-48 shrink-0 rounded-[20px] border border-[#EBE8E1] bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shimmer className="h-8 w-8 rounded-xl" />
                  <Shimmer className="h-4 w-24" />
                </div>
                <Shimmer className="h-3 w-3 rounded-full" />
              </div>
              <div className="space-y-2">
                <Shimmer className="h-3.5 w-36" />
                <Shimmer className="h-3 w-48" />
              </div>
              <Shimmer className="h-3 w-20 border-t border-slate-100 pt-3" />
            </div>
            {i < 4 && <Shimmer className="h-0.5 w-12 shrink-0 bg-slate-300" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
