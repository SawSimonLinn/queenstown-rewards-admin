import type { BadgeTone } from "@/components/ui/data-list";

export type CampaignStatus = "draft" | "scheduled" | "active" | "expired";

/** burger_campaigns.status is a manually-selected enum, not derived from dates. */
export function getCampaignStatus(status: string): CampaignStatus {
  if (status === "draft" || status === "scheduled" || status === "active" || status === "expired") {
    return status;
  }
  return "draft";
}

export const CAMPAIGN_STATUS_TONE: Record<CampaignStatus, BadgeTone> = {
  draft: "neutral",
  scheduled: "blue",
  active: "green",
  expired: "red",
};

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  active: "Active",
  expired: "Expired",
};

export type PromotionStatus = "draft" | "scheduled" | "active" | "expired";

/**
 * Promotion visibility, per spec: assigned to the location, publish status
 * permits it, start has passed, end has not passed. `status` here is the
 * manual draft/active flag on `specials`; scheduled/active/expired are then
 * derived from the date window, mirroring how burger_campaigns works.
 */
export function getPromotionStatus({
  status,
  startDate,
  endDate,
  now = new Date(),
}: {
  status: string;
  startDate: string;
  endDate: string;
  now?: Date;
}): PromotionStatus {
  if (status !== "active") return "draft";
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return "scheduled";
  if (now > end) return "expired";
  return "active";
}

export function isPromotionCurrentlyVisible({
  status,
  startDate,
  endDate,
  now = new Date(),
}: {
  status: string;
  startDate: string;
  endDate: string;
  now?: Date;
}): boolean {
  return getPromotionStatus({ status, startDate, endDate, now }) === "active";
}

export const PROMOTION_STATUS_TONE: Record<PromotionStatus, BadgeTone> = {
  draft: "neutral",
  scheduled: "blue",
  active: "green",
  expired: "red",
};

export const PROMOTION_STATUS_LABEL: Record<PromotionStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  active: "Active",
  expired: "Expired",
};

export type RedemptionStatus = "pending_staff_confirmation" | "confirmed" | "cancelled" | "corrected";

export const REDEMPTION_STATUS_TONE: Record<RedemptionStatus, BadgeTone> = {
  pending_staff_confirmation: "yellow",
  confirmed: "green",
  cancelled: "neutral",
  corrected: "blue",
};

export const REDEMPTION_STATUS_LABEL: Record<RedemptionStatus, string> = {
  pending_staff_confirmation: "Pending confirmation",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  corrected: "Corrected",
};

export type NotificationStatus = "draft" | "scheduled" | "sending" | "sent" | "failed";

export const NOTIFICATION_STATUS_TONE: Record<NotificationStatus, BadgeTone> = {
  draft: "neutral",
  scheduled: "blue",
  sending: "yellow",
  sent: "green",
  failed: "red",
};

export const NOTIFICATION_STATUS_LABEL: Record<NotificationStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  sending: "Sending",
  sent: "Sent",
  failed: "Failed",
};
