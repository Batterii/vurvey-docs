---
title: Concept Simulations
---

# Concept Simulations

**Concept Simulations** let you test concepts — product variants, ad creative, messaging, packaging designs — against synthetic AI populations BEFORE you launch a real survey. Each simulated persona reacts to the concepts the way a real respondent would, giving you fast directional feedback that helps you de-risk what you put in front of real respondents.

Simulations live in the **People** area at `/people/simulations` and are workspace-flag-gated by `simulationsactive`. The simulation builder is a multi-step flow producing concept rankings, sentiment visualizations, and detailed per-persona responses.

::: warning Feature-flag gated
Concept Simulations require the workspace `simulationsactive` feature flag (read via `useFeatureFlag({flagName: "simulationsactive"})`). Without the flag, the `/people/simulations` route bounces to `/people/populations`. Ask your CSM about availability.
:::

> 📷 _Screenshot pending: Simulations list page_
> 📷 _Screenshot pending: Simulation builder — Concept step with text/image/video concept cards_
> 📷 _Screenshot pending: Simulation builder — Context step_
> 📷 _Screenshot pending: Simulation builder — Population step_
> 📷 _Screenshot pending: Simulation results — Rankings tab_
> 📷 _Screenshot pending: Simulation results — Responses tab_
> 📷 _Screenshot pending: Simulation visualization page with concept-sentiment ring_

---

## Why simulate before launching?

Real respondent time is precious and finite — every campaign that goes live without first being validated risks asking the wrong questions, presenting confusing stimuli, or testing concepts that AI personas can already tell you will land poorly.

Simulations are the **fast / cheap / disposable** version of campaign testing:

| | Concept Simulation | Real Campaign |
|---|---|---|
| **Time to result** | Minutes (population generation + simulated responses) | Days to weeks (real respondents) |
| **Cost** | LLM credits for population × concepts × question count | Tremendous payouts + respondent time |
| **Iteration cycle** | Tweak concept, re-simulate same population | Rebuild campaign, re-recruit, wait |
| **Best for** | Directional signal, concept ranking, eliminating obvious losers | Statistically valid consumer voice |
| **Bad for** | Decisions that hinge on real-world authenticity | Quick directional iteration |
| **Resulting data** | Ranked concepts + per-persona text/sentiment | Real video responses, transcripts, themes |

The usual flow: simulate three concept variants → identify the strongest two → launch a real campaign on those two to validate with humans.

---

## Route structure

| Route | Component | Purpose |
|---|---|---|
| `/people/simulations` | `SimulationsPage` | List of past simulations + Create button |
| `/people/simulations/create-concepts` | `SimulationConcept` (builder step 1) | Add concepts (text / image / video) |
| `/people/simulations/create-concepts/context` | `SimulationContext` (builder step 2) | Frame the simulation (research brief, instructions) |
| `/people/simulations/create-concepts/simulation-population` | `SimulationPopulation` (builder step 3) | Choose which AI population reacts |
| `/people/simulations/:simulationId` | `SimulationResultsPage` | Results shell with Rankings + Responses tabs |
| `/people/simulations/:simulationId/rankings` | `SimulationResultsRankings` | Concept rankings tab |
| `/people/simulations/:simulationId/responses` | `SimulationResultsResponses` | Per-persona responses tab |
| `/people/simulations/:simulationId/visualization` | `SimulationVisualizationPage` | Sentiment visualization canvas |

The builder steps are wrapped in a `SimulationStoreProvider` so the state (concepts, context, population) persists across the steps. Leaving the builder mid-flow loses the in-progress simulation.

---

## Building a simulation — the 3-step flow

### Step 1 — Concepts (`/create-concepts`)

This is where you author the things the population will react to. Three concept types are supported, each with its own card component:

| Concept type | When to use | Card component |
|---|---|---|
| **Text Concept** | Product positioning lines, value propositions, slogans, messaging variants | `text-concept-card` |
| **Image Concept** | Packaging mockups, ad creative, product renders, mood boards | `image-concept-card` |
| **Video Concept** | TV spots, social-media reels, product demos, longer ad creative | `video-concept-card` |

Add as many concepts as you want to compare. A typical simulation has 2–5 concepts to keep rankings interpretable.

### Step 2 — Context (`/create-concepts/context`)

Frame the simulation. The Context step captures the research question, optional supporting brief, and instructions to the AI personas about how to react.

This is where you tell the personas _"You are evaluating these as potential ad creative for a new sustainable skincare line targeting Gen Z women"_ — giving them the relevant framing so their reactions are situated.

