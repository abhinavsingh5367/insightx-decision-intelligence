# BUSINESSINTELLIGENCE.AI — Technical Architecture & Mathematical Blueprint

> **Accenture Innovation Challenge 2026 — Round 2 Prototype**  
> **Team InsightX:** Aritra Gupta, Abhishek Anand, Abhishek Biradar  
> **Tagline:** *“From KPI movement to trusted business action.”*

---

## 1. System Overview & Core Value Proposition

Conventional Business Intelligence (BI) tools stop at **“What changed?”** through retrospective charts and dashboards. **BUSINESSINTELLIGENCE.AI** bridges the enterprise decision gap by answering **“Why did it change?”** and **“What can we confidently do next?”**.

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│  DETECT         │ ──> │  DIAGNOSE        │ ──> │  CORROBORATE         │
│  Anomalies &    │     │  Seasonal        │     │  Multi-Source Graph  │
│  Signal Rank    │     │  Decomposition   │     │  Evidence Links      │
└─────────────────┘     └──────────────────┘     └──────────────────────┘
         │                                                           │
         ▼                                                           ▼
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│  ACT            │ <── │  TEST            │ <── │  EXPLAIN             │
│  Governed Gates │     │  Counterfactual  │     │  Persona Synthesis   │
│  & Audit Ledger │     │  What-If Sandbox │     │  & Disproven Checks  │
└─────────────────┘     └──────────────────┘     └──────────────────────┘
```

---

## 2. Anti-Hallucination Layer Boundaries (Separation of Concerns)

To eliminate LLM hallucination and ensure audit-grade trust in executive decision-making, the platform enforces strict boundaries across 4 distinct layers:

| Layer | Responsibility | Authoritative Stack | Anti-Hallucination Guarantee |
| :--- | :--- | :--- | :--- |
| **1. Deterministic Layer** | Authoritative numerical truth: SUM, AVG, rolling baselines, materiality threshold breaches, What-If arithmetic, RBAC gates. | TypeScript / Python Math, SQL, DuckDB | The LLM is **never** permitted to compute or invent numeric values. |
| **2. Statistics & ML Layer** | Analytical truth: Time-series seasonal de-trending, $3.2\sigma$ anomaly detection, ANOVA driver variance decomposition, deterministic confidence math. | SciPy, NumPy, Scikit-learn, Statsmodels | Statistical validity and confidence penalties are computed strictly by algorithmic models. |
| **3. Semantic & Retrieval Layer** | Contextual grounding: KPI semantic contracts, cross-domain entity resolution (ERP, WMS, Zendesk, CRM), cryptographic audit ledger. | Semantic Graph Registry, Redis Cache | Every evidence node has verifiable provenance, observation grain, and timestamp. |
| **4. LLM Synthesis Layer** | Interpretation & narrative: Workflow orchestration, persona-specific adaptation (CEO vs Ops vs Marketing vs Analyst), action explanation. | Gemini 1.5 Pro / Flash Reasoning Abstraction | Synthesizes grounded narratives exclusively from verified facts and mathematical outputs. |

---

## 3. Mathematical Formulations & Algorithms

### A. Deterministic Priority Signal Ranking
Incoming anomaly signals are ranked into the executive queue using a composite weighted index:

$$\text{Priority Index} = 0.35 \times \text{Impact} + 0.25 \times \text{Anomaly Magnitude} + 0.20 \times \text{Persistence} + 0.20 \times \text{Strategic Importance}$$

* **Financial Impact ($I$):** Normalized percentage contribution to annual EBITDA/revenue target.
* **Anomaly Magnitude ($Z$):** Standardized $z$-score deviation relative to the 30-day baseline ($Z = \frac{x - \mu}{\sigma}$).
* **Persistence ($P$):** Consecutive operational windows sustaining the anomaly ($P \in [0, 1]$).
* **Strategic Importance ($S$):** Criticality tier assigned in the KPI Semantic Contract registry.

---

### B. Deterministic Confidence Scoring Engine
The platform computes a transparent, explainable confidence score ($0 - 100$) by applying verified additive contributors and rigorous subtractive penalties:

$$\text{Confidence Score} = \text{Base} + C_{\text{corrob}} + C_{\text{contrib}} + C_{\text{quality}} + C_{\text{persist}} - P_{\text{counter}} - P_{\text{sparse}}$$

#### Scoring Breakdown for Scenario A (West Revenue Dip):
$$\begin{aligned}
\text{Base Score} &= 20 \\
+ \text{ Multi-source Corroboration (3 of 4 independent sources align)} &= +24 \\
+ \text{ Primary Driver Variance Contribution Share (41\% ANOVA)} &= +19 \\
+ \text{ Data Source Quality \& Freshness (Manhattan WMS SLA 99.8\%)} &= +17 \\
+ \text{ Temporal Persistence (4 consecutive reporting days)} &= +11 \\
- \text{ Counter-Signals Penalty (Minor CRM pipeline lag)} &= -8 \\
- \text{ Data Sparsity Penalty (Low noise)} &= -5 \\
\hline
\mathbf{Final\ Confidence\ Score} &= \mathbf{78/100\ [HIGH]}
\end{aligned}$$

---

### C. Mandatory Abstention Gate in Sparse / Contradictory Data
When the deterministic confidence falls below the governing threshold ($\text{Confidence} < 50$), the system strictly enters **ABSTENTION MODE**:

* **Scenario B (New Product Conversion):**
  - Observation window: Only 12 days since launch (violates 30-day minimum baseline contract).
  - Evidence contradiction: Paid traffic is up $+14\%$ while organic search conversion is down $-18\%$.
  - Computed Confidence: **$41/100$**.
  - **Decision Gate Triggered:** `ABSTAIN / REVIEW REQUIRED`.
  - **Action:** Generates an automated tracking instrument & data collection ticket instead of fabricating business recommendations.

---

### D. Counterfactual What-If Simulation Arithmetic
The Decision Lab enables interactive policy evaluation using deterministic counterfactual math:

$$\text{Projected Revenue} = R_{\text{base}} + \sum_{i=1}^n \left( \Delta L_i \times \kappa_i \right)$$

$$\text{Net EBITDA Delta} = \left( \text{Projected Revenue} \times M_{\text{gross}} \right) - \sum_{i=1}^n \text{OpEx Cost}_i$$

$$\text{Payback Period (Days)} = \frac{\sum_{i=1}^n \text{OpEx Cost}_i}{\text{Daily Net Marginal Profit Generated}}$$

---

## 4. Human Governance & Decision Routing Matrix

Insights are automatically routed to one of four governed decision gates:

| Decision Gate | Confidence Range | Capital / Policy Risk | Required Action |
| :--- | :--- | :--- | :--- |
| **`RECOMMEND`** | $\ge 75/100$ | Low / Direct Operational | Pre-approved playbook available for direct one-click execution. |
| **`REVIEW`** | $50 - 74/100$ | Moderate / Capital Reallocation | Human executive sign-off required with explicit trade-off justification. |
| **`ESCALATE`** | Any | Critical / Legal / Regulatory | Automated escalation to VP/C-Suite with incident command bridge. |
| **`DEFER / ABSTAIN`** | $< 50/100$ | High Uncertainty / Sparse Data | System abstains; dispatches instrumentation & data gathering tasks. |

---

## 5. Security, RBAC & AI Telemetry

* **Role-Based Access Control (RBAC):** Strict domain isolation for CEO, Operations, Marketing, and Data Analyst roles. Accessing out-of-scope domain data (e.g. Marketing accessing WMS raw warehouse dispatch rates) triggers deterministic HTTP 403 governance blocks with audit alerts.
* **Audit Ledger:** Every authorized business action is timestamped and cryptographically signed with a SHA-256 state hash.
* **AI Observability:** Sub-query latency breakdown, token utilization, and query cost tracking ($0.0031/investigation$).
