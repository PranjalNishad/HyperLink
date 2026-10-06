/** A shortened URL as returned by the dashboard API. */
export interface ShortUrl {
  id: string;
  destination: string;
  slug: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
}

/** Aggregate dashboard metrics (backend intentionally exposes only these two). */
export interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
}

/** Pagination metadata returned alongside a page of links. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** A page of the current user's links plus pagination metadata. */
export interface PaginatedLinks {
  links: ShortUrl[];
  meta: PaginationMeta;
}
