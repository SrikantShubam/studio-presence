import sharp from "sharp";

export const LOGO_ICON_SIZES = [32, 180, 192, 512] as const;

export type LogoDerivative = {
  size: (typeof LOGO_ICON_SIZES)[number];
  buffer: Buffer;
  filename: string;
};

export async function createLogoDerivatives(input: Buffer): Promise<{
  logo: Buffer;
  icons: LogoDerivative[];
}> {
  const logo = await sharp(input)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer();

  const icons = await Promise.all(
    LOGO_ICON_SIZES.map(async (size) => ({
      size,
      buffer: await sharp(input)
        .rotate()
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer(),
      filename: `favicon-${size}.png`,
    })),
  );

  return { logo, icons };
}

export function faviconVariantPath(path: string, size: number): string {
  return path.replace(/favicon-\d+\.png$/, `favicon-${size}.png`);
}
