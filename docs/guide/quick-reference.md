# Quick Reference

A handy reference guide for common Vurvey tasks and navigation.

## Navigation

The left sidebar provides quick access to all sections:

| Sidebar Item | Section | Purpose |
|--------------|---------|---------|
| **Home** | Chat Interface | AI-powered conversational research |
| **Agents** | Agent Gallery | Manage AI personas and assistants |
| **Audience** | People Management | Populations, contacts, lists, properties |
| **Campaigns** | Survey Management | Create and manage research surveys |
| **Datasets** | File Organization | Upload and organize data for AI analysis |
| **Workflow** | Automation (Beta) | Build automated research pipelines |

## Common Tasks

### Starting Research

| Task | How To |
|------|--------|
| Quick question | Home > Type in chat input > Press Enter |
| Use specific agent | Home > Agent dropdown > Select agent > Chat |
| Reference my data | Home > Enable "My Data" mode > Select sources > Chat |
| Search the web | Home > Enable "Web" mode > Ask question |

### Managing Content

| Task | Location |
|------|----------|
| Create an agent | Agents > + Create Agent (6-step builder) |
| Upload files | Datasets > Create Dataset > Add files |
| Build audience | Audience > Populations |
| Launch survey | Campaigns > + Create Campaign |
| Automate tasks | Workflow > Create new workflow |

### Finding Information

| Task | Method |
|------|--------|
| Search agents | Agents page > Search field |
| Find campaigns | Campaigns page > Search field |
| Locate datasets | Datasets page > Search field |
| View past chats | Home > Conversations sidebar > View all |
| Search contacts | Audience > Humans > Search |

## Chat Modes

| Mode | Icon | When to Use |
|------|------|-------------|
| **Chat** | Default | General questions, brainstorming, creative tasks |
| **My Data** | Data icon | Questions about your uploaded files and datasets |
| **Web** | Globe icon | Current events, external research, competitive analysis |

Modes can be combined for comprehensive analysis.

## People Section Tabs

| Tab | Route | Purpose |
|-----|-------|---------|
| **Populations** | /audience | Synthetic and real audience groups |
| **Humans** | /audience/community | Individual participant records |
| **Lists & Segments** | /audience/segments | Reusable audience segments |
| **Properties** | /audience/properties | Custom contact attributes |

## Agent Builder Steps

| Step | Name | Purpose |
|------|------|---------|
| 1 | **Objective** | Choose agent type and define mission |
| 2 | **Facets** | Select personality traits |
| 3 | **Instructions** | Add knowledge, tools, datasets |
| 4 | **Identity** | Set name, bio, voice |
| 5 | **Appearance** | Upload/generate avatar |
| 6 | **Review** | Test and activate |

## Campaign Status Guide

| Status | Meaning | Available Actions |
|--------|---------|-------------------|
| **Draft** | In development, not live | Edit, Preview, Launch |
| **Open** | Actively collecting responses | Monitor, Pause, Close |
| **Closed** | Collection complete | View Results, Export, Archive |
| **Blocked** | Temporarily paused | Review, Resume, Close |
| **Archived** | Inactive but preserved | View Results, Unarchive |

## Dataset File Status

| Status | Meaning |
|--------|---------|
| **Uploaded** | Received, waiting for processing |
| **Processing** | AI is analyzing the file |
| **Success** | Ready for use in conversations |
| **Failed** | Processing error (retry available) |

## Workflow Status Guide

| Status | Meaning |
|--------|---------|
| **Building** | In development mode |
| **Running** | Currently executing |
| **Completed** | Finished successfully |
| **Failed** | Error occurred |
| **Cancelled** | Manually stopped |

## File Format Support

### Documents
PDF, DOCX, TXT, MD, CSV, JSON

### Presentations
PPTX, XLSX

### Media
MP4, MOV, MP3, WAV

### Images
PNG, JPG, GIF

## Agent Types

