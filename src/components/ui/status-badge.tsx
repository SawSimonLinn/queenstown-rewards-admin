import { Badge } from "@/components/ui/data-list";
import {
  CAMPAIGN_STATUS_LABEL,
  CAMPAIGN_STATUS_TONE,
  getCampaignStatus,
  getPromotionStatus,
  NOTIFICATION_STATUS_LABEL,
  NOTIFICATION_STATUS_TONE,
  type NotificationStatus,
  PROMOTION_STATUS_LABEL,
  PROMOTION_STATUS_TONE,
  REDEMPTION_STATUS_LABEL,
  REDEMPTION_STATUS_TONE,
  type RedemptionStatus,
} from "@/lib/status";

export function CampaignStatusBadge({ status }: { status: string }) {
  const resolved = getCampaignStatus(status);
  return <Badge tone={CAMPAIGN_STATUS_TONE[resolved]}>{CAMPAIGN_STATUS_LABEL[resolved]}</Badge>;
}

export function PromotionStatusBadge({
  status,
  startDate,
  endDate,
}: {
  status: string;
  startDate: string;
  endDate: string;
}) {
  const resolved = getPromotionStatus({ status, startDate, endDate });
  return <Badge tone={PROMOTION_STATUS_TONE[resolved]}>{PROMOTION_STATUS_LABEL[resolved]}</Badge>;
}

export function RedemptionStatusBadge({ status }: { status: string }) {
  const resolved = status as RedemptionStatus;
  const tone = REDEMPTION_STATUS_TONE[resolved] ?? "neutral";
  const label = REDEMPTION_STATUS_LABEL[resolved] ?? status;
  return <Badge tone={tone}>{label}</Badge>;
}

export function NotificationStatusBadge({ status }: { status: string }) {
  const resolved = status as NotificationStatus;
  const tone = NOTIFICATION_STATUS_TONE[resolved] ?? "neutral";
  const label = NOTIFICATION_STATUS_LABEL[resolved] ?? status;
  return <Badge tone={tone}>{label}</Badge>;
}
