/**
 * HyperLink dashboard API client (authenticated).
 *
 * Contract:
 * - GET /api/urls/stats        -> { success, data: { totalLinks, totalClicks } }
 * - GET /api/urls?page&limit   -> { success, data: { links }, meta }
 *
 * Authentication is cookie-based (httpOnly accessToken), so every request is
 * sent with `credentials: "include"`. The user id is never sent by the client.
 */

import { apiFetch } from "@/api/client";
import type {
  DashboardStats,
  PaginatedLinks,
  PaginationMeta,
  ShortUrl,
} from "@/types/shortUrl";

interface StatsResponse {
  success: boolean;
  data: DashboardStats;
}

interface UrlsResponse {
  success: boolean;
  data: { links: ShortUrl[] };
  meta: PaginationMeta;
}

/** Fetches aggregate dashboard statistics for the signed-in user. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiFetch("/api/urls/stats");
  const body = (await response.json()) as StatsResponse;
  return body.data;
}

/** Fetches one page of the signed-in user's links. */
export async function getUserUrls(
  page = 1,
  limit = 10,
): Promise<PaginatedLinks> {
  const response = await apiFetch(`/api/urls?page=${page}&limit=${limit}`);
  const body = (await response.json()) as UrlsResponse;
  return { links: body.data.links, meta: body.meta };
}
