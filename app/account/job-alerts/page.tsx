"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";

type Alert = {
  id: string;
  name: string | null;
  email: string;
  countries: string[];
  cities: string[];
  categories: string[];
  frequency: string;
};

function csv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function JobAlertsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countries, setCountries] = useState("");
  const [cities, setCities] = useState("");
  const [categories, setCategories] = useState("");
  const [frequency, setFrequency] =
    useState("daily");

  const [alerts, setAlerts] =
    useState<Alert[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          "/api/job-alerts",
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to load job alerts."
        );
      }

      setAlerts(
        Array.isArray(data.alerts)
          ? data.alerts
          : []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load job alerts."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/job-alerts",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              countries: csv(countries),
              cities: csv(cities),
              categories: csv(categories),
              frequency,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to create job alert."
        );
      }

      setMessage(
        "Job alert created successfully."
      );

      setName("");
      setCountries("");
      setCities("");
      setCategories("");

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create job alert."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeAlerts() {
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/job-alerts",
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to remove alerts."
        );
      }

      setAlerts([]);
      setMessage(
        "Job alerts removed."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to remove alerts."
      );
    }
  }

  return (
    <div className="w-full px-5 py-5 lg:px-8 lg:py-6">

      <div className="mb-7">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b88410]">
          Candidate Portal
        </p>

        <h2 className="mt-2 text-[13px] font-black text-[#071a35] lg:text-[13px]">
          Job Alerts
        </h2>

        <p className="mt-2 text-[13px] text-slate-500">
          Choose the opportunities you want to receive automatically.
        </p>
      </div>


      {error && (
        <div className="mb-5 rounded-[2px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-semibold text-rose-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-5 rounded-[2px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">
          {message}
        </div>
      )}


      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">

        <form
          onSubmit={submit}
          className="rounded-[2px] border border-slate-200 bg-white"
        >

          <div className="flex items-start gap-4 border-b border-slate-100 px-4 py-4">

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-[#071a35] text-[#f2b51d]">
              <Bell size={20} />
            </span>

            <div>
              <h3 className="text-[13px] font-black text-[#071a35]">
                Create a job alert
              </h3>

              <p className="mt-1 text-[13px] text-slate-400">
                You can change these preferences whenever you want.
              </p>
            </div>

          </div>


          <div className="grid gap-5 px-6 py-6 md:grid-cols-2">

            <Field label="Name">
              <input
                className="workspace-input"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Your name"
              />
            </Field>

            <Field label="Email">
              <input
                className="workspace-input"
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
              />
            </Field>

            <Field label="Countries">
              <input
                className="workspace-input"
                value={countries}
                onChange={(e) =>
                  setCountries(
                    e.target.value
                  )
                }
                placeholder="Italy, Germany, Canada"
              />
            </Field>

            <Field label="Cities">
              <input
                className="workspace-input"
                value={cities}
                onChange={(e) =>
                  setCities(e.target.value)
                }
                placeholder="Rome, Milan, Berlin"
              />
            </Field>

            <Field label="Job categories">
              <input
                className="workspace-input"
                value={categories}
                onChange={(e) =>
                  setCategories(
                    e.target.value
                  )
                }
                placeholder="IT, Healthcare, Construction"
              />
            </Field>

            <Field label="Frequency">
              <select
                className="workspace-input"
                value={frequency}
                onChange={(e) =>
                  setFrequency(
                    e.target.value
                  )
                }
              >
                <option value="daily">
                  Daily
                </option>

                <option value="weekly">
                  Weekly
                </option>
              </select>
            </Field>

          </div>


          <div className="flex justify-end border-t border-slate-100 px-4 py-4">

            <button
              type="submit"
              disabled={saving}
              className="flex h-12 items-center gap-2 rounded-[2px] bg-[#3E7BFA] px-6 text-[13px] font-black text-white disabled:opacity-60"
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
                  Save Job Alert
                </>
              )}
            </button>

          </div>

        </form>


        <aside className="rounded-[2px] border border-slate-200 bg-white p-4">

          <h3 className="text-[13px] font-black text-[#071a35]">
            Active alerts
          </h3>

          {loading ? (
            <div className="mt-5 flex justify-center">
              <Loader2
                size={26}
                className="animate-spin text-[#b88410]"
              />
            </div>
          ) : alerts.length ? (
            <div className="mt-5 space-y-4">

              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-[2px] bg-slate-50 p-4"
                >

                  <p className="font-black text-[#071a35]">
                    {alert.email}
                  </p>

                  <p className="mt-2 text-[11px] leading-5 text-slate-500">
                    {alert.countries?.join(", ") ||
                      "All countries"}
                  </p>

                  <p className="text-[11px] leading-5 text-slate-500">
                    {alert.categories?.join(", ") ||
                      "All categories"}
                  </p>

                  <span className="mt-3 inline-block rounded-full bg-[#fff4cf] px-3 py-1 text-[11px] font-bold capitalize text-[#8e6810]">
                    {alert.frequency}
                  </span>

                </div>
              ))}

              <button
                type="button"
                onClick={removeAlerts}
                className="flex w-full items-center justify-center gap-2 rounded-[2px] border border-rose-200 px-4 py-3 text-[13px] font-bold text-rose-600 hover:bg-rose-50"
              >
                <Trash2 size={16} />
                Remove alerts
              </button>

            </div>
          ) : (
            <div className="mt-5 text-[13px] text-slate-500">
              No active job alerts yet.
            </div>
          )}

        </aside>

      </div>

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
      <span className="mb-2 block text-[13px] font-bold text-[#071a35]">
        {label}
      </span>
      {children}
    </label>
  );
}


