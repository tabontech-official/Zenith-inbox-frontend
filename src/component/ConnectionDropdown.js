// src/component/ConnectionDropdown.jsx
import React, { useState } from "react";
import { FaGoogle, FaMicrosoft, FaEnvelope } from "react-icons/fa";

const ConnectionDropdown = ({ connections, provider, selected, setSelected, multiple }) => {
  const [show, setShow] = useState(false);

  const handleSelect = (connId) => {
    if (multiple) {
      setSelected((prev) =>
        prev.includes(connId) ? prev.filter((id) => id !== connId) : [...prev, connId]
      );
    } else {
      setSelected([connId]);
      setShow(false);
    }
  };

  return (
    <div className="relative w-full mb-4">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="w-full flex justify-between items-center border rounded px-3 py-2 text-sm bg-white shadow-sm"
      >
        {selected.length > 0 ? (
          <span className="flex flex-wrap gap-2">
            {selected.map((id) => {
              const conn = connections.find((c) => c._id === id);
              if (!conn) return null;
              return (
                <span
                  key={id}
                  className="flex items-center px-2 py-1 bg-purple-100 rounded text-xs"
                >
                  {conn.provider === "gmail" && <FaGoogle className="text-red-500 mr-1" />}
                  {conn.provider === "outlook" && <FaMicrosoft className="text-blue-600 mr-1" />}
                  {conn.provider === "smtp" && <FaEnvelope className="text-gray-600 mr-1" />}
                  {conn.provider.toUpperCase()}: {conn.email || conn.name}
                </span>
              );
            })}
          </span>
        ) : (
          `Select ${provider} Connection${multiple ? "s" : ""}`
        )}
        <span>▾</span>
      </button>

      {show && (
        <ul className="absolute z-10 mt-1 w-full border rounded bg-white shadow-lg max-h-60 overflow-y-auto">
          {connections
            .filter((conn) => {
              if (provider === "gmail") return conn.provider === "gmail";
              if (provider === "outlook") return conn.provider === "outlook";
              if (provider === "email") return conn.provider === "smtp" || conn.provider === "outlook";
              return false;
            })
            .map((conn) => {
              const isSelected = selected.includes(conn._id);
              return (
                <li
                  key={conn._id}
                  onClick={() => handleSelect(conn._id)}
                  className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm ${
                    isSelected ? "bg-purple-100" : ""
                  }`}
                >
                  {conn.provider === "gmail" && <FaGoogle className="text-red-500 mr-2" />}
                  {conn.provider === "outlook" && <FaMicrosoft className="text-blue-600 mr-2" />}
                  {conn.provider === "smtp" && <FaEnvelope className="text-gray-600 mr-2" />}
                  {conn.provider.toUpperCase()}: {conn.email || conn.name}
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};

export default ConnectionDropdown;
