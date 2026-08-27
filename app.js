/**
 * BUSINESSINTELLIGENCE.AI
 * Application Logic, Reactive Controllers & Decision Engine
 * Accenture Innovation Challenge 2026 Round 2
 * "From KPI movement to trusted business action."
 */

class BusinessIntelligenceApp {
  constructor() {
    this.data = window.BI_DATA || window.INSIGHTX_DATA;
    this.currentScenarioId = "scenario-west-revenue";
    this.currentPersona = "ceo"; // ceo | operations | marketing | analyst
    this.currentHoldingDays = "30d"; // 14d | 30d | 60d | 90d
    this.currentView = "command_center"; // command_center | investigate | sandbox | gate | governance | landing
    this.currentInvestigateTab = "whatChanged"; // whatChanged | evidenceGraph | confidenceEngine
    this.currentGovTab = "sources"; // sources | contracts | rbac | telemetry | feedback
    
    // Canvas & Physics Simulation State
    this.canvas = null;
    this.ctx = null;
    this.graphNodes = [];
    this.graphEdges = [];
    this.hoveredNode = null;
    this.selectedNode = null;
    this.draggedNode = null;
    this.isDragging = false;
    this.animFrameId = null;

    // Chart.js Instances
    this.charts = {
      investigate: null,
      sandbox: null
    };

    // What-If Simulation Levers State
    this.leverState = {};

    // Guided Investigation State
    this.isInvestigating = false;
    this.guidedTimer = null;

    // Initialization
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initCanvas();
    this.loadScenario(this.currentScenarioId);
    this.renderCommandCenter();
    this.renderConnectorsList();
    this.renderSemanticContracts();
    this.renderRbacMatrix();
    this.renderAiArchitecture();
    this.renderTelemetry();
    this.renderFeedbackLogs();
    
    // Start Canvas Physics & Particle Animation Loop
    this.startCanvasAnimation();

    // Synchronize initial view state
    this.setView(this.currentView);

    // Trigger Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ---------------------------------------------------------------------------
  // EVENT LISTENERS & GLOBAL BINDINGS
  // ---------------------------------------------------------------------------
  setupEventListeners() {
    // Holding Days Filter Dropdown
    const holdingSelect = document.getElementById("holdingDaysSelect");
    if (holdingSelect) {
      holdingSelect.addEventListener("change", (e) => {
        this.setHoldingDays(e.target.value);
      });
    }

    // Persona Selector Dropdown
    const personaSelect = document.getElementById("personaSelect");
    if (personaSelect) {
      personaSelect.addEventListener("change", (e) => {
        this.setPersona(e.target.value);
      });
    }

    // Scenario Selector Dropdown
    const scenarioSelect = document.getElementById("scenarioSelect");
    if (scenarioSelect) {
      scenarioSelect.addEventListener("change", (e) => {
        this.loadScenario(e.target.value);
      });
    }

    // Window Resize for Canvas and Charts
    window.addEventListener("resize", () => {
      this.resizeCanvas();
      if (this.currentView === "investigate" && this.currentInvestigateTab === "evidenceGraph") {
        this.buildGraphModel();
      }
    });
  }

  setHoldingDays(days) {
    this.currentHoldingDays = days;
    const holdingSelect = document.getElementById("holdingDaysSelect");
    if (holdingSelect) {
      holdingSelect.value = days;
    }
    this.showToast(`Holding window updated to Last ${days.toUpperCase()}`);
  }

  // ---------------------------------------------------------------------------
  // SCENARIO & STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  getCurrentScenario() {
    return this.data.scenarios.find(s => s.id === this.currentScenarioId) || this.data.scenarios[0];
  }

  loadScenario(scenarioId) {
    this.currentScenarioId = scenarioId;
    const sc = this.getCurrentScenario();

    // Sync Scenario Dropdown
    const scenarioSelect = document.getElementById("scenarioSelect");
    if (scenarioSelect) {
      scenarioSelect.value = scenarioId;
    }

    // Initialize Sandbox Levers
    this.leverState = {};
    if (sc.test && sc.test.levers) {
      sc.test.levers.forEach(l => {
        this.leverState[l.id] = l.defaultValue;
      });
    }

    // Update Core UI Components
    this.updateHeroKpiBanner();
    this.updatePersonaNarrative();
    this.renderInvestigateStage();
    this.renderTestSandbox();
    this.renderActStage();
    this.buildGraphModel();
    this.renderCommandCenter();

    // Trigger Lucide icons re-scan
    setTimeout(() => {
      if (window.lucide) window.lucide.createIcons();
    }, 40);
  }

  setPersona(personaId) {
    this.currentPersona = personaId;
    const personaSelect = document.getElementById("personaSelect");
    if (personaSelect) {
      personaSelect.value = personaId;
    }

    this.updatePersonaNarrative();
    const roleInfo = this.data.rbacMatrix.roles.find(r => r.id === personaId) || this.data.rbacMatrix.roles[0];
    this.showToast(`Switched role to ${roleInfo.name}`);

    // If on RBAC view, update highlight
    if (this.currentView === "governance" && this.currentGovTab === "rbac") {
      this.renderRbacMatrix();
    }
  }

