import type { ReactNode } from "react";

function renderInline(text: string): ReactNode {
  const parts = text.split(
    /(\*\*[^*]+\*\*)/g
  );

  return parts.map((part, index) => {
    if (
      part.startsWith("**") &&
      part.endsWith("**")
    ) {
      return (
        <strong key={index}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    return (
      <span key={index}>
        {part}
      </span>
    );
  });
}

export default function ResourceContent({
  content,
}: {
  content: string;
}) {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n");

  const elements: ReactNode[] = [];

  let paragraph: string[] = [];
  let listItems: string[] = [];

  function flushParagraph() {
    if (!paragraph.length) {
      return;
    }

    const text = paragraph
      .join(" ")
      .trim();

    if (text) {
      elements.push(
        <p
          key={`paragraph-${elements.length}`}
          className="leading-8 text-slate-700 dark:text-slate-300"
        >
          {renderInline(text)}
        </p>
      );
    }

    paragraph = [];
  }

  function flushList() {
    if (!listItems.length) {
      return;
    }

    elements.push(
      <ul
        key={`list-${elements.length}`}
        className="space-y-2 pl-6 text-slate-700 dark:text-slate-300"
      >
        {listItems.map(
          (item, index) => (
            <li
              key={index}
              className="list-disc leading-7"
            >
              {renderInline(item)}
            </li>
          )
        )}
      </ul>
    );

    listItems = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith("#### ")) {
      flushParagraph();
      flushList();

      elements.push(
        <h4
          key={`h4-${elements.length}`}
          className="mt-8 text-lg font-bold text-slate-900 dark:text-white"
        >
          {renderInline(
            trimmed.slice(5)
          )}
        </h4>
      );

      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();

      elements.push(
        <h3
          key={`h3-${elements.length}`}
          className="mt-10 text-xl font-bold text-slate-900 dark:text-white"
        >
          {renderInline(
            trimmed.slice(4)
          )}
        </h3>
      );

      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();

      elements.push(
        <h2
          key={`h2-${elements.length}`}
          className="mt-12 text-2xl font-extrabold text-slate-900 dark:text-white"
        >
          {renderInline(
            trimmed.slice(3)
          )}
        </h2>
      );

      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();

      elements.push(
        <h2
          key={`h2-main-${elements.length}`}
          className="mt-12 text-2xl font-extrabold text-slate-900 dark:text-white"
        >
          {renderInline(
            trimmed.slice(2)
          )}
        </h2>
      );

      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();

      listItems.push(
        trimmed.slice(2)
      );

      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return (
    <article className="space-y-5">
      {elements}
    </article>
  );
}