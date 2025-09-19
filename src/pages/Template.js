import React, { useState } from 'react';
import Sidebar from '../component/Sidebar';
import { Link } from 'react-router-dom';

// A reusable component to display a list of templates
const TemplateList = ({ templates, onToggleStatus }) => (
  <div className="space-y-4">
    {templates.length > 0 ? (
      templates.map((template) => (
        <div 
          key={template.id} 
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-lg font-medium text-gray-800">{template.name}</div>
          <button
            onClick={() => onToggleStatus(template.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
              template.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {template.active ? 'Active' : 'Inactive'}
          </button>
        </div>
      ))
    ) : (
      <div className="text-center py-12 text-gray-500 text-lg">
        No templates found.
      </div>
    )}
  </div>
);

const Template = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  
  const shopifyTemplates = [
    { id: 1, name: 'Shopify Template 1', active: false },
    { id: 2, name: 'Shopify Template 2', active: false },
    { id: 3, name: 'Shopify Template 3', active: false },
  ];

  const otherTemplates = [
    { id: 1, name: 'Custom Template 1', active: false },
    { id: 2, name: 'Custom Template 2', active: false },
    { id: 3, name: 'Custom Template 3', active: false },
  ];

  const [shopifyTemplateState, setShopifyTemplateState] = useState(shopifyTemplates);
  const [otherTemplateState, setOtherTemplateState] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const toggleTemplateStatus = (templateId) => {
    const updateTemplates = (templates) =>
      templates.map((template) =>
        template.id === templateId
          ? { ...template, active: !template.active }
          : template
      );
    
    if (selectedPlatform === 'shopify') {
      setShopifyTemplateState(updateTemplates(shopifyTemplateState));
    } else if (selectedPlatform === 'other') {
      setOtherTemplateState(updateTemplates(otherTemplateState));
    }
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return; 

    // Find the full template object from the "otherTemplates" array
    const newTemplateData = otherTemplates.find(t => t.name === selectedTemplate);

    if (newTemplateData) {
      // Check if the template is already in the state to avoid duplicates
      const isAlreadyAdded = otherTemplateState.some(t => t.name === newTemplateData.name);
      if (!isAlreadyAdded) {
        const newTemplate = { ...newTemplateData, id: otherTemplateState.length + 1 };
        setOtherTemplateState([...otherTemplateState, newTemplate]);
      }
    }

    setIsModalOpen(false); 
    setSelectedTemplate(''); 
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 min-h-screen bg-gray-100 font-sans text-gray-800 lg:ml-64">
        {/* Header Section */}
        <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">Templates</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full sm:w-64 px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </header>

        <main className="container mx-auto p-8">
          {/* Platform Selection */}
          <div className="flex items-center gap-4 mb-8">
            <label className="text-lg font-semibold text-gray-700">Select Platform:</label>
            <div className="relative">
              <select 
                onChange={(e) => {
                  setSelectedPlatform(e.target.value);
                  // Reset template state when switching platforms if needed
                  // setShopifyTemplateState(shopifyTemplates);
                  // setOtherTemplateState([]);
                }} 
                value={selectedPlatform}
                className="block appearance-none w-full bg-white border border-gray-300 rounded-md py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              >
                <option value="">-- Choose a platform --</option>
                <option value="shopify">Shopify</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <hr className="my-8 border-gray-200" />

          {/* Template Display Section */}
          {selectedPlatform && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {selectedPlatform === 'shopify' ? 'Shopify Templates' : 'Custom Templates'}
                </h2>
                {selectedPlatform === 'other' && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Template
                  </button>
                )}
              </div>
              
              <TemplateList 
                templates={selectedPlatform === 'shopify' ? shopifyTemplateState : otherTemplateState} 
                onToggleStatus={toggleTemplateStatus}
              />
            </div>
          )}

          {/* Modal for adding a new template */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Add Custom Template</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-2">Select a template:</label>
                  <select
                    id="template-select"
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    value={selectedTemplate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">-- Select Template --</option>
                    {otherTemplates.map((template) => (
                      <option key={template.id} value={template.name}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Template;