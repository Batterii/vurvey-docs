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
| Create an agent | Agents > + Create Agent |
| Upload files | Datasets > + Create Dataset |
| Build audience | Audience > Populations > + Create Population |
| Launch survey | Campaigns > + Create Campaign |
| Automate tasks | Workflow > + Create Workflow |

### Finding Information

| Task | Method |
|------|--------|
| Search agents | Agents page > Search field |
| Find campaigns | Campaigns page > Search field |
| Locate datasets | Datasets page > Search field |
| View past chats | Home > Conversations sidebar > View all |
| Search contacts | Audience > Contacts > Search |

## Chat Modes

| Mode | Icon | When to Use |
|------|------|-------------|
| **Chat** | Default | General questions, brainstorming, creative tasks |
| **My Data** | Data icon | Questions about your uploaded files and datasets |
| **Web** | Globe icon | Current events, external research, competitive analysis |

Modes can be combined for comprehensive analysis.

## People Section Tabs

| Tab | Purpose |
|-----|---------|
| **Populations** | Synthetic and real audience groups for agents |
| **Contacts** | Individual participant records |
| **Lists** | Reusable audience segments |
| **Properties** | Custom contact attributes |

## Campaign Status Guide

| Status | Meaning | Available Actions |
|--------|---------|-------------------|
| **Draft** | In development, not live | Edit, Preview, Launch |
| **Open** | Actively collecting responses | Monitor, Pause, Close |
| **Closed** | Collection complete | View Results, Export, Archive |

## Workflow Status Guide

| Status | Meaning |
|--------|---------|
| **Pending** | Scheduled, waiting to run |
| **Running** | Currently executing |
| **Completed** | Finished successfully |
| **Failed** | Error occurred |
| **Paused** | Waiting for input |

## File Format Support

### Documents
PDF, DOCX, TXT, MD, RTF

### Spreadsheets
XLSX, CSV, XLS

### Media
MP4, MP3, WAV, MOV, AVI

### Images
PNG, JPG, GIF, SVG

### Data
JSON, XML

## Agent Types

| Type | Best For |
|------|----------|
| **Assistant** | General help, Q&A, broad research |
| **Consumer Persona** | Simulating consumer perspectives |
| **Expert** | Domain-specific analysis |
| **Analyst** | Data interpretation and insights |

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send message | `Enter` |
| New line in chat | `Shift + Enter` |
| New conversation | Click `+` button |

## Workflow Triggers

| Trigger | Description |
|---------|-------------|
| **Manual** | Click to run on-demand |
| **Scheduled** | Time-based (daily, weekly, custom cron) |
| **Event** | Triggered by actions (campaign complete, data upload) |
| **Webhook** | External system triggers via HTTP |

## Troubleshooting

### Chat Not Responding
1. Check your internet connection
2. Refresh the browser page
3. Try a different browser
4. Clear browser cache and cookies
5. Check if selected agent is available

### File Upload Failed
1. Verify file size is within limits
2. Confirm format is supported
3. Try re-uploading the file
4. Split large files into smaller chunks
5. Check available storage quota

### Campaign Not Launching
1. Verify all required fields are complete
2. Check your credit balance
3. Confirm targeting settings are valid
4. Preview campaign before launching
5. Review any validation errors

### Workflow Not Running
1. Check trigger configuration
2. Verify all steps are properly connected
3. Confirm agents referenced are available
4. Review error logs from previous runs
5. Test with manual trigger first

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

## URL Structure

All pages in Vurvey use workspace-scoped URLs:

```
https://app.vurvey.com/{workspaceId}/agents
https://app.vurvey.com/{workspaceId}/audience
https://app.vurvey.com/{workspaceId}/campaigns
https://app.vurvey.com/{workspaceId}/datasets
https://app.vurvey.com/{workspaceId}/workflow
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
- Organize with descriptive names
- Use labels for categorization
- Keep content current
- Remove outdated files

### For Workflows
- Start simple, add complexity gradually
- Test with sample data first
- Monitor initial runs closely
- Document what each step does

---

**Need more help?** Ask in the chat interface or browse the detailed guides in the sidebar.
