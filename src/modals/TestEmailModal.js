import React from "react";
import { FiX, FiMail, FiUser, FiGlobe, FiTag, FiDollarSign, FiClipboard } from "react-icons/fi";
import useModalDismiss from "../hooks/useModalDismiss";

const TestEmailModal = ({ email, onClose }) => {
  /* A preview of the test email — read-only, so it always closes. */
  const dismiss = useModalDismiss({ onClose });

  if (!email) return null;

  // Classy color palette: Deep Navy/Charcoal for background, soft white/cream for content,
  // a subtle gold/bronze for highlights.
  const accentColor = "text-amber-600"; // Subtle highlight color

  // Data structure for easy mapping and icon assignment
  const emailFields = [
    { label: "Name", value: email.fullName, icon: FiUser },
    { label: "Email", value: email.businessEmail, icon: FiMail },
    { label: "Store", value: email.storeName, icon: FiTag },
    { label: "Country", value: email.country, icon: FiGlobe },
    { label: "Service", value: email.service, icon: FiClipboard },
    { label: "Budget", value: email.budget, icon: FiDollarSign },
    { label: "Type", value: email.Emailtype, icon: FiMail },
  ];

  return (
    // Backdrop: Darker, more atmospheric
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      {...dismiss.backdropProps}
    >
      
      {/* Modal Container: Higher contrast, rounded corners, subtle shadow, wider for better flow */}
      <div className="bg-white p-8 md:p-10 rounded-2xl w-full max-w-lg shadow-2xl relative transform transition-all duration-300 scale-100 opacity-100">
        
        {/* Close Button: Discreet yet prominent, using the accent color on hover */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition duration-150 p-1 rounded-full"
          aria-label="Close"
        >
          <FiX size={24} />
        </button>

        {/* Header Section */}
        <header className="border-b pb-4 mb-6 border-gray-200">
          <h2 className="text-2xl font-serif font-bold text-gray-800 flex items-center">
            <FiMail className={`mr-2 ${accentColor}`} size={24} />
            Latest Test Email
          </h2>
          <p className="text-sm text-gray-500 mt-1">Detailed view of the received test submission.</p>
        </header>

        {/* Content Grid: Cleaner layout for key information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {emailFields.map((field, index) => (
            <div key={index} className="flex flex-col">
              <span className="text-xs uppercase font-medium text-gray-500 flex items-center mb-1">
                <field.icon className={`mr-1 ${accentColor}`} size={14} />
                {field.label}
              </span>
              <p className="text-base text-gray-800 font-semibold truncate" title={field.value}>
                {field.value}
              </p>
            </div>
          ))}
        </div>

        {/* Description Section: Separated for better readability */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <span className="text-xs uppercase font-medium text-gray-500 flex items-center mb-2">
            <FiClipboard className={`mr-1 ${accentColor}`} size={14} />
            Description / Request
          </span>
          {/* Use pre-wrap to respect original formatting like line breaks */}
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
            {email.helpDescription || "No description provided."}
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default TestEmailModal;
