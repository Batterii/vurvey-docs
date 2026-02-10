# Forecast

::: warning Feature Flag Required
Forecast is only available when the `forecastEnabled` feature flag is active on your workspace. If you don't see Forecast in your sidebar navigation, contact your workspace administrator or account manager.
:::

Forecast provides AI-powered predictive analytics and model comparison capabilities for understanding future trends and outcomes based on your research data.

## Overview

The Forecast module helps you:
- Build and validate predictive models from your data
- Compare multiple forecasting approaches side by side
- Discover patterns and drivers in your datasets
- Optimize strategies based on predictive insights

Access Forecast from the main sidebar (when enabled in your workspace).

## Navigation

The Forecast section includes 5 sub-pages:

| Page | Purpose |
|------|---------|
| **Forecast View** | Main dashboard showing forecast results and visualizations |
| **Model Validation** | Test and validate your forecasting models against historical data |
| **Model Comparison** | Compare up to 5 different forecasting models side by side |
| **Discover** | Upload data for pattern discovery and insight generation |
| **Optimize** | Identify optimal strategies based on forecast outputs |

## Forecast View

The Forecast View dashboard displays your active forecasts with interactive visualizations.

**Key Elements:**
- **Forecast timeline** — Visual chart showing predicted outcomes over time
- **Confidence intervals** — Upper and lower bounds for forecast uncertainty
- **Actual vs. Predicted** — Historical comparison of forecast accuracy
- **Key drivers** — Factors influencing the forecast
- **Scenario controls** — Adjust input variables to see how forecasts change

### Working with Forecasts

**View a forecast:**
1. Navigate to Forecast View
2. Select a forecast from the list
3. Explore the visualization and key metrics
4. Adjust scenario variables to see impacts

**Create a new forecast:**
1. Click **+ New Forecast**
2. Select your data source (dataset or campaign)
3. Choose the outcome variable to predict
4. Configure forecast parameters (time horizon, confidence level)
5. Generate the forecast

## Model Validation

Test how well your forecasting models perform against known historical data.

**Validation Process:**
1. Split your data into training and testing sets
2. Build a model using the training data
3. Generate predictions for the test period
4. Compare predictions to actual outcomes
5. Review accuracy metrics (RMSE, MAE, R-squared)

**Validation Metrics:**

| Metric | What It Measures | Good Performance |
|--------|------------------|------------------|
| **RMSE** (Root Mean Squared Error) | Average prediction error magnitude | Lower is better |
| **MAE** (Mean Absolute Error) | Average absolute difference from actual | Lower is better |
| **R-squared** | How much variance the model explains | Higher is better (0–1 scale) |
| **MAPE** (Mean Absolute Percentage Error) | Average percentage error | Lower is better |

## Model Comparison

Compare up to 5 forecasting models simultaneously to identify the best approach for your data.

**Comparison View:**
- **Side-by-side forecasts** — Visual overlay of multiple model predictions
- **Accuracy table** — Performance metrics for each model
- **Winner indicator** — Highlight of the best-performing model
- **Trade-offs analysis** — Speed, accuracy, and complexity for each approach

**Supported Model Types:**
- Time series models (ARIMA, exponential smoothing)
- Machine learning models (regression, ensemble methods)
- AI-powered models (neural networks, deep learning)
- Hybrid approaches (combining multiple techniques)

::: tip Model Selection Strategy
- **Simple models** (like linear regression) work well for stable, well-understood relationships
- **Time series models** excel when historical patterns are strong predictors
- **Machine learning models** handle complex, non-linear relationships
- **Ensemble models** combine multiple approaches for robustness

Start simple and add complexity only if validation metrics improve meaningfully.
:::

## Discover

Upload CSV data for AI-powered pattern discovery and insight generation.

**Discovery Process:**
1. Navigate to Discover
2. Click **Upload CSV**
3. Select your data file (structured CSV format)
4. The system processes the file and generates insights
5. Review discovery results and patterns

**What Discovery Finds:**
- **Correlations** — Which variables move together
- **Segments** — Natural groupings in your data
- **Anomalies** — Outliers or unusual patterns
- **Trends** — Directional movements over time
- **Key drivers** — Variables with the strongest predictive power

### CSV Upload Requirements

| Requirement | Details |
|-------------|---------|
| **Format** | CSV (comma-separated values) |
| **Headers** | First row must contain column names |
| **Data types** | Numeric, date, and text columns supported |
| **Size limit** | Check your workspace limits |
| **Encoding** | UTF-8 recommended |

**Discovery Status:**
The system polls for analysis completion every few seconds. Processing time depends on dataset size and complexity.

## Optimize

Use forecast insights to identify optimal strategies for your goals.

**Optimization Scenarios:**
- **Resource allocation** — How to distribute budget across channels for maximum impact
- **Pricing strategy** — Optimal price points based on demand forecasting
- **Product mix** — Which products to emphasize for revenue maximization
- **Market timing** — When to launch initiatives for best outcomes

**Optimization Process:**
1. Define your objective (e.g., maximize revenue, minimize cost, optimize conversion)
2. Set constraints (budget limits, operational boundaries)
3. Identify controllable variables (price, spend, timing)
4. Run optimization algorithms
5. Review recommended strategy
6. Test with sensitivity analysis

## GraphQL Operations

Forecast uses several specialized queries:

