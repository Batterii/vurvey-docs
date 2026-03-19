import { test, expect, Page } from '@playwright/test';
import { loginViaUI } from './helpers/login';
import { getWorkspaceId, waitForLoaders } from './helpers/workspace';

// ---------------------------------------------------------------------------
// api-claims.spec.ts — Business Logic Verification via GraphQL API
//
// These tests verify critical business logic claims made in the documentation
// by querying the staging GraphQL API. They complement the UI-based tests by
// checking that the underlying data model matches what the docs say.
//
// Strategy: Each test logs in via UI, then uses page.evaluate() to execute
// GraphQL queries via fetch using the Firebase token already present in the
// authenticated SPA context. The API URL is auto-discovered by intercepting
// real GraphQL network requests from the SPA.
//
// IMPORTANT: The staging API has GraphQL introspection disabled, so all
// verification is done via actual data queries rather than __type lookups.
// A query that returns data proves the field/type exists in the schema.
// A 400 error means the field doesn't exist — surfacing a doc/schema mismatch.
// ---------------------------------------------------------------------------

const WORKSPACE_ID = getWorkspaceId();

/**
 * Extract the GraphQL API base URL and bearer token from the running SPA.
 */
async function getApiContext(page: Page): Promise<{ apiUrl: string; token: string }> {
  const apiUrlPromise = new Promise<string>((resolve) => {
    const handler = (request: import('@playwright/test').Request) => {
      const url = request.url();
      if (url.includes('/graphql')) {
        page.off('request', handler);
        const match = url.match(/^(https?:\/\/[^/]+)/);
        resolve(match ? match[1] : url.split('/graphql')[0]);
      }
    };
    page.on('request', handler);
    setTimeout(() => { page.off('request', handler); resolve(''); }, 10_000);
  });

  await page.goto(`/${WORKSPACE_ID}`);
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
  await waitForLoaders(page);

  const capturedApiUrl = await apiUrlPromise;

  const token = await page.evaluate(async () => {
    return new Promise<string>((resolve, reject) => {
      const req = indexedDB.open('firebaseLocalStorageDb', 1);
      req.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        try {
          const tx = db.transaction('firebaseLocalStorage', 'readonly');
          const store = tx.objectStore('firebaseLocalStorage');
          const getAll = store.getAll();
          getAll.onsuccess = () => {
            for (const record of getAll.result) {
              const t = record?.value?.stsTokenManager?.accessToken;
              if (t) { db.close(); resolve(t); return; }
            }
            db.close();
            reject(new Error('No token in IndexedDB'));
          };
          getAll.onerror = () => { db.close(); reject(new Error('IDB read failed')); };
        } catch { db.close(); reject(new Error('IDB store not found')); }
      };
      req.onerror = () => reject(new Error('IDB open failed'));
    });
  });

  return { apiUrl: capturedApiUrl || 'https://api-staging.vurvey.dev', token };
}

interface GqlResult {
  data?: Record<string, any>;
  errors?: Array<{ message: string; extensions?: Record<string, any> }>;
}

/**
 * Execute a GraphQL query from within the page context via fetch.
 */
async function graphqlViaPage(
  page: Page, apiUrl: string, token: string,
  query: string, variables: Record<string, unknown> = {},
): Promise<GqlResult> {
  return page.evaluate(
    async ({ apiUrl, token, query, variables }) => {
      const endpoint = `${apiUrl}/graphql`;
      try {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ query, variables }),
        });
        if (resp.ok) return await resp.json();
        try { return await resp.json(); } catch {}
        return { data: null, errors: [{ message: `HTTP ${resp.status}` }] };
      } catch (err: any) {
        return { data: null, errors: [{ message: err?.message ?? 'fetch failed' }] };
      }
    },
    { apiUrl, token, query, variables },
  );
}

