"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { SystemIssue } from "@/server/system/status";

/**
 * Raises a toast for every degraded subsystem on page load.
 *
 * Deliberately silent when everything is healthy — a toast on every navigation
 * saying "all good" trains you to dismiss without reading, which defeats the
 * point. It only speaks up when something is actually wrong or falling back.
 *
 * NOT rendered on /lp/[slug]: that page is for the prospect, who must never see
 * our internal plumbing.
 */
export function SystemStatusToasts({ issues }: { issues: SystemIssue[] }) {
  // Fire once per mount, and dedupe by issue id so navigating between pages
  // doesn't stack five copies of the same warning.
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;

    if (issues.length === 0) {
      console.info("[system] all subsystems healthy");
      return;
    }

    for (const issue of issues) {
      // Browser console gets the verbose version — a toast can be dismissed or
      // missed, and the console log persists for the rest of the session.
      const logLine =
        `[system] ${issue.title}: ${issue.detail}` +
        (issue.debug ? `\n          ${issue.debug}` : "");
      if (issue.level === "error") console.error(logLine);
      else console.warn(logLine);

      // Toast stays one short technical line. Verbose context lives in the
      // console, not in a paragraph the user has to read to dismiss.
      const options = {
        id: issue.id,
        description: issue.detail,
        duration: issue.level === "error" ? Infinity : 6_000,
        closeButton: true,
      };

      if (issue.level === "error") toast.error(issue.title, options);
      else if (issue.level === "warning") toast.warning(issue.title, options);
      else toast.info(issue.title, options);
    }
  }, [issues]);

  return null;
}