| Query | Purpose |
|-------|---------|
| `GET_FORECAST_ITEMS` | List all forecasts in workspace |
| `GET_FORECAST` | Retrieve a specific forecast with results |
| `GET_FORECAST_ANALYSIS` | Get detailed analysis for a forecast |
| `GET_MODEL_COMPARISON` | Fetch comparison results for multiple models |
| `GET_DISCOVERY_INSIGHTS` | Retrieve insights from discovery analysis |

## Common Workflows

### Monthly Sales Forecast

**Scenario:** Predict next quarter's sales based on historical data and market trends.

**Workflow:**
1. Upload historical sales data via Discovery
2. Create a forecast in Forecast View with a 90-day horizon
3. Validate the model using the past year's data in Model Validation
4. If accuracy is insufficient, build 2–3 alternative models
5. Use Model Comparison to identify the best approach
6. Apply the winning model to generate the forecast
7. Share results with stakeholders

### Campaign Performance Prediction

**Scenario:** Estimate how a new campaign will perform based on past campaign data.

**Workflow:**
1. Connect past campaign datasets as sources
2. Use Discovery to identify the strongest performance drivers
3. Build a forecast model using those drivers
4. Validate against recent campaigns
5. Input planned campaign parameters
6. Generate performance predictions
7. Use Optimize to refine campaign strategy

### Market Sizing Estimation

**Scenario:** Estimate total addressable market for a new product category.

**Workflow:**
1. Upload market research data and demographic information
2. Use Discovery to find population segments most likely to adopt
3. Build a penetration forecast model
4. Compare multiple estimation approaches in Model Comparison
5. Select the most conservative estimate for planning purposes
6. Document assumptions and confidence intervals

## Best Practices

### Data Quality

- **Clean data first** — Remove duplicates, fix errors, and handle missing values before forecasting
- **Sufficient history** — Most models need at least 24 data points (e.g., 2 years of monthly data)
- **Consistent granularity** — Use the same time intervals throughout (daily, weekly, monthly)
- **Relevant features** — Include variables that logically influence your outcome

### Model Selection

- **Start simple** — Begin with basic models and add complexity only if needed
- **Validate rigorously** — Always test against held-out data
- **Check assumptions** — Make sure your data meets model requirements
- **Document choices** — Record why you selected each model and its limitations

### Interpretation

- **Confidence intervals matter** — Forecasts are ranges, not point predictions
- **Understand drivers** — Know which factors influence your forecast most
- **Plan for uncertainty** — Build strategies that work across the confidence range
- **Update regularly** — Refresh forecasts as new data becomes available

## Troubleshooting

**Forecast option not visible in sidebar?**
The `forecastEnabled` feature flag is not active on your workspace. Contact your administrator to enable Forecast.

**CSV upload fails?**
Check that:
- File is in CSV format
- First row contains column headers
- No special characters in column names
- File size is within limits
- File is encoded as UTF-8

**Discovery takes too long?**
Large datasets (100,000+ rows) may take several minutes to process. The system polls for updates every few seconds. If processing exceeds 10 minutes, try:
- Reducing the dataset size
- Removing unnecessary columns
- Simplifying data types

**Model validation shows poor accuracy?**
Your model may not fit the data well. Try:
- Collecting more historical data
- Including additional predictive variables
- Testing different model types
- Checking for data quality issues
- Adjusting forecast horizon (shorter may be more accurate)

**Model comparison stuck loading?**
Comparing more than 5 models may cause performance issues. Reduce to 5 or fewer models and try again. Refresh the page if the issue persists.

**Optimization doesn't find a solution?**
Your constraints may be too restrictive or conflicting. Try:
- Relaxing some constraints
- Expanding variable ranges
- Simplifying the objective function
- Checking for logical errors in constraint definitions

## Frequently Asked Questions

::: details Click to expand

**Q: How much historical data do I need for accurate forecasts?**
A: Generally, at least 24 data points (2 years of monthly data or 2 years of quarterly data). More data improves accuracy, especially for seasonal patterns.

**Q: Can I export forecast results?**
A: Yes. Use the export option in Forecast View to download results as CSV or PDF.

**Q: How often should I update my forecasts?**
A: Update whenever significant new data becomes available or when actual outcomes deviate from predictions. Monthly updates are typical for business forecasts.

**Q: What's the maximum forecast horizon?**
A: This depends on your data and model. Longer horizons have wider confidence intervals. Most models are accurate for 3–12 months ahead.

**Q: Can I integrate external data sources?**
A: Yes. Upload external data via Discovery or connect it as a dataset before creating forecasts.

**Q: Do forecasts account for seasonality?**
A: Advanced time series models automatically detect and incorporate seasonal patterns. Simpler models may require manual seasonal adjustment.

**Q: How do I know which model to trust?**
A: Use Model Validation to test accuracy on historical data. The model with the lowest error metrics on the test set is typically most reliable.

**Q: Can I forecast non-numeric outcomes?**
A: Forecast is optimized for numeric predictions (sales, revenue, counts). For categorical outcomes (yes/no, segment assignment), use classification models in the Agents or Workflows modules.
:::

## Next Steps

- [Upload datasets for forecasting](/guide/datasets)
- [Create agents for forecast analysis](/guide/agents)
- [Automate forecasts with workflows](/guide/workflows)
- [Share insights through campaigns](/guide/campaigns)
