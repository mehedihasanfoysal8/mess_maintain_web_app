"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Phone, Shield, Loader2, MoreVertical, CheckCircle, XCircle } from "lucide-react";
import MonthDropdown from "@/components/MonthDropdown";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [actionType, setActionType] = useState<"remove" | "reactivate" | "role" | "permanent_delete" | null>(null);
  const [actionMonth, setActionMonth] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setIsManager(data.isCurrentUserManager || false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAction = async () => {
    if (!selectedMember || !actionType) return;
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        targetUserId: selectedMember._id,
        action: actionType === 'role' ? 'change_role' : actionType
      };

      if (actionType === 'remove' || actionType === 'reactivate') {
        payload.month = actionMonth;
      } else if (actionType === 'role') {
        payload.role = selectedMember.role === 'Guest' ? 'Permanent' : 'Guest';
      }

      const res = await fetch("/api/members/status", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchMembers();
        setActionType(null);
        setSelectedMember(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to perform action");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i); // From last year to 4 years ahead

  const openAction = (member: any, type: "remove" | "reactivate" | "role" | "permanent_delete") => {
    setSelectedMember(member);
    setActionType(type);
    
    const now = new Date();
    setActionMonth(`${monthsArr[now.getMonth()]} ${now.getFullYear()}`);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
      </div>
    );
  }

  const activeMembers = members.filter(m => m.isActive);
  const inactiveMembers = members.filter(m => !m.isActive);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="text-indigo-600 dark:text-indigo-400" /> Active Members
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Currently active members in the mess.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {activeMembers.map(member => (
            <MemberCard 
              key={member._id}
              member={member}
              isCurrentUserAdmin={isManager}
              onAction={openAction}
            />
          ))}
          {activeMembers.length === 0 && <p className="text-slate-500">No active members found.</p>}
        </div>
      </div>

      {inactiveMembers.length > 0 && (
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="text-slate-400" /> Past Members (Archived)
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Members who have left the mess.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 opacity-75">
            {inactiveMembers.map(member => (
              <MemberCard 
                key={member._id}
                member={member}
                isCurrentUserAdmin={isManager}
                onAction={openAction}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {actionType === 'remove' ? 'Remove Member' : actionType === 'reactivate' ? 'Reactivate Member' : actionType === 'permanent_delete' ? 'Permanent Delete' : 'Change Role'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {actionType === 'remove' && `Remove ${selectedMember?.name} from the mess.`}
                {actionType === 'reactivate' && `Add ${selectedMember?.name} back to the mess.`}
                {actionType === 'role' && `Change ${selectedMember?.name}'s role.`}
                {actionType === 'permanent_delete' && `Permanently delete ${selectedMember?.name} from the mess. This will also delete all their meal and cost data.`}
              </p>
            </div>

            {actionType === 'permanent_delete' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 text-sm">
                <strong>Warning:</strong> This action cannot be undone. It will delete this member completely, including their past meals and expense records from the database.
              </div>
            )}

            {(actionType === 'remove' || actionType === 'reactivate') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {actionType === 'remove' ? 'Leaving Month (Effective From)' : 'Rejoining Month (Effective From)'}
                </label>
                <MonthDropdown
                  selectedMonth={actionMonth}
                  setSelectedMonth={setActionMonth}
                  monthsArr={monthsArr}
                  yearOptions={yearOptions}
                  width="w-full"
                />
                <p className="text-xs text-slate-500 mt-2">
                  {actionType === 'remove' ? 
                    "They will no longer be charged shared costs or appear in reports starting from this month." : 
                    "They will start being charged shared costs and appear in reports starting from this month."}
                </p>
              </div>
            )}

            {actionType === 'role' && (
              <p className="text-slate-700 dark:text-slate-300">
                Are you sure you want to change their role to <strong>{selectedMember?.role === 'Guest' ? 'Permanent' : 'Guest'}</strong>?
              </p>
            )}

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setActionType(null)}
                className="flex-1 py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleAction}
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MemberCard({ member, isCurrentUserAdmin, onAction }: { member: any, isCurrentUserAdmin: boolean, onAction: (m: any, t: any) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
      <div className={`h-24 ${member.isManager ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700'}`}></div>
      
      {isCurrentUserAdmin && !member.isManager && (
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors text-white"
          >
            <MoreVertical size={18} />
          </button>
          
          {showMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden py-1 z-20">
              <button 
                onClick={() => { setShowMenu(false); onAction(member, 'role'); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Make {member.role === 'Guest' ? 'Permanent' : 'Guest'}
              </button>
              {member.isActive ? (
                <button 
                  onClick={() => { setShowMenu(false); onAction(member, 'remove'); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Remove Member
                </button>
              ) : (
                <button 
                  onClick={() => { setShowMenu(false); onAction(member, 'reactivate'); }}
                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  Reactivate Member
                </button>
              )}
              
              <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
              <button 
                onClick={() => { setShowMenu(false); onAction(member, 'permanent_delete'); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold"
              >
                Permanent Delete
              </button>
            </div>
          )}
        </div>
      )}

      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex justify-between items-end mb-4">
          <div className="-mt-12 h-24 w-24 rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-sm">
            <div className={`h-full w-full rounded-xl flex items-center justify-center text-2xl font-bold ${member.isManager ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {member.name.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="flex flex-col gap-1 items-end">
            {member.isManager && (
              <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                <Shield size={12} /> Manager
              </span>
            )}
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border ${member.role === 'Guest' ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-400' : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400'}`}>
              {member.role}
            </span>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {member.name}
            {!member.isActive && <XCircle size={16} className="text-red-500" />}
            {member.isActive && <CheckCircle size={16} className="text-emerald-500" />}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {!member.isActive ? `Left: ${member.leftMonth}` : 'Currently Active'}
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail size={16} className="text-slate-400 dark:text-slate-500" />
              <span className="truncate">{member.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Phone size={16} className="text-slate-400 dark:text-slate-500" />
              <span>{member.phone}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Click outside overlay for menu */}
      {showMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)}></div>
      )}
    </div>
  );
}
