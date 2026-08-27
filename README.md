# BUSINESSINTELLIGENCE.AI
> **“From KPI movement to trusted business action.”**  
> *Accenture Innovation Challenge 2026 — Round 2 Prototype*  
> **Team InsightX:** Aritra Gupta, Abhishek Anand, Abhishek Biradar

---

## 1. Executive Summary & Core Product Positioning

Conventional Business Intelligence (BI) dashboards excel at answering **“What changed?”** through static dashboards and retrospective charts, but fail at answering **“Why did it change?”** and **“What can we confidently do next?”**.

**BUSINESSINTELLIGENCE.AI** bridges this decision gap through **Evidence-Backed Decision Intelligence**. It transforms multi-source enterprise signals into governed business interventions via a 6-stage intelligence pipeline:

$$\mathbf{DETECT} \longrightarrow \mathbf{DIAGNOSE} \longrightarrow \mathbf{CORROBORATE} \longrightarrow \mathbf{EXPLAIN} \longrightarrow \mathbf{TEST} \longrightarrow \mathbf{ACT}$$

---

## 2. Core Architectural Principles (Anti-Hallucination Boundaries)

| Layer | Responsibility | Authoritative Tech Stack |
| :--- | :--- | :--- |
| **1. Deterministic Layer** | **Authoritative numerical truth**: SUM, AVG, rolling 14/30-day baselines, $3.2\sigma$ z-scores, materiality indexes, What-If counterfactual arithmetic, RBAC security gates. | Deterministic TypeScript / Python Math, SQL, DuckDB |
| **2. Statistics & ML Layer** | **Analytical truth**: Time-series seasonal de-trending, variance decomposition (ANOVA), horizontal driver contribution shares, deterministic confidence scoring math. | SciPy, NumPy, Scikit-learn, Statsmodels |
| **3. Semantic & Retrieval Layer** | **Contextual grounding**: KPI semantic contracts, cross-domain entity resolution across ERP, WMS, and Zendesk, cryptographic audit logging. | Semantic Graph Registry, Redis Cache |
| **4. LLM Synthesis Layer** | **Interpretation & narrative**: Investigation orchestration, persona-specific adaptation (CEO vs Ops vs Marketing vs Analyst), action explanation. **LLM never invents numeric values.** | Gemini 1.5 Pro / Flash Reasoning Layer |

---

## 3. Key Platform Capabilities & Competition Deliverables

### A. Executive Command Center
* **5 Connected Enterprise KPIs**: Revenue (₹38.7M, ↓8.1%), Gross Margin (21.2%, ↓7.2% pts), Orders (41,200, ↓14.2%), Conversion Rate (2.4%, ↓18.0%), and Returns SLA Breach (8.4%, ↑4.2% pts).
* **Deterministic Priority Signals Queue**: Prioritized via composite formula:
  $$\text{Priority} = 0.35 \times \text{Impact} + 0.25 \times \text{Anomaly} + 0.20 \times \text{Persistence} + 0.20 \times \text{Strategic}$$

### B. Hero Investigation Workspace
* **Real-Time 10-Step Guided Investigation Runner**: Computes anomaly validation, seasonal de-trending, ERP reconciliation, CRM pipeline check, WMS dispatch lag, NLP support sentiment, counter-signal verification, driver decomposition, deterministic confidence, and scenario action modeling.
* **Horizontal Driver Contribution Ranking**: Visualizes variance shares (Bhiwandi fulfillment 41%, Electronics volume 27%, Paid traffic 14%, Returns 9%, Seasonality 5%, Noise 4%) with clear disclaimers that *variance share $\neq$ automatic causation*.
* **Suspected Drivers Disproven Matrix**: Proves why suspected drivers (e.g., pricing leakage or ad traffic drops) were mathematically rejected.

### C. Interactive Multi-Source Evidence Graph
* Dynamic HTML5 Canvas physics simulation with draggable nodes, glowing pulses, and animated particle streams.
* Lineage, observation grain, timestamps, calculation formula, and provenance for ERP, CRM, Manhattan WMS, Zendesk Support, and 3PL logistics memos.

