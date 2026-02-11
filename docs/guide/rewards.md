# Rewards

Vurvey integrates with **Tremendous** to enable automated participant incentives for your campaigns. Configure reward settings at the workspace level, then assign reward amounts per campaign during the launch flow.

## Overview

The rewards system lets you:
- Send monetary incentives to campaign participants automatically
- Support multiple currencies (USD, EUR, CAD, THB, CNY, SEK, GBP)
- Track reward disbursement status per campaign

::: info API Term: Tremendous
In the Vurvey API and codebase, reward configuration is stored on the `Workspace` model via Tremendous API credentials. Campaign-level reward amounts are part of the `Survey` (Campaign) launch configuration.
:::

## Setup

Rewards are configured in **Settings → General Settings → Tremendous Rewards Configuration**.

**Configuration steps:**
1. Navigate to **Settings** from the workspace dropdown menu
2. Scroll to the **Tremendous Rewards Configuration** section
3. Click **Edit** or **Configure**
4. Enter your Tremendous API key
5. Select your default funding source
6. Choose your default reward currency
7. Click **Save**

::: tip Getting a Tremendous API Key
Sign up at [tremendous.com](https://www.tremendous.com) and generate an API key from your Tremendous dashboard. Use a **test** API key during setup, then switch to your **production** key when ready to send real rewards.
:::

## Supported Currencies

| Currency | Code |
|----------|------|
| US Dollar | USD |
| Euro | EUR |
| Canadian Dollar | CAD |
| Thai Baht | THB |
| Chinese Yuan | CNY |
| Swedish Krona | SEK |
| British Pound | GBP |

## Using Rewards in Campaigns

Once Tremendous is configured at the workspace level:

1. Create or edit a **Campaign**
2. In the **Launch** flow, enable participant rewards
3. Set the reward amount per completed response
4. Launch the campaign — rewards are sent automatically when participants complete the survey

::: warning Funding Source Required
Ensure your Tremendous account has a valid funding source with sufficient balance before launching a rewarded campaign. Rewards that fail to send due to insufficient funds will appear as errors in your Tremendous dashboard.
:::

## Troubleshooting

### Rewards Not Appearing in Campaign Launch

**Symptoms:** The reward option is missing when launching a campaign.

**Solution:**
1. Verify Tremendous is configured in [Settings → General Settings](/guide/settings#tremendous-rewards-configuration)
2. Confirm your Tremendous API key is valid
3. Check that you've selected a default funding source
4. Ensure the currency is set

### Participants Not Receiving Rewards

**Symptoms:** Campaign is complete but participants haven't received their incentives.

**Solution:**
1. Check your Tremendous dashboard for failed or pending disbursements
2. Verify your funding source has sufficient balance
3. Confirm the participant's email address is valid
4. Contact Tremendous support if disbursements show as "failed"

---

## Related Pages

- [Settings](/guide/settings) — Workspace-level configuration including Tremendous setup
- [Campaigns](/guide/campaigns) — Creating and launching campaigns with reward incentives
