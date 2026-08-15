import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const pages = {
  "privacy-policy": {
    title: "Privacy Policy",
    description:
      "How Horizon Jobs handles information related to website visitors and platform functionality.",
    sections: [
      {
        heading:
          "Information We Collect",
        body:
          "Horizon Jobs may process technical information required to operate, secure, and improve the website. Information voluntarily submitted through contact or other forms may also be processed to respond to the request.",
      },
      {
        heading:
          "Website Usage",
        body:
          "The platform is primarily designed for browsing job listings and career resources. We aim to minimize unnecessary collection of personal information.",
      },
      {
        heading:
          "Third-Party Services",
        body:
          "Horizon Jobs may use hosting, database, analytics, advertising, security, and other third-party services. Those services may process information according to their own policies.",
      },
    ],
  },

  privacy: {
    title: "Privacy",
    description:
      "Privacy information for Horizon Jobs visitors.",
    sections: [
      {
        heading:
          "Our Approach",
        body:
          "Horizon Jobs aims to provide useful employment information while avoiding unnecessary collection of personal information.",
      },
      {
        heading:
          "Contact Information",
        body:
          "Information voluntarily provided when contacting Horizon Jobs may be used to respond to the enquiry and maintain appropriate communication records.",
      },
    ],
  },

  terms: {
    title: "Terms & Conditions",
    description:
      "Terms governing use of the Horizon Jobs platform.",
    sections: [
      {
        heading:
          "Use of the Website",
        body:
          "Visitors agree to use Horizon Jobs lawfully and responsibly.",
      },
      {
        heading:
          "Job Listings",
        body:
          "Job information may originate from employers or third-party sources. Visitors should verify listing information with the original source before applying.",
      },
      {
        heading:
          "Applications",
        body:
          "Horizon Jobs is an independent discovery platform and is not the employer or recruitment agency for third-party vacancies.",
      },
    ],
  },

  "cookie-policy": {
    title: "Cookie Policy",
    description:
      "Information about browser storage and cookies used by Horizon Jobs.",
    sections: [
      {
        heading:
          "Cookies",
        body:
          "Cookies and similar browser technologies may be used to provide required website functionality and remember appropriate preferences.",
      },
      {
        heading:
          "Managing Cookies",
        body:
          "Visitors can control or remove cookies through their browser settings. Restricting cookies may affect some website functionality.",
      },
    ],
  },

  cookie: {
    title: "Cookie Policy",
    description:
      "Information about browser storage and cookies used by Horizon Jobs.",
    sections: [
      {
        heading:
          "Cookies",
        body:
          "Cookies and similar browser technologies may be used to provide required website functionality and remember appropriate preferences.",
      },
      {
        heading:
          "Managing Cookies",
        body:
          "Visitors can control or remove cookies through their browser settings. Restricting cookies may affect some website functionality.",
      },
    ],
  },

  disclaimer: {
    title: "Publisher Disclaimer",
    description:
      "Important information about Horizon Jobs and its published job listings.",
    sections: [
      {
        heading:
          "Independent Platform",
        body:
          "Horizon Jobs is an independent global job discovery platform and is not a recruitment or staffing agency.",
      },
      {
        heading:
          "Listing Accuracy",
        body:
          "We make reasonable efforts to organize and review information, but listings may change or become unavailable. Always verify important details at the original source.",
      },
      {
        heading:
          "Career Information",
        body:
          "Career resources are provided for general informational purposes and are not professional legal, financial, immigration, or employment advice.",
      },
    ],
  },
} as const;

type PageSlug =
  keyof typeof pages;

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } =
    await params;

  const page =
    pages[slug as PageSlug];

  if (!page) {
    return {
      title:
        "Page Not Found | Horizon Jobs",
    };
  }

  return {
    title: `${page.title} | Horizon Jobs`,
    description:
      page.description,
  };
}

export default async function LegalPage({
  params,
}: Props) {
  const { slug } =
    await params;

  const page =
    pages[slug as PageSlug];

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <header className="border-b border-slate-200 pb-7 dark:border-slate-800">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Horizon Jobs
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              {page.title}
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              {page.description}
            </p>
          </header>

          <div className="mt-8 space-y-8">
            {page.sections.map(
              (section) => (
                <section
                  key={
                    section.heading
                  }
                >
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {
                      section.heading
                    }
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {section.body}
                  </p>
                </section>
              )
            )}
          </div>

          <footer className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800">
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/privacy-policy"
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Terms
              </Link>

              <Link
                href="/cookie-policy"
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Cookies
              </Link>

              <Link
                href="/disclaimer"
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Disclaimer
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </main>
  );
}