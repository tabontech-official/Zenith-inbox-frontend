import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";
import Header from "../component/Header";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const TalkToSales = () => {

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    companySize: "",
    projectGoals: "",
  });

  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState("");

  const handleChange = (e)=>{
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e)=>{
    e.preventDefault();

    setLoading(true);
    setSuccess("");

    try{

      const res = await fetch(
        "https://email-syncing-backend.vercel.app/talk/talk-to-sales",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify(formData)
        }
      );

      const data = await res.json();

      if(res.ok){
        setSuccess("Your request has been sent successfully!");
        setFormData({
          fullName:"",
          email:"",
          companyName:"",
          companySize:"",
          projectGoals:""
        });
      }

    }catch(err){
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-x-hidden relative">

      <Header />

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[380px] h-[380px] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[380px] h-[380px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="pt-36 pb-24 px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT SIDE */}

            <motion.div variants={fadeUp} className="space-y-8">

              <span className="inline-flex px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 uppercase tracking-widest">
                Lead Automation Strategy
              </span>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Design your lead automation system
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  with our experts.
                </span>
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                Work with our team to design powerful lead automation flows.
              </p>

              <div className="space-y-4 max-w-md">
                {[
                  "Visual automation scenarios (no-code)",
                  "Conditional logic & smart routing",
                  "Email templates & follow-up flows",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <FiCheckCircle className="text-purple-400 w-5 h-5" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>

            </motion.div>


            {/* RIGHT FORM */}

            <motion.div variants={fadeUp}>

              <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-xl">

                <h2 className="text-2xl font-semibold mb-6">
                  Request a Sales Call
                </h2>

                {success && (
                  <div className="mb-4 text-green-400 text-sm">
                    {success}
                  </div>
                )}

                <form
                  className="space-y-5"
                  onSubmit={handleSubmit}
                >

                  <div className="grid sm:grid-cols-2 gap-5">

                    <Input
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />

                    <Input
                      label="Work Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@company.com"
                    />

                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">

                    <Input
                      label="Company Name"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Company Inc."
                    />

                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                        Company Size
                      </label>

                      <select
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleChange}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3"
                      >
                        <option value="">Select</option>
                        <option>1–10</option>
                        <option>11–50</option>
                        <option>51–200</option>
                        <option>200+</option>
                      </select>
                    </div>

                  </div>

                  <div>

                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                      Project Goals
                    </label>

                    <textarea
                      rows="3"
                      name="projectGoals"
                      value={formData.projectGoals}
                      onChange={handleChange}
                      placeholder="Describe your use case..."
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 resize-none"
                    />

                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    {loading ? "Sending..." : "Book Strategy Session"}
                    <FiArrowRight />
                  </button>

                </form>

              </div>

            </motion.div>

          </div>
        </motion.div>
      </main>
    </div>
  );
};


/* INPUT COMPONENT */

const Input = ({ label, name, value, onChange, placeholder }) => (
  <div>

    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
      {label}
    </label>

    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3"
    />

  </div>
);

export default TalkToSales;
