import path from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const webManagerDir = path.resolve(repoRoot, process.env.QA_WEB_MANAGER_DIR || "vurvey-web-manager");

export default {
  testDir: path.join(webManagerDir, "playwright/tests"),
  outputDir: path.join(webManagerDir, "test-results"),
  workers: 1,
  expect: {
    timeout: 30000,
  },
  timeout: 30000,
  use: {
    browserName: "chromium",
    baseURL: process.env.URL,
    launchOptions: {
      slowMo: 50,
    },
  },
  projects: [
    {name: "setup", testMatch: /.*\.setup\.ts/},
    {
      name: "chromium",
      use: {
        viewport: {width: 1280, height: 720},
        storageState: path.join(webManagerDir, "playwright/.auth/user.json"),
      },
      dependencies: ["setup"],
    },
  ],
};
