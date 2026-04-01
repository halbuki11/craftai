"use client";

import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import katex from "katex";

// ─── KaTeX rendering ──────────────────────────────────

function renderLatex(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      trust: true,
    });
  } catch {
    return tex;
  }
}

function LatexBlock({ tex }: { tex: string }) {
  const html = useMemo(() => renderLatex(tex, true), [tex]);
  return (
    <div
      className="my-3 overflow-x-auto py-2 text-center"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function InlineLatex({ tex }: { tex: string }) {
  const html = useMemo(() => renderLatex(tex, false), [tex]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// ─── Code block ────────────────────────────────────────

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden bg-[#16171b] border border-white/[0.06]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/[0.06] select-none">
        <span className="text-[11px] font-mono text-white/30">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/60 transition-colors"
        >
          {copied ? (
            <><Check className="w-3 h-3" /><span>Copied</span></>
          ) : (
            <><Copy className="w-3 h-3" /><span>Copy</span></>
          )}
        </button>
      </div>
      <pre className="px-3 py-3 overflow-x-auto">
        <code className="text-white/75 font-mono text-[13px] leading-relaxed">{code}</code>
      </pre>
    </div>
  );
}

// ─── Inline markdown + inline LaTeX ────────────────────

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match: bold, italic, inline code, links, inline latex $...$
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`([^`]+?)`)|(\[([^\]]+?)\]\(([^)]+?)\))|(\$([^$]+?)\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      parts.push(<strong key={match.index} className="font-semibold text-white/95">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={match.index} className="italic text-white/70">{match[4]}</em>);
    } else if (match[5]) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/70 font-mono text-[13px]">
          {match[6]}
        </code>
      );
    } else if (match[7]) {
      parts.push(
        <a key={match.index} href={match[9]} target="_blank" rel="noopener noreferrer" className="text-violet-400 underline underline-offset-2 hover:text-violet-300">
          {match[8]}
        </a>
      );
    } else if (match[10]) {
      // Inline LaTeX $...$
      parts.push(<InlineLatex key={match.index} tex={match[11]} />);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// ─── Main renderer ─────────────────────────────────────

export function MarkdownRenderer({ content }: { content: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Display LaTeX block $$...$$
    if (line.trim().startsWith("$$")) {
      const texLines: string[] = [];
      // Check if $$ is on same line (single line block)
      const afterOpen = line.trim().slice(2);
      if (afterOpen.includes("$$")) {
        // Single line: $$formula$$
        const tex = afterOpen.slice(0, afterOpen.indexOf("$$"));
        blocks.push(<LatexBlock key={`latex-${blocks.length}`} tex={tex} />);
        i++;
        continue;
      }
      // Multi-line $$...\n...$$
      if (afterOpen.trim()) texLines.push(afterOpen);
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("$$")) {
        texLines.push(lines[i]);
        i++;
      }
      i++; // skip closing $$
      blocks.push(<LatexBlock key={`latex-${blocks.length}`} tex={texLines.join("\n")} />);
      continue;
    }

    // Code blocks
    if (line.trimStart().startsWith("```")) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(<CodeBlock key={`code-${blocks.length}`} language={language} code={codeLines.join("\n")} />);
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      blocks.push(<h3 key={`h3-${blocks.length}`} className="text-[15px] font-semibold text-white/90 mt-5 mb-1.5">{renderInlineMarkdown(line.slice(4))}</h3>);
      i++; continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(<h2 key={`h2-${blocks.length}`} className="text-base font-semibold text-white/90 mt-6 mb-2">{renderInlineMarkdown(line.slice(3))}</h2>);
      i++; continue;
    }
    if (line.startsWith("# ")) {
      blocks.push(<h1 key={`h1-${blocks.length}`} className="text-lg font-semibold text-white/90 mt-6 mb-2">{renderInlineMarkdown(line.slice(2))}</h1>);
      i++; continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={`hr-${blocks.length}`} className="my-4 border-white/[0.06]" />);
      i++; continue;
    }

    // Unordered list
    if (/^[\s]*[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[\s]*[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[\s]*[-*]\s/, ""));
        i++;
      }
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-2 ml-5 space-y-1 list-disc list-outside marker:text-white/20">
          {items.map((item, j) => <li key={j} className="text-[15px] leading-[1.7] pl-1">{renderInlineMarkdown(item)}</li>)}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push(
        <ol key={`ol-${blocks.length}`} className="my-2 ml-5 space-y-1 list-decimal list-outside marker:text-white/20">
          {items.map((item, j) => <li key={j} className="text-[15px] leading-[1.7] pl-1">{renderInlineMarkdown(item)}</li>)}
        </ol>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <blockquote key={`bq-${blocks.length}`} className="my-3 border-l-2 border-white/[0.12] pl-4 text-white/50 italic">
          {quoteLines.map((ql, j) => <p key={j} className="text-[15px] leading-[1.7]">{renderInlineMarkdown(ql)}</p>)}
        </blockquote>
      );
      continue;
    }

    // Table
    if (line.includes("|") && line.trim().startsWith("|")) {
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim().startsWith("|")) {
        const row = lines[i]
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((cell) => cell.trim());
        // Skip separator rows (---|----|---)
        if (row.every((cell) => /^[-:]+$/.test(cell))) {
          i++;
          continue;
        }
        tableRows.push(row);
        i++;
      }
      if (tableRows.length > 0) {
        const [header, ...body] = tableRows;
        blocks.push(
          <div key={`table-${blocks.length}`} className="my-3 overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  {header.map((cell, j) => (
                    <th key={j} className="px-3 py-2 text-left text-xs font-semibold text-white/60">
                      {renderInlineMarkdown(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, j) => (
                  <tr key={j} className="border-b border-white/[0.04] last:border-0">
                    {row.map((cell, k) => (
                      <td key={k} className="px-3 py-2 text-white/70">
                        {renderInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Empty line
    if (line.trim() === "") { i++; continue; }

    // Paragraph
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-[15px] leading-[1.7] my-1">
        {renderInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{blocks}</div>;
}