A weak Context produces less useful results. Treat it like the introduction you'd give real respondents.

### Step 3 — Population (`/create-concepts/simulation-population`)

Pick the AI population that will react to your concepts. Populations come from the [People → Populations](/guide/people) tab — they can be:

- **Brand Populations** — your workspace's curated population reflecting your target audience
- **Vurvey Populations** — pre-built populations from Vurvey covering broad demographic segments

Pick one population at a time. The simulation generates responses from every persona in that population × every concept × every implicit question, so larger populations produce more thorough results at higher LLM-credit cost.

After confirming the population, click Launch (or equivalent). The backend's `population-generation-worker` (see [Platform Architecture → Worker topology](/guide/architecture#vurvey-api-worker-topology)) kicks the simulation; results land within a few minutes for typical population sizes.

---

## Reading the results

### Results Page shell (`/simulations/:simulationId`)

Lands on Rankings by default. Two tabs at the top:

- **Rankings** — concepts sorted by aggregate signal across the population
- **Responses** — per-persona detailed reactions

### Rankings tab

Each concept gets a ranked card with summary metrics:

- **Score** — aggregate sentiment / preference score
- **Distribution** — how the population's reactions distribute (positive, negative, neutral)
- **Top themes** — recurring positives and negatives from persona reactions

Use this tab when you want a clear answer to _"which concept won?"_

### Responses tab

The raw per-persona-per-concept response data. Click into any persona's response to see:

- Their full text reaction to each concept
- Sentiment classification
- Quoted phrases that drove their score
- Demographic facets (for context on why they reacted the way they did)

Use this tab when you want to understand _why_ a concept scored the way it did — not just _that_ it scored.

### Visualization page (`/visualization`)

The Concept Sentiment Visualization is a dedicated visualization page rendering a ring / canvas-based view of how concepts cluster by sentiment dimension. The implementation lives in `simulation-visualization-page/features/simulation-canvas/concept-sentiment-visualization/`.

What you see:

- A radial / ring visualization placing concepts by sentiment-axis position
- Concept icons sized by mention volume or signal strength
- Drill-in details on hover / click
- A mode toggle between different visualization variants

Use this view for stakeholder presentations — it's more visually compelling than the Rankings table when you want to show _"these concepts cluster around X dimension, those around Y"_.

---

## Constraints & limitations

- **`simulationsactive` feature flag required.** Without it the route redirects to `/people/populations`.
- **Builder state is in-memory.** Leaving the builder mid-flow loses concept / context / population selections — finish in one session or save partial state via the population page.
- **One population per simulation.** Multi-population comparison requires separate simulations.
- **AI populations are synthetic.** They're useful for directional signal, NOT validation of authenticity. Confirm winners against real campaign respondents before high-stakes decisions.
- **Concept ranking depends on population fit.** A population matching the wrong target demographic will rank concepts unhelpfully. Match population to target audience.
- **Larger populations = more credit cost.** Simulating 1,000 personas across 5 concepts × N implicit questions burns through credits fast.
- **Image / video concepts may have slower generation.** The personas need to "see" / interpret the media; latency is higher than for text concepts.
- **No real respondent voice.** Personas approximate; they don't capture real surprise, real cultural context, real grief, real joy.
- **Results aren't statistically valid.** Treat them as directional, not predictive of real-world outcomes.
- **`enablegeneralpopulations` is a separate flag** for general (non-brand-curated) populations — distinct from `simulationsactive`. Some features in the simulation builder reference both.

---

## Best practices

- **Always start with a tight Context.** Generic _"react to these ads"_ is worse than _"You are a 35-year-old urban professional evaluating these ads for a meal-kit subscription targeting busy parents"_.
- **3–5 concepts per simulation.** Below 3 you can't compare; above 5 rankings flatten and become uninformative.
- **Match the population to your target.** Don't simulate a luxury concept against a budget-shopper population; you'll get noise, not signal.
- **Iterate on losers, not winners.** Use the simulation to eliminate obviously-bad concepts, then take 2–3 surviving candidates to a real campaign for the actual decision.
- **Read the Responses tab on your losing concept.** Often the per-persona detail reveals fixable issues (confusing copy, unclear value prop) that would also affect any rewrite.
- **Don't over-trust the rankings.** The score numbers are useful relative to each other but not as absolute predictions. A 7.2 vs 6.8 is meaningful; a single 7.2 doesn't mean "this will perform well in real life".
- **Run a parallel real campaign for big decisions.** Simulations are fast iteration tools, not substitutes for talking to real humans about meaningful spend.
- **Use the visualization page for stakeholder reviews.** It's more compelling than a table when you want execs to understand cluster patterns at a glance.

