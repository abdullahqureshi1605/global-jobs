export function countryCodeToFlag(
  countryCode?: string | null
): string {
  if (!countryCode) {
    return "🌍";
  }

  const code =
    countryCode
      .trim()
      .toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) {
    return "🌍";
  }

  return String.fromCodePoint(
    ...[...code].map(
      (character) =>
        127397 +
        character.charCodeAt(0)
    )
  );
}