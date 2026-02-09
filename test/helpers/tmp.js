import fs from "fs/promises";
import os from "os";
import path from "path";

export async function withTempDir(fn) {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), "vurvey-docs-test-"));
  try {
    return await fn(base);
  } finally {
    // Best-effort cleanup; tests should not fail if removal fails.
    await fs.rm(base, {recursive: true, force: true}).catch(() => {});
  }
}

