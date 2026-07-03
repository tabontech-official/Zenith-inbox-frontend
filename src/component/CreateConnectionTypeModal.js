import React, { useState, useEffect } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";

const CreateConnectionTypeModal = ({ isOpen, onClose, onSelectType }) => {
  const [step, setStep] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Step 2 states
  const [connectionName, setConnectionName] = useState("My Others (IMAP) connection");
  const [provider, setProvider] = useState("");
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetStateAndClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setStep(1);
      setSelectedType("");
      setProvider("");
      setUsername("");
      setPassword("");
      onClose();
    }, 200);
  };

  const handleSelect = (type) => {
    setSelectedType(type);
    setShowDropdown(false);
    if (type === "Others (IMAP)") {
      setStep(2);
    } else {
      setIsVisible(false);
      setTimeout(() => {
        setStep(1);
        onSelectType(type);
      }, 200);
    }
  };

  const handleProviderSelect = (prov) => {
    setProvider(prov);
    setShowProviderDropdown(false);
    
    if (prov === "Outlook.com") {
      setIsVisible(false);
      setTimeout(() => {
        setStep(1);
        onSelectType("Microsoft SMTP/IMAP OAuth");
      }, 200);
    } else if (prov === "Other") {
      setIsVisible(false);
      setTimeout(() => {
        setStep(1);
        onSelectType("Others (IMAP)");
      }, 200);
    }
  };

  const options = [
    "Others (IMAP)",
    "Google Restricted",
    "Microsoft SMTP/IMAP OAuth"
  ];

  const providerOptions = [
    // "Hotmail",
    "Outlook.com",
    // "Seznam.cz",
    // "Yandex",
    // "Zoho Mail",
    "Other"
  ];

  const needsCredentials = ["Hotmail", "Seznam.cz", "Yandex", "Zoho Mail"].includes(provider);

  return (
    <>
      <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} onClick={resetStateAndClose}></div>
      <div className={`absolute top-0 left-[calc(100%+30px)] z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-white/40 w-[420px] flex flex-col transform transition-all duration-300 origin-top-left ${isVisible ? 'scale-100 opacity-100 translate-x-0' : 'scale-95 opacity-0 -translate-x-4'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50 rounded-t-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500"></div>
          <h2 className="font-bold text-xl text-gray-900 tracking-tight">Create a connection</h2>
          <button onClick={resetStateAndClose} className="text-gray-400 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full">
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-7 pb-10">
          {step === 1 ? (
            <div className="relative mb-24 transition-all duration-300">
              <label className="block text-[15px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-violet-100/50 text-violet-600 rounded-lg flex items-center justify-center w-7 h-7 shadow-sm border border-violet-100">
                  <FiChevronRight className="text-sm" />
                </span>
                Connection type <span className="text-rose-500">*</span>
              </label>
              <div 
                className={`flex items-center justify-between bg-white border px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${showDropdown ? 'border-violet-500 ring-2 ring-violet-500/20 shadow-violet-500/10' : 'border-gray-200 hover:border-violet-300'}`}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="text-[15px] text-gray-800 font-medium">{selectedType || "Select a connection type..."}</span>
                <FiChevronDown className={`text-gray-500 text-lg transition-transform duration-300 ${showDropdown ? 'rotate-180 text-violet-500' : ''}`} />
              </div>

              <div className={`absolute left-0 right-0 z-50 mt-2 transition-all duration-200 origin-top ${showDropdown ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}>
                <ul className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1">
                  {options.map((option, index) => (
                    <li
                      key={index}
                      className={`px-5 py-3.5 text-[15px] text-gray-700 cursor-pointer font-medium hover:bg-violet-50 hover:text-violet-700 transition-colors flex items-center justify-between group ${index !== options.length - 1 ? 'border-b border-gray-50' : ''}`}
                      onClick={() => handleSelect(option)}
                    >
                      {option}
                      <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-violet-500 transform group-hover:translate-x-1 duration-200" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Connection Name */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100/50 text-blue-600 rounded-lg flex items-center justify-center w-7 h-7 shadow-sm border border-blue-100">
                    <FiChevronRight className="text-sm" />
                  </span>
                  Connection name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                  className="w-full bg-white border border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none px-4 py-3.5 rounded-xl text-[15px] text-gray-800 font-medium transition-all shadow-sm"
                />
              </div>

              {/* Email Provider */}
              <div className="relative">
                <label className="block text-[15px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100/50 text-blue-600 rounded-lg flex items-center justify-center w-7 h-7 shadow-sm border border-blue-100">
                    <FiChevronRight className="text-sm" />
                  </span>
                  Email provider <span className="text-rose-500">*</span>
                </label>
                <div 
                  className={`flex items-center justify-between bg-white border px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${showProviderDropdown ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                >
                  <span className="text-[15px] text-gray-800 font-medium">{provider || "Select an email provider..."}</span>
                  <FiChevronDown className={`text-gray-500 text-lg transition-transform duration-300 ${showProviderDropdown ? 'rotate-180 text-blue-500' : ''}`} />
                </div>

                <div className={`absolute left-0 right-0 z-50 mt-2 transition-all duration-200 origin-top ${showProviderDropdown ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}>
                  <ul className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1">
                    {providerOptions.map((option, index) => (
                      <li
                        key={index}
                        className={`px-5 py-3.5 text-[15px] text-gray-700 cursor-pointer font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between group ${index !== providerOptions.length - 1 ? 'border-b border-gray-50' : ''}`}
                        onClick={() => handleProviderSelect(option)}
                      >
                        {option}
                        <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 transform group-hover:translate-x-1 duration-200" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Credentials Fields */}
              {needsCredentials && (
                <div className="space-y-4 pt-4 mt-4 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">Username</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-gray-50/50 border border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password or App Password"
                      className="w-full bg-gray-50/50 border border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all"
                    />
                  </div>
                  
                  <div className="pt-6 flex justify-end">
                onClick={async () => {
  try {
    const res = await fetch(
      "https://email-syncing-backend.vercel.app/api/connection/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "hotmail",   // 🔥 ONLY HOTMAIL FOR NOW
          connectionName: connectionName,
          username: username,
          password: password,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      console.success("Hotmail connection created!");

      resetStateAndClose();

      // refresh list
      // fetchConnections();
    } else {
      console.error(data.message || "Failed to create connection");
    }
  } catch (err) {
    console.error("Server error while creating connection");
  }
}}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateConnectionTypeModal;