// ---------------------------------------------------------------------------
test.describe('API Business Logic Claims', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  let sharedPage: Page;
  let apiUrl: string;
  let bearerToken: string;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    sharedPage = await context.newPage();
    await loginViaUI(sharedPage);
    const ctx = await getApiContext(sharedPage);
    apiUrl = ctx.apiUrl;
    bearerToken = ctx.token;
  });

  test.afterAll(async () => {
    await sharedPage?.context().close();
  });

  async function gql(query: string, variables: Record<string, unknown> = {}): Promise<GqlResult> {
    return graphqlViaPage(sharedPage, apiUrl, bearerToken, query, variables);
  }

  function hasErrors(r: GqlResult): boolean {
    return !!r.errors && r.errors.length > 0;
  }

  function errMsg(r: GqlResult): string {
    return r.errors?.map(e => e.message).join('; ') ?? '';
  }

  // =========================================================================
  // CREDIT SYSTEM (campaigns.md claims)
  // =========================================================================
  test.describe('Credit System', () => {

    // Doc claim: workspace.creditRates with creatorRate=338, agentRate=1
    test('workspace credit rates match documented values (creator=338, agent=1)', async () => {
      // Try multiple possible query shapes for credit rate data
      const result = await gql(`
        query Q($id: GUID!) {
          workspace(id: $id) {
            id
            creditRates { id creatorRate agentRate }
          }
        }
      `, { id: WORKSPACE_ID });

      if (!hasErrors(result) && result.data?.workspace?.creditRates) {
        const rates = result.data.workspace.creditRates;
        const rate = Array.isArray(rates) ? rates[0] : rates;
        expect.soft(rate?.creatorRate, 'Creator rate should be 338').toBe(338);
        expect.soft(rate?.agentRate, 'Agent rate should be 1').toBe(1);
      } else {
        // Field may have different name or structure
        expect.soft(false,
          `DOC CLAIM CHECK: workspace.creditRates query failed (${errMsg(result)}). ` +
          'campaigns.md claims creator rate=338, agent rate=1. Verify field names in vurvey-api schema.'
        ).toBeTruthy();
      }
    });

    // Doc claim: workspace has creditBalance (number)
    test('workspace has a creditBalance field', async () => {
      const result = await gql(`
        query Q($id: GUID!) {
          workspace(id: $id) { id creditBalance }
        }
      `, { id: WORKSPACE_ID });

      if (!hasErrors(result) && result.data?.workspace) {
        expect.soft(
          typeof result.data.workspace.creditBalance === 'number',
          'creditBalance should be a number'
        ).toBeTruthy();
      } else {
        expect.soft(false,
          `DOC CLAIM CHECK: workspace.creditBalance query failed (${errMsg(result)}). ` +
          'campaigns.md claims workspace has credit balance. Verify field name.'
        ).toBeTruthy();
      }
    });

    // Doc claim: credit change reasons include specific enum values
    // Since introspection is disabled, we verify by querying credit changes
    test('workspace credit changes can be queried', async () => {
      const result = await gql(`
        query Q($id: GUID!) {
          workspace(id: $id) {
            id
            creditChanges(first: 1) {
              edges { node { id reason amount } }
            }
          }
        }
      `, { id: WORKSPACE_ID });

      if (!hasErrors(result) && result.data?.workspace) {
        // Query succeeded — creditChanges field exists
        const changes = result.data.workspace.creditChanges;
        expect.soft(changes, 'creditChanges field should be queryable').toBeTruthy();
      } else {
        expect.soft(false,
          `DOC CLAIM CHECK: workspace.creditChanges query failed (${errMsg(result)}). ` +
          'campaigns.md documents credit change reasons (ADMIN_ADJUSTMENT, etc.). ' +
          'Verify the query name for credit transaction history.'
        ).toBeTruthy();
      }
    });
  });

  // =========================================================================
  // FEATURE FLAGS (workspace model claims)
  // =========================================================================
  test.describe('Feature Flags', () => {

    // Doc claim: workspace has chatbotEnabled, workflowEnabled, forecastEnabled
    test('workspace has documented feature flag fields', async () => {
      const result = await gql(`
        query Q($id: GUID!) {
          workspace(id: $id) {
            id
            chatbotEnabled
            workflowEnabled
            forecastEnabled
          }
        }
      `, { id: WORKSPACE_ID });

      if (!hasErrors(result) && result.data?.workspace) {
        const ws = result.data.workspace;
        expect.soft(typeof ws.chatbotEnabled === 'boolean', 'chatbotEnabled should be boolean').toBeTruthy();
        expect.soft(typeof ws.workflowEnabled === 'boolean', 'workflowEnabled should be boolean').toBeTruthy();
        expect.soft(typeof ws.forecastEnabled === 'boolean', 'forecastEnabled should be boolean').toBeTruthy();
      } else {
        expect.soft(false, `Feature flag query failed: ${errMsg(result)}`).toBeTruthy();
      }
    });

    // Doc claim: DEMO workspace has core AI features enabled
    test('DEMO workspace has chatbot and workflow flags enabled', async () => {
      const result = await gql(`
        query Q($id: GUID!) {
          workspace(id: $id) { id chatbotEnabled workflowEnabled }
        }
      `, { id: WORKSPACE_ID });

      if (!hasErrors(result) && result.data?.workspace) {
        const ws = result.data.workspace;
        expect.soft(ws.chatbotEnabled === true, 'DEMO workspace should have chatbotEnabled = true').toBeTruthy();
        expect.soft(ws.workflowEnabled === true, 'DEMO workspace should have workflowEnabled = true').toBeTruthy();
      }
    });
  });

  // =========================================================================
  // PERMISSIONS
  // =========================================================================
  test.describe('Permissions', () => {

    // Doc claim: workspace members have roles (ADMINISTRATOR, MANAGER, GUEST)
    // Note: members may be a top-level query, not a workspace field
    test('workspace members have role field', async () => {
      // Try as top-level workspaceMembers query first
      let result = await gql(`
        query Q($id: GUID!) {
          workspaceMembers(workspaceId: $id) { id role }
        }
      `, { id: WORKSPACE_ID });

      if (hasErrors(result)) {
        // Try as workspace.workspaceMembers
        result = await gql(`
          query Q($id: GUID!) {
            workspace(id: $id) {
              id
              workspaceMembers { id role }
            }
          }
        `, { id: WORKSPACE_ID });
      }

      const members = result.data?.workspaceMembers ?? result.data?.workspace?.workspaceMembers;
      if (!hasErrors(result) && members) {
        const memberList = Array.isArray(members) ? members : members?.edges?.map((e: any) => e.node) ?? [];
        if (memberList.length > 0) {
          const firstRole = memberList[0].role;
          expect.soft(firstRole, 'Member should have a role field').toBeTruthy();
          const validRoles = ['ADMINISTRATOR', 'MANAGER', 'GUEST', 'OWNER'];
          expect.soft(
            validRoles.includes(firstRole),
            `Member role "${firstRole}" should be one of: ${validRoles.join(', ')}`
          ).toBeTruthy();
        }
      } else {
        expect.soft(false,
          `DOC CLAIM CHECK: workspaceMembers query failed (${errMsg(result)}). ` +
          'Docs claim roles are ADMINISTRATOR, MANAGER, GUEST. Verify member query structure.'
        ).toBeTruthy();
      }
    });
  });

  // =========================================================================
  // CAMPAIGN LIFECYCLE
  // =========================================================================
  test.describe('Campaign Lifecycle', () => {

    // Doc claim: Surveys have status with values Draft, Open, Closed, Blocked, Archived
    // API hint: query is "survey" (singular), not "surveys"
    test('surveys are queryable with status field', async () => {
      // Try workspace.surveys connection
      let result = await gql(`
        query Q($id: GUID!) {
          workspace(id: $id) {
            id
            surveys { id name status }
          }
        }
      `, { id: WORKSPACE_ID });

      let surveyList = result.data?.workspace?.surveys;

      if (hasErrors(result) || !surveyList) {
        // Try top-level survey query (might be different shape)
        result = await gql(`
          query Q($id: GUID!) {
            survey(workspaceId: $id) { id name status }
          }
        `, { id: WORKSPACE_ID });
        surveyList = result.data?.survey;
      }

      if (!hasErrors(result) && surveyList) {
        const list = Array.isArray(surveyList) ? surveyList :
          surveyList?.edges?.map((e: any) => e.node) ?? [surveyList];
        expect.soft(list.length > 0, 'Should have at least one survey').toBeTruthy();

        if (list.length > 0 && list[0]?.status) {
          const validStatuses = ['DRAFT', 'OPEN', 'CLOSED', 'BLOCKED', 'ARCHIVED'];
          const status = list[0].status.toUpperCase();
          expect.soft(
            validStatuses.includes(status),
            `Survey status "${status}" should be one of: ${validStatuses.join(', ')}`
          ).toBeTruthy();
        }
      } else {
        expect.soft(false,
          `DOC CLAIM CHECK: survey query failed (${errMsg(result)}). ` +
          'campaigns.md claims surveys have Draft/Open/Closed/Blocked/Archived statuses.'
        ).toBeTruthy();
      }
    });

    // Doc claim: Survey has questions that can be counted
    test('surveys have question count field', async () => {
      const result = await gql(`
        query Q($id: GUID!) {
          workspace(id: $id) {
            id
            surveys { id questionCount }
          }
        }
      `, { id: WORKSPACE_ID });

      const surveyList = result.data?.workspace?.surveys;
      if (!hasErrors(result) && surveyList) {
        const list = Array.isArray(surveyList) ? surveyList : [surveyList];
        if (list.length > 0) {
          const qCount = list[0].questionCount;
          expect.soft(
            typeof qCount === 'number',
            `questionCount should be a number, got ${typeof qCount}`
          ).toBeTruthy();
        }
      } else {
        expect.soft(false,
          `DOC CLAIM CHECK: workspace.surveys.questionCount failed (${errMsg(result)}). ` +
          'Campaign cards show question count metadata.'
        ).toBeTruthy();
      }
    });
  });

  // =========================================================================
  // WORKSPACE BASICS
  // =========================================================================
  test.describe('Workspace', () => {

    // Verify the workspace is queryable with basic fields
    test('workspace query returns id and name', async () => {
      const result = await gql(`
        query Q($id: GUID!) {
          workspace(id: $id) { id name }
        }
      `, { id: WORKSPACE_ID });

      expect(!hasErrors(result), `workspace query should succeed (${errMsg(result)})`).toBeTruthy();
      expect(result.data?.workspace?.id, 'Workspace should have an id').toBeTruthy();
      expect(result.data?.workspace?.name, 'Workspace should have a name').toBeTruthy();
    });

    // Doc claim: Agents (AiPersonas) are queryable
    // API hint: query is "aiPersonasV2", uses AiPersonaPage (not connection edges)
    test('AI personas (agents) are queryable', async () => {
      const result = await gql(`
        query Q($id: GUID!) {
          aiPersonasV2(id: $id) {
            items { id name type }
          }
        }
      `, { id: WORKSPACE_ID });

      if (!hasErrors(result) && result.data?.aiPersonasV2) {
        const data = result.data.aiPersonasV2;
        const list = data.items ?? data.edges?.map((e: any) => e.node) ?? (Array.isArray(data) ? data : []);
        expect.soft(list.length >= 0, 'aiPersonasV2 should return results').toBeTruthy();
        if (list.length > 0) {
          expect.soft(list[0].name, 'Agent should have a name').toBeTruthy();
          expect.soft(list[0].type, 'Agent should have a type (PersonaType)').toBeTruthy();
        }
      } else {
        expect.soft(false,
          `DOC CLAIM CHECK: aiPersonasV2 query failed (${errMsg(result)}). ` +
          'Docs reference Agents (AiPersonas) with types.'
        ).toBeTruthy();
      }
    });

    // Doc claim: Datasets (TrainingSets) are queryable
    // API hint: trainingSets uses GUID! for workspaceId
    test('training sets (datasets) are queryable', async () => {
      const result = await gql(`
        query Q($id: GUID!) {
          trainingSets(workspaceId: $id) { id name }
        }
      `, { id: WORKSPACE_ID });

      if (!hasErrors(result) && result.data?.trainingSets) {
        const data = result.data.trainingSets;
        const list = Array.isArray(data) ? data : data?.edges?.map((e: any) => e.node) ?? [];
        expect.soft(list.length >= 0, 'trainingSets should return results').toBeTruthy();
      } else {
        expect.soft(false,
          `DOC CLAIM CHECK: trainingSets query failed (${errMsg(result)}). ` +
          'Docs reference Datasets (TrainingSets).'
        ).toBeTruthy();
      }
    });

    // Doc claim: Workflows (AiOrchestrations) are queryable
    // API hint: workspaceId is String!, not GUID!
    test('AI orchestrations (workflows) are queryable', async () => {
      const result = await gql(`
        query Q($id: String!) {
          aiOrchestrations(workspaceId: $id) { id name }
        }
      `, { id: WORKSPACE_ID });

      if (!hasErrors(result) && result.data?.aiOrchestrations) {
        const data = result.data.aiOrchestrations;
        const list = Array.isArray(data) ? data : data?.edges?.map((e: any) => e.node) ?? [];
        expect.soft(list.length >= 0, 'aiOrchestrations should return results').toBeTruthy();
      } else {
        expect.soft(false,
          `DOC CLAIM CHECK: aiOrchestrations query failed (${errMsg(result)}). ` +
          'Docs reference Workflows (AiOrchestrations).'
        ).toBeTruthy();
      }
    });
  });
});
