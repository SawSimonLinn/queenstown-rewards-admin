import { DAYS, type OpeningHours } from "@/lib/opening-hours";
import { checkboxClass, checkboxLabelClass, inputClass } from "@/components/ui/field";

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function OpeningHoursFields({ initial }: { initial?: OpeningHours }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink">Opening hours</p>
      {DAYS.map((day) => {
        const hours = initial?.[day] ?? null;
        const label = DAY_LABELS[day];
        return (
          <div key={day} className="rounded-lg border border-border bg-cream p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-ink">{label}</span>
              <label className={`${checkboxLabelClass} min-h-9 px-2 py-1`}>
                <input
                  type="checkbox"
                  name={`${day}_closed`}
                  defaultChecked={hours === null}
                  className={checkboxClass}
                />
                <span>Closed</span>
              </label>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="time"
                name={`${day}_open`}
                defaultValue={hours?.open ?? "11:00"}
                aria-label={`${label} opening time`}
                className={inputClass}
              />
              <input
                type="time"
                name={`${day}_close`}
                defaultValue={hours?.close ?? "21:00"}
                aria-label={`${label} closing time`}
                className={inputClass}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
