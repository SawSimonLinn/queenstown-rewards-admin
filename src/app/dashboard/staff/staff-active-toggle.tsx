"use client";

import { ConfirmButton } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

import { setStaffActive } from "./actions";

export function StaffActiveToggle({ staffMemberId, isActive }: { staffMemberId: string; isActive: boolean }) {
  const { showToast } = useToast();

  return (
    <ConfirmButton
      label={isActive ? "Deactivate" : "Reactivate"}
      triggerSize="sm"
      variant={isActive ? "danger" : "primary"}
      title={isActive ? "Deactivate staff account" : "Reactivate staff account"}
      description={
        isActive
          ? "This immediately revokes their access to this dashboard. Their login remains but they'll no longer be treated as active staff."
          : "This restores their access to this dashboard."
      }
      confirmLabel={isActive ? "Deactivate" : "Reactivate"}
      onConfirm={async () => {
        await setStaffActive(staffMemberId, !isActive);
        showToast(isActive ? "Staff account deactivated." : "Staff account reactivated.", "success");
      }}
    />
  );
}
