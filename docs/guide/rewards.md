# Rewards

::: warning Permission Required
Access to Rewards requires the `tremendousSettings` permission on your workspace. If you don't see Rewards in your navigation, contact your workspace administrator.
:::

The Rewards module lets you distribute monetary incentives to campaign participants and research community members through integration with Tremendous, a digital rewards platform.

![Rewards Main](/screenshots/rewards/01-rewards-main.png)

## Overview

Rewards helps you:
- Send monetary incentives to survey respondents
- Manage reward distribution at scale
- Track reward status and delivery
- Support multiple currencies for global audiences
- Bulk-select and process rewards efficiently

Access Rewards from the workspace dropdown menu in the header.

::: info What is Tremendous?
Tremendous is a third-party digital rewards platform that enables you to send gift cards, prepaid cards, and other monetary incentives globally. Vurvey integrates with Tremendous to streamline incentive distribution for research participants.
:::

## Getting Started

### Configure Tremendous Integration

Before you can send rewards, configure the Tremendous integration in **Settings → General → Tremendous Rewards Integration**:

1. Navigate to Settings → General
2. Scroll to the **Tremendous Rewards Integration** section
3. Click **Set up Tremendous**
4. Enter your Tremendous API key
5. Select your funding sources (payment methods on file with Tremendous)
6. Choose your default currency
7. Save your configuration

