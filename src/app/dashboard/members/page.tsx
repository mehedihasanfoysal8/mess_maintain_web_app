"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Phone, Shield, Loader2 } from "lucide-react";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/members");
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="text-indigo-600 dark:text-indigo-400" /> Members Directory
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View all active members in the mess</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map(member => (
          <MemberCard 
            key={member._id}
            name={member.name} 
            role={member.isManager ? "Manager" : "Member"} 
            email={member.email} 
            phone={member.phone} 
            initials={member.name.charAt(0).toUpperCase()} 
            isManager={member.isManager} 
          />
        ))}
      </div>
    </div>
  );
}

function MemberCard({ name, role, email, phone, initials, isManager = false }: { name: string, role: string, email: string, phone: string, initials: string, isManager?: boolean }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className={`h-24 ${isManager ? 'bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-600 dark:to-violet-700' : 'bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700'}`}></div>
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex justify-between items-end mb-4">
          <div className="-mt-12 h-24 w-24 rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-sm">
            <div className={`h-full w-full rounded-xl flex items-center justify-center text-2xl font-bold ${isManager ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {initials}
            </div>
          </div>
          {isManager && (
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
              <Shield size={12} /> Manager
            </span>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{role}</p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail size={16} className="text-slate-400 dark:text-slate-500" />
              <span className="truncate">{email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Phone size={16} className="text-slate-400 dark:text-slate-500" />
              <span>{phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
