import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import BackButton from "@/components/navigation/BackButton";

const pages = {
  "privacy-policy": {
    title: "Privacy Policy",
    description:
      "How Horizon Jobs handles information related to visitors and website functionality.",
    sections: [
      {
        heading:
          "Information We Collect",
        body:
          "Horizon Jobs is designed primarily as a job discovery platform. We may process information that is technically necessary to operate the website, protect the service, respond to enquiries, and maintain site functionality.",
      },
      {
        heading:
          "Job Searches and Preferences",
        body:
          "Search activity used within the website is intended to help visitors find relevant opportunities. Horizon Jobs does not require visitors to create an account simply to browse published job listings.",
      },
      {
        heading:
          "Third-Party Services",
        body:
          "The website may use third-party services for hosting, databases, advertising, security, or other technical functionality. Those services may process information according to their own policies.",
      },
      {
        heading:
          "Contact Requests",
        body:
          "Information voluntarily provided when contacting Horizon Jobs may be used to respond to the request and maintain appropriate communication records.",
      },
    ],
  },

  terms: {
    title: "Terms & Conditions",
    description:
      "The terms governing use of the Horizon Jobs website.",
    sections: [
      {
        heading:
          "Use of the Website",
        body:
          "Horizon Jobs provides publicly accessible job discovery information and career resources. Visitors agree to use the website lawfully and responsibly.",
      },
      {
        heading:
          "Job Listing Information",
        body:
          "Job listings may originate from employers, public recruitment sources, partner feeds, or other publicly available information. Visitors should confirm job details on the original source before applying.",
      },
      {
        heading:
          "Applications",
        body:
          "Horizon Jobs does not act as the employer or recruitment agency for published third-party opportunities. Applications are normally completed on the original employer or source website.",
      },
      {
        heading:
          "Changes to the Service",
        body:
          "Horizon Jobs may modify website functionality, content, categories, listings, or resources as the platform develops.",
      },
    ],
  },

  "cookie-policy": {
    title: "Cookie Policy",
    description:
      "Information about cookies and related browser technologies used by Horizon Jobs.",
    sections: [
      {
        heading:
          "What Cookies Are",
        body:
          "Cookies are small pieces of information stored by a website in a visitor's browser. They can help websites remember preferences and support technical functionality.",
      },
      {
        heading:
          "Essential Functionality",
        body:
          "Horizon Jobs may use browser storage or similar technologies where necessary for features such as authentication, preferences, and website functionality.",
      },
      {
        heading:
          "Advertising",
        body:
          "When advertising features are enabled, advertising providers may use cookies or related technologies in accordance with their own policies and applicable settings.",
      },
      {
        heading:
          "Managing Cookies",
        body:
          "Visitors can control or remove cookies through the settings of their web browser. Restricting cookies may affect certain website functionality.",
      },
    ],
  },

  disclaimer: {
    title: "Publisher Disclaimer",
    description:
      "Important information about Horizon Jobs, job listings, and career content.",
    sections: [
      {
        heading:
          "Independent Job Discovery Platform",
        body:
          "Horizon Jobs is an independent job discovery platform and is not a recruitment or staffing agency.",
      },
      {
        heading:
          "Listing Accuracy",
        body:
          "Every effort is made to organize and review published information, but Horizon Jobs cannot guarantee that every listing remains available, accurate, or current at all times.",
      },
      {
        heading:
          "Verify Before Applying",
        body:
          "Visitors should verify salary, location, employment conditions, closing dates, eligibility requirements, and application instructions on the original employer or source website.",
      },
      {
        heading:
          "Career Information",
        body:
          "Career resources are provided for general informational and educational purposes and should not be treated as professional legal, financial, immigration, or employment advice.",
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
      title: "Page Not Found | Horizon Jobs",
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
        <div className="mb-6">
          <BackButton
            label="Back"
            fallbackHref="/"
          />
        </div>

        <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <header className="border-b border-slate-200 pb-7 dark:border-slate-800">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Horizon Jobs
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {page.title}
            </h1>

            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
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
                Privacy
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