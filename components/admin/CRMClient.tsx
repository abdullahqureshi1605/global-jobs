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
  | "social"
  | "activities";

interface CRMRecord {
  id?: string;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}

interface CRMClientProps {
  userEmail: string;
}

interface ModuleItem {
  key: ModuleName;
  label: string;
  icon: ComponentType<{
    className?: string;
  }>;
}

interface StatItem {
  label: string;
  value: string | number;
}

const MODULES: ModuleItem[] = [
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
    label: "Social",
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

function getModuleLabel(
  module: ModuleName
): string {
  const item = MODULES.find(
    (entry) =>
      entry.key === module
  );

  return item?.label ?? module;
}

function getDescription(
  module: ModuleName
): string {
  switch (module) {
    case "leads":
      return "Recruiter, affiliate and partnership opportunities.";

    case "companies":
      return "Recruiter, employer and partner organizations.";

    case "contacts":
      return "People connected to companies and business relationships.";

    case "deals":
      return "Commercial opportunities and revenue.";

    case "tasks":
      return "Research, outreach and follow-up work.";

    case "content":
      return "Articles, guides and publishing progress.";

    case "targets":
      return "Target jobs versus actual job supply.";

    case "social":
      return "Social campaigns, posts, clicks and leads.";

    case "activities":
      return "Business communication and operational history.";

    default:
      return "";
  }
}

function getAddLabel(
  module: ModuleName
): string {
  switch (module) {
    case "leads":
      return "Add Lead";

    case "companies":
      return "Add Company";

    case "contacts":
      return "Add Contact";

    case "deals":
      return "Add Deal";

    case "tasks":
      return "Add Task";

    case "content":
      return "Add Content";

    case "targets":
      return "Add Target";

    case "social":
      return "Add Campaign";

    case "activities":
      return "Log Activity";
  }
}

function formatDate(
  value: unknown
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(
    String(value)
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function formatInputDate(
  value: unknown
): string {
  if (!value) {
    return "";
  }

  return String(value).slice(
    0,
    10
  );
}

async function parseResponse(
  response: Response
): Promise<any> {
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

function getStats(
  module: ModuleName,
  records: CRMRecord[]
): StatItem[] {
  switch (module) {
    case "leads":
      return [
        {
          label: "Total",
          value: records.length,
        },
        {
          label: "Hot",
          value: records.filter(
            (item) =>
              item.priority === "Hot"
          ).length,
        },
        {
          label: "Interested",
          value: records.filter(
            (item) =>
              item.status ===
              "Interested"
          ).length,
        },
        {
          label: "Qualified",
          value: records.filter(
            (item) =>
              item.status ===
              "Qualified"
          ).length,
        },
      ];

    case "companies":
      return [
        {
          label: "Companies",
          value: records.length,
        },
        {
          label: "Prospects",
          value: records.filter(
            (item) =>
              item.status ===
              "prospect"
          ).length,
        },
        {
          label: "Active",
          value: records.filter(
            (item) =>
              item.status ===
              "active"
          ).length,
        },
        {
          label: "Countries",
          value: new Set(
            records
              .map((item) =>
                String(
                  item.country ??
                    ""
                ).trim()
              )
              .filter(Boolean)
          ).size,
        },
      ];

    case "contacts":
      return [
        {
          label: "Contacts",
          value: records.length,
        },
        {
          label: "Emails",
          value: records.filter(
            (item) =>
              Boolean(
                item.email
              )
          ).length,
        },
        {
          label: "Phones",
          value: records.filter(
            (item) =>
              Boolean(
                item.phone
              )
          ).length,
        },
        {
          label: "Active",
          value: records.filter(
            (item) =>
              item.status ===
              "active"
          ).length,
        },
      ];

    case "deals":
      return [
        {
          label: "Total Deals",
          value: records.length,
        },
        {
          label: "Open",
          value: records.filter(
            (item) =>
              ![
                "Won",
                "Lost",
              ].includes(
                String(
                  item.stage ??
                    ""
                )
              )
          ).length,
        },
        {
          label: "Won",
          value: records.filter(
            (item) =>
              item.stage ===
              "Won"
          ).length,
        },
        {
          label: "Revenue",
          value: `$${records
            .filter(
              (item) =>
                item.stage ===
                "Won"
            )
            .reduce(
              (sum, item) =>
                sum +
                (Number(
                  item.amount
                ) || 0),
              0
            )
            .toLocaleString()}`,
        },
      ];

    case "tasks":
      return [
        {
          label: "Total",
          value: records.length,
        },
        {
          label: "Pending",
          value: records.filter(
            (item) =>
              item.status ===
              "Pending"
          ).length,
        },
        {
          label: "Progress",
          value: records.filter(
            (item) =>
              item.status ===
              "In Progress"
          ).length,
        },
        {
          label: "Completed",
          value: records.filter(
            (item) =>
              item.status ===
              "Completed"
          ).length,
        },
      ];

    case "content":
      return [
        {
          label: "Total",
          value: records.length,
        },
        {
          label: "Published",
          value: records.filter(
            (item) =>
              item.status ===
              "Published"
          ).length,
        },
        {
          label: "Writing",
          value: records.filter(
            (item) =>
              item.status ===
              "Writing"
          ).length,
        },
        {
          label: "Planned",
          value: records.filter(
            (item) =>
              item.status ===
              "Planned"
          ).length,
        },
      ];

    case "targets": {
      const target =
        records.reduce(
          (sum, item) =>
            sum +
            (Number(
              item.target_jobs
            ) || 0),
          0
        );

      const actual =
        records.reduce(
          (sum, item) =>
            sum +
            (Number(
              item.actual_jobs
            ) || 0),
          0
        );

      return [
        {
          label: "Target",
          value: target,
        },
        {
          label: "Actual",
          value: actual,
        },
        {
          label: "Gap",
          value: Math.max(
            target -
              actual,
            0
          ),
        },
        {
          label: "Sources",
          value: new Set(
            records
              .map((item) =>
                String(
                  item.source ??
                    ""
                ).trim()
              )
              .filter(Boolean)
          ).size,
        },
      ];
    }

    case "social":
      return [
        {
          label: "Posts",
          value: records.length,
        },
        {
          label: "Published",
          value: records.filter(
            (item) =>
              item.status ===
              "Published"
          ).length,
        },
        {
          label: "Clicks",
          value: records.reduce(
            (sum, item) =>
              sum +
              (Number(
                item.clicks
              ) || 0),
            0
          ),
        },
        {
          label: "Leads",
          value: records.reduce(
            (sum, item) =>
              sum +
              (Number(
                item.leads_generated
              ) || 0),
            0
          ),
        },
      ];

    case "activities":
      return [
        {
          label: "Total",
          value: records.length,
        },
        {
          label: "Emails",
          value: records.filter(
            (item) =>
              item.activity_type ===
              "Email"
          ).length,
        },
        {
          label: "Calls",
          value: records.filter(
            (item) =>
              item.activity_type ===
              "Call"
          ).length,
        },
        {
          label: "Follow-ups",
          value: records.filter(
            (item) =>
              item.activity_type ===
              "Follow-up"
          ).length,
        },
      ];
  }
}

export default function CRMClient({
  userEmail,
}: CRMClientProps) {
  const [module, setModule] =
    useState<ModuleName>(
      "leads"
    );

  const [records, setRecords] =
    useState<CRMRecord[]>([]);

  const [
    companies,
    setCompanies,
  ] = useState<CRMRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<CRMRecord | null>(
      null
    );

  const [form, setForm] =
    useState<CRMRecord>({
      ...EMPTY_FORMS.leads,
    });

  const [search, setSearch] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
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
            method: "GET",
            credentials:
              "same-origin",
            cache: "no-store",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const result =
        await parseResponse(
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
              method: "GET",
              credentials:
                "same-origin",
              cache: "no-store",
            }
          );

        const result =
          await parseResponse(
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

  function changeModule(
    next: ModuleName
  ) {
    setModule(next);
    setSearch("");
    setFormOpen(false);
    setEditing(null);
    setForm({
      ...EMPTY_FORMS[next],
    });
    setMessage("");
    setError("");
  }

  function openCreate() {
    setEditing(null);
    setForm({
      ...EMPTY_FORMS[module],
    });
    setFormOpen(true);
    setMessage("");
    setError("");
  }

  function openEdit(
    record: CRMRecord
  ) {
    const next: CRMRecord = {
      ...EMPTY_FORMS[module],
      ...record,
    };

    if (module === "content") {
      next.target_month =
        formatInputDate(
          next.target_month
        );

      next.published_at =
        formatInputDate(
          next.published_at
        );
    }

    if (module === "targets") {
      next.target_month =
        formatInputDate(
          next.target_month
        );
    }

    if (module === "deals") {
      next.expected_close_date =
        formatInputDate(
          next.expected_close_date
        );
    }

    if (module === "tasks") {
      next.due_date =
        formatInputDate(
          next.due_date
        );
    }

    setEditing(record);
    setForm(next);
    setFormOpen(true);
    setMessage("");
    setError("");
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm({
      ...EMPTY_FORMS[module],
    });
  }

  async function saveRecord() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const isEditing =
        Boolean(editing?.id);

      const payload: CRMRecord = {
        ...form,
      };

      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      const response =
        await fetch(
          isEditing
            ? `/api/admin/crm/${module}/${editing?.id}`
            : "/api/admin/crm",
          {
            method: isEditing
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
              isEditing
                ? payload
                : {
                    module,
                    data: payload,
                  }
            ),
          }
        );

      const result =
        await parseResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "Failed to save record."
        );
      }

      setMessage(
        isEditing
          ? "Record updated successfully."
          : "Record created successfully."
      );

      closeForm();

      await loadModule(module);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save record."
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
        await parseResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "Failed to delete record."
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
          : "Failed to delete record."
      );
    }
  }

  const stats = getStats(
    module,
    records
  );

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        {/* SMALL ADMIN LINK ONLY */}
        <div className="mb-4">
          <Link
            href="/admin"
            className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← Admin Dashboard
          </Link>
        </div>

        {/* CRM CONTAINER */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* NAVIGATION BELONGS INSIDE CRM */}
          <nav className="overflow-x-auto border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex min-w-max">
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
                      className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
                        active
                          ? "border-indigo-600 text-indigo-600"
                          : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
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
            </div>
          </nav>

          {/* CATEGORY HEADER */}
          <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                  Horizon Jobs CRM
                </p>

                <h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">
                  {
                    getModuleLabel(
                      module
                    )
                  }
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    getDescription(
                      module
                    )
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={
                  openCreate
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                {
                  getAddLabel(
                    module
                  )
                }
              </button>
            </div>
          </div>

          {message && (
            <div className="px-5 pt-4">
              <Alert
                type="success"
                message={
                  message
                }
                onClose={() =>
                  setMessage(
                    ""
                  )
                }
              />
            </div>
          )}

          {error && (
            <div className="px-5 pt-4">
              <Alert
                type="error"
                message={error}
                onClose={() =>
                  setError(
                    ""
                  )
                }
              />
            </div>
          )}

          <div className="p-5">
            {formOpen ? (
              <CRMForm
                module={module}
                form={form}
                companies={
                  companies
                }
                saving={
                  saving
                }
                editing={
                  Boolean(
                    editing
                  )
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
                onCancel={
                  closeForm
                }
              />
            ) : (
              <>
                {/* REAL CATEGORY DASHBOARD */}
                <StatsGrid
                  stats={stats}
                />

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-bold text-slate-950 dark:text-white">
                      {
                        getListTitle(
                          module
                        )
                      }
                    </h2>

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
                    placeholder={`Search ${getModuleLabel(
                      module
                    ).toLowerCase()}...`}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 sm:max-w-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
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
          </div>
        </section>
      </div>
    </main>
  );
}

function getListTitle(
  module: ModuleName
): string {
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
      return "Social Campaigns";

    case "activities":
      return "Activity Log";
  }
}

function StatsGrid({
  stats,
}: {
  stats: StatItem[];
}) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 sm:grid-cols-4 dark:border-slate-800">
      {stats.map(
        (item) => (
          <div
            key={
              item.label
            }
            className="border-r border-b border-slate-200 bg-slate-50 px-5 py-4 last:border-r-0 sm:border-b-0 dark:border-slate-800 dark:bg-slate-950/40"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {item.label}
            </p>

            <p className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
              {
                item.value
              }
            </p>
          </div>
        )
      )}
    </div>
  );
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
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
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
        <thead className="bg-slate-50 dark:bg-slate-950/50">
          <tr>
            {columns.map(
              (column) => (
                <th
                  key={
                    column.key
                  }
                  className="border-b border-slate-200 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800"
                >
                  {
                    column.label
                  }
                </th>
              )
            )}

            <th className="border-b border-slate-200 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800">
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
                          record[
                            column.key
                          ],
                          column.key
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
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
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
          label: "Post",
        },
        {
          key: "title",
          label: "Title",
        },
        {
          key: "status",
          label: "Status",
        },
        {
          key: "impressions",
          label: "Reach",
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
  value: unknown,
  key: string
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
  editing,
  onChange,
  onSave,
  onCancel,
}: {
  module: ModuleName;
  form: CRMRecord;
  companies: CRMRecord[];
  saving: boolean;
  editing: boolean;
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
  ) => (
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
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </label>
  );

  const select = (
    key: string,
    label: string,
    options: string[]
  ) => (
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
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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

  const area = (
    key: string,
    label: string
  ) => (
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
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </label>
  );

  const fields: ReactNode[] =
    [];

  if (module === "leads") {
    fields.push(
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
    module ===
    "companies"
  ) {
    fields.push(
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
    module ===
    "contacts"
  ) {
    fields.push(
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
    fields.push(
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
              (company) =>
                String(
                  company.id ??
                    ""
                )
            )
            .filter(Boolean),
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
    fields.push(
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
    fields.push(
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
    fields.push(
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
    module ===
    "social"
  ) {
    fields.push(
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
          "Recruiter Post",
          "Company Post",
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
    fields.push(
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {fields}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={
            onCancel
          }
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={
            onSave
          }
          disabled={
            saving
          }
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : editing
            ? "Update"
            : "Save"}
        </button>
      </div>
    </div>
  );
}