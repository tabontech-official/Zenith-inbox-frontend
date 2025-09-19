import React from 'react';
import Sidebar from '../component/Sidebar';
import { FiPlus, FiMail, FiCheck } from "react-icons/fi"; 
import { HiSortAscending } from "react-icons/hi"; 

const AllScenariosPage = () => {
  return (
        <div className="flex">
<Sidebar/>

      <div className="ml-64 flex-1 min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="flex items-center justify-between p-4 bg-white">
        <h1 className="text-2xl font-normal">All scenarios</h1>
        <button className="px-6 py-3 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
          + Create scenario
        </button>
      </header>

      <main className="container mx-auto p-8">
        <nav className="flex items-center space-x-6 mb-4">
          <span className="relative pb-1 font-semibold text-purple-600 border-b-2 border-purple-600">
            ALL
          </span>
          <span className="relative text-gray-500">
            ACTIVE SCENARIOS <span className="ml-1 text-xs font-semibold px-2 py-0.5 bg-gray-200 rounded-full">0</span>
          </span>
          <span className="relative text-gray-500">
            INACTIVE SCENARIOS <span className="ml-1 text-xs font-semibold px-2 py-0.5 bg-gray-200 rounded-full">0</span>
          </span>
          <span className="relative text-gray-500">
            CONCEPTS <span className="ml-1 text-xs font-semibold px-2 py-0.5 bg-gray-200 rounded-full">0</span>
          </span>
        </nav>

         <div className="flex items-center mb-8">
      <button className="flex items-center px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100">
        <HiSortAscending className="w-4 h-4 mr-2" />
        Sort by: A-Z
      </button>
    </div>

        <div className="flex justify-center text-gray-500 mb-12">
          You haven't created any scenarios yet
        </div>

        <div className="flex justify-center">
          <div className="max-w-xl p-8 text-center bg-white border border-gray-200 rounded-xl shadow-sm">
         <div className="flex justify-center items-center mt-10">
      <div className="relative w-40 h-28 flex justify-center">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-pink-400 text-white shadow-md">
          <FiCheck size={20} />
        </div>

        <div className="absolute bottom-0 left-4 w-16 h-16 flex items-center justify-center rounded-full bg-pink-500 text-white shadow-md">
          <FiPlus size={28} />
        </div>

        <div className="absolute bottom-0 right-4 w-14 h-14 flex items-center justify-center rounded-full bg-purple-600 text-white shadow-md">
          <FiMail size={24} />
        </div>
      </div>
    </div>

            <h2 className="mb-2 text-2xl font-normal mt-4">Create your first Scenario</h2>
            <p className="mb-6 text-sm text-gray-500 leading-relaxed">
              In order for Make to automate your tasks for you, you have to create a scenario. Open the builder to create your first scenario.
            </p>
            <button className="px-6 py-3 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
              Open Scenario Builder
            </button>
          </div>
        </div>
      </main>
    </div>
    </div>
  );
};

export default AllScenariosPage;