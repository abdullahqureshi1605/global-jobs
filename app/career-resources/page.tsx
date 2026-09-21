import type { Metadata } from "next";

export const metadata: Metadata = { title: "Disclaimer | Horizon Jobs", description: "Important information about Horizon Jobs job listings, external links, and employment information.", };

import Link from "next/link";export default function Page(){return <main className="horizon-page"><div className="horizon-container py-12"><div className="max-w-3xl horizon-card p-8 sm:p-10"><p className="horizon-eyebrow">Horizon Jobs</p><h1 className="mt-2 text-3xl font-black">Disclaimer</h1><p className="mt-4 text-sm leading-7 text-slate-500">This policy page is part of the production route structure. Replace this section with the approved legal copy before public launch.</p><Link href="/" className="horizon-button horizon-button-outline mt-6">Return home</Link></div></div></main>}
