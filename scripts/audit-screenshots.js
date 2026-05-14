#!/usr/bin/env node

/**
 * Generate a repo-local screenshot audit report and contact sheets.
 *
 * This catches cheap machine-detectable failures, then gives reviewers a
 * compact sheet for visual verification of every committed screenshot.
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {execFile as execFileCb} from "node:child_process";
import {promisify} from "node:util";
import {fileURLToPath} from "node:url";

const execFile = promisify(execFileCb);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const screenshotsRoot = path.join(repoRoot, "docs", "public", "screenshots");
const outputRoot = path.join(repoRoot, "qa-output", "screenshot-audit");
const forbiddenText = [
  /\bloading\b/i,
  /\bplease wait\b/i,
  /\bskeleton\b/i,
  /\bspinner\b/i,
];

async function commandExists(command) {
  try {
    await execFile("bash", ["-lc", `command -v ${command}`], {timeout: 3000});
    return true;
  } catch {
    return false;
  }
}

async function listPngFiles(dir) {
  const entries = await fs.readdir(dir, {withFileTypes: true});
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listPngFiles(full)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      files.push(full);
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
}

async function getPngDimensions(file) {
  const handle = await fs.open(file, "r");
  try {
    const buf = Buffer.alloc(24);
    await handle.read(buf, 0, 24, 0);
    const signature = buf.subarray(0, 8).toString("hex");
    if (signature !== "89504e470d0a1a0a") {
      throw new Error("not a PNG file");
    }
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
    };
  } finally {
    await handle.close();
  }
}

async function sha256(file) {
  const hash = crypto.createHash("sha256");
  hash.update(await fs.readFile(file));
  return hash.digest("hex");
}

async function ocrImage(file, hasTesseract) {
  if (!hasTesseract) return "";
  try {
    const {stdout} = await execFile(
      "tesseract",
      [file, "stdout", "--psm", "6"],
      {timeout: 20000, maxBuffer: 1024 * 1024}
    );
    return stdout || "";
  } catch {
    return "";
  }
}

function groupBySection(files) {
  const groups = new Map();
  for (const file of files) {
    const rel = path.relative(screenshotsRoot, file).replace(/\\/g, "/");
    const section = rel.includes("/") ? rel.split("/")[0] : "_root";
    if (!groups.has(section)) groups.set(section, []);
    groups.get(section).push(file);
  }
  return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

async function generateContactSheets(groups, hasMagick) {
  if (!hasMagick) return [];

  const sheets = [];
  const generateUnlabeledSheet = async (section, files, out) => {
    const tempDir = path.join(outputRoot, `.tmp-${section}`);
    await fs.rm(tempDir, {recursive: true, force: true});
    await fs.mkdir(tempDir, {recursive: true});

    const thumbPaths = [];
    for (let i = 0; i < files.length; i++) {
      const thumb = path.join(tempDir, `thumb-${String(i).padStart(3, "0")}.png`);
      await execFile(
        "magick",
        [files[i], "-resize", "480x270", "-background", "white", "-gravity", "center", "-extent", "480x270", thumb],
        {timeout: 30000, maxBuffer: 1024 * 1024}
      );
      thumbPaths.push(thumb);
    }

    const blank = path.join(tempDir, "blank.png");
    await execFile("magick", ["-size", "480x270", "xc:white", blank], {timeout: 30000, maxBuffer: 1024 * 1024});

    const rowPaths = [];
    for (let i = 0; i < thumbPaths.length; i += 3) {
      const rowInputs = thumbPaths.slice(i, i + 3);
      while (rowInputs.length < 3) rowInputs.push(blank);
      const row = path.join(tempDir, `row-${String(rowPaths.length).padStart(3, "0")}.png`);
      await execFile("magick", [...rowInputs, "+append", row], {timeout: 30000, maxBuffer: 1024 * 1024});
      rowPaths.push(row);
    }

    await execFile("magick", [...rowPaths, "-append", out], {timeout: 120000, maxBuffer: 1024 * 1024});
    await fs.rm(tempDir, {recursive: true, force: true});
  };

  for (const [section, files] of groups) {
    const out = path.join(outputRoot, `${section}.jpg`);
    try {
      await generateUnlabeledSheet(section, files, out);
      sheets.push(out);
    } catch (error) {
      console.warn(`screenshot-audit: could not generate sheet for ${section}: ${error.message}`);
    }
  }
  return sheets;
}

async function writeHtmlIndex(groups) {
  const sections = [];
  for (const [section, files] of groups) {
    const cards = files
      .map((file) => {
        const relFromOutput = path.relative(outputRoot, file).replace(/\\/g, "/");
        const relFromScreenshots = path.relative(screenshotsRoot, file).replace(/\\/g, "/");
        return [
          '<figure>',
          `  <img src="${relFromOutput}" alt="${relFromScreenshots}">`,
          `  <figcaption>${relFromScreenshots}</figcaption>`,
          '</figure>',
        ].join("\n");
      })
      .join("\n");
    sections.push(`<section><h2>${section}</h2><div class="grid">${cards}</div></section>`);
  }

  const html = [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <title>Screenshot Audit</title>',
    '  <style>',
    '    body { font-family: system-ui, sans-serif; margin: 24px; background: #f7f8fb; color: #172033; }',
    '    h1, h2 { margin: 0 0 16px; }',
    '    section { margin: 32px 0; }',
    '    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 18px; }',
    '    figure { margin: 0; padding: 10px; background: white; border: 1px solid #d8deea; border-radius: 6px; }',
    '    img { display: block; width: 100%; height: auto; border: 1px solid #e3e7ef; }',
    '    figcaption { margin-top: 8px; font-size: 13px; overflow-wrap: anywhere; }',
    '  </style>',
    '</head>',
    '<body>',
    '  <h1>Screenshot Audit</h1>',
    `  <p>${new Date().toISOString()}</p>`,
    sections.join("\n"),
    '</body>',
    '</html>',
    '',
  ].join("\n");

  const indexPath = path.join(outputRoot, "index.html");
  await fs.writeFile(indexPath, html, "utf8");
  return indexPath;
}

async function main() {
  await fs.mkdir(outputRoot, {recursive: true});

  const files = await listPngFiles(screenshotsRoot);
  const hasTesseract = await commandExists("tesseract");
  const hasMagick = await commandExists("magick");
  const groups = groupBySection(files);
  const problems = [];
  const rows = [];

  if (files.length === 0) {
    problems.push({path: "docs/public/screenshots", reason: "no screenshots found"});
  }

  for (const file of files) {
    const rel = path.relative(screenshotsRoot, file).replace(/\\/g, "/");
    const stat = await fs.stat(file);
    const dimensions = await getPngDimensions(file);
    const hash = await sha256(file);
    const text = await ocrImage(file, hasTesseract);
    const matchedText = forbiddenText.find((pattern) => pattern.test(text));

    if (stat.size < 1024) {
      problems.push({path: rel, reason: `file is too small (${stat.size} bytes)`});
    }
    if (dimensions.width < 640 || dimensions.height < 360) {
      problems.push({path: rel, reason: `unexpected dimensions ${dimensions.width}x${dimensions.height}`});
    }
    if (matchedText) {
      problems.push({path: rel, reason: `OCR matched ${matchedText}`});
    }

    rows.push({
      path: rel,
      width: dimensions.width,
      height: dimensions.height,
      bytes: stat.size,
      sha256: hash,
    });
  }

  const sheets = await generateContactSheets(groups, hasMagick);
  const htmlIndexPath = await writeHtmlIndex(groups);
  const reportPath = path.join(outputRoot, "report.md");
  const lines = [
    "# Screenshot Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Screenshots: ${rows.length}`,
    `Contact sheets: ${sheets.length}`,
    `OCR enabled: ${hasTesseract ? "yes" : "no"}`,
    "",
    "## Problems",
    "",
    problems.length
      ? problems.map((p) => `- ${p.path}: ${p.reason}`).join("\n")
      : "- None detected by automated checks.",
    "",
    "## Contact Sheets",
    "",
    sheets.length
      ? sheets.map((sheet) => `- ${path.relative(repoRoot, sheet).replace(/\\/g, "/")}`).join("\n")
      : "- ImageMagick not available, so no contact sheets were generated.",
    "",
    "## HTML Review Grid",
    "",
    `- ${path.relative(repoRoot, htmlIndexPath).replace(/\\/g, "/")}`,
    "",
    "## Files",
    "",
    "| Path | Size | SHA-256 |",
    "|---|---:|---|",
    ...rows.map((row) => `| ${row.path} | ${row.width}x${row.height}, ${row.bytes} bytes | ${row.sha256} |`),
    "",
  ];
  await fs.writeFile(reportPath, lines.join("\n"), "utf8");

  console.log(`screenshot-audit: ${rows.length} screenshot(s) checked`);
  console.log(`screenshot-audit: report ${path.relative(repoRoot, reportPath)}`);
  if (sheets.length) {
    console.log(`screenshot-audit: contact sheets ${path.relative(repoRoot, outputRoot)}`);
  }

  if (problems.length) {
    for (const problem of problems) {
      console.error(`screenshot-audit: ${problem.path}: ${problem.reason}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`screenshot-audit: fatal: ${error?.stack || error?.message || String(error)}`);
  process.exit(1);
});
