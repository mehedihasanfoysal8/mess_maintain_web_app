"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Info, Users, UserPlus, Loader2, Shield, ShieldOff, Crown, Check, X } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("members");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Mess info form state
  const [messName, setMessName] = useState("");
  const [activeMonth, setActiveMonth] = useState("");
  const [password, setPassword] = useState("");
  const [savingMess, setSavingMess] = useState(false);

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchData = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setMessName(json.mess.name);
        setActiveMonth(json.mess.activeMonth);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateMess = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMess(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: messName, activeMonth, password: password || undefined }),
      });
      if (!res.ok) throw new Error("Failed to update");
      showMessage("Mess settings updated successfully!");
      setPassword("");
    } catch {
      showMessage("Error updating settings.", "error");
    } finally {
      setSavingMess(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, action: "promote" | "demote", memberName: string) => {
    setActionLoading(targetUserId + action);
    try {
      const res = await fetch("/api/settings/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change role");
      showMessage(
        action === "promote"
          ? `${memberName} has been promoted to Manager!`
          : `${memberName} has been demoted to Member.`
      );
      await fetchData();
    } catch (err: any) {
      showMessage(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequest = async (requestId: string, action: "approve" | "reject", name: string) => {
    setActionLoading(requestId + action);
    try {
      const res = await fetch("/api/settings/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showMessage(
        action === "approve"
          ? `${name}'s request approved! They are now a member.`
          : `${name}'s request was rejected.`
      );
      await fetchData();
    } catch (err: any) {
      showMessage(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
      </div>
    );
  }

  const { isManager, members, joinRequests, mess } = data;

  const tabs = [
    { id: "members", label: "Members & Roles", icon: <Users size={18} />, show: true },
    { id: "requests", label: "Joining Requests", icon: <UserPlus size={18} />, show: isManager, badge: joinRequests?.length },
    { id: "mess", label: "Mess Settings", icon: <SettingsIcon size={18} />, show: isManager },
  ].filter((t) => t.show);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <SettingsIcon className="text-indigo-600 dark:text-indigo-400" /> Mess Settings
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage members, roles, and joining requests
        </p>
      </div>

      {/* Toast Message */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium animate-in slide-in-from-top-2 duration-200 ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800"
          }`}
        >
          {message.type === "success" ? <Check size={18} /> : <X size={18} />}
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-sm font-medium relative ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50"
                }`}
              >
                {tab.icon} {tab.label}
                {tab.badge > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 md:p-8 min-h-[500px]">

            {/* ── Members & Roles Tab ── */}
            {activeTab === "members" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    All Members ({members.length})
                  </h3>
                  {isManager && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                      You can promote/demote members
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {members.map((m: any) => (
                    <div
                      key={m._id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                            m.isManager
                              ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-800 dark:text-white">{m.name}</p>
                            {m.isManager && (
                              <span className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                <Crown size={11} /> Manager
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{m.email}</p>
                        </div>
                      </div>

                      {/* Role action buttons — only for manager, not for themselves */}
                      {isManager && !m.isCurrentUser && (
                        <div className="flex gap-2 flex-shrink-0">
                          {!m.isManager ? (
                            <button
                              onClick={() => handleRoleChange(m._id, "promote", m.name)}
                              disabled={actionLoading === m._id + "promote"}
                              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-60"
                            >
                              {actionLoading === m._id + "promote" ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Shield size={14} />
                              )}
                              Promote to Manager
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(m._id, "demote", m.name)}
                              disabled={actionLoading === m._id + "demote"}
                              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-700 dark:hover:text-rose-400 transition-colors disabled:opacity-60"
                            >
                              {actionLoading === m._id + "demote" ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <ShieldOff size={14} />
                              )}
                              Demote
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Joining Requests Tab ── */}
            {activeTab === "requests" && isManager && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
                  Pending Join Requests
                  {joinRequests.length > 0 && (
                    <span className="ml-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-sm font-bold px-2.5 py-0.5 rounded-full">
                      {joinRequests.length}
                    </span>
                  )}
                </h3>

                {joinRequests.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserPlus size={28} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No pending join requests.</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                      When someone requests to join, they'll appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {joinRequests.map((req: any) => (
                      <div
                        key={req._id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-amber-100 dark:border-amber-900/50 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center font-bold text-lg">
                            {req.userName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white">{req.userName}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{req.userEmail}</p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
                              ⏳ Waiting for approval
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleRequest(req._id, "approve", req.userName)}
                            disabled={actionLoading === req._id + "approve"}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors disabled:opacity-60"
                          >
                            {actionLoading === req._id + "approve" ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Check size={16} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleRequest(req._id, "reject", req.userName)}
                            disabled={actionLoading === req._id + "reject"}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-60"
                          >
                            {actionLoading === req._id + "reject" ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <X size={16} />
                            )}
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Mess Settings Tab ── */}
            {activeTab === "mess" && isManager && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Update Mess Information</h3>
                <form onSubmit={handleUpdateMess} className="space-y-5 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mess Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      value={messName}
                      onChange={(e) => setMessName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Active Month</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      value={activeMonth}
                      onChange={(e) => setActiveMonth(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      New Mess Password
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Leave blank to keep current password.</p>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingMess}
                    className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm flex items-center gap-2"
                  >
                    {savingMess ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                    Save Changes
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
