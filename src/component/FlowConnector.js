import React from "react";

/*
|--------------------------------------------------------------------------
| FlowConnector — the link drawn between two scenario cards
|--------------------------------------------------------------------------
|
| The canvas is a node graph, so the link between two steps should read the
| way a node editor's does: a drawn edge with terminals, carrying something
| along it. An ASCII "---->" and, later, a line-plus-chevron both read as
| punctuation between cards rather than as a connection.
|
| This draws an SVG edge with:
|
|   - a ring terminal at each end, sitting on the card's edge
|   - a soft track line, always visible so the path is legible at rest
|   - a dashed overlay that travels along the track, showing direction and
|     that the flow moves left to right
|
| The motion is the part that makes it read as a live pipeline rather than
| a divider. It is disabled under prefers-reduced-motion, where the dashes
| simply sit still — direction is still carried by the terminals and by the
| left-to-right layout, so nothing is lost.
*/

const FlowConnector = ({
  /* Muted when the step it points at is not configured. */
  muted = false,
  className = "",
}) => {
  const line = muted ? "#E2E0DA" : "#D5D1C8";
  const dash = muted ? "#CFCBC2" : "#8A8577";
  const ring = muted ? "#E2E0DA" : "#B8B3A7";

  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center self-center ${className}`}
    >
      <svg
        width="64"
        height="16"
        viewBox="0 0 64 16"
        fill="none"
        className="overflow-visible"
      >
        {/* Track — the edge at rest. */}
        <line
          x1="6"
          y1="8"
          x2="58"
          y2="8"
          stroke={line}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Travelling dashes. */}
        <line
          x1="6"
          y1="8"
          x2="58"
          y2="8"
          stroke={dash}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 8"
          className="flow-connector-dash"
        />

        {/* Terminals. */}
        <circle cx="4" cy="8" r="3" fill="#FAF8F5" stroke={ring} strokeWidth="1.5" />
        <circle cx="60" cy="8" r="3" fill={ring} />
      </svg>
    </div>
  );
};

export default FlowConnector;
