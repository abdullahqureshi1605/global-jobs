import {
  loadEnvConfig,
} from "@next/env";

const projectDir =
  process.cwd();

loadEnvConfig(
  projectDir
);

const requiredVariables = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SECRET_KEY",
];

const optionalVariables = [
  "NEXT_PUBLIC_ADSENSE_ENABLED",
  "NEXT_PUBLIC_ADSENSE_PUBLISHER_ID",
  "NEXT_PUBLIC_WHATSAPP_URL",
];

let failed = false;

console.log(
  "\n================================"
);

console.log(
  " HORIZON JOBS PRODUCTION PREFLIGHT"
);

console.log(
  "================================\n"
);

function pass(
  message: string
) {
  console.log(
    `✅ ${message}`
  );
}

function fail(
  message: string
) {
  console.error(
    `❌ ${message}`
  );

  failed = true;
}

function warn(
  message: string
) {
  console.warn(
    `⚠️  ${message}`
  );
}

for (
  const variable of
    requiredVariables
) {
  const value =
    process.env[
      variable
    ]?.trim();

  if (!value) {
    fail(
      `${variable} is missing`
    );
  } else {
    pass(
      `${variable} exists`
    );
  }
}

console.log(
  "\nOptional configuration:\n"
);

for (
  const variable of
    optionalVariables
) {
  const value =
    process.env[
      variable
    ]?.trim();

  if (!value) {
    warn(
      `${variable} is not configured`
    );
  } else {
    pass(
      `${variable} is configured`
    );
  }
}

console.log(
  "\nEnvironment checks:\n"
);

const siteUrl =
  process.env
    .NEXT_PUBLIC_SITE_URL
    ?.trim();

if (siteUrl) {
  try {
    const parsed =
      new URL(siteUrl);

    if (
      parsed.protocol !==
      "http:" &&
      parsed.protocol !==
      "https:"
    ) {
      fail(
        "NEXT_PUBLIC_SITE_URL must use http or https"
      );
    } else {
      pass(
        `Site URL is valid: ${parsed.origin}`
      );
    }
  } catch {
    fail(
      "NEXT_PUBLIC_SITE_URL is not a valid URL"
    );
  }
}

const adsenseEnabled =
  process.env
    .NEXT_PUBLIC_ADSENSE_ENABLED
    ?.trim()
    .toLowerCase() ===
  "true";

const adsensePublisher =
  process.env
    .NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
    ?.trim();

if (adsenseEnabled) {
  if (!adsensePublisher) {
    fail(
      "AdSense is enabled but NEXT_PUBLIC_ADSENSE_PUBLISHER_ID is missing"
    );
  } else if (
    !adsensePublisher.startsWith(
      "ca-pub-"
    )
  ) {
    fail(
      "AdSense publisher ID should start with ca-pub-"
    );
  } else {
    pass(
      "AdSense configuration looks structurally valid"
    );
  }
} else {
  pass(
    "AdSense is disabled"
  );
}

console.log(
  "\nSecurity checks:\n"
);

const secretNames = [
  "SUPABASE_SECRET_KEY",
];

for (
  const secret of secretNames
) {
  if (
    secret.startsWith(
      "NEXT_PUBLIC_"
    )
  ) {
    fail(
      `${secret} must never be public`
    );
  } else {
    pass(
      `${secret} is server-only named`
    );
  }
}

console.log(
  "\n================================"
);

if (failed) {
  console.error(
    " PREFLIGHT FAILED"
  );

  console.log(
    " Fix the errors above before production deployment.\n"
  );

  process.exit(
    1
  );
}

console.log(
  " PREFLIGHT PASSED"
);

console.log(
  " Horizon Jobs is structurally ready for the next deployment stage.\n"
);

process.exit(
  0
);