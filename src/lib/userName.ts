export const firstName = (displayName: string | null | undefined): string =>
  displayName?.trim().split(/\s+/)[0] || "";