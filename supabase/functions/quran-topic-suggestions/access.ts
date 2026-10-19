export function hasPaidAccess(entitlement: { status: string; source: string; expires_at: string | null } | null, now = Date.now()) {
  return entitlement?.status === "active" && entitlement.source === "subscription" &&
    (entitlement.expires_at === null || Date.parse(entitlement.expires_at) > now);
}