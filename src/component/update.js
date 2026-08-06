const fs = require('fs');

const path = 'C:/react apps/Replex Engine/Zenith-inbox-frontend/src/component/MailhookConnectionModal.js';
const code = fs.readFileSync(path, 'utf8');
const lines = code.split(/\r?\n/);

const newReturn = `  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
      <div
        className="relative bg-[#F9FAFB] rounded-2xl shadow-2xl w-full max-w-[540px] flex flex-col overflow-hidden border border-white/50"
        style={{ backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f3f4f6)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-700 transition z-50 bg-white/60 p-2 rounded-full backdrop-blur-md shadow-sm"
        >
          <FiX className="text-base sm:text-xl" />
        </button>

        {/* Header Branding */}
        <div className="flex-none flex flex-col items-center justify-center pt-6 sm:pt-8 pb-4">
          <div className="flex items-center gap-2 px-3 py-1 mb-3">
            <FiMail className="text-indigo-600 text-2xl sm:text-3xl drop-shadow-sm" />
            <span className="font-bold text-lg sm:text-xl text-gray-900 tracking-tight">
              Replex Engine
            </span>
          </div>
          
          {/* Step Indicator */}
          <div className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 text-gray-800 bg-white/70 backdrop-blur-md border border-gray-200/50 shadow-sm">
            <FiCheckCircle className="text-indigo-600" />
            <span>Step ${step} of 4</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full px-4 sm:px-8 pb-6 sm:pb-8 flex flex-col justify-center relative min-h-[360px]">
          <AnimatePresence mode="wait">
            {alert.message && (
              <motion.div
                key={alert.message}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={\`absolute top-0 left-4 right-4 sm:left-8 sm:right-8 z-20 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-center backdrop-blur-xl shadow-sm border \${alert.type === "success"
                  ? "bg-green-50/95 text-green-800 border-green-200"
                  : "bg-red-50/95 text-red-800 border-red-200"
                  }\`}
              >
                {alert.message}
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center text-center bg-white/40 border border-white/60 p-5 sm:p-6 rounded-2xl shadow-sm backdrop-blur-md"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Your Mailhook Connection
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm mb-6 leading-relaxed max-w-xs mx-auto">
                We�ll create your mailhook and help you forward new leads to it.
                This ensures you never miss an incoming email.
              </p>

              <div className="flex flex-row items-center justify-center gap-3 w-full">
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-800 text-xs sm:text-sm font-semibold transition px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      const res = await axios.post(
                        "https://email-syncing-backend.vercel.app/mailhookcard/create",
                        {
                          userId: user._id,
                          forwardingEmail: "",
                        }
                      );
                      if (res.data.success) {
                        toast.success("Mailhook connection initialized!");
                        setStep(2);
                      } else {
                        toast.error("Failed to initialize mailhook connection");
                      }
                    } catch (err) {
                      console.error("Error creating mailhook:", err);
                      toast.error("Server error while creating mailhook connection");
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:scale-[1.02]"
                >
                  <span>Next Step</span>
                  <FiArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center text-center bg-white/40 border border-white/60 p-4 sm:p-6 rounded-2xl shadow-sm backdrop-blur-md"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">
                Set Up Forwarding
              </h2>
              <p className="text-gray-600 text-[11px] sm:text-xs mb-4 leading-relaxed max-w-sm mx-auto">
                Set this address as your forwarding destination. Once active, we'll verify it.
              </p>

              <div className="w-full max-w-sm rounded-xl p-3 mb-4 bg-white/60 border border-white/80 shadow-sm backdrop-blur-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800 text-xs">Forward To:</h3>
                  <span className="text-green-700 bg-green-100 text-[10px] px-2 py-0.5 rounded-full font-medium">
                    Private & Unique
                  </span>
                </div>

                <div className="bg-white/90 text-indigo-600 px-3 py-2 rounded-lg flex justify-between items-center font-mono text-[11px] sm:text-xs border border-gray-100 shadow-sm">
                  <span className="truncate mr-2 font-medium">
                    {user?.mailhook || "loading-mailhook@zenith-inbox.com"}
                  </span>
                  <button
                    onClick={() => {
                      if (user?.mailhook) {
                        navigator.clipboard.writeText(user.mailhook);
                        setAlert({ type: "success", message: "Mailhook copied successfully!" });
                      }
                    }}
                    className="shrink-0 text-gray-400 hover:text-indigo-600 transition p-1 bg-gray-50 hover:bg-indigo-50 rounded-md border border-gray-100 hover:border-indigo-100"
                  >
                    <FiCopy className="text-sm" />
                  </button>
                </div>
              </div>

              {/* Validation Checklist */}
              <div className="w-full max-w-sm bg-white/60 rounded-xl p-3 sm:p-4 border border-white/80 shadow-sm text-left mb-5">
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Checklist to continue</h3>
                
                <div className="space-y-2.5 text-[11px] sm:text-xs text-gray-700 font-medium">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition-all"
                      checked={forwardingEnabled}
                      onChange={(e) => setForwardingEnabled(e.target.checked)}
                    />
                    <span className="group-hover:text-gray-900 transition-colors">I have enabled <strong>email forwarding</strong></span>
                  </label>

                  <label className={\`flex items-center gap-2 \${forwardingEnabled ? "cursor-pointer group" : "cursor-not-allowed opacity-50"}\`}>
                    <input
                      type="radio"
                      name="provider"
                      className="h-3.5 w-3.5 text-indigo-600 border-gray-300 focus:ring-indigo-500 transition-all"
                      disabled={!forwardingEnabled}
                      checked={provider === "gmail"}
                      onChange={() => setProvider("gmail")}
                    />
                    <span className={forwardingEnabled ? "group-hover:text-gray-900 transition-colors" : ""}>Setup using <strong>Gmail / Google</strong></span>
                  </label>

                  <label className={\`flex items-center gap-2 \${forwardingEnabled ? "cursor-pointer group" : "cursor-not-allowed opacity-50"}\`}>
                    <input
                      type="radio"
                      name="provider"
                      className="h-3.5 w-3.5 text-indigo-600 border-gray-300 focus:ring-indigo-500 transition-all"
                      disabled={!forwardingEnabled}
                      checked={provider === "other"}
                      onChange={() => setProvider("other")}
                    />
                    <span className={forwardingEnabled ? "group-hover:text-gray-900 transition-colors" : ""}>Setup using <strong>Other Provider</strong></span>
                  </label>
                </div>
              </div>

              <button
                disabled={!forwardingEnabled || !provider}
                onClick={() => setStep(3)}
                className={\`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all w-full max-w-sm \${
                  (!forwardingEnabled || !provider)
                    ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:scale-[1.02]"
                }\`}
              >
                <span>Continue</span>
                <FiArrowRight />
              </button>
            </motion.div>
          )}

          {(step === 3 || step === 4 || step === 5) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center bg-white/40 border border-white/60 p-4 sm:p-6 rounded-2xl shadow-sm backdrop-blur-md"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                Forwarding Verification
              </h2>
              <p className="text-gray-600 text-[11px] sm:text-xs mb-4">
                Checking your mailhook for the forwarding verification email.
              </p>

              <div className="w-full max-w-sm bg-white/70 border border-white/90 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col justify-center min-h-[160px]">
                {step === 4 ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center w-full"
                  >
                    <div className="bg-green-50 text-green-700 px-4 py-4 rounded-xl flex flex-col items-center gap-2 shadow-sm border border-green-200/60 w-full">
                      <div className="bg-green-100 p-2 rounded-full mb-1">
                        <FiCheck className="text-green-600 text-2xl" />
                      </div>
                      <h4 className="font-bold text-green-800 text-base">
                        Verified successfully!
                      </h4>
                      <p className="text-[11px] text-green-700 mb-3">
                        Your Mailhook connection is ready to go.
                      </p>
                      <button
                        onClick={() => {
                          setValidationSuccess(false);
                          setVerificationFound(false);
                          setVerificationEmail(null);
                          setForwardingEnabled(false);
                          setProvider(null);
                          setStep(1);
                          onClose();
                        }}
                        className="w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-lg font-bold text-xs shadow-md transition-all"
                      >
                        Complete Connection
                      </button>
                    </div>
                  </motion.div>
                ) : step === 3 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-left w-full flex flex-col items-center"
                  >
                    {verificationEmail?.sender && (
                      <div className="w-full border border-indigo-100 rounded-lg bg-indigo-50/60 p-3 mb-4 text-xs shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            New Email
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            {verificationEmail?.date
                              ? new Date(verificationEmail.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : ""}
                          </span>
                        </div>

                        <p className="mb-1 truncate text-gray-800">
                          <span className="font-semibold text-gray-600">From:</span> {verificationEmail.sender}
                        </p>
                        <p className="mb-2 truncate text-gray-800">
                          <span className="font-semibold text-gray-600">Subject:</span> {verificationEmail.subject}
                        </p>

                        <div
                          className="border-t border-indigo-100/60 pt-2 text-gray-700 line-clamp-3 text-[11px] leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: verificationEmail.formattedBody || verificationEmail.textBody || "",
                          }}
                        />
                      </div>
                    )}

                    {!validationSuccess ? (
                      <div className="w-full">
                        <label className="block text-xs font-semibold mb-1.5 text-gray-800">
                          Confirm forwarding email:
                        </label>
                        <input
                          type="email"
                          className="border border-gray-200 rounded-lg px-3 py-2 w-full text-xs mb-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm transition-all"
                          placeholder="your@email.com"
                          value={verificationEmail?.toEmail || ""}
                          onChange={(e) =>
                            setVerificationEmail({
                              ...(verificationEmail || {}),
                              toEmail: e.target.value,
                            })
                          }
                        />

                        <button
                          disabled={validating}
                          onClick={handleValidateForwarding}
                          className={\`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm \${validating
                            ? "bg-gray-400 cursor-wait"
                            : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md"
                            }\`}
                        >
                          {validating ? "Validating..." : "Validate Forwarding"}
                          {!validating && <FiCheckCircle />}
                        </button>
                      </div>
                    ) : (
                      <div className="w-full text-center">
                        <div className="text-green-700 mb-4 text-xs font-semibold bg-green-50/80 py-2 px-3 rounded-lg border border-green-200/60 shadow-sm">
                          Forwarding verified successfully!
                        </div>
                        <button
                          onClick={() => setStep(4)}
                          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:scale-[1.02] mx-auto w-full"
                        >
                          <span>Next Step</span>
                          <FiArrowRight />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : validationFailed ? (
                  <div className="bg-red-50/80 text-red-800 border border-red-200/60 p-3 rounded-lg text-center shadow-sm w-full">
                    <p className="font-bold text-sm mb-1">Validation failed</p>
                    <p className="text-[11px] text-red-700/80">
                      Please check your forwarding setup in your email provider.
                    </p>
                  </div>
                ) : null}

                {validationFailed && (
                  <div className="flex justify-center mt-4">
                    <button
                      disabled={retrying}
                      onClick={() => {
                        setRetrying(true);
                        setRetryKey((prev) => prev + 1);
                        setValidationFailed(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold border border-indigo-200 text-indigo-700 bg-indigo-50/50 rounded-full hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-sm"
                    >
                      <FiRefreshCcw className={\`\${retrying ? "animate-spin" : ""}\`} />
                      {retrying ? "Checking..." : "Refresh Status"}
                    </button>
                  </div>
                )}
              </div>

              {step === 5 && (
                <button
                  onClick={onClose}
                  className="mt-4 w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-lg font-bold text-xs shadow-md transition-all max-w-sm"
                >
                  Complete Connection
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailhookConnectionModal;
`;

const newCode = lines.slice(0, 376).join('\n') + '\n' + newReturn;

fs.writeFileSync(path, newCode);
console.log('Update successful');
