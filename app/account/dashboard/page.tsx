import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  ArrowRight,
  Bell,
  FileText,
  Star,
  UserRound,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export default async function AccountDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const uid = session.user.id;

  const [
    { data: profile },
    { data: applications },
    { data: savedJobs },
  ] = await Promise.all([
    getSupabaseAdmin()
      .from("profiles")
      .select(
        "id,full_name,headline,city,phone,resume_url,skills,bio,open_to,profile_strength"
      )
      .eq("id", uid)
      .maybeSingle(),

    getSupabaseAdmin()
      .from("applications")
      .select(
        "id,job_id,status,fit_score,applied_at,updated_at"
      )
      .eq("candidate_id", uid)
      .order("applied_at", {
        ascending: false,
      })
      .limit(5),

    getSupabaseAdmin()
      .from("saved_jobs")
      .select("id,job_id,created_at")
      .eq("candidate_id", uid),
  ]);

  const profileStrength =
    Number(profile?.profile_strength ?? 0);

  const name =
    profile?.full_name ||
    session.user.name ||
    "Candidate";

  return (
    <div className="w-full px-5 py-5 lg:px-8 lg:py-6">

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b88410]">
            Candidate Portal
          </p>

          <h2 className="mt-2 text-[13px] font-black tracking-tight text-[#071a35] lg:text-[13px]">
            Welcome back, {name}
          </h2>

          <p className="mt-2 text-[13px] text-slate-500">
            Manage your job search from one simple workspace.
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex font-sans items-center justify-center gap-2 rounded-[2px] bg-[#3E7BFA] px-5 py-3 text-[13px] font-black text-white hover:bg-[#3E7BFA]"
        >
          Browse Jobs
          <ArrowRight size={17} />
        </Link>

      </div>


      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<FileText size={20} />}
          title="Applications"
          value={String(applications?.length ?? 0)}
          text="Jobs you have applied for"
        />

        <StatCard
          icon={<Star size={20} />}
          title="Saved Jobs"
          value={String(savedJobs?.length ?? 0)}
          text="Opportunities saved"
        />

        <StatCard
          icon={<UserRound size={20} />}
          title="Profile"
          value={`${profileStrength}%`}
          text="Complete your profile"
        />

        <StatCard
          icon={<Bell size={20} />}
          title="Job Alerts"
          value="Active"
          text="Manage your preferences"
        />

      </div>


      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">

        <section className="overflow-hidden rounded-[2px] border border-slate-200 bg-white">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

            <div>
              <h3 className="text-[13px] font-black text-[#071a35]">
                Recent applications
              </h3>

              <p className="mt-1 text-[13px] text-slate-400">
                Your latest application activity
              </p>
            </div>

            <Link
              href="/account/applications"
              className="text-[13px] font-black text-[#b88410]"
            >
              View all →
            </Link>

          </div>


          {applications?.length ? (
            <div className="divide-y divide-slate-100">

              {applications.map((application) => (
                <div
                  key={application.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >

                  <div>
                    <p className="font-bold text-[#071a35]">
                      Job #{String(application.job_id).slice(0, 8)}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {application.applied_at
                        ? new Date(
                            application.applied_at
                          ).toLocaleDateString()
                        : "Recently submitted"}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold capitalize text-slate-600">
                    {(application.status || "pending").replaceAll(
                      "_",
                      " "
                    )}
                  </span>

                </div>
              ))}

            </div>
          ) : (
            <div className="px-5 py-12 text-center">

              <FileText
                size={40}
                className="mx-auto text-slate-200"
              />

              <h4 className="mt-4 text-[13px] font-black text-[#071a35]">
                No applications yet
              </h4>

              <p className="mt-2 text-[13px] text-slate-500">
                Apply to a published job and it will appear here.
              </p>

              <Link
                href="/jobs"
                className="mt-5 inline-flex font-sans rounded-[2px] bg-[#3E7BFA] px-5 py-3 text-[13px] font-black text-white"
              >
                Browse Jobs
              </Link>

            </div>
          )}

        </section>


        <aside className="rounded-[2px] border border-slate-200 bg-white p-5">

          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b88410]">
            Profile
          </p>

          <h3 className="mt-2 text-[13px] font-black text-[#071a35]">
            Keep your profile ready
          </h3>

          <p className="mt-3 text-[13px] leading-6 text-slate-500">
            Recruiters can understand your experience faster when your profile is complete.
          </p>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#f2b51d]"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(profileStrength, 100)
                )}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between text-[11px] font-bold text-slate-400">
            <span>Profile strength</span>
            <span>{profileStrength}%</span>
          </div>

          <Link
            href="/account/profile"
            className="mt-5 flex font-sans items-center justify-between rounded-[2px] border border-slate-200 px-4 py-3 text-[13px] font-black text-[#071a35] hover:bg-slate-50"
          >
            Profile & Resume
            <ArrowRight size={17} />
          </Link>

          <Link
            href="/account/job-alerts"
            className="mt-3 flex items-center justify-between rounded-[2px] border border-slate-200 px-4 py-3 text-[13px] font-black text-[#071a35] hover:bg-slate-50"
          >
            Job Alerts
            <ArrowRight size={17} />
          </Link>

        </aside>

      </div>

    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-[2px] border border-slate-200 bg-white p-5">

      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-[13px] font-bold text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-[13px] font-black text-[#071a35]">
            {value}
          </p>
        </div>

        <span className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-[#fff4cf] text-[#b88410]">
          {icon}
        </span>

      </div>

      <p className="mt-3 text-[11px] leading-5 text-slate-400">
        {text}
      </p>

    </div>
  );
}



