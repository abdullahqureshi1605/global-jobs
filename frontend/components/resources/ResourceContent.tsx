"use client";

type ResourceContentProps = {
  content?: string | null;
  className?: string;
};

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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
        <p className="text-[12px] leading-6 text-[#52657D]">
          No article content is available.
        </p>
      </div>
    );
  }

  const blocks = renderContent(text);
  const seen = new Map<string, number>();

  const headingId = (title: string) => {
    const base = slugifyHeading(title) || "section";
    const count = seen.get(base) || 0;

    seen.set(base, count + 1);

    return count ? `${base}-${count + 1}` : base;
  };

  return (
    <article
      className={`max-w-none text-[12px] leading-6 text-[#334B68] ${className}`}
    >
      {blocks.map((block, index) => {
        const headingMatch = block.match(/^(#{1,3})\s*(.+)$/);

        if (headingMatch) {
          const level = headingMatch[1].length;
          const title = headingMatch[2].trim();
          const id = headingId(title);

          if (level === 1 || level === 2) {
            return (
              <h2
                key={index}
                id={id}
                className="mt-8 text-[16px] font-black leading-6 text-[#071a35] first:mt-0"
              >
                {title}
              </h2>
            );
          }

          return (
            <h3
              key={index}
              id={id}
              className="mt-7 text-[14px] font-black leading-6 text-[#071a35] first:mt-0"
            >
              {title}
            </h3>
          );
        }

        const lines = block.split("\n");

        if (lines.every((line) => /^\s*>\s?/.test(line))) {
          return (
            <blockquote
              key={index}
              className="my-6 border-l-4 border-[#D99A2B] bg-[#FFF8E8] px-5 py-4 text-[12px] italic leading-6 text-[#334B68]"
            >
              {lines.map((line, lineIndex) => (
                <p key={lineIndex} className={lineIndex ? "mt-2" : ""}>
                  {line.replace(/^\s*>\s?/, "")}
                </p>
              ))}
            </blockquote>
          );
        }

        if (/^(Horizon tip|Tip)\s*:/i.test(block)) {
          const match = block.match(/^(Horizon tip|Tip)\s*:\s*([\s\S]*)$/i);
          const body = match?.[2]?.trim() || "";

          return (
            <aside
              key={index}
              className="my-6 rounded-xl border border-[#CFE5DE] bg-[#EDF8F4] px-5 py-4"
            >
              <p className="text-[12px] font-black text-[#16786E]">
                Horizon tip
              </p>

              <p className="mt-1 text-[12px] leading-6 text-[#245D58]">
                {body}
              </p>
            </aside>
          );
        }

        if (/^[-*]\s+/.test(block)) {
          const items = block
            .split("\n")
            .map((line) =>
              line.replace(/^[-*]\s+/, "").trim()
            )
            .filter(Boolean);

          return (
            <ul
              key={index}
              className="my-4 list-disc space-y-2 pl-5 text-[12px] leading-6 text-[#334B68]"
            >
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          );
        }

        return (
          <p
            key={index}
            className="mt-4 whitespace-pre-wrap text-[12px] leading-6 text-[#334B68] first:mt-0"
          >
            {block}
          </p>
        );
      })}
    </article>
  );
}
