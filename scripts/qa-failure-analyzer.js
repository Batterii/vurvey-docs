#!/usr/bin/env node

/**
 * QA Failure Analyzer
 *
 * Reads qa-output/qa-report.json, classifies each failure, and produces:
 *   - qa-output/qa-analysis-input.json   (structured data for Claude Code)
 *   - qa-output/qa-failure-analysis.md   (human-readable summary)
 *   - bug-reports/<name>.json            (for CODE_BUG failures)
 *   - doc-fixes/<name>.json              (for DOC_ISSUE failures)
 *
 * Usage:
 *   node scripts/qa-failure-analyzer.js [--qa-report=path/to/report.json]
 */

import fs from "fs/promises";
import path from "path";
import {fileURLToPath} from "url";
import {parseCliArgs, safeName} from "./lib/qa-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

const args = parseCliArgs(process.argv.slice(2));

const defaultReportPath = path.join(repoRoot, "qa-output", "qa-report.json");
const reportPath = typeof args["qa-report"] === "string"
  ? path.resolve(args["qa-report"])
  : defaultReportPath;

const outDir = path.join(repoRoot, "qa-output");
const bugReportsDir = path.join(repoRoot, "bug-reports");
const docFixesDir = path.join(repoRoot, "doc-fixes");

// ─── Test-to-Documentation Mapping ───────────────────────────────

/**
 * Map a test's section/name/route to a documentation file path.
 * Returns the most specific match available.
 * @param {{name: string, section?: string, route?: string}} test
 * @returns {string}
 */
function mapToDocFile(test) {
  const name = (test.name || "").toLowerCase();
  const section = (test.section || "").toLowerCase();
  const route = (test.route || "").toLowerCase();
  const combined = `${name} ${section} ${route}`;

  const mappings = [
    {patterns: ["agent"], file: "docs/guide/agents.md"},
    {patterns: ["campaign", "survey"], file: "docs/guide/campaigns.md"},
    {patterns: ["dataset", "training"], file: "docs/guide/datasets.md"},
    {patterns: ["workflow", "orchestration"], file: "docs/guide/workflows.md"},
    {patterns: ["chat", "home", "home/chat"], file: "docs/guide/home.md"},
    {patterns: ["people", "audience", "population"], file: "docs/guide/people.md"},
    {patterns: ["setting", "workspace"], file: "docs/guide/settings.md"},
    {patterns: ["brand"], file: "docs/guide/branding.md"},
    {patterns: ["reward"], file: "docs/guide/rewards.md"},
    {patterns: ["login", "auth"], file: "docs/guide/login.md"},
    {patterns: ["canvas", "image studio"], file: "docs/guide/canvas-and-image-studio.md"},
    {patterns: ["reel"], file: "docs/guide/reels.md"},
    {patterns: ["integrat"], file: "docs/guide/integrations.md"},
    {patterns: ["forecast"], file: "docs/guide/forecast.md"},
    {patterns: ["admin"], file: "docs/guide/admin.md"},
    {patterns: ["nav"], file: "docs/guide/index.md"},
  ];

  for (const {patterns, file} of mappings) {
    if (patterns.some((p) => combined.includes(p))) return file;
  }

  return "docs/guide/index.md";
}

/**
 * Infer a documentation section name from the test name.
 * @param {string} testName
 * @returns {string}
 */
function inferDocSection(testName) {
  const parts = testName.split(/[:>]/);
  if (parts.length >= 2) return parts[0].trim();
  return "General";
}

// ─── Failure Classification ──────────────────────────────────────

/** @typedef {"DOC_ISSUE" | "CODE_BUG" | "TEST_ISSUE"} Classification */
/** @typedef {"high" | "medium" | "low"} Confidence */

/**
 * Classify a test failure.
 * @param {{name: string, details: string, section?: string, route?: string, selector?: string}} failure
 * @returns {{classification: Classification, confidence: Confidence, suggestedAction: string}}
 */
