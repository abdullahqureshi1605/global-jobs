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
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  List,
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
  | "activities";

type ViewMode =
  | "dashboard"
  | "sheet"
  | "board";

interface CRMRecord {
  id?: string;
  created_at?: string | null;
  updated_at?: string | null;
  target_jobs?: number;
  actual_jobs?: number;
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

interface ColumnDefinition {
  key: string;
  label: string;
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
    label: "Deals",
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
    key: "activities",
    label: "Activities",
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

  activities: {
    activity_type: "Note",
    title: "",
    description: "",
    occurred_at: "",
  },
};

function getModuleLabel(
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
  if (!value) {
    return "—";
  }

  const date = new Date(
    String(value)
  );

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString();
}

function formatDateInput(
  value: unknown
) {
  if (!value) {
    return "";
  }

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

  const [view, setView] =
    useState<ViewMode>(
      "dashboard"
    );

  // IMPORTANT:
  // Form visibility is intentionally separate
  // from ViewMode. This prevents the old
  // ViewMode/"form" TypeScript error.
  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [records, setRecords] =
    useState<CRMRecord[]>([]);

  const [
    companyRecords,
    setCompanyRecords,
  ] = useState<CRMRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState<CRMRecord | null>(
      null
    );

  const [form, setForm] =
    useState<CRMRecord>(
      EMPTY_FORMS.leads
    );

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const selectedModule =
    getModuleLabel(module);

  async function loadModule(
    selectedModule: ModuleName
  ) {
    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/crm?module=${encodeURIComponent(
            selectedModule
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
        await readResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          result?.error ??
            `Failed to load ${getModuleLabel(
              selectedModule
            )}.`
        );
      }

      setRecords(
        Array.isArray(
          result?.data
        )
          ? result.data
          : []
      );
    } catch (loadError) {
      setError(
        loadError instanceof
          Error
          ? loadError.message
          : "Failed to load CRM data."
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
        await readResponse(
          response
        );

      if (response.ok) {
        setCompanyRecords(
          Array.isArray(
            result?.data
          )
            ? result.data
            : []
        );
      }
    } catch {
      // Supporting data.
    }
  }

  useEffect(() => {
    void loadCompanies();
  }, []);

  useEffect(() => {
    void loadModule(module);
  }, [module]);

  function clearMessages() {
    setError("");
    setMessage("");
  }

  function resetForm() {
    setEditing(null);

    setForm({
      ...EMPTY_FORMS[module],
    });

    setFormOpen(false);
    clearMessages();
  }

  function openCreateForm() {
    setEditing(null);

    setForm({
      ...EMPTY_FORMS[module],
    });

    clearMessages();
    setFormOpen(true);
  }

  function openEditForm(
    record: CRMRecord
  ) {
    const next: CRMRecord = {
      ...EMPTY_FORMS[module],
      ...record,
    };

    if (module === "deals") {
      next.expected_close_date =
        formatDateInput(
          next.expected_close_date
        );
    }

    if (module === "tasks") {
      next.due_date =
        formatDateInput(
          next.due_date
        );
    }

    if (module === "content") {
      next.target_month =
        formatDateInput(
          next.target_month
        );

      next.published_at =
        formatDateInput(
          next.published_at
        );
    }

    if (module === "targets") {
      next.target_month =
        formatDateInput(
          next.target_month
        );
    }

    setEditing(record);
    setForm(next);
    clearMessages();
    setFormOpen(true);
  }

  async function saveRecord() {
    setSaving(true);
    clearMessages();

    try {
      const editingId =
        editing?.id;

      const isEditing =
        Boolean(editingId);

      const url = isEditing
        ? `/api/admin/crm/${module}/${editingId}`
        : "/api/admin/crm";

      const payload: CRMRecord = {
        ...form,
      };

      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      if (
        module === "targets"
      ) {
        payload.target_jobs =
          Number(
            payload.target_jobs
          ) || 0;

        payload.actual_jobs =
          Number(
            payload.actual_jobs
          ) || 0;
      }

      const response =
        await fetch(url, {
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
        });

      const result =
        await readResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "Failed to save CRM record."
        );
      }

      setMessage(
        isEditing
          ? "Record updated successfully."
          : "Record created successfully."
      );

      resetForm();

      await loadModule(module);

      setView("sheet");
    } catch (saveError) {
      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "Failed to save CRM record."
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

    const confirmed =
      window.confirm(
        "Delete this CRM record permanently?"
      );

    if (!confirmed) {
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
            "Failed to delete CRM record."
        );
      }

