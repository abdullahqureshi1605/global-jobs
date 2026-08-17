"use client";

import Link from "next/link";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AdminActionMenuProps {
  editHref?: string;
  deleteUrl: string;
  itemName: string;
}

export default function AdminActionMenu({
  editHref,
  deleteUrl,
  itemName,
}: AdminActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  async function handleDelete() {
    const confirmed =
      window.confirm(
        `Delete "${itemName}" permanently? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const response =
        await fetch(deleteUrl, {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
        });

      const result =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to delete."
        );
      }

      window.location.reload();
    } catch (error) {
      console.error(error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete."
      );

      setDeleting(false);
    }
  }

  return (
    <div
      ref={menuRef}
      className="relative flex justify-end"
    >
      <button
        type="button"
        aria-label={`Actions for ${itemName}`}
        aria-expanded={open}
        onClick={() =>
          setOpen((value) => !value)
        }
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {editHref && (
            <Link
              href={editHref}
              onClick={() =>
                setOpen(false)
              }
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          )}

          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}