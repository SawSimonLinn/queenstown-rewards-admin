"use client";

import { useMemo, useState } from "react";

import { checkboxClass, checkboxLabelClass, inputClass } from "@/components/ui/field";

/**
 * Searchable multi-select built on plain checkboxes so it keeps working with
 * native `<form action={serverAction}>` submissions (checked boxes stay in
 * the DOM when filtered out, so their value is still submitted).
 */
export function LocationMultiSelect({
  name,
  locations,
  defaultSelectedIds = [],
}: {
  name: string;
  locations: { id: string; name: string }[];
  defaultSelectedIds?: string[];
}) {
  const [query, setQuery] = useState("");
  const selected = useMemo(() => new Set(defaultSelectedIds), [defaultSelectedIds]);

  const normalizedQuery = query.trim().toLowerCase();

  return (
    <div className="flex flex-col gap-2">
      {locations.length > 6 ? (
        <input
          type="search"
          placeholder="Search locations…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={inputClass}
          aria-label="Search locations"
        />
      ) : null}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {locations.map((location) => {
          const matches = !normalizedQuery || location.name.toLowerCase().includes(normalizedQuery);
          return (
            <label
              key={location.id}
              className={`${checkboxLabelClass} ${matches ? "" : "hidden"}`}
            >
              <input
                type="checkbox"
                name={name}
                value={location.id}
                defaultChecked={selected.has(location.id)}
                className={checkboxClass}
              />
              <span className="min-w-0 break-words">{location.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
