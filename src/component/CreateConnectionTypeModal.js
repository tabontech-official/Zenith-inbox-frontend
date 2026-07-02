import React, { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";

const CreateConnectionTypeModal = ({ isOpen, onClose, onSelectType }) => {
  const [step, setStep] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  // Step 2 states
  const [connectionName, setConnectionName] = useState("My Others (IMAP) connection");
  const [provider, setProvider] = useState("");
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const resetStateAndClose = () => {
    setStep(1);
    setSelectedType("");
    setProvider("");
    setUsername("");
    setPassword("");
    onClose();
  };

  const handleSelect = (type) => {
    setSelectedType(type);
    setShowDropdown(false);
    if (type === "Others (IMAP)") {
      setStep(2);
    } else {
      setStep(1);
      onSelectType(type);
    }
  };

  const handleProviderSelect = (prov) => {
    setProvider(prov);
    setShowProviderDropdown(false);
    
    if (prov === "Outlook.com") {
      setStep(1);
      onSelectType("Microsoft SMTP/IMAP OAuth");
    } else if (prov === "Other") {
      setStep(1);
      onSelectType("Others (IMAP)");
    }
  };

  const options = [
    "Others (IMAP)",
    "Google Restricted",
    "Microsoft SMTP/IMAP OAuth"
  ];

  const providerOptions = [
    "Hotmail",
    "Outlook.com",
    "Seznam.cz",
    "Yandex",
    "Zoho Mail",
    "Other"
  ];

  const needsCredentials = ["Hotmail", "Seznam.cz", "Yandex", "Zoho Mail"].includes(provider);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={resetStateAndClose}></div>
      <div className="absolute top-0 left-[calc(100%+30px)] z-50 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-[420px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-500">
          <h2 className="font-bold text-xl text-[#1a1c29]">Create a connection</h2>
          <button onClick={resetStateAndClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <IoCloseOutline className="text-2xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 pb-8">
          {step === 1 ? (
            <div className="relative mb-24">
              <label className="block text-[15px] font-semibold text-[#2d3748] mb-3 flex items-center gap-2">
                <span className="bg-[#f0f2f5] text-gray-500 rounded flex items-center justify-center w-6 h-6">
                  <FiChevronRight className="text-xs" />
                </span>
                Connection type <span className="text-red-500">*</span>
              </label>
              <div 
                className={`flex items-center justify-between bg-white border px-4 py-3 rounded-lg cursor-pointer transition-colors ${showDropdown ? 'border-[#8b5cf6] ring-1 ring-[#8b5cf6]' : 'border-gray-300 hover:border-gray-400'}`}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="text-[15px] text-[#2d3748]">{selectedType || "Select..."}</span>
                <FiChevronDown className={`text-gray-500 text-lg transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </div>

              {showDropdown && (
                <ul className="absolute left-0 right-0 z-50 mt-1 bg-white border border-[#8b5cf6] rounded-lg shadow-lg overflow-hidden">
                  {options.map((option, index) => (
                    <li
                      key={index}
                      className={`px-4 py-3 text-[15px] text-[#2d3748] cursor-pointer hover:bg-[#f8f9fa] transition-colors ${index !== options.length - 1 ? 'border-b border-gray-100' : ''}`}
                      onClick={() => handleSelect(option)}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Connection Name */}
              <div>
                <label className="block text-[15px] font-semibold text-[#2d3748] mb-3 flex items-center gap-2">
                  <span className="bg-[#f0f2f5] text-gray-500 rounded flex items-center justify-center w-6 h-6">
                    <FiChevronRight className="text-xs" />
                  </span>
                  Connection name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                  className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] outline-none px-4 py-3 rounded-lg text-[15px] text-[#2d3748] transition-colors"
                />
              </div>

              {/* Email Provider */}
              <div className="relative">
                <label className="block text-[15px] font-semibold text-[#2d3748] mb-3 flex items-center gap-2">
                  <span className="bg-[#f0f2f5] text-gray-500 rounded flex items-center justify-center w-6 h-6">
                    <FiChevronRight className="text-xs" />
                  </span>
                  Email provider <span className="text-red-500">*</span>
                </label>
                <div 
                  className={`flex items-center justify-between bg-white border px-4 py-3 rounded-lg cursor-pointer transition-colors ${showProviderDropdown ? 'border-[#8b5cf6] ring-1 ring-[#8b5cf6]' : 'border-gray-300 hover:border-gray-400'}`}
                  onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                >
                  <span className="text-[15px] text-[#2d3748]">{provider || "Select..."}</span>
                  <FiChevronDown className={`text-gray-500 text-lg transition-transform ${showProviderDropdown ? 'rotate-180' : ''}`} />
                </div>

                {showProviderDropdown && (
                  <ul className="absolute left-0 right-0 z-50 mt-1 bg-white border border-[#8b5cf6] rounded-lg shadow-lg overflow-hidden">
                    {providerOptions.map((option, index) => (
                      <li
                        key={index}
                        className={`px-4 py-3 text-[15px] text-[#2d3748] cursor-pointer hover:bg-[#f8f9fa] transition-colors ${index !== providerOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
                        onClick={() => handleProviderSelect(option)}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Credentials Fields */}
              {needsCredentials && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[14px] font-medium text-gray-700 mb-1">Username</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Email address"
                      className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] outline-none px-4 py-2 rounded-lg text-[14px] text-[#2d3748]"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-gray-700 mb-1">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password or App Password"
                      className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] outline-none px-4 py-2 rounded-lg text-[14px] text-[#2d3748]"
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button 
                      className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2 rounded-lg font-medium transition-colors"
                      onClick={() => {
                        // TODO: Implement save logic or emit save event
                        resetStateAndClose();
                      }}
                    >
                      Save
                    </button>
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
