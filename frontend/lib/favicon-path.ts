export function faviconVariantPath(path: string, size: number): string {
  return path.replace(/favicon-\d+\.png$/, 'favicon-' + size + '.png');
}
