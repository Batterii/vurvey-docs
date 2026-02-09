import test from "node:test";
import assert from "node:assert/strict";

import {buildWorkspaceUrl, extractWorkspaceIdFromUrl} from "../scripts/lib/vurvey-url.js";

const UUID = "123e4567-e89b-12d3-a456-426614174000";

for (const {url, expected} of [
  {url: `https://staging.vurvey.dev/${UUID}/agents`, expected: UUID},
  {url: `https://staging.vurvey.dev/${UUID}`, expected: UUID},
  {url: `https://staging.vurvey.dev/${UUID}/`, expected: UUID},
  {url: `https://staging.vurvey.dev/${UUID}/workflow/flows`, expected: UUID},
  {url: `https://staging.vurvey.dev/not-a-uuid/agents`, expected: null},
  {url: "not a url", expected: null},
  {url: "", expected: null},
]) {
  test(`extractWorkspaceIdFromUrl: ${JSON.stringify(url)}`, () => {
    assert.equal(extractWorkspaceIdFromUrl(url), expected);
  });
}

test("extractWorkspaceIdFromUrl: accepts uppercase hex", () => {
  const upper = UUID.toUpperCase();
  assert.equal(extractWorkspaceIdFromUrl(`https://x/${upper}/a`), upper);
});

for (const {baseUrl, workspaceId, routePath, expected} of [
  {baseUrl: "https://staging.vurvey.dev", workspaceId: UUID, routePath: "/agents", expected: `https://staging.vurvey.dev/${UUID}/agents`},
  {baseUrl: "https://staging.vurvey.dev/", workspaceId: UUID, routePath: "/agents", expected: `https://staging.vurvey.dev/${UUID}/agents`},
  {baseUrl: "https://staging.vurvey.dev////", workspaceId: UUID, routePath: "/agents", expected: `https://staging.vurvey.dev/${UUID}/agents`},
  {baseUrl: "https://staging.vurvey.dev", workspaceId: UUID, routePath: "agents", expected: `https://staging.vurvey.dev/${UUID}/agents`},
  {baseUrl: "https://staging.vurvey.dev", workspaceId: null, routePath: "/agents", expected: "https://staging.vurvey.dev/agents"},
  {baseUrl: "https://staging.vurvey.dev/", workspaceId: undefined, routePath: "/agents", expected: "https://staging.vurvey.dev/agents"},
  {baseUrl: "https://staging.vurvey.dev", workspaceId: "", routePath: "/agents", expected: "https://staging.vurvey.dev/agents"},
  {baseUrl: "https://staging.vurvey.dev", workspaceId: UUID, routePath: "/", expected: `https://staging.vurvey.dev/${UUID}/`},
  {baseUrl: "https://staging.vurvey.dev", workspaceId: UUID, routePath: "", expected: `https://staging.vurvey.dev/${UUID}/`},
  {baseUrl: "https://staging.vurvey.dev", workspaceId: UUID, routePath: undefined, expected: `https://staging.vurvey.dev/${UUID}/`},
]) {
  test(`buildWorkspaceUrl: baseUrl=${baseUrl} workspaceId=${workspaceId} routePath=${String(routePath)}`, () => {
    assert.equal(buildWorkspaceUrl({baseUrl, workspaceId, routePath}), expected);
  });
}