---

## FAQ

#### How is this different from running a real campaign with an AI population?
[Campaigns → AI Population simulation](/guide/people#campaigns--ai-population-simulation) and Concept Simulations both use AI personas, but the surfaces differ:
- **Concept Simulations** are dedicated to ranking N concept variants against each other with sentiment scoring + Rankings + Responses + Visualization tabs.
- **Campaign AI Population** generates synthetic answers to a real campaign's questions — useful for stress-testing question design before launch.

Use Concept Simulations when comparing concepts; use Campaign AI Population when validating that your campaign questions produce sensible answers.

#### Can I save a draft concept and come back to it?
Builder state is in-memory across the 3 steps but doesn't persist if you fully navigate away. To save work, complete the simulation (even on a small test population) — the resulting record is permanent in `/people/simulations` and you can clone from it.

#### Why is my simulation taking 10+ minutes?
Image or video concepts are slower than text. Large populations multiply. Hit the upper bound of either and expect 10+ minutes. The progress indicator on the Results page shows current state.

#### Are my concepts shared with other workspaces?
No. Concepts you upload (especially image / video) are workspace-scoped.

#### How are the rankings calculated?
The aggregate score combines per-persona sentiment classifications, mention counts, and quote-extraction across all responses to a concept. Higher score = more positive reactions weighted by intensity. The exact algorithm is implementation detail (subject to change) — treat rankings as directional, not as a fixed scoring contract.

#### Can the same population react to the same concept twice (re-simulation)?
You can create another simulation with the same population and concept — but the resulting reactions will be slightly different each time because of LLM stochasticity. Use seeds (if exposed) for reproducibility.

#### What happens if I edit a concept after the simulation runs?
The simulation captures concepts at the time of run. Edits don't retroactively change the result — re-run to get an updated simulation.

#### Does this work for video concepts longer than 30 seconds?
Yes, but expect longer generation times. The persona "watches" the video transcript + key-frame extracts, so longer videos = more processing.

#### Can I export the results?
Not natively from the Results UI. For analysis outside Vurvey, the underlying data is available via GraphQL — see [Developer & API Reference](/guide/developer-reference) for the relevant queries (the schema is internal; ask engineering for the exact field shape).

#### What's `enablegeneralpopulations` for?
A separate feature flag for "general" populations — broader-demographic populations distinct from brand-curated populations. When on, additional population types become available in the simulation builder's Step 3.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `/people/simulations` redirects to `/populations` | `simulationsactive` flag is off. Ask your CSM. |
| Builder loses my concepts on navigation | Builder state is in-memory. Finish the flow without leaving the tab. |
| Simulation stuck on "generating" for 20+ min | Likely a worker backlog or a large population × video-concept combination. Wait, or contact support with the simulation ID. |
| Rankings tab shows no data | The simulation may not have completed yet, or all concepts scored equally (rare). Open the Responses tab to verify responses exist. |
| One concept has dramatically higher score | Verify the Context wasn't accidentally biased toward that concept. Re-run with a tighter, more neutral Context. |
| General populations dropdown is empty | `enablegeneralpopulations` flag is off OR no general populations have been created in your workspace. |
| Visualization page shows nothing | Browser doesn't support the canvas APIs the visualization uses, OR the simulation has no scored data yet. Try Chrome or wait for simulation completion. |
| Credits exhausted mid-simulation | The simulation halts; partial results may be available. Top up credits before relaunching. |

---

## Cross-references

- [People](/guide/people) — Populations, lists, segments, and the broader People area
- [Common Recipes → Run a concept simulation](/guide/recipes#recipe-9-run-a-concept-simulation-with-ai-personas-before-launching-to-real-respondents) — step-by-step recipe
- [Campaigns](/guide/campaigns) — what to do with simulation winners (launch a real campaign)
- [Capabilities](/guide/capabilities) — long-running concept-iteration patterns built as Capabilities
- [Settings → workspace feature flags](/guide/settings#workspace-flags-you-may-encounter) — `simulationsactive`, `enablegeneralpopulations`
- [Platform Architecture → Worker topology](/guide/architecture#vurvey-api-worker-topology) — `population-generation-worker` that drives the simulation
- [Glossary → Population, Persona, Stimulus](/guide/glossary)
- [What's New](/guide/whats-new) — Concept Simulations rollout status
