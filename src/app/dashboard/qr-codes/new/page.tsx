import { QrCodeForm } from "@/app/dashboard/qr-codes/qr-code-form";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function NewQrCodePage() {
  const supabase = await createClient();
  const [{ data: locations }, { data: campaigns }] = await Promise.all([
    supabase.from("locations").select("id, name").order("name"),
    supabase.from("burger_campaigns").select("id, name").order("start_date", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Generate QR code" />
      <QrCodeForm locations={locations ?? []} campaigns={campaigns ?? []} />
    </div>
  );
}
