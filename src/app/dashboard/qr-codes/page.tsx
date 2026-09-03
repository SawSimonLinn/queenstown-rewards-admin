import Link from "next/link";
import QRCode from "qrcode";

import { deactivateQrCode } from "@/app/dashboard/qr-codes/actions";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, DataPair, EmptyState } from "@/components/ui/data-list";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitButton } from "@/components/ui/submit-button";
import { createClient } from "@/lib/supabase/server";

export default async function QrCodesPage() {
  const supabase = await createClient();
  const { data: qrCodes } = await supabase
    .from("redemption_qr_codes")
    .select("id, token, is_active, expires_at, locations(name), burger_campaigns(name)")
    .order("expires_at", { ascending: false });

  const withImages = await Promise.all(
    (qrCodes ?? []).map(async (qr) => ({
      ...qr,
      image: await QRCode.toDataURL(qr.token, { width: 160, margin: 1 }),
    }))
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="QR Codes" subtitle={`${withImages.length} generated codes`}>
        <Link
          href="/dashboard/qr-codes/new"
          className={buttonClassName({ className: "w-full sm:w-auto" })}
        >
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
            return (
              <Card key={qr.id} className="flex min-w-0 flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-semibold text-neutral-950">
                      {(qr.burger_campaigns as unknown as { name: string } | null)?.name ??
                        "Unknown campaign"}
                    </h2>
                    <p className="mt-1 break-words text-sm text-neutral-500">
                      {(qr.locations as unknown as { name: string } | null)?.name ??
                        "Unknown location"}
                    </p>
                  </div>
                  <Badge tone={qr.is_active && !expired ? "green" : "neutral"}>{status}</Badge>
                </div>

                <div className="flex flex-col items-center gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center sm:flex-row sm:text-left">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qr.image}
                    alt={`QR code for ${qr.token}`}
                    className="h-36 w-36 shrink-0 rounded-md bg-white p-1"
                  />
                  <dl className="grid min-w-0 flex-1 gap-3">
                    <DataPair label="Expires">
                      {new Date(qr.expires_at).toLocaleString()}
                    </DataPair>
                    <DataPair label="Token">
                      <span className="break-all font-mono text-xs">{qr.token}</span>
                    </DataPair>
                  </dl>
                </div>

                {qr.is_active && (
                  <form action={deactivateQrCode.bind(null, qr.id)}>
                    <SubmitButton
                      variant="outline"
                      pendingLabel="Deactivating..."
                      className="w-full sm:w-auto"
                    >
                      Deactivate
                    </SubmitButton>
                  </form>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
