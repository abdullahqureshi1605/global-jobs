"use client";

import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";

type SocialName = "facebook" | "instagram" | "linkedin" | "pinterest" | "whatsapp";

export default function Footer() {
  const socialLinks: {
    label: string;
    href: string;
    icon: SocialName;
  }[] = [
    {
      label: "Facebook",
      href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "#",
      icon: "facebook",
    },
    {
      label: "Instagram",
      href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#",
      icon: "instagram",
    },
    {
      label: "LinkedIn",
      href: process.env.NEXT_PUBLIC_LINKEDIN_URL || "#",
      icon: "linkedin",
    },
    {
      label: "Pinterest",
      href: "#",
      icon: "pinterest",
    },
    {
      label: "WhatsApp",
      href: process.env.NEXT_PUBLIC_WHATSAPP_URL || "#",
      icon: "whatsapp",
    },
  ];

  return (
    <footer className="mt-0 bg-[#06162f] text-white">
      <div className="horizon-container grid gap-10 py-12 md:grid-cols-[1.45fr_1fr_1fr_1fr] lg:gap-12 lg:py-14">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4ad2f] font-black text-[#071a35]">
              H
            </span>
            <span className="text-lg font-black">Horizon Jobs</span>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
            A professional employment platform for discovering opportunities,
            building careers and connecting employers with candidates.
          </p>

          <a
            href="mailto:support@horizonjobs.online"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/60 transition hover:border-white/20 hover:text-white"
          >
            <Mail size={14} />
            support@horizonjobs.online
          </a>

          <div className="mt-6 flex items-center gap-2">
            {socialLinks.map(({ label, href, icon }) => {
              const disabled = href === "#";

              return disabled ? (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  title={`${label} - link to be added`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/45 transition hover:border-[#e4ad2f] hover:bg-white/5 hover:text-[#e4ad2f]"
                >
                  <SocialIcon name={icon} />
                </a>
              ) : (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/55 transition hover:border-[#e4ad2f] hover:bg-white/5 hover:text-[#e4ad2f]"
                >
                  <SocialIcon name={icon} />
                </a>
              );
            })}
          </div>
        </div>

        <FooterCol
          title="Job Seekers"
          links={[
            ["Find Jobs", "/jobs"],
            ["Categories", "/categories"],
            ["Countries", "/countries"],
            ["Saved Jobs", "/saved"],
            ["Job Alerts", "/job-alerts"],
          ]}
        />

        <FooterCol
          title="Employers"
          links={[
            ["For Recruiters", "/recruiters"],
            ["Post a Job", "/recruiter/post-job"],
            ["Recruiter Dashboard", "/recruiter/dashboard"],
            ["Manage Jobs", "/recruiter/jobs"],
          ]}
        />

        <FooterCol
          title="Company & Legal"
          links={[
            ["About Horizon Jobs", "/about"],
            ["Career Resources", "/career-resources"],
            ["Contact Us", "/contact"],
            ["Privacy Policy", "/privacy-policy"],
            ["Cookie Policy", "/cookie-policy"],
            ["Terms & Conditions", "/terms"],
            ["Disclaimer", "/disclaimer"],
            ["Advertising & AdSense", "/advertising"],
          ]}
        />
      </div>

      <div className="border-t border-white/10">
        <div className="horizon-container flex flex-col gap-3 py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Horizon Jobs. All rights reserved.
          </span>

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/privacy-policy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/cookie-policy" className="transition hover:text-white">
              Cookies
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link href="/disclaimer" className="transition hover:text-white">
              Disclaimer
            </Link>
          </div>

          <span className="hidden lg:block">
            Built for global employment discovery.
          </span>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: SocialName }) {
  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.5V3.8c-.7-.1-1.5-.2-2.4-.2-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4Z" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="currentColor" aria-hidden="true">
        <path d="M5 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0 0-5ZM3 9.5h4V21H3V9.5Zm6.5 0h3.8v1.6h.1c.5-.9 1.7-2 3.7-2 4 0 4.9 2.6 4.9 6V21h-4v-5.2c0-1.2 0-2.8-1.8-2.8s-2.1 1.3-2.1 2.7V21h-4V9.5Z" />
      </svg>
    );
  }

  if (name === "pinterest") {
    return (
      <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="currentColor" aria-hidden="true">
        <path d="M12 3.2c-4.9 0-8.2 3.4-8.2 7.8 0 3.2 1.8 5.7 4.6 6.7-.1-.6-.1-1.5 0-2.1l1-4.1s-.3-.7-.3-1.7c0-1.6.9-2.8 2-2.8.9 0 1.4.7 1.4 1.5 0 .9-.6 2.2-.9 3.4-.3 1 .5 1.8 1.5 1.8 1.8 0 3.1-1.9 3.1-4.6 0-2.4-1.7-4-4.2-4-2.8 0-4.5 2.1-4.5 4.3 0 .9.3 1.9.8 2.4.1.1.1.2.1.4l-.3 1.2c-.1.4-.4.5-.7.3-1.3-.6-2.1-2.4-2.1-3.9 0-3.2 2.3-6.2 6.7-6.2 3.5 0 6.3 2.5 6.3 5.9 0 3.5-2.2 6.3-5.3 6.3-1 0-1.9-.5-2.2-1.1l-.6 2.4c-.2.9-.8 2-1.2 2.7.9.3 1.9.5 2.9.5 4.9 0 8.8-4 8.8-8.9S16.9 3.2 12 3.2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="currentColor" aria-hidden="true">
      <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0 11.9 11.9 0 0 0 3.5 3.5 11.9 11.9 0 0 0 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6A12 12 0 0 0 12 24h.1A12 12 0 0 0 24 12c0-3.2-1.2-6.2-3.5-8.5ZM12 21.9c-1.8 0-3.6-.5-5.1-1.5l-.4-.2-3.7 1 1-3.6-.2-.4A9.9 9.9 0 0 1 2.1 12 9.9 9.9 0 0 1 12 2.1a9.9 9.9 0 0 1 9.9 9.9 9.9 0 0 1-9.9 9.9Zm5.4-7.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.5-.7-2.5-1.2-3.5-2.8-.3-.5.3-.5.8-1.7.1-.2 0-.4-.1-.6-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9 0 1.7 1.2 3.3 1.4 3.5.2.2 2.3 3.5 5.6 4.9.8.4 1.4.6 1.9.8.8.3 1.5.3 2 .2.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.2-.3-.3-.6-.4Z" />
    </svg>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: string[][];
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-black text-white">{title}</h3>

      <div className="space-y-3">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between text-sm text-white/55 transition hover:text-white"
          >
            <span>{label}</span>
            <ArrowUpRight
              size={13}
              className="opacity-0 transition group-hover:opacity-100"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

