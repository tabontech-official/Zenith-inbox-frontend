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
import AppLayout from "../component/AppLayout";
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

  // Profile completion check — requires at minimum companyName + businessDescription
  const isProfileComplete =
    company.companyName?.trim().length > 0 &&
    company.businessDescription?.trim().length > 0;

  return (
    <AppLayout>
      <div className="flex-1 h-full overflow-y-auto w-full">
        {/* System status bar — sticky, attached to top bar & secondary sidebar */}
        <div className="sticky top-0 z-20 border-b border-gray-200 bg-white">
          <div className="flex min-h-[30px] items-center justify-between gap-4 px-6 text-[11px] text-gray-500">
            <div className="flex min-w-0 items-center divide-x divide-gray-200">
              <div className="flex items-center gap-1.5 pr-4 font-medium text-green-700">
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute h-3 w-3 rounded-full bg-green-200" />
                  <span className="relative h-2 w-2 rounded-full bg-green-500" />
                </span>
                <span>Knowledge Base active</span>
              </div>
              {company.companyName ? (
                <div className="hidden px-4 sm:block">{company.companyName}</div>
              ) : null}
              <div className="hidden px-4 md:block">
                {services.length} Services · {products.length} Products · {faqs.length} FAQs
              </div>
            </div>
            <button type="button" onClick={handleSave} disabled={saving}
              className="shrink-0 font-semibold text-slate-600 underline underline-offset-2 hover:text-slate-900">
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        {/* Incomplete Profile Banner */}
        {!isProfileComplete && (
          <div className="border-b border-red-200 bg-red-50 px-6 py-2.5 flex items-center gap-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 shrink-0">
              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </span>
            <p className="text-[12px] font-semibold text-red-700">
              Your company profile is incomplete — please fill in your <strong>Company Name</strong> and <strong>Business Description</strong> to activate AI replies.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("company")}
              className="ml-auto shrink-0 text-[11px] font-bold text-red-700 underline underline-offset-2 hover:text-red-900 transition whitespace-nowrap"
            >
              Complete now →
            </button>
          </div>
        )}

        {/* Page Content */}
        <div className="px-6 py-6 lg:px-8 bg-[#FAF8F5] min-h-full">

          {/* Page Header */}
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-[15px] font-bold text-slate-900">Company Profile</h1>
              <p className="text-[12px] text-slate-500 mt-0.5">Manage your business details, products, services, policies, and AI knowledge base.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setShowFillWithAiModal(true)}
                className="h-8 rounded-[8px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 text-xs font-semibold transition flex items-center gap-1.5">
                <FiZap className="w-3.5 h-3.5" /><span>Fill with AI</span>
              </button>
              <button type="button" onClick={() => setShowImportJsonModal(true)}
                className="h-8 rounded-[8px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 text-xs font-semibold transition flex items-center gap-1.5">
                <FiUploadCloud className="w-3.5 h-3.5" /><span>Import JSON</span>
              </button>
              <button type="button" onClick={handleSave} disabled={saving}
                className="h-8 rounded-[8px] bg-[#111110] hover:bg-black text-white px-4 text-xs font-semibold transition flex items-center gap-1.5 shadow-xs">
                {saving ? <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> : <FiSave className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{saving ? "Saving..." : "Save Profile"}</span>
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <section className="mb-5 grid grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { label: "Services", count: services.length, icon: FiLayers },
              { label: "Products", count: products.length, icon: FiPackage },
              { label: "FAQs", count: faqs.length, icon: FiHelpCircle },
              { label: "Knowledge Base", count: `${companyKnowledge.length} chars`, icon: FiBookOpen },
            ].map(({ label, count, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">{label}</p>
                  <p className="text-[18px] font-bold text-slate-900 mt-0.5">{count}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            ))}
          </section>

          {/* Tab Navigation */}
          <div className="mb-4 flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-slate-200">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                  className={`flex h-8 items-center gap-1.5 px-3 text-[12px] font-medium transition whitespace-nowrap border-b-2 -mb-px ${
                    isActive ? "border-slate-900 text-slate-900 font-semibold" : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}>
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: COMPANY INFO */}
          {activeTab === "company" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <h2 className="text-[13px] font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FiBriefcase className="w-4 h-4 text-slate-500" /> General Company Information
                {!isProfileComplete && (
                  <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                    Required fields missing
                  </span>
                )}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide flex items-center gap-1 text-slate-500">
                    Company Name
                    <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={company.companyName} onChange={(e) => setCompany({ ...company, companyName: e.target.value })} placeholder="e.g. Acme Tech Solutions"
                    className={`w-full px-3.5 py-2 bg-white border rounded-[8px] text-xs text-slate-800 focus:outline-none focus:ring-2 transition ${
                      !company.companyName?.trim()
                        ? "border-red-300 focus:ring-red-500/10 focus:border-red-400"
                        : "border-slate-200 focus:ring-slate-900/10 focus:border-slate-400"
                    }`}
                  />
                  {!company.companyName?.trim() && (
                    <p className="mt-1 text-[10px] font-semibold text-red-600">Company name is required.</p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Industry</label>
                  <input type="text" value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} placeholder="e.g. E-Commerce / Software Automation" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide flex items-center gap-1 text-slate-500">
                    Business Description
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea rows={3} value={company.businessDescription} onChange={(e) => setCompany({ ...company, businessDescription: e.target.value })} placeholder="Brief description of what your business does..."
                    className={`w-full px-3.5 py-2 bg-white border rounded-[8px] text-xs text-slate-800 focus:outline-none focus:ring-2 transition resize-none ${
                      !company.businessDescription?.trim()
                        ? "border-red-300 focus:ring-red-500/10 focus:border-red-400"
                        : "border-slate-200 focus:ring-slate-900/10 focus:border-slate-400"
                    }`}
                  />
                  {!company.businessDescription?.trim() && (
                    <p className="mt-1 text-[10px] font-semibold text-red-600">Business description is required.</p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Website URL</label>
                  <input type="url" value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} placeholder="https://example.com" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Support Email</label>
                  <input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} placeholder="support@example.com" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
                  <input type="text" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Physical Address</label>
                  <input type="text" value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} placeholder="123 Innovation Way, Suite 100, New York, NY" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">Social Media Profiles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { icon: FiLinkedin, key: "linkedin", placeholder: "LinkedIn URL", color: "text-blue-600" },
                    { icon: FiTwitter, key: "twitter", placeholder: "Twitter / X URL", color: "text-sky-500" },
                    { icon: FiFacebook, key: "facebook", placeholder: "Facebook URL", color: "text-blue-700" },
                    { icon: FiInstagram, key: "instagram", placeholder: "Instagram URL", color: "text-pink-600" },
                    { icon: FiYoutube, key: "youtube", placeholder: "YouTube Channel URL", color: "text-red-600" },
                  ].map(({ icon: SIcon, key, placeholder, color }) => (
                    <div key={key} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-[8px] border border-slate-200">
                      <SIcon className={`w-4 h-4 shrink-0 ${color}`} />
                      <input type="text" value={company.socialLinks?.[key] || ""} onChange={(e) => setCompany({ ...company, socialLinks: { ...company.socialLinks, [key]: e.target.value } })} placeholder={placeholder} className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICES */}
          {activeTab === "services" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-[13px] font-bold text-slate-900 flex items-center gap-2"><FiLayers className="w-4 h-4 text-slate-500" /> Services Offered ({services.length})</h2>
                <button type="button" onClick={addService} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111110] hover:bg-black text-white rounded-[8px] text-xs font-semibold transition"><FiPlus className="w-3.5 h-3.5" /> Add Service</button>
              </div>
              {services.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-[10px]">
                  <FiLayers className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-2">No services added yet.</p>
                  <button onClick={addService} className="text-xs font-semibold text-slate-700 hover:underline">+ Add your first service</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 bg-slate-50 rounded-[10px] border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Service #{idx + 1}</span>
                        <button type="button" onClick={() => setServices(services.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition p-1"><FiTrash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <input type="text" value={item.name} onChange={(e) => { const u = [...services]; u[idx].name = e.target.value; setServices(u); }} placeholder="Service Name" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition" />
                      <textarea rows={2} value={item.description} onChange={(e) => { const u = [...services]; u[idx].description = e.target.value; setServices(u); }} placeholder="Service details & deliverables..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition resize-none" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRODUCTS */}
          {activeTab === "products" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-[13px] font-bold text-slate-900 flex items-center gap-2"><FiPackage className="w-4 h-4 text-slate-500" /> Products Catalog ({products.length})</h2>
                <button type="button" onClick={addProduct} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111110] hover:bg-black text-white rounded-[8px] text-xs font-semibold transition"><FiPlus className="w-3.5 h-3.5" /> Add Product</button>
              </div>
              {products.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-[10px]">
                  <FiPackage className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-2">No products added yet.</p>
                  <button onClick={addProduct} className="text-xs font-semibold text-slate-700 hover:underline">+ Add your first product</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 bg-slate-50 rounded-[10px] border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Product #{idx + 1}</span>
                        <button type="button" onClick={() => setProducts(products.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition p-1"><FiTrash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <input type="text" value={item.name} onChange={(e) => { const u = [...products]; u[idx].name = e.target.value; setProducts(u); }} placeholder="Product Name" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition" />
                      <textarea rows={2} value={item.description} onChange={(e) => { const u = [...products]; u[idx].description = e.target.value; setProducts(u); }} placeholder="Product Description..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition resize-none" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PORTFOLIO */}
          {activeTab === "portfolio" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-[13px] font-bold text-slate-900 flex items-center gap-2"><FiFolder className="w-4 h-4 text-slate-500" /> Portfolio & Case Studies ({portfolio.length})</h2>
                <button type="button" onClick={addPortfolio} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111110] hover:bg-black text-white rounded-[8px] text-xs font-semibold transition"><FiPlus className="w-3.5 h-3.5" /> Add Project</button>
              </div>
              {portfolio.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-[10px]">
                  <FiFolder className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-2">No portfolio projects added yet.</p>
                  <button onClick={addPortfolio} className="text-xs font-semibold text-slate-700 hover:underline">+ Add your first project</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {portfolio.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 bg-slate-50 rounded-[10px] border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Project #{idx + 1}</span>
                        <button type="button" onClick={() => setPortfolio(portfolio.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition p-1"><FiTrash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" value={item.projectName} onChange={(e) => { const u = [...portfolio]; u[idx].projectName = e.target.value; setPortfolio(u); }} placeholder="Project Name" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition" />
                        <input type="text" value={item.links} onChange={(e) => { const u = [...portfolio]; u[idx].links = e.target.value; setPortfolio(u); }} placeholder="Project Link (e.g. https://...)" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition" />
                      </div>
                      <textarea rows={2} value={item.description} onChange={(e) => { const u = [...portfolio]; u[idx].description = e.target.value; setPortfolio(u); }} placeholder="Project Description..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition resize-none" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FAQS */}
          {activeTab === "faqs" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-[13px] font-bold text-slate-900 flex items-center gap-2"><FiHelpCircle className="w-4 h-4 text-slate-500" /> FAQs ({faqs.length})</h2>
                <button type="button" onClick={addFaq} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111110] hover:bg-black text-white rounded-[8px] text-xs font-semibold transition"><FiPlus className="w-3.5 h-3.5" /> Add FAQ</button>
              </div>
              {faqs.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-[10px]">
                  <FiHelpCircle className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-2">No FAQs added yet.</p>
                  <button onClick={addFaq} className="text-xs font-semibold text-slate-700 hover:underline">+ Add your first FAQ</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 bg-slate-50 rounded-[10px] border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">FAQ #{idx + 1}</span>
                        <button type="button" onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition p-1"><FiTrash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <input type="text" value={item.question} onChange={(e) => { const u = [...faqs]; u[idx].question = e.target.value; setFaqs(u); }} placeholder="Question (e.g. What are your turnaround times?)" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition" />
                      <textarea rows={2} value={item.answer} onChange={(e) => { const u = [...faqs]; u[idx].answer = e.target.value; setFaqs(u); }} placeholder="Answer details..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition resize-none" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: POLICIES */}
          {activeTab === "policies" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <h2 className="text-[13px] font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"><FiShield className="w-4 h-4 text-slate-500" /> Company Policies & Terms</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Return Policy", key: "returnPolicy", placeholder: "Details about returns..." },
                  { label: "Refund Policy", key: "refundPolicy", placeholder: "Details about refunds..." },
                  { label: "Shipping Policy", key: "shippingPolicy", placeholder: "Shipping methods & dispatch windows..." },
                  { label: "Privacy Policy Highlights", key: "privacyPolicy", placeholder: "Key data privacy points..." },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
                    <textarea rows={3} value={policies[key]} onChange={(e) => setPolicies({ ...policies, [key]: e.target.value })} placeholder={placeholder} className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition resize-none" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Terms & Conditions Summary</label>
                  <textarea rows={3} value={policies.termsAndConditions} onChange={(e) => setPolicies({ ...policies, termsAndConditions: e.target.value })} placeholder="Terms of service, warranties, liabilities..." className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition resize-none" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Custom Policies</h3>
                  <button type="button" onClick={addCustomPolicy} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111110] hover:bg-black text-white rounded-[8px] text-xs font-semibold transition"><FiPlus className="w-3.5 h-3.5" /> Add Policy</button>
                </div>
                {policies.customPolicies?.map((cp, idx) => (
                  <div key={cp.id || idx} className="p-3 bg-slate-50 rounded-[10px] border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <input type="text" value={cp.name} onChange={(e) => { const u = [...policies.customPolicies]; u[idx].name = e.target.value; setPolicies({ ...policies, customPolicies: u }); }} placeholder="Policy Name (e.g. SLA Guarantee)" className="px-3 py-1.5 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 w-1/2 focus:outline-none focus:border-slate-400 transition" />
                      <button type="button" onClick={() => setPolicies({ ...policies, customPolicies: policies.customPolicies.filter((_, i) => i !== idx) })} className="text-slate-400 hover:text-red-500 p-1 transition"><FiTrash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <textarea rows={2} value={cp.details} onChange={(e) => { const u = [...policies.customPolicies]; u[idx].details = e.target.value; setPolicies({ ...policies, customPolicies: u }); }} placeholder="Policy details..." className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition resize-none" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: TIMELINES */}
          {activeTab === "timelines" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <h2 className="text-[13px] font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"><FiClock className="w-4 h-4 text-slate-500" /> Turnaround Timelines & Support Hours</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Delivery Time", key: "deliveryTime", placeholder: "e.g. 2-4 business days" },
                  { label: "Project Milestone Timeline", key: "projectTimeline", placeholder: "e.g. Discovery: 1 week, Build: 2 weeks" },
                  { label: "Support Hours / Response SLA", key: "supportHours", placeholder: "e.g. Response within 2 hours (Mon-Fri)" },
                  { label: "Business Working Hours", key: "businessWorkingHours", placeholder: "e.g. Mon - Fri: 9:00 AM - 6:00 PM EST" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
                    <input type="text" value={timelines[key]} onChange={(e) => setTimelines({ ...timelines, [key]: e.target.value })} placeholder={placeholder} className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: WRITING STYLE */}
          {activeTab === "writingStyle" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <h2 className="text-[13px] font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"><FiFeather className="w-4 h-4 text-slate-500" /> Brand Voice & Communication Style</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Tone of Voice", key: "toneOfVoice", placeholder: "e.g. Professional, Friendly, Empathetic" },
                  { label: "Brand Personality", key: "brandPersonality", placeholder: "e.g. Innovative, Helpful, Premium" },
                  { label: "Communication Style", key: "communicationStyle", placeholder: "e.g. Direct, Bullet points, Action-oriented" },
                  { label: "Preferred Language", key: "preferredLanguage", placeholder: "e.g. English (US / UK)" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
                    <input type="text" value={writingStyle[key]} onChange={(e) => setWritingStyle({ ...writingStyle, [key]: e.target.value })} placeholder={placeholder} className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Words to Avoid / Banned Phrases</label>
                  <input type="text" value={writingStyle.wordsToAvoid} onChange={(e) => setWritingStyle({ ...writingStyle, wordsToAvoid: e.target.value })} placeholder="e.g. Cheap, guaranteed, ASAP" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Example Ideal Responses</label>
                  <textarea rows={3} value={writingStyle.exampleResponses} onChange={(e) => setWritingStyle({ ...writingStyle, exampleResponses: e.target.value })} placeholder="Paste sample ideal email responses here..." className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-[8px] text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: COMPANY KNOWLEDGE */}
          {activeTab === "knowledge" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-[13px] font-bold text-slate-900 flex items-center gap-2"><FiBookOpen className="w-4 h-4 text-slate-500" /> Company Knowledge Base</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Write SOPs, history, pricing, workflows — complete context for AI replies.</p>
                </div>
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">{companyKnowledge.length} chars</span>
              </div>
              <textarea rows={18} value={companyKnowledge} onChange={(e) => setCompanyKnowledge(e.target.value)}
                placeholder={`# Company Overview & History\nOur company was founded in 2020...\n\n# Core Mission & Vision\nWe aim to deliver world-class automation...\n\n# Service Processes & SOPs\n1. Discovery call\n2. Setup and onboarding\n3. Quality check and support\n\n# Pricing & Billing Details\n- Starter Plan: $49/mo\n- Growth Plan: $199/mo\n\n# Internal Documentation & Rules...`}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[10px] text-xs font-mono text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:border-slate-400 transition resize-none" />
            </div>
          )}

          {/* Modals */}
          <FillWithAiModal isOpen={showFillWithAiModal} onClose={() => setShowFillWithAiModal(false)} onOpenImportModal={() => setShowImportJsonModal(true)} />
          <ImportJsonModal isOpen={showImportJsonModal} onClose={() => setShowImportJsonModal(false)} onImportSuccess={handleImportSuccess} />
        </div>
      </div>
    </AppLayout>
  );
};

export default CompanyProfile;
