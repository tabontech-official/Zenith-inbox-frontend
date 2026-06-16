import os
import re

path = "C:/react apps/Replex Engine/Zenith-inbox-frontend/src/pages/ShopifyScenario.js"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Add historyViewMode state
state_search = "  const [selectedHistoryLog, setSelectedHistoryLog] = useState(null);"
if state_search in code:
    code = code.replace(state_search, state_search + "\n  const [historyViewMode, setHistoryViewMode] = useState(\"builder\");")

# 2. Update ScenarioHistoryPanel onClick
panel_onclick_old = """                onClick={() => setSelectedHistoryLog(log)}"""
panel_onclick_new = """                onClick={() => setHistoryViewMode("table")}"""
if panel_onclick_old in code:
    code = code.replace(panel_onclick_old, panel_onclick_new)

# 3. Restructure the main render
render_start = """      <div className="flex-1 flex flex-col md:ml-64 ml-0 transition-all duration-300">
        {selectedHistoryLog ? (() => {"""

render_end = """          );
        })() : ("""

pattern = re.escape(render_start) + r".*?" + re.escape(render_end)

new_render = """      <div className="flex-1 flex flex-col md:ml-64 ml-0 transition-all duration-300 h-screen overflow-hidden">
        {historyViewMode === "table" ? (
          <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shadow-sm z-10">
              <button
                onClick={() => setHistoryViewMode("builder")}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Scenario History</h1>
                <p className="text-xs text-gray-500">View all past executions and statuses</p>
              </div>
            </div>
            
            {/* Table Container */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] bg-gray-50/80 text-[11px] font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  <div className="px-5 py-3">Started</div>
                  <div className="px-5 py-3">Run Name</div>
                  <div className="px-5 py-3">Trigger / Activity</div>
                  <div className="px-5 py-3">Status</div>
                  <div className="px-5 py-3">Duration</div>
                  <div className="px-5 py-3">Operations</div>
                  <div className="px-5 py-3 text-right">Action</div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {scenarioHistory.length === 0 ? (
                    <div className="px-5 py-8 text-center text-gray-500 text-sm">No history logs found.</div>
                  ) : (
                    scenarioHistory.map((log) => {
                      const duration = log.startedAt && log.completedAt
                        ? `${Math.max(1, Math.round((new Date(log.completedAt) - new Date(log.startedAt)) / 1000))}s`
                        : "< 1s";
                        
                      return (
                        <div key={log._id} className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] items-center text-xs text-gray-700 hover:bg-gray-50/50 transition-colors">
                          <div className="px-5 py-3 font-medium text-gray-900">
                            {new Date(log.createdAt).toLocaleString(undefined, {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })}
                          </div>
                          <div className="px-5 py-3 text-gray-600 truncate">
                            {log.scenarioName || "Shopify Scenario"}
                          </div>
                          <div className="px-5 py-3 text-gray-500">
                            <span className="flex items-center gap-1.5 bg-gray-100 w-fit px-2 py-1 rounded-md">
                              <Zap size={10} className="text-blue-500" />
                              Instant
                            </span>
                          </div>
                          <div className="px-5 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                              log.status === "success" ? "bg-green-50 text-green-700 border-green-200" :
                              log.status === "failed" ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}>
                              {log.status === "failed" ? "Error" : log.status === "partial" ? "Partial" : "Success"}
                            </span>
                          </div>
                          <div className="px-5 py-3 text-gray-500 font-mono text-[11px]">{duration}</div>
                          <div className="px-5 py-3 text-gray-500">{log.steps?.length || 0}</div>
                          <div className="px-5 py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedHistoryLog(log);
                                setHistoryViewMode("details");
                              }}
                              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm text-xs font-medium"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : historyViewMode === "details" && selectedHistoryLog ? (() => {
          const emailBody = selectedHistoryLog.requestPayload?.body || "";
          
          const getLineValue = (label) => {
            const regex = new RegExp(`${label}\\s*:\\s*(.+)`, "i");
            const match = emailBody.match(regex);
            return match?.[1]?.trim() || "";
          };
          
          const getBusinessName = () => {
            const match = emailBody.match(/business,\\s*(.+?)\\./i);
            return match?.[1]?.trim() || "";
          };
          
          const getCustomerFromSignature = () => {
            const match = emailBody.match(/Best regards,\\s*([\\s\\S]+)/i);
            return match?.[1]?.trim()?.split("\\n")?.[0] || "";
          };
          
          const duration = selectedHistoryLog.startedAt && selectedHistoryLog.completedAt
            ? `${Math.max(1, Math.round((new Date(selectedHistoryLog.completedAt) - new Date(selectedHistoryLog.startedAt)) / 1000))} sec`
            : "Less than 1 sec";
            
          const leadDetails = {
            customerName: getCustomerFromSignature() || selectedHistoryLog.customerName || getLineValue("Name") || "N/A",
            businessName: getBusinessName() || getLineValue("Business") || "N/A",
            service: selectedHistoryLog.service || getLineValue("Service needed") || "N/A",
            budget: getLineValue("Budget") || "N/A",
            website: getLineValue("Website") || "N/A",
            country: getLineValue("Country") || "N/A",
          };

          const statusColors = selectedHistoryLog.status === "success" 
            ? "bg-green-50 border-green-200 text-green-700" 
            : selectedHistoryLog.status === "failed" 
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-yellow-50 border-yellow-200 text-yellow-700";

          return (
            <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
              {/* Header - Fixed */}
              <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setHistoryViewMode("table")}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                      Run Details
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${statusColors} uppercase tracking-wider`}>
                        {selectedHistoryLog.status}
                      </span>
                    </h1>
                    <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      <Clock3 size={12} /> {new Date(selectedHistoryLog.createdAt).toLocaleString()} 
                      <span className="text-gray-300">|</span> 
                      <RefreshCw size={12} /> {duration} duration
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                  
                  {/* Lead Details Card */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <FiUsers className="text-indigo-500" />
                        Extracted Lead Information
                      </h3>
                    </div>
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-8">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Customer Name</p>
                        <p className="text-sm text-gray-900 font-medium">{leadDetails.customerName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Business</p>
                        <p className="text-sm text-gray-900 font-medium">{leadDetails.businessName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Service Needed</p>
                        <p className="text-sm text-gray-900 font-medium">{leadDetails.service}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Budget</p>
                        <p className="text-sm text-gray-900 font-medium">{leadDetails.budget}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Country</p>
                        <p className="text-sm text-gray-900 font-medium">{leadDetails.country}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Website</p>
                        {leadDetails.website !== "N/A" ? (
                          <a href={leadDetails.website.startsWith('http') ? leadDetails.website : `https://${leadDetails.website}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1">
                            {leadDetails.website} <FiLink size={12} />
                          </a>
                        ) : <p className="text-sm text-gray-900 font-medium">N/A</p>}
                      </div>
                    </div>
                  </div>

                  {/* Operations Timeline */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <FiActivity className="text-blue-500" />
                        Execution Timeline
                      </h3>
                    </div>
                    <div className="p-5">
                      <div className="space-y-4">
                        {selectedHistoryLog.steps && selectedHistoryLog.steps.length > 0 ? (
                          selectedHistoryLog.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                                  step.status === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
                                  step.status === 'failed' ? 'bg-red-100 text-red-700 border border-red-200' :
                                  'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}>
                                  {idx + 1}
                                </div>
                                {idx !== selectedHistoryLog.steps.length - 1 && (
                                  <div className="w-px h-full bg-gray-200 my-1"></div>
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <h4 className="text-sm font-semibold text-gray-800 mb-1">{step.moduleName || step.type || `Step ${idx + 1}`}</h4>
                                {step.replyEmailId && (
                                  <div className="text-xs bg-blue-50 border border-blue-100 text-blue-800 p-2 rounded-lg mt-2 font-mono flex items-center gap-2">
                                    <FiMail className="shrink-0" /> Sent Reply ID: {step.replyEmailId}
                                  </div>
                                )}
                                {step.error && (
                                  <div className="text-xs bg-red-50 border border-red-100 text-red-800 p-2 rounded-lg mt-2 font-mono">
                                    {typeof step.error === 'string' ? step.error : JSON.stringify(step.error)}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No detailed steps recorded for this run.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Raw Payload Detail */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <FiCode className="text-gray-500" />
                        Trigger Payload (Email Body)
                      </h3>
                    </div>
                    <div className="p-0">
                      <pre className="text-[11px] font-mono text-gray-700 bg-[#f8f9fa] p-5 overflow-x-auto m-0 whitespace-pre-wrap">
                        {emailBody || "No payload body available."}
                      </pre>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })() : ("""

code = re.sub(pattern, lambda m: new_render, code, flags=re.DOTALL)

with open(path, "w", encoding="utf-8") as f:
    f.write(code)

print("Updated ShopifyScenario successfully.")