### D. Mathematical Confidence Engine & Abstention Mode
* **Transparent Confidence Scoring**:
  $$\text{Confidence} = \text{Base} + \text{Corroboration} (+24) + \text{Contribution} (+19) + \text{Quality} (+17) + \text{Persistence} (+11) - \text{Counter-Signals} (-8) - \text{Sparsity} (-5) = 78/100$$
* **Mandatory Abstention in Sparse History (Scenario B)**: For *New Product Conversion (-18.0%)* with only 12 days of history and contradictory pricing/traffic signals, confidence drops to **41/100**. The system explicitly triggers **ABSTAIN / REVIEW REQUIRED** and provides data collection actions instead of fabricating recommendations.

### E. Decision Lab (What-If Simulator)
* Interactive sliders & toggles (3PL Air Rerouting %, Dealer Rebates, Discounting).
* Real-time financial calculations of Scenario Revenue, Net EBITDA Delta, Total OpEx Cost, and Payback Days.
* Explicit assumptions checklist and side-by-side comparison charts.

### F. Human-Governed Action Center & Decision Gates
* Dynamic Routing Matrix: `RECOMMEND` (High confidence, low risk), `REVIEW` (Ambiguity, capital reallocation), `ESCALATE` (Critical enterprise risk), `DEFER` (Low confidence, sparse history).
* Authorized playbooks with one-click dispatch and cryptographic hash audit ledger.

### G. Governance Suite
* **KPI Semantic Contracts**: Complete specifications for 5 KPIs including formulas, grain, SLAs, owners, and dimensions.
* **Heterogeneous Data Hub**: 6 active connectors with distinct refresh cadences (real-time to daily).
* **Role-Based Access Control (RBAC)**: Domain isolation for CEO, Operations, Marketing, and Analyst roles with a live security violation demonstration.
* **Analyst Feedback Loop**: Captures ratings and corrections into evaluation datasets without unverified auto-retraining.
* **AI Runtime Telemetry**: Tracks latency breakdown, model calls, token counts, and cost ($0.0031/run).

---

## 4. Local Quick Start

The application is entirely self-contained with zero required build steps or complex dependencies.

### Option 1: Using Python 3 (Recommended)
```bash
cd /Users/abhishekanand/.gemini/antigravity-ide/scratch/insightx-decision-intelligence
python3 -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Using Node.js npx
```bash
cd /Users/abhishekanand/.gemini/antigravity-ide/scratch/insightx-decision-intelligence
npx -y serve -p 3000 .
```

---

## 5. Demonstration Walkthrough Guide (For Judges)

1. **Product Overview & Landing Page**: Click "Product Overview" in the top navbar to view the hero statement, miniature live pipeline, and 4 trust pillars.
2. **Command Center**: View 5 connected KPIs and review the deterministic Priority Signals Queue.
3. **Run Guided Investigation**: Click **"Run Investigation"** to watch the 10 real-time analytical checkpoints compute and transition to the Hero Investigation screen.
4. **Persona Switcher**: Toggle between **CEO**, **Operations Leader**, **Marketing Leader**, and **Data Analyst** to observe how the narrative and focal actions adapt with 100% data parity.
5. **Inspect Evidence Graph**: Go to "Evidence Graph", drag nodes, and click any node (e.g. *Manhattan WMS*) to inspect raw grain, formula, and lineage in the slide-over drawer.
6. **Scenario Testing Sandbox**: Go to "Decision Lab", adjust the *3PL Air Rerouting* slider, and watch the projected revenue and net EBITDA recalculate dynamically.
7. **Decision Gating & Action**: Go to "Action Center", review the REVIEW gate rationale, click **"Authorize Action"**, and dispatch the playbook to the immutable audit log.
8. **Test Abstention & Sparse History**: Select **"B: New Product Conversion (-18%)"** in the top scenario dropdown to observe the low-confidence (41/100) abstention banner and data request ticket.
9. **Test RBAC Security Sandbox**: Go to "Security / RBAC", click **"Attempt Unauthorized Data Access"** to verify the HTTP 403 domain policy breach alert.
10. **View KPI Semantic Contracts & AI Telemetry**: Inspect the formal semantic contracts drawer and view live query/LLM latency in the telemetry cockpit.
11. **Export Executive Dossier**: Click **"Export Brief"** to generate a formatted printable decision package.
