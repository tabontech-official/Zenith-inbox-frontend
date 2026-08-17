import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiUserCheck,
  FiArchive,
  FiHome,
  FiUser,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiX,
  FiPaperclip,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiLayers,
  FiMessageSquare,
  FiChevronRight,
} from "react-icons/fi";
import PlatformAdminLayout from "./PlatformAdminLayout";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(dateString);
  }
};

const AdminLeadsReport = ({ defaultStatus }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active status from URL or prop
  const determineStatus = () => {
    if (location.pathname.includes("new-leads")) return "new_lead";
    if (location.pathname.includes("secured-leads")) return "secured";
    if (location.pathname.includes("closed-leads")) return "closed";
    if (defaultStatus) return defaultStatus;
    return "new_lead";
  };

  const [activeStatus, setActiveStatus] = useState(determineStatus());
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("all");

  // Thread Modal State
  const [selectedLead, setSelectedLead] = useState(null);
  const [threadEmails, setThreadEmails] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [threadModalOpen, setThreadModalOpen] = useState(false);

  useEffect(() => {
    const status = determineStatus();
    setActiveStatus(status);
  }, [location.pathname]);

  useEffect(() => {
    fetchLeads();
  }, [activeStatus]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("usertoken");
      const url = `https://email-syncing-backend.vercel.app/admin/leads?status=${activeStatus}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLeads(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching leads report:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open full conversation thread
  const openThread = async (lead) => {
    setSelectedLead(lead);
    setThreadModalOpen(true);
    setLoadingThread(true);

    try {
      const token = localStorage.getItem("usertoken");
      const res = await fetch(`https://email-syncing-backend.vercel.app/admin/leads/thread/${lead._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setThreadEmails(data.thread || [lead]);
        if (data.lead) setSelectedLead(data.lead);
      } else {
        setThreadEmails([lead]);
      }
    } catch (err) {
      console.error("Error loading thread:", err);
      setThreadEmails([lead]);
    } finally {
      setLoadingThread(false);
    }
  };

  // Unique organizations list for filter
  const organizationsList = Array.from(
    new Set(leads.map((l) => l.organizationName).filter(Boolean))
  );

  // Filtered Leads
  const filteredLeads = leads
    .filter((l) => {
      if (selectedOrg !== "all" && l.organizationName !== selectedOrg) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          l.subject?.toLowerCase().includes(q) ||
          l.senderAddress?.toLowerCase().includes(q) ||
          l.senderName?.toLowerCase().includes(q) ||
          l.organizationName?.toLowerCase().includes(q) ||
          l.userEmail?.toLowerCase().includes(q)
        );
      }
      return true;
    });

  // Category Title & Subtitle helper
  const getHeaderInfo = () => {
    switch (activeStatus) {
      case "new_lead":
        return {
          title: "New Incoming Leads",
          subtitle: "Incoming leads where automated scenarios have executed across all customer workspaces.",
          badge: "Scenario Executed",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "secured":
        return {
          title: "Secured & Engaged Leads",
          subtitle: "Leads that have responded, engaged, or successfully converted across workspaces.",
          badge: "Secured",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "closed":
        return {
          title: "Closed & Archived Leads",
          subtitle: "Resolved, won, or archived leads across all tenant accounts.",
          badge: "Closed",
          color: "bg-slate-100 text-slate-700 border-slate-300",
        };
      default:
        return {
          title: "All Organization Leads",
          subtitle: "Master multi-tenant lead and message pipeline overview.",
          badge: "All Leads",
          color: "bg-amber-50 text-amber-800 border-amber-300",
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <PlatformAdminLayout pageTitle={headerInfo.title}>
      <div className="flex flex-col gap-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900">{headerInfo.title}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${headerInfo.color}`}>
                {headerInfo.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500">{headerInfo.subtitle}</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl gap-1 text-xs font-semibold">
            <button
              onClick={() => navigate("/admin/reports/new-leads")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeStatus === "new_lead"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FiMail size={13} className={activeStatus === "new_lead" ? "text-blue-600" : ""} />
              <span>New Leads</span>
            </button>
            <button
              onClick={() => navigate("/admin/reports/secured-leads")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeStatus === "secured"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FiUserCheck size={13} className={activeStatus === "secured" ? "text-emerald-600" : ""} />
              <span>Secured</span>
            </button>
            <button
              onClick={() => navigate("/admin/reports/closed-leads")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeStatus === "closed"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FiArchive size={13} className={activeStatus === "closed" ? "text-slate-700" : ""} />
              <span>Closed</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search by sender, email, subject, or workspace..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Organization Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <FiHome size={13} className="text-slate-400 shrink-0" />
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="all">All Workspaces</option>
                {organizationsList.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchLeads}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="Refresh Leads"
            >
              <FiRefreshCw size={13} className={loading ? "animate-spin text-amber-600" : ""} />
            </button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[950px]">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Contact / Lead</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Workspace</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Subject</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Status</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Service</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Date Received</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-slate-400">
                      Loading leads data...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-slate-400">
                      No {activeStatus.replace("_", " ")} emails found.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead._id}
                      onClick={() => openThread(lead)}
                      className="hover:bg-slate-50/70 transition cursor-pointer group"
                    >
                      {/* Contact / Lead */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-amber-100 group-hover:text-amber-800 transition">
                            {lead.senderName?.[0]?.toUpperCase() || "L"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{lead.senderName}</div>
                            <div className="text-[10px] text-slate-400">{lead.senderAddress}</div>
                          </div>
                        </div>
                      </td>

                      {/* Workspace */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <FiHome size={12} className="text-slate-400" />
                          <span>{lead.organizationName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{lead.userEmail}</div>
                      </td>

                      {/* Subject */}
                      <td className="px-4 py-3.5 max-w-[280px]">
                        <div className="font-semibold text-slate-900 truncate text-xs">
                          {lead.subject}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {lead.textBody ? lead.textBody.slice(0, 70) : "No plain text preview"}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            lead.leadStatus === "secured" || lead.leadStatus === "replied"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : lead.leadStatus === "closed"
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {lead.leadStatus === "secured" ? (
                            <FiCheckCircle size={10} />
                          ) : lead.leadStatus === "closed" ? (
                            <FiArchive size={10} />
                          ) : (
                            <FiMail size={10} />
                          )}
                          <span>{lead.leadStatus?.replace("_", " ")}</span>
                        </span>
                      </td>

                      {/* Service */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                          {lead.service || "Email"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                        {formatDate(lead.date)}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openThread(lead);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] shadow-2xs transition"
                        >
                          <FiEye size={12} className="text-slate-500" />
                          <span>View Thread</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── COMPLETE CONVERSATION THREAD MODAL ─────────────────────────────── */}
        {threadModalOpen && selectedLead && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Top Header */}
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-4 shrink-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        selectedLead.leadStatus === "secured" || selectedLead.leadStatus === "replied"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : selectedLead.leadStatus === "closed"
                          ? "bg-slate-200 text-slate-800"
                          : "bg-blue-100 text-blue-800 border border-blue-300"
                      }`}
                    >
                      {selectedLead.leadStatus?.replace("_", " ")}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <FiHome size={11} />
                      {selectedLead.organizationName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Owner: {selectedLead.userEmail || selectedLead.userName}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 truncate">
                    {selectedLead.subject || "No Subject"}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setThreadModalOpen(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
                    title="Close Thread"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body: Complete Conversation Thread List */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-100/60">
                {loadingThread ? (
                  <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                    <FiRefreshCw className="animate-spin text-amber-500" size={20} />
                    <span className="text-xs">Loading conversation history...</span>
                  </div>
                ) : threadEmails.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No conversation messages found.
                  </div>
                ) : (
                  threadEmails.map((email, idx) => {
                    const isOutgoing = email.direction === "outgoing";
                    return (
                      <div
                        key={email._id || idx}
                        className={`rounded-xl border shadow-xs overflow-hidden transition ${
                          isOutgoing
                            ? "bg-blue-50/40 border-blue-200 ml-4 sm:ml-8"
                            : "bg-white border-slate-200 mr-4 sm:mr-8"
                        }`}
                      >
                        {/* Email Card Header */}
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                isOutgoing
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {isOutgoing ? "AI" : email.senderFirstName?.[0] || email.senderAddress?.[0]?.toUpperCase() || "L"}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {email.senderFirstName
                                    ? `${email.senderFirstName} ${email.senderLastName || ""}`
                                    : email.senderAddress}
                                </span>
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                  isOutgoing ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
                                }`}>
                                  {isOutgoing ? "Outgoing Reply" : "Incoming Lead"}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                To: {email.recipientAddress}
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
                            <FiClock size={11} className="text-slate-400" />
                            <span>{formatDate(email.date || email.createdAt)}</span>
                          </div>
                        </div>

                        {/* Email Card Body */}
                        <div className="p-5 text-xs text-slate-800 leading-relaxed font-normal">
                          {email.htmlBody ? (
                            <div
                              className="prose prose-xs max-w-none break-words"
                              dangerouslySetInnerHTML={{ __html: email.htmlBody }}
                            />
                          ) : (
                            <div className="whitespace-pre-wrap font-sans text-slate-700">
                              {email.textBody || "No text content in this message."}
                            </div>
                          )}
                        </div>

                        {/* Attachments if any */}
                        {email.attachments && email.attachments.length > 0 && (
                          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-600">
                            <FiPaperclip size={12} className="text-slate-400" />
                            <span>{email.attachments.length} attachment(s)</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500 font-medium">
                  {threadEmails.length} message(s) in thread
                </span>
                <button
                  type="button"
                  onClick={() => setThreadModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-black hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PlatformAdminLayout>
  );
};

export default AdminLeadsReport;
