"use client";

import { FormEvent, useEffect, useState } from "react";

type CommentItem = {
  id: string;
  name: string;
  comment: string;
  created_at: string;
};

type ResourceCommentsProps = {
  resourceId: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function ResourceComments({
  resourceId,
}: ResourceCommentsProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");

  async function loadComments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/career-resources/comments?resourceId=${encodeURIComponent(resourceId)}`,
        { cache: "no-store" }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load comments.");
      }

      setComments(Array.isArray(data?.comments) ? data.comments : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load comments."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, [resourceId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !comment.trim()) {
      setError("Please enter your name and comment.");
      setMessage("");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/career-resources/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceId,
          name,
          email,
          comment,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to submit your comment."
        );
      }

      setName("");
      setEmail("");
      setComment("");

      setMessage(
        data?.message ||
          "Your comment has been published."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit your comment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-10 border-t border-[#E5EAF1] pt-8">
      <div>
        <p className="horizon-eyebrow">COMMUNITY</p>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-[16px] font-black text-[#071a35]">
            Discussion
          </h2>

          <span className="text-[12px] text-[#52657D]">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </span>
        </div>

        <p className="mt-2 text-[12px] leading-6 text-[#52657D]">
          Share your thoughts or ask a question about this career resource. Comments appear immediately.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 rounded-xl border border-[#E5EAF1] bg-[#F7F9FC] p-4 sm:p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="comment-name"
              className="mb-1.5 block text-[11px] font-bold text-[#071a35]"
            >
              Name *
            </label>

            <input
              id="comment-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
              className="w-full rounded-lg border border-[#D5DDE8] bg-white px-3 py-2.5 text-[12px] text-[#071a35] outline-none transition focus:border-[#3E7BFA]"
            />
          </div>

          <div>
            <label
              htmlFor="comment-email"
              className="mb-1.5 block text-[11px] font-bold text-[#071a35]"
            >
              Email
            </label>

            <input
              id="comment-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={160}
              className="w-full rounded-lg border border-[#D5DDE8] bg-white px-3 py-2.5 text-[12px] text-[#071a35] outline-none transition focus:border-[#3E7BFA]"
            />
          </div>
        </div>

        <div className="mt-3">
          <label
            htmlFor="comment-message"
            className="mb-1.5 block text-[11px] font-bold text-[#071a35]"
          >
            Comment *
          </label>

          <textarea
            id="comment-message"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={2000}
            required
            rows={4}
            placeholder="Share your experience or ask a question..."
            className="w-full resize-y rounded-lg border border-[#D5DDE8] bg-white px-3 py-3 text-[12px] leading-6 text-[#071a35] outline-none transition focus:border-[#3E7BFA]"
          />
        </div>

        {error ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[11px] font-medium text-emerald-700">
            {message}
          </div>
        ) : null}

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#3E7BFA] px-5 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#F0BA3D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Post comment"}
          </button>
        </div>
      </form>

      <div className="mt-6">
        {loading ? (
          <div className="py-4 text-[12px] text-[#52657D]">
            Loading comments...
          </div>
        ) : error && comments.length === 0 ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-[11px] text-red-700">
            {error}
          </div>
        ) : comments.length === 0 ? (
          <div className="py-4 text-[12px] text-[#52657D]">
            No approved comments yet. Be the first to share your thoughts.
          </div>
        ) : (
          <div className="divide-y divide-[#E5EAF1]">
            {comments.map((item) => (
              <article key={item.id} className="py-5 first:pt-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF4FF] text-[11px] font-black text-[#2563EB]">
                    {item.name.trim().slice(0, 2).toUpperCase()}
                  </span>

                  <div>
                    <h3 className="text-[12px] font-black text-[#071a35]">
                      {item.name}
                    </h3>

                    <time
                      dateTime={item.created_at}
                      className="text-[11px] text-[#8A9AAF]"
                    >
                      {formatDate(item.created_at)}
                    </time>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-wrap pl-10 text-[12px] leading-6 text-[#334B68]">
                  {item.comment}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
