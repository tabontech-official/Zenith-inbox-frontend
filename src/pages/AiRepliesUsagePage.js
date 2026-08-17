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
  const { user: contextUser, setUser: setContextUser } = useContext(UserContext);
  const userId = localStorage.getItem("userid") || contextUser?._id;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSub, setUserSub] = useState({
    plan: contextUser?.subscription?.plan || "Explore",
    aiRepliesUsed: contextUser?.subscription?.aiRepliesUsed || 0,
    extraAiReplies: contextUser?.subscription?.extraAiReplies || 0,
    status: contextUser?.subscription?.status || "active",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch plan limit based on current user plan
  const getPlanLimit = (p) => {
    const name = (p || "Explore").toLowerCase();
    if (name === "elevate") return 500;
    if (name === "unite") return 1000;
    if (name === "enterprise") return 10000;
    return 50;
  };

  useEffect(() => {
    fetchUserDataAndLogs();
  }, [userId]);

  const fetchUserDataAndLogs = async () => {
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch fresh subscription data from DB
      const userRes = await axios.get(`${API_BASE_URL}/auth/getUsers/${targetUserId}`);
      if (userRes.data?.data) {
        const fetched = userRes.data.data;
        const subData = fetched.subscription || {};
        setUserSub({
          plan: subData.plan || "Explore",
          aiRepliesUsed: subData.aiRepliesUsed || 0,
          extraAiReplies: subData.extraAiReplies || 0,
          status: subData.status || "active",
        });
        if (setContextUser) setContextUser(fetched);
      }

      // Fetch AI reply execution logs
      const logRes = await axios.get(`${API_BASE_URL}/scenario-run-log/user/${targetUserId}`);
      if (logRes.data?.success && Array.isArray(logRes.data?.logs)) {
        setLogs(logRes.data.logs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Error fetching AI replies data & logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const plan = userSub.plan || "Explore";
  const usedReplies = userSub.aiRepliesUsed || 0;
  const extraReplies = userSub.extraAiReplies || 0;

  const baseLimit = getPlanLimit(plan);
  const totalLimit = baseLimit + extraReplies;
  const usagePercentage = Math.min(
    100,
    Math.round((usedReplies / (totalLimit || 1)) * 100)
  );

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
          {/* Card 1: Plan Allowance */}
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

          {/* Card 2: AI Replies Used */}
          <div className="rounded-[12px] border border-[#E0DDD5] bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Replies Used</span>
              <FiZap className="h-4 w-4 text-slate-800" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-950">
                {usedReplies.toLocaleString()} / {totalLimit.toLocaleString()}
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-slate-900 rounded-full transition-all duration-300"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Extra Buffer */}
          <div className="rounded-[12px] border border-[#E0DDD5] bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Extra Buffer</span>
              <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                Add-on Pack
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-950">
                +{extraReplies.toLocaleString()}
              </p>
              <p className="text-[11px] font-medium text-slate-400 mt-1">Never expires</p>
            </div>
          </div>

          {/* Card 4: Total Executions */}
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
              onClick={fetchUserDataAndLogs}
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
              <FiRefreshCw className="animate-spin text-slate-800 h-5 w-5" />
              <span>Fetching real-time AI reply records...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <FiZap className="h-6 w-6 text-slate-400" />
              <p className="font-bold text-slate-800">No AI reply execution logs found</p>
              <p className="text-[11px] text-slate-500">
                When incoming lead emails trigger your active scenarios, their audit logs will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-[#E0DDD5] uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Lead / Client</th>
                    <th className="px-5 py-3">Scenario Name</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => {
                    const dateStr = log.timestamp
                      ? new Date(log.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recently";

                    return (
                      <tr key={log._id || log.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-5 py-3.5 font-medium text-slate-500 whitespace-nowrap">
                          {dateStr}
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900">{log.customerName || "Lead Inquiry"}</div>
                          <div className="text-[11px] text-slate-500">{log.businessEmail || "No email"}</div>
                        </td>

                        <td className="px-5 py-3.5 font-semibold text-slate-800">
                          {log.scenarioName || log.service || "Standard AI Response"}
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-slate-100 text-slate-800 border-slate-300">
                            {log.scenarioType || "Shopify"}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              log.status?.toLowerCase() === "success" || !log.status
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {log.status?.toLowerCase() === "success" || !log.status ? (
                              <>
                                <FiCheckCircle size={10} />
                                <span>Success</span>
                              </>
                            ) : (
                              <>
                                <FiAlertCircle size={10} />
                                <span>Failed</span>
                              </>
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-[11px] font-bold transition flex items-center gap-1 justify-end ml-auto cursor-pointer border border-slate-300"
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

        {/* LOG DETAIL INSPECTION MODAL */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FiZap className="text-slate-800" size={18} />
                  <h3 className="text-base font-bold text-slate-950">AI Reply Execution Inspection</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-400 block text-[10px] uppercase">Lead Name</span>
                  <span className="font-bold text-slate-900">{selectedLog.customerName || "N/A"}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block text-[10px] uppercase">Business Email</span>
                  <span className="font-bold text-slate-900">{selectedLog.businessEmail || "N/A"}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block text-[10px] uppercase">Scenario</span>
                  <span className="font-bold text-slate-900">{selectedLog.scenarioName || "Default"}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block text-[10px] uppercase">Service Category</span>
                  <span className="font-bold text-slate-900">{selectedLog.service || "General"}</span>
                </div>
              </div>

              {/* Inbound Lead Message */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Inbound Inquiry Message:</label>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {selectedLog.inboundMessage || selectedLog.inquiryDetails || "No raw message recorded."}
                </div>
              </div>

              {/* Outbound AI Reply */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Generated AI Response:</label>
                <div className="bg-slate-100 border border-slate-300 p-3 rounded-lg text-xs text-slate-900 leading-relaxed font-sans whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedLog.generatedReply || selectedLog.responseBody || "Automated response sent successfully."}
                </div>
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition cursor-pointer"
                >
                  Close
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