| Type | Best For |
|------|----------|
| **Assistant** | General help, Q&A, broad research |
| **Consumer Persona** | Simulating consumer perspectives |
| **Product** | Product-specific expertise and analysis |
| **Visual Generator** | Creating visual content and imagery |

## Permission Levels

Used across Agents, Campaigns, Datasets, and Workflows:

| Permission | Allows |
|------------|--------|
| **Edit** | Modify configuration and content |
| **Delete** | Remove the resource |
| **Manage** | Share and modify permissions |

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send message | `Enter` |
| New line in chat | `Shift + Enter` |
| New conversation | Click `+` button |

## Workflow Node Types

| Node | Purpose |
|------|---------|
| **Variables** | Define input parameters |
| **Sources** | Select data sources |
| **Agent Task** | AI agent step with prompt |
| **Output** | Final results summary |

## Troubleshooting

### Chat Not Responding
1. Check your internet connection
2. Refresh the browser page
3. Try a different browser
4. Clear browser cache and cookies
5. Check if selected agent is available

### File Upload Failed
1. Verify file format is supported
2. Check file size limits
3. Try re-uploading the file
4. Split large files if needed
5. Check available storage quota

### Campaign Not Launching
1. Verify all required fields are complete
2. Check your credit balance
3. Confirm targeting settings are valid
4. Preview campaign before launching
5. Review any validation errors

### Dataset Processing Stuck
1. Check the status badge
2. Wait for automatic polling (30 seconds)
3. Refresh the page
4. Retry failed files
5. Contact support if extended

### Workflow Not Running
1. Check workflow has no validation errors
2. Ensure no unsaved changes exist
3. Verify agents are assigned
4. Review schedule configuration
5. Test with manual run first

## Getting Help

- **In-app chat**: Ask the AI assistant about features
- **Documentation**: This site (you're here!)
- **Support**: Contact workspace administrator
- **Status page**: Check system status for outages

## Glossary

| Term | Definition |
|------|------------|
| **Agent** | AI persona configured to respond to queries |
| **Population** | Group of synthetic or real participants |
| **Campaign** | Research survey or study collecting responses |
| **Dataset** | Collection of files for AI analysis |
| **Workflow** | Automated multi-step research process |
| **Credits** | Currency for AI operations on the platform |
| **Magic Summary** | AI-generated data summary |
| **Magic Reels** | AI-compiled video highlights |
| **Workspace** | Isolated environment for a team or project |
| **Training Set** | Backend term for Dataset |
| **AI Orchestration** | Backend term for Workflow |

## URL Structure

All pages in Vurvey use workspace-scoped URLs:

```
https://app.vurvey.com/{workspaceId}/agents
https://app.vurvey.com/{workspaceId}/audience
https://app.vurvey.com/{workspaceId}/audience/community
https://app.vurvey.com/{workspaceId}/campaigns
https://app.vurvey.com/{workspaceId}/datasets
https://app.vurvey.com/{workspaceId}/workflow
https://app.vurvey.com/{workspaceId}/workflow/flows
```

The Home (chat) page is at the workspace root: `/{workspaceId}/`

## Best Practices Summary

### For Chat
- Be specific with questions
- Use appropriate mode for your query
- Select relevant data sources
- Ask follow-up questions to refine

### For Agents
- Define clear personalities and expertise
- Set specific instructions
- Test before production use
- Connect relevant knowledge sources

### For Campaigns
- Use templates when possible
- Test with small samples first
- Monitor response quality
- Close campaigns promptly when done

### For Datasets
- Use clear, descriptive names
- Apply consistent labels
- Ensure files are processed before use
- Retry failed files promptly

### For Workflows
- Start simple, add complexity gradually
- Test with manual runs first
- Monitor initial executions closely
- Use email notifications for important workflows

---

**Need more help?** Ask in the chat interface or browse the detailed guides in the sidebar:

- [Sources & Citations](/guide/sources-and-citations)
- [Permissions & Sharing](/guide/permissions-and-sharing)
- [Automation & QA](/guide/automation-and-qa)
