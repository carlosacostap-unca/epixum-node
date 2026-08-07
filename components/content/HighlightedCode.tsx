"use client";

const keywords: Record<string, Set<string>> = {
  javascript: new Set(["const", "let", "var", "function", "return", "if", "else", "for", "while", "async", "await", "import", "from", "export", "class", "new", "true", "false", "null", "undefined"]),
  typescript: new Set(["const", "let", "function", "return", "interface", "type", "extends", "implements", "import", "from", "export", "async", "await", "string", "number", "boolean"]),
  bash: new Set(["if", "then", "else", "fi", "for", "do", "done", "case", "esac", "export"]),
  shell: new Set(["if", "then", "else", "fi", "for", "do", "done", "case", "esac", "export"]),
};

export default function HighlightedCode({ code, language }: { code: string; language: string }) {
  const languageKeywords = keywords[language.toLowerCase()] ?? keywords.javascript;
  const tokens = code.split(/(\/\/[^\n]*|#[^\n]*|'[^'\n]*'|"[^"\n]*"|`[^`]*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g);
  return <code>{tokens.map((token, index) => {
    const className = token.startsWith("//") || token.startsWith("#") ? "text-zinc-500" : /^['"`]/.test(token) ? "text-emerald-300" : /^\d/.test(token) ? "text-amber-300" : languageKeywords.has(token) ? "text-sky-300" : undefined;
    return <span key={index} className={className}>{token}</span>;
  })}</code>;
}
