# Vurvey Platform - Comprehensive QA Feature Map

> Compiled from multi-agent exploration of the vurvey-web-manager and vurvey-api codebases.
> Total Routes: ~115+ unique navigable paths
> Total GraphQL Operations: ~200+ (queries, mutations, subscriptions)

---

## Table of Contents

1. [Chat/Conversations](#1-chatconversations)
2. [Agents/Personas](#2-agentspersonas)
3. [Workflows/Orchestration](#3-workflowsorchestration)
4. [Campaigns/Surveys](#4-campaignssurveys)
5. [Datasets/Training Sets](#5-datasetstraining-sets)
6. [Workspace Settings](#6-workspace-settings)
7. [Authentication](#7-authentication)
8. [Canvas & Branding](#8-canvas--branding)
9. [Navigation & Routing](#9-navigation--routing)
10. [Shared UI Components](#10-shared-ui-components)
11. [Workspace Backend](#11-workspace-backend)
12. [Secondary Domains](#12-secondary-domains)

---

## 1. Chat/Conversations

**Terminology**: Chat/Conversation (UI) = `ChatConversation` (API)

### Routes

| Route | Component | Notes |
|-------|-----------|-------|
| `/:workspaceId` (index) | `CanvasPage` | Home / AI Chat Canvas; requires `chatbotEnabled` |
| `/:workspaceId/workflow/conversation` | `CanvasPage` | Workflow conversation; uses `?canvasId=UUID` |

### GraphQL Operations

#### Mutations (12)
| Operation | Purpose |
|-----------|---------|
| `chatCreateConversation` | Create new conversation with sources, persona, mode |
| `chatSendQuestionV2` | Send message (primary) with full tool/source/model params |
| `chatSendQuestion` | Send message (legacy V1) |
| `chatUpdateConversation` | Update conversation properties (name, sources, mode) |
| `chatDeleteConversation` | Delete conversation |
| `chatLikeMessage` | Like a message |
| `chatDislikeMessage` | Dislike a message |
| `chatRemoveMessageReaction` | Remove like/dislike |
| `chatDeleteMessagePair` | Delete user+assistant message pair |
| `chatGetConversationHistoryAsMarkdown` | Export as markdown |
| `submitChatFeedback` | Submit detailed feedback (type, category, comment) |
| `createChatDocFile` | Upload document for chat context |

#### Queries (9)
| Operation | Purpose |
|-----------|---------|
| `chatConversations` | List conversations (legacy) |
| `paginatedChatConversations` | Paginated list (primary, with filter/sort/cursor) |
| `chatConversationsCount` | Total count |
| `chatConversation` | Single conversation with messages, sources, persona |
| `chatMessageGrounding` | Get grounding/citation data for a message |
| `chatConversationAttachmentsRevokedPermissions` | Check revoked permissions |
| `availableManualToolGroups` | Get tool group metadata |
| `chatMessageFeedback` | Get feedback for a message |
| `chatConversationFeedbackStats` | Aggregated feedback stats |

#### Subscriptions (3)
| Operation | Purpose |
|-----------|---------|
| `chatConversationUpdates` | Real-time chat events (10 event types) |
| `orchestrationUpdates` | Workflow events (related) |
| `workspaceUpdates` | Workspace-level events |

### Key Components

| Component | Purpose |
|-----------|---------|
| `ChatConversationContextProvider` | Main state (conversation, messages, actions) |
| `ChatDrawerContextProvider` | Drawer state (agent/sources/tools panels) |
| `ChatScrollContextProvider` | Scroll-to-bottom behavior |
| `ChatView` | Two layout modes: HOME (welcome) and CHAT (active) |
| `ChatBubble` | Message input component |
| `ChatNamePill` | Conversation name display |
| `ChatWelcomeHeader` | Welcome screen with Perlin Sphere |
| `PromptShowcase` | Pre-built prompt cards on home screen |

### Models/Types

**`ChatConversation`** (table: `chat_conversations`):
- Soft-deletable, OpenFGA permissions
- Fields: `id`, `name`, `isPreview`, `mode`, `workspaceId`, `userId`, `aiPersonaId`, `lastMessageAt`
- Relations: user, workspace, messages, trainingSets (M2M), videos (M2M), audios (M2M), files (M2M), aiPersona, surveys (M2M), questions (M2M)

**`ChatConversationMessage`** (table: `chat_conversation_messages`):
- Fields: `id`, `content`, `role`, `type`, `position`, `groundingData`, `tokenUsage`, `citations`, `thoughtTimeline`, `toolCalls`
- Roles: `user`, `assistant`, `system`, `generic`, `function`, `memory`

**`ChatFeedback`** (table: `chat_feedback`):
- Types: `POSITIVE`, `NEGATIVE`, `REPORT_ISSUE`
- Issue Categories: `INACCURATE`, `HALLUCINATION`, `INCOMPLETE`, `INAPPROPRIATE`, `UNCLEAR`, `TECHNICAL_ERROR`, `OTHER`

**Chat Modes (5)**:
- `conversation` - Basic, no tools
- `smart_sources` - AI retrieves from sources
- `smart_tools` - Curated tool groups
- `omni` - Default, all capabilities
- `manual_tools` - User selects individual tools

### Test Scenarios

1. Create new conversation and send first message
2. Send message with each chat mode (conversation, smart_sources, smart_tools, omni, manual_tools)
3. Attach sources (datasets, files, videos, audios, campaigns, questions) to conversation
4. Test streaming response display with real-time updates
5. Like/dislike/remove reaction on messages
6. Delete message pair (user + assistant)
7. Export conversation as markdown
8. Submit feedback (positive, negative, report issue)
9. Use @mention to route to specific persona
10. Test document upload to chat context
11. Test grounding/citation display and navigation
12. Verify auto-generated conversation title via subscription
13. Test model override (LLM selection) per message

### Edge Cases

1. **WebSocket not connected when sending** - 10s timeout with warning, proceeds anyway
2. **Name generation race condition** - 2s delayed refetch catches missed name events
3. **Duplicate send prevention** - `hasMutationBeenCalledRef` and `useLayoutEffect` flag reset
4. **Duplicate creation prevention** - `creationAttemptedRef` with 2s retry cooldown
5. **Conversation created on different tab** - `isCreatedOnDifferentTab` flag
6. **Grounding loading stuck** - 30s timeout auto-completes
7. **Streaming stall** - 3 min timeout reverts question
8. **Component unmount during send** - AbortController cancels WS wait
9. **Document vs Source distinction** - documentId for AI processing, fileIds for conversation sources
10. **selectAllValidDatasets/Campaigns** - Bulk selection flags
11. **Mentioned persona permissions** - Backend enforces, removes mention if no permission
12. **Message limit enforcement** - `checkMessageLimit()` per workspace/user
13. **Special personas** - Monsieur Link, Madison AI, 3CV, Neuroverse have custom routing
14. **Error message persistence** - Errors saved as assistant messages
15. **Stream deduplication** - Content+conversationId key prevents redundant renders
16. **RAF batching** - requestAnimationFrame prevents excessive dispatches

---

## 2. Agents/Personas

**Terminology**: Agent (UI) = `AiPersona` (API), table: `ai_personas`

### Routes

| Route | Component | Notes |
|-------|-----------|-------|
| `/:workspaceId/agents` | `AssistantsPage` | Agent listing |
| `/:workspaceId/agents/builder` | `AgentsCreatePage` | V1 builder (OpenFGA guarded) |
| `/:workspaceId/agents/builder-v2/:personaId?` | `AgentBuilderPage` | V2 builder (feature flag: `agentBuilderV2Active`) |

### GraphQL Operations

#### Queries (12)
| Operation | Purpose |
|-----------|---------|
| `aiPersonaV2ById` | Fetch single V2 persona by ID |
| `aiPersonasV2` | Paginated V2 personas for templates workspace |
| `aiPersonasForWorkspace` | List personas for workspace (supports semantic search) |
| `aiPersonasForWorkspacePage` | Paginated workspace personas with filters |
| `aiPersonaById` | V1 persona by ID within workspace |
| `aiPersonaTypes` | List all persona types |
| `aiTools` | List available AI tools (admin only) |
| `aiPersonaGetMembers` | Users/groups with permissions on persona |
| `llmModels` | List all non-deprecated LLM models |
| `guardrails` | List all available guardrails |
| `aiPersonaSearchHistory` | Recent search queries (last 10) |
| `aiPersonaCategories` | List persona categories |

#### Mutations (22)
| Operation | Purpose |
|-----------|---------|
| `createAiPersonaV2` | Create V2 persona (primary) |
| `updateAiPersonaV2` | Update V2 persona |
| `deleteAiPersonasV2` | Delete multiple V2 personas |
| `publishPersona` | Transition draft -> published |
| `deactivatePersona` | Transition published -> draft (unlinks chats) |
| `aiPersonaFavorite` / `aiPersonaUnfavorite` | Favorite management |
| `cloneAiPersona` | Clone to multiple workspaces |
| `createPersonaCopy` | Create V2 copy (only originals) |
| `aiPersonaUpdatePermissions` | Update OpenFGA permissions |
| `aiPersonaBulkUpdateHidden` | Show/hide multiple |
| `aiPersonaBulkUpdateSkills` | Update skills for multiple |
| `aiPersonaBulkDelete` | Delete multiple |
| `generateAiPersonaCustomPlan` | Trigger background AI generation |
| `resolvePmFacetValuesFromConfigs` | Resolve random facet values |
| `autoConfigureFacets` | AI-powered facet selection |
| `createPersonaPicture` | Upload persona picture |
| `aiSkillCreate` / `aiSkillUpdate` / `aiSkillDelete` | Skill CRUD |
| `createPersonaTask` / `updatePersonaTask` / `deletePersonaTask` | Task CRUD |

#### Subscriptions (1)
| Operation | Purpose |
|-----------|---------|
| `personaGenerationUpdates` | Real-time generation events (name, biography, picture, description) |

### Key Components

| Component | Purpose |
|-----------|---------|
| `AssistantsPage` | V1 list page with filters, search, delete |
| `AgentBuilderPage` | V2 builder wrapper with transitions |
| `AgentBuilderSummary` | VIEW mode summary |
| `AgentBuilderForm` | Multi-step form (Objective, Facets, Instructions, Identity, Appearance, Review) |
| `MoldFacetValueSelector` | Facet value picker |
| `AgentBuilderContextProvider` | Builder state, actions, generation |

### Models/Types

**`AiPersona`** (table: `ai_personas`):
- Core: `id`, `name` (3-50 chars), `description` (20-1000 chars), `objective` (1-500 chars), `physicalDescription` (20-1000 chars), `customFlavor` (max 500 chars)
- Status: `draft`, `published`, `sample`
- Types: Assistant, Consumer Persona, Product, Visual Generator
- V2 flag: `isV2: Boolean`
- Relations: workspace, createdBy, surveys, questions, trainingSets, files, videos, audios, tasks, skills, icebreakers
- Permissions: `can_view`, `can_edit`, `can_delete`, `can_manage` (OpenFGA)

### Test Scenarios

1. Create V2 persona through builder wizard (all 6 steps)
2. Generate name/biography/picture/description via AI
3. Publish draft persona -> verify status change
4. Deactivate published persona -> verify chat unlink
5. Clone persona to multiple workspaces
6. Copy persona -> verify unique name generation
7. Favorite/unfavorite persona
8. Search personas (semantic search via embeddings)
9. Filter by type, model, status, skills, favorites
10. Bulk operations (hide, update skills, delete)
11. Permission management (add/change/remove user access)

### Edge Cases

1. **Name uniqueness** - Must be unique within workspace; throws `FieldValidationError`
2. **Copy name auto-increment** - "Name (Copy)", "Name (Copy 2)", max 100 attempts
3. **Only originals can be copied** - Copies/mirrors cannot be copied
4. **Soft delete appends timestamp** - Avoids uniqueness conflicts
5. **Deactivation unlinks chats** - Sets aiPersonaId to null on conversations
6. **CustomFlavor concatenation** - Frontend combines customFlavor + rules with "\n\n"
7. **Visual Generator constraints** - Enforced LLM and tools
8. **V1 vs V2 validation** - Different required fields and schemas

---

## 3. Workflows/Orchestration

**Terminology**: Workflow (UI) = `AiOrchestration` (API), Workflow Step (UI) = `AiPersonaTask` (API)

### Routes

| Route | Component | Notes |
|-------|-----------|-------|
| `/:workspaceId/workflow` | Redirect to `flows` | Workflow home |
| `/:workspaceId/workflow/flows` | `FlowsPage` | All workflows |
| `/:workspaceId/workflow/flows/:workflowId` | `FlowBuilder` | Builder page |
| `/:workspaceId/workflow/flows/:workflowId/view/:historyId` | `FlowHistory` | History view |
| `/:workspaceId/workflow/flows/:workflowId/view/:historyId/report` | `FlowReport` | Report view |
| `/:workspaceId/workflow/flows/:workflowId/view/:historyId/task-report/:taskId` | `FlowTaskReport` | Task report |
| `/:workspaceId/workflow/flows/:workflowId/run` | `FlowRunning` | Running state |
| `/:workspaceId/workflow/upcoming-runs` | `UpcomingRunsPage` | Scheduled runs |
| `/:workspaceId/workflow/conversations` | `ConversationsPage` | Conversations |
| `/:workspaceId/workflow/outputs` | `OutputsPage` | Outputs |
| `/:workspaceId/workflow/templates` | `WorkflowTemplatesPage` | Templates |

### GraphQL Operations

#### Queries (16)
| Operation | Purpose |
|-----------|---------|
| `AI_ORCHESTRATIONS_PAGE` | Paginated workflow list |
| `GET_AI_ORCHESTRATION` | Full workflow details |
| `GET_AI_ORCHESTRATION_HISTORY` | All execution history |
| `GET_AI_ORCHESTRATION_HISTORY_ENTRY` | Single execution (password-protected) |
| `GET_CURRENT_RUNNING_WORKFLOW` | Active execution with live output |
| `GET_AI_ORCHESTRATION_VARIABLES` | All variable sets |
| `GET_ORCH_OUTPUT_TYPES` | Available output formats |
| `INFER_DELIVERABLE_TYPE` | AI-suggested output type |
| `GET_WORKFLOW_TEMPLATES` | Templates list |
| `GET_WORKFLOW_TEMPLATES_WITH_CATEGORIES` | Templates with categories |
| `GET_WORKFLOW_TEMPLATE_CATEGORY_GROUPS_WITH_TEMPLATES` | Hierarchical browser |
| `GET_WORKFLOW_TEMPLATE_CATEGORIES` | Category list |
| `GET_AI_ORCHESTRATION_SCHEDULES` | All schedules in workspace |
| `GET_AI_ORCHESTRATION_SCHEDULE_BY_ID` | Single schedule |
| `GET_AI_ORCHESTRATION_SCHEDULES_BY_WORKFLOW_ID` | Schedules for workflow |
| `GET_AI_ORCHESTRATION_SCHEDULE_UPCOMING_RUNS` | Upcoming scheduled runs |

#### Mutations (28)
| Operation | Purpose |
|-----------|---------|
| `CREATE_AI_ORCHESTRATION` | Create workflow |
| `UPDATE_AI_ORCHESTRATION` | Update workflow config |
| `DELETE_AI_ORCHESTRATION` | Delete workflow |
| `DUPLICATE_AI_ORCHESTRATION` | Clone workflow |
| `CREATE_PERSONA_TASK` | Add workflow step |
| `UPDATE_PERSONA_TASK` | Modify step |
| `DELETE_PERSONA_TASK` | Remove step |
| `RUN_WORKFLOW` | Execute workflow (async) |
| `CANCEL_WORKFLOW` | Stop execution |
| `CREATE_AI_ORCHESTRATION_VARIABLES` | Create variable set |
| `UPDATE_AI_ORCHESTRATION_VARIABLES` | Modify variable set |
| `MODIFY_ACTIVE_VARIABLES_SET_FOR_WORKFLOW` | Switch active set |
| `DELETE_AI_ORCHESTRATION_VARIABLES` | Delete variable set |
| `REGENERATE_REPORT` | Re-generate report |
| `UPDATE_AI_ORCHESTRATION_REPORT` | Edit report content |
| `SAVE_REPORT_TO_DATASET` | Archive report to dataset |
| `SAVE_TASK_TO_DATASET` | Save task output to dataset |
| `UPDATE_AI_ORCHESTRATION_REPORT_SHARING` | Share/password-protect report |
| `AI_ORCHESTRATION_REPORT_IMPROVEMENTS` | AI-assisted report editing |
| `CREATE_WORKFLOW_FROM_TEMPLATE` | Create from template |
| `CREATE_WORKFLOW_FROM_TEMPLATE_WITH_POSSIBLE_NEW_VARIABLES` | Template + custom variables |
| `CREATE_WORKFLOW_TEMPLATE` | Save as template |
| `UPDATE_WORKFLOW_TEMPLATE` / `DELETE_WORKFLOW_TEMPLATE` | Template management |
| `REMOVE_WORKFLOW_TEMPLATE_FROM_CATEGORY` | Unassign from category |
| `CREATE_AI_ORCHESTRATION_SCHEDULE` | Create schedule |
| `UPDATE_AI_ORCHESTRATION_SCHEDULE` | Modify schedule |
| `DELETE_AI_ORCHESTRATION_SCHEDULE` | Remove schedule |

#### Subscriptions (1 subscription, 17 event types)
| Event Type | Purpose |
|-----------|---------|
| `WorkflowCreationStartedEvent` / `CompletedEvent` / `ErrorEvent` | Creation lifecycle |
| `OrchestrationStartedEvent` / `CompletedEvent` / `ErrorEvent` | Execution lifecycle |
| `OrchestrationPausedEvent` / `ResumedEvent` / `CancelledEvent` | Execution control |
| `TaskStartedEvent` / `TaskOutputGeneratedEvent` / `TaskOutputStreamUpdatedEvent` | Task execution |
| `TaskCompletedEvent` / `TaskErrorEvent` / `TaskUpdatedEvent` | Task lifecycle |
| `ReportGeneratingStartedEvent` / `ReportGeneratingCompletedEvent` | Report generation |

### Models/Types

**`AiOrchestration`** (table: `ai_orchestrations`):
- Fields: id, workspaceId, name, description, inputParameters, instructions, outputTypeId, metadata (JSON), variables (JSON)
- Relations: workspace, creator, aiPersonaTasks, surveys, trainingSets, questions, files, videos, schedule, histories

**`AiOrchestrationHistory`** (table: `ai_orchestration_histories`):
- Status: PENDING, RUNNING, COMPLETED, FAILED, CANCELLED, PAUSED
- Fields: output, finalReport, reportUrl, reportWordUrl, isShared, isPasswordProtected, password

**`AiOrchestrationSchedule`** (table: `ai_orchestration_schedules`):
- Status: ACTIVE, PAUSED, COMPLETED, FAILED
- Fields: recurrenceRule, lastExecutedAt, nextExecutionAt, executionCount, notificationRecipients

### Test Scenarios

1. Create workflow in Auto/Manual/Template modes
2. Add/remove/reorder agent tasks on canvas
3. Use `{{ variable }}` syntax in task prompts
4. Run workflow and monitor real-time progress
5. Cancel running workflow with confirmation
6. View execution history and per-task outputs
7. Edit report in WYSIWYG editor
8. Regenerate report from execution data
9. Export report as PDF/Word
10. Share report with optional password protection
11. Save report/task output to dataset
12. Create/edit/delete schedules (hourly/daily/weekly)
13. Create/manage workflow templates
14. Test OpenFGA permissions (VIEW, EDIT, DELETE, MANAGE)

### Edge Cases

1. **60-minute task timeout** per task
2. **Circuit breaker** on cascading failures
3. **Unsaved changes warning** on navigation away
4. **Schedule only available** when Build tab, not dirty, not running, valid workflow
5. **Password-protected history entries** require password to view
6. **Variable validation** - name required, at least 1 variable, no empty keys/values
7. **Workflow name max 150 chars**, objective max 500 chars
8. **Feature flags**: `aiWorkflowOpenFgaPermissionsActive`, `workflowscheduling`, `taskrichinputenabled`, `aiWorkflowsV3Enabled`

---

## 4. Campaigns/Surveys

**Terminology**: Campaign (UI) = `Survey` (API)

### Routes

| Route | Component | Notes |
|-------|-----------|-------|
| `/:workspaceId/campaigns` | `SurveyDashboard` | Campaign dashboard (OpenFGA guarded) |
| `/:workspaceId/campaigns/templates` | `TemplatePage` | Campaign templates |
| `/:workspaceId/campaigns/usage` | `UsagePage` | Usage stats |
| `/:workspaceId/campaigns/magic-reels` | `MagicReelsPage` | Magic reels |
| `/:workspaceId/survey/:surveyId/questions` | `QuestionEditor` | Build tab |
| `/:workspaceId/survey/:surveyId/settings` | `SurveySettings` | Configure tab |
| `/:workspaceId/survey/:surveyId/audience` | `SurveyParticipants` | Audience tab |
| `/:workspaceId/survey/:surveyId/launch` | `LaunchPage` | Launch tab |
| `/:workspaceId/survey/:surveyId/results/:questionId?/:answerId?` | `SurveyResponsePage` | Results tab |
| `/:workspaceId/survey/:surveyId/analyze/:answerId?` | `ResultsTable` | Analyze tab |
| `/:workspaceId/survey/:surveyId/summary` | `QuickSummaryPage` | Summary tab |
| `/:workspaceId/survey/:surveyId/participation` | `ResponsesTab` | Participation |
| `/:workspaceId/survey/:surveyId/recruit/*` | `RecruitPage` | External recruitment |
| `/:workspaceId/survey/:surveyId/mailing-list/*` | `MailingListPage` | Mailing list |
| `/:workspaceId/survey/:surveyId/vurvey-creators/*` | `VurveyCreatorsPage` | Vurvey creators |
| `/:workspaceId/survey/:surveyId/people-models/*` | `PeopleModelsPage` | People models |

### GraphQL Operations

#### Key Queries (25+)
| Operation | Purpose |
|-----------|---------|
| `GET_ALL_SURVEYS` | Paginated campaign list with filters |
| `GET_SURVEY` | Full survey with questions, workspace, attributes |
| `GET_ALL_SURVEY_QUESTIONS` | All questions for a survey |
| `GET_ALL_RESPONSES` | Paginated responses with participant data |
| `GET_ALL_ANSWERS` | Answers for a question (video, text, images, PDFs) |
| `GET_STATS` | Response counts, median time, video duration |
| `GET_SUMMARY` | AI-generated survey insights |
| `GET_SURVEY_MEMBERS` | Paginated member list with status |
| `GET_SURVEY_PROMOTION` | Recruitment promotion status |
| `SURVEY_MEMBERSHIP_GROUPS_BY_TYPE` | Audience groups by type |
| `GET_VIDEO_TRANSCRIPT` | Video transcript with highlights/corrections |

#### Key Mutations (35+)
| Operation | Purpose |
|-----------|---------|
| `CREATE_SURVEY` / `CREATE_SURVEY_FROM_OBJECTIVES` | Create campaign (manual/AI) |
| `UPDATE_SURVEY` / `DELETE_SURVEY` / `COPY_SURVEY` | Survey CRUD |
| `PUBLISH_SURVEY` (`openSurvey`) / `UNPUBLISH_SURVEY` (`closeSurvey`) | Lifecycle |
| `CREATE_QUESTION` / `UPDATE_QUESTION` / `DELETE_QUESTION` / `COPY_QUESTION` / `MOVE_QUESTION` | Question CRUD |
| `SET_QUESTION_TYPE` | Change question type |
| `CREATE_CHOICE` / `UPDATE_CHOICE` / `MOVE_CHOICE` / `DELETE_CHOICE` | Choice management |
| `ADD_SURVEY_MEMBERS` / `REMOVE_SURVEY_MEMBER` | Member management |
| `SEND_SURVEY_TO_MEMBERS` | Email invitations |
| `LIKE_ANSWER` / `UNLIKE_ANSWER` / `REVIEW_ANSWER` / `UNREVIEW_ANSWER` | Answer actions |
| `SIMULATE_SURVEY_WITH_PERSONAS` | AI persona simulation |
| `PROMOTE_SURVEY` / `APPROVE_SURVEY_PROMOTION` | External recruitment |
| `HIGHLIGHT_TRANSCRIPT` / `CORRECT_TRANSCRIPT` | Transcript management |
| `UPDATE_SURVEY_INSIGHTS` / `REGEN_INSIGHTS` | AI insights |

### Models/Types

**Survey Status**: DRAFT, OPEN, BLOCKED, CLOSED, ARCHIVED
**Survey Access**: PRIVATE, PUBLIC, ANONYMOUS
**Question Types**: CHOICE (multi/ranked/star), SLIDER, FILE (picture/video/pdf/barcode), TEXT (short/long/number/email), NONE, BARCODE
**Member Status**: INVITED, PARTIAL, COMPLETED
**Invitation Types**: EMAIL, LIST_SEGMENTS, PEOPLE_MODEL

### Test Scenarios

1. Create campaign (manual and AI-generated)
2. Add/edit/delete/reorder questions of each type
3. Configure access level (private/public/anonymous)
4. Publish and close campaign
5. Invite members via email, list, and people model
6. Send email invitations with custom message
7. View responses with filtering and sorting
8. Like/unlike and review/unreview answers
9. View and correct video transcripts
10. Generate and edit AI insights
11. Simulate survey with AI personas
12. Set up external recruitment (Respondent.io)
13. Create audience groups with per-group settings
14. Schedule auto-close with notifications

### Edge Cases

1. **Survey cannot be opened** without valid billing
2. **Question deletion blocked** if answers exist (for feedback questions)
3. **Member self-action prevention** - Cannot edit/remove self
4. **Trial/Pending plans** - Upgrade banner instead of "Add Users"
5. **Password-protected shared summary**
6. **Multi-response surveys** allow repeat responses
7. **Geolocation tracking** on responses

---

## 5. Datasets/Training Sets

**Terminology**: Dataset (UI) = `TrainingSet` (API), table: `training_sets`

### Routes

| Route | Component | Notes |
|-------|-----------|-------|
| `/:workspaceId/datasets` | `AllDatasetsPage` | Grid display with pagination (OpenFGA guarded) |
| `/:workspaceId/datasets/dataset/:trainingSetId` | `DatasetPage` | Detail view (OpenFGA guarded) |
| `/:workspaceId/datasets/magic-summaries` | `MagicSummariesPage` | AI insights placeholder |
| `/:workspaceId/datasets/labels` | `ManageKeys` | Label management (admin only) |

### GraphQL Operations

#### Queries (9)
| Operation | Purpose |
|-----------|---------|
| `GET_TRAINING_SETS_PAGE` | Paginated dataset list |
| `GET_TRAINING_SET` | Single dataset with files + stats (polling 30s) |
| `GET_TRAINING_SET_STATS` | File/video counts by status |
| `GET_TRAINING_SET_MEDIA` | Paginated media (union: Video/Audio/File) |
| `GET_TRAINING_SET_MEDIA_CRITERIA` | Filter options |
| `GET_SOURCES_MODAL_TRAINING_SETS_PAGE` | For source selection modals |
| `TRAINING_SET_GET_MEMBERS` | Users/groups with access |

#### Mutations (25)
| Operation | Purpose |
|-----------|---------|
| `CREATE_TRAINING_SET` | Create dataset |
| `TRAINING_SET_UPDATE` | Update alias/description |
| `DELETE_TRAINING_SET` | Delete (must be empty) |
| `CREATE_TRAINING_SET_FILE` / `VIDEO` / `AUDIO` | Create media from upload |
| `ADD_FILE_TO_TRAINING_SET` / `VIDEO` / `AUDIO` | Assign media to dataset |
| `DELETE_TRAINING_SET_FILE` / `VIDEO` / `AUDIO` | Remove media |
| `REMOVE_FILE_FROM_TRAINING_SET` / `VIDEO` | Unassign media |
| `RETRY_FAILED_FILE_TRANSCODING` | Retry failed embeddings |
| `SET_TAGS_TO_TRAINING_SET_MEDIA` | Apply labels |
| `TRAINING_SET_UPDATE_PERMISSIONS` | Update OpenFGA permissions |
| `SAVE_REPORT_TO_DATASET` | Save workflow report |
| `SAVE_TASK_TO_DATASET` | Save task output |

#### Subscriptions (2 events in workspace subscription)
- `WorkspaceTrainingSetStatsUpdatedEvent` - Real-time stats
- `WorkspaceTrainingSetMediaUpdatedEvent` - Media changes

### Models/Types

**`TrainingSet`**: id, name (immutable), alias (user-facing), description, creatorId, workspaceId
**File statuses**: UPLOADED -> PROCESSING -> SUCCESS/FAILED
**Supported formats**: PDF, DOCX, XLSX, PPTX, CSV, TXT, JSON, MD, MP4, MOV, AVI, MP3, WAV, OGG, AAC

### Test Scenarios

1. Create dataset (unique name, max 35 chars)
2. Upload files of each supported format
3. Upload via Google Drive (OAuth2 flow)
4. Monitor file processing status progression
5. Retry failed file transcoding
6. Apply/remove labels to media files
7. Delete empty dataset (verify non-empty rejection)
8. Share dataset with permissions (MANAGE/EDIT/DELETE)
9. Attach datasets to agents, workflows, and chat
10. Save workflow report/task to dataset
11. Verify 30-second polling during processing

### Edge Cases

1. **Name immutability** - Internal name cannot be changed after creation
2. **Duplicate name per workspace** - Returns friendly error
3. **Delete requires empty** - Must remove all files first
4. **Retry requires FAILED status** - Cannot retry non-failed files
5. **Batch upload** - 20 files per batch with progress toasts
6. **Special characters in name** - Spaces auto-converted to dashes
7. **Feature flags**: `trainingSetOpenFgaPermissionsActive`, `audiofileuploadenabled`

---

## 6. Workspace Settings

### Routes

| Route | Component | Notes |
|-------|-----------|-------|
| `/:workspaceId/workspace/settings` | `GeneralSettings` (default) | Session timeout, name, avatar, plan, Tremendous |
| `/:workspaceId/workspace/settings/ai-models` | `AiModelsPage` | Browse AI models by category |
| `/:workspaceId/workspace/settings/api-management` | `ApiManagementPage` (lazy) | Currently disabled |
| `/:workspaceId/workspace/members` | `WorkspaceMembersPage` | Member management |
| `/:workspaceId/settings/integrations` | `IntegrationManagementPage` | Tool integrations (Composio) |

### GraphQL Operations

#### Queries
| Operation | Purpose |
|-----------|---------|
| `GET_WORKSPACE` | Full workspace with all feature flags and settings |
| `GET_WORKSPACE_MEMBERS` | Paginated members with sort/filter |
| `GET_AI_MODELS` / `GET_AI_MODEL_CATEGORIES` | AI model browsing |
| `GET_REWARD_SETTINGS` / `GET_REWARD_SETTINGS_NOCONFIG` | Tremendous status |
| `GET_FUNDING_SOURCES` / `GET_TREMENDOUS_CAMPAIGNS` | Tremendous config |
| `FILE_TAG_KEYS` | Label management |
| `GET_SUPPORTED_TOOLS` / `GET_USER_CONNECTIONS` | Integration tools |

#### Mutations
| Operation | Purpose |
|-----------|---------|
| `UPDATE_WORKSPACE` | Name, logo, session timeout, sphere animation |
| `CREATE_WORKSPACE_LOGO` | Upload workspace logo |
| `INVITE_USERS` | Invite by email with role |
| `SET_WORKSPACE_ROLE` | Change member role |
| `REMOVE_WORKSPACE_MEMBER` | Remove with ownership transfer |
| `UPDATE_TREMENDOUS_SETTINGS` / `SET_TREMENDOUS_API` / `DELETE_TREMENDOUS_KEY` | Rewards config |
| `FILE_TAG_KEY_CREATE_BATCH` / `DELETE_BATCH` / `UPDATE` | Label CRUD |
| `GET_CONNECT_URL` / `DELETE_CONNECTION` | Integration management |

### Test Scenarios

1. Change workspace name and verify update
2. Upload workspace avatar
3. Configure session timeout (enable/disable, set minutes)
4. View AI models by category with search filter
5. Invite users by email with specific role
6. Change member role (Administrator, Manager, Owner)
7. Remove member with ownership transfer option
8. Configure Tremendous rewards integration
9. Manage file tag labels (add, edit, delete)
10. Connect/disconnect third-party integrations

### Edge Cases

1. **Cannot edit/remove own account** - Shows toast error
2. **Trial/Pending plans** - Shows upgrade banner instead of "Add Users"
3. **API Management currently disabled** - Hardcoded `false`
4. **Admin-only label management** - Redirects non-admins with toast
5. **Label deletion fails** if key is in use
6. **Permission-based UI** - Buttons hidden based on workspace permissions

---

## 7. Authentication

### Routes

| Route | Component | Notes |
|-------|-----------|-------|
| `*` (unauthenticated) | `Login` | Multi-step login flow |
| `share/:reelId` | `SharedReelPage` | Public (no auth) |
| `summary/:surveyId` | `SharedSummary` | Public (no auth) |
| `report/:historyId` | `ShareReportPage` | Public (no auth) |
| `/:workspaceId/me` | `PersonalProfile` | Account page |
| `/:workspaceId/me/terms-of-service` | `TOS` | Terms of Service |
| `/:workspaceId/admin/sso-providers` | `SSOProvidersPage` | SSO management (admin) |

### GraphQL Operations

#### Queries
| Operation | Purpose |
|-----------|---------|
| `GET_USER_INFO` | Current user + workspaces + intercom hash |
| `TERMS_ACCEPTED` | TOS acceptance status |
| `SSO_PROVIDERS` | List all SSO providers |
| `SSO_PROVIDER_CHECK` | Check email domain for SSO |
| `GET_COUNTRIES` | Country list for profile |

#### Mutations
| Operation | Purpose |
|-----------|---------|
| `REGISTER` | Register via invite token |
| `REQUEST_PASSWORD_RESET` | Send password reset email |
| `RESET_PASSWORD` | Reset with token |
| `CONFIRM_EMAIL` | Email confirmation |
| `UPDATE_ME` | Update profile |
| `DELETE_ME` | Account deletion |
| `LOGOUT` | Server-side session cleanup |
| `SSO_PROVIDER_CREATE` / `UPDATE` / `DELETE` | SSO management |

### Key Components

| Component | Purpose |
|-----------|---------|
| `InitialStep` | Sign-in method selection (Google, Email, SSO) |
| `SignInLoginStep` | Email input with method detection |
| `SignInPasswordStep` | Password entry for existing users |
| `SignUpStep` | Registration form for new users |
| `RecoverPasswordStep` | Password reset request |
| `CheckYourEmailStep` | Confirmation screen |
| `FirebaseTokenManager` | Token lifecycle with dedup and cross-user safety |

### Test Scenarios

1. Sign in with Google OAuth
2. Sign in with email/password
3. Sign in with SSO (SAML provider)
4. Register new account via email
5. Password recovery flow
6. Email verification flow
7. Edit personal profile (name, gender, birthdate, city, country)
8. Toggle dark mode from profile
9. Delete account (Firebase + API soft delete)
10. Inactivity timeout logout
11. SSO provider CRUD (admin)

### Edge Cases

1. **Existing Google account** - Toast "You already have an account. Please log in with Google"
2. **Weak password** - "Password should be at least 6 characters" (Firebase)
3. **Too many login attempts** - Rate limiting with specific message
4. **WebSocket auth retry** - 5 retries with 1.5s delay, 3+ consecutive failures signs out
5. **Token refresh** - Recreates WebSocket client on token change
6. **Force re-auth** - "Please re-authenticate" errors trigger sign out
7. **Email verified but no workspaces** - Shows welcome page with mobile links
8. **Profile max length** - 200 characters for text fields
9. **Birthdate validation** - Cannot be in the future

---

## 8. Canvas & Branding

### Canvas

The "Canvas" is the main AI chat interface (not a design canvas).

**Key Features:**
- **Perlin Sphere Animation** - Configurable 3D WebGL sphere on home screen
- **Prompt Showcase** - 9 pre-built prompt cards (Twitter/X, Instagram, YouTube, etc.)
- **Image Studio** - Full AI image editor within chat canvas

**Image Studio Operations:**
| Action | Endpoint | Technology |
|--------|----------|------------|
| Enhance Image | `POST /rest/enhance` | Replicate AI |
| Upscale Image | `POST /rest/upscale` | Recraft AI (Replicate) |
| Change/Edit Image | `POST /rest/imgeditor` | Mask/text-based editing |
| Remove Selection | `POST /rest/imgeditor` (empty prompt) | Same endpoint |
| Convert to Video | `startVideoGeneration` mutation | Google Veo 3.1 |

**Video Config Options**: Duration (4/6/8s), Aspect Ratio (16:9/9:16), Sample Count (1-4), Person Generation toggle, Negative Prompt, Seed

### Branding

### Routes

| Route | Component | Notes |
|-------|-----------|-------|
| `/:workspaceId/branding` | `BrandSettingsPage` | Main brand settings |
| `/:workspaceId/branding/reviews` | `ReviewsPage` | Video review responses |
| `/:workspaceId/branding/reels` | `BrandReels` | Brand reels management |
| `/:workspaceId/branding/questions` | `BrandQuestions` | Feedback questions (OpenFGA guarded) |

### GraphQL Operations

#### Brand Mutations
| Operation | Purpose |
|-----------|---------|
| `UPDATE_BRAND` | Update name, description, colors, categories, countries |
| `CREATE_BRAND_LOGO` / `CREATE_BRAND_BANNER` | Asset uploads |
| `ADD_BRAND_BENEFIT` / `REMOVE_BRAND_BENEFIT` | Benefits management |
| `CREATE_FEEDBACK_QUESTION` / `UPDATE_QUESTION` / `DELETE_QUESTION` | Feedback questions |
| `CREATE_REEL` / `PUBLISH_REEL` / `SHARE_REEL_WITH_BRAND` | Reel creation from reviews |

### Test Scenarios

1. Edit brand name, description, logo, banner
2. Set brand colors (primary, secondary, tertiary, quaternary)
3. Configure categories, benefits, activities, countries
4. Create/edit/delete/reorder feedback questions
5. Review video answers and create reels
6. Image Studio: enhance, upscale, edit, remove selection
7. Image Studio: convert image to video
8. Perlin sphere animation configuration

### Edge Cases

1. **Unique URL constraint** - `brands_url_unique` shows specific toast
2. **Question deletion blocked** if answers exist
3. **Review -> Reel flow** auto-publishes and shares to brand
4. **Image Studio history** - URL-based state management for browser navigation
5. **Video generation status** - PENDING -> PROCESSING -> COMPLETED/FAILED with polling

---

## 9. Navigation & Routing

### Complete Route Summary

- **Public routes**: 3 (share, summary, report)
- **Login/auth routes**: 1 with 6 internal steps
- **Standalone authenticated**: 2 (Composio callback, Image Studio)
- **Legacy redirects**: ~13 patterns
- **Workspace-scoped routes**: ~80+ unique paths
- **Survey sub-routes**: ~20+ unique paths
- **Admin sub-routes**: 11
- **Total unique navigable paths**: ~115+

### Sidebar Navigation Items

| Nav Item | Route | Condition | Test ID |
|----------|-------|-----------|---------|
| Home | `/` | chatbotEnabled | `home-link` |
| Agents | `/agents` | chatbotEnabled | `agents-link` |
| People | `/people` | Always | `people-link` |
| Campaigns | `/campaigns` | Always | `campaigns-link` |
| Datasets | `/datasets` | chatbotEnabled | `datasets-link` |
| Forecast | `/forecast` | forecastEnabled | `forecast-link` |
| Workflow | `/workflow/flows` | chatbotEnabled | `workflow-link` |
| Dashboard | `/dashboard` | dashboardGenerator + chatbotEnabled | N/A |

### Header Dropdown Items

| Item | Link | Condition |
|------|------|-----------|
| Manage Users | `/workspace/members` | Always |
| Brand Profile | `/branding` | Always |
| Rewards | `/rewards` | Always |
| Settings | `/workspace/settings` | Always |
| Switch Workspace | Modal/dropdown | workspaces.length > 1 |
| Mentions | `/mentions` | Enterprise only |
| Super Admin | `/admin` | Enterprise only |

### Route Guards

| Guard Type | Mechanism | Affects |
|-----------|-----------|---------|
| Authentication | `useAuthentication()` | All routes except public shares |
| Enterprise Manager | `EnterpriseRouteGuard` | Admin, Mentions, Molds |
| OpenFGA Permissions | `OpenfgaPermissionsDeniedContextProvider` | Agents builder, Datasets, Campaigns |
| Feature Flags | `useFeatureFlag()` | AgentBuilderV2, MoldBuilder, WorkflowScheduling |
| Workspace Settings | `chatbotEnabled`, `forecastEnabled` | Sidebar items |

### Feature Flags Affecting Navigation

| Flag | Impact |
|------|--------|
| `agentBuilderV2Active` | V1 vs V2 agent builder route |
| `moldBuilder` | Molds page access |
| `workflowscheduling` | Upcoming Runs tab |
| `dashboardGenerator` | Dashboard nav item |
| `chatbotEnabled` | Home, Agents, Datasets, Workflow visibility |
| `forecastEnabled` | Forecast nav item |
| `hideVurveyLogo` | Logo visibility (iframe embedding) |

---

## 10. Shared UI Components

### V2 Design System (`shared/v2/`)

#### Buttons
- **Button** - Polymorphic with variants (filled/outlined/text), styles (brand/toolkit/danger/ai), sizes (default/small)
- **ButtonIcon** - Icon-only variant

#### Inputs (18 variants)
- Input, TextArea, AutoResizeTextarea, TextareaWithVariablesHighlighter, NumberInput, CurrencyInput, DateInput, SearchInput, DebounceSearch, SelectInput, SelectWithSearch, MultiSelectInput, CustomElementSelect

#### Modals (7+ types)
- Modal, ConfirmActionModal, ConfirmExitModal, ConfirmLogoutModal, ConfirmDeleteAiPersonasV2Modal, CopyAiPersonaModal, EditPictureModal, UploadFilesModal, GenericPermissionsModal

#### Typography
- Display, Header, Subheader, Body (xs/s/default), Caption

#### Data Display
- Checkbox, RadioGroup, Switch, Slider, ProgressBar, Gauge, Separator, StatusIndicator

#### Content Rendering
- MarkdownViewer, OptimizedMarkdown, TypewriterMarkdown, TypewriterText, MermaidRenderer

### Key Custom Hooks (100+)

| Category | Notable Hooks |
|----------|---------------|
| Form/Input | `useFormInput`, `useValidation`, `useDebounceCallback`, `useSearchParamState` |
| Data Loading | `useLoadingQuery`, `usePrefetch`, `usePollForStatus` |
| File Upload | `useFileUpload`, `useMediaUpload`, `useTrainingSetUpload`, `useUploadWithCompression` |
| UI State | `useModalActions`, `useConfirmationModal`, `useDropdown`, `useHover`, `useOnClickOutside` |
| Navigation | `useMobileDetection`, `useConfirmationBlocker` |
| Feature/Config | `useFeatureFlag`, `useLocalStorage`, `useInactivityTimeout` |

### Theme System

- `ThemeModeProvider` wraps entire app
- `localStorage("theme")` persistence
- `dark-theme` CSS class on `document.documentElement`
- `@include dark-mode` SCSS mixin
- Dark mode forced on certain routes
- Survey routes force light mode

### Toast System

- Types: `success`, `failure`, `informational`
- Positions: `top`, `bottom`, `top-center`
- Auto-dismiss: 3 seconds (configurable)
- `onError(apolloError)` convenience method

### Error Boundaries (3 levels)

1. `MainErrorBoundary` - Top-level catch-all
2. `AppErrorBoundary` - App-level (inside ThemeModeProvider)
3. `NavigationContentErrorBoundary` - Navigation-specific

---

## 11. Workspace Backend

### Models

**`Workspace`** (table: `workspaces`):
- 40+ fields including all feature flags
- Key fields: id, name, plan, billingStatus, logoId, customerId, subscriptionId
- Feature flags: chatbotEnabled, workflowEnabled, forecastEnabled, agentBuilder2Enabled, granularPermissionsEnabled, etc.
- Relations: logo, memberships, connections, segments, surveys, brand, appLimits

**`WorkspaceMembership`** (table: `workspaceMemberships`):
- Composite PK: [workspaceId, userId]
- Roles: MANAGER, ADMINISTRATOR, OWNER

**`User`** (table: `users`):
- 50+ fields including preferences and demographics
- Roles: REGULAR_USER, SUPPORT, ENTERPRISE_MANAGER
- Status: PENDING, REGISTERED, CONFIRMED, ANONYMOUS, DELETED

### Permissions System

**Legacy (role-based)**:
- All members: read, CRUD for most entities
- Administrators/Owners: workspace update, member management, label management
- Owners: billing, delete, cancel, ownership transfer
- Enterprise Managers: plan management

**OpenFGA (fine-grained)**:
- Relations: can_view, can_edit, can_delete, can_manage, can_manage_schedules
- Object types: ai-workflow, ai-persona, dataset, workspace, vurvey, campaign
- Methods: check, batchCheck, assertPermission, write, read

### REST Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /rest/workspace` | Create workspace via API token (Zapier) |
| `GET /apigee/apps/{email}` | List API keys |
| `POST /apigee/developers` | Create Apigee developer |
| `POST /apigee/apps` | Create API key/app |
| `DELETE /apigee/apps/{email}/{appName}` | Revoke API key |
| `POST /rest/enhance` | AI image enhancement |
| `POST /rest/upscale` | AI image upscale |
| `POST /rest/imgeditor` | AI image editing |
| `GET /chat-conversation-history/:id/download` | Download chat history |

---

## 12. Secondary Domains

### Forecast (`/forecast`)
- 5 sub-pages: ForecastView, ModelValidation, ModelComparison, Discover, Optimize
- Feature flag: `forecastEnabled`
- Max 5 models for comparison
- Discovery CSV upload with polling
- GraphQL: GET_FORECAST_ITEMS, GET_FORECAST, GET_FORECAST_ANALYSIS, GET_MODEL_COMPARISON, GET_DISCOVERY_INSIGHTS

### People/CRM (`/people`)
- Sub-domains: Populations, Molds, Community (Contacts), Lists & Segments, Properties
- Mold statuses: DRAFT, PUBLISHED, ARCHIVED
- Population visualization: donut, bar, diverging, funnel, treemap charts
- Facet hierarchy with constraint rules (WARN/BLOCK severity)
- 13 respondent lookup queries
- GraphQL: PM_MOLD_CREATE/UPDATE/PUBLISH/DUPLICATE/DELETE, CREATE_PM_POPULATION, GET_ALL_FACETS, EVALUATE_CONSTRAINTS

### Mentions (`/mentions`)
- Enterprise-only feature
- Reviews page with feedback survey responses
- Magic Topics (coming soon placeholder)
- "Unreviewed Only" filter, 20 items pagination
- Review -> Reel creation workflow

### Reels (`/reel/:reelId`)
- Three-column layout (preview | video player | clips)
- Drag-to-reorder clips
- Add video: Upload, Search answers, Media Library
- Share: Link sharing, display mode, password protection
- Status: Unpublished -> Pending -> Created (or Failed)
- Transcoding polling: 3s interval

### Rewards (`/rewards`)
- Tremendous integration for monetary rewards
- 7 currencies: USD, EUR, CAD, THB, CNY, SEK, GBP
- Reward statuses: Succeeded, Processing, Queued, Failed variants
- Permission: `tremendousSettings` required
- Bulk selection across filters

### Integrations (`/settings/integrations`)
- 15 categories of tools via Composio
- Auth methods: OAUTH2, API_KEY, BEARER_TOKEN
- Connection statuses: ACTIVE, ERROR, REVOKED, PENDING
- Callback route: `/integrations/callback/composio`

### Admin (`/admin`) - Enterprise Only
11 admin pages (all lazy-loaded):
1. **Dashboard** - Embedded Metabase iframe
2. **Brand Management** - Search/filter/bulk update brands
3. **Campaign Templates** - CRUD with survey linking
4. **Agents Admin** - Workspace selector, YAML import, bulk management
5. **Agents V2 Admin** - Search, select, delete, copy
6. **Surveys Admin** - Workspace selector, clone surveys
7. **SSO Providers** - CRUD (providerName, domain, config, active)
8. **Workspace Management** - Bulk feature updates, credit management
9. **System Prompts** - CRUD with versioning
10. **Taxonomy Management** - 5 tabs (Facet Editor, Constraints, Versions, Sync, AI Recommend)
11. **Vurvey Employees** - CRUD, role management, OpenFGA sync

### Image Studio (`/image-studio`)
- 5 nested context providers
- Tools: Draw brush, Erase brush, Reset, Brush size picker
- AI operations: Enhance, Upscale, Change/Edit, Convert to Video
- Video config: Duration (5-8s), aspect ratio, resolution, audio, sample count
- History via URL search params

---

## Appendix: Key Constants

| Constant | Value |
|----------|-------|
| Video response timer options | 30s, 1min (PRO), 3min (PRO), 5min (ENTERPRISE), 10min (ENTERPRISE) |
| Copilot conversations limit | 10 |
| User field max length | 200 characters |
| Agent max tokens | 8192 |
| Table page size (default) | 100 rows |
| Tooltip delay (default) | 400ms |
| Mobile breakpoint | < 780px |
| Tablet breakpoint | 780-1280px |
| Desktop breakpoint | >= 1280px |
| Streaming timeout | 3 minutes (180s) |
| Grounding timeout | 30 seconds |
| Route prefetch throttle | 5000ms per route |
| Route prefetch retention | 5 minutes |
| WebSocket auth retries | 5 with 1.5s delay |
| Workspace switch threshold | 7 (inline dropdown vs modal) |
| Batch file upload size | 20 files per batch |
| Dataset name max length | 35 characters |
| Dataset description max length | 255 characters |
| Agent name | 3-50 characters |
| Agent biography | 20-1000 characters |
| Agent objective | 1-500 characters |
| Workflow name max | 150 characters |
| Workflow objective max | 500 characters |
| Task timeout | 60 minutes |
