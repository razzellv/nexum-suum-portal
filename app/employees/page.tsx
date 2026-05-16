"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus } from "lucide-react";
import { useAuth } from "../../components/AuthContext";
import { canAccessTier } from "../lib/auth";
import { apiPost, apiGet } from "../lib/api";
import VirtuousBoard from "../../components/VirtuousBoard";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  status: "active" | "inactive" | "on-leave";
  hireDate: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  inactive: "#ef4444",
  "on-leave": "#f59e0b",
};

const ACCENT = "#00FFE1";

export default function EmployeesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"Roster" | "Scorecards">("Roster");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<Employee, "id">>({
    name: "", role: "", department: "", phone: "", email: "", status: "active", hireDate: "",
  });

  useEffect(() => { loadEmployees(); }, []);

  async function loadEmployees() {
    try {
      const remote = await apiGet<Employee[]>("/employees");
      if (Array.isArray(remote) && remote.length > 0) { setEmployees(remote); return; }
    } catch { /* ignore */ }
    setEmployees(JSON.parse(localStorage.getItem("fi_employees") || "[]"));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const emp: Employee = { id: crypto.randomUUID(), ...form };
    try { await apiPost("/employees", emp); } catch { /* offline */ }
    const updated = [...employees, emp];
    setEmployees(updated);
    localStorage.setItem("fi_employees", JSON.stringify(updated));
    setForm({ name: "", role: "", department: "", phone: "", email: "", status: "active", hireDate: "" });
    setShowForm(false);
    setSaving(false);
  }

  if (!user || !canAccessTier(user.tier, "facility")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-8">
        <div className="max-w-sm w-full text-center rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-lg font-semibold text-white mb-2">Facility Tier Required</h2>
          <p className="text-sm text-gray-500 mb-4">Employee management is available on the Facility Intelligence package.</p>
          <a href="https://portal.nexumsuum-facilityintelligence.com/pricing" target="_blank" rel="noreferrer"
            className="block w-full py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(0,255,225,0.12)", color: ACCENT, border: "1px solid rgba(0,255,225,0.25)" }}>
            Upgrade to FI Platform
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 pt-8 pb-12 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={18} style={{ color: ACCENT }} />
            <h1 className="text-xl font-bold text-white">Employee Management</h1>
          </div>
          <p className="text-sm text-gray-500">{employees.length} staff members · {user.company}</p>
        </div>
        {activeTab === "Roster" && (
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "rgba(0,255,225,0.08)", color: ACCENT, border: "1px solid rgba(0,255,225,0.18)" }}>
            <UserPlus size={14} /> Add Employee
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-5">
        {(["Roster", "Scorecards"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === t ? "rgba(0,255,225,0.08)" : "rgba(255,255,255,0.03)",
              color: activeTab === t ? ACCENT : "rgba(148,163,184,0.5)",
              border: activeTab === t ? "1px solid rgba(0,255,225,0.18)" : "1px solid rgba(255,255,255,0.06)",
            }}>{t}</button>
        ))}
      </div>

      {activeTab === "Roster" && (
        <div className="space-y-4">
          {showForm && (
            <form onSubmit={handleAdd} className="rounded-xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,255,225,0.12)" }}>
              <div className="text-sm font-medium text-white/70">Add Employee</div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "name", label: "Full Name", required: true, type: "text" },
                  { key: "role", label: "Role / Title", required: true, type: "text" },
                  { key: "department", label: "Department", type: "text" },
                  { key: "phone", label: "Phone", type: "tel" },
                  { key: "email", label: "Email", type: "email" },
                  { key: "hireDate", label: "Hire Date", type: "date" },
                ].map(({ key, label, required, type }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 block mb-1">{label}</label>
                    <input type={type} value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={required}
                      className="w-full rounded-lg px-3 py-2 text-sm text-white"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Employee["status"] })}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {["active", "inactive", "on-leave"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving}
                  className="px-5 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "rgba(0,255,225,0.12)", color: ACCENT, border: "1px solid rgba(0,255,225,0.25)" }}>
                  {saving ? "Adding..." : "Add Employee"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2 rounded-lg text-sm text-gray-500"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
              </div>
            </form>
          )}

          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="grid grid-cols-5 px-4 py-2 text-xs text-gray-600" style={{ background: "rgba(255,255,255,0.02)" }}>
              <span>Name</span><span>Role</span><span>Department</span><span>Hire Date</span><span>Status</span>
            </div>
            {employees.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-600">No employees yet — add your first team member.</div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {employees.map((emp) => (
                  <div key={emp.id} className="grid grid-cols-5 px-4 py-3 items-center">
                    <div>
                      <div className="text-sm text-white/80">{emp.name}</div>
                      <div className="text-xs text-gray-600">{emp.email}</div>
                    </div>
                    <div className="text-sm text-gray-400">{emp.role}</div>
                    <div className="text-sm text-gray-400">{emp.department || "—"}</div>
                    <div className="text-xs text-gray-500">{emp.hireDate || "—"}</div>
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        background: `${STATUS_COLORS[emp.status]}18`,
                        color: STATUS_COLORS[emp.status],
                      }}>{emp.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "Scorecards" && (
        <VirtuousBoard userName={user.name} />
      )}
    </div>
  );
}
