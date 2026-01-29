export const DASHBOARD_ALLOWED_EMAILS = [
  'sistemamoa2023@gmail.com',
  'golfredo.pf@gmail.com',
] as const;

export const isDashboardAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return DASHBOARD_ALLOWED_EMAILS.some((allowed) => allowed.toLowerCase() === normalized);
};
