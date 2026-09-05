"use client";

import { buttonClassName } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

import { deactivateQrCode, regenerateQrCode } from "./actions";

export function QrCodeActions({
  qrCodeId,
  isActive,
  image,
  fileName,
}: {
  qrCodeId: string;
  isActive: boolean;
  image: string;
  fileName: string;
}) {
  const { showToast } = useToast();

  function handleDownload() {
    const link = document.createElement("a");
    link.href = image;
    link.download = fileName;
    link.click();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={handleDownload} className={buttonClassName({ variant: "outline", size: "sm" })}>
        Download
      </button>
      {isActive && (
        <>
          <ConfirmButton
            label="Regenerate"
            triggerSize="sm"
            title="Regenerate QR code"
            description="This deactivates the current code and creates a new one for the same location and campaign. Any printed copies of the old code will stop working immediately."
            confirmLabel="Regenerate"
            onConfirm={async () => {
              const result = await regenerateQrCode(qrCodeId);
              if (result.error) throw new Error(result.error);
              showToast("QR code regenerated.", "success");
            }}
          />
          <ConfirmButton
            label="Deactivate"
            triggerSize="sm"
            variant="danger"
            title="Deactivate QR code"
            description="This immediately invalidates the code. Any printed copies will stop working."
            confirmLabel="Deactivate"
            onConfirm={async () => {
              const result = await deactivateQrCode(qrCodeId);
              if (result.error) throw new Error(result.error);
              showToast("QR code deactivated.", "success");
            }}
          />
        </>
      )}
    </div>
  );
}
