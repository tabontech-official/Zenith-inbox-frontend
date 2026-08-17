import React, { useState, useEffect } from "react";
import { FiList, FiShield, FiClock, FiCheckCircle } from "react-icons/fi";
import MasterAdminLayout from "./MasterAdminLayout";

const MasterAdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("usertoken");
      const res = await fetch("https://email-syncing-backend.vercel.app/admin/audit-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MasterAdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Master Admin Security Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable trace log of all Master Admin actions, plan modifications, and system configuration updates.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-semibold">Timestamp</th>
                <th className="p-3.5 font-semibold">Master Admin</th>
                <th className="p-3.5 font-semibold">Action</th>
                <th className="p-3.5 font-semibold">Target Type & ID</th>
                <th className="p-3.5 font-semibold">IP Address</th>
                <th className="p-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    No Master Admin audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-medium text-slate-900">
                      {log.masterAdminEmail}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-700">{log.targetType}</span>
                      {log.targetId && (
                        <code className="text-[10px] font-mono text-slate-400 block">{log.targetId}</code>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MasterAdminLayout>
  );
};

export default MasterAdminAuditLogs;