  setView(viewName) {
    this.currentView = viewName;

    // Update Primary Navigation Tabs
    document.querySelectorAll(".nav-tab-link").forEach(btn => {
      if (btn.getAttribute("data-view") === viewName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Hide all view containers
    const allViews = ["landing", "command_center", "investigate", "sandbox", "gate", "governance"];
    allViews.forEach(v => {
      const el = document.getElementById(`view_${v}`);
      if (el) el.classList.add("hidden");
    });

    // Show selected view
    const targetEl = document.getElementById(`view_${viewName}`);
    if (targetEl) {
      targetEl.classList.remove("hidden");
    }

    // Redraw charts/canvas if needed
    if (viewName === "investigate") {
      setTimeout(() => {
        if (this.currentInvestigateTab === "whatChanged") {
          this.renderInvestigateChart();
        } else if (this.currentInvestigateTab === "evidenceGraph") {
          this.resizeCanvas();
          this.buildGraphModel();
        }
      }, 50);
    }
    if (viewName === "sandbox") {
      setTimeout(() => this.renderSandboxChart(), 50);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Refresh icons
    setTimeout(() => {
      if (window.lucide) window.lucide.createIcons();
    }, 40);
  }

  // ---------------------------------------------------------------------------
  // INVESTIGATION SUB-TABS (WHAT CHANGED / EVIDENCE GRAPH / CONFIDENCE)
  // ---------------------------------------------------------------------------
  switchInvestigateTab(tabId) {
    this.currentInvestigateTab = tabId;

    const tabs = ["whatChanged", "evidenceGraph", "confidenceEngine"];
    tabs.forEach(t => {
      const btn = document.getElementById(`tabBtn_${t}`);
      const content = document.getElementById(`tabContent_${t}`);
      if (t === tabId) {
        if (btn) btn.className = "px-4 py-2 rounded-lg text-xs font-bold bg-purple-600/20 text-purple-300 border border-purple-500/40";
        if (content) content.classList.remove("hidden");
      } else {
        if (btn) btn.className = "px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 border border-transparent";
        if (content) content.classList.add("hidden");
      }
    });

    if (tabId === "whatChanged") {
      setTimeout(() => this.renderInvestigateChart(), 40);
    } else if (tabId === "evidenceGraph") {
      setTimeout(() => {
        this.resizeCanvas();
        this.buildGraphModel();
      }, 40);
    }

    // Refresh icons
    setTimeout(() => {
      if (window.lucide) window.lucide.createIcons();
    }, 40);
  }

  // ---------------------------------------------------------------------------
  // GOVERNANCE SUB-TABS (SOURCES / CONTRACTS / RBAC / TELEMETRY / FEEDBACK)
  // ---------------------------------------------------------------------------
  switchGovTab(tabId) {
    this.currentGovTab = tabId;

    const tabs = ["sources", "contracts", "rbac", "telemetry", "feedback"];
    tabs.forEach(t => {
      const btn = document.getElementById(`govTab_${t}`);
      const content = document.getElementById(`govContent_${t}`);
      if (t === tabId) {
        if (btn) btn.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600/20 text-purple-300 border border-purple-500/40";
        if (content) content.classList.remove("hidden");
      } else {
        if (btn) btn.className = "px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 border border-transparent";
        if (content) content.classList.add("hidden");
      }
    });

    // Refresh icons
    setTimeout(() => {
      if (window.lucide) window.lucide.createIcons();
    }, 40);
  }

  // ---------------------------------------------------------------------------
  // HERO KPI BANNER & PERSONA NARRATIVE CONTROLLER
  // ---------------------------------------------------------------------------
  updateHeroKpiBanner() {
    const sc = this.getCurrentScenario();
    
    // Main KPI values
    document.getElementById("kpiCardTitle").textContent = sc.kpiName;
    document.getElementById("kpiCardCurrent").textContent = sc.kpiMetric;
    document.getElementById("kpiCardBaseline").textContent = `Baseline: ${sc.kpiBaseline}`;
    
    const deltaEl = document.getElementById("kpiCardDelta");
    deltaEl.textContent = sc.kpiDelta;
    deltaEl.className = `delta-pill ${sc.isNegative ? 'negative' : 'positive'}`;

    // Signal Score Badge
    const signalBadge = document.getElementById("signalScoreBadge");
    signalBadge.textContent = `Signal: ${sc.detect.signalScore}/100`;

    // Confidence Score Badge
    const confBadge = document.getElementById("confScoreBadge");
    confBadge.textContent = `Confidence: ${sc.validate.confidenceScore}/100`;

    // Gate Route Badge
    const gateBadge = document.getElementById("topGateBadge");
    gateBadge.textContent = `ROUTE: ${sc.act.routedGate}`;
    gateBadge.className = `badge ${
      sc.act.routedGate === 'RECOMMEND' ? 'badge-emerald' : 
      sc.act.routedGate === 'REVIEW' ? 'badge-amber' : 
      sc.act.routedGate === 'DEFER' || sc.act.routedGate.includes('ABSTAIN') ? 'badge-purple' : 'badge-rose'
    }`;

    // Abstention Hero Alert State (Scenario B)
    const abstentionAlert = document.getElementById("abstentionHeroAlert");
    const abstentionBadge = document.getElementById("abstentionNoticeBadge");
    if (sc.isAbstentionScenario) {
      if (abstentionAlert) abstentionAlert.classList.remove("hidden");
      if (abstentionBadge) abstentionBadge.classList.remove("hidden");
    } else {
      if (abstentionAlert) abstentionAlert.classList.add("hidden");
      if (abstentionBadge) abstentionBadge.classList.add("hidden");
    }
  }

  updatePersonaNarrative() {
    const sc = this.getCurrentScenario();
    const persona = sc.personaNarratives[this.currentPersona] || sc.personaNarratives.ceo;
    const roleInfo = this.data.rbacMatrix.roles.find(r => r.id === this.currentPersona) || this.data.rbacMatrix.roles[0];

    const titleEl = document.getElementById("personaNarrativeTitle");
    if (titleEl) titleEl.textContent = `Persona-Specific Intelligence Synthesis (${roleInfo.name})`;

    const headlineEl = document.getElementById("personaHeadline");
    if (headlineEl) headlineEl.textContent = persona.headline;

    const synthEl = document.getElementById("personaSynthesis");
    if (synthEl) synthEl.textContent = persona.synthesis;

    const focusEl = document.getElementById("personaFocus");
    if (focusEl) focusEl.textContent = persona.recommendedFocus;

    const rightsEl = document.getElementById("personaDecisionRights");
    if (rightsEl) rightsEl.textContent = persona.decisionRights;
  }

  // ---------------------------------------------------------------------------
  // VIEW 1: EXECUTIVE COMMAND CENTER
  // ---------------------------------------------------------------------------
  renderCommandCenter() {
    const container = document.getElementById("commandCenterKpisGrid");
    if (!container) return;

    container.innerHTML = this.data.kpis.map(kpi => {
      const isSelected = kpi.scenarioId === this.currentScenarioId;
      return `
        <div class="glass-panel p-4 space-y-2.5 cursor-pointer transition-all duration-200 hover:border-purple-500/60 ${isSelected ? 'border-purple-500/80 ring-1 ring-purple-500/40 bg-slate-900/90' : ''}" onclick="window.biApp.loadScenario('${kpi.scenarioId}'); window.biApp.setView('investigate');">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-300 truncate" title="${kpi.name}">${kpi.name}</span>
            <span class="badge ${kpi.statusBadge} text-[9px]">${kpi.status}</span>
          </div>

          <div class="flex items-baseline justify-between pt-1">
            <span class="text-xl font-extrabold text-slate-100 font-mono">${kpi.metric}</span>
            <span class="delta-pill ${kpi.isNegative ? 'negative' : 'positive'} text-[11px]">${kpi.delta}</span>
          </div>

          <!-- Sparkline Mini Visual -->
          <div class="h-6 w-full flex items-end gap-1 pt-1 opacity-80">
            ${kpi.sparkline.map((val, idx) => {
              const min = Math.min(...kpi.sparkline);
              const max = Math.max(...kpi.sparkline);
              const heightPct = max === min ? 50 : Math.max(15, Math.round(((val - min) / (max - min)) * 100));
              return `<div class="flex-1 bg-purple-500/40 rounded-t-sm hover:bg-purple-400" style="height: ${heightPct}%;" title="Period ${idx+1}: ${val}"></div>`;
            }).join("")}
          </div>

          <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
            <span>Signal: <strong class="text-purple-300">${kpi.signalScore}/100</strong></span>
            <span>${kpi.freshness}</span>
          </div>
        </div>
      `;
    }).join("");

    this.renderPrioritySignals();
  }

  renderPrioritySignals() {
    const container = document.getElementById("prioritySignalsList");
    if (!container) return;

    container.innerHTML = this.data.prioritySignals.map(sig => `
      <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-purple-500/40 transition-all cursor-pointer" onclick="window.biApp.loadScenario('${sig.scenarioId}'); window.biApp.setView('investigate');">
        <div class="flex items-center gap-3.5">
          <div class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold font-mono text-xs">
            #${sig.rank}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-100">${sig.title}</span>
              <span class="badge ${sig.statusBadge} text-[9px]">${sig.actionRoute}</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">${sig.entity} • Assigned: <span class="text-purple-300">${sig.assignedOwner}</span></p>
          </div>
        </div>

        <div class="flex items-center gap-4 text-xs font-mono self-end md:self-center">
          <div class="text-right">
            <span class="text-[10px] text-slate-400 block">Composite Priority</span>
            <span class="text-xs font-bold text-purple-300">${sig.compositePriorityScore}/100</span>
          </div>
          <button class="btn-outline text-xs py-1.5 px-3 font-semibold" onclick="event.stopPropagation(); window.biApp.loadScenario('${sig.scenarioId}'); window.biApp.setView('investigate');">
            Investigate →
          </button>
        </div>
      </div>
    `).join("");
  }

  // ---------------------------------------------------------------------------
  // VIEW 2: HERO INVESTIGATION WORKSPACE RENDERER
  // ---------------------------------------------------------------------------
  renderInvestigateStage() {
    const sc = this.getCurrentScenario();

    // Baseline Filter Checks
    const checksContainer = document.getElementById("investigateChecksList");
    if (checksContainer && sc.detect.baselineChecks) {
      checksContainer.innerHTML = sc.detect.baselineChecks.map(item => `
        <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
          <span class="inline-flex items-center justify-center w-4 h-4 rounded-full ${item.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : item.status === 'WARN' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'} text-[10px] font-bold font-mono mt-0.5">
            ${item.status === 'PASS' ? '✓' : item.status === 'WARN' ? '!' : '✕'}
          </span>
          <div class="flex-1">
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-slate-200">${item.check}</span>
              <span class="text-[10px] font-mono font-bold ${item.status === 'PASS' ? 'text-emerald-400' : item.status === 'WARN' ? 'text-amber-400' : 'text-rose-400'}">${item.status}</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">${item.detail}</p>
          </div>
        </div>
      `).join("");
    }

    // Driver Contributions Horizontal Breakdown
    const driversContainer = document.getElementById("driverContributionsList");
    if (driversContainer && sc.explain.driverContributions) {
      driversContainer.innerHTML = sc.explain.driverContributions.map(d => `
        <div class="space-y-1 p-2.5 rounded-lg hover:bg-slate-900/50 transition-all border border-transparent hover:border-slate-800">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-200">${d.driver}</span>
              <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-purple-300">${d.status}</span>
            </div>
            <span class="font-bold font-mono text-purple-300">${d.contributionPct}% Variance Share</span>
          </div>
          <div class="driver-bar-bg">
            <div class="driver-bar-fill ${d.color}" style="width: ${d.contributionPct}%;"></div>
          </div>
          <p class="text-[11px] text-slate-400 italic">${d.evidence}</p>
        </div>
      `).join("");
    }

    // Suspected Drivers Disproven
    const disprovenContainer = document.getElementById("explainDisprovenList");
    if (disprovenContainer && sc.explain.suspectedDriversDisproven) {
      disprovenContainer.innerHTML = sc.explain.suspectedDriversDisproven.map(item => `
        <div class="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-200 line-through decoration-rose-500/80">${item.driver}</span>
            <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${item.verdict === 'DISPROVEN' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}">${item.verdict}</span>
          </div>
          <p class="text-[11px] text-slate-400">${item.reason}</p>
        </div>
      `).join("");
    }

    // Evidence Chain Cards
    const chainContainer = document.getElementById("explainEvidenceChain");
    if (chainContainer && sc.explain.evidenceChain) {
      chainContainer.innerHTML = sc.explain.evidenceChain.map(ev => `
        <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-purple-500/40 transition-all cursor-pointer" onclick="window.biApp.openDrawer('${ev.id}')">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="badge ${ev.type === 'counter_signal' ? 'badge-amber' : ev.type === 'unstructured' ? 'badge-cyan' : 'badge-purple'} text-[9px]">${ev.badge}</span>
              <span class="text-[11px] text-slate-400 font-mono">${ev.source}</span>
            </div>
            <span class="text-[10px] font-mono text-purple-300">Weight: ${Math.round(ev.confidenceWeight * 100)}%</span>
          </div>

          <h5 class="text-xs font-bold text-slate-100">${ev.title}</h5>
          <p class="text-[11px] text-slate-300 leading-relaxed">${ev.description}</p>

          ${ev.metrics ? `
            <div class="grid grid-cols-2 gap-2 pt-1">
              ${ev.metrics.map(m => `
                <div class="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <div class="text-[9px] text-slate-400 font-mono">${m.label}</div>
                  <div class="text-xs font-bold text-purple-300 font-mono">${m.value} <span class="text-[10px] text-rose-400">${m.delta}</span></div>
                </div>
              `).join("")}
            </div>
          ` : ''}

          <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
            <span>Grain: ${ev.grain || 'Hourly'}</span>
            <span class="text-cyan-400 hover:underline">Inspect Lineage →</span>
          </div>
        </div>
      `).join("");
    }

    // Confidence Score & Breakdown
    const confScore = document.getElementById("validateConfidenceScore");
    if (confScore) confScore.textContent = `${sc.validate.confidenceScore}/100`;

    const signalsCount = document.getElementById("validateSignalsCount");
    if (signalsCount) signalsCount.textContent = `${sc.validate.signalsAlignCount} independent signals align`;

    const causalStatus = document.getElementById("validateCausalStatus");
    if (causalStatus) causalStatus.textContent = sc.validate.causalLinkStatus;

    const mathContainer = document.getElementById("validateMathBreakdown");
    if (mathContainer && sc.validate.mathematicalBreakdown) {
      mathContainer.innerHTML = sc.validate.mathematicalBreakdown.map(item => `
        <div class="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-slate-800 text-xs">
          <span class="text-slate-300 truncate max-w-[260px]" title="${item.detail}">${item.factor}</span>
          <span class="font-mono font-bold ${item.points.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}">${item.points}</span>
        </div>
      `).join("");
    }

    this.renderInvestigateChart();
  }

  renderInvestigateChart() {
    const canvas = document.getElementById("investigateChartCanvas");
    if (!canvas) return;

    const sc = this.getCurrentScenario();
    const d = sc.detect.chartData;

    if (this.charts.investigate) {
      this.charts.investigate.destroy();
    }

    this.charts.investigate = new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: d.labels,
        datasets: [
          {
            label: "Expected Seasonal Baseline",
            data: d.baseline,
            borderColor: "rgba(148, 163, 184, 0.7)",
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          },
          {
            label: "Expected Lower Bound (2σ)",
            data: d.expectedLower,
            borderColor: "rgba(245, 158, 11, 0.4)",
            borderDash: [2, 2],
            borderWidth: 1,
            pointRadius: 0,
            fill: "+1",
            backgroundColor: "rgba(139, 92, 246, 0.05)"
          },
          {
            label: "Actual Observed Signal",
            data: d.actual,
            borderColor: sc.isNegative ? "#f43f5e" : "#10b981",
            backgroundColor: sc.isNegative ? "rgba(244, 63, 94, 0.15)" : "rgba(16, 185, 129, 0.15)",
            borderWidth: 3,
            pointBackgroundColor: sc.isNegative ? "#f43f5e" : "#10b981",
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.25
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: "#94a3b8",
              font: { family: "'JetBrains Mono', monospace", size: 10 }
            }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#64748b", font: { family: "'JetBrains Mono', monospace", size: 10 } }
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#64748b", font: { family: "'JetBrains Mono', monospace", size: 10 } }
          }
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 10-STEP REAL-TIME GUIDED INVESTIGATION RUNNER
  // ---------------------------------------------------------------------------
  runGuidedInvestigation() {
    const sc = this.getCurrentScenario();
    const modal = document.getElementById("guidedInvestigationModal");
    const container = document.getElementById("guidedStepsContainer");
    const progress = document.getElementById("guidedProgressBar");
    const counter = document.getElementById("guidedStepCounter");
    const statusText = document.getElementById("guidedStatusText");
    const doneBtn = document.getElementById("guidedDoneBtn");

    if (!modal || !container) return;

    modal.classList.add("open");
    doneBtn.classList.add("hidden");
    this.isInvestigating = true;

    const steps = sc.investigationSteps || [
      { id: 1, name: "Validating Signal Anomaly", status: "DONE", detail: "Calculated 3.2σ deviation." },
      { id: 2, name: "Checking Seasonality", status: "DONE", detail: "De-trended historical variance." }
    ];

    let currentStepIdx = 0;

    const renderSteps = () => {
      container.innerHTML = steps.map((s, idx) => {
        const isPast = idx < currentStepIdx;
        const isCurrent = idx === currentStepIdx;
        return `
          <div class="investigation-step-pill ${isPast ? 'done' : isCurrent ? 'running' : 'opacity-40'}">
            <span class="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
              isPast ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-purple-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
            }">
              ${isPast ? '✓' : idx + 1}
            </span>
            <div class="flex-1">
              <div class="flex items-center justify-between text-xs font-semibold text-slate-100">
                <span>${s.name}</span>
                <span class="text-[10px] font-mono ${isPast ? 'text-emerald-400' : isCurrent ? 'text-purple-300' : 'text-slate-500'}">
                  ${isPast ? 'VERIFIED' : isCurrent ? 'COMPUTING...' : 'PENDING'}
                </span>
              </div>
              <p class="text-[10px] text-slate-400 mt-0.5">${s.detail}</p>
            </div>
          </div>
        `;
      }).join("");
    };

    renderSteps();

    // Step-by-step runner timer
    if (this.guidedTimer) clearInterval(this.guidedTimer);

    this.guidedTimer = setInterval(() => {
      currentStepIdx++;
      const pct = Math.min(100, Math.round(((currentStepIdx + 1) / steps.length) * 100));
      if (progress) progress.style.width = `${pct}%`;
      if (counter) counter.textContent = `Step ${Math.min(steps.length, currentStepIdx + 1)}/${steps.length}`;

      if (currentStepIdx < steps.length) {
        if (statusText) statusText.textContent = `${steps[currentStepIdx].name}...`;
        renderSteps();
      } else {
        clearInterval(this.guidedTimer);
        this.isInvestigating = false;
        if (statusText) statusText.textContent = "Decision brief computation complete! 100% Traceable.";
        if (doneBtn) doneBtn.classList.remove("hidden");
        renderSteps();
        this.showToast("Guided investigation finished successfully!");
      }
    }, 280);
  }

  closeGuidedModal() {
    const modal = document.getElementById("guidedInvestigationModal");
    if (modal) modal.classList.remove("open");
    this.setView("investigate");
  }

  // ---------------------------------------------------------------------------
  // CANVAS EVIDENCE GRAPH & PHYSICS
  // ---------------------------------------------------------------------------
  initCanvas() {
    this.canvas = document.getElementById("evidenceGraphCanvas");
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();

    this.canvas.addEventListener("mousemove", (e) => this.handleCanvasMouseMove(e));
    this.canvas.addEventListener("mousedown", (e) => this.handleCanvasMouseDown(e));
    window.addEventListener("mouseup", () => this.handleCanvasMouseUp());
    this.canvas.addEventListener("click", (e) => this.handleCanvasClick(e));
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height || 400;
  }

  buildGraphModel() {
    if (!this.canvas) return;
    const w = this.canvas.width || 700;
    const h = this.canvas.height || 400;
    const sc = this.getCurrentScenario();

    const cx = w / 2;
    const cy = h / 2;

    this.graphNodes = [
      {
        id: "center_kpi",
        label: sc.kpiName,
        sub: sc.kpiDelta,
        type: "kpi",
        color: "#f43f5e",
        radius: 34,
        x: cx,
        y: cy,
        vx: 0,
        vy: 0,
        fixed: true
      }
    ];

    if (sc.explain && sc.explain.evidenceChain) {
      const count = sc.explain.evidenceChain.length;
      sc.explain.evidenceChain.forEach((ev, idx) => {
        const angle = (idx / count) * Math.PI * 2;
        const dist = 135 + (idx % 2 === 0 ? 25 : -15);
        const nx = cx + Math.cos(angle) * dist;
        const ny = cy + Math.sin(angle) * dist;

        const isCounter = ev.type === "counter_signal";
        const isDoc = ev.type === "unstructured";

        this.graphNodes.push({
          id: ev.id,
          label: ev.source,
          sub: ev.title.substring(0, 20) + "...",
          type: isCounter ? "counter" : isDoc ? "doc" : "data",
          color: isCounter ? "#f59e0b" : isDoc ? "#06b6d4" : "#8b5cf6",
          radius: 26,
          x: nx,
          y: ny,
          vx: 0,
          vy: 0,
          fixed: false,
          evidenceData: ev
        });
      });
    }

    this.graphEdges = [];
    for (let i = 1; i < this.graphNodes.length; i++) {
      this.graphEdges.push({
        source: this.graphNodes[0],
        target: this.graphNodes[i],
        length: 135,
        pulseOffset: Math.random() * 100
      });
    }
  }

  startCanvasAnimation() {
    let tick = 0;
    const loop = () => {
      tick++;
      this.updatePhysics();
      this.drawCanvas(tick);
      this.animFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  updatePhysics() {
    const damping = 0.85;
    const springK = 0.04;

    this.graphEdges.forEach(edge => {
      const dx = edge.target.x - edge.source.x;
      const dy = edge.target.y - edge.source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - edge.length) * springK;

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (!edge.target.fixed && edge.target !== this.draggedNode) {
        edge.target.vx -= fx;
        edge.target.vy -= fy;
      }
    });

    this.graphNodes.forEach(node => {
      if (!node.fixed && node !== this.draggedNode) {
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;

        if (this.canvas) {
          node.x = Math.max(node.radius, Math.min(this.canvas.width - node.radius, node.x));
          node.y = Math.max(node.radius, Math.min(this.canvas.height - node.radius, node.y));
        }
      }
    });
  }

  drawCanvas(tick) {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Edges & pulses
    this.graphEdges.forEach(edge => {
      ctx.beginPath();
      ctx.moveTo(edge.source.x, edge.source.y);
      ctx.lineTo(edge.target.x, edge.target.y);
      ctx.strokeStyle = "rgba(139, 92, 246, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const t = ((tick + edge.pulseOffset) % 120) / 120;
      const px = edge.source.x + (edge.target.x - edge.source.x) * t;
      const py = edge.source.y + (edge.target.y - edge.source.y) * t;

      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#c084fc";
      ctx.fill();
    });

    // Nodes
    this.graphNodes.forEach(node => {
      const isHovered = this.hoveredNode === node;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + (isHovered ? 4 : 1), 0, Math.PI * 2);
      ctx.fillStyle = node.color + "25";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#0d1424";
      ctx.fill();
      ctx.strokeStyle = isHovered ? "#ffffff" : node.color;
      ctx.lineWidth = isHovered ? 2 : 1.5;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#f8fafc";
      ctx.font = `bold ${node.type === 'kpi' ? '11px' : '9px'} 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText(node.label.substring(0, 15), node.x, node.y - 3);

      ctx.fillStyle = node.color;
      ctx.font = "bold 8px 'JetBrains Mono', monospace";
      ctx.fillText(node.sub.substring(0, 16), node.x, node.y + 8);
    });
  }

  handleCanvasMouseMove(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (this.isDragging && this.draggedNode) {
      this.draggedNode.x = mx;
      this.draggedNode.y = my;
      return;
    }

    let found = null;
    this.graphNodes.forEach(node => {
      const dist = Math.hypot(node.x - mx, node.y - my);
      if (dist <= node.radius + 4) {
        found = node;
      }
    });

    this.hoveredNode = found;
    this.canvas.style.cursor = found ? "pointer" : "default";
  }

  handleCanvasMouseDown(e) {
    if (this.hoveredNode) {
      this.isDragging = true;
      this.draggedNode = this.hoveredNode;
    }
  }

  handleCanvasMouseUp() {
    this.isDragging = false;
    this.draggedNode = null;
  }

  handleCanvasClick(e) {
    if (this.hoveredNode) {
      this.selectedNode = this.hoveredNode;
      if (this.hoveredNode.evidenceData) {
        this.openDrawer(this.hoveredNode.evidenceData.id);
      } else if (this.hoveredNode.type === "kpi") {
        this.openContractDrawer("kpi_revenue");
      }
    }
  }

  // ---------------------------------------------------------------------------
  // VIEW 3: DECISION LAB / SCENARIO TESTING SANDBOX
  // ---------------------------------------------------------------------------
  renderTestSandbox() {
    const sc = this.getCurrentScenario();
    const container = document.getElementById("sandboxLeversContainer");
    const assumptionsContainer = document.getElementById("sandboxAssumptionsList");

    if (!container || !sc.test) return;

    container.innerHTML = sc.test.levers.map(l => {
      const currentVal = this.leverState[l.id] !== undefined ? this.leverState[l.id] : l.defaultValue;
      if (l.type === "slider") {
        return `
          <div class="space-y-1.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-100">${l.name}</span>
              <span class="font-mono font-bold text-purple-400" id="val_${l.id}">${currentVal}${l.unit}</span>
            </div>
            <input type="range" min="${l.min}" max="${l.max}" step="${l.step}" value="${currentVal}" 
              oninput="window.biApp.updateLeverValue('${l.id}', this.value, '${l.unit}')">
            <p class="text-[11px] text-slate-400">${l.description}</p>
          </div>
        `;
      } else {
        return `
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="text-xs font-bold text-slate-100">${l.name}</div>
              <p class="text-[11px] text-slate-400">${l.description}</p>
              ${l.warning ? `<p class="text-[10px] text-amber-400 font-mono mt-1">${l.warning}</p>` : ''}
            </div>
            <label class="toggle-switch mt-1">
              <input type="checkbox" ${currentVal ? 'checked' : ''} onchange="window.biApp.updateToggleLever('${l.id}', this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </div>
        `;
      }
    }).join("");

    if (assumptionsContainer && sc.test.explicitAssumptions) {
      assumptionsContainer.innerHTML = sc.test.explicitAssumptions.map(item => `
        <li class="flex items-start gap-2">
          <span class="text-purple-400 font-mono font-bold mt-0.5">•</span>
          <span>${item}</span>
        </li>
      `).join("");
    }

    this.recalculateSandboxOutput();
  }

  updateLeverValue(leverId, val, unit) {
    this.leverState[leverId] = parseFloat(val);
    const label = document.getElementById(`val_${leverId}`);
    if (label) label.textContent = `${val}${unit}`;
    this.recalculateSandboxOutput();
  }

  updateToggleLever(leverId, isChecked) {
    this.leverState[leverId] = isChecked;
    this.recalculateSandboxOutput();
  }

  recalculateSandboxOutput() {
    const sc = this.getCurrentScenario();
    if (!sc.test) return;

    let deltaRev = 0;
    let totalCost = 0;

    sc.test.levers.forEach(l => {
      const val = this.leverState[l.id];
      if (l.type === "slider") {
        const factor = val || 0;
        deltaRev += factor * (l.revenueMultiplier || 0.01);
        totalCost += (factor / (l.max || 100)) * (l.costPerUnit || 0.4);
      } else if (l.type === "toggle" && val) {
        deltaRev += l.revenueProtection || 0;
        totalCost += l.cost || 0;
      }
    });

    const baseline = sc.test.baselineRevenue || 38.7;
    const projected = baseline + deltaRev;
    const netEbitda = deltaRev - totalCost;

    const projRevEl = document.getElementById("scenarioProjectedRevenue");
    if (projRevEl) projRevEl.textContent = `₹${projected.toFixed(1)}M*`;

    const deltaRevEl = document.getElementById("scenarioDeltaRevenue");
    if (deltaRevEl) deltaRevEl.textContent = `Δ +₹${deltaRev.toFixed(2)}M*`;

    const netEbitdaEl = document.getElementById("scenarioNetEbitda");
    if (netEbitdaEl) netEbitdaEl.textContent = `+₹${Math.max(0, netEbitda).toFixed(2)}M`;

    const totalCostEl = document.getElementById("scenarioTotalCost");
    if (totalCostEl) totalCostEl.textContent = `₹${totalCost.toFixed(2)}M`;

    this.renderSandboxChart(baseline, projected);
  }

  renderSandboxChart(baselineVal = 38.7, projectedVal = 40.1) {
    const canvas = document.getElementById("sandboxChartCanvas");
    if (!canvas) return;

    if (this.charts.sandbox) {
      this.charts.sandbox.destroy();
    }

    this.charts.sandbox = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Baseline Anomaly", "Scenario Projection"],
        datasets: [{
          label: "Revenue (INR Millions)",
          data: [baselineVal, projectedVal],
          backgroundColor: ["rgba(244, 63, 94, 0.4)", "rgba(139, 92, 246, 0.65)"],
          borderColor: ["#f43f5e", "#8b5cf6"],
          borderWidth: 1.5,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
          y: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#64748b" } }
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // VIEW 4: ACTION CENTER & DECISION GATE RENDERER
  // ---------------------------------------------------------------------------
  renderActStage() {
    const sc = this.getCurrentScenario();
    const gateContainer = document.getElementById("actGateContainer");
    const actionsContainer = document.getElementById("actActionsList");
    const auditContainer = document.getElementById("auditLogList");

    if (!sc.act) return;

    if (gateContainer) {
      const isRecommend = sc.act.routedGate === "RECOMMEND";
      const isReview = sc.act.routedGate === "REVIEW";
      const isDefer = sc.act.routedGate === "DEFER" || sc.act.routedGate.includes("ABSTAIN");

      gateContainer.innerHTML = `
        <div class="p-5 rounded-xl border ${isRecommend ? 'bg-emerald-950/30 border-emerald-500/50' : isReview ? 'bg-amber-950/30 border-amber-500/50' : isDefer ? 'bg-purple-950/30 border-purple-500/50' : 'bg-rose-950/30 border-rose-500/50'} space-y-2">
          <div class="flex items-center justify-between">
            <span class="badge ${isRecommend ? 'badge-emerald' : isReview ? 'badge-amber' : isDefer ? 'badge-purple' : 'badge-rose'} text-xs font-mono">
              ROUTED GATE: ${sc.act.routedGate}
            </span>
            <span class="text-xs font-mono text-slate-400">Confidence Score: ${sc.validate.confidenceScore}/100</span>
          </div>
          <p class="text-xs text-slate-200 leading-relaxed">${sc.act.gateRationale}</p>
        </div>
      `;
    }

    if (actionsContainer && sc.act.suggestedActions) {
      actionsContainer.innerHTML = sc.act.suggestedActions.map(act => `
        <div class="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-purple-500/40 transition-all">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="badge ${act.priority.includes('P0') ? 'badge-rose' : 'badge-purple'} text-[10px] font-mono">${act.priority}</span>
              <h5 class="text-xs font-bold text-slate-100">${act.title}</h5>
            </div>
            <span class="text-xs font-mono text-purple-300">Confidence: ${act.confidence}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div class="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span class="text-[9px] text-slate-400 block">EXPECTED IMPACT</span>
              <span class="font-bold text-emerald-400">${act.impact}</span>
            </div>
            <div class="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span class="text-[9px] text-slate-400 block">OPEX BUDGET</span>
              <span class="font-bold text-slate-200">${act.cost}</span>
            </div>
            <div class="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span class="text-[9px] text-slate-400 block">ASSIGNED OWNER</span>
              <span class="font-bold text-purple-300">${act.owner}</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <span class="text-slate-400 text-[11px]">Monitoring: <em class="text-slate-300">${act.monitoringPlan}</em></span>
            <button class="btn-primary text-xs py-1.5 px-3.5 font-bold" onclick="window.biApp.openActionModal('${act.id}')">
              Authorize Action →
            </button>
          </div>
        </div>
      `).join("");
    }

    if (auditContainer && sc.act.auditTrail) {
      auditContainer.innerHTML = sc.act.auditTrail.map(entry => `
        <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-2.5">
            <span class="text-purple-400 font-bold">${entry.time}</span>
            <span class="text-slate-400">|</span>
            <span class="text-slate-300 font-bold">${entry.actor}:</span>
            <span class="text-slate-400">${entry.action}</span>
          </div>
          <span class="text-[10px] text-slate-500 hidden md:inline">#sha256:${Math.random().toString(36).substring(2, 8)}</span>
        </div>
      `).join("");
    }
  }

  // ---------------------------------------------------------------------------
  // VIEW 5: GOVERNANCE & OBSERVABILITY RENDERERS
  // ---------------------------------------------------------------------------
  renderConnectorsList() {
    const container = document.getElementById("connectorsGrid");
    if (!container) return;

    container.innerHTML = this.data.connectors.map(c => `
      <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-purple-500/40 transition-all">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <i data-lucide="${c.icon || 'database'}" class="w-4 h-4"></i>
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-100">${c.name}</h4>
              <p class="text-[10px] text-purple-300 font-mono">${c.source}</p>
            </div>
          </div>
          <span class="badge badge-emerald text-[9px] font-mono">ONLINE</span>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">${c.description}</p>

        <div class="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
          <div class="p-2 rounded bg-slate-950/60 border border-slate-800">
            <span class="text-[9px] text-slate-400 block">GRAIN & CADENCE</span>
            <span class="text-[10px] text-slate-200">${c.grain}</span>
          </div>
          <div class="p-2 rounded bg-slate-950/60 border border-slate-800">
            <span class="text-[9px] text-slate-400 block">QUALITY & SLA</span>
            <span class="text-[10px] text-emerald-400">${c.qualityScore}% Quality (${c.freshness})</span>
          </div>
        </div>
      </div>
    `).join("");
  }

  renderSemanticContracts() {
    const container = document.getElementById("semanticContractsList");
    if (!container) return;

    container.innerHTML = this.data.semanticContracts.map(sc => `
      <div class="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 hover:border-cyan-500/40 transition-all cursor-pointer" onclick="window.biApp.openContractDrawer('${sc.kpiId}')">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h4 class="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>${sc.name}</span>
              <span class="badge badge-cyan text-[10px] font-mono">${sc.kpiId}</span>
            </h4>
            <p class="text-xs text-purple-300 font-mono">Owner: ${sc.owner}</p>
          </div>
          <button class="btn-outline text-xs py-1 px-3 self-start sm:self-center" onclick="event.stopPropagation(); window.biApp.openContractDrawer('${sc.kpiId}')">
            Inspect Contract →
          </button>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">${sc.definition}</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div class="p-2.5 rounded bg-slate-950/60 border border-slate-800">
            <span class="text-[9px] text-slate-400 block uppercase">Formula</span>
            <code class="text-cyan-300 text-[11px]">${sc.formula}</code>
          </div>
          <div class="p-2.5 rounded bg-slate-950/60 border border-slate-800">
            <span class="text-[9px] text-slate-400 block uppercase">Grain & Aggregation</span>
            <span class="text-slate-200 text-[11px]">${sc.grain}</span>
          </div>
          <div class="p-2.5 rounded bg-slate-950/60 border border-slate-800">
            <span class="text-[9px] text-slate-400 block uppercase">Freshness SLA</span>
            <span class="text-emerald-400 text-[11px]">${sc.freshnessSLA}</span>
          </div>
        </div>
      </div>
    `).join("");
  }

  openContractDrawer(kpiId) {
    const contract = this.data.semanticContracts.find(c => c.kpiId === kpiId) || this.data.semanticContracts[0];
    const drawer = document.getElementById("contractDetailDrawer");
    const backdrop = document.getElementById("drawerBackdrop");
    const title = document.getElementById("contractDrawerTitle");
    const owner = document.getElementById("contractDrawerOwner");
    const body = document.getElementById("contractDrawerBody");

    if (!drawer || !body) return;

    title.textContent = contract.name;
    owner.textContent = `Governance Owner: ${contract.owner}`;

    body.innerHTML = `
      <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
        <span class="text-[10px] text-purple-300 uppercase font-mono font-bold">Business Definition</span>
        <p class="text-slate-200">${contract.definition}</p>
      </div>

      <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
        <span class="text-[10px] text-cyan-300 uppercase font-mono font-bold">Authoritative SQL Formula</span>
        <code class="text-cyan-300 block font-mono text-[11px] p-2 rounded bg-slate-950">${contract.formula}</code>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs font-mono">
        <div class="p-2.5 rounded bg-slate-900 border border-slate-800">
          <span class="text-[9px] text-slate-400 block">MASTER SOURCE</span>
          <span class="text-slate-200 font-bold">${contract.masterSource}</span>
        </div>
        <div class="p-2.5 rounded bg-slate-900 border border-slate-800">
          <span class="text-[9px] text-slate-400 block">MATERIALITY THRESHOLD</span>
          <span class="text-rose-400 font-bold">${contract.materialityThreshold}</span>
        </div>
      </div>

      <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
        <span class="text-[10px] text-slate-400 uppercase font-mono">Driver Dimensions</span>
        <div class="flex flex-wrap gap-1.5 pt-1">
          ${contract.driverDimensions.map(d => `<span class="badge badge-purple text-[10px]">${d}</span>`).join("")}
        </div>
      </div>

      <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs">
        <span class="text-[10px] text-slate-400 uppercase font-mono">Data Lineage & Provenance</span>
        <p class="text-slate-300 font-mono text-[11px]">${contract.lineage}</p>
      </div>
    `;

    drawer.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
  }

  closeContractDrawer() {
    const drawer = document.getElementById("contractDetailDrawer");
    const backdrop = document.getElementById("drawerBackdrop");
    if (drawer) drawer.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
  }

  renderRbacMatrix() {
    const container = document.getElementById("rbacRolesGrid");
    if (!container) return;

    container.innerHTML = this.data.rbacMatrix.roles.map(r => {
      const isActive = r.id === this.currentPersona;
      return `
        <div class="p-4 rounded-xl bg-slate-900/80 border ${isActive ? 'border-purple-500/80 ring-1 ring-purple-500/40' : 'border-slate-800'} space-y-3 cursor-pointer" onclick="window.biApp.setPersona('${r.id}')">
          <div class="flex items-center justify-between">
            <span class="badge ${r.badge} text-[10px]">${r.name}</span>
            ${isActive ? '<span class="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE ROLE</span>' : ''}
          </div>

          <p class="text-xs text-slate-300 leading-relaxed">${r.description}</p>

          <div class="space-y-1 text-[11px]">
            <span class="text-[10px] text-emerald-400 uppercase font-mono font-bold">Allowed Domains</span>
            <div class="flex flex-wrap gap-1">
              ${r.allowedDomains.map(d => `<span class="px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-300 text-[9px] font-mono">${d}</span>`).join("")}
            </div>
          </div>

          <div class="space-y-1 text-[11px] pt-1">
            <span class="text-[10px] text-rose-400 uppercase font-mono font-bold">Restricted Domains</span>
            <div class="flex flex-wrap gap-1">
              ${r.restrictedDomains.map(d => `<span class="px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-300 text-[9px] font-mono">${d}</span>`).join("")}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  triggerSecurityViolationDemo() {
    const output = document.getElementById("securityViolationOutput");
    if (output) {
      output.classList.remove("hidden");
      this.showToast("Security Alert: HTTP 403 Forbidden Access Blocked!");
    }
  }

  resetSecurityDemo() {
    const output = document.getElementById("securityViolationOutput");
    if (output) {
      output.classList.add("hidden");
      this.showToast("Security sandbox state reset.");
    }
  }

  renderAiArchitecture() {
    const container = document.getElementById("aiArchitectureLayers");
    if (!container) return;

    container.innerHTML = this.data.aiArchitecture.layers.map(l => `
      <div class="p-4 rounded-xl border ${l.color} space-y-3">
        <div class="flex items-center justify-between">
          <span class="badge ${l.badge} text-[10px] font-mono">${l.layer}</span>
        </div>

        <ul class="space-y-1.5 text-xs text-slate-300">
          ${l.responsibilities.map(r => `
            <li class="flex items-start gap-1.5">
              <span class="text-purple-400 mt-0.5">•</span>
              <span>${r}</span>
            </li>
          `).join("")}
        </ul>

        <div class="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
          <strong class="text-slate-300">Tech:</strong> ${l.techStack}
        </div>
      </div>
    `).join("");
  }

  renderTelemetry() {
    const container = document.getElementById("telemetryStatsGrid");
    if (!container) return;

    const t = this.data.telemetry;

    const stats = [
      { label: "TOTAL LATENCY", value: `${(t.totalLatencyMs / 1000).toFixed(2)}s`, sub: "End-to-End" },
      { label: "QUERY LATENCY", value: `${t.breakdown.dataQueryMs}ms`, sub: "Snowflake/DuckDB" },
      { label: "ANALYTICS LATENCY", value: `${t.breakdown.analyticsMs}ms`, sub: "SciPy ANOVA" },
      { label: "LLM SYNTHESIS", value: `${(t.breakdown.llmSynthesisMs / 1000).toFixed(2)}s`, sub: "2 Model Calls" },
      { label: "TOKENS", value: `${t.inputTokens} / ${t.outputTokens}`, sub: "Input / Output" },
      { label: "ESTIMATED COST", value: `$${t.estimatedCostUsd}`, sub: "Per Run" }
    ];

    container.innerHTML = stats.map(s => `
      <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
        <span class="text-[9px] text-slate-400 font-mono block">${s.label}</span>
        <div class="text-lg font-extrabold text-purple-300 font-mono">${s.value}</div>
        <span class="text-[10px] text-slate-500">${s.sub}</span>
      </div>
    `).join("");
  }

  renderFeedbackLogs() {
    const container = document.getElementById("feedbackLogsTable");
    if (!container) return;

    container.innerHTML = this.data.feedbackRepository.map(f => `
      <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-100">${f.user}</span>
            <span class="badge badge-purple text-[9px]">${f.role}</span>
          </div>
          <span class="text-[10px] text-purple-300 font-mono">${f.feedbackType} (${f.rating})</span>
        </div>

        <p class="text-slate-300 leading-relaxed">${f.comments}</p>

        <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
          <span>Hypothesis: ${f.hypothesis}</span>
          <span class="text-emerald-400">${f.calibrationImpact}</span>
        </div>
      </div>
    `).join("");
  }

  printExecutiveBrief() {
    window.print();
  }

  // ---------------------------------------------------------------------------
  // SLIDE-OVER EVIDENCE INSPECTION DRAWER
  // ---------------------------------------------------------------------------
  openDrawer(evidenceId) {
    const sc = this.getCurrentScenario();
    const ev = sc.explain.evidenceChain.find(e => e.id === evidenceId);
    if (!ev) return;

    const drawer = document.getElementById("evidenceDetailDrawer");
    const backdrop = document.getElementById("drawerBackdrop");
    const title = document.getElementById("drawerTitle");
    const source = document.getElementById("drawerSource");
    const desc = document.getElementById("drawerDesc");
    const badge = document.getElementById("drawerBadge");
    const weight = document.getElementById("drawerWeight");
    const customBody = document.getElementById("drawerCustomBody");

    if (!drawer || !customBody) return;

    title.textContent = ev.title;
    source.textContent = `Source System: ${ev.source}`;
    desc.textContent = ev.description;
    badge.textContent = ev.badge;
    weight.textContent = `Weight: ${Math.round(ev.confidenceWeight * 100)}%`;

    customBody.innerHTML = `
      <div class="p-3 rounded bg-slate-900 border border-slate-800 space-y-1 text-xs font-mono">
        <span class="text-[10px] text-purple-300 uppercase">Provenance & Lineage</span>
        <p class="text-slate-300 text-[11px]">${ev.lineage || 'SAP S/4HANA → dbt → InsightX Semantic Layer'}</p>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs font-mono">
        <div class="p-2 rounded bg-slate-900 border border-slate-800">
          <span class="text-[9px] text-slate-400 block">TIMESTAMP</span>
          <span class="text-slate-200">${ev.timestamp || 'Today 12:00 PM'}</span>
        </div>
        <div class="p-2 rounded bg-slate-900 border border-slate-800">
          <span class="text-[9px] text-slate-400 block">OBSERVATION GRAIN</span>
          <span class="text-slate-200">${ev.grain || 'Daily × Region'}</span>
        </div>
      </div>

      ${ev.quote ? `
        <div class="p-3 rounded bg-purple-950/30 border border-purple-800 text-xs italic text-purple-200">
          ${ev.quote}
          <div class="text-[10px] text-slate-400 not-italic font-mono mt-1">— ${ev.author}</div>
        </div>
      ` : ''}
    `;

    drawer.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
  }

  closeDrawer() {
    const drawer = document.getElementById("evidenceDetailDrawer");
    const backdrop = document.getElementById("drawerBackdrop");
    if (drawer) drawer.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
  }

  // ---------------------------------------------------------------------------
  // MODALS & TOAST NOTIFICATIONS
  // ---------------------------------------------------------------------------
  openActionModal(actionId) {
    const sc = this.getCurrentScenario();
    const act = sc.act.suggestedActions.find(a => a.id === actionId);
    if (!act) return;

    const modal = document.getElementById("genericModalBackdrop");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");

    if (!modal || !body) return;

    title.textContent = `Authorize Action: ${act.title}`;
    body.innerHTML = `
      <div class="space-y-3 text-xs">
        <p class="text-slate-300">You are authorizing the execution of the following playbook under human governance rights:</p>
        
        <div class="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 font-mono">
          <div><strong class="text-slate-400">Owner:</strong> <span class="text-purple-300">${act.owner}</span></div>
          <div><strong class="text-slate-400">Expected Impact:</strong> <span class="text-emerald-400">${act.impact}</span></div>
          <div><strong class="text-slate-400">Budget:</strong> <span class="text-slate-200">${act.cost}</span></div>
          <div><strong class="text-slate-400">Payload:</strong> <code class="text-purple-400">${JSON.stringify(act.payload)}</code></div>
        </div>

        <div class="pt-2 flex items-center justify-end gap-2">
          <button class="btn-outline text-xs" onclick="window.biApp.closeModal()">Cancel</button>
          <button class="btn-primary text-xs font-bold" onclick="window.biApp.confirmActionDispatch('${act.title}')">
            Confirm & Dispatch Action →
          </button>
        </div>
      </div>
    `;

    modal.classList.add("open");
  }

  openDataRequestModal() {
    const modal = document.getElementById("genericModalBackdrop");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");

    if (!modal || !body) return;

    title.textContent = "Request Additional Historical Data Stream";
    body.innerHTML = `
      <div class="space-y-3 text-xs">
        <p class="text-slate-300">To resolve the current abstention and establish a statistically significant seasonal baseline, specify data request parameters:</p>
        
        <div class="space-y-2">
          <label class="block text-slate-400">Required Observation Window</label>
          <input type="text" value="14 Additional Daily Batches (n ≥ 26)" class="w-full p-2 rounded bg-slate-950 border border-slate-800 text-slate-200" readonly>
        </div>

        <div class="space-y-2">
          <label class="block text-slate-400">Target Data Stream</label>
          <input type="text" value="GA4 Session Attribution & Ad Creative Funnels" class="w-full p-2 rounded bg-slate-950 border border-slate-800 text-slate-200" readonly>
        </div>

        <div class="pt-2 flex items-center justify-end gap-2">
          <button class="btn-outline text-xs" onclick="window.biApp.closeModal()">Cancel</button>
          <button class="btn-primary text-xs font-bold" onclick="window.biApp.confirmDataRequest()">
            Submit Ingestion Ticket →
          </button>
        </div>
      </div>
    `;

    modal.classList.add("open");
  }

  openExperimentModal() {
    const modal = document.getElementById("genericModalBackdrop");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");

    if (!modal || !body) return;

    title.textContent = "Launch Controlled A/B Channel Split Experiment";
    body.innerHTML = `
      <div class="space-y-3 text-xs">
        <p class="text-slate-300">Configure randomized traffic isolation to separate ad audience quality from product pricing willingness-to-pay:</p>
        
        <div class="p-3 rounded bg-slate-950 border border-slate-800 space-y-1 font-mono">
          <div><strong class="text-slate-400">Variant A:</strong> High-Intent Google Brand Search (50% Traffic)</div>
          <div><strong class="text-slate-400">Variant B:</strong> Broad TikTok Video Prospecting (50% Traffic)</div>
          <div><strong class="text-slate-400">Sample Power:</strong> 10,000 Visitors (7 Days)</div>
        </div>

        <div class="pt-2 flex items-center justify-end gap-2">
          <button class="btn-outline text-xs" onclick="window.biApp.closeModal()">Cancel</button>
          <button class="btn-primary text-xs font-bold" onclick="window.biApp.confirmExperimentLaunch()">
            Deploy Experiment Variant →
          </button>
        </div>
      </div>
    `;

    modal.classList.add("open");
  }

  openFeedbackModal() {
    const modal = document.getElementById("genericModalBackdrop");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");

    if (!modal || !body) return;

    title.textContent = "Submit Analyst Calibration Feedback";
    body.innerHTML = `
      <div class="space-y-3 text-xs">
        <p class="text-slate-300">Your feedback is captured to calibrate analytical hypothesis ranking and statistical weights:</p>
        
        <div class="space-y-2">
          <label class="block text-slate-400">Hypothesis Assessment</label>
          <select id="feedbackSelect" class="w-full p-2 rounded bg-slate-950 border border-slate-800 text-slate-200">
            <option value="ACCEPTED_CORRECT">Accept Hypothesis as Correct & Corroborated</option>
            <option value="REJECTED_INCORRECT">Reject Hypothesis (Counter-evidence present)</option>
            <option value="MISSING_EVIDENCE">Missing Critical Evidence Stream</option>
            <option value="RECOMMENDATION_USEFUL">Recommendation Useful & Actionable</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="block text-slate-400">Analyst Comments / Notes</label>
          <textarea id="feedbackNotes" class="w-full p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 h-20" placeholder="Describe observations or adjustments..."></textarea>
        </div>

        <div class="pt-2 flex items-center justify-end gap-2">
          <button class="btn-outline text-xs" onclick="window.biApp.closeModal()">Cancel</button>
          <button class="btn-primary text-xs font-bold" onclick="window.biApp.confirmFeedbackSubmit()">
            Save Calibration Feedback →
          </button>
        </div>
      </div>
    `;

    modal.classList.add("open");
  }

  closeModal(e) {
    const modal = document.getElementById("genericModalBackdrop");
    if (modal) modal.classList.remove("open");
  }

  confirmActionDispatch(title) {
    this.closeModal();
    this.showToast(`Action Dispatched: "${title}" recorded in immutable ledger.`);
  }

  confirmDataRequest() {
    this.closeModal();
    this.showToast("Data Request Ticket #DT-8891 dispatched to Data Engineering queue.");
  }

  confirmExperimentLaunch() {
    this.closeModal();
    this.showToast("A/B Channel Split Experiment deployed to edge routing.");
  }

  confirmFeedbackSubmit() {
    const notes = document.getElementById("feedbackNotes")?.value || "Verified by analyst.";
    const select = document.getElementById("feedbackSelect")?.value || "ACCEPTED_CORRECT";

    this.data.feedbackRepository.unshift({
      id: `fb-${Date.now().toString().slice(-4)}`,
      user: "Current User",
      role: this.currentPersona.toUpperCase(),
      insightId: this.currentScenarioId,
      hypothesis: this.getCurrentScenario().explain.leadingHypothesis,
      feedbackType: select,
      rating: "5/5",
      comments: notes,
      timestamp: new Date().toISOString(),
      calibrationImpact: "Updated weight vector"
    });

    this.renderFeedbackLogs();
    this.closeModal();
    this.showToast("Calibration feedback logged successfully!");
  }

  showToast(message) {
    const toast = document.getElementById("toastNotification");
    const msgEl = document.getElementById("toastMessage");
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }
}

// -----------------------------------------------------------------------------
// GLOBAL INITIALIZATION & WINDOW MOUNT
// -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  window.biApp = new BusinessIntelligenceApp();
  window.insightXApp = window.biApp;
});