function classifyFailure(failure) {
  const details = (failure.details || "").toLowerCase();
  const name = (failure.name || "").toLowerCase();

  // ── DOC_ISSUE heuristics ──
  const docIssuePatterns = [
    "not found",
    "no element",
    "no matching",
    "selector",
    "wrong text",
    "wrong label",
    "wrong url",
    "wrong path",
    "expected text",
    "missing element",
    "element not found",
    "text not found",
  ];
  if (docIssuePatterns.some((p) => details.includes(p))) {
    return {
      classification: "DOC_ISSUE",
      confidence: "high",
      suggestedAction: "Update documentation to match current UI selectors/text",
    };
  }

  // ── TEST_ISSUE heuristics ──
  const testIssuePatterns = [
    "timeout",
    "timed out",
    "browser crash",
    "browser disconnected",
    "protocol error",
    "net::err",
    "navigation timeout",
    "session closed",
    "target closed",
    "connection refused",
    "econnrefused",
    "econnreset",
  ];
  if (testIssuePatterns.some((p) => details.includes(p))) {
    return {
      classification: "TEST_ISSUE",
      confidence: "medium",
      suggestedAction: "Investigate test infrastructure — likely flaky or network issue",
    };
  }

  // ── CODE_BUG heuristics ──
  const codeBugPatterns = [
    "click",
    "submit",
    "doesn't work",
    "server error",
    "500",
    "403",
    "401",
    "failed to load",
    "failed to fetch",
    "broken",
    "crash",
    "cannot read",
    "typeerror",
    "referenceerror",
    "unexpected",
    "page broken",
  ];
  if (codeBugPatterns.some((p) => details.includes(p))) {
    return {
      classification: "CODE_BUG",
      confidence: "medium",
      suggestedAction: "Investigate application code — element/behavior mismatch",
    };
  }

  // Default: low-confidence code bug when nothing else matches
  return {
    classification: "CODE_BUG",
    confidence: "low",
    suggestedAction: "Manually investigate — could not auto-classify with confidence",
  };
}

// ─── Severity ────────────────────────────────────────────────────

/**
 * Infer bug severity from test name/details.
 * @param {{name: string, details: string}} failure
 * @returns {"critical" | "high" | "medium" | "low"}
 */
function inferSeverity(failure) {
  const combined = `${failure.name} ${failure.details}`.toLowerCase();
  if (combined.includes("auth") || combined.includes("login")) return "critical";
  if (combined.includes("crash") || combined.includes("500") || combined.includes("broken")) return "high";
  if (combined.includes("navigation") || combined.includes("load")) return "medium";
  return "medium";
}

// ─── Output Generators ──────────────────────────────────────────

/**
 * Build a bug-report JSON object for CODE_BUG failures.
 */
function buildBugReport(failure, classification) {
  return {
    timestamp: new Date().toISOString(),
    target_repo: "vurvey-web-manager",
    severity: inferSeverity(failure),
    title: `QA Failure: ${failure.name}`,
    description: failure.details || "Test failed without detailed error message",
    expected_behavior: "Feature works as documented",
    actual_behavior: failure.details || "Test assertion failed",
    affected_files: [],
    documentation_reference: {
      file: mapToDocFile(failure),
      section: inferDocSection(failure.name),
    },
    suggested_fix: classification.suggestedAction,
    reproduction_steps: failure.reproductionSteps || [],
  };
}

/**
 * Build a doc-fix JSON object for DOC_ISSUE failures.
 */
