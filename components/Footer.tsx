import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Mail } from "lucide-react";

export default function Footer() {
  return <footer className="mt-0 bg-[#06162f] text-white">
    <div className="horizon-container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
      <div>
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4ad2f] font-black text-[#071a35]">H</span><span className="text-lg font-black">Horizon Jobs</span></div>
        <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">A professional employment platform for discovering opportunities, building careers and connecting employers with candidates.</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/60"><Mail size={14}/> support@horizonjobs.online</div>
      </div>
      <FooterCol title="Job Seekers" links={[["Find Jobs","/jobs"],["Categories","/categories"],["Countries","/countries"],["Saved Jobs","/saved"],["Job Alerts","/job-alerts"]]} />
      <FooterCol title="Employers" links={[["For Recruiters","/recruiters"],["Post a Job","/recruiter/post-job"],["Recruiter Dashboard","/recruiter/dashboard"],["Manage Jobs","/recruiter/jobs"]]} />
      <FooterCol title="Company" links={[["About","/about"],["Career Resources","/career-resources"],["Contact","/contact"],["Privacy","/privacy"],["Terms","/terms"]]} />
    </div>
    <div className="border-t border-white/10"><div className="horizon-container flex flex-col gap-2 py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Horizon Jobs. All rights reserved.</span><span>Built for global employment discovery.</span></div></div>
  </footer>;
}
function FooterCol({title,links}:{title:string;links:string[][]}) { return <div><h3 className="mb-4 text-sm font-black text-white">{title}</h3><div className="space-y-3">{links.map(([label,href])=><Link key={href} href={href} className="group flex items-center justify-between text-sm text-white/55 hover:text-white"><span>{label}</span><ArrowUpRight size={13} className="opacity-0 transition group-hover:opacity-100"/></Link>)}</div></div> }
