import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";

import {
  ShieldCheck,
  LayoutDashboard,
  Activity,
  AlertTriangle,
  BrainCircuit,
  FileWarning,
  RefreshCw,
  ShieldAlert,
  CheckCircle,
  Zap,
  Search,
  Bell,
  Server,
  Globe,
  Lock,
  Plus,
  X,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Backend URL
const API_URL = "http://127.0.0.1:8001";

// Priority colors
const PRIORITY_COLORS = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
};

const INITIAL_FORM = {
  incident_id: "",
  incident_type: "Malware Detection",
  severity: 3,
  data_sensitivity: 3,
  asset_importance: 3,
  attack_confidence: 3,
  affected_users: 1,
  business_impact: 3,
};

function App() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Incident search and priority filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM);

  // AI Analysis states
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Fetch incidents from FastAPI
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/incidents/ranked`
      );

      if (!response.ok) {
        throw new Error("Unable to retrieve incidents");
      }

      const data = await response.json();

      setIncidents(data.incidents || []);

await fetchStatistics();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load incidents when dashboard opens
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Fetch individual incident AI analysis
  const fetchIncidentAnalysis = async (incidentId) => {
    try {
      setAnalysisLoading(true);
      setAnalysis(null);
      setSelectedIncident(incidentId);
      setError("");

      const response = await fetch(
        `${API_URL}/incidents/${encodeURIComponent(
          incidentId
        )}/analysis`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to fetch incident analysis"
        );
      }

      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Close analysis panel
  const closeAnalysis = () => {
    setSelectedIncident(null);
    setAnalysis(null);
  };

  // Assign incident to an analyst
const handleAssignIncident = async (incidentId) => {
  const assignedTo = window.prompt("Enter analyst name:");

  if (!assignedTo?.trim()) return;

  try {
    const response = await fetch(
      `${API_URL}/incidents/${encodeURIComponent(incidentId)}/assign`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to: assignedTo.trim() }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Assignment failed");
    }

    setSuccess("Incident assigned successfully!");
    await fetchIncidents();
  } catch (err) {
    setError(err.message);
  }
};

// Update incident status
const handleUpdateStatus = async (incidentId) => {
  const status = window.prompt(
    "Enter status: OPEN, INVESTIGATING, RESOLVED, or CLOSED"
  );

  if (!status?.trim()) return;

  try {
    const response = await fetch(
      `${API_URL}/incidents/${encodeURIComponent(incidentId)}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status.trim().toUpperCase() }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Status update failed");
    }

    setSuccess("Incident status updated!");
    await fetchIncidents();
  } catch (err) {
    setError(err.message);
  }
};

// Save investigation notes
const handleSaveNotes = async (incidentId) => {
  const notes = window.prompt("Enter investigation notes:");

  if (!notes?.trim()) return;

  try {
    const response = await fetch(
      `${API_URL}/incidents/${encodeURIComponent(incidentId)}/notes`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Notes update failed");
    }

    setSuccess("Investigation notes saved!");
    await fetchIncidents();
  } catch (err) {
    setError(err.message);
  }
};

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "incident_id" || name === "incident_type"
          ? value
          : Number(value),
    }));
  };

  // Submit incident to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(
              data.detail || "Unable to submit incident"
            )
        );
      }

      setSuccess(
        "Incident submitted and analyzed successfully!"
      );

      setFormData({ ...INITIAL_FORM });

      await fetchIncidents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate statistics
  // Backend statistics
const [statistics, setStatistics] = useState({
  total_incidents: 0,
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
  open: 0,
  investigating: 0,
  resolved: 0,
  closed: 0,
});

// Fetch statistics from backend
const fetchStatistics = async () => {
  try {
    const response = await fetch(`${API_URL}/statistics`);

    if (!response.ok) {
      throw new Error("Unable to fetch statistics");
    }

    const data = await response.json();
    setStatistics(data);
  } catch (err) {
    setError(err.message);
  }
};

