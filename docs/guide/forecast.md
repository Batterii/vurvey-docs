# Forecast

Vurvey's Forecast feature uses AI-powered analytics to predict trends and patterns in your data. It provides multiple tools for model validation, comparison, and discovery of insights.

:::info API Terminology
In the codebase, Forecast is enabled via the `forecastEnabled` workspace setting. This feature is currently in beta and may require specific workspace configuration.
:::

![Forecast main interface](/vurvey-docs/screenshots/forecast/01-forecast-main.png?optional=1)

## Overview

Forecast provides five main tools:

| Section | Purpose |
|---------|---------|
| **Forecast View** | Main analysis interface with AI-generated insights |
| **Model Validation** | Validate forecast accuracy and confidence |
| **Model Comparison** | Compare up to 5 different forecast models |
| **Discover** | AI-powered pattern discovery from data |
| **Optimize** | Optimization tools (coming soon) |

## Feature Flag Requirement

:::warning Workspace Configuration Required
Forecast must be enabled in your workspace settings. If the feature is not available:
1. Contact your workspace administrator
2. Verify your workspace plan includes Forecast features
3. Check that `forecastEnabled` is true in workspace settings
:::

## Forecast View

The main forecast interface lets you analyze trends with customizable parameters.

### Input Parameters

Configure your forecast analysis:

| Parameter | Description | Options |
|-----------|-------------|---------|
| **Item** | What you're forecasting | Selectable from available items |
| **Geography** | Region for analysis | Location-specific options |
| **Time Granularity** | Analysis period | Daily, Weekly, Monthly, Quarterly, Yearly |
| **Confidence Level** | Prediction certainty | Low, Medium, High (percentage-based) |

### Workflow

1. Navigate to **Forecast** from the sidebar
2. Select an **Item** to analyze
3. Choose a **Geography** region
4. Set **Time Granularity** (e.g., Monthly)
5. Adjust **Confidence Level**
6. View AI-generated analysis and charts
7. Click **Start Conversation** to discuss insights with AI

### AI-Generated Analysis

The forecast displays:
- **Chart visualization** showing trends over time
- **Markdown-formatted insights** explaining patterns
- **Confidence indicators** for predictions
- **Interactive conversation** to explore findings further

## Model Validation

Validate the accuracy of your forecast models.

### Using Model Validation

1. Click **Model Validation** in the Forecast navigation
2. Configure the same input parameters (Item, Geography, etc.)
3. View validation charts showing:
   - Actual vs. predicted values
   - Error margins
   - Confidence intervals
   - Model performance metrics

### Validation Metrics

The validation page helps you understand:
- How well the model predicts actual outcomes
- Where the model is most/least accurate
- Confidence level appropriateness
- Data quality indicators

## Model Comparison

Compare multiple forecast models side-by-side.

### Comparing Models

1. Click **Model Comparison** in navigation
2. Click **Select Models** button
3. Choose up to **5 models** to compare
4. Set **Time Granularity** for comparison period
5. View side-by-side chart with legend

### Comparison Features

- **Multi-model overlay**: See all models on one chart
- **Color-coded legends**: Distinguish between models
- **Performance comparison**: Identify best-performing model
- **Time period adjustment**: Switch granularity dynamically

### Use Cases

- **A/B testing forecast approaches**: Test different methodologies
- **Model selection**: Choose the most accurate model
- **Ensemble validation**: Verify consistency across models

## Discover

The Discovery Engine automatically surfaces patterns and insights from your forecast data.

### Discovery Modes

The Discover page offers two modes:

#### Predefined Mode

Use pre-built discovery queries:
1. Select from predefined analysis patterns
2. View automatically generated insights
3. Explore highlighted trends and anomalies

#### Upload Mode

Upload custom data for discovery:
1. Switch to **Upload Mode**
2. Upload CSV with forecast data
3. System analyzes and surfaces patterns
4. AI generates insights from uploaded data

### Discovery Workflows

**Market Trend Analysis:**
- Upload sales data
- AI identifies seasonal patterns
- Highlights anomalies and outliers
- Suggests optimization strategies

**Competitive Intelligence:**
- Compare multiple data sources
- Discover correlation patterns
- Identify market opportunities

## Optimize (Coming Soon)

The Optimize page is a placeholder for future optimization features.

## Common Workflows

### Weekly Trend Review

1. Open **Forecast View**
2. Select your key item and geography
3. Set time granularity to **Weekly**
4. Review AI-generated analysis
5. Export insights to Dataset or start conversation

### Model Selection Process

1. Go to **Model Comparison**
2. Select 3-5 candidate models
3. Compare across multiple time periods
4. Use **Model Validation** to verify accuracy
5. Choose best-performing model for production

### Pattern Discovery

1. Navigate to **Discover**
2. Upload historical data (CSV format)
3. Review AI-discovered patterns
4. Investigate anomalies and trends
5. Apply insights to business strategy

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Forecast not visible in sidebar | Verify `forecastEnabled` feature flag in workspace settings |
| "No items available" error | Contact administrator to configure forecast items |
| Charts not loading | Check data availability for selected item/geography |
| Analysis fails to generate | Verify sufficient data exists for selected parameters |
| Model comparison shows empty | Select models first using "Select Models" button |

## Best Practices

### Data Quality

- **Consistent granularity**: Use same time periods across analysis
- **Complete datasets**: Ensure no gaps in historical data
- **Regular updates**: Refresh forecast data periodically
- **Geography specificity**: Use precise location data when available

### Confidence Levels

- **High confidence**: Use for short-term forecasts with stable data
- **Medium confidence**: Balanced approach for most scenarios
- **Low confidence**: Appropriate for long-term or volatile forecasts

### Analysis Interpretation

- **Combine tools**: Use Validation + Comparison + Discover together
- **Context matters**: Consider external factors affecting forecasts
- **Iterative refinement**: Adjust parameters based on validation results
- **Document assumptions**: Note confidence levels and data sources

## FAQ

**Q: How do I enable Forecast in my workspace?**
A: Contact your workspace administrator. Forecast requires the `forecastEnabled` feature flag to be turned on in workspace settings.

**Q: How many models can I compare?**
A: Up to 5 models can be compared simultaneously in the Model Comparison view.

**Q: What file format does Discover accept?**
A: CSV format is supported for uploading custom data in Discover mode.

**Q: Can I export forecast results?**
A: Yes, use the "Start Conversation" button to interact with insights, then save the conversation or export data to a Dataset.

**Q: Why are my forecasts inaccurate?**
A: Use Model Validation to check accuracy. Common causes: insufficient historical data, inappropriate confidence level, or external factors not captured in the model.

## Related Features

- [Datasets](/guide/datasets) - Store and manage forecast data
- [Workflows](/guide/workflows) - Automate forecast generation
- [Home (Chat)](/guide/home) - Discuss forecast insights with AI agents
