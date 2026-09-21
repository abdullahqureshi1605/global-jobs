"use client";

type ResourceContentProps = {
  content?: string | null;
  className?: string;
};

function renderContent(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export default function ResourceContent({
  content,
  className = "",
}: ResourceContentProps) {
  const text = String(content || "").trim();

  if (!text) {
    return (
      <div className={className}>
        <p className="text-slate-500">
          No article content is available.
        </p>
      </div>
    );
  }

  const blocks = renderContent(text);

  return (
    <article
      className={`prose prose-slate max-w-none dark:prose-invert ${className}`}
    >
      {blocks.map((block, index) => {
        if (block.startsWith("### ")) {
          return (
            <h3 key={index}>
              {block.replace(/^###\s+/, "")}
            </h3>
          );
        }

        if (block.startsWith("## ")) {
          return (
            <h2 key={index}>
              {block.replace(/^##\s+/, "")}
            </h2>
          );
        }

        if (block.startsWith("# ")) {
          return (
            <h1 key={index}>
              {block.replace(/^#\s+/, "")}
            </h1>
          );
        }

        if (/^[-*]\s+/.test(block)) {
          const items = block
            .split("\n")
            .map((line) => line.replace(/^[-*]\s+/, "").trim())
            .filter(Boolean);

          return (
            <ul key={index}>
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          );
        }

        return <p key={index}>{block}</p>;
      })}
    </article>
  );
}