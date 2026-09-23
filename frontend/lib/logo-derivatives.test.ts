import assert from "node:assert/strict";
import sharp from "sharp";
import { createLogoDerivatives, LOGO_ICON_SIZES } from "./logo-derivatives";
import { faviconVariantPath } from "./favicon-path";

const source = await sharp({
  create: {
    width: 64,
    height: 48,
    channels: 4,
    background: { r: 20, g: 30, b: 40, alpha: 1 },
  },
})
  .png()
  .toBuffer();

const derivatives = await createLogoDerivatives(source);
const logoMetadata = await sharp(derivatives.logo).metadata();
assert.equal(logoMetadata.format, "webp");
assert.deepEqual(
  derivatives.icons.map((icon) => icon.size),
  [...LOGO_ICON_SIZES],
);

for (const icon of derivatives.icons) {
  const metadata = await sharp(icon.buffer).metadata();
  assert.equal(metadata.format, "png");
  assert.equal(metadata.width, icon.size);
  assert.equal(metadata.height, icon.size);
}

assert.equal(
  faviconVariantPath("/api/assets/staging/user/logo/123-favicon-32.png", 192),
  "/api/assets/staging/user/logo/123-favicon-192.png",
);

console.log("PASS logo derivatives");