const total = statistics.total_incidents;
const critical = statistics.critical;
const high = statistics.high;
const medium = statistics.medium;
const low = statistics.low;

  // Filter incidents by ID, type, or priority
  const filteredIncidents = incidents.filter((incident) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      String(incident.incident_id || "").toLowerCase().includes(query) ||
      String(incident.incident_type || "").toLowerCase().includes(query);
    const matchesPriority =
  priorityFilter === "ALL" || incident.priority === priorityFilter;

const matchesStatus =
  statusFilter === "ALL" ||
  incident.status === statusFilter;

return matchesSearch && matchesPriority && matchesStatus;
  });

  // Generate individual incident PDF report
  const generatePDF = async (incident) => {
    try {
      const response = await fetch(
        `${API_URL}/incidents/${encodeURIComponent(incident.incident_id)}/analysis`
      );

      if (!response.ok) {
        throw new Error("Unable to retrieve incident analysis");
      }

      const data = await response.json();
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text("CYBERRANK AI", 20, 20);

      doc.setFontSize(11);
      doc.text("Cybersecurity Incident Analysis Report", 20, 30);

      doc.line(20, 35, 190, 35);

      doc.setFontSize(14);
      doc.text("Incident Information", 20, 48);

      doc.setFontSize(11);
      doc.text(`Incident ID: ${incident.incident_id}`, 20, 60);
      doc.text(`Incident Type: ${incident.incident_type}`, 20, 68);
      doc.text(`Priority: ${data.priority}`, 20, 76);

      doc.text("Risk Assessment", 20, 92);

      doc.text(`Rule Score: ${data.rule_score}/100`, 20, 104);
      doc.text(`ML Prediction: ${data.ml_prediction}%`, 20, 112);
      doc.text(`Final Hybrid Score: ${data.final_score}/100`, 20, 120);

      doc.line(20, 128, 190, 128);

      doc.setFontSize(14);
      doc.text("Risk Factor Contributions", 20, 140);

      doc.setFontSize(10);

      let y = 150;

      Object.entries(data.factor_details || {}).forEach(([key, factor]) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.text(
          `${factor.factor_name || key}: ${factor.contribution} points`,
          20,
          y
        );

        y += 8;
      });

      y += 8;

      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.text("Security Recommendations", 20, y);

      y += 10;
      doc.setFontSize(10);

      (Array.isArray(data.recommendations) ? data.recommendations : [])
        .forEach((recommendation) => {
          const lines = doc.splitTextToSize(`• ${recommendation}`, 165);

          if (y + lines.length * 6 > 275) {
            doc.addPage();
            y = 20;
          }

          doc.text(lines, 20, y);
          y += lines.length * 6 + 3;
        });

      doc.addPage();
      doc.setFontSize(14);
      doc.text("Model Disclaimer", 20, 25);

      doc.setFontSize(10);

      const disclaimer = data.model_note ||
        "This machine learning model uses synthetic training data. Predictions are not validated real-world attack probabilities.";

      doc.text(doc.splitTextToSize(disclaimer, 165), 20, 38);

      doc.save(`CyberRank_${incident.incident_id}_Report.pdf`);

    } catch (error) {
      alert(error.message || "Unable to generate PDF report.");
    }
  };

  // EXPORT INCIDENTS AS CSV
  const exportCSV = () => {
    if (filteredIncidents.length === 0) {
      alert("No incidents available to export.");
      return;
    }

    const headers = [
      "Incident ID",
      "Incident Type",
      "Rule Score",
      "ML Prediction",
      "Final Score",
      "Priority",
    ];

    const rows = filteredIncidents.map((incident) => [
      incident.incident_id,
      incident.incident_type,
      incident.rule_score,
      incident.ml_prediction,
      incident.final_score,
      incident.priority,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "CyberRank_AI_Incident_Report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // Chart data
  const chartData = [
    {
      name: "Critical",
      value: critical,
      color: "#ef4444",
    },
    {
      name: "High",
      value: high,
      color: "#f97316",
    },
    {
      name: "Medium",
      value: medium,
      color: "#eab308",
    },
    {
      name: "Low",
      value: low,
      color: "#22c55e",
    },
  ];

  // Incident status chart data
const statusChartData = [
  {
    name: "Open",
    count: statistics.open,
    fill: "#f97316",
  },
  {
    name: "Investigating",
    count: statistics.investigating,
    fill: "#06d9f5",
  },
  {
    name: "Resolved",
    count: statistics.resolved,
    fill: "#22c55e",
  },
  {
    name: "Closed",
    count: statistics.closed,
    fill: "#ef4444",
  },
];

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-100">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}

        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-[#0c1424] p-6 lg:flex lg:flex-col">

          {/* Logo */}

          <div className="mb-12 flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-3">
              <ShieldCheck
                className="text-cyan-400"
                size={30}
              />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                CyberRank
                <span className="text-cyan-400"> AI</span>
              </h1>

              <p className="text-xs text-slate-500">
                Threat Intelligence Platform
              </p>
            </div>
          </div>

          {/* Navigation */}

          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">
            <SidebarItem
              icon={<LayoutDashboard size={19} />}
              label="Dashboard"
              active={activePage === "dashboard" && !showForm && !selectedIncident}
              onClick={() => {
                setActivePage("dashboard");
                setShowForm(false);
                closeAnalysis();
                setSuccess("");
                setError("");
              }}
            />

            <SidebarItem
              icon={<FileWarning size={19} />}
              label="Reports"
              active={activePage === "reports"}
              onClick={() => {
                setActivePage("reports");
                setShowForm(false);
                closeAnalysis();
                setSuccess("");
                setError("");
              }}
            />

            <SidebarItem
              icon={<BrainCircuit size={19} />}
              label="AI Analysis"
              active={!!selectedIncident}
              onClick={() => {
                setActivePage("dashboard");
                setShowForm(false);
                setError("");

                if (incidents.length > 0) {
                  fetchIncidentAnalysis(
                    incidents[0].incident_id
                  );
                }
              }}
            />


          </nav>

          {/* AI Status */}

          <div className="mt-auto rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Zap
                size={17}
                className="text-cyan-400"
              />

              <span className="text-sm font-semibold">
                Hybrid AI Engine
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${error ? "bg-red-400" : "bg-green-400"
                  }`}
              />

              <span
                className={`text-xs ${error ? "text-red-400" : "text-green-400"
                  }`}
              >
                {error
                  ? "Check API connection"
                  : "API available"}
              </span>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Rule-based scoring combined with machine learning.
            </p>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-5">
            <p className="text-xs text-slate-500">
              CYBERRANK AI · MVP v1.0
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT */}

        <main className="min-w-0 flex-1">

          {/* TOP NAVBAR */}

          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-[#0c1424] px-5 py-5 md:px-8">
            <div>
              <h2 className="text-xl font-bold">
                Security Operations Center
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Monitor, analyze and prioritize security incidents.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={fetchIncidents}
                className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-cyan-500 hover:text-cyan-400"
                title="Refresh incidents"
              >
                <RefreshCw size={18} />
              </button>

              <Bell
                size={20}
                className="text-slate-400"
              />

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 font-bold text-cyan-400">
                CR
              </div>
            </div>
          </header>

          <div className="space-y-8 p-5 md:p-8">

            {/* PAGE TITLE */}

            <section className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-sm text-cyan-400">
                  WORKSPACE /{" "}
                  {showForm
                    ? "INCIDENTS"
                    : activePage === "reports"
                      ? "REPORTS"
                      : selectedIncident
                        ? "AI ANALYSIS"
                        : "DASHBOARD"}
                </p>

                <h1 className="text-3xl font-bold">
                  {showForm
                    ? "Incident Management"
                    : activePage === "reports"
                      ? "Security Reports"
                      : selectedIncident
                        ? "AI Incident Analysis"
                        : "Security Overview"}
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  {showForm
                    ? "Submit and analyze cybersecurity incidents."
                    : activePage === "reports"
                      ? "Review incident history and security analytics."
                      : selectedIncident
                        ? "Detailed hybrid AI risk assessment."
                        : "Your cybersecurity incident intelligence at a glance."}
                </p>
              </div>

              {!showForm && activePage !== "reports" && (
                <button
                  onClick={() => {
                    setShowForm(true);
                    closeAnalysis();
                    setSuccess("");
                    setError("");
                  }}
                  className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  <Plus size={18} />
                  New Incident
                </button>
              )}
            </section>

            {/* SUCCESS MESSAGE */}

            {success && (
              <div className="rounded-xl border border-green-900 bg-green-950/30 p-4 text-sm text-green-400">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} />
                  {success}
                </div>
              </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
              <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
                Error: {error}

                <p className="mt-1 text-xs text-red-400">
                  Check that FastAPI is running on port 8001.
                </p>
              </div>
            )}

            {/* INCIDENT SUBMISSION FORM */}

            {showForm && (
              <section className="rounded-2xl border border-cyan-900/50 bg-[#101a2d] p-6">

                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-cyan-400">
                      Submit Security Incident
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Enter incident details for AI-powered prioritization.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowForm(false)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                    title="Close form"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="grid gap-5 md:grid-cols-2"
                >
                  <FormInput
                    label="Incident ID"
                    name="incident_id"
                    value={formData.incident_id}
                    onChange={handleInputChange}
                    placeholder="Example: INC-102"
                  />

                  {/* Incident Type */}

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Incident Type
                    </label>

                    <select
                      name="incident_type"
                      value={formData.incident_type}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-700 bg-[#0c1424] p-3 text-white outline-none focus:border-cyan-500"
                    >
                      <option>Malware Detection</option>
                      <option>Data Exfiltration</option>
                      <option>Port Scan</option>
                      <option>Suspicious Email</option>
                      <option>Brute Force</option>
                      <option>Failed Login</option>
                    </select>
                  </div>

                  <FormInput
                    label="Severity (1–5)"
                    name="severity"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.severity}
                    onChange={handleInputChange}
                  />

                  <FormInput
                    label="Data Sensitivity (1–5)"
                    name="data_sensitivity"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.data_sensitivity}
                    onChange={handleInputChange}
                  />

                  <FormInput
                    label="Asset Importance (1–5)"
                    name="asset_importance"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.asset_importance}
                    onChange={handleInputChange}
                  />

                  <FormInput
                    label="Attack Confidence (1–5)"
                    name="attack_confidence"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.attack_confidence}
                    onChange={handleInputChange}
                  />

                  <FormInput
                    label="Affected Users"
                    name="affected_users"
                    type="number"
                    min="0"
                    value={formData.affected_users}
                    onChange={handleInputChange}
                  />

                  <FormInput
                    label="Business Impact (1–5)"
                    name="business_impact"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.business_impact}
                    onChange={handleInputChange}
                  />

                  <div className="flex flex-col gap-3 pt-3 md:col-span-2 sm:flex-row">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <BrainCircuit size={18} />

                      {submitting
                        ? "Analyzing Incident..."
                        : "Submit & Analyze Incident"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...INITIAL_FORM });
                        setSuccess("");
                      }}
                      className="rounded-lg border border-slate-700 px-5 py-3 text-slate-300 transition hover:bg-slate-800"
                    >
                      Reset Form
                    </button>
                  </div>
                </form>

                <div className="mt-6 rounded-xl border border-slate-800 bg-[#0c1424] p-4">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <BrainCircuit size={18} />

                    <span className="text-sm font-semibold">
                      AI Processing Pipeline
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-6 text-slate-400">
                    Incident Input → Rule-Based Scoring → ML Prediction →
                    Hybrid Score → Priority Classification
                  </p>
                </div>
              </section>
            )}

            {/* REPORTS PAGE */}

            {!showForm && activePage === "reports" && (
              <section className="space-y-6">

                <div>
                  <h2 className="text-2xl font-bold text-cyan-400">
                    Security Reports
                  </h2>
                  <p className="text-slate-400 mt-2">
                    Cybersecurity incident overview and history.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                  <StatCard
                    title="Total Incidents"
                    value={total}
                    icon={<Activity size={22} />}
                    color="cyan"
                    description="All analyzed incidents"
                  />

                  <StatCard
                    title="Critical Threats"
                    value={critical}
                    icon={<AlertTriangle size={22} />}
                    color="red"
                    description="Immediate attention"
                  />

                  <StatCard
                    title="High Priority"
                    value={high}
                    icon={<ShieldAlert size={22} />}
                    color="orange"
                    description="Requires investigation"
                  />

                  <StatCard
                    title="Medium Priority"
                    value={medium}
                    icon={<Activity size={22} />}
                    color="cyan"
                    description="Needs monitoring"
                  />

                                </div>

                {/* INCIDENT STATUS ANALYTICS */}

                <div>
                  <h3 className="mb-4 text-xl font-bold text-cyan-400">
                    Incident Status Overview
                  </h3>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                    <StatCard
                      title="Open Incidents"
                      value={statistics.open}
                      icon={<AlertTriangle size={22} />}
                      color="orange"
                      description="Awaiting investigation"
                    />

                    <StatCard
                      title="Investigating"
                      value={statistics.investigating}
                      icon={<Activity size={22} />}
                      color="cyan"
                      description="Currently being investigated"
                    />

                    <StatCard
                      title="Resolved"
                      value={statistics.resolved}
                      icon={<CheckCircle size={22} />}
                      color="green"
                      description="Successfully resolved"
                    />

                    <StatCard
                      title="Closed"
                      value={statistics.closed}
                      icon={<ShieldCheck size={22} />}
                      color="red"
                      description="Investigation closed"
                    />

                  </div>
                </div>

                {/* INCIDENT HISTORY */}

                {/* INCIDENT STATUS DISTRIBUTION CHART */}

<div className="rounded-2xl border border-slate-800 bg-[#101a2d] p-6">

  <h3 className="mb-2 text-lg font-semibold text-cyan-400">
    Incident Status Distribution
  </h3>

  <p className="mb-5 text-sm text-slate-400">
    Overview of incident investigation progress.
  </p>

  <div className="h-72 w-full">

    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={statusChartData}>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#334155"
        />

        <XAxis
          dataKey="name"
          stroke="#94a3b8"
        />

        <YAxis
          allowDecimals={false}
          stroke="#94a3b8"
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "#0c1424",
            border: "1px solid #334155",
            borderRadius: "10px",
            color: "#fff",
          }}
        />

        



        <Bar
          dataKey="count"
          name="Incidents"
          radius={[6, 6, 0, 0]}
        >
          {statusChartData.map((entry) => (
            <Cell
              key={entry.name}
              fill={entry.fill}
            />
          ))}
        </Bar>

      </BarChart>
    </ResponsiveContainer>

  </div>

</div>

                <div className="rounded-2xl border border-slate-800 bg-[#101a2d] p-6">

                  <h3 className="text-lg font-semibold mb-5">
                    Incident History
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">

                      <thead className="text-slate-500 text-xs uppercase">
                        <tr>
                          <th className="p-3">Incident ID</th>
                          <th className="p-3">Incident Type</th>
                          <th className="p-3">Rule Score</th>
                          <th className="p-3">Final Score</th>
                          <th className="p-3">Priority</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-800">
                        {incidents.map((incident) => (
                          <tr key={incident.incident_id}>
                            <td className="p-3 text-cyan-400">
                              {incident.incident_id}
                            </td>
                            <td className="p-3">
                              {incident.incident_type}
                            </td>
                            <td className="p-3">
                              {incident.rule_score}
                            </td>
                            <td className="p-3 font-bold">
                              {incident.final_score}
                            </td>
                            <td className="p-3">
                              <PriorityBadge priority={incident.priority} />
                            </td>
                          </tr>
                        ))}
                      </tbody>

                    </table>
                  </div>

                  <button
                    onClick={exportCSV}
                    className="mt-6 rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950"
                  >
                    Download Reports CSV
                  </button>

                </div>

              </section>
            )}

            {/* DASHBOARD CONTENT */}

            {!showForm && activePage !== "reports" && (
              <>
                {/* STATISTICS CARDS */}

                <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="Total Incidents"
                    value={total}
                    icon={<Activity size={22} />}
                    color="cyan"
                    description="All analyzed incidents"
                  />

                  <StatCard
                    title="Critical Threats"
                    value={critical}
                    icon={<AlertTriangle size={22} />}
                    color="red"
                    description="Immediate attention"
                  />

                  <StatCard
                    title="High Priority"
                    value={high}
                    icon={<ShieldAlert size={22} />}
                    color="orange"
                    description="Requires investigation"
                  />

                  <StatCard
                    title="Low Priority"
                    value={low}
                    icon={<CheckCircle size={22} />}
                    color="green"
                    description="Lower risk incidents"
                  />
                </section>

                {/* ANALYTICS */}

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                  {/* THREAT DISTRIBUTION */}

                  <div className="rounded-2xl border border-slate-800 bg-[#101a2d] p-6 xl:col-span-1">
                    <div className="mb-5">
                      <h3 className="font-semibold">
                        Threat Distribution
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Incidents by priority level
                      </p>
                    </div>

                    {total > 0 ? (
                      <div className="relative h-64">
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >
                          <PieChart>
                            <Pie
                              data={chartData.filter(
                                (item) => item.value > 0
                              )}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={95}
                              paddingAngle={4}
                            >
                              {chartData
                                .filter((item) => item.value > 0)
                                .map((entry) => (
                                  <Cell
                                    key={entry.name}
                                    fill={entry.color}
                                  />
                                ))}
                            </Pie>

                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0c1424",
                                border: "1px solid #334155",
                                borderRadius: "10px",
                                color: "#fff",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>

                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold">
                            {total}
                          </span>

                          <span className="text-xs text-slate-500">
                            Incidents
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                        {loading
                          ? "Loading chart..."
                          : "No incidents available"}
                      </div>
                    )}

                    {/* Chart Legend */}

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {chartData.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-2"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: item.color,
                            }}
                          />

                          <span className="text-xs text-slate-400">
                            {item.name}: {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* HYBRID AI PANEL */}

                  <div className="rounded-2xl border border-slate-800 bg-[#101a2d] p-6 xl:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          Hybrid AI Intelligence
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Intelligent incident prioritization engine
                        </p>
                      </div>

                      <BrainCircuit
                        size={30}
                        className="text-cyan-400"
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Rule Engine */}

                      <div className="rounded-xl border border-slate-700 bg-[#0c1424] p-5">
                        <div className="mb-3 flex items-center gap-2 text-cyan-400">
                          <Lock size={18} />

                          <span className="text-sm font-semibold">
                            Rule-Based Engine
                          </span>
                        </div>

                        <h4 className="text-2xl font-bold">
                          70%
                        </h4>

                        <p className="mt-2 text-xs text-slate-500">
                          Weighted risk evaluation using six incident factors.
                        </p>
                      </div>

                      {/* ML Engine */}

                      <div className="rounded-xl border border-slate-700 bg-[#0c1424] p-5">
                        <div className="mb-3 flex items-center gap-2 text-purple-400">
                          <BrainCircuit size={18} />

                          <span className="text-sm font-semibold">
                            Machine Learning
                          </span>
                        </div>

                        <h4 className="text-2xl font-bold">
                          30%
                        </h4>

                        <p className="mt-2 text-xs text-slate-500">
                          Random Forest model trained using synthetic data.
                        </p>
                      </div>
                    </div>

                    {/* Formula */}

                    <div className="mt-5 rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-5">
                      <p className="text-xs text-slate-400">
                        HYBRID SCORING FORMULA
                      </p>

                      <p className="mt-2 text-lg font-bold text-cyan-400">
                        Final Score = (0.70 × Rule Score) + (0.30 × ML Score)
                      </p>
                    </div>
                  </div>
                </section>

                {/* INCIDENT TABLE */}

                <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#101a2d]">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 p-6">
                    <div>
                      <h3 className="font-semibold">
                        Ranked Security Incidents
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Incidents ranked by final hybrid risk score
                      </p>
                    </div>

                    <div className="text-xs text-slate-400">
                      Showing <span className="font-semibold text-cyan-400">{filteredIncidents.length}</span> of {total} records
                    </div>

                    <button
                      type="button"
                      onClick={exportCSV}
                      className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      <FileWarning size={17} />
                      Download CSV
                    </button>

                  </div>

                  {/* SEARCH AND PRIORITY FILTERS */}
                  <div className="grid gap-3 border-b border-slate-800 p-4 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
                    <div className="relative">
                      <Search
                        size={17}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search by incident ID or type..."
                        aria-label="Search incidents by ID or type"
                        className="w-full rounded-lg border border-slate-700 bg-[#0c1424] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
                      />
                    </div>

                    <select
                      value={priorityFilter}
                      onChange={(event) => setPriorityFilter(event.target.value)}
                      aria-label="Filter incidents by priority"
                      className="w-full rounded-lg border border-slate-700 bg-[#0c1424] px-3 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
                    >
                      <option value="ALL">All priorities</option>
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      aria-label="Filter incidents by status"
                      className="w-full rounded-lg border border-slate-700 bg-[#0c1424] px-3 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
                    >
                      <option value="ALL">All statuses</option>
                      <option value="OPEN">Open</option>
                      <option value="INVESTIGATING">Investigating</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setPriorityFilter("ALL");
                        setStatusFilter("ALL");
                      }}
                      className="rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
                    >
                      Clear filters
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#0c1424] text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-6 py-4">
                            Incident ID
                          </th>

                          <th className="px-6 py-4">
                            Incident Type
                          </th>

                          <th className="px-6 py-4">
                            Rule Score
                          </th>

                          <th className="px-6 py-4">
                            ML Prediction
                          </th>

                          <th className="px-6 py-4">
                            Final Score
                          </th>

                          <th className="px-6 py-4">
                            Priority
                          </th>

                          <th className="px-6 py-4">
                            Analysis
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-800">
                        {filteredIncidents.map((incident) => (
                          <tr
                            key={incident.incident_id}
                            className={`transition hover:bg-slate-800/40 ${selectedIncident === incident.incident_id
                              ? "bg-cyan-500/5"
                              : ""
                              }`}
                          >
                            <td className="px-6 py-4 font-medium text-cyan-400">
                              {incident.incident_id}
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-300">
                              {incident.incident_type}
                            </td>

                            <td className="px-6 py-4 text-sm">
                              {incident.rule_score ?? "—"}
                            </td>

                            <td className="px-6 py-4 text-sm">
                              {incident.ml_prediction != null
                                ? `${incident.ml_prediction}%`
                                : "—"}
                            </td>

                            <td className="px-6 py-4 font-bold">
                              {incident.final_score ??
                                incident.risk_score ??
                                "—"}
                            </td>

                            <td className="px-6 py-4">
                              <PriorityBadge
                                priority={incident.priority}
                              />
                            </td>

                            <td className="px-6 py-4">
                              <button
                                onClick={() =>
                                  fetchIncidentAnalysis(
                                    incident.incident_id
                                  )
                                }
                                className="rounded-lg border border-cyan-800 px-3 py-2 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-500/10"
                              >
                                <span className="flex items-center gap-2">
                                  <BrainCircuit size={14} />
                                  Analyze
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => generatePDF(incident)}
                                className="ml-2 rounded-lg border border-purple-800 px-3 py-2 text-xs font-semibold text-purple-400 transition hover:bg-purple-500/10"
                              >
                                <span className="flex items-center gap-2">
                                  <FileWarning size={14} />
                                  PDF
                                </span>
                              </button>

                              <div className="mt-3 flex flex-wrap gap-2">

  <button
    onClick={() => handleAssignIncident(incident.incident_id)}
    className="rounded border border-blue-700 px-2 py-1 text-xs text-blue-400"
  >
    Assign
  </button>

  <button
    onClick={() => handleUpdateStatus(incident.incident_id)}
    className="rounded border border-yellow-700 px-2 py-1 text-xs text-yellow-400"
  >
    Update Status
  </button>

  <button
    onClick={() => handleSaveNotes(incident.incident_id)}
    className="rounded border border-green-700 px-2 py-1 text-xs text-green-400"
  >
    Add Notes
  </button>

</div>

                            </td>
                          </tr>
                        ))}

                        {!loading && filteredIncidents.length === 0 && (
                          <tr>
                            <td
                              colSpan="7"
                              className="px-6 py-12 text-center text-sm text-slate-500"
                            >
                              {incidents.length === 0
                                ? "No incidents found. Submit an incident to get started."
                                : "No incidents match your search or priority filter."}
                            </td>
                          </tr>
                        )}

                        {loading && (
                          <tr>
                            <td
                              colSpan="7"
                              className="px-6 py-12 text-center text-sm text-slate-400"
                            >
                              Loading security incidents...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4">
                    <p className="text-xs text-slate-500">
                      Live data from CyberRank AI API
                    </p>

                    <button
                      onClick={fetchIncidents}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      Refresh Data →
                    </button>
                  </div>
                </section>

                {/* AI INCIDENT ANALYSIS */}

                {selectedIncident && (
                  <section className="rounded-2xl border border-cyan-900/50 bg-[#101a2d] p-6">

                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold tracking-widest text-cyan-400">
                          HYBRID AI INTELLIGENCE
                        </p>

                        <h2 className="mt-2 text-xl font-bold">
                          Incident Analysis: {selectedIncident}
                        </h2>
                      </div>

                      <button
                        onClick={closeAnalysis}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
                        title="Close analysis"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Loading */}

                    {analysisLoading && (
                      <div className="py-12 text-center text-cyan-400">
                        <RefreshCw
                          className="mx-auto mb-3 animate-spin"
                          size={28}
                        />

                        Analyzing security incident...
                      </div>
                    )}

                    {/* Analysis result */}

                    {analysis && (
                      <div className="space-y-6">

                        {/* SCORE CARDS */}

                        <div className="grid gap-4 sm:grid-cols-3">
                          <AnalysisCard
                            title="Rule Score"
                            value={`${analysis.rule_score}/100`}
                            color="cyan"
                          />

                          <AnalysisCard
                            title="ML Prediction"
                            value={`${analysis.ml_prediction}%`}
                            color="purple"
                          />

                          <AnalysisCard
                            title="Final Hybrid Score"
                            value={`${analysis.final_score}/100`}
                            color="green"
                          />
                        </div>

                        {/* PRIORITY */}

                        <div className="rounded-xl border border-slate-700 bg-[#0c1424] p-5">
                          <p className="mb-3 text-sm text-slate-400">
                            Final Incident Priority
                          </p>

                          <PriorityBadge
                            priority={analysis.priority}
                          />

                          <div className="mt-4 text-sm leading-6 text-slate-300">
                            {typeof analysis.explanation === "string"
                              ? analysis.explanation
                              : typeof analysis.explanation?.summary === "string"
                                ? analysis.explanation.summary
                                : "Risk analysis completed. Review the factor contributions and recommendations below."}
                          </div>

                          {typeof analysis.explanation === "object" &&
                            Array.isArray(analysis.explanation?.top_risk_factors) && (
                              <div className="mt-6">
                                <div className="mb-4 flex items-center justify-between">
                                  <p className="text-sm font-bold tracking-wider text-cyan-400">
                                    TOP RISK FACTORS
                                  </p>
                                  <span className="text-xs text-slate-500">
                                    Highest contributing factors
                                  </span>
                                </div>

                                <div className="grid gap-3 md:grid-cols-3">
                                  {analysis.explanation.top_risk_factors.map(
                                    (factor, index) => {
                                      const name =
                                        typeof factor === "string"
                                          ? factor
                                          : factor.factor ||
                                          factor.factor_name ||
                                          "Risk Factor";
                                      const contribution =
                                        typeof factor === "object"
                                          ? factor.contribution
                                          : null;
                                      const impact =
                                        typeof factor === "object"
                                          ? factor.impact_level || "High"
                                          : "High";

                                      return (
                                        <div
                                          key={index}
                                          className="rounded-xl border border-slate-700 bg-[#111d30] p-4 transition hover:border-cyan-500/50"
                                        >
                                          <div className="mb-3 flex items-center justify-between">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                                              <AlertTriangle size={17} />
                                            </span>
                                            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400">
                                              {impact}
                                            </span>
                                          </div>

                                          <h4 className="font-semibold text-slate-100">
                                            {name}
                                          </h4>

                                          {typeof factor === "object" && (
                                            <>
                                              <p className="mt-2 text-xs text-slate-400">
                                                Input: {factor.input_value ?? "—"}
                                                {" · "}
                                                Normalized: {factor.normalized_score ?? "—"}/100
                                              </p>
                                              <div className="mt-3 flex items-center justify-between">
                                                <span className="text-xs text-slate-500">
                                                  Risk contribution
                                                </span>
                                                <span className="text-sm font-bold text-cyan-400">
                                                  {contribution ?? 0} points
                                                </span>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )}
                        </div>

                        {/* FACTOR CONTRIBUTIONS */}

                        <div className="rounded-xl border border-slate-700 bg-[#0c1424] p-5">
                          <h3 className="mb-5 font-semibold text-cyan-400">
                            Risk Factor Contributions
                          </h3>

                          <div className="space-y-5">
                            {Object.entries(
                              analysis.factor_details || {}
                            ).map(([key, factor]) => {
                              const weight = Number(factor.weight) || 0;
                              const contribution =
                                Number(factor.contribution) || 0;

                              const percentage =
                                weight > 0
                                  ? Math.min(
                                    (contribution / (weight * 100)) * 100,
                                    100
                                  )
                                  : 0;

                              return (
                                <div key={key}>
                                  <div className="mb-2 flex justify-between text-sm">
                                    <span className="text-slate-300">
                                      {factor.factor_name || key}
                                    </span>

                                    <span className="font-semibold text-cyan-400">
                                      {contribution} points
                                    </span>
                                  </div>

                                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                    <div
                                      className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                                      style={{
                                        width: `${percentage}%`,
                                      }}
                                    />
                                  </div>

                                  <p className="mt-1 text-xs text-slate-500">
                                    Input: {factor.input_value} ·
                                    Normalized: {factor.normalized_score}/100 ·
                                    Weight: {(weight * 100).toFixed(0)}%
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* RECOMMENDATIONS */}

                        <div className="rounded-xl border border-slate-700 bg-[#0c1424] p-5">
                          <h3 className="mb-4 flex items-center gap-2 font-semibold text-green-400">
                            <ShieldCheck size={19} />
                            Security Recommendations
                          </h3>

                          <div className="space-y-3">
                            {(Array.isArray(analysis.recommendations)
                              ? analysis.recommendations
                              : []
                            ).map((recommendation, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 text-sm text-slate-300"
                              >
                                <CheckCircle
                                  size={17}
                                  className="mt-0.5 shrink-0 text-green-400"
                                />

                                {recommendation}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* MODEL DISCLAIMER */}

                        <div className="rounded-xl border border-yellow-900/50 bg-yellow-950/20 p-4">
                          <p className="text-xs leading-6 text-yellow-300">
                            Model Disclaimer:{" "}
                            {analysis.model_note ||
                              "The machine learning model uses synthetic training data. Its predictions are not validated real-world attack probabilities."}
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </>
            )}

            {/* FOOTER */}

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-600">
              <p>
                CyberRank AI © 2026
              </p>

              <p className="flex items-center gap-2">
                <Server size={14} />
                FastAPI + React + Random Forest
              </p>

              <p className="flex items-center gap-2">
                <Globe size={14} />
                Intelligent Cyber Incident Prioritization
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}


// SIDEBAR ITEM COMPONENT

function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${active
        ? "border border-cyan-900/50 bg-cyan-500/10 text-cyan-400"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}


// FORM INPUT COMPONENT

function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  min,
  max,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        required
        className="w-full rounded-lg border border-slate-700 bg-[#0c1424] p-3 text-white outline-none transition focus:border-cyan-500"
      />
    </div>
  );
}


// STATISTICS CARD COMPONENT

function StatCard({
  title,
  value,
  icon,
  color,
  description,
}) {
  const themes = {
    cyan: {
      accent: "#06d9f5",
      glow: "rgba(6,217,245,0.12)",
      border: "rgba(6,217,245,0.25)",
    },
    red: {
      accent: "#fb5252",
      glow: "rgba(251,82,82,0.12)",
      border: "rgba(251,82,82,0.25)",
    },
    orange: {
      accent: "#fb923c",
      glow: "rgba(251,146,60,0.12)",
      border: "rgba(251,146,60,0.25)",
    },
    green: {
      accent: "#22c55e",
      glow: "rgba(34,197,94,0.12)",
      border: "rgba(34,197,94,0.25)",
    },
  };

  const theme = themes[color] || themes.cyan;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-[#101a2d] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ borderColor: theme.border }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all duration-300 group-hover:scale-150"
        style={{ backgroundColor: theme.glow }}
      />

      <div className="relative z-10">

        <div className="flex items-center justify-between">

          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>

          <div
            className="rounded-xl border p-3"
            style={{
              color: theme.accent,
              borderColor: theme.border,
              backgroundColor: theme.glow,
            }}
          >
            {icon}
          </div>

        </div>

        <div className="mt-6 flex items-end justify-between">

          <h3 className="text-4xl font-bold tracking-tight text-white">
            {value}
          </h3>

          <span
            className="mb-1 h-1.5 w-12 rounded-full"
            style={{ backgroundColor: theme.accent }}
          />

        </div>

        <p className="mt-3 text-xs text-slate-500">
          {description}
        </p>

      </div>
    </div>
  );
}
// AI ANALYSIS SCORE CARD

function AnalysisCard({ title, value, color }) {
  const colors = {
    cyan: "text-cyan-400 border-cyan-900/50",
    purple: "text-purple-400 border-purple-900/50",
    green: "text-green-400 border-green-900/50",
  };

  return (
    <div className={`rounded-xl border bg-[#0c1424] p-5 ${colors[color]}`}>
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h3 className="mt-3 text-2xl font-bold">
        {value}
      </h3>
    </div>
  );
}


// PRIORITY BADGE COMPONENT

function PriorityBadge({ priority }) {
  const color =
    PRIORITY_COLORS[priority] || "#94a3b8";

  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-bold"
      style={{
        color: color,
        backgroundColor: `${color}20`,
      }}
    >
      {priority || "UNKNOWN"}
    </span>
  );
}


export default App;
