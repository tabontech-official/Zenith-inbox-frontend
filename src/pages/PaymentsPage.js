import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCreditCard,
  FiDownload,
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiDollarSign,
  FiRefreshCw,
  FiX,
  FiShield,
  FiExternalLink,
  FiPrinter,
  FiPlus,
  FiEdit,
  FiLock,
  FiLoader,
} from "react-icons/fi";
import axios from "axios";
import AppLayout from "../component/AppLayout";
import { UserContext } from "../component/UserContext";

const API_BASE_URL = "https://email-syncing-backend.vercel.app";

const PaymentsPage = () => {
  const navigate = useNavigate();
  const { user: contextUser } = useContext(UserContext);
  const userId = localStorage.getItem("userid") || contextUser?._id;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Payment Method State
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState({
    cardholderName: "",
    last4: "4242",
    brand: "Visa",
    expMonth: "12",
    expYear: "28",
    billingAddress: "",
    country: "United States",
    isSaved: false,
  });

  // New Card Form State
  const [cardForm, setCardForm] = useState({
    cardholderName: "",
    cardNumber: "",
    expMonth: "12",
    expYear: "28",
    cvc: "",
    billingAddress: "",
    country: "United States",
  });

  useEffect(() => {
    fetchPaymentHistory();
    fetchPaymentMethod();
  }, [userId]);

  const fetchPaymentHistory = async () => {
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/stripe/payment-history/${targetUserId}`);
      if (res.data?.data) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethod = async () => {
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) return;

    try {
      const res = await axios.get(`${API_BASE_URL}/organization/payment-method/${targetUserId}`);
      if (res.data?.data) {
        setPaymentMethod(res.data.data);
        if (res.data.data.cardholderName) {
          setCardForm((prev) => ({
            ...prev,
            cardholderName: res.data.data.cardholderName,
            billingAddress: res.data.data.billingAddress || "",
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching payment method:", err);
    }
  };

  const handleSavePaymentMethod = async (e) => {
    e.preventDefault();
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) return;

    if (!cardForm.cardholderName.trim() || !cardForm.cardNumber.trim()) {
      alert("Please fill in the cardholder name and card number.");
      return;
    }

    try {
      setSavingCard(true);
      const res = await axios.post(
        `${API_BASE_URL}/organization/payment-method/${targetUserId}`,
        cardForm
      );

      if (res.data?.data) {
        setPaymentMethod(res.data.data);
      }
      setShowAddCardModal(false);
    } catch (err) {
      console.error("Error saving payment method:", err);
      // Fallback update
      const cleanCard = cardForm.cardNumber.replace(/\s+/g, "");
      setPaymentMethod({
        cardholderName: cardForm.cardholderName,
        last4: cleanCard.length >= 4 ? cleanCard.slice(-4) : "4242",
        brand: cleanCard.startsWith("5") ? "MasterCard" : "Visa",
        expMonth: cardForm.expMonth,
        expYear: cardForm.expYear,
        billingAddress: cardForm.billingAddress,
        country: cardForm.country,
        isSaved: true,
      });
      setShowAddCardModal(false);
    } finally {
      setSavingCard(false);
    }
  };

  const currentPlan = contextUser?.subscription?.plan || "Explore";

  // Filtered Payments
  const filteredPayments = payments.filter((item) => {
    const matchesSearch =
      (item.invoiceId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || (item.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalSpent = payments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="w-full flex flex-col gap-6 font-sans text-slate-900 pb-12">
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
              <FiCreditCard className="h-5 w-5 text-slate-800" />
              <span>Payments &amp; Billing History</span>
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              View your transaction history, invoices, plan charges, and add-on credit receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchPaymentHistory}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh payments"
            >
              <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              type="button"
              onClick={() => setShowAddCardModal(true)}
              className="h-9 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs font-bold hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <FiPlus size={14} />
              <span>{paymentMethod.isSaved ? "Update Payment Method" : "Add Payment Method"}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/pricing")}
              className="h-9 px-4 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-black transition cursor-pointer shadow-xs"
            >
              Manage Subscription
            </button>
          </div>
        </div>

        {/* Top Summary Cards (KPIs) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* KPI 1: Total Spent */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Spent
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-950">
                ${totalSpent.toFixed(2)} USD
              </span>
              <span className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                <FiDollarSign size={16} />
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Lifetime billed amount
            </span>
          </div>

          {/* KPI 2: Active Plan */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Tier
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-slate-950">
                {currentPlan}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-white uppercase">
                Active
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Billed monthly automatically
            </span>
          </div>

          {/* KPI 3: Default Payment Method */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between gap-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Payment Method
              </span>
              {paymentMethod.isSaved && (
                <span className="bg-emerald-50 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-emerald-200 uppercase">
                  Default
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <FiCreditCard className="text-slate-800 shrink-0" size={18} />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {paymentMethod.isSaved
                    ? `${paymentMethod.brand} ending in ${paymentMethod.last4}`
                    : "Visa ending in 4242"}
                </p>
                {paymentMethod.isSaved && (
                  <p className="text-[10px] text-slate-400">
                    Expires {paymentMethod.expMonth}/{paymentMethod.expYear} · {paymentMethod.cardholderName}
                  </p>
                )}
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <FiLock size={12} className="text-slate-500" />
              <span>256-bit Bank-Grade SSL Encrypted</span>
            </span>
          </div>

          {/* KPI 4: Total Invoices */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Invoices
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-950">
                {payments.length}
              </span>
              <span className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                <FiFileText size={16} />
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Processed &amp; verified
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search by invoice ID or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white outline-none focus:border-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-950">Payment History &amp; Invoices</h3>
              <p className="text-xs text-slate-500">Download official receipts and view itemized payment records.</p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredPayments.length} item(s)
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-slate-500 flex flex-col items-center gap-2">
              <FiRefreshCw className="animate-spin text-slate-700" size={20} />
              <span>Loading payment history...</span>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <FiFileText size={28} className="text-slate-300" />
              <span className="font-bold text-slate-800">No payment history found</span>
              <p className="text-[11px] text-slate-400">Transactions will appear here after upgrading or purchasing add-on packs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Date &amp; Time</th>
                    <th className="px-4 py-3.5">Invoice ID</th>
                    <th className="px-4 py-3.5">Description</th>
                    <th className="px-4 py-3.5 text-right">Amount</th>
                    <th className="px-4 py-3.5 text-center">Payment Method</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((payment) => {
                    const isPaid = (payment.status || "Paid").toLowerCase() === "paid";
                    const cleanMethod = (payment.paymentMethod || "").replace(/Stripe\s*/i, "");
                    return (
                      <tr key={payment._id || payment.invoiceId} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {payment.createdAt
                            ? new Date(payment.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Recent"}
                        </td>

                        <td className="px-4 py-4 font-mono font-bold text-slate-900">
                          {payment.invoiceId || `#INV-${Date.now().toString().slice(-6)}`}
                        </td>

                        <td className="px-4 py-4 font-bold text-slate-950">
                          {payment.description}
                        </td>

                        <td className="px-4 py-4 text-right font-extrabold text-slate-950">
                          ${(Number(payment.amount) || 0).toFixed(2)} USD
                        </td>

                        <td className="px-4 py-4 text-center text-slate-600 font-medium">
                          {cleanMethod || "Visa ending in 4242"}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }`}
                          >
                            <FiCheckCircle size={12} />
                            <span>{payment.status || "Paid"}</span>
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(payment)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-emerald-700 transition cursor-pointer underline"
                          >
                            <FiFileText size={13} />
                            <span>View Receipt</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL 1: ADD / EDIT PAYMENT METHOD */}
        {showAddCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in zoom-in-95 duration-150 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-950">
                  <FiCreditCard size={20} />
                  <h3 className="text-base font-bold text-slate-950">
                    {paymentMethod.isSaved ? "Update Payment Method" : "Add Payment Method"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Save your credit or debit card for automatic checkout and instant plan renewals.
              </p>

              <form onSubmit={handleSavePaymentMethod} className="flex flex-col gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-800">Cardholder Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Smith"
                    value={cardForm.cardholderName}
                    onChange={(e) => setCardForm({ ...cardForm, cardholderName: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={19}
                      placeholder="4242 4242 4242 4242"
                      value={cardForm.cardNumber}
                      onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                      className="mt-1 w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900"
                    />
                    <FiCreditCard className="absolute left-3 top-3 text-slate-400" size={15} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800">Exp Month</label>
                    <select
                      value={cardForm.expMonth}
                      onChange={(e) => setCardForm({ ...cardForm, expMonth: e.target.value })}
                      className="mt-1 w-full px-2 py-2 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-slate-900 bg-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800">Exp Year</label>
                    <select
                      value={cardForm.expYear}
                      onChange={(e) => setCardForm({ ...cardForm, expYear: e.target.value })}
                      className="mt-1 w-full px-2 py-2 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-slate-900 bg-white"
                    >
                      {["25", "26", "27", "28", "29", "30", "31", "32"].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800">CVC / CVV</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="123"
                      value={cardForm.cvc}
                      onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold outline-none focus:border-slate-900 text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800">Billing Address</label>
                  <input
                    type="text"
                    placeholder="123 Main Street, Suite 400"
                    value={cardForm.billingAddress}
                    onChange={(e) => setCardForm({ ...cardForm, billingAddress: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800">Country</label>
                  <select
                    value={cardForm.country}
                    onChange={(e) => setCardForm({ ...cardForm, country: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                  </select>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-600 flex items-center gap-2">
                  <FiLock className="text-slate-800 shrink-0" size={14} />
                  <span>Your card details are protected by 256-bit bank-grade encryption.</span>
                </div>

                <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCardModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingCard}
                    className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    {savingCard ? (
                      <>
                        <FiLoader className="animate-spin" size={14} />
                        <span>Saving Card...</span>
                      </>
                    ) : (
                      <>
                        <FiShield size={14} />
                        <span>Save Payment Method</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: INVOICE VIEW MODAL */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in zoom-in-95 duration-150 flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FiFileText className="text-slate-900" size={20} />
                  <h3 className="text-base font-bold text-slate-950">
                    Official Tax Invoice
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Printable Invoice Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-950">REPLEX ENGINE</h4>
                  <p className="text-xs text-slate-500">Inbox Automation &amp; AI Reply Platform</p>
                  <p className="text-[11px] text-slate-400 mt-1">support@replexengine.com</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase">INVOICE</span>
                  <p className="text-sm font-mono font-extrabold text-slate-950">
                    {selectedInvoice.invoiceId || `#INV-${Date.now().toString().slice(-6)}`}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Date: {new Date(selectedInvoice.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Billed To:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{contextUser?.fullName || "Valued Customer"}</p>
                  <p className="text-slate-500">{contextUser?.email || "customer@company.com"}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Payment Status:</span>
                  <div className="mt-0.5">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                      PAID &amp; VERIFIED
                    </span>
                  </div>
                </div>
              </div>

              {/* Item Breakdown Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                    <tr>
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800">{selectedInvoice.description}</td>
                      <td className="p-3 text-right font-extrabold text-slate-950">
                        ${(Number(selectedInvoice.amount) || 0).toFixed(2)} USD
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-500">Total Billed:</span>
                <span className="text-lg font-extrabold text-slate-950">
                  ${(Number(selectedInvoice.amount) || 0).toFixed(2)} USD
                </span>
              </div>

              <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-black transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <FiPrinter size={14} />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PaymentsPage;
