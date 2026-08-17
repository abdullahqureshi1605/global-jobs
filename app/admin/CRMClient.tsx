"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Megaphone,
  Pencil,
  Plus,
  Target,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

type ModuleName =
  | "leads"
  | "companies"
  | "contacts"
  | "deals"
  | "tasks"
  | "content"
  | "targets"
  | "activities"
  | "social";

interface CRMRecord {
  id?: string;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}

interface CRMClientProps {
  userEmail: string;
}

interface ModuleDefinition {
  key: ModuleName;
  label: string;
  icon: ComponentType<{
    className?: string;
  }>;
}

const MODULES: ModuleDefinition[] = [
  {
    key: "leads",
    label: "Leads",
    icon: Users,
  },
  {
    key: "companies",
    label: "Companies",
    icon: Building2,
  },
  {
    key: "contacts",
    label: "Contacts",
    icon: UserRound,
  },
  {
    key: "deals",
    label: "Revenue",
    icon: CircleDollarSign,
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: CheckCircle2,
  },
  {
    key: "content",
    label: "Content",
    icon: FileText,
  },
  {
    key: "targets",
    label: "Job Targets",
    icon: Target,
  },
  {
    key: "social",
    label: "Social Media",
    icon: Megaphone,
  },
  {
    key: "activities",
    label: "Activity",
    icon: Activity,
  },
];

const EMPTY_FORMS: Record<
  ModuleName,
  CRMRecord
> = {
  leads: {
    lead_name: "",
    job_title: "",
    email: "",
    phone: "",
    website: "",
    country: "",
    city: "",
    lead_type: "Recruiter",
    source: "LinkedIn",
    status: "New",
    priority: "Warm",
    notes: "",
  },

  companies: {
    name: "",
    website: "",
    industry: "",
    country: "",
    city: "",
    email: "",
    phone: "",
    company_size: "",
    status: "prospect",
    notes: "",
  },

  contacts: {
    company_id: "",
    first_name: "",
    last_name: "",
    title: "",
    email: "",
    phone: "",
    linkedin_url: "",
    country: "",
    city: "",
    status: "active",
    notes: "",
  },

  deals: {
    deal_name: "",
    company_id: "",
    contact_id: "",
    lead_id: "",
    stage: "New",
    amount: "",
    currency: "USD",
    expected_close_date: "",
    notes: "",
  },

  tasks: {
    title: "",
    description: "",
    due_date: "",
    priority: "Medium",
    status: "Pending",
  },

  content: {
    title: "",
    content_type: "Article",
    target_month: "",
    status: "Planned",
    published_at: "",
    url: "",
    notes: "",
  },

  targets: {
    target_month: "",
    country: "",
    city: "",
    category: "",
    division: "",
    source: "",
    target_jobs: 0,
    actual_jobs: 0,
    notes: "",
  },

  social: {
    platform: "Facebook",
    account_name: "",
    post_type: "Job Post",
    title: "",
    target_country: "",
    target_category: "",
    target_url: "",
    status: "Draft",
    scheduled_at: "",
    published_at: "",
    impressions: 0,
    clicks: 0,
    leads_generated: 0,
    notes: "",
  },

  activities: {
    activity_type: "Note",
    title: "",
    description: "",
    occurred_at: "",
  },
};

function moduleLabel(
  module: ModuleName
) {
  return (
    MODULES.find(
      (item) =>
        item.key === module
    )?.label ?? module
  );
}

function formatDate(
  value: unknown
) {
  if (!value) return "—";

  const date = new Date(
    String(value)
  );

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString();
}

function inputDate(
  value: unknown
) {
  if (!value) return "";
  return String(value).slice(
    0,
    10
  );
}

