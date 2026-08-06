import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiZap,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiEye,
  FiShoppingBag,
  FiRefreshCw,
  FiMail,
  FiX,
  FiCpu,
  FiChevronRight,
  FiPieChart,
} from "react-icons/fi";
import axios from "axios";
import AppLayout from "../component/AppLayout";
import { UserContext } from "../component/UserContext";

const API_BASE_URL = "https://email-syncing-backend.vercel.app";

const AiRepliesUsagePage = () => {
  const navigate = useNavigate();
  const { user: contextUser } = useContext(UserContext);
  const userId = localStorage.getItem("userid") || contextUser?._id;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState(null);

  // User subscription limits
  const plan = contextUser?.subscription?.plan || "Explore";
  const usedReplies = contextUser?.subscription?.aiRepliesUsed || 0;
  const extraReplies = contextUser?.subscription?.extraAiReplies || 0;

  const getPlanLimit = (p) => {
    const name = (p || "Explore").toLowerCase();
    if (name === "elevate") return 100;
    if (name === "unite") return 1000;
    return 10;
  };

  const baseLimit = getPlanLimit(plan);
  const totalLimit = baseLimit + extraReplies;
  const usagePercentage = Math.min(
    100,
    Math.round((usedReplies / (totalLimit || 1)) * 100)
  );

  useEffect(() => {
    fetchLogs();
  }, [userId]);

  const fetchLogs = async () => {
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/scenario-run-log/user/${targetUserId}`);
      if (res.data?.success && Array.isArray(res.data?.logs)) {
        setLogs(res.data.logs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Error fetching AI reply logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.businessEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.scenarioName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.service || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || log.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesType =
      typeFilter === "all" || log.scenarioType?.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <AppLayout>
      <div className="w-full flex flex-col gap-6 font-sans">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E0DDD5] pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
              <FiActivity className="h-5 w-5 text-slate-800" />
              <span>AI Replies Usage &amp; Tracking</span>
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Complete audit history of automated AI responses, lead inquiries, and token consumption.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/pricing")}
            className="h-9 px-4 bg-slate-900 text-white rounded-[8px] text-xs font-bold hover:bg-black transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
          >
            <FiShoppingBag size={14} className="text-slate-300" />
            <span>Buy Extra AI Replies</span>
          </button>
        </div>

        {/* KPI Overview Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <div className="rounded-[12px] border border-[#E0DDD5] bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Allowance</span>
              <span className="text-[10px] font-extrabold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full border border-slate-300 uppercase">
                {plan}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-950">
                {baseLimit.toLocaleString()} <span className="text-xs font-semibold text-slate-400">replies/mo</span>
              </p>
              <p className="text-[11px] font-medium text-slate-400 mt-1">Resets monthly on 28th</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-[12px] border border-[#E0DDD5] bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Replies Used</span>
              <FiZap className="h-4 w-4 text-slate-800" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-950">
                {usedReplies.toLocaleString()}
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-slate-900 rounded-full transition-all duration-300"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-[12px] border border-[#E0DDD5] bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Extra Buffer</span>
              <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                $0.20 / reply
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-950">
                +{extraReplies.toLocaleString()}
              </p>
              <p className="text-[11px] font-medium text-slate-400 mt-1">Never expires</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-[12px] border border-[#E0DDD5] bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Executions</span>
              <FiCpu className="h-4 w-4 text-slate-700" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-950">
                {logs.length}
              </p>
              <p className="text-[11px] font-medium text-slate-400 mt-1">Real-time logged</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-[12px] border border-[#E0DDD5] shadow-2xs">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Lead Name, Email, Scenario, or Service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[8px] border border-[#E0DDD5] pl-9 pr-4 py-2 text-xs outline-none focus:border-slate-900 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-[8px] border border-[#E0DDD5] px-3 py-2 text-xs font-semibold text-slate-800 outline-none bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-[8px] border border-[#E0DDD5] px-3 py-2 text-xs font-semibold text-slate-800 outline-none bg-white"
            >
              <option value="all">All Scenario Types</option>
              <option value="shopify">Shopify Partner</option>
              <option value="custom">Custom Workflow</option>
            </select>

            <button
              type="button"
              onClick={fetchLogs}
              className="p-2 rounded-[8px] border border-[#E0DDD5] bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh logs"
            >
              <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* AI Replies Log Table */}
        <div className="bg-white rounded-[12px] border border-[#E0DDD5] shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E0DDD5] bg-slate-50/80 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
              AI Response Audit Logs ({filteredLogs.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <FiRefreshCw className="animate-spin h-6 w-6 text-slate-800" />
              <span>Loading AI replies usage history...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <FiActivity className="h-8 w-8 text-slate-300" />
              <p className="font-semibold text-slate-700">No AI reply execution logs found</p>
              <p className="text-[11px] text-slate-400">
                When incoming lead emails trigger automated replies, complete tracking details will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-[#E0DDD5] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Scenario</th>
                    <th className="px-4 py-3">Lead / Sender</th>
                    <th className="px-4 py-3">Inquiry Service</th>
                    <th className="px-4 py-3">AI Model</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => {
                    const isSuccess = log.status === "success";
                    return (
                      <tr key={log._id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {new Date(log.createdAt || log.startedAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">
                              {log.scenarioName || "Auto Scenario"}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">
                              {log.scenarioType || "Shopify"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex flex-col max-w-[180px] truncate">
                            <span className="font-bold text-slate-900 truncate">
                              {log.customerName || "Lead Inquiry"}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate">
                              {log.businessEmail || "No Email"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 max-w-[200px] truncate font-medium text-slate-800">
                          {log.service || log.parentEmail?.subject || "General Inquiry"}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold border border-slate-300">
                            <FiCpu size={11} />
                            <span>Gemini 2.5 Flash</span>
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {isSuccess ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                              <FiCheckCircle size={11} />
                              <span>Replied</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-200">
                              <FiAlertCircle size={11} />
                              <span>Failed</span>
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="px-2.5 py-1 rounded-[6px] bg-slate-100 text-slate-800 hover:bg-slate-200 transition font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FiEye size={12} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Log Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-[12px] shadow-2xl border border-[#E0DDD5] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 animate-in zoom-in-95 duration-150 flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FiMail className="text-slate-800" size={18} />
                  <h3 className="text-sm font-bold text-slate-950">AI Reply Execution Details</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Sender & Scenario Meta */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-[8px] border border-[#E0DDD5] text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Lead Sender</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedLog.customerName || "Customer Name"}</p>
                  <p className="text-slate-600">{selectedLog.businessEmail || "email@domain.com"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Scenario &amp; Service</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedLog.scenarioName || "Default Scenario"}</p>
                  <p className="text-slate-600">{selectedLog.service || "Shopify Store Service"}</p>
                </div>
              </div>

              {/* Incoming Customer Email */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-800">📩 Incoming Lead Inquiry:</span>
                <div className="p-3.5 bg-slate-100 rounded-[8px] text-xs text-slate-800 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto border border-[#E0DDD5]">
                  {selectedLog.parentEmail?.textBody || selectedLog.parentEmail?.htmlBody || selectedLog.message || "Incoming email payload received."}
                </div>
              </div>

              {/* Outbound Generated AI Reply */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-950 flex items-center gap-1">
                  <FiZap size={14} className="text-slate-800" />
                  <span>🤖 Generated AI Outbound Reply:</span>
                </span>
                <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-[8px] text-xs text-slate-900 font-sans leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedLog.replyEmail?.textBody || selectedLog.replyEmail?.htmlBody || selectedLog.responsePayload?.replyText || "AI automated response sent to client."}
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-[8px] hover:bg-black transition cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AiRepliesUsagePage;
