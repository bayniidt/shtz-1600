import type { CareersCity, CareersContent, CareersPosition } from "@/types";

/** Slash / comma / newline separated list → trimmed string array. */
export function splitList(value?: string): string[] {
  return (value ?? "")
    .split(/[/,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Multiline text → trimmed non-empty lines. */
export function splitLines(value?: string): string[] {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function isOn(value: boolean | string | undefined): boolean {
  return Boolean(value) && value !== "no" && value !== "false";
}

export function findCity(careers: CareersContent, id: string): CareersCity | undefined {
  return careers.cities.find((city) => city.id === id);
}

/** Every city a position is open in (primary first). */
export function positionCities(
  careers: CareersContent,
  position: CareersPosition,
): CareersCity[] {
  const ids = [position.cityId, ...splitList(position.extraCities)];
  return ids
    .map((id) => findCity(careers, id))
    .filter((city): city is CareersCity => Boolean(city));
}

export function cityPositions(careers: CareersContent, cityId: string): CareersPosition[] {
  return careers.positions.filter(
    (position) =>
      position.cityId === cityId || splitList(position.extraCities).includes(cityId),
  );
}

export function cityCounts(careers: CareersContent): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const city of careers.cities) counts[city.id] = 0;
  for (const position of careers.positions) {
    for (const city of positionCities(careers, position)) {
      counts[city.id] = (counts[city.id] ?? 0) + 1;
    }
  }
  return counts;
}

export function hotPositions(careers: CareersContent, limit = 8): CareersPosition[] {
  const flagged = careers.positions.filter((position) => isOn(position.hot));
  return (flagged.length > 0 ? flagged : careers.positions).slice(0, limit);
}

export function otherCityPositions(
  careers: CareersContent,
  position: CareersPosition,
  limit = 4,
): CareersPosition[] {
  const ids = new Set(positionCities(careers, position).map((city) => city.id));
  return careers.positions
    .filter(
      (item) =>
        item.id !== position.id &&
        positionCities(careers, item).some((city) => ids.has(city.id)),
    )
    .slice(0, limit);
}

export function totalPositions(careers: CareersContent): number {
  return careers.positions.length;
}

export type JdBlock =
  | { kind: "item"; text: string }
  | { kind: "sub"; text: string }
  | { kind: "text"; text: string };

/**
 * Job descriptions come from the ATS as flat text with outline markers, e.g.
 * `1、…`, `- …`, `一、…`. Classify every line so the detail page can render a
 * readable outline without asking editors to use a rich-text editor.
 */
export function parseJdLines(value?: string): JdBlock[] {
  return splitLines(value).map((raw) => {
    const line = raw.replace(/\*\*/g, "").replace(/^#+\s*/, "");
    const item = line.match(/^(?:\d+|[a-zA-Z])[、.．)）]\s*(.+)$/);
    if (item) return { kind: "item", text: item[1] };
    const dash = line.match(/^[-—•·*]\s*(.+)$/);
    if (dash) return { kind: "item", text: dash[1] };
    if (/^[一二三四五六七八九十]+、/.test(line)) return { kind: "sub", text: line };
    if (line.length <= 14 && !/[。；;.]$/.test(line)) return { kind: "sub", text: line };
    return { kind: "text", text: line };
  });
}

export function positionSummary(position: CareersPosition): string {
  if (position.summary) return position.summary;
  const source = splitLines(position.description).length
    ? position.description
    : (position.requirement ?? "");
  const first = splitLines(source)[0] ?? "";
  return first
    .replace(/^(?:\d+|[a-zA-Z])[、.．)）]\s*/, "")
    .replace(/^[-—•·*]\s*/, "")
    .replace(/\*\*/g, "")
    .slice(0, 80);
}
