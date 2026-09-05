"use client";

import { ConfirmButton } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

import { deleteSpecial, duplicateSpecial, setSpecialStatus } from "./actions";

export function SpecialRowActions({ specialId, status }: { specialId: string; status: string }) {
  const { showToast } = useToast();

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {status === "active" ? (
        <ConfirmButton
          label="Deactivate"
          title="Deactivate promotion"
          description="This sets the promotion back to Draft, so it stops appearing in the mobile app immediately."
          confirmLabel="Deactivate"
          onConfirm={async () => {
            const result = await setSpecialStatus(specialId, "draft");
            if (result.error) throw new Error(result.error);
            showToast("Promotion deactivated.", "success");
          }}
        />
      ) : (
        <ConfirmButton
          label="Activate"
          title="Activate promotion"
          description="This publishes the promotion — it will appear in the mobile app while its dates are current."
          confirmLabel="Activate"
          onConfirm={async () => {
            const result = await setSpecialStatus(specialId, "active");
            if (result.error) throw new Error(result.error);
            showToast("Promotion activated.", "success");
          }}
        />
      )}
      <ConfirmButton
        label="Duplicate"
        title="Duplicate promotion"
        description="Creates a draft copy of this promotion with the same details and locations."
        confirmLabel="Duplicate"
        onConfirm={async () => {
          const result = await duplicateSpecial(specialId);
          if (result.error) throw new Error(result.error);
          showToast("Promotion duplicated as a draft.", "success");
        }}
      />
      <ConfirmButton
        label="Delete"
        title="Delete promotion"
        description="This permanently removes the promotion. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        triggerVariant="outline"
        onConfirm={async () => {
          const result = await deleteSpecial(specialId);
          if (result.error) throw new Error(result.error);
          showToast("Promotion deleted.", "success");
        }}
      />
    </div>
  );
}
