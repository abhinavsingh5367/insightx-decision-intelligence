# Evaluator & Reviewer Guide — BUSINESSINTELLIGENCE.AI

> **Accenture Innovation Challenge 2026 — Round 2**  
> **Team InsightX:** Aritra Gupta, Abhishek Anand, Abhishek Biradar  
> **Prototype Repository:** [https://github.com/InsightX-AIC2026/businessintelligence-ai](https://github.com/InsightX-AIC2026/businessintelligence-ai)

---

## 1. Quick Verification & Running Locally

### Option A: Standard npm (Node.js)
```bash
# 1. Run automated syntax & JSON data validation
npm test

# 2. Start the local server
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option B: Python 3
```bash
python3 -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option C: Direct File Inspection (Zero-Build)
You can directly open `index.html` in any modern web browser (Chrome, Edge, Safari, Firefox). All dependencies are served via CDN with fallback self-contained JavaScript and CSS.

---

## 2. Evaluation Criteria Matrix & Feature Verification

| Evaluation Criterion | Implementation in Platform | How to Verify in UI |
| :--- | :--- | :--- |
| **1. Beyond Descriptive BI** | Moves from retrospective "What" to root cause "Why" and counterfactual "What Next". | View Command Center → Click "Run Investigation" → See 10-step investigation & horizontal driver decomposition. |
| **2. Multi-Source Evidence Corroboration** | Cross-domain triangulation across ERP, CRM, Manhattan WMS, Zendesk NLP, and 3PL Memos. | Go to **Investigation Hub** → Click **Evidence Graph** → Drag nodes and click to inspect raw grain & lineage in slide-over drawer. |
| **3. Anti-Hallucination & Mathematical Truth** | 4-layer architecture: Deterministic calculations + Statistical ML + Semantic Contracts + Grounded LLM narrative. | Go to **Governance** → Click **AI Architecture** to inspect the 4-layer separation of concerns. |
| **4. Uncertainty & Abstention Handling** | Deterministic Confidence scoring ($0-100$) and explicit abstention gate on sparse/contradictory data. | Switch top scenario dropdown to **"Scenario B: New Product Conversion (-18%)"** → Observe **41/100 Confidence** and **Abstain / Review Required** banner. |
| **5. Counterfactual What-If Sandbox** | Interactive financial modeling of levers (3PL Air freight, dealer rebates, shipping thresholds). | Go to **Decision Lab** → Adjust the sliders and watch real-time recalculation of projected revenue, EBITDA, and payback days. |
| **6. Governed Human Action & RBAC** | 4 decision gates (`RECOMMEND`, `REVIEW`, `ESCALATE`, `DEFER`), cryptographic audit ledger, and domain RBAC. | Go to **Action Center** → Click **"Authorize Action"** to dispatch playbook to ledger. Go to **Governance / RBAC** → Click **"Attempt Unauthorized Access"** to verify HTTP 403 enforcement. |
| **7. Persona-Adaptive Narration** | Tailored narratives for CEO, Operations, Marketing, and Analyst while preserving 100% data parity. | Switch the **Role** dropdown at the top between CEO, Operations, Marketing, and Analyst to see immediate context adaptation. |

---

## 3. Repository File Structure

```
├── README.md               # Main project overview, executive summary & quick start
├── ARCHITECTURE.md         # Full mathematical formulations, layer boundaries & system design
├── EVALUATION_GUIDE.md     # Evaluator rubric mapping & step-by-step test guide
├── index.html              # Main HTML5 application shell & view templates
├── style.css               # Design system, glassmorphism tokens, and custom UI styling
├── app.js                  # Core reactive application controllers, physics engine & charts
├── data.js                 # Complete authoritative enterprise dataset & semantic contracts (JS)
├── data.json               # Pure JSON export of entire data model for automated evaluators
├── package.json            # Node.js configuration, npm scripts, and metadata
├── LICENSE                 # MIT Open-Source License
└── .gitignore              # Standard ignore rules for Node, OS, and IDE files
```