function buildDocFix(failure, classification) {
  return {
    title: `Doc update needed: ${failure.name}`,
    description: `Documentation may not match current UI. ${failure.details || ""}`.trim(),
    documentation_file: mapToDocFile(failure),
    section: inferDocSection(failure.name),
    current_text: "",
    correct_text: "",
    source: "qa-test-suite",
    qa_failure: {
      test_name: failure.name,
      error: failure.details || null,
      reproSteps: failure.reproductionSteps || [],
    },
  };
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  // 1. Read the QA report
  let reportRaw;
  try {
    reportRaw = await fs.readFile(reportPath, "utf8");
  } catch {
    console.log(`No QA report found at ${reportPath}. Nothing to analyze.`);
    process.exit(0);
  }

  let report;
  try {
    report = JSON.parse(reportRaw);
  } catch (e) {
    console.error(`Failed to parse QA report: ${e.message}`);
    process.exit(1);
  }

  const failures = report.failed || [];
  if (failures.length === 0) {
    console.log("All tests passed — no failures to analyze.");

    // Still write an empty analysis file so downstream tools have a consistent interface
    await fs.mkdir(outDir, {recursive: true});
    const emptyAnalysis = {
      generated_at: new Date().toISOString(),
      qa_report_path: reportPath,
      total_failures: 0,
      failures: [],
      classification_summary: {doc_issues: 0, code_bugs: 0, test_issues: 0},
    };
    await fs.writeFile(
      path.join(outDir, "qa-analysis-input.json"),
      JSON.stringify(emptyAnalysis, null, 2),
    );
    console.log(`Wrote empty analysis to qa-output/qa-analysis-input.json`);
    process.exit(0);
  }

  console.log(`Analyzing ${failures.length} failure(s) from ${reportPath}...\n`);

  // Ensure output directories exist
  await fs.mkdir(outDir, {recursive: true});
  await fs.mkdir(bugReportsDir, {recursive: true});
  await fs.mkdir(docFixesDir, {recursive: true});

  // 2. Classify each failure
  const analysisFailures = [];
  const counts = {doc_issues: 0, code_bugs: 0, test_issues: 0};

  for (const failure of failures) {
    const {classification, confidence, suggestedAction} = classifyFailure(failure);
    const docFile = mapToDocFile(failure);
    const docSection = inferDocSection(failure.name);

    const entry = {
      test_name: failure.name,
      category: failure.section || "unknown",
      error: failure.details || null,
      classification,
      confidence,
      mapped_doc_file: docFile,
      mapped_doc_section: docSection,
      reproduction_steps: failure.reproductionSteps || [],
      screenshot_path: failure.screenshot || null,
      suggested_action: suggestedAction,
    };
    analysisFailures.push(entry);

    // Track counts
    if (classification === "DOC_ISSUE") counts.doc_issues++;
    else if (classification === "CODE_BUG") counts.code_bugs++;
    else counts.test_issues++;

    // 3. Write per-failure output files
    const slug = safeName(failure.name);

    if (classification === "CODE_BUG") {
      const bugReport = buildBugReport(failure, {classification, confidence, suggestedAction});
      const bugPath = path.join(bugReportsDir, `${slug}.json`);
      await fs.writeFile(bugPath, JSON.stringify(bugReport, null, 2));
      console.log(`  [CODE_BUG]  ${failure.name} → ${bugPath}`);
    } else if (classification === "DOC_ISSUE") {
      const docFix = buildDocFix(failure, {classification, confidence, suggestedAction});
      const fixPath = path.join(docFixesDir, `${slug}.json`);
      await fs.writeFile(fixPath, JSON.stringify(docFix, null, 2));
      console.log(`  [DOC_ISSUE] ${failure.name} → ${fixPath}`);
    } else {
      console.log(`  [TEST_ISSUE] ${failure.name} — flagged for review`);
    }
  }

  // 4. Write the structured analysis input for Claude Code
  const analysisInput = {
    generated_at: new Date().toISOString(),
    qa_report_path: reportPath,
    total_failures: failures.length,
    failures: analysisFailures,
    classification_summary: counts,
  };

  const analysisPath = path.join(outDir, "qa-analysis-input.json");
  await fs.writeFile(analysisPath, JSON.stringify(analysisInput, null, 2));

  // 5. Write the human-readable summary
  const mdPath = path.join(outDir, "qa-failure-analysis.md");
  await fs.writeFile(mdPath, buildMarkdownReport(analysisInput, report));

  // 6. Print summary
  console.log("\n" + "=".repeat(60));
  console.log("QA FAILURE ANALYSIS SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total failures:  ${failures.length}`);
  console.log(`  DOC_ISSUE:     ${counts.doc_issues}`);
  console.log(`  CODE_BUG:      ${counts.code_bugs}`);
  console.log(`  TEST_ISSUE:    ${counts.test_issues}`);
  console.log("=".repeat(60));
  console.log(`\nOutputs:`);
  console.log(`  Analysis input: ${analysisPath}`);
  console.log(`  Summary:        ${mdPath}`);
  if (counts.code_bugs > 0) console.log(`  Bug reports:    ${bugReportsDir}/`);
  if (counts.doc_issues > 0) console.log(`  Doc fixes:      ${docFixesDir}/`);
}

// ─── Markdown Report Builder ─────────────────────────────────────

function buildMarkdownReport(analysis, report) {
  const now = new Date().toISOString();
  const {classification_summary: cs} = analysis;

  let md = `# QA Failure Analysis Report\n\n`;
  md += `**Generated**: ${now}\n`;
  md += `**QA Report**: ${analysis.qa_report_path}\n`;
  md += `**Total Tests**: ${report.summary?.totalTests ?? "?"}\n`;
  md += `**Passed**: ${report.summary?.passed ?? "?"}\n`;
  md += `**Failed**: ${analysis.total_failures}\n\n`;

  md += `## Classification Summary\n\n`;
  md += `| Classification | Count |\n|----------------|-------|\n`;
  md += `| DOC_ISSUE (documentation needs update) | ${cs.doc_issues} |\n`;
  md += `| CODE_BUG (application defect) | ${cs.code_bugs} |\n`;
  md += `| TEST_ISSUE (test infrastructure/flaky) | ${cs.test_issues} |\n\n`;

  if (analysis.failures.length === 0) {
    md += `No failures to report.\n`;
    return md;
  }

  md += `## Failure Details\n\n`;

  for (const f of analysis.failures) {
    md += `### ${f.test_name}\n\n`;
    md += `- **Classification**: ${f.classification} (${f.confidence} confidence)\n`;
    md += `- **Category**: ${f.category}\n`;
    md += `- **Mapped doc**: \`${f.mapped_doc_file}\` → ${f.mapped_doc_section}\n`;
    if (f.error) md += `- **Error**: ${f.error}\n`;
    if (f.screenshot_path) md += `- **Screenshot**: \`${f.screenshot_path}\`\n`;
    md += `- **Suggested action**: ${f.suggested_action}\n`;

    if (f.reproduction_steps?.length > 0) {
      md += `\n**Reproduction steps**:\n`;
      for (const step of f.reproduction_steps) {
        md += `${step}\n`;
      }
    }
    md += `\n---\n\n`;
  }

  // Action items
  md += `## Recommended Actions\n\n`;

  const docIssues = analysis.failures.filter((f) => f.classification === "DOC_ISSUE");
  const codeBugs = analysis.failures.filter((f) => f.classification === "CODE_BUG");
  const testIssues = analysis.failures.filter((f) => f.classification === "TEST_ISSUE");

  if (docIssues.length > 0) {
    md += `### Documentation Fixes (${docIssues.length})\n\n`;
    for (const f of docIssues) {
      md += `- [ ] Update \`${f.mapped_doc_file}\` — ${f.test_name}\n`;
    }
    md += `\n`;
  }

  if (codeBugs.length > 0) {
    md += `### Bug Reports (${codeBugs.length})\n\n`;
    for (const f of codeBugs) {
      md += `- [ ] Fix: ${f.test_name} (severity: see bug-reports/)\n`;
    }
    md += `\n`;
  }

  if (testIssues.length > 0) {
    md += `### Test Infrastructure (${testIssues.length})\n\n`;
    for (const f of testIssues) {
      md += `- [ ] Investigate: ${f.test_name}\n`;
    }
    md += `\n`;
  }

  return md;
}

main().catch((e) => {
  console.error(`Fatal error: ${e?.message || String(e)}`);
  process.exit(1);
});
