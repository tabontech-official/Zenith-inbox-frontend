import React, { useContext, useState, useEffect } from "react";
import {
  FiBriefcase,
  FiGlobe,
  FiMail,
  FiPhone,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiSave,
  FiCheckCircle,
  FiLayers,
  FiPackage,
  FiFolder,
  FiHelpCircle,
  FiShield,
  FiClock,
  FiFeather,
  FiBookOpen,
  FiLinkedin,
  FiTwitter,
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiZap,
  FiUploadCloud,
} from "react-icons/fi";
import { UserContext } from "../component/UserContext";
import Sidebar from "../component/Sidebar";
import toast from "react-hot-toast";
import FillWithAiModal from "../modals/FillWithAiModal";
import ImportJsonModal from "../modals/ImportJsonModal";
import { sanitizeCompanyObject, sanitizeUrl, sanitizeEmail } from "../utils/companyProfileSchema";

const API_BASE_URL = "https://email-syncing-backend.vercel.app/api/company-profile";

const CompanyProfile = () => {
  const { user } = useContext(UserContext);
  const userId = localStorage.getItem("userid") || user?._id;

  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [company, setCompany] = useState({
    companyName: "",
    businessDescription: "",
    industry: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    socialLinks: { linkedin: "", twitter: "", facebook: "", instagram: "", youtube: "" },
  });

  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [faqs, setFaqs] = useState([]);

  const [policies, setPolicies] = useState({
    returnPolicy: "",
    refundPolicy: "",
    shippingPolicy: "",
    privacyPolicy: "",
    termsAndConditions: "",
    customPolicies: [],
  });

  const [timelines, setTimelines] = useState({
    deliveryTime: "",
    projectTimeline: "",
    supportHours: "",
    businessWorkingHours: "",
  });

  const [writingStyle, setWritingStyle] = useState({
    toneOfVoice: "",
    brandPersonality: "",
    communicationStyle: "",
    preferredLanguage: "English",
    wordsToAvoid: "",
    exampleResponses: "",
  });

  const [companyKnowledge, setCompanyKnowledge] = useState("");

  // Modal State
  const [showFillWithAiModal, setShowFillWithAiModal] = useState(false);
  const [showImportJsonModal, setShowImportJsonModal] = useState(false);

  // Handle JSON Import Data Population
  const handleImportSuccess = (data) => {
    if (data.company) setCompany((prev) => sanitizeCompanyObject({ ...prev, ...data.company }));
    if (data.services) setServices(data.services);
    if (data.products) setProducts(data.products);
    if (data.portfolio) setPortfolio(data.portfolio);
    if (data.faqs) setFaqs(data.faqs);
    if (data.policies) setPolicies((prev) => ({ ...prev, ...data.policies }));
    if (data.timelines) setTimelines((prev) => ({ ...prev, ...data.timelines }));
    if (data.writingStyle) setWritingStyle((prev) => ({ ...prev, ...data.writingStyle }));
    if (data.companyKnowledge) setCompanyKnowledge(data.companyKnowledge);
  };

  // Fetch Existing Company Profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/${userId}`);
        const result = await response.json();

        if (result.success && result.data) {
          const d = result.data;
          if (d.company) setCompany((prev) => sanitizeCompanyObject({ ...prev, ...d.company }));
          if (d.services) setServices(d.services);
          if (d.products) setProducts(d.products);
          if (d.portfolio) setPortfolio(d.portfolio);
          if (d.faqs) setFaqs(d.faqs);
          if (d.policies) setPolicies((prev) => ({ ...prev, ...d.policies }));
          if (d.timelines) setTimelines((prev) => ({ ...prev, ...d.timelines }));
          if (d.writingStyle) setWritingStyle((prev) => ({ ...prev, ...d.writingStyle }));
          if (d.companyKnowledge) setCompanyKnowledge(d.companyKnowledge);
        }
      } catch (err) {
        console.warn("Company profile not found or could not be loaded, using defaults:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Handle Save
  const handleSave = async () => {
    if (!userId) {
      toast.error("User session invalid. Please log in again.");
      return;
    }

    setSaving(true);
    const payload = {
      company,
      services,
      products,
      portfolio,
      faqs,
      policies,
      timelines,
      writingStyle,
      companyKnowledge,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Company Profile saved successfully!");
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Error saving company profile:", err);
      toast.error(err.message || "Failed to save company profile.");
    } finally {
      setSaving(false);
    }
  };

  // Helper List Adders
  const addService = () => {
    setServices([...services, { id: Date.now().toString(), name: "", description: "" }]);
  };

  const addProduct = () => {
    setProducts([...products, { id: Date.now().toString(), name: "", description: "", features: "" }]);
  };

  const addPortfolio = () => {
    setPortfolio([...portfolio, { id: Date.now().toString(), projectName: "", description: "", links: "" }]);
  };

  const addFaq = () => {
    setFaqs([...faqs, { id: Date.now().toString(), question: "", answer: "" }]);
  };

  const addCustomPolicy = () => {
    setPolicies({
      ...policies,
      customPolicies: [
        ...(policies.customPolicies || []),
        { id: Date.now().toString(), name: "", details: "" },
      ],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-inter text-gray-500 text-sm">
        <div className="animate-pulse flex items-center gap-2">
          <FiBriefcase className="w-5 h-5 text-indigo-600 animate-spin" />
          <span>Loading Company Profile...</span>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "company", label: "Company Info", icon: FiBriefcase },
    { id: "services", label: "Services", icon: FiLayers },
    { id: "products", label: "Products", icon: FiPackage },
    { id: "portfolio", label: "Portfolio", icon: FiFolder },
    { id: "faqs", label: "FAQs", icon: FiHelpCircle },
    { id: "policies", label: "Policies", icon: FiShield },
    { id: "timelines", label: "Timelines", icon: FiClock },
    { id: "writingStyle", label: "Writing Style", icon: FiFeather },
    { id: "knowledge", label: "Company Knowledge", icon: FiBookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-inter text-gray-900">
      <Sidebar />

      <main className="min-h-screen pt-[60px]">
        {/* System status bar (Identical to Dashboard) */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex min-h-[30px] items-center justify-between gap-4 px-6 text-[11px] text-gray-500">
            <div className="flex min-w-0 items-center divide-x divide-gray-200">
              <div className="flex items-center gap-1.5 pr-4 font-medium text-green-700">
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute h-3 w-3 rounded-full bg-green-200" />
                  <span className="relative h-2 w-2 rounded-full bg-green-500" />
                </span>
                <span>Knowledge Base active</span>
              </div>

              <div className="hidden px-4 sm:block">
                {company.companyName || "My Company Profile"}
              </div>

              <div className="hidden px-4 md:block">
                {services.length} Services · {products.length} Products · {faqs.length} FAQs
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="shrink-0 font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        {/* Page Content Container (Identical to Dashboard) */}
        <div className="px-5 py-7 sm:px-7 lg:px-10">
          {/* Header section */}
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.035em] text-gray-900">
                Company Profile
              </h1>
              <p className="mt-1 text-[13px] text-gray-500">
                Manage your business details, products, services, policies, and AI knowledge base.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFillWithAiModal(true)}
                className="h-9 rounded-[8px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 text-[12px] font-semibold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <FiZap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Fill with AI</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImportJsonModal(true)}
                className="h-9 rounded-[8px] bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 px-3 text-[12px] font-semibold transition-all flex items-center gap-1.5"
              >
                <FiUploadCloud className="w-3.5 h-3.5 text-gray-600" />
                <span>Import JSON</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="h-9 rounded-[8px] bg-[#111110] px-4 text-[12px] font-semibold text-white shadow-sm transition hover:bg-black flex items-center gap-2"
              >
                {saving ? (
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <FiSave className="w-4 h-4 text-emerald-400" />
                )}
                <span>{saving ? "Saving..." : "Save Profile"}</span>
              </button>
            </div>
          </div>

          {/* Top Summary Stat Cards (Identical to Dashboard Cards) */}
          <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="min-h-[100px] rounded-[18px] border border-gray-200 bg-white px-5 py-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-gray-500">Services Offered</span>
                <div className="p-2.5 rounded-full bg-indigo-50 text-indigo-600">
                  <FiLayers className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-2 text-[22px] font-semibold text-gray-900">{services.length}</p>
            </div>

            <div className="min-h-[100px] rounded-[18px] border border-gray-200 bg-white px-5 py-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-gray-500">Products Catalog</span>
                <div className="p-2.5 rounded-full bg-green-50 text-green-600">
                  <FiPackage className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-2 text-[22px] font-semibold text-gray-900">{products.length}</p>
            </div>

            <div className="min-h-[100px] rounded-[18px] border border-gray-200 bg-white px-5 py-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-gray-500">Active FAQs</span>
                <div className="p-2.5 rounded-full bg-yellow-50 text-yellow-600">
                  <FiHelpCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-2 text-[22px] font-semibold text-gray-900">{faqs.length}</p>
            </div>

            <div className="min-h-[100px] rounded-[18px] border border-gray-200 bg-white px-5 py-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-gray-500">Knowledge Base</span>
                <div className="p-2.5 rounded-full bg-purple-50 text-purple-600">
                  <FiBookOpen className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-2 text-[22px] font-semibold text-gray-900">{companyKnowledge.length} chars</p>
            </div>
          </section>

          {/* Section Navigation Tabs */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-gray-200">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex h-9 items-center gap-2 rounded-[8px] px-4 text-[13px] font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-gray-100 text-black font-semibold"
                      : "text-zinc-600 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-zinc-500"}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: COMPANY INFO */}
          {activeTab === "company" && (
            <div className="rounded-[18px] border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-[15px] font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <FiBriefcase className="w-4 h-4 text-indigo-600" />
                General Company Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={company.companyName}
                    onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
                    placeholder="e.g. Acme Tech Solutions"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={company.industry}
                    onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                    placeholder="e.g. E-Commerce / Software Automation"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Business Description</label>
                  <textarea
                    rows={3}
                    value={company.businessDescription}
                    onChange={(e) => setCompany({ ...company, businessDescription: e.target.value })}
                    placeholder="Brief description of what your business does..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={company.website}
                    onChange={(e) => setCompany({ ...company, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={company.email}
                    onChange={(e) => setCompany({ ...company, email: e.target.value })}
                    placeholder="support@example.com"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={company.phone}
                    onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={company.address}
                    onChange={(e) => setCompany({ ...company, address: e.target.value })}
                    placeholder="123 Innovation Way, Suite 100, New York, NY"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-900 mb-3">Social Media Profiles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-[10px] border border-gray-200">
                    <FiLinkedin className="w-4 h-4 text-blue-600 shrink-0" />
                    <input
                      type="text"
                      value={company.socialLinks?.linkedin || ""}
                      onChange={(e) =>
                        setCompany({
                          ...company,
                          socialLinks: { ...company.socialLinks, linkedin: e.target.value },
                        })
                      }
                      placeholder="LinkedIn URL"
                      className="w-full bg-transparent text-xs text-gray-800 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-[10px] border border-gray-200">
                    <FiTwitter className="w-4 h-4 text-sky-500 shrink-0" />
                    <input
                      type="text"
                      value={company.socialLinks?.twitter || ""}
                      onChange={(e) =>
                        setCompany({
                          ...company,
                          socialLinks: { ...company.socialLinks, twitter: e.target.value },
                        })
                      }
                      placeholder="Twitter / X URL"
                      className="w-full bg-transparent text-xs text-gray-800 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-[10px] border border-gray-200">
                    <FiFacebook className="w-4 h-4 text-blue-700 shrink-0" />
                    <input
                      type="text"
                      value={company.socialLinks?.facebook || ""}
                      onChange={(e) =>
                        setCompany({
                          ...company,
                          socialLinks: { ...company.socialLinks, facebook: e.target.value },
                        })
                      }
                      placeholder="Facebook URL"
                      className="w-full bg-transparent text-xs text-gray-800 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-[10px] border border-gray-200">
                    <FiInstagram className="w-4 h-4 text-pink-600 shrink-0" />
                    <input
                      type="text"
                      value={company.socialLinks?.instagram || ""}
                      onChange={(e) =>
                        setCompany({
                          ...company,
                          socialLinks: { ...company.socialLinks, instagram: e.target.value },
                        })
                      }
                      placeholder="Instagram URL"
                      className="w-full bg-transparent text-xs text-gray-800 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-[10px] border border-gray-200">
                    <FiYoutube className="w-4 h-4 text-red-600 shrink-0" />
                    <input
                      type="text"
                      value={company.socialLinks?.youtube || ""}
                      onChange={(e) =>
                        setCompany({
                          ...company,
                          socialLinks: { ...company.socialLinks, youtube: e.target.value },
                        })
                      }
                      placeholder="YouTube Channel URL"
                      className="w-full bg-transparent text-xs text-gray-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICES */}
          {activeTab === "services" && (
            <div className="rounded-[18px] border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                  <FiLayers className="w-4 h-4 text-indigo-600" />
                  Services Offered ({services.length})
                </h2>
                <button
                  type="button"
                  onClick={addService}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-[8px] text-xs font-semibold transition-all"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  Add Service
                </button>
              </div>

              {services.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-[12px]">
                  <FiLayers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No services added yet.</p>
                  <button onClick={addService} className="mt-2 text-xs text-indigo-600 font-semibold hover:underline">
                    + Add your first service
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 bg-gray-50 rounded-[12px] border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-gray-400">Service #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setServices(services.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Service Name</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...services];
                              updated[idx].name = e.target.value;
                              setServices(updated);
                            }}
                            placeholder="Service Name"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[8px] text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Service Details & Description</label>
                          <textarea
                            rows={3}
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...services];
                              updated[idx].description = e.target.value;
                              setServices(updated);
                            }}
                            placeholder="Service details & deliverables..."
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[8px] text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRODUCTS */}
          {activeTab === "products" && (
            <div className="rounded-[18px] border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                  <FiPackage className="w-4 h-4 text-indigo-600" />
                  Products Catalog ({products.length})
                </h2>
                <button
                  type="button"
                  onClick={addProduct}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-[8px] text-xs font-semibold transition-all"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  Add Product
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-[12px]">
                  <FiPackage className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No products added yet.</p>
                  <button onClick={addProduct} className="mt-2 text-xs text-indigo-600 font-semibold hover:underline">
                    + Add your first product
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 bg-gray-50 rounded-[12px] border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-gray-400">Product #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setProducts(products.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Product Name</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...products];
                              updated[idx].name = e.target.value;
                              setProducts(updated);
                            }}
                            placeholder="Product Name"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[8px] text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Product Description</label>
                          <textarea
                            rows={3}
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...products];
                              updated[idx].description = e.target.value;
                              setProducts(updated);
                            }}
                            placeholder="Product Description..."
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[8px] text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PORTFOLIO */}
          {activeTab === "portfolio" && (
            <div className="rounded-[18px] border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                  <FiFolder className="w-4 h-4 text-indigo-600" />
                  Portfolio & Case Studies ({portfolio.length})
                </h2>
                <button
                  type="button"
                  onClick={addPortfolio}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-[8px] text-xs font-semibold transition-all"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  Add Project
                </button>
              </div>

              {portfolio.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-[12px]">
                  <FiFolder className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No portfolio projects added yet.</p>
                  <button onClick={addPortfolio} className="mt-2 text-xs text-indigo-600 font-semibold hover:underline">
                    + Add your first project
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolio.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 bg-gray-50 rounded-[12px] border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-gray-400">Project #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setPortfolio(portfolio.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Project Name</label>
                            <input
                              type="text"
                              value={item.projectName}
                              onChange={(e) => {
                                const updated = [...portfolio];
                                updated[idx].projectName = e.target.value;
                                setPortfolio(updated);
                              }}
                              placeholder="Project Name"
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[8px] text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Project Link</label>
                            <input
                              type="text"
                              value={item.links}
                              onChange={(e) => {
                                const updated = [...portfolio];
                                updated[idx].links = e.target.value;
                                setPortfolio(updated);
                              }}
                              placeholder="Project Link (e.g. https://...)"
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[8px] text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            rows={3}
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...portfolio];
                              updated[idx].description = e.target.value;
                              setPortfolio(updated);
                            }}
                            placeholder="Project Description..."
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[8px] text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FAQS */}
          {activeTab === "faqs" && (
            <div className="rounded-[18px] border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                  <FiHelpCircle className="w-4 h-4 text-indigo-600" />
                  Frequently Asked Questions ({faqs.length})
                </h2>
                <button
                  type="button"
                  onClick={addFaq}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-[8px] text-xs font-semibold transition-all"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  Add FAQ
                </button>
              </div>

              {faqs.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-[12px]">
                  <FiHelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No FAQs added yet.</p>
                  <button onClick={addFaq} className="mt-2 text-xs text-indigo-600 font-semibold hover:underline">
                    + Add your first FAQ
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 bg-gray-50 rounded-[12px] border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-gray-400">FAQ #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => {
                            const updated = [...faqs];
                            updated[idx].question = e.target.value;
                            setFaqs(updated);
                          }}
                          placeholder="Question (e.g. What are your turnaround times?)"
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-[8px] text-xs font-medium text-gray-800"
                        />
                        <textarea
                          rows={2}
                          value={item.answer}
                          onChange={(e) => {
                            const updated = [...faqs];
                            updated[idx].answer = e.target.value;
                            setFaqs(updated);
                          }}
                          placeholder="Answer details..."
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-[8px] text-xs text-gray-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: POLICIES */}
          {activeTab === "policies" && (
            <div className="rounded-[18px] border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-[15px] font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <FiShield className="w-4 h-4 text-indigo-600" />
                Company Policies & Terms
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Return Policy</label>
                  <textarea
                    rows={3}
                    value={policies.returnPolicy}
                    onChange={(e) => setPolicies({ ...policies, returnPolicy: e.target.value })}
                    placeholder="Details about returns..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Refund Policy</label>
                  <textarea
                    rows={3}
                    value={policies.refundPolicy}
                    onChange={(e) => setPolicies({ ...policies, refundPolicy: e.target.value })}
                    placeholder="Details about refunds..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Shipping Policy</label>
                  <textarea
                    rows={3}
                    value={policies.shippingPolicy}
                    onChange={(e) => setPolicies({ ...policies, shippingPolicy: e.target.value })}
                    placeholder="Shipping methods & dispatch windows..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Privacy Policy Highlights</label>
                  <textarea
                    rows={3}
                    value={policies.privacyPolicy}
                    onChange={(e) => setPolicies({ ...policies, privacyPolicy: e.target.value })}
                    placeholder="Key data privacy points..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Terms & Conditions Summary</label>
                  <textarea
                    rows={3}
                    value={policies.termsAndConditions}
                    onChange={(e) => setPolicies({ ...policies, termsAndConditions: e.target.value })}
                    placeholder="Terms of service, warranties, liabilities..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>
              </div>

              {/* Custom Policies */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-900">Custom Policies</h3>
                  <button
                    type="button"
                    onClick={addCustomPolicy}
                    className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-[8px] text-xs font-semibold"
                  >
                    <FiPlus className="w-3.5 h-3.5" />
                    Add Policy
                  </button>
                </div>

                {policies.customPolicies?.map((cp, idx) => (
                  <div key={cp.id || idx} className="p-3 bg-gray-50 rounded-[12px] border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={cp.name}
                        onChange={(e) => {
                          const updated = [...policies.customPolicies];
                          updated[idx].name = e.target.value;
                          setPolicies({ ...policies, customPolicies: updated });
                        }}
                        placeholder="Policy Name (e.g. SLA Guarantee)"
                        className="px-3 py-1 bg-white border border-gray-200 rounded-[8px] text-xs font-medium text-gray-800 w-1/2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = policies.customPolicies.filter((_, i) => i !== idx);
                          setPolicies({ ...policies, customPolicies: updated });
                        }}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={cp.details}
                      onChange={(e) => {
                        const updated = [...policies.customPolicies];
                        updated[idx].details = e.target.value;
                        setPolicies({ ...policies, customPolicies: updated });
                      }}
                      placeholder="Policy details..."
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-[8px] text-xs text-gray-800"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: TIMELINES */}
          {activeTab === "timelines" && (
            <div className="rounded-[18px] border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-[15px] font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <FiClock className="w-4 h-4 text-indigo-600" />
                Turnaround Timelines & Support Hours
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Time</label>
                  <input
                    type="text"
                    value={timelines.deliveryTime}
                    onChange={(e) => setTimelines({ ...timelines, deliveryTime: e.target.value })}
                    placeholder="e.g. 2-4 business days"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Project Milestone Timeline</label>
                  <input
                    type="text"
                    value={timelines.projectTimeline}
                    onChange={(e) => setTimelines({ ...timelines, projectTimeline: e.target.value })}
                    placeholder="e.g. Discovery: 1 week, Build: 2 weeks"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Support Hours / Response SLA</label>
                  <input
                    type="text"
                    value={timelines.supportHours}
                    onChange={(e) => setTimelines({ ...timelines, supportHours: e.target.value })}
                    placeholder="e.g. Response within 2 hours (Mon-Fri)"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Business Working Hours</label>
                  <input
                    type="text"
                    value={timelines.businessWorkingHours}
                    onChange={(e) => setTimelines({ ...timelines, businessWorkingHours: e.target.value })}
                    placeholder="e.g. Mon - Fri: 9:00 AM - 6:00 PM EST"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: WRITING STYLE */}
          {activeTab === "writingStyle" && (
            <div className="rounded-[18px] border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-[15px] font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <FiFeather className="w-4 h-4 text-indigo-600" />
                Brand Voice & Communication Style
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tone of Voice</label>
                  <input
                    type="text"
                    value={writingStyle.toneOfVoice}
                    onChange={(e) => setWritingStyle({ ...writingStyle, toneOfVoice: e.target.value })}
                    placeholder="e.g. Professional, Friendly, Empathetic"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Brand Personality</label>
                  <input
                    type="text"
                    value={writingStyle.brandPersonality}
                    onChange={(e) => setWritingStyle({ ...writingStyle, brandPersonality: e.target.value })}
                    placeholder="e.g. Innovative, Helpful, Premium"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Communication Style</label>
                  <input
                    type="text"
                    value={writingStyle.communicationStyle}
                    onChange={(e) => setWritingStyle({ ...writingStyle, communicationStyle: e.target.value })}
                    placeholder="e.g. Direct, Bullet points, Action-oriented"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Language</label>
                  <input
                    type="text"
                    value={writingStyle.preferredLanguage}
                    onChange={(e) => setWritingStyle({ ...writingStyle, preferredLanguage: e.target.value })}
                    placeholder="e.g. English (US / UK)"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Words to Avoid / Banned Phrases</label>
                  <input
                    type="text"
                    value={writingStyle.wordsToAvoid}
                    onChange={(e) => setWritingStyle({ ...writingStyle, wordsToAvoid: e.target.value })}
                    placeholder="e.g. Cheap, guaranteed, ASAP"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Example Ideal Responses</label>
                  <textarea
                    rows={3}
                    value={writingStyle.exampleResponses}
                    onChange={(e) => setWritingStyle({ ...writingStyle, exampleResponses: e.target.value })}
                    placeholder="Paste sample ideal email responses here..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-[10px] text-xs text-gray-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: COMPANY KNOWLEDGE */}
          {activeTab === "knowledge" && (
            <div className="rounded-[18px] border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                    <FiBookOpen className="w-4 h-4 text-indigo-600" />
                    Company Knowledge Base
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Write everything about your business (SOPs, history, pricing, workflows, internal documentation) to provide complete context.
                  </p>
                </div>

                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {companyKnowledge.length} Characters
                </span>
              </div>

              <div>
                <textarea
                  rows={16}
                  value={companyKnowledge}
                  onChange={(e) => setCompanyKnowledge(e.target.value)}
                  placeholder={`# Company Overview & History
Our company was founded in 2020...

# Core Mission & Vision
We aim to deliver world-class automation...

# Service Processes & SOPs
1. Discovery call
2. Setup and onboarding
3. Quality check and support

# Pricing & Billing Details
- Starter Plan: $49/mo
- Growth Plan: $199/mo

# Internal Documentation & Rules...`}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[12px] text-xs font-mono text-gray-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          )}
          {/* Modals */}
          <FillWithAiModal
            isOpen={showFillWithAiModal}
            onClose={() => setShowFillWithAiModal(false)}
            onOpenImportModal={() => setShowImportJsonModal(true)}
          />

          <ImportJsonModal
            isOpen={showImportJsonModal}
            onClose={() => setShowImportJsonModal(false)}
            onImportSuccess={handleImportSuccess}
          />
        </div>
      </main>
    </div>
  );
};

export default CompanyProfile;