      setMessage(
        "Record deleted successfully."
      );

      await loadModule(module);
    } catch (deleteError) {
      setError(
        deleteError instanceof
          Error
          ? deleteError.message
          : "Failed to delete CRM record."
      );
    }
  }

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
    setView("dashboard");
    clearMessages();
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
    }, [
      records,
      search,
    ]);

  const dashboard =
    useMemo(() => {
      const leads =
        module === "leads"
          ? records
          : [];

      const deals =
        module === "deals"
          ? records
          : [];

      const tasks =
        module === "tasks"
          ? records
          : [];

      const content =
        module === "content"
          ? records
          : [];

      const targets =
        module === "targets"
          ? records
          : [];

      const wonRevenue =
        deals
          .filter(
            (deal) =>
              deal.stage ===
              "Won"
          )
          .reduce(
            (
              total,
              deal
            ) =>
              total +
              (Number(
                deal.amount
              ) || 0),
            0
          );

      const targetJobs =
        targets.reduce(
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

      const actualJobs =
        targets.reduce(
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
          leads.length,

        hotLeads:
          leads.filter(
            (lead) =>
              lead.priority ===
              "Hot"
          ).length,

        openDeals:
          deals.filter(
            (deal) =>
              ![
                "Won",
                "Lost",
              ].includes(
                String(
                  deal.stage ??
                    ""
                )
              )
          ).length,

        wonRevenue,

        openTasks:
          tasks.filter(
            (task) =>
              ![
                "Completed",
                "Cancelled",
              ].includes(
                String(
                  task.status ??
                    ""
                )
              )
          ).length,

        publishedContent:
          content.filter(
            (item) =>
              item.status ===
              "Published"
          ).length,

        targetJobs,
        actualJobs,
      };
    }, [
      module,
      records,
    ]);

  const showBoard =
    module === "leads" ||
    module === "deals" ||
    module === "tasks" ||
    module === "content";

  return (
    <main className="min-h-screen bg-slate-100 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              ← Admin Dashboard
            </Link>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Horizon Jobs
            </p>

            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Business CRM
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
              Manage leads, companies,
              contacts, deals, tasks,
              content targets, job targets,
              and business activity.
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Signed in as{" "}
              {userEmail}
            </p>
          </div>

          <button
            type="button"
            onClick={
              openCreateForm
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Add{" "}
            {selectedModule.slice(
              0,
              -1
            )}
          </button>
        </header>

        {/* VIEW NAVIGATION */}
        <section className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <ViewButton
            active={
              view ===
              "dashboard"
            }
            onClick={() => {
              setFormOpen(false);
              setView(
                "dashboard"
              );
            }}
            icon={
              LayoutDashboard
            }
            label="Dashboard"
          />

          <ViewButton
            active={
              view === "sheet" &&
              !formOpen
            }
            onClick={() => {
              setFormOpen(false);
              setView("sheet");
            }}
            icon={List}
            label="Sheet"
          />

          <ViewButton
            active={
              view === "board" &&
              !formOpen
            }
            onClick={() => {
              if (!showBoard) {
                return;
              }

              setFormOpen(false);
              setView("board");
            }}
            icon={
              BriefcaseBusiness
            }
            label="Board"
            disabled={!showBoard}
          />

          <ViewButton
            active={formOpen}
            onClick={
              openCreateForm
            }
            icon={Pencil}
            label="Form"
          />
        </section>

        {/* MODULE NAVIGATION */}
        <section className="mb-6 overflow-x-auto">
          <div className="flex min-w-max gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
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
        </section>

        {message && (
          <Alert
            type="success"
            message={message}
            onClose={() =>
              setMessage("")
            }
          />
        )}

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() =>
              setError("")
            }
          />
        )}

        {/* FORM IS CONTROLLED BY formOpen, NOT ViewMode */}
        {formOpen && (
          <section
            id="crm-form"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {editing
                    ? "Edit Record"
                    : "New Record"}
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">
                  {selectedModule}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setView(
                    "sheet"
                  );
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>

            <CRMForm
              module={module}
              form={form}
              companyRecords={
                companyRecords
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
              saving={
                saving
              }
            />
          </section>
        )}

        {/* DASHBOARD */}
        {!formOpen &&
          view ===
            "dashboard" && (
            <DashboardView
              module={module}
              records={records}
              dashboard={
                dashboard
              }
              onModuleChange={(
                nextModule
              ) => {
                setModule(
                  nextModule
                );
                setView(
                  "sheet"
                );
              }}
              onOpenSheet={() =>
                setView("sheet")
              }
              onOpenCreate={
                openCreateForm
              }
              onEdit={
                openEditForm
              }
            />
          )}

        {/* SHEET */}
        {!formOpen &&
          view === "sheet" && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <div>
                  <h2 className="font-bold text-slate-950 dark:text-white">
                    {selectedModule}
                  </h2>

                  <p className="text-xs text-slate-500">
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
                  placeholder={`Search ${selectedModule.toLowerCase()}...`}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 sm:max-w-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {loading ? (
                <div className="p-12 text-center text-sm text-slate-500">
                  Loading...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <CRMTable
                    module={
                      module
                    }
                    records={
                      filteredRecords
                    }
                    onEdit={
                      openEditForm
                    }
                    onDelete={
                      deleteRecord
                    }
                  />
                </div>
              )}
            </section>
          )}

        {/* BOARD */}
        {!formOpen &&
          view === "board" && (
            <>
              {!showBoard ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm text-slate-500">
                    Board view is not
                    available for this
                    module.
                  </p>
                </div>
              ) : (
                <CRMBoard
                  module={
                    module
                  }
                  records={
                    filteredRecords
                  }
                  onEdit={
                    openEditForm
                  }
                />
              )}
            </>
          )}
      </div>
    </main>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  label,
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: ComponentType<{
    className?: string;
  }>;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      } ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : ""
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Alert({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className={`mb-5 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium ${
        type === "success"
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border border-red-200 bg-red-50 text-red-700"
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

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function DashboardView({
  module,
  records,
  dashboard,
  onModuleChange,
  onOpenSheet,
  onOpenCreate,
  onEdit,
}: {
  module: ModuleName;
  records: CRMRecord[];
  dashboard: {
    leads: number;
    hotLeads: number;
    openDeals: number;
    wonRevenue: number;
    openTasks: number;
    publishedContent: number;
    targetJobs: number;
    actualJobs: number;
  };
  onModuleChange: (
    module: ModuleName
  ) => void;
  onOpenSheet: () => void;
  onOpenCreate: () => void;
  onEdit: (
    record: CRMRecord
  ) => void;
}) {
  const recent =
    records.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
        <Metric
          label="Leads"
          value={
            dashboard.leads
          }
          icon={Users}
        />

        <Metric
          label="Hot Leads"
          value={
            dashboard.hotLeads
          }
          icon={BarChart3}
        />

        <Metric
          label="Open Deals"
          value={
            dashboard.openDeals
          }
          icon={
            BriefcaseBusiness
          }
        />

        <Metric
          label="Revenue"
          value={`$${dashboard.wonRevenue.toLocaleString()}`}
          icon={
            CircleDollarSign
          }
        />

        <Metric
          label="Open Tasks"
          value={
            dashboard.openTasks
          }
          icon={
            CheckCircle2
          }
        />

        <Metric
          label="Published"
          value={
            dashboard.publishedContent
          }
          icon={FileText}
        />

        <Metric
          label="Jobs"
          value={`${dashboard.actualJobs}/${dashboard.targetJobs}`}
          icon={Target}
        />
      </div>

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Workspace
          </p>

          <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
            CRM Modules
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {MODULES.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <button
                  key={
                    item.key
                  }
                  type="button"
                  onClick={() => {
                    onModuleChange(
                      item.key
                    );
                    onOpenSheet();
                  }}
                  className={`rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    module ===
                    item.key
                      ? "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-950 dark:text-white">
                    {
                      item.label
                    }
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Manage{" "}
                    {item.label.toLowerCase()}
                  </p>
                </button>
              );
            }
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recent
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                Latest{" "}
                {getModuleLabel(
                  module
                )}
              </h2>
            </div>

            <button
              type="button"
              onClick={
                onOpenSheet
              }
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400"
            >
              View all →
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recent.length ===
            0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No records yet.
              </div>
            ) : (
              recent.map(
                (record) => (
                  <button
                    key={
                      record.id
                    }
                    type="button"
                    onClick={() =>
                      onEdit(
                        record
                      )
                    }
                    className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950 dark:text-white">
                        {String(
                          record.lead_name ??
                            record.deal_name ??
                            record.title ??
                            record.name ??
                            "Untitled"
                        )}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {String(
                          record.company ??
                            record.job_title ??
                            record.content_type ??
                            record.source ??
                            ""
                        )}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs text-slate-400">
                      {formatDate(
                        record.created_at
                      )}
                    </span>
                  </button>
                )
              )
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Operations
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
            Quick Actions
          </h2>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={
                onOpenCreate
              }
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30"
            >
              <Plus className="h-5 w-5 text-indigo-600" />

              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Add Record
                </p>

                <p className="text-xs text-slate-500">
                  Create a new CRM entry.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onModuleChange(
                  "targets"
                );
                onOpenSheet();
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30"
            >
              <Target className="h-5 w-5 text-indigo-600" />

              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Job Targets
                </p>

                <p className="text-xs text-slate-500">
                  Track target versus actual jobs.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onModuleChange(
                  "content"
                );
                onOpenSheet();
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30"
            >
              <FileText className="h-5 w-5 text-indigo-600" />

              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Content Tracking
                </p>

                <p className="text-xs text-slate-500">
                  Track article targets and publishing.
                </p>
              </div>
            </button>
          </div>
        </section>
      </div>
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
    <table className="w-full min-w-[900px] text-left">
      <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
        <tr>
          {columns.map(
            (column) => (
              <th
                key={
                  column.key
                }
                className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                {
                  column.label
                }
              </th>
            )
          )}

          <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
            Actions
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {records.length ===
        0 ? (
          <tr>
            <td
              colSpan={
                columns.length +
                1
              }
              className="px-6 py-16 text-center text-sm text-slate-500"
            >
              No records found.
            </td>
          </tr>
        ) : (
          records.map(
            (record) => (
              <tr
                key={
                  record.id
                }
                className="transition hover:bg-slate-50 dark:hover:bg-slate-800/30"
              >
                {columns.map(
                  (
                    column
                  ) => (
                    <td
                      key={
                        column.key
                      }
                      className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300"
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

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onEdit(
                          record
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
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
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
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
  );
}

function getColumns(
  module: ModuleName
): ColumnDefinition[] {
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

function CRMBoard({
  module,
  records,
  onEdit,
}: {
  module: ModuleName;
  records: CRMRecord[];
  onEdit: (
    record: CRMRecord
  ) => void;
}) {
  let groups: string[] = [];

  if (module === "leads") {
    groups = [
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
    ];
  }

  if (module === "deals") {
    groups = [
      "New",
      "Contacted",
      "Interested",
      "Proposal",
      "Negotiation",
      "Won",
      "Lost",
    ];
  }

  if (module === "tasks") {
    groups = [
      "Pending",
      "In Progress",
      "Completed",
      "Cancelled",
    ];
  }

  if (module === "content") {
    groups = [
      "Planned",
      "Writing",
      "Published",
      "Updated",
      "Archived",
    ];
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500">
          Board view is not
          available for this module.
        </p>
      </div>
    );
  }

  const statusKey =
    module === "deals"
      ? "stage"
      : "status";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {groups.map(
        (group) => {
          const items =
            records.filter(
              (record) =>
                String(
                  record[
                    statusKey
                  ] ?? ""
                ) === group
            );

          return (
            <section
              key={group}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">
                  {group}
                </h3>

                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500 shadow-sm dark:bg-slate-800">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3">
                {items.length ===
                0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400 dark:border-slate-700">
                    Empty
                  </div>
                ) : (
                  items.map(
                    (item) => (
                      <button
                        key={
                          item.id
                        }
                        type="button"
                        onClick={() =>
                          onEdit(
                            item
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900"
                      >
                        <p className="font-bold text-slate-900 dark:text-white">
                          {String(
                            item.lead_name ??
                              item.deal_name ??
                              item.title ??
                              "Untitled"
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {String(
                            item.job_title ??
                              item.company ??
                              item.content_type ??
                              item.source ??
                              ""
                          )}
                        </p>
                      </button>
                    )
                  )
                )}
              </div>
            </section>
          );
        }
      )}
    </div>
  );
}

function CRMForm({
  module,
  form,
  companyRecords,
  onChange,
  onSave,
  saving,
}: {
  module: ModuleName;
  form: CRMRecord;
  companyRecords: CRMRecord[];
  onChange: (
    key: string,
    value: unknown
  ) => void;
  onSave: () => void;
  saving: boolean;
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
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
    module === "companies"
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
    module === "contacts"
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
          ...companyRecords.map(
            (
              company
            ) =>
              String(
                company.id ??
                  ""
              )
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

  if (module === "content") {
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
    <div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {fields}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Record"}
        </button>
      </div>
    </div>
  );
}