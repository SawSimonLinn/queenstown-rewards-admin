"use client";

import { ConfirmButton } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

import { duplicateCampaign, setCampaignStatus } from "./actions";

export function CampaignRowActions({ campaignId, status }: { campaignId: string; status: string }) {
  const { showToast } = useToast();

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {status !== "active" && (
        <ConfirmButton
          label="Activate"
          title="Activate campaign"
          description="This sets the campaign to Active immediately. Any other currently-active campaign should be archived first to avoid confusion in the mobile app."
          confirmLabel="Activate"
          onConfirm={async () => {
            const result = await setCampaignStatus(campaignId, "active");
            if (result.error) throw new Error(result.error);
            showToast("Campaign activated.", "success");
          }}
        />
      )}
      {status !== "expired" && (
        <ConfirmButton
          label="Archive"
          title="Archive campaign"
          description="This marks the campaign as expired. It will stop appearing as active in the mobile app."
          confirmLabel="Archive"
          variant="danger"
          onConfirm={async () => {
            const result = await setCampaignStatus(campaignId, "expired");
            if (result.error) throw new Error(result.error);
            showToast("Campaign archived.", "success");
          }}
        />
      )}
      <ConfirmButton
        label="Duplicate"
        title="Duplicate campaign"
        description="Creates a draft copy of this campaign with the same details and locations, which you can then edit."
        confirmLabel="Duplicate"
        onConfirm={async () => {
          const result = await duplicateCampaign(campaignId);
          if (result.error) throw new Error(result.error);
          showToast("Campaign duplicated as a draft.", "success");
        }}
      />
    </div>
  );
}
