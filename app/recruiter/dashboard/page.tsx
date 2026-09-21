import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  FileText,
  Plus,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export default async function RecruiterDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/recruiter/login");
  }

  const uid = session.user.id;
  const supabase = getSupabaseAdmin();

  const { data: members } = await supabase
    .from("company_members")
    .select("company_id,role")
    .eq("user_id", uid);

  const ids = Array.from(
    new Set(
      (members ?? [])
        .map((x) => x.company_id)
        .filter(Boolean)
        .map(String)
    )
  );

  const [{ data: jobs }, { data: companies }] = await Promise.all([
    ids.length
      ? supabase
          .from("jobs")
          .select("id,title,status,created_at,company_id")
          .in("company_id", ids)
          .order("created_at", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [] }),

    ids.length
      ? supabase
          .from("companies")
          .select("id,name,logo_url")
          .in("id", ids)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [] }),
  ]);

  const uniqueCompanies = Array.from(
    new Map(
      (companies ?? []).map((company) => [String(company.id), company])
    ).values()
  );

  const companyCount = uniqueCompanies.length;

  return (
    <main className="horizon-page bg-slate-50">
      <section className="bg-[#071a35] py-10 text-white">
        <div className="horizon-container flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="horizon-eyebrow">Recruiter workspace</p>

            <h1 className="mt-2 text-3xl font-black">
              Welcome back, {session.user.name || "Employer"}
            </h1>

            <p className="mt-2 text-sm text-white/55">
              Manage your live job pipeline from one place.
            </p>
          </div>

          <Link
            href="/recruiter/post-job"
            className="horizon-button horizon-button-gold"
          >
            <Plus size={17} />
            Post a job
          </Link>
        </div>
      </section>

      <section className="horizon-container py-9">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            icon={<BriefcaseBusiness />}
            label="Your jobs"
            value={String(jobs?.length ?? 0)}
          />

          <Stat
            icon={<Building2 />}
            label="Companies"
            value={String(companyCount)}
          />

          <Stat
            icon={<FileText />}
            label="Workspace"
            value="Active"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="horizon-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[.14em] text-[#b88410]">
                  Listings
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Recent jobs
                </h2>
              </div>

              <Link
                href="/recruiter/jobs"
                className="text-xs font-black text-[#b88410]"
              >
                View all →
              </Link>
            </div>

            {jobs?.length ? (
              <div>
                {jobs.map((job) => (
                  <Link
                    href={`/recruiter/jobs/${job.id}`}
                    key={job.id}
                    className="flex items-center justify-between gap-4 border-b border-slate-100 p-5 last:border-0 hover:bg-slate-50"
                  >
                    <div>
                      <h3 className="font-black text-[#071a35]">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString()
                          : ""}
                      </p>
                    </div>

                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase text-amber-700">
                      {job.status || "draft"}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <h3 className="font-black">No jobs yet</h3>

                <p className="mt-2 text-sm text-slate-500">
                  Create your first listing to start receiving applications.
                </p>

                <Link
                  href="/recruiter/post-job"
                  className="horizon-button horizon-button-gold mt-5"
                >
                  Post first job
                </Link>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="horizon-card p-6">
              <h3 className="font-black">Companies</h3>

              {uniqueCompanies.length ? (
                <div className="mt-4 space-y-3">
                  {uniqueCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#071a35] text-sm font-black text-[#e4ad2f]">
                        {company.name?.charAt(0)?.toUpperCase() || "C"}
                      </span>

                      <span className="text-sm font-bold">
                        {company.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  No company profile yet.
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-[#e4ad2f] p-6 text-[#071a35]">
              <h3 className="font-black">Need candidates?</h3>

              <p className="mt-2 text-sm leading-6">
                Keep your listings complete and accurate for better applicant quality.
              </p>

              <Link
                href="/recruiter/post-job"
                className="mt-4 inline-flex items-center gap-1 text-sm font-black"
              >
                Create listing
                <ArrowRight size={15} />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="horizon-card flex items-center gap-4 p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071a35] text-[#e4ad2f]">
        {icon}
      </span>

      <div>
        <p className="text-xs font-bold text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-xl font-black text-[#071a35]">
          {value}
        </p>
      </div>
    </div>
  );
}
