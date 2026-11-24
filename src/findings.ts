// A finding is either an error, which the agent is told to fix, or a default: the AI look, offered
// as a suggestion and never as a verdict on taste (attentry-design.md, "Stage 4").
export interface Finding {
  rule: string;
  kind: "error" | "default";
  message: string;
  source?: string; // the book or guide the rule comes from
}

export function format(findings: Finding[]): string {
  if (findings.length === 0) return "No findings.";
  const order = { error: 0, default: 1 };
  return [...findings]
    .sort((a, b) => order[a.kind] - order[b.kind])
    .map((f) => `  ${f.kind.padEnd(7)} ${f.message}${f.source ? `\n          (${f.source})` : ""}`)
    .join("\n");
}
