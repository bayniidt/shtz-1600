import fs from "node:fs/promises";
import path from "node:path";

const apiBaseUrl = (process.env.ADMIN_API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");
const outputFile = process.env.EXPORT_OUTPUT ?? path.join(process.cwd(), "data/site.json");
const managedFields = new Set(["_id", "__v", "createdAt", "updatedAt", "positionsCount"]);

function stripManagedFields(value) {
  if (Array.isArray(value)) return value.map(stripManagedFields);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, item]) => !managedFields.has(key) && !(key === "key" && item === "default"))
      .map(([key, item]) => [key, stripManagedFields(item)]),
  );
}

async function fetchApi(endpoint) {
  const response = await fetch(`${apiBaseUrl}${endpoint}`);
  if (!response.ok) throw new Error(`Admin API ${response.status}: ${endpoint}`);

  const body = await response.json();
  if (body.code !== 0) throw new Error(`Admin API ${body.code}: ${body.message}`);
  return body.data;
}

async function fetchAllPages(endpoint) {
  const pageSize = 100;
  const items = [];
  let page = 1;
  let total = 0;

  do {
    const result = await fetchApi(`${endpoint}?page=${page}&pageSize=${pageSize}`);
    items.push(...result.items);
    total = result.total;
    page += 1;
    if (result.items.length === 0) break;
  } while (items.length < total);

  return items.slice(0, total || items.length);
}

const [site, home, about, careersContent, casesPage, cases, cities, positions] = await Promise.all([
  fetchApi("/site"),
  fetchApi("/home"),
  fetchApi("/about"),
  fetchApi("/careers/content"),
  fetchApi("/cases/page"),
  fetchAllPages("/cases"),
  fetchAllPages("/careers/cities"),
  fetchAllPages("/careers/positions"),
]);

const snapshot = stripManagedFields({
  site,
  home,
  about,
  cases: { page: casesPage, items: cases },
  careers: { ...careersContent, cities, positions },
});

const temporaryFile = `${outputFile}.tmp-${process.pid}`;
await fs.mkdir(path.dirname(outputFile), { recursive: true });
await fs.writeFile(temporaryFile, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
await fs.rename(temporaryFile, outputFile);

console.log(
  `Exported site snapshot to ${outputFile} (${cases.length} cases, ${cities.length} cities, ${positions.length} positions)`,
);
