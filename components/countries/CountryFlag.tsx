interface CountryFlagProps {
  countryCode?: string | null;
  country?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const COUNTRY_CODES: Record<
  string,
  string
> = {
  pakistan: "pk",
  india: "in",
  canada: "ca",
  "united states": "us",
  "united-states": "us",
  "united kingdom": "gb",
  "united-kingdom": "gb",
  australia: "au",
  germany: "de",
  france: "fr",
  netherlands: "nl",
  ireland: "ie",
  spain: "es",
  italy: "it",
  portugal: "pt",
  switzerland: "ch",
  austria: "at",
  belgium: "be",
  sweden: "se",
  norway: "no",
  denmark: "dk",
  finland: "fi",
  poland: "pl",
  bangladesh: "bd",
  nepal: "np",
  china: "cn",
  japan: "jp",
  "south korea": "kr",
  "south-korea": "kr",
  singapore: "sg",
  malaysia: "my",
  indonesia: "id",
  thailand: "th",
  philippines: "ph",
  "saudi arabia": "sa",
  "saudi-arabia": "sa",
  "united arab emirates":
    "ae",
  "united-arab-emirates":
    "ae",
  qatar: "qa",
  kuwait: "kw",
  bahrain: "bh",
  oman: "om",
  "south africa": "za",
  "south-africa": "za",
  nigeria: "ng",
  kenya: "ke",
  egypt: "eg",
  brazil: "br",
  mexico: "mx",
  argentina: "ar",
  chile: "cl",
  "new zealand": "nz",
  "new-zealand": "nz",
};

function normalizeCountry(
  value?: string | null
) {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .toLowerCase();
}

function getCode(
  countryCode?: string | null,
  country?: string | null
) {
  const directCode =
    countryCode
      ?.trim()
      .toLowerCase();

  if (
    directCode &&
    /^[a-z]{2}$/.test(
      directCode
    )
  ) {
    return directCode;
  }

  return (
    COUNTRY_CODES[
      normalizeCountry(
        country
      )
    ] || ""
  );
}

export default function CountryFlag({
  countryCode,
  country,
  size = "md",
  className = "",
}: CountryFlagProps) {
  const code = getCode(
    countryCode,
    country
  );

  if (!code) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-md bg-slate-100 px-2 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400 ${className}`}
        aria-label="Country"
      >
        --
      </span>
    );
  }

  const sizeClass =
    size === "sm"
      ? "text-xl"
      : size === "lg"
      ? "text-4xl"
      : "text-3xl";

  return (
    <span
      className={`fi fi-${code} inline-block shrink-0 overflow-hidden rounded-[3px] ${sizeClass} ${className}`}
      role="img"
      aria-label={
        country ||
        code.toUpperCase()
      }
    />
  );
}