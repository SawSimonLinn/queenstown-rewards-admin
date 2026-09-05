import Link from "next/link";
import QRCode from "qrcode";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, DataPair, EmptyState } from "@/components/ui/data-list";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

import { QrCodeActions } from "./qr-code-actions";

export default async function QrCodesPage() {
  const supabase = await createClient();
  const { data: qrCodes } = await supabase
    .from("redemption_qr_codes")
    .select("id, token, is_active, expires_at, locations(name), burger_campaigns(name)")
    .order("expires_at", { ascending: false });

  const withImages = await Promise.all(
    (qrCodes ?? []).map(async (qr) => ({
      ...qr,
      image: await QRCode.toDataURL(qr.token, { width: 240, margin: 1 }),
    }))
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="QR Codes" subtitle={`${withImages.length} generated codes`}>
        <Link href="/dashboard/qr-codes/new" className={buttonClassName({ className: "w-full sm:w-auto" })}>
          Generate QR code
        </Link>
      </PageHeader>

      {withImages.length === 0 ? (
        <EmptyState>No QR codes have been generated yet.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {withImages.map((qr) => {
            const expired = new Date(qr.expires_at) <= new Date();
            const status = qr.is_active && !expired ? "Active" : expired ? "Expired" : "Deactivated";
            const campaign = qr.burger_campaigns as unknown as { name: string } | null;
            const location = qr.locations as unknown as { name: string } | null;
            return (
              <Card key={qr.id} className="flex min-w-0 flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-semibold text-ink">{campaign?.name ?? "Unknown campaign"}</h2>
                    <p className="mt-1 break-words text-sm text-muted">{location?.name ?? "Unknown location"}</p>
                  </div>
                  <Badge tone={qr.is_active && !expired ? "green" : status === "Expired" ? "red" : "neutral"}>{status}</Badge>
                </div>

                <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-cream p-4 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr.image} alt={`QR code for ${campaign?.name ?? "campaign"}`} className="h-40 w-40 rounded-lg bg-surface p-1" />
                  <DataPair label="Expires">{new Date(qr.expires_at).toLocaleString()}</DataPair>
                </div>

                <details className="text-xs text-muted">
                  <summary className="cursor-pointer select-none font-medium">Details</summary>
                  <p className="mt-1 break-all font-mono">{qr.token}</p>
                </details>

                <QrCodeActions
                  qrCodeId={qr.id}
                  isActive={qr.is_active}
                  image={qr.image}
                  fileName={`${(campaign?.name ?? "qr-code").replace(/\s+/g, "-").toLowerCase()}-${(location?.name ?? "").replace(/\s+/g, "-").toLowerCase()}.png`}
                />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
