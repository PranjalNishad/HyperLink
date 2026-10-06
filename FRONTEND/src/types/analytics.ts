import type { ShortUrl } from "@/types/shortUrl";

/**
 * Cumulative metrics available from the current data.
 * No click-event history exists, so time-based metrics are intentionally absent.
 */
export interface AnalyticsOverview {
  totalLinks: number;
  totalClicks: number;
  linksWithClicks: number;
}

/** A link ranked by its cumulative click count. */
export type TopLink = ShortUrl;

/** Per-link cumulative analytics. */
export type LinkAnalytics = ShortUrl;
