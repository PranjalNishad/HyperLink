/**
 * HyperLink analytics API client (authenticated, cookie-based).
 *
 * Contract (Tier A — cumulative only; no click-event history exists):
 * - GET /api/urls/overview         -> { success, data: { totalLinks, totalClicks, linksWithClicks } }
 * - GET /api/urls/top?limit=       -> { success, data: { links } }
 * - GET /api/urls/:id              -> { success, data: { id, destination, slug, shortUrl, clicks, createdAt } }
 */

import { apiFetch } from "@/api/client";
import type { AnalyticsOverview, LinkAnalytics, TopLink } from "@/types/analytics";

interface OverviewResponse {
  success: boolean;
  data: AnalyticsOverview;
}

interface TopLinksResponse {
  success: boolean;
  data: { links: TopLink[] };
}

interface LinkAnalyticsResponse {
  success: boolean;
  data: LinkAnalytics;
}

/** Cumulative overview metrics for the signed-in user. */
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const response = await apiFetch("/api/urls/overview");
  const body = (await response.json()) as OverviewResponse;
  return body.data;
}

/** The signed-in user's links sorted by cumulative clicks (descending). */
export async function getTopLinks(limit = 5): Promise<TopLink[]> {
  const response = await apiFetch(`/api/urls/top?limit=${limit}`);
  const body = (await response.json()) as TopLinksResponse;
  return body.data.links;
}

/** Cumulative analytics for a single owned link. */
export async function getLinkAnalytics(id: string): Promise<LinkAnalytics> {
  const response = await apiFetch(`/api/urls/${id}`);
  const body = (await response.json()) as LinkAnalyticsResponse;
  return body.data;
}
