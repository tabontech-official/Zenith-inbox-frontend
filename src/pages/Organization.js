import React, { useState } from "react";
import Sidebar from "../component/Sidebar";
import { Link } from "react-router-dom";

const Organization = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dummy tab renderer
  const renderTab = (id, label) => (
    <button className="px-3 py-1 text-gray-600 hover:text-purple-600">{label}</button>
  );

  return (
    <div className="flex bg-gray-100 min-h-screen font-inter antialiased">
      {/* Mobile menu toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-6 overflow-auto">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 pb-6 border-b border-gray-300">
          <h1 className="text-2xl font-semibold text-gray-800">My Organization</h1>
          <div className="flex items-center space-x-4">
                                <Link to="/scenarios/add">
            
            <button className="flex items-center space-x-2 bg-purple-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-purple-700 transition-colors duration-200">
              <span>+ Create scenario</span>
            </button>
            </Link>
          </div>
        </header>

        {/* Example Tabs */}
        <section className="pt-6">
          <div className="flex items-center space-x-8 mb-6 text-sm text-gray-500">
            {renderTab("org", "ORGANIZATION")}
            {renderTab("teams", "TEAMS")}
            {renderTab("users", "USERS")}
            {renderTab("subs", "SUBSCRIPTION")}
          </div>

          {/* Example Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">Card 1</div>
            <div className="bg-white rounded-lg shadow-sm p-6">Card 2</div>
            <div className="bg-white rounded-lg shadow-sm p-6">Card 3</div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Organization;
