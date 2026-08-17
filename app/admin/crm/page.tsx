"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

type ModuleName =
  | "leads"
  | "companies"
  | "contacts"
  | "deals"
  | "tasks"
  | "activities"
  | "content"
  | "targets";

type ViewMode =
  | "sheet"
  | "form"
  | "board";

interface RecordData {
  id?: string;
  created_at?: string | null;
  updated_at?: string | null;
  target_jobs?: number;
  actual_jobs?: number;
  [key: string]: any;
}

const MODULE_LABELS: Record<
  ModuleName,
  string
> = {
  leads: "Leads",
  companies: "Companies",
  contacts: "Contacts",
  deals: "Deals",
  tasks: "Tasks",
  activities: "Activities",
  content: "Content",
  targets: "Job Targets",
};

const MODULE_ORDER: ModuleName[] = [
  "leads",
  "companies",
  "contacts",
  "deals",
  "tasks",
  "content",
  "targets",
  "activities",
];

const emptyForms: Record<
  ModuleName,
  RecordData
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

  activities: {
    activity_type: "Note",
    title: "",
    description: "",
    occurred_at: "",
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
};

function formatDate(value: any) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString();
}

function formatDateInput(value: any) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export default function AdminCRMPage() {
  const [module, setModule] =
    useState<ModuleName>("leads");

  const [view, setView] =
    useState<ViewMode>("sheet");

  const [records, setRecords] =
    useState<RecordData[]>([]);

  const [companies, setCompanies] =
    useState<RecordData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState<RecordData | null>(null);

  const [form, setForm] =
    useState<RecordData>(
      emptyForms.leads
    );

  const [search, setSearch] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function loadModule(
    selected: ModuleName
  ) {
    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/crm?module=${selected}`,
          {
            cache: "no-store",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to load CRM."
        );
      }

      setRecords(result.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load CRM."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCompanies() {
    try {
      const response =
        await fetch(
          "/api/admin/crm?module=companies",
          {
            cache: "no-store",
          }
        );

      const result =
        await response.json();

      if (response.ok) {
        setCompanies(
          result.data ?? []
        );
      }
    } catch {
      // Non-critical helper data.
    }
  }

  useEffect(() => {
    loadModule(module);
  }, [module]);

  useEffect(() => {
    loadCompanies();
  }, []);

  function startCreate() {
    setEditing(null);
    setForm({
      ...emptyForms[module],
    });
    setMessage("");
    setError("");
    setView("form");
  }

  function startEdit(
    record: RecordData
  ) {
    setEditing(record);

    const base = {
      ...emptyForms[module],
      ...record,
    };

    if (
      module === "content" ||
      module === "targets"
    ) {
      if (base.target_month) {
        base.target_month =
          formatDateInput(
            base.target_month
          );
      }

      if (base.published_at) {
        base.published_at =
          formatDateInput(
            base.published_at
          );
      }
    }

    if (module === "tasks") {
      base.due_date =
        formatDateInput(
          base.due_date
        );
    }

    if (module === "deals") {
      base.expected_close_date =
        formatDateInput(
          base.expected_close_date
        );
    }

    setForm(base);
    setMessage("");
    setError("");
    setView("form");
  }

  async function saveRecord() {
    setMessage("");
    setError("");

    try {
      const isEditing =
        Boolean(editing?.id);

      const url = isEditing
        ? `/api/admin/crm/${module}/${editing?.id}`
        : "/api/admin/crm";

      const method = isEditing
        ? "PUT"
        : "POST";

      const payload =
        module === "targets"
          ? {
              ...form,
              target_jobs:
                Number(
                  form.target_jobs
                ) || 0,
              actual_jobs:
                Number(
                  form.actual_jobs
                ) || 0,
            }
          : {
              ...form,
            };

      delete payload.created_at;
      delete payload.updated_at;

      const response =
        await fetch(url, {
          method,
          headers: {
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
        });

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to save record."
        );
      }

      setMessage(
        isEditing
          ? "Record updated successfully."
          : "Record created successfully."
      );

      setEditing(null);
      setForm({
        ...emptyForms[module],
      });

      await loadModule(module);
      setView("sheet");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save record."
      );
    }
  }

  async function deleteRecord(
    record: RecordData
  ) {
    if (!record.id) return;

    const confirmed =
      window.confirm(
        "Delete this CRM record permanently?"
      );

    if (!confirmed) return;

    try {
      const response =
        await fetch(
          `/api/admin/crm/${module}/${record.id}`,
          {
            method: "DELETE",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to delete."
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
          : "Failed to delete."
      );
    }
  }

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
    }, [records, search]);

  const metrics =
    useMemo(() => {
      const leadRecords =
        module === "leads"
          ? records
          : [];

      const dealRecords =
        module === "deals"
          ? records
          : [];

      const taskRecords =
        module === "tasks"
          ? records
          : [];

      const contentRecords =
        module === "content"
          ? records
          : [];

      const targetRecords =
        module === "targets"
          ? records
          : [];

      const revenue =
        dealRecords
          .filter(
            (item) =>
              item.stage === "Won"
          )
          .reduce(
            (
              total,
              item
            ) =>
              total +
              (Number(
                item.amount
              ) || 0),
            0
          );

      const contentPublished =
        contentRecords.filter(
          (item) =>
            item.status ===
            "Published"
        ).length;

      const articleTarget =
        contentRecords.length;

      const jobsTarget =
        targetRecords.reduce(
          (
            total,
            item
          ) =>
            total +
            (Number(
              item.target_jobs
            ) || 0),
          0
        );

      const jobsActual =
        targetRecords.reduce(
          (
            total,
            item
          ) =>
            total +
            (Number(
              item.actual_jobs
            ) || 0),
          0
        );

      return {
        leads:
          leadRecords.length,
        deals:
          dealRecords.length,
        pendingTasks:
          taskRecords.filter(
            (item) =>
              item.status !==
                "Completed" &&
              item.status !==
                "Cancelled"
          ).length,
        revenue,
        contentPublished,
        articleTarget,
        jobsTarget,
        jobsActual,
      };
    }, [module, records]);

  return (
    <main className="min-h-screen bg-slate-100 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <Link
          href="/admin"
          className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Admin Dashboard
        </Link>

        <div className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Horizon Jobs
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-slate-950 dark:text-white">
            Business CRM
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Track recruiters, affiliate programs, revenue, follow-ups, content targets, job targets, sources, and daily business activity.
          </p>
        </div>

        {/* KPI STRIP */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
          <Kpi
            label="Leads"
            value={metrics.leads}
          />

          <Kpi
            label="Deals"
            value={metrics.deals}
          />

          <Kpi
            label="Open Tasks"
            value={
              metrics.pendingTasks
            }
          />

          <Kpi
            label="Won Revenue"
            value={`$${metrics.revenue.toLocaleString()}`}
          />

          <Kpi
            label="Published Content"
            value={
              metrics.contentPublished
            }
          />

          <Kpi
            label="Content Records"
            value={
              metrics.articleTarget
            }
          />

          <Kpi
            label="Job Target"
            value={
              metrics.jobsTarget
            }
          />

          <Kpi
            label="Actual Jobs"
            value={
              metrics.jobsActual
            }
          />
        </div>

        {/* MODULE NAV */}
        <div className="mt-8 overflow-x-auto">
          <div className="flex min-w-max gap-2 rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
            {MODULE_ORDER.map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setModule(item);
                    setView("sheet");
                    setEditing(null);
                    setError("");
                    setMessage("");
                  }}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    module === item
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {
                    MODULE_LABELS[
                      item
                    ]
                  }
                </button>
              )
            )}
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder={`Search ${MODULE_LABELS[module].toLowerCase()}...`}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 lg:max-w-md dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setView("sheet")
              }
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                view === "sheet"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              Sheet
            </button>

            <button
              type="button"
              onClick={() =>
                setView("board")
              }
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                view === "board"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              Board
            </button>

            <button
              type="button"
              onClick={
                startCreate
              }
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500"
            >
              + Add
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* FORM */}
        {view === "form" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                  {editing
                    ? "Edit Record"
                    : `Add ${MODULE_LABELS[module].slice(
                        0,
                        -1
                      )}`}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Fill only the information that matters.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setView(
                    "sheet"
                  )
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>

            <CRMForm
              module={module}
              form={form}
              companies={companies}
              onChange={(
                key,
                value
              ) =>
                setForm(
                  (current) => ({
                    ...current,
                    [key]:
                      value,
                  })
                )
              }
              onSave={
                saveRecord
              }
              saving={false}
            />
          </div>
        )}

        {/* SHEET */}
        {view === "sheet" && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {loading ? (
              <div className="p-12 text-center text-sm text-slate-500">
                Loading CRM records...
              </div>
            ) : filteredRecords.length ===
              0 ? (
              <div className="p-12 text-center">
                <p className="text-sm text-slate-500">
                  No records found.
                </p>

                <button
                  type="button"
                  onClick={
                    startCreate
                  }
                  className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white"
                >
                  Add First Record
                </button>
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
                  startEdit
                }
                onDelete={
                  deleteRecord
                }
              />
            )}
          </div>
        )}

        {/* BOARD */}
        {view === "board" && (
          <CRMBoard
            module={module}
            records={
              filteredRecords
            }
            onEdit={
              startEdit
            }
          />
        )}
      </div>
    </main>
  );
}

function Kpi({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
        {value}
      </p>
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
  records: RecordData[];
  onEdit: (
    record: RecordData
  ) => void;
  onDelete: (
    record: RecordData
  ) => void;
}) {
  const columns =
    getColumns(module);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
          <tr>
            {columns.map(
              (column) => (
                <th
                  key={column.key}
                  className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  {column.label}
                </th>
              )
            )}

            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {records.map(
            (record) => (
              <tr
                key={record.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/30"
              >
                {columns.map(
                  (column) => (
                    <td
                      key={column.key}
                      className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300"
                    >
                      {renderCell(
                        column.key,
                        record[column.key]
                      )}
                    </td>
                  )
                )}

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onEdit(
                          record
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onDelete(
                          record
                        )
                      }
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
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
  }
}

function renderCell(
  key: string,
  value: any
) {
  if (!value) {
    return "—";
  }

  if (
    key.includes("date") ||
    key.includes("_at") ||
    key === "target_month"
  ) {
    return formatDate(value);
  }

  return String(value);
}

function CRMBoard({
  module,
  records,
  onEdit,
}: {
  module: ModuleName;
  records: RecordData[];
  onEdit: (
    record: RecordData
  ) => void;
}) {
  if (
    module !== "leads" &&
    module !== "deals" &&
    module !== "tasks" &&
    module !== "content"
  ) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        Board view is available for Leads, Deals, Tasks and Content.
      </div>
    );
  }

  const groups =
    module === "leads"
      ? [
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
      : module === "deals"
      ? [
          "New",
          "Contacted",
          "Interested",
          "Proposal",
          "Negotiation",
          "Won",
          "Lost",
        ]
      : module === "tasks"
      ? [
          "Pending",
          "In Progress",
          "Completed",
          "Cancelled",
        ]
      : [
          "Planned",
          "Writing",
          "Published",
          "Updated",
          "Archived",
        ];

  const statusKey =
    module === "leads"
      ? "status"
      : module === "deals"
      ? "stage"
      : "status";

  return (
    <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
      {groups.map((group) => {
        const items =
          records.filter(
            (record) =>
              record[statusKey] ===
              group
          );

        return (
          <div
            key={group}
            className="w-72 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {group}
              </h3>

              <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800">
                {items.length}
              </span>
            </div>

            <div className="space-y-3">
              {items.map(
                (item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      onEdit(item)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <p className="font-bold text-slate-900 dark:text-white">
                      {item.lead_name ||
                        item.deal_name ||
                        item.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.company ||
                        item.job_title ||
                        item.content_type ||
                        ""}
                    </p>
                  </button>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CRMForm({
  module,
  form,
  companies,
  onChange,
  onSave,
    saving,

}: {
  module: ModuleName;
  form: RecordData;
  companies: RecordData[];
  onChange: (
    key: string,
    value: any
  ) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const field = (
    key: string,
    label: string,
    type = "text",
    placeholder = ""
  ) => (
    <label
      key={key}
      className="block"
    >
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </span>

      <input
        type={type}
        value={
          form[key] ?? ""
        }
        placeholder={
          placeholder
        }
        onChange={(event) =>
          onChange(
            key,
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
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
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </span>

      <textarea
        value={
          form[key] ?? ""
        }
        rows={5}
        onChange={(event) =>
          onChange(
            key,
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </span>

      <select
        value={
          form[key] ?? ""
        }
        onChange={(event) =>
          onChange(
            key,
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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

  const fields: React.ReactNode[] = [];

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
      field("phone", "Phone"),
      field(
        "website",
        "Website",
        "url"
      ),
      field(
        "country",
        "Country"
      ),
      field("city", "City"),
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

  if (module === "companies") {
    fields.push(
      field("name", "Company"),
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
      field("city", "City"),
      field(
        "email",
        "Email",
        "email"
      ),
      field("phone", "Phone"),
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

  if (module === "contacts") {
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
      field("phone", "Phone"),
      field(
        "linkedin_url",
        "LinkedIn",
        "url"
      ),
      field(
        "country",
        "Country"
      ),
      field("city", "City"),
      area(
        "notes",
        "Notes"
      )
    );
  }

  if (module === "deals") {
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
          ...companies.map(
            (item) =>
              `${item.id}::${item.name}`
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

  if (module === "tasks") {
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

  if (module === "activities") {
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
        "Date",
        "datetime-local"
      ),
      area(
        "description",
        "Description"
      )
    );
  }

  if (module === "content") {
    fields.push(
      field(
        "title",
        "Content Title"
      ),
      select(
        "content_type",
        "Type",
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

  if (module === "targets") {
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
      field("city", "City"),
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

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {fields}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={
            onSave
          }
          disabled={
            saving
          }
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          Save Record
        </button>
      </div>
    </>
  );
}