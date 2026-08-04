export function analogyToMarkdown(analogy) {
  const { payload, targetDomain, vibeStyle, concept } = analogy;
  const lines = [];
  lines.push(`# ${payload.analogyTitle}`);
  lines.push("");
  lines.push(`> **Concept:** ${concept}  `);
  lines.push(`> **Target Domain:** ${targetDomain}  `);
  lines.push(`> **Vibe:** ${vibeStyle}`);
  lines.push("");
  lines.push("## Teaching Narrative");
  lines.push("");
  lines.push(payload.narrative);
  lines.push("");
  lines.push("## The Blueprint — Structural Mapping");
  lines.push("");
  lines.push("| Metaphor Counterpart | Anatomical Structure / Process | Functional Match |");
  lines.push("| --- | --- | --- |");
  payload.mapping.forEach((row) => {
    const clean = (s) => (s || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
    lines.push(`| ${clean(row.analogyComponent)} | ${clean(row.biologicalComponent)} | ${clean(row.functionalMatch)} |`);
  });
  lines.push("");
  lines.push("## Formative Assessment — Clicker Questions");
  lines.push("");
  payload.clickerQuestions.forEach((q, i) => {
    lines.push(`### Question ${i + 1}`);
    lines.push("");
    lines.push(q.question);
    lines.push("");
    q.options.forEach((opt) => lines.push(`- ${opt}`));
    lines.push("");
    lines.push(`**Reveal Answer & Lecture Explanation:** ${q.correctAnswer}`);
    lines.push("");
  });
  return lines.join("\n");
}

export function downloadMarkdown(analogy) {
  const md = analogyToMarkdown(analogy);
  const slug = (analogy.payload.analogyTitle || "analogy")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug || "analogy"}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function tableToClipboard(mapping) {
  const rows = mapping.map((r) => `${r.analogyComponent}\t${r.biologicalComponent}\t${r.functionalMatch}`);
  return ["Metaphor Counterpart\tAnatomical Structure / Process\tFunctional Match", ...rows].join("\n");
}