::: tip Getting a Tremendous Account
If you don't have a Tremendous account:
1. Visit [tremendous.com](https://www.tremendous.com)
2. Sign up for a business account
3. Complete identity verification
4. Add a funding source (bank account or credit card)
5. Generate an API key from your Tremendous dashboard
6. Return to Vurvey and enter the API key in Settings
:::

### Supported Currencies

Vurvey supports 7 currencies through Tremendous:

| Currency | Code | Regions |
|----------|------|---------|
| **US Dollars** | USD | United States, international |
| **Euros** | EUR | European Union, international |
| **Canadian Dollars** | CAD | Canada |
| **Thai Baht** | THB | Thailand |
| **Chinese Yuan** | CNY | China |
| **Swedish Krona** | SEK | Sweden |
| **British Pounds** | GBP | United Kingdom |

Select the appropriate currency when creating reward campaigns based on where your participants are located.

## Rewards Dashboard

The Rewards dashboard displays all rewards you've created, with details on status, recipients, and amounts.

### Reward List View

Each reward entry shows:
- **Recipient name** — Who will receive the reward
- **Recipient email** — Email where the reward will be delivered
- **Amount** — Reward value and currency
- **Status** — Current delivery state (see status types below)
- **Created date** — When the reward was issued
- **Campaign** — Associated survey or research project (if applicable)

### Reward Statuses

| Status | What It Means | What Happens Next |
|--------|---------------|-------------------|
| **Succeeded** | Reward delivered successfully | Recipient can claim their reward |
| **Processing** | Currently being sent by Tremendous | Wait for completion (usually < 1 minute) |
| **Queued** | Waiting to be processed | Will move to Processing shortly |
| **Failed - Invalid Email** | Email address was invalid | Fix email and resend |
| **Failed - Insufficient Funds** | Not enough balance in Tremendous account | Add funds to Tremendous and retry |
| **Failed - Other** | Another error occurred | Check error details and retry |

### Filtering and Search

**Filter by status:**
- All rewards
- Succeeded only
- Failed only
- Processing/Queued

**Search:**
- Search by recipient name or email
- Search by campaign name
- Search by amount

### Bulk Selection

Select multiple rewards using checkboxes to:
- **Export** selected rewards as CSV
- **Retry** failed rewards
- **View total** amount for selected rewards

Bulk selection works across all filters, making it easy to process rewards by status or campaign.

## Creating Rewards

### Manual Reward Creation

Create individual rewards for specific participants:

1. Click **+ Create Reward**
2. Enter recipient details:
   - Full name
   - Email address
3. Select currency
4. Enter reward amount
5. (Optional) Add a custom message
6. (Optional) Associate with a campaign
7. Click **Send Reward**

The reward processes immediately and the recipient receives an email from Tremendous with claim instructions.

### Campaign-Based Rewards

Automatically reward survey participants:

1. Create or open a campaign
2. Navigate to **Audience** or **Participation** tab
3. Select participants to reward (those who completed the survey)
4. Click **Send Rewards**
5. Configure reward amount and currency
6. Review recipient list
7. Confirm and send

All selected participants receive rewards simultaneously.

::: tip When to Send Campaign Rewards
- **Upon completion** — Reward participants immediately after they finish
- **Quality-based** — Reward only participants who provided high-quality responses
- **Milestone-based** — Reward at specific participation milestones (e.g., after 100 responses)
- **Lottery-style** — Randomly select a subset of participants for larger rewards
:::

## Reward Management

### Retrying Failed Rewards

When a reward fails, fix the issue and retry:

1. Locate the failed reward in the list
2. Check the failure reason in the status column
3. If it's an invalid email, edit the recipient's email address
4. If it's insufficient funds, add money to your Tremendous account
5. Select the failed reward
6. Click **Retry**

The system attempts to resend the reward immediately.

### Bulk Retry

Retry multiple failed rewards at once:

1. Filter to show only failed rewards
2. Select all failed rewards (or a subset)
3. Click **Bulk Retry**
4. The system retries all selected rewards

### Exporting Reward Data

Export reward records for accounting or reporting:

1. Filter rewards by date range, campaign, or status
2. (Optional) Select specific rewards
3. Click **Export**
4. Choose format (CSV recommended)
5. Download the file

**Exported data includes:**
- Recipient name and email
- Amount and currency
- Status
- Created and delivered dates
- Campaign association
- Tremendous transaction ID

## Reward Best Practices

### Amount Guidelines

| Audience | Survey Length | Typical Reward |
|----------|---------------|----------------|
| **General consumer** | 5-10 minutes | $5-$10 USD |
| **General consumer** | 15-20 minutes | $15-$25 USD |
| **B2B professional** | 15-20 minutes | $25-$50 USD |
| **Executive/specialist** | 30+ minutes | $100+ USD |
| **Video testimonial** | 3-5 minutes | $10-$20 USD |
| **Focus group** | 60 minutes | $75-$150 USD |

Adjust based on:
- Audience availability and rarity
- Survey complexity
- Competitive landscape
- Budget constraints

### Timing Recommendations

- **Send quickly** — Reward within 24–48 hours of survey completion for best participant experience
- **Communicate upfront** — Tell participants they'll receive a reward *before* they start the survey
- **Set expectations** — Specify reward amount, currency, and delivery timeline
- **Follow up** — If a reward fails, contact the participant and resolve the issue promptly

### Cost Management

- **Budget planning** — Calculate total reward costs before launching campaigns (participants × reward amount)
- **Minimum thresholds** — Consider requiring survey completion (not just partial) to qualify for rewards
- **Fraud prevention** — Watch for duplicate email addresses or suspicious completion patterns
- **Tremendous fees** — Factor in Tremendous's transaction fees when budgeting

## Troubleshooting

**Rewards tab not visible?**
You need the `tremendousSettings` permission. Contact your workspace administrator to request access.

**"Integration not configured" error?**
Set up Tremendous in **Settings → General → Tremendous Rewards Integration** first. You need a Tremendous API key and at least one funding source.

**Reward failed with "Insufficient Funds"?**
Your Tremendous account balance is too low. Add funds to your Tremendous account and retry the reward.

**Recipient didn't receive reward email?**
Check:
- Email address is correct (no typos)
- Reward status shows "Succeeded" (not still processing)
- Email didn't go to spam folder (ask recipient to check)
- Email address is valid and active

If status is "Succeeded" but recipient didn't receive email after 1 hour, contact Tremendous support.

**Reward status stuck on "Processing"?**
Processing usually takes under 1 minute. If a reward is processing for more than 5 minutes, there may be a communication issue with Tremendous. Refresh the page. If still stuck, contact support.

**Cannot send rewards to international participants?**
Make sure you've selected the appropriate currency for their region. Tremendous supports multiple currencies. If the participant's country isn't supported, consider alternative reward methods.

**Bulk retry not working?**
Make sure:
- You've fixed the underlying issue (invalid email, insufficient funds)
- You've selected failed rewards (not already succeeded)
- You have sufficient Tremendous balance for all retries

**Export file is empty?**
Your filter or date range may not match any rewards. Try:
- Expanding the date range
- Removing status filters
- Checking that rewards exist in the system

## Frequently Asked Questions

::: details Click to expand

**Q: How long does it take for participants to receive rewards?**
A: Successfully processed rewards arrive within minutes. Tremendous sends an email with redemption instructions immediately upon successful processing.

**Q: Can participants choose how they receive their reward?**
A: Yes. Tremendous lets recipients choose from gift cards, prepaid Visa cards, bank transfers, PayPal, and charity donations (options vary by region and reward amount).

**Q: What happens if a participant doesn't claim their reward?**
A: Tremendous rewards typically don't expire. Unclaimed rewards remain available for the recipient to redeem indefinitely.

**Q: Can I customize the reward email?**
A: You can add a custom message when creating the reward. The email template itself comes from Tremendous and includes your custom message along with their standard claim instructions.

**Q: Are there minimum or maximum reward amounts?**
A: Minimum is typically $1 USD (or equivalent). Maximum depends on your Tremendous account limits. Check with Tremendous for specific limits on your account.

**Q: Can I cancel a reward after sending?**
A: Once a reward shows "Succeeded," it has been delivered to the recipient and cannot be cancelled. Contact Tremendous support if you need to handle special cases.

**Q: Do rewards expire?**
A: Tremendous rewards generally don't expire, but check Tremendous's current policies for specifics.

**Q: Can I see when a reward was claimed?**
A: Redemption details are available in your Tremendous dashboard. Vurvey shows delivery status, but claim status is tracked by Tremendous.

**Q: How much does Tremendous charge?**
A: Tremendous charges a small percentage fee per reward. Check [tremendous.com/pricing](https://www.tremendous.com/pricing) for current rates.

**Q: Can I use a different rewards provider?**
A: Currently, Vurvey only integrates with Tremendous. If you need a different provider, you'll need to manage rewards outside the Vurvey platform.
:::

## Next Steps

- [Launch campaigns with rewards](/guide/campaigns)
- [Configure Tremendous in Settings](/guide/settings)
- [Manage workspace permissions](/guide/permissions-and-sharing)
- [Invite participants to surveys](/guide/people)
