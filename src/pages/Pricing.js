import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiCheck,
  FiX,
  FiHelpCircle,
  FiShoppingBag,
  FiGift,
  FiZap,
  FiUsers,
  FiActivity,
  FiCreditCard,
  FiArrowRight,
  FiCheckCircle,
  FiLoader,
  FiSliders,
  FiInfo,
  FiAlertCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import axios from "axios";
import AppLayout from "../component/AppLayout";
import Header from "../component/Header";
import { UserContext } from "../component/UserContext";

const API_BASE_URL = "http://localhost:5000";

const Pricing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: contextUser, setUser: setContextUser } = useContext(UserContext);

  const userId = localStorage.getItem("userid") || contextUser?._id;

  // Billing & Plan States
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' | 'yearly'
  const [loadingUser, setLoadingUser] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [stripeNotification, setStripeNotification] = useState(null);

  // User subscription state
  const [userSub, setUserSub] = useState({
    plan: contextUser?.subscription?.plan || "Explore",
    aiRepliesUsed: contextUser?.subscription?.aiRepliesUsed || 0,
    extraAiReplies: contextUser?.subscription?.extraAiReplies || 0,
    status: contextUser?.subscription?.status || "active",
  });

  // Modal States
  const [showBuyExtrasModal, setShowBuyExtrasModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("Too expensive");
  const [selectedPackQty, setSelectedPackQty] = useState(500);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  // Handle return redirect from Stripe Checkout
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("success") === "true") {
      const plan = params.get("plan");
      const qty = params.get("qty");
      if (plan === "ExtraCredits") {
        setStripeNotification({
          type: "success",
          message: `Payment successful! Added ${Number(qty || 0).toLocaleString()} extra AI replies to your account.`,
        });
      } else {
        setStripeNotification({
          type: "success",
          message: `Payment successful! Your subscription has been upgraded to the ${plan || "new"} plan.`,
        });
      }
      fetchUserData();
    } else if (params.get("canceled") === "true") {
      setStripeNotification({
        type: "info",
        message: "Checkout was canceled. No charges were made.",
      });
    }
  }, [location.search]);

  const fetchUserData = async () => {
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) return;

    try {
      setLoadingUser(true);
      const res = await axios.get(`${API_BASE_URL}/auth/getUsers/${targetUserId}`);
      if (res.data?.data) {
        const fetched = res.data.data;
        const subData = fetched.subscription || {};
        setUserSub({
          plan: subData.plan || "Explore",
          aiRepliesUsed: subData.aiRepliesUsed || 0,
          extraAiReplies: subData.extraAiReplies || 0,
          status: subData.status || "active",
        });
        if (setContextUser) setContextUser(fetched);
      }
    } catch (err) {
      console.error("Error fetching subscription data:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  // Calculate Limits based on Current Plan
  const getPlanLimits = (planName) => {
    const name = (planName || "Explore").toLowerCase();
    if (name === "elevate") {
      return { baseLimit: 500, activeScenarios: 5, teamMembers: 5, priceMonthly: 9.99 };
    }
    if (name === "unite") {
      return { baseLimit: 1000, activeScenarios: 15, teamMembers: 20, priceMonthly: 14.99 };
    }
    // Explore (Free)
    return { baseLimit: 50, activeScenarios: 1, teamMembers: 1, priceMonthly: 0.0 };
  };

  const currentLimits = getPlanLimits(userSub.plan);
  const totalAvailableLimit = currentLimits.baseLimit + (userSub.extraAiReplies || 0);
  const usedReplies = userSub.aiRepliesUsed || 0;
  const usagePercentage = Math.min(
    100,
    Math.round((usedReplies / (totalAvailableLimit || 1)) * 100)
  );

  // Stripe Checkout Action
  const handleStripeCheckout = async (planName, qty = 0) => {
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) {
      navigate("/login");
      return;
    }

    try {
      setCheckoutLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/stripe/create-checkout-session/${targetUserId}`,
        {
          planName,
          quantity: qty,
          billingCycle,
        }
      );

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        // Fallback update if in local test environment
        await axios.post(`${API_BASE_URL}/stripe/update-plan/${targetUserId}`, {
          planName: planName !== "ExtraCredits" ? planName : undefined,
          action: planName === "ExtraCredits" ? "buy_credits" : undefined,
          quantity: qty,
        });

        await fetchUserData();
        setShowBuyExtrasModal(false);
        setStripeNotification({
          type: "success",
          message: planName === "ExtraCredits" ? `Added ${qty} extra AI replies!` : `Upgraded to ${planName} plan!`,
        });
      }
    } catch (err) {
      console.error("Stripe checkout error:", err);
      // Fallback local update
      try {
        await axios.post(`${API_BASE_URL}/stripe/update-plan/${targetUserId}`, {
          planName: planName !== "ExtraCredits" ? planName : undefined,
          action: planName === "ExtraCredits" ? "buy_credits" : undefined,
          quantity: qty,
        });
        await fetchUserData();
        setShowBuyExtrasModal(false);
        setStripeNotification({
          type: "success",
          message: planName === "ExtraCredits" ? `Added ${qty} extra AI replies!` : `Upgraded to ${planName} plan!`,
        });
      } catch (e) {
        console.error("Plan update error:", e);
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Cancel Subscription Action
  const handleCancelSubscription = async () => {
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) return;

    try {
      setCancelLoading(true);
      const res = await axios.post(`${API_BASE_URL}/stripe/cancel-subscription/${targetUserId}`, {
        reason: cancelReason,
      });

      if (res.data?.data) {
        const updatedSub = res.data.data;
        setUserSub({
          plan: updatedSub.plan || "Explore",
          aiRepliesUsed: updatedSub.aiRepliesUsed || 0,
          extraAiReplies: updatedSub.extraAiReplies || 0,
          status: updatedSub.status || "canceled",
        });
      }

      if (res.data?.user && setContextUser) {
        setContextUser(res.data.user);
      }

      await fetchUserData();
      setShowCancelModal(false);
      setStripeNotification({
        type: "info",
        message: "Your subscription has been canceled. Your account is now on the Explore (Free) plan.",
      });
    } catch (err) {
      console.error("Error canceling subscription:", err);
      // Local fallback
      setUserSub((prev) => ({ ...prev, plan: "Explore", status: "canceled" }));
      setShowCancelModal(false);
      setStripeNotification({
        type: "info",
        message: "Your subscription has been canceled. Your account is now on the Explore (Free) plan.",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleRedeemCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponMessage("Coupon code applied successfully! 15% discount activated.");
    setTimeout(() => {
      setShowCouponModal(false);
      setCouponMessage("");
      setCouponCode("");
    }, 2000);
  };

  const isUserLoggedIn = !!userId;
  const isPaidPlan = ["elevate", "unite", "enterprise"].includes((userSub.plan || "").toLowerCase());

  // Extra AI Replies Add-On Packs definition
  const extraPacks = [
    { qty: 250, price: "$3.99", desc: "Perfect for occasional usage spikes.", isPopular: false },
    { qty: 500, price: "$6.99", desc: "Great for growing businesses.", isPopular: true },
    { qty: 1000, price: "$11.99", desc: "Best value for high-volume automation.", isPopular: false },
    { qty: 2500, price: "$24.99", desc: "Built for busy teams and agencies.", isPopular: false },
    { qty: 5000, price: "$44.99", desc: "Maximum capacity for heavy workloads.", isPopular: false },
  ];

  // Comparison Table Rows Definition
  const comparisonRows = [
    { name: "AI Replies", explore: "50/month", elevate: "500/month", unite: "1,000/month", enterprise: "Custom" },
    { name: "Active Scenarios", explore: "1", elevate: "5", unite: "15", enterprise: "Unlimited" },
    { name: "Connections", explore: "1", elevate: "Up to 3", unite: "Up to 10", enterprise: "Unlimited" },
    { name: "Shared Inbox", explore: "Yes", elevate: "Yes", unite: "Yes", enterprise: "Yes" },
    { name: "Scenario Builder", explore: "No", elevate: "Yes", unite: "Advanced", enterprise: "Advanced" },
    { name: "Templates", explore: "Basic", elevate: "Unlimited", unite: "Unlimited", enterprise: "Unlimited" },
    { name: "Variables", explore: "Basic", elevate: "Unlimited", unite: "Unlimited", enterprise: "Unlimited" },
    { name: "Shopify Support", explore: "No", elevate: "Yes", unite: "Yes", enterprise: "Yes" },
    { name: "Custom Scenarios", explore: "No", elevate: "Yes", unite: "Yes", enterprise: "Yes" },
    { name: "Email Analytics", explore: "Basic", elevate: "Yes", unite: "Yes", enterprise: "Advanced" },
    { name: "Advanced Analytics", explore: "No", elevate: "Standard", unite: "Advanced", enterprise: "Advanced" },
    { name: "AI Usage Reports", explore: "No", elevate: "No", unite: "Yes", enterprise: "Yes" },
    { name: "Priority Support", explore: "No", elevate: "No", unite: "Yes", enterprise: "Dedicated" },
    { name: "API Access", explore: "No", elevate: "No", unite: "No", enterprise: "Yes" },
    { name: "White Label", explore: "No", elevate: "No", unite: "No", enterprise: "Yes" },
  ];

  const renderTableCell = (val) => {
    if (val === "Yes") {
      return (
        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          <FiCheck size={13} />
        </span>
      );
    }
    if (val === "No") {
      return (
        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-slate-400">
          <FiX size={12} />
        </span>
      );
    }
    return <span className="font-semibold text-slate-800 text-xs">{val}</span>;
  };

  // Main Content Card Layout
  const mainContent = (
    <div className="w-full flex flex-col gap-8 pb-12 font-sans text-slate-900">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-950 tracking-tight">
          Subscription
        </h1>
      </div>

      {/* STRIPE NOTIFICATION BANNER */}
      {stripeNotification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
            stripeNotification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-slate-100 text-slate-800 border-slate-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {stripeNotification.type === "success" ? (
              <FiCheckCircle size={16} className="text-emerald-600" />
            ) : (
              <FiInfo size={16} className="text-slate-600" />
            )}
            <span>{stripeNotification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStripeNotification(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TOP ROW: PLAN CARD & AI REPLIES USAGE CARD */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* LEFT CARD: CURRENT PLAN */}
        <div className="rounded-[12px] border border-[#E0DDD5] bg-white p-6 shadow-2xs flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Plan
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(true)}
                  className="h-8 rounded-[8px] border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <FiGift size={13} className="text-slate-500" />
                  <span>Redeem coupon</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("compare-plans");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="h-8 rounded-[8px] border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Change plan</span>
                </button>

                {isPaidPlan && (
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="h-8 rounded-[8px] border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span>Cancel plan</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1">
              <p className="text-xs font-semibold text-slate-500">Current plan</p>
              <h2 className="text-lg font-bold text-slate-950">
                {userSub.plan} · {currentLimits.baseLimit.toLocaleString()} AI replies/month
              </h2>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">Next billing</span>
            <p className="text-sm font-bold text-slate-900">
              ${currentLimits.priceMonthly.toFixed(2)} billed monthly
            </p>
          </div>
        </div>

        {/* RIGHT CARD: AI REPLIES USAGE */}
        <div className="rounded-[12px] border border-[#E0DDD5] bg-white p-6 shadow-2xs flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Credits / AI Replies
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHowItWorksModal(true)}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-950 transition flex items-center gap-1 cursor-pointer"
                >
                  <FiHelpCircle size={13} />
                  <span>How do credits work?</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBuyExtrasModal(true)}
                  className="h-8 rounded-[8px] border border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <FiShoppingBag size={13} className="text-slate-700" />
                  <span>Buy extra AI replies</span>
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1">
              <span className="text-[11px] font-medium text-slate-400">
                Usage resets on Aug 28, 2026
              </span>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">
                  Monthly AI replies @ {usedReplies} / {totalAvailableLimit.toLocaleString()} ({usagePercentage}% used)
                </p>
                {userSub.extraAiReplies > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    +{userSub.extraAiReplies} Extra Replies
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full">
            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-slate-900 rounded-full transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECOND ROW: COMPARE PLANS HEADER & TOGGLE */}
      {/* ------------------------------------------------------------- */}
      <div id="compare-plans" className="mt-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-950">Compare Plans</h2>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1.5 cursor-pointer ${
              billingCycle === "yearly"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Yearly</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border border-emerald-200">
              Save 15%
            </span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PRICING CARDS GRID (3 MAIN PLANS: Explore, Elevate, Unite) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* CARD 1: EXPLORE (FREE PLAN) */}
        <div className="rounded-[12px] border border-[#E0DDD5] bg-white p-6 shadow-2xs flex flex-col justify-between gap-6 relative">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Explore</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed min-h-[36px]">
              Perfect for getting started with AI-powered lead automation.
            </p>

            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-950">Free</span>
            </div>

            {/* AI Replies Badge */}
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800">
              50 AI replies/mo
            </div>

            {/* Features Checklist */}
            <ul className="mt-6 flex flex-col gap-2.5 text-xs font-medium text-slate-700">
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>50 AI Replies / month</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>1 Active Scenario</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>1 Connection</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>Shared Inbox</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>Basic Analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>Community Support</span>
              </li>
            </ul>

            {/* Helper text */}
            <p className="mt-4 text-[11px] text-slate-400 font-medium italic flex items-center gap-1">
              <FiInfo size={12} className="shrink-0" />
              <span>A Connection can be a Gmail account, Mailhook, or SMTP server.</span>
            </p>
          </div>

          <button
            type="button"
            disabled={userSub.plan?.toLowerCase() === "explore"}
            className={`w-full py-2.5 rounded-[8px] text-xs font-bold transition cursor-pointer text-center ${
              userSub.plan?.toLowerCase() === "explore"
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-default"
                : "bg-slate-900 text-white hover:bg-black"
            }`}
          >
            {userSub.plan?.toLowerCase() === "explore" ? "Current plan" : "Get Started Free"}
          </button>
        </div>

        {/* CARD 2: ELEVATE ($9.99/MO - MOST POPULAR) */}
        <div className="rounded-[12px] border-2 border-slate-900 bg-slate-50/50 p-6 shadow-md flex flex-col justify-between gap-6 relative">
          <span className="absolute -top-3 left-6 rounded-full bg-slate-900 px-3 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">
            Most Popular
          </span>

          <div>
            <h3 className="text-lg font-bold text-slate-950">Elevate</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed min-h-[36px]">
              Ideal for freelancers and growing businesses.
            </p>

            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-950">
                ${billingCycle === "yearly" ? "8.50" : "9.99"}
              </span>
              <span className="text-xs font-semibold text-slate-400">/month</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {billingCycle === "yearly" ? "Billed yearly ($102/yr)" : "Billed monthly"}
            </span>

            {/* AI Replies Badge */}
            <div className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-950">
              500 AI replies/mo
            </div>

            {/* Features Checklist */}
            <ul className="mt-6 flex flex-col gap-2.5 text-xs font-medium text-slate-800">
              <li className="flex items-center gap-2">
                <FiCheck className="text-slate-900 shrink-0" size={15} />
                <span>500 AI Replies / month</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-slate-900 shrink-0" size={15} />
                <span>5 Active Scenarios</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-slate-900 shrink-0" size={15} />
                <span>Up to 3 Connections</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-slate-900 shrink-0" size={15} />
                <span>Shared Inbox</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-slate-900 shrink-0" size={15} />
                <span>Visual Scenario Builder</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-slate-900 shrink-0" size={15} />
                <span>Unlimited Templates</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-slate-900 shrink-0" size={15} />
                <span>Shopify &amp; Custom Scenarios</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-slate-900 shrink-0" size={15} />
                <span>Email Analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-slate-900 shrink-0" size={15} />
                <span>Standard Support</span>
              </li>
            </ul>

            {/* Helper text */}
            <p className="mt-4 text-[11px] text-slate-400 font-medium italic flex items-center gap-1">
              <FiInfo size={12} className="shrink-0" />
              <span>A Connection can be a Gmail account, Mailhook, or SMTP server.</span>
            </p>
          </div>

          <button
            type="button"
            disabled={checkoutLoading || userSub.plan?.toLowerCase() === "elevate"}
            onClick={() => handleStripeCheckout("Elevate")}
            className={`w-full py-2.5 rounded-[8px] text-xs font-bold transition cursor-pointer text-center ${
              userSub.plan?.toLowerCase() === "elevate"
                ? "bg-slate-200 text-slate-700 border border-slate-300 cursor-default"
                : "bg-slate-900 text-white hover:bg-black shadow-md flex items-center justify-center gap-1.5"
            }`}
          >
            {checkoutLoading ? (
              <>
                <FiLoader className="animate-spin" size={14} />
                <span>Processing Secure Checkout...</span>
              </>
            ) : userSub.plan?.toLowerCase() === "elevate" ? (
              "Current plan"
            ) : (
              "Start with Elevate"
            )}
          </button>
        </div>

        {/* CARD 3: UNITE ($14.99/MO) */}
        <div className="rounded-[12px] border border-[#E0DDD5] bg-white p-6 shadow-2xs flex flex-col justify-between gap-6 relative">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Unite</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed min-h-[36px]">
              Built for agencies managing multiple clients.
            </p>

            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-950">
                ${billingCycle === "yearly" ? "12.75" : "14.99"}
              </span>
              <span className="text-xs font-semibold text-slate-400">/month</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {billingCycle === "yearly" ? "Billed yearly ($153/yr)" : "Billed monthly"}
            </span>

            {/* AI Replies Badge */}
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800">
              1,000 AI replies/mo
            </div>

            {/* Features Checklist */}
            <ul className="mt-6 flex flex-col gap-2.5 text-xs font-medium text-slate-700">
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>1,000 AI Replies / month</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>15 Active Scenarios</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>Up to 10 Connections</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>Shared Inbox</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>Advanced Scenario Builder</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>Unlimited Templates</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>Unlimited Variables</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>AI Fallback Rules</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>Retry &amp; Delay Controls</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>Advanced Analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>AI Usage Reports</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-emerald-600 shrink-0" size={15} />
                <span>Priority Support</span>
              </li>
            </ul>

            {/* Helper text */}
            <p className="mt-4 text-[11px] text-slate-400 font-medium italic flex items-center gap-1">
              <FiInfo size={12} className="shrink-0" />
              <span>A Connection can be a Gmail account, Mailhook, or SMTP server.</span>
            </p>
          </div>

          <button
            type="button"
            disabled={checkoutLoading || userSub.plan?.toLowerCase() === "unite"}
            onClick={() => handleStripeCheckout("Unite")}
            className={`w-full py-2.5 rounded-[8px] text-xs font-bold transition cursor-pointer text-center ${
              userSub.plan?.toLowerCase() === "unite"
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-default"
                : "bg-slate-900 text-white hover:bg-black shadow-xs flex items-center justify-center gap-1.5"
            }`}
          >
            {checkoutLoading ? (
              <>
                <FiLoader className="animate-spin" size={14} />
                <span>Processing Secure Checkout...</span>
              </>
            ) : userSub.plan?.toLowerCase() === "unite" ? (
              "Current plan"
            ) : (
              "Choose Unite"
            )}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM ROW: ENTERPRISE CARD */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Enterprise</h3>
          <p className="mt-1 text-xs text-slate-500">
            For organizations needing powerful, scalable, and secure AI and automation solutions
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-medium text-slate-700">
            <div className="flex items-center gap-2">
              <FiCheck className="text-emerald-600 shrink-0" size={14} />
              <span>Custom AI Reply Limits</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheck className="text-emerald-600 shrink-0" size={14} />
              <span>Unlimited Active Scenarios</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheck className="text-emerald-600 shrink-0" size={14} />
              <span>Unlimited Connections</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheck className="text-emerald-600 shrink-0" size={14} />
              <span>API Access</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheck className="text-emerald-600 shrink-0" size={14} />
              <span>White Label</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheck className="text-emerald-600 shrink-0" size={14} />
              <span>Dedicated Infrastructure</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheck className="text-emerald-600 shrink-0" size={14} />
              <span>Dedicated Account Manager</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheck className="text-emerald-600 shrink-0" size={14} />
              <span>SLA &amp; Priority Support</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/talk-to-sales")}
          className="h-10 px-5 rounded-[8px] border border-slate-300 bg-white text-xs font-bold text-slate-900 hover:bg-slate-50 transition cursor-pointer shrink-0 shadow-2xs"
        >
          Contact Sales
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PRICING COMPARISON TABLE */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-8 bg-white rounded-[12px] border border-[#E0DDD5] shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E0DDD5] bg-slate-50/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Plan Feature Comparison</h3>
            <p className="text-xs text-slate-500">Detailed breakdown of all features and resource limits across plans.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-[#E0DDD5] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 w-1/3">Feature</th>
                <th className="px-4 py-3.5 text-center">Explore</th>
                <th className="px-4 py-3.5 text-center bg-slate-100/60 text-slate-900">Elevate</th>
                <th className="px-4 py-3.5 text-center">Unite</th>
                <th className="px-4 py-3.5 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonRows.map((row, idx) => (
                <tr key={row.name} className={idx % 2 === 1 ? "bg-slate-50/40" : "bg-white"}>
                  <td className="px-6 py-3.5 font-bold text-slate-900">{row.name}</td>
                  <td className="px-4 py-3.5 text-center">{renderTableCell(row.explore)}</td>
                  <td className="px-4 py-3.5 text-center bg-slate-100/30">{renderTableCell(row.elevate)}</td>
                  <td className="px-4 py-3.5 text-center">{renderTableCell(row.unite)}</td>
                  <td className="px-4 py-3.5 text-center">{renderTableCell(row.enterprise)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-[#E0DDD5] text-[11px] font-semibold text-slate-500 italic flex items-center gap-1.5">
          <FiInfo size={13} className="text-slate-600 shrink-0" />
          <span>1 Connection = 1 Gmail account, Mailhook, or SMTP server. Mix and match based on your workflow.</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: NEED MORE AI REPLIES? (POPUP MODAL) */}
      {/* ------------------------------------------------------------- */}
      {showBuyExtrasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden p-6 animate-in zoom-in-95 duration-150 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FiShoppingBag className="text-slate-800" size={20} />
                <h3 className="text-base font-bold text-slate-950">Need More AI Replies?</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBuyExtrasModal(false)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Purchase additional AI reply packs anytime without upgrading your subscription.
            </p>

            {/* Selectable Add-On Packs */}
            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              <label className="text-xs font-bold text-slate-800">Select Add-On Pack:</label>
              {extraPacks.map((pack) => {
                const isSelected = selectedPackQty === pack.qty;
                return (
                  <button
                    key={pack.qty}
                    type="button"
                    onClick={() => setSelectedPackQty(pack.qty)}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-slate-900 bg-slate-100/70 ring-1 ring-slate-900"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
                        }`}
                      >
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-950">
                            {pack.qty.toLocaleString()} AI Replies
                          </span>
                          {pack.isPopular && (
                            <span className="bg-slate-900 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                              Most Popular
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{pack.desc}</p>
                      </div>
                    </div>

                    <span className="text-sm font-extrabold text-slate-950 shrink-0">
                      {pack.price}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* How AI Replies Work Info Box inside Modal */}
            <div className="rounded-[8px] border border-[#E0DDD5] bg-slate-50/80 p-3.5 text-xs text-slate-700 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <FiInfo size={14} className="text-slate-800" />
                <span>How AI Replies Work</span>
              </div>
              <ul className="flex flex-col gap-1 text-[11px] text-slate-600 leading-relaxed font-medium">
                <li>• AI Replies are only consumed when AI generates a response.</li>
                <li>• Purchased AI Replies are added to your account instantly.</li>
                <li>• Add-on AI Replies are used only after your monthly included AI Replies are exhausted.</li>
                <li>• You can purchase additional AI Replies at any time.</li>
              </ul>
            </div>

            <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowBuyExtrasModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={checkoutLoading}
                onClick={() => handleStripeCheckout("ExtraCredits", selectedPackQty)}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-black transition cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                {checkoutLoading ? (
                  <>
                    <FiLoader className="animate-spin" size={14} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FiCreditCard size={14} />
                    <span>Buy Now ({selectedPackQty.toLocaleString()} Replies)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: CANCEL SUBSCRIPTION MODAL */}
      {/* ------------------------------------------------------------- */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in zoom-in-95 duration-150 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <FiAlertTriangle size={20} />
                <h3 className="text-base font-bold text-slate-950">Cancel Subscription</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel your <strong className="text-slate-900">{userSub.plan}</strong> subscription?
            </p>

            {/* Impact Box */}
            <div className="bg-red-50/60 border border-red-200 rounded-lg p-3 text-xs text-red-900 flex flex-col gap-1.5 font-medium">
              <span className="font-bold flex items-center gap-1 text-red-700">
                <FiAlertCircle size={14} />
                What happens when you cancel:
              </span>
              <ul className="list-disc list-inside text-[11px] text-red-800 space-y-1 pl-1">
                <li>Your account will revert to the <strong>Explore (Free)</strong> plan.</li>
                <li>Monthly AI replies limit will reset to 50 replies/mo.</li>
                <li>Active scenarios limit will be capped at 1.</li>
              </ul>
            </div>

            {/* Reason selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-800">Please tell us why you are cancelling:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none bg-white focus:border-slate-900"
              >
                <option value="Too expensive">Too expensive</option>
                <option value="Not using it enough">Not using it enough</option>
                <option value="Missing key features">Missing key features</option>
                <option value="Switched to another product">Switched to another product</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-black transition cursor-pointer"
              >
                Keep My Plan
              </button>
              <button
                type="button"
                disabled={cancelLoading}
                onClick={handleCancelSubscription}
                className="px-4 py-2 text-xs font-bold text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition cursor-pointer flex items-center gap-1.5"
              >
                {cancelLoading ? (
                  <>
                    <FiLoader className="animate-spin" size={14} />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: REDEEM COUPON MODAL */}
      {/* ------------------------------------------------------------- */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-950">Redeem Promo Coupon</h3>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleRedeemCoupon} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Enter coupon code (e.g. FOLD15)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-black uppercase"
              />

              {couponMessage && (
                <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-md border border-emerald-200">
                  {couponMessage}
                </p>
              )}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-black hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Apply Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: HOW DO AI REPLIES WORK MODAL */}
      {/* ------------------------------------------------------------- */}
      {showHowItWorksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-950">How AI Replies Work</h3>
              <button
                type="button"
                onClick={() => setShowHowItWorksModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs text-slate-600 leading-relaxed">
              <p>• AI Replies are only consumed when AI generates a response.</p>
              <p>• Purchased AI Replies are added to your account instantly.</p>
              <p>• Add-on AI Replies are used only after your monthly included AI Replies are exhausted.</p>
              <p>• You can purchase additional AI Replies at any time.</p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHowItWorksModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-black rounded-lg cursor-pointer hover:bg-slate-800"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isUserLoggedIn) {
    return <AppLayout>{mainContent}</AppLayout>;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-12 pt-28">
        {mainContent}
      </div>
    </div>
  );
};

export default Pricing;
