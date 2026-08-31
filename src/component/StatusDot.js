import React from "react";

/*
|--------------------------------------------------------------------------
| StatusDot — the pulsing live/paused/pending indicator
|--------------------------------------------------------------------------
|
| A solid dot with a matching halo expanding behind it. The pulse is what
| makes it read as a live state rather than decoration.
|
| ACCESSIBILITY
|
| Two things this does not rely on:
|
|   - Colour alone. Every dot carries a `title`, and the surfaces using it
|     also state the status in words nearby.
|   - Motion. The halo is hidden under prefers-reduced-motion; continuous
|     pulsing is exactly what that setting exists to stop, and the solid
|     dot still carries the state without it.
*/

const TONES = {
  active: { color: "bg-[#34A853]", title: "Active" },
  paused: { color: "bg-red-500", title: "Paused" },
  pending: { color: "bg-amber-400", title: "Needs attention" },
  idle: { color: "bg-slate-300", title: "Inactive" },
};

const StatusDot = ({
  tone = "active",
  title,
  size = "md",
  /* Set when the dot sits in a top-aligned row and needs nudging down. */
  className = "",
}) => {
  const { color, title: defaultTitle } = TONES[tone] || TONES.active;
  const box = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";

  return (
    <span
      title={title || defaultTitle}
      className={`relative flex shrink-0 ${box} ${className}`}
    >
      <span
        className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping motion-reduce:hidden ${color}`}
      />
      <span className={`relative inline-flex rounded-full ${box} ${color}`} />
    </span>
  );
};

export default StatusDot;
