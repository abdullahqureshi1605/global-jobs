"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Plus,
  Save,
  X,
} from "lucide-react";

type Profile = {
  id: string;
  full_name: string;
  headline: string;
  country_id: string | null;
  city: string;
  phone: string;
  resume_url: string;
  skills: string[];
  bio: string;
  open_to: string;
  profile_strength: number;
};

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<Profile>({
      id: "",
      full_name: "",
      headline: "",
      country_id: null,
      city: "",
      phone: "",
      resume_url: "",
      skills: [],
      bio: "",
      open_to: "",
      profile_strength: 0,
    });

  const [email, setEmail] = useState("");
  const [skill, setSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/user/profile", {
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load profile."
          );
        }

        setProfile({
          ...profile,
          ...data.profile,
          skills: Array.isArray(data.profile?.skills)
            ? data.profile.skills
            : [],
        });

        setEmail(data.email || "");
      })
      .catch((error) => {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load profile."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  function update(
    key: keyof Profile,
    value: string | null | string[]
  ) {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function addSkill() {
    const value = skill.trim();

    if (!value) return;

    if (
      profile.skills.some(
        (item) =>
          item.toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      setSkill("");
      return;
    }

    update(
      "skills",
      [...profile.skills, value]
    );

    setSkill("");
  }

  function removeSkill(
    value: string
  ) {
    update(
      "skills",
      profile.skills.filter(
        (item) => item !== value
      )
    );
  }

  async function save(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/user/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profile),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to save profile."
        );
      }

      setProfile({
        ...profile,
        ...data.profile,
      });

      setMessage(
        "Profile saved successfully."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2
          size={30}
          className="animate-spin text-[#b88410]"
        />
      </div>
    );
  }

  return (
    <div className="w-full px-5 py-7 lg:px-8 lg:py-9">

      <div className="mb-8">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#b88410]">
          Candidate Profile
        </p>

        <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

          <div>
            <h2 className="text-3xl font-black text-[#071a35] lg:text-4xl">
              Profile & Resume
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Keep your career information simple and up to date.
            </p>
          </div>

          <div className="min-w-[220px]">
            <div className="flex items-center justify-between text-sm font-bold text-slate-500">
              <span>Profile complete</span>
              <span className="text-[#071a35]">
                {profile.profile_strength}%
              </span>
            </div>

            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#f2b51d]"
                style={{
                  width: `${profile.profile_strength}%`,
                }}
              />
            </div>
          </div>

        </div>
      </div>


      {error && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      )}


      <form
        onSubmit={save}
        className="space-y-6"
      >

        <section className="rounded-2xl border border-slate-200 bg-white">

          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="text-xl font-black text-[#071a35]">
              Personal information
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Basic information recruiters need to know.
            </p>
          </div>

          <div className="grid gap-5 px-6 py-6 md:grid-cols-2">

            <Field label="Full name">
              <input
                className="workspace-input"
                value={profile.full_name}
                onChange={(e) =>
                  update(
                    "full_name",
                    e.target.value
                  )
                }
                placeholder="Your full name"
              />
            </Field>

            <Field label="Email">
              <input
                className="workspace-input bg-slate-50"
                value={email}
                readOnly
              />
            </Field>

            <Field label="Professional headline">
              <input
                className="workspace-input"
                value={profile.headline}
                onChange={(e) =>
                  update(
                    "headline",
                    e.target.value
                  )
                }
                placeholder="e.g. Software Engineer"
              />
            </Field>

            <Field label="City">
              <input
                className="workspace-input"
                value={profile.city}
                onChange={(e) =>
                  update(
                    "city",
                    e.target.value
                  )
                }
                placeholder="e.g. Lahore"
              />
            </Field>

            <Field label="Phone">
              <input
                className="workspace-input"
                value={profile.phone}
                onChange={(e) =>
                  update(
                    "phone",
                    e.target.value
                  )
                }
                placeholder="+92..."
              />
            </Field>

            <Field label="Resume URL">
              <input
                className="workspace-input"
                type="url"
                value={profile.resume_url}
                onChange={(e) =>
                  update(
                    "resume_url",
                    e.target.value
                  )
                }
                placeholder="https://..."
              />
            </Field>

            <Field label="Open to">
              <input
                className="workspace-input"
                value={profile.open_to}
                onChange={(e) =>
                  update(
                    "open_to",
                    e.target.value
                  )
                }
                placeholder="Full-time, Remote, Contract..."
              />
            </Field>

          </div>
        </section>


        <section className="rounded-2xl border border-slate-200 bg-white">

          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="text-xl font-black text-[#071a35]">
              Skills
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Add skills recruiters can search for.
            </p>
          </div>

          <div className="px-6 py-6">

            <div className="flex flex-col gap-3 sm:flex-row">

              <input
                className="workspace-input flex-1"
                value={skill}
                onChange={(e) =>
                  setSkill(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill"
              />

              <button
                type="button"
                onClick={addSkill}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#071a35] px-5 text-sm font-black text-white"
              >
                <Plus size={17} />
                Add
              </button>

            </div>

            <div className="mt-4 flex flex-wrap gap-2">

              {profile.skills.map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full bg-[#071a35] px-3 py-2 text-xs font-bold text-white"
                  >
                    {item}

                    <button
                      type="button"
                      onClick={() =>
                        removeSkill(item)
                      }
                    >
                      <X size={14} />
                    </button>

                  </span>
                )
              )}

            </div>
          </div>
        </section>


        <section className="rounded-2xl border border-slate-200 bg-white">

          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="text-xl font-black text-[#071a35]">
              Professional bio
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Tell recruiters about your experience and goals.
            </p>
          </div>

          <div className="px-6 py-6">

            <textarea
              className="workspace-input min-h-[180px] resize-y py-3"
              value={profile.bio}
              onChange={(e) =>
                update(
                  "bio",
                  e.target.value
                )
              }
              placeholder="Tell employers about your experience, strengths and career goals..."
            />

          </div>
        </section>


        <div className="flex justify-end">

          <button
            type="submit"
            disabled={saving}
            className="flex h-12 items-center gap-2 rounded-xl bg-[#f2b51d] px-6 text-sm font-black text-[#071a35] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />
                Save profile
              </>
            )}
          </button>

        </div>

      </form>

    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#071a35]">
        {label}
      </span>

      {children}
    </label>
  );
}