async function readResponse(
  response: Response
) {
  const raw =
    await response.text();

  if (!raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function CRMClient({
  userEmail,
}: CRMClientProps) {
  const [module, setModule] =
    useState<ModuleName>("leads");

  const [records, setRecords] =
    useState<CRMRecord[]>([]);

  const [companies, setCompanies] =
    useState<CRMRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState<CRMRecord | null>(
      null
    );

  const [formOpen, setFormOpen] =
    useState(false);

  const [form, setForm] =
    useState<CRMRecord>({
      ...EMPTY_FORMS.leads,
    });

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadModule = async (
    selected: ModuleName
  ) => {
    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/crm?module=${encodeURIComponent(
            selected
          )}`,
          {
            cache: "no-store",
            credentials:
              "same-origin",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const result =
        await readResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "Failed to load CRM data."
        );
      }

      setRecords(
        Array.isArray(
          result?.data
        )
          ? result.data
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load CRM data."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies =
    async () => {
      try {
        const response =
          await fetch(
            "/api/admin/crm?module=companies",
            {
              cache: "no-store",
              credentials:
                "same-origin",
            }
          );

        const result =
          await readResponse(
            response
          );

        if (response.ok) {
          setCompanies(
            Array.isArray(
              result?.data
            )
              ? result.data
              : []
          );
        }
      } catch {
        // Non-critical.
      }
    };

  useEffect(() => {
    void loadCompanies();
  }, []);

  useEffect(() => {
    void loadModule(module);
  }, [module]);

  const filteredRecords =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return records;
      }

      return records.filter(
        (record) =>
          JSON.stringify(
            record
          )
            .toLowerCase()
            .includes(query)
      );
    }, [
      records,
      search,
    ]);

  const stats =
    useMemo(() => {
      switch (module) {
        case "leads":
          return {
            first: {
              label: "Total",
              value: records.length,
            },
            second: {
              label: "Hot",
              value:
                records.filter(
                  (x) =>
                    x.priority ===
                    "Hot"
                ).length,
            },
            third: {
              label: "Interested",
              value:
                records.filter(
                  (x) =>
                    x.status ===
                    "Interested"
                ).length,
            },
            fourth: {
              label: "Qualified",
              value:
                records.filter(
                  (x) =>
                    x.status ===
                    "Qualified"
                ).length,
            },
          };

        case "companies":
          return {
            first: {
              label: "Companies",
              value:
                records.length,
            },
            second: {
              label: "Prospects",
              value:
                records.filter(
                  (x) =>
                    x.status ===
                    "prospect"
                ).length,
            },
            third: {
              label: "Active",
              value:
                records.filter(
                  (x) =>
                    x.status ===
                    "active"
                ).length,
            },
            fourth: {
              label: "Countries",
              value:
                new Set(
                  records
                    .map(
                      (x) =>
                        String(
                          x.country ??
                            ""
                        )
                    )
                    .filter(Boolean)
                ).size,
            },
          };

        case "contacts":
          return {
            first: {
              label: "Contacts",
              value:
                records.length,
            },
            second: {
              label: "Active",
              value:
                records.filter(
                  (x) =>
                    x.status ===
                    "active"
                ).length,
            },
            third: {
              label: "With Email",
              value:
                records.filter(
                  (x) =>
                    Boolean(
                      x.email
                    )
                ).length,
            },
            fourth: {
              label: "With Phone",
              value:
                records.filter(
                  (x) =>
                    Boolean(
                      x.phone
                    )
                ).length,
            },
          };

        case "deals":
          return {
            first: {
              label: "Total Deals",
              value:
                records.length,
            },
            second: {
              label: "Open",
              value:
                records.filter(
                  (x) =>
                    ![
                      "Won",
                      "Lost",
                    ].includes(
                      String(
                        x.stage ??
                          ""
                      )
                    )
                ).length,
            },
            third: {
              label: "Won",
              value:
                records.filter(
                  (x) =>
                    x.stage ===
                    "Won"
                ).length,
            },
            fourth: {
              label: "Won Revenue",
              value:
                `$${records
                  .filter(
                    (x) =>
                      x.stage ===
                      "Won"
                  )
                  .reduce(
                    (
                      total,
                      x
                    ) =>
                      total +
                      (Number(
                        x.amount
                      ) || 0),
                    0
                  )
                  .toLocaleString()}`,
            },
          };

        case "tasks":
          return {
            first: {
              label: "Total",
              value:
                records.length,
            },
            second: {
              label: "Pending",
              value:
                records.filter(
                  (x) =>
                    x.status ===
                    "Pending"
                ).length,
            },
            third: {
              label: "In Progress",
              value:
                records.filter(
                  (x) =>
                    x.status ===
                    "In Progress"
                ).length,
            },
            fourth: {
              label: "Completed",
              value:
                records.filter(
                  (x) =>
                    x.status ===
                    "Completed"
                ).length,
            },
          };

        case "content":
          return {
            first: {
              label: "Content Items",
              value:
                records.length,
            },
            second: {
              label: "Published",
              value:
                records.filter(
                  (x) =>
                    x.status ===
                    "Published"
                ).length,
            },
            third: {
              label: "Writing",
              value:
                records.filter(
                  (x) =>
                    x.status ===
                    "Writing"
                ).length,
            },
            fourth: {
              label: "Planned",
              value:
                records.filter(
                  (x) =>
                    x.status ===
                    "Planned"
                ).length,
            },
          };

        case "targets":
          return {
            first: {
              label: "Targets",
              value:
                records.reduce(
                  (
                    total,
                    x
                  ) =>
                    total +
                    (Number(
                      x.target_jobs
                    ) || 0),
                  0
                ),
            },
            second: {
              label: "Actual",
              value:
                records.reduce(
                  (
                    total,
                    x
                  ) =>
                    total +
                    (Number(
                      x.actual_jobs
                    ) || 0),
                  0
                ),
            },
            third: {
              label: "Gap",
              value:
                records.reduce(
                  (
                    total,
                    x
                  ) =>
                    total +
                    Math.max(
                      (Number(
                        x.target_jobs
                      ) || 0) -
                        (Number(
                          x.actual_jobs
                        ) || 0),
                      0
                    ),
                  0
                ),
            },
            fourth: {
              label: "Sources",
              value:
                new Set(
                  records
                    .map(
                      (x) =>
                        String(
                          x.source ??
                            ""
                        )
                    )
                    .filter(Boolean)
                ).size,
            },
          };

        case "social":
          return {
            first: {
              label: "Posts",
              value:
                records.length,
            },
            second: {
              label: "Published",
              value:
                records.filter(
                  (x) =>
                    x.status ===
                    "Published"
                ).length,
            },
            third: {
              label: "Clicks",
              value:
                records.reduce(
                  (
                    total,
                    x
                  ) =>
                    total +
                    (Number(
                      x.clicks
                    ) || 0),
                  0
                ),
            },
            fourth: {
              label: "Leads",
              value:
                records.reduce(
                  (
                    total,
                    x
                  ) =>
                    total +
                    (Number(
                      x.leads_generated
                    ) || 0),
                  0
                ),
            },
          };

        case "activities":
          return {
            first: {
              label: "Activities",
              value:
                records.length,
            },
            second: {
              label: "Emails",
              value:
                records.filter(
                  (x) =>
                    x.activity_type ===
                    "Email"
                ).length,
            },
            third: {
              label: "Calls",
              value:
                records.filter(
                  (x) =>
                    x.activity_type ===
                    "Call"
                ).length,
            },
            fourth: {
              label: "Follow-ups",
              value:
                records.filter(
                  (x) =>
                    x.activity_type ===
                    "Follow-up"
                ).length,
            },
          };
      }
    }, [
      module,
      records,
    ]);

  function changeModule(
    nextModule: ModuleName
  ) {
    setModule(nextModule);
    setSearch("");
    setEditing(null);
    setForm({
      ...EMPTY_FORMS[nextModule],
    });
    setFormOpen(false);
    setError("");
    setMessage("");
  }

  function openCreate() {
    setEditing(null);

    setForm({
      ...EMPTY_FORMS[module],
    });

    setFormOpen(true);
    setError("");
    setMessage("");
  }

  function openEdit(
    record: CRMRecord
  ) {
    const next = {
      ...EMPTY_FORMS[module],
      ...record,
    };

    if (
      module === "content"
    ) {
      next.target_month =
        inputDate(
          next.target_month
        );

      next.published_at =
        inputDate(
          next.published_at
        );
    }

    if (
      module === "targets"
    ) {
      next.target_month =
        inputDate(
          next.target_month
        );
    }

    if (
      module === "deals"
    ) {
      next.expected_close_date =
        inputDate(
          next.expected_close_date
        );
    }

    if (
      module === "tasks"
    ) {
      next.due_date =
        inputDate(
          next.due_date
        );
    }

    setEditing(record);
    setForm(next);
    setFormOpen(true);
    setError("");
    setMessage("");
  }

  async function saveRecord() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const isEdit =
        Boolean(editing?.id);

      const payload = {
        ...form,
      };

      delete (
        payload as CRMRecord
      ).id;

      delete (
        payload as CRMRecord
      ).created_at;

      delete (
        payload as CRMRecord
      ).updated_at;

      const response =
        await fetch(
          isEdit
            ? `/api/admin/crm/${module}/${editing?.id}`
            : "/api/admin/crm",
          {
            method: isEdit
              ? "PUT"
              : "POST",
            credentials:
              "same-origin",
            headers: {
              Accept:
                "application/json",
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              isEdit
                ? payload
                : {
                    module,
                    data: payload,
                  }
            ),
          }
        );

      const result =
        await readResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "Unable to save record."
        );
      }

      setMessage(
        isEdit
          ? "Record updated successfully."
          : "Record created successfully."
      );

      setFormOpen(false);
      setEditing(null);

      setForm({
        ...EMPTY_FORMS[module],
      });

      await loadModule(module);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save record."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(
    record: CRMRecord
  ) {
    if (!record.id) {
      return;
    }

    if (
      !window.confirm(
        "Delete this record permanently?"
      )
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `/api/admin/crm/${module}/${record.id}`,
          {
            method: "DELETE",
            credentials:
              "same-origin",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const result =
        await readResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "Unable to delete record."
        );
      }

      setMessage(
        "Record deleted successfully."
      );

      await loadModule(module);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete record."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* COMPACT HEADER */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              ← Admin Dashboard
            </Link>

            <div className="mt-3 flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                CRM
              </h1>

              <span className="hidden text-sm text-slate-400 sm:inline">
                {userEmail}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Add{" "}
            {moduleLabel(
              module
            ).slice(0, -1)}
          </button>
        </div>

        {/* ONLY CRM NAVIGATION */}
        <div className="mb-5 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          <nav className="flex min-w-max gap-1">
            {MODULES.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  module ===
                  item.key;

                return (
                  <button
                    key={
                      item.key
                    }
                    type="button"
                    onClick={() =>
                      changeModule(
                        item.key
                      )
                    }
                    className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${
                      active
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {
                      item.label
                    }
                  </button>
                );
              }
            )}
          </nav>
        </div>

        {message && (
          <Alert
            type="success"
            message={
              message
            }
            onClose={() =>
              setMessage("")
            }
          />
        )}

        {error && (
          <Alert
            type="error"
            message={
              error
            }
            onClose={() =>
              setError("")
            }
          />
        )}

        {/* MODULE WORKSPACE */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* MODULE HEADER */}
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {module ===
                  "social"
                    ? "Marketing"
                    : "CRM"}
                </p>

                <h2 className="mt-0.5 text-xl font-extrabold text-slate-950 dark:text-white">
                  {
                    moduleLabel(
                      module
                    )
                  }
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormOpen(
                      false
                    )
                  }
                  className={`rounded-lg px-3 py-2 text-xs font-bold ${
                    !formOpen
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-500"
                  }`}
                >
                  Records
                </button>

                <button
                  type="button"
                  onClick={
                    openCreate
                  }
                  className={`rounded-lg px-3 py-2 text-xs font-bold ${
                    formOpen
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500"
                  }`}
                >
                  New
                </button>
              </div>
            </div>
          </div>

          {/* MODULE-SPECIFIC CONTENT */}
          {formOpen ? (
            <CRMForm
              module={
                module
              }
              form={form}
              companies={
                companies
              }
              saving={
                saving
              }
              onChange={(
                key,
                value
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    [key]:
                      value,
                  })
                )
              }
              onSave={
                saveRecord
              }
              onCancel={() => {
                setFormOpen(
                  false
                );
                setEditing(
                  null
                );
              }}
            />
          ) : (
            <>
              <ModuleStats
                stats={
                  stats
                }
              />

              <div className="border-t border-slate-200 p-5 dark:border-slate-800">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-slate-950 dark:text-white">
                      {getModuleListTitle(
                        module
                      )}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {
                        filteredRecords.length
                      }{" "}
                      records
                    </p>
                  </div>

                  <input
                    value={
                      search
                    }
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder={`Search ${moduleLabel(
                      module
                    ).toLowerCase()}...`}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 sm:max-w-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                {loading ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    Loading...
                  </div>
                ) : (
                  <CRMTable
                    module={
                      module
                    }
                    records={
                      filteredRecords
                    }
                    onEdit={
                      openEdit
                    }
                    onDelete={
                      deleteRecord
                    }
                  />
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function ModuleStats({
  stats,
}: {
  stats: {
    first: {
      label: string;
      value: string | number;
    };
    second: {
      label: string;
      value: string | number;
    };
    third: {
      label: string;
      value: string | number;
    };
    fourth: {
      label: string;
      value: string | number;
    };
  };
}) {
  return (
    <div className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4 dark:border-slate-800">
      <Stat
        label={
          stats.first.label
        }
        value={
          stats.first.value
        }
      />

      <Stat
        label={
          stats.second.label
        }
        value={
          stats.second.value
        }
      />

      <Stat
        label={
          stats.third.label
        }
        value={
          stats.third.value
        }
      />

      <Stat
        label={
          stats.fourth.label
        }
        value={
          stats.fourth.value
        }
      />
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border-r border-slate-200 px-5 py-4 last:border-r-0 dark:border-slate-800">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function getModuleListTitle(
  module: ModuleName
) {
  switch (module) {
    case "leads":
      return "Business Opportunities";

    case "companies":
      return "Business Accounts";

    case "contacts":
      return "Business Contacts";

    case "deals":
      return "Revenue Pipeline";

    case "tasks":
      return "Work Queue";

    case "content":
      return "Content Production";

    case "targets":
      return "Job Supply Targets";

    case "social":
      return "Social Media Campaigns";

    case "activities":
      return "Activity Log";

    default:
      return "Records";
  }
}

function Alert({
  type,
  message,
  onClose,
}: {
  type:
    | "success"
    | "error";
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
        type ===
        "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <span>
        {message}
      </span>

      <button
        type="button"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function CRMTable({
  module,
  records,
  onEdit,
  onDelete,
}: {
  module: ModuleName;
  records: CRMRecord[];
  onEdit: (
    record: CRMRecord
  ) => void;
  onDelete: (
    record: CRMRecord
  ) => void;
}) {
  const columns =
    getColumns(module);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            {columns.map(
              (column) => (
                <th
                  key={
                    column.key
                  }
                  className="border-b border-slate-200 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800"
                >
                  {
                    column.label
                  }
                </th>
              )
            )}

            <th className="border-b border-slate-200 px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {records.length ===
          0 ? (
            <tr>
              <td
                colSpan={
                  columns.length +
                  1
                }
                className="px-5 py-14 text-center text-sm text-slate-500"
              >
                No records yet.
              </td>
            </tr>
          ) : (
            records.map(
              (record) => (
                <tr
                  key={
                    record.id
                  }
                  className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                >
                  {columns.map(
                    (
                      column
                    ) => (
                      <td
                        key={
                          column.key
                        }
                        className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                      >
                        {renderCell(
                          column.key,
                          record[
                            column.key
                          ]
                        )}
                      </td>
                    )
                  )}

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onEdit(
                            record
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onDelete(
                            record
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function getColumns(
  module: ModuleName
) {
  switch (module) {
    case "leads":
      return [
        {
          key: "lead_name",
          label: "Lead",
        },
        {
          key: "company_id",
          label: "Company",
        },
        {
          key: "lead_type",
          label: "Type",
        },
        {
          key: "source",
          label: "Source",
        },
        {
          key: "status",
          label: "Status",
        },
        {
          key: "priority",
          label: "Priority",
        },
      ];

    case "companies":
      return [
        {
          key: "name",
          label: "Company",
        },
        {
          key: "industry",
          label: "Industry",
        },
        {
          key: "country",
          label: "Country",
        },
        {
          key: "city",
          label: "City",
        },
        {
          key: "status",
          label: "Status",
        },
      ];

    case "contacts":
      return [
        {
          key: "first_name",
          label: "First Name",
        },
        {
          key: "last_name",
          label: "Last Name",
        },
        {
          key: "title",
          label: "Title",
        },
        {
          key: "email",
          label: "Email",
        },
        {
          key: "country",
          label: "Country",
        },
      ];

    case "deals":
      return [
        {
          key: "deal_name",
          label: "Deal",
        },
        {
          key: "stage",
          label: "Stage",
        },
        {
          key: "amount",
          label: "Amount",
        },
        {
          key: "currency",
          label: "Currency",
        },
        {
          key: "expected_close_date",
          label: "Close",
        },
      ];

    case "tasks":
      return [
        {
          key: "title",
          label: "Task",
        },
        {
          key: "due_date",
          label: "Due",
        },
        {
          key: "priority",
          label: "Priority",
        },
        {
          key: "status",
          label: "Status",
        },
      ];

    case "content":
      return [
        {
          key: "title",
          label: "Content",
        },
        {
          key: "content_type",
          label: "Type",
        },
        {
          key: "status",
          label: "Status",
        },
        {
          key: "published_at",
          label: "Published",
        },
      ];

    case "targets":
      return [
        {
          key: "target_month",
          label: "Month",
        },
        {
          key: "country",
          label: "Country",
        },
        {
          key: "city",
          label: "City",
        },
        {
          key: "category",
          label: "Category",
        },
        {
          key: "division",
          label: "Division",
        },
        {
          key: "source",
          label: "Source",
        },
        {
          key: "target_jobs",
          label: "Target",
        },
        {
          key: "actual_jobs",
          label: "Actual",
        },
      ];

    case "social":
      return [
        {
          key: "platform",
          label: "Platform",
        },
        {
          key: "post_type",
          label: "Post Type",
        },
        {
          key: "title",
          label: "Post",
        },
        {
          key: "status",
          label: "Status",
        },
        {
          key: "impressions",
          label: "Impressions",
        },
        {
          key: "clicks",
          label: "Clicks",
        },
        {
          key: "leads_generated",
          label: "Leads",
        },
      ];

    case "activities":
      return [
        {
          key: "activity_type",
          label: "Type",
        },
        {
          key: "title",
          label: "Activity",
        },
        {
          key: "occurred_at",
          label: "Date",
        },
      ];
  }
}

function renderCell(
  key: string,
  value: unknown
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (
    key.includes("date") ||
    key.includes("_at") ||
    key ===
      "target_month"
  ) {
    return formatDate(
      value
    );
  }

  return String(value);
}

function CRMForm({
  module,
  form,
  companies,
  saving,
  onChange,
  onSave,
  onCancel,
}: {
  module: ModuleName;
  form: CRMRecord;
  companies: CRMRecord[];
  saving: boolean;
  onChange: (
    key: string,
    value: unknown
  ) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const field = (
    key: string,
    label: string,
    type = "text"
  ): ReactNode => (
    <label
      key={key}
      className="block"
    >
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <input
        type={type}
        value={String(
          form[key] ?? ""
        )}
        onChange={(event) =>
          onChange(
            key,
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </label>
  );

  const area = (
    key: string,
    label: string
  ): ReactNode => (
    <label
      key={key}
      className="block md:col-span-2"
    >
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <textarea
        value={String(
          form[key] ?? ""
        )}
        rows={5}
        onChange={(event) =>
          onChange(
            key,
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </label>
  );

  const select = (
    key: string,
    label: string,
    options: string[]
  ): ReactNode => (
    <label
      key={key}
      className="block"
    >
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <select
        value={String(
          form[key] ?? ""
        )}
        onChange={(event) =>
          onChange(
            key,
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>
    </label>
  );

  const nodes: ReactNode[] =
    [];

  if (module === "leads") {
    nodes.push(
      field(
        "lead_name",
        "Lead Name"
      ),
      field(
        "job_title",
        "Job Title"
      ),
      field(
        "email",
        "Email",
        "email"
      ),
      field(
        "phone",
        "Phone"
      ),
      field(
        "website",
        "Website",
        "url"
      ),
      field(
        "country",
        "Country"
      ),
      field(
        "city",
        "City"
      ),
      select(
        "lead_type",
        "Lead Type",
        [
          "Recruiter",
          "Affiliate",
          "Job Platform",
          "Partner",
          "Potential Client",
          "Other",
        ]
      ),
      select(
        "source",
        "Source",
        [
          "LinkedIn",
          "Facebook",
          "Google",
          "Email",
          "WhatsApp",
          "Referral",
          "Website",
          "Job Board",
          "Affiliate Network",
          "Recruiter Outreach",
          "Other",
        ]
      ),
      select(
        "status",
        "Status",
        [
          "New",
          "Researching",
          "Contacted",
          "Follow-up",
          "Replied",
          "Interested",
          "Qualified",
          "Won",
          "Lost",
          "Unresponsive",
        ]
      ),
      select(
        "priority",
        "Priority",
        [
          "Hot",
          "Warm",
          "Cold",
        ]
      ),
      area(
        "notes",
        "Notes"
      )
    );
  }

  if (
    module === "companies"
  ) {
    nodes.push(
      field(
        "name",
        "Company"
      ),
      field(
        "website",
        "Website",
        "url"
      ),
      field(
        "industry",
        "Industry"
      ),
      field(
        "country",
        "Country"
      ),
      field(
        "city",
        "City"
      ),
      field(
        "email",
        "Email",
        "email"
      ),
      field(
        "phone",
        "Phone"
      ),
      field(
        "company_size",
        "Company Size"
      ),
      select(
        "status",
        "Status",
        [
          "prospect",
          "active",
          "inactive",
        ]
      ),
      area(
        "notes",
        "Notes"
      )
    );
  }

  if (
    module === "contacts"
  ) {
    nodes.push(
      field(
        "first_name",
        "First Name"
      ),
      field(
        "last_name",
        "Last Name"
      ),
      field(
        "title",
        "Title"
      ),
      field(
        "email",
        "Email",
        "email"
      ),
      field(
        "phone",
        "Phone"
      ),
      field(
        "linkedin_url",
        "LinkedIn URL",
        "url"
      ),
      field(
        "country",
        "Country"
      ),
      field(
        "city",
        "City"
      ),
      area(
        "notes",
        "Notes"
      )
    );
  }

  if (
    module === "deals"
  ) {
    nodes.push(
      field(
        "deal_name",
        "Deal Name"
      ),
      select(
        "company_id",
        "Company",
        [
          "",
          ...companies
            .map(
              (
                company
              ) =>
                String(
                  company.id ??
                    ""
                )
            )
            .filter(
              Boolean
            ),
        ]
      ),
      select(
        "stage",
        "Stage",
        [
          "New",
          "Contacted",
          "Interested",
          "Proposal",
          "Negotiation",
          "Won",
          "Lost",
        ]
      ),
      field(
        "amount",
        "Amount",
        "number"
      ),
      field(
        "currency",
        "Currency"
      ),
      field(
        "expected_close_date",
        "Expected Close",
        "date"
      ),
      area(
        "notes",
        "Notes"
      )
    );
  }

  if (
    module === "tasks"
  ) {
    nodes.push(
      field(
        "title",
        "Task"
      ),
      field(
        "due_date",
        "Due Date",
        "date"
      ),
      select(
        "priority",
        "Priority",
        [
          "High",
          "Medium",
          "Low",
        ]
      ),
      select(
        "status",
        "Status",
        [
          "Pending",
          "In Progress",
          "Completed",
          "Cancelled",
        ]
      ),
      area(
        "description",
        "Description"
      )
    );
  }

  if (
    module === "content"
  ) {
    nodes.push(
      field(
        "title",
        "Content Title"
      ),
      select(
        "content_type",
        "Content Type",
        [
          "Article",
          "Country Guide",
          "City Guide",
          "Category Guide",
          "Career Resource",
          "Salary Guide",
          "Other",
        ]
      ),
      field(
        "target_month",
        "Target Month",
        "date"
      ),
      select(
        "status",
        "Status",
        [
          "Planned",
          "Writing",
          "Published",
          "Updated",
          "Archived",
        ]
      ),
      field(
        "published_at",
        "Published Date",
        "date"
      ),
      field(
        "url",
        "URL",
        "url"
      ),
      area(
        "notes",
        "Notes"
      )
    );
  }

  if (
    module === "targets"
  ) {
    nodes.push(
      field(
        "target_month",
        "Target Month",
        "date"
      ),
      field(
        "country",
        "Country"
      ),
      field(
        "city",
        "City"
      ),
      field(
        "category",
        "Category"
      ),
      field(
        "division",
        "Division"
      ),
      field(
        "source",
        "Source"
      ),
      field(
        "target_jobs",
        "Target Jobs",
        "number"
      ),
      field(
        "actual_jobs",
        "Actual Jobs",
        "number"
      ),
      area(
        "notes",
        "Notes"
      )
    );
  }

  if (
    module === "social"
  ) {
    nodes.push(
      select(
        "platform",
        "Platform",
        [
          "Facebook",
          "Instagram",
          "LinkedIn",
          "X",
          "Google Business",
        ]
      ),
      field(
        "account_name",
        "Account"
      ),
      select(
        "post_type",
        "Post Type",
        [
          "Job Post",
          "Country Jobs",
          "City Jobs",
          "Category Jobs",
          "Article",
          "Career Tip",
          "Salary Guide",
          "Company Post",
          "Recruiter Post",
          "Other",
        ]
      ),
      field(
        "title",
        "Post Title"
      ),
      field(
        "target_country",
        "Target Country"
      ),
      field(
        "target_category",
        "Target Category"
      ),
      field(
        "target_url",
        "Target URL",
        "url"
      ),
      select(
        "status",
        "Status",
        [
          "Draft",
          "Ready",
          "Published",
          "Paused",
        ]
      ),
      field(
        "scheduled_at",
        "Scheduled At",
        "datetime-local"
      ),
      field(
        "published_at",
        "Published At",
        "datetime-local"
      ),
      field(
        "impressions",
        "Impressions",
        "number"
      ),
      field(
        "clicks",
        "Clicks",
        "number"
      ),
      field(
        "leads_generated",
        "Leads Generated",
        "number"
      ),
      area(
        "notes",
        "Notes"
      )
    );
  }

  if (
    module ===
    "activities"
  ) {
    nodes.push(
      select(
        "activity_type",
        "Activity Type",
        [
          "Created",
          "Email",
          "LinkedIn",
          "WhatsApp",
          "Call",
          "Follow-up",
          "Meeting",
          "Reply",
          "Status Change",
          "Deal",
          "Note",
        ]
      ),
      field(
        "title",
        "Activity"
      ),
      field(
        "occurred_at",
        "Occurred At",
        "datetime-local"
      ),
      area(
        "description",
        "Description"
      )
    );
  }

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {nodes}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save"}
        </button>
      </div>
    </div>
  );
}