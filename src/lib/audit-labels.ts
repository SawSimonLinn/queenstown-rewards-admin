const ACTION_LABELS: Record<string, string> = {
  redemption_confirmed: "Redemption confirmed",
  redemption_cancelled: "Redemption cancelled",
  redemption_corrected: "Redemption corrected",
  notification_dispatched: "Scheduled notification sent",
  notification_dispatch_failed: "Scheduled notification failed",
};

export function humanizeAction(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/_/g, " ");
}
