import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import toast from "react-hot-toast";
import { 
  FiPlus, FiTrash2, FiSave, FiArrowUp, FiArrowDown, 
  FiLayout, FiVideo, FiType, FiLink, FiGrid, FiFeather 
} from "react-icons/fi";

const AdminLandingPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("https://email-syncing-backend.vercel.app/api/landing-page");
        if (res.ok) {
          const data = await res.json();
          setContent(data);
        } else {
          toast.error("Failed to fetch landing page content");
        }
      } catch (err) {
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("usertoken");
      const res = await fetch("https://email-syncing-backend.vercel.app/api/landing-page", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(content)
      });
      if (res.ok) {
        toast.success("Landing page updated successfully");
      } else {
        toast.error("Failed to update landing page");
      }
    } catch (err) {
      toast.error("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, field, value, index = null, subField = null) => {
    setContent(prev => {
      const newContent = { ...prev };
      if (index !== null && subField !== null) {
        newContent[section][field][index][subField] = value;
      } else if (index !== null) {
        // array but no subfield handling if needed
      } else if (field) {
        newContent[section][field] = value;
      } else {
        newContent[section] = value; 
      }
      return newContent;
    });
  };

  const addFeatureCard = () => {
    setContent(prev => ({
      ...prev,
      features: {
        ...prev.features,
        cards: [...prev.features.cards, { iconName: 'FiZap', title: 'New Feature', description: 'Feature description' }]
      }
    }));
  };

  const removeFeatureCard = (index) => {
    setContent(prev => {
      const newCards = [...prev.features.cards];
      newCards.splice(index, 1);
      return { ...prev, features: { ...prev.features, cards: newCards } };
    });
  };

  const moveFeatureCard = (index, direction) => {
    setContent(prev => {
      const newCards = [...prev.features.cards];
      if (direction === -1 && index > 0) {
        [newCards[index - 1], newCards[index]] = [newCards[index], newCards[index - 1]];
      } else if (direction === 1 && index < newCards.length - 1) {
        [newCards[index + 1], newCards[index]] = [newCards[index], newCards[index + 1]];
      }
      return { ...prev, features: { ...prev.features, cards: newCards } };
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 md:ml-64 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-medium text-gray-500 tracking-wide">Loading Content...</div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'general', label: 'General', icon: <FiType /> },
    { id: 'hero', label: 'Hero Section', icon: <FiLayout /> },
    { id: 'features', label: 'Features', icon: <FiGrid /> },
    { id: 'cta', label: 'Call to Action', icon: <FiFeather /> },
    { id: 'footer', label: 'Footer', icon: <FiLink /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 md:ml-64 flex">
      <Sidebar />
      <div className="flex-1 max-w-7xl mx-auto w-full">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Landing Page Content</h1>
            <p className="text-slate-500 text-sm mt-1">Manage public site content and media dynamically.</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
          >
            <FiSave className={saving ? "animate-pulse" : ""} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {content && (
          <div className="p-8 flex flex-col lg:flex-row gap-8 items-start">
            
            <div className="w-full lg:w-64 flex-shrink-0 sticky top-32 space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[600px]">
              
              {activeTab === 'general' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiType className="text-indigo-500" /> General Information
                  </h2>
                  <div className="space-y-6 max-w-2xl">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Website Logo Text</label>
                      <input 
                        type="text" 
                        value={content.logoText} 
                        onChange={e => handleChange('logoText', null, e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        placeholder="e.g. Replex Engine"
                      />
                      <p className="text-xs text-slate-400 mt-2">This appears on the top left of the navigation bar.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hero' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiLayout className="text-indigo-500" /> Hero Section
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Badge Text</label>
                      <input 
                        type="text" 
                        value={content.hero.badge} 
                        onChange={e => handleChange('hero', 'badge', e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Main Title</label>
                      <input 
                        type="text" 
                        value={content.hero.mainTitle} 
                        onChange={e => handleChange('hero', 'mainTitle', e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Highlighted Title</label>
                      <input 
                        type="text" 
                        value={content.hero.highlightedTitle} 
                        onChange={e => handleChange('hero', 'highlightedTitle', e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                        placeholder="Appears in gradient color"
                      />
                    </div>

                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Hero Description</label>
                      <textarea 
                        value={content.hero.description} 
                        onChange={e => handleChange('hero', 'description', e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition h-28 resize-none" 
                      />
                    </div>

                    <div className="col-span-full pt-4 mt-2 border-t border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
                        <FiVideo className="text-indigo-400" /> Media URLs
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Hero Video (WebM/MP4)</label>
                          <input 
                            type="text" 
                            value={content.hero.videoUrl} 
                            onChange={e => handleChange('hero', 'videoUrl', e.target.value)} 
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Demo Video (WebM/MP4)</label>
                          <input 
                            type="text" 
                            value={content.hero.demoVideoUrl} 
                            onChange={e => handleChange('hero', 'demoVideoUrl', e.target.value)} 
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-4xl">
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiGrid className="text-indigo-500" /> Features Section
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Section Title</label>
                      <input 
                        type="text" 
                        value={content.features.title} 
                        onChange={e => handleChange('features', 'title', e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Section Subtitle</label>
                      <input 
                        type="text" 
                        value={content.features.subtitle} 
                        onChange={e => handleChange('features', 'subtitle', e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-base font-semibold text-slate-800">Feature Cards</h3>
                      <button 
                        onClick={addFeatureCard} 
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-sm font-medium text-indigo-600 rounded-lg hover:bg-indigo-50 transition shadow-sm"
                      >
                        <FiPlus /> Add Card
                      </button>
                    </div>

                    <div className="space-y-4">
                      {content.features.cards.map((card, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col md:flex-row gap-5 relative group hover:border-indigo-300 transition-colors shadow-sm">
                          <div className="flex md:flex-col gap-1 items-center justify-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <button onClick={() => moveFeatureCard(idx, -1)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><FiArrowUp size={16} /></button>
                            <button onClick={() => moveFeatureCard(idx, 1)} disabled={idx === content.features.cards.length - 1} className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><FiArrowDown size={16} /></button>
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Icon (React-Icon)</label>
                                <input type="text" value={card.iconName} onChange={e => handleChange('features', 'cards', e.target.value, idx, 'iconName')} className="w-full border border-slate-200 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Title</label>
                                <input type="text" value={card.title} onChange={e => handleChange('features', 'cards', e.target.value, idx, 'title')} className="w-full border border-slate-200 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                              <textarea value={card.description} onChange={e => handleChange('features', 'cards', e.target.value, idx, 'description')} className="w-full border border-slate-200 rounded-md p-2 text-sm h-16 resize-none focus:ring-1 focus:ring-indigo-500" />
                            </div>
                          </div>
                          
                          <button onClick={() => removeFeatureCard(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition">
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cta' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-3xl">
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiFeather className="text-indigo-500" /> Call to Action Section
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                      <input 
                        type="text" 
                        value={content.cta.title} 
                        onChange={e => handleChange('cta', 'title', e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                      <textarea 
                        value={content.cta.description} 
                        onChange={e => handleChange('cta', 'description', e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition h-28 resize-none" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'footer' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-3xl">
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiLink className="text-indigo-500" /> Footer Configuration
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Copyright Text</label>
                      <input 
                        type="text" 
                        value={content.footer.copyrightText} 
                        onChange={e => handleChange('footer', 'copyrightText', e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLandingPage;
