export const siteConfig = {
  name: "Horizon Jobs",

  description:
    "A global job discovery platform for finding employment opportunities across countries, industries, and workplace types.",

  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000",

  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
    "support@yourdomain.com",

  whatsapp:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    "",

  social: {
    facebook:
      process.env.NEXT_PUBLIC_FACEBOOK_URL || "",

    linkedin:
      process.env.NEXT_PUBLIC_LINKEDIN_URL || "",

    instagram:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
  },
};