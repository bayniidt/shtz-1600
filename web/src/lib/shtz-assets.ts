import { existsSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

import { assetPath } from "@/lib/asset-path";

const IMAGE_EXTENSIONS = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);

const COMPANY_LOGO_DIRS = [
  "shtz/合作客户/公司logo/SMB",
  "shtz/合作客户/公司logo/知名",
] as const;

export interface ShtzLogo {
  src: string;
  alt: string;
}

function collectImages(relativeDir: string, assets: ShtzLogo[]): void {
  const absoluteDir = join(process.cwd(), "public", relativeDir);
  if (!existsSync(absoluteDir)) return;

  for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
    const relativePath = join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      collectImages(relativePath, assets);
      continue;
    }

    if (
      !IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()) ||
      entry.name.includes("(1)") ||
      entry.name.startsWith("微信图片")
    ) {
      continue;
    }

    assets.push({
      src: assetPath(`/${relativePath.split(/[\\/]/).map(encodeURIComponent).join("/")}`),
      alt: "ADFLY 合作媒体",
    });
  }
}

export function getShtzCompanyLogos(): ShtzLogo[] {
  const assets: ShtzLogo[] = [];
  for (const dir of COMPANY_LOGO_DIRS) collectImages(dir, assets);
  return assets;
}
