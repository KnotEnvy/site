"use client";

import React from "react";

/**
 * Isolates the WebGL canvas. If three/WebGL fails on a device (no GL context,
 * driver issue, etc.) the page degrades to the CSS sky gradient instead of the
 * whole app crashing.
 */
export default class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode; onFail?: () => void },
  { failed: boolean }
> {
  constructor(props: { children: React.ReactNode; onFail?: () => void }) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onFail?.();
    if (process.env.NODE_ENV !== "production") {
      console.warn("Cloud canvas disabled:", error);
    }
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
