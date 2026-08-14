import Link from "next/link";
import {
  Globe,
  ShieldCheck,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">

          {/* Brand */}
          <div className="lg:col-span-2">

            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>

              <span className="text-xl font-bold tracking-tight text-white">
                HORIZON{" "}
                <span className="text-indigo-400">
                  JOBS
                </span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-md mt-4">
              Horizon Jobs is an independent global job
              discovery platform organizing employment
              opportunities and practical career resources
              into one accessible experience.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />

              <span>
                Independent Discovery Platform
              </span>
            </div>

          </div>

          {/* Job Seekers */}
          <div>

            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Job Seekers
            </h3>

            <div className="space-y-3 text-sm">

              <Link
                href="/jobs"
                className="block hover:text-white transition-colors"
              >
                Find Opportunities
              </Link>

              <Link
                href="/countries"
                className="block hover:text-white transition-colors"
              >
                Jobs by Country
              </Link>

              <Link
                href="/categories"
                className="block hover:text-white transition-colors"
              >
                Jobs by Category
              </Link>

              <Link
                href="/career-resources"
                className="block hover:text-white transition-colors"
              >
                Career Resources
              </Link>

            </div>

          </div>

          {/* Platform */}
          <div>

            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Platform
            </h3>

            <div className="space-y-3 text-sm">

              <Link
                href="/about"
                className="block hover:text-white transition-colors"
              >
                About Horizon Jobs
              </Link>

              <Link
                href="/contact"
                className="block hover:text-white transition-colors"
              >
                Contact
              </Link>

              <Link
                href="/report-job"
                className="block hover:text-white transition-colors"
              >
                Report a Job
              </Link>

            </div>

          </div>

        </div>

        {/* Legal + copyright */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">

            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>

            <Link
              href="/cookie-policy"
              className="hover:text-white transition-colors"
            >
              Cookie Policy
            </Link>

            <Link
              href="/disclaimer"
              className="hover:text-white transition-colors"
            >
              Disclaimer
            </Link>

          </div>

          <div className="sm:text-right text-xs text-slate-500">
            © {new Date().getFullYear()} Horizon Jobs.
            All rights reserved.
          </div>

        </div>

      </div>

    </footer>
  );
}