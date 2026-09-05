"use client";

import { ConfirmButton } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

import { setEntitlementStatus } from "../actions";

export function EntitlementAction({
  entitlementId,
  customerId,
  status,
}: {
  entitlementId: string;
  customerId: string;
  status: "eligible" | "ineligible" | "redeemed";
}) {
  const { showToast } = useToast();

  if (status === "redeemed") return null;

  const target = status === "eligible" ? "ineligible" : "eligible";

  return (
    <ConfirmButton
      label={`Mark ${target}`}
      triggerSize="sm"
      title={`Mark ${target}`}
      description={`This is a staff correction to this customer's entitlement for this period. It will be reflected immediately in the mobile app.`}
      confirmLabel="Confirm"
      onConfirm={async () => {
        await setEntitlementStatus(entitlementId, customerId, target);
        showToast(`Entitlement marked ${target}.`, "success");
      }}
    />
  );
}
