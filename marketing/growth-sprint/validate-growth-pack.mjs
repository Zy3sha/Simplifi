import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pack = path.join(root, "marketing", "growth-sprint");

function read(file) {
  return fs.readFileSync(path.join(pack, file), "utf8");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (quoted && ch === '"' && next === '"') {
      cell += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (!quoted && ch === ",") {
      row.push(cell);
      cell = "";
    } else if (!quoted && ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const [header, ...body] = rows.filter((r) => r.some((c) => c.trim()));
  return body.map((r) => Object.fromEntries(header.map((h, idx) => [h, r[idx] || ""])));
}

const errors = [];

const googleAssets = parseCsv(read("google_app_campaign_assets.csv"));
for (const row of googleAssets) {
  if (row.asset_type === "headline" && row.asset_text_or_path.length > 30) {
    errors.push(`Google headline too long: ${row.asset_text_or_path}`);
  }

  if (row.asset_type === "description" && row.asset_text_or_path.length > 90) {
    errors.push(`Google description too long: ${row.asset_text_or_path}`);
  }

  if ((row.asset_type === "image" || row.asset_type === "video") && !fs.existsSync(row.asset_text_or_path)) {
    errors.push(`Missing Google asset: ${row.asset_text_or_path}`);
  }
}

const playListings = parseCsv(read("google_play_custom_listing_upload_sheet.csv"));
for (const row of playListings) {
  if (row.short_description.length > 80) {
    errors.push(`Play short description too long: ${row.listing_name}`);
  }
}

const docsToCheck = [
  "README.md",
  "tonight_operator_checklist.md",
  "paid_ads_launch_guardrails.md",
  "payment_and_final_click_handoff.md",
  "release_artifact_status.md",
  "store_custom_pages_and_experiments.md",
];

for (const doc of docsToCheck) {
  const text = read(doc);
  const matches = text.match(/\/Users\/zyesha\/Desktop\/obubba-clock-lab\/[^\s)`]+/g) || [];

  for (const raw of matches) {
    const cleaned = raw.replace(/[.,]$/, "");
    if (!cleaned.includes("?") && !fs.existsSync(cleaned)) {
      errors.push(`Missing local path in ${doc}: ${cleaned}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Growth pack OK: ${googleAssets.length} Google assets, ${playListings.length} Play listings, ${docsToCheck.length} docs checked.`);
