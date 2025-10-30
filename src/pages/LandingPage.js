// import React from "react";
// import { motion } from "framer-motion";
// import { FiMail, FiZap, FiSend, FiRepeat, FiBarChart2 } from "react-icons/fi";
// import { PiRobotLight } from "react-icons/pi";
// import { useNavigate } from "react-router-dom";

// const LandingPage = () => {
//   const navigate=useNavigate()
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.2 },
//     },
//   };

//   const fadeUp = {
//     hidden: { opacity: 0, y: 40 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center bg-[#F9FAFB] text-center relative overflow-hidden">
//       <motion.header
//         className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-6"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//       >
//         <div className="flex items-center space-x-2">
//           <FiMail className="text-[#4F46E5] text-2xl" />
//           <span className="font-semibold text-lg text-[#111827]">Zenith Inbox</span>
//         </div>
//         <a href="/login" className="text-sm font-semibold text-[#111827] hover:bg-gray-200 py-2 px-7  hover:rounded-lg">
//           Sign In
//         </a>
//       </motion.header>

//       <motion.main
//         className="flex flex-col items-center justify-center px-4 mt-28 mb-24"
//         initial="hidden"
//         animate="visible"
//         variants={containerVariants}
//       >
//         <motion.h1
//           className="text-3xl md:text-5xl font-bold text-[#111827] mb-6"
//           variants={fadeUp}
//         >
//           Never miss a <span className="text-[#111827]">Shopify lead again.</span>
//         </motion.h1>

//         <motion.p
//           className="text-[#4B5563] max-w-2xl mb-10 text-lg leading-relaxed"
//           variants={fadeUp}
//         >
//           Connect your inbox, choose your voice, and let our AI reply and follow up
//           automatically—only pulling you in when needed.
//         </motion.p>

//         <motion.button
//           className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-md transition duration-300"
//           variants={fadeUp}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.97 }}
//           onClick={()=>navigate("/login")}
//         >
//           Start 60-sec Setup →
//         </motion.button>
//       </motion.main>

//       <motion.section
//         className="bg-white w-full py-20 px-6"
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true, amount: 0.2 }}
//         variants={containerVariants}
//       >
//         <motion.div className="max-w-6xl mx-auto text-center" variants={fadeUp}>
//           <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">
//             How It Works
//           </h2>
//           <p className="text-[#4B5563] mb-16">
//             A simple, powerful flow to automate your lead management.
//           </p>
//         </motion.div>

//         <motion.div
//           className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12"
//           variants={containerVariants}
//         >
//           {[
//             {
//               icon: <FiZap className="text-[#4F46E5] text-3xl" />,
//               title: "Capture",
//               desc: "Connect your inbox or use a mailhook to instantly capture every Shopify lead.",
//             },
//             {
//               icon: <PiRobotLight className="text-[#4F46E5] text-3xl" />,
//               title: "Understand",
//               desc: "AI classifies lead intent, language, and urgency with a confidence score.",
//             },
//             {
//               icon: <FiSend className="text-[#4F46E5] text-3xl" />,
//               title: "Reply",
//               desc: "Compose replies with dynamic tokens and your brand voice, then auto-send or queue for review.",
//             },
//             {
//               icon: <FiRepeat className="text-[#4F46E5] text-3xl" />,
//               title: "Follow-up",
//               desc: "Schedule automated follow-up sequences that stop intelligently on human reply.",
//             },
//             {
//               icon: <FiBarChart2 className="text-[#4F46E5] text-3xl" />,
//               title: "Track",
//               desc: "Monitor lead statuses and gain insights from a powerful analytics dashboard.",
//             },
//           ].map((item, index) => (
//             <motion.div
//               key={index}
//               className="flex flex-col items-center text-center"
//               variants={fadeUp}
//               whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
//             >
//               <div className="bg-[#EEF2FF] p-4 rounded-xl mb-4">{item.icon}</div>
//               <h3 className="font-semibold text-lg text-[#111827] mb-2">{item.title}</h3>
//               <p className="text-[#4B5563] text-sm max-w-[200px]">{item.desc}</p>
//             </motion.div>
//           ))}
//         </motion.div>
//       </motion.section>
//     </div>
//   );
// };

// export default LandingPage;
import React from "react";
import { motion } from "framer-motion";
import { FiMail, FiZap, FiSend, FiRepeat, FiBarChart2 } from "react-icons/fi";
import { PiRobotLight } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#F9FAFB] text-center relative overflow-hidden">
      <motion.header
        className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center space-x-2">
          <FiMail className="text-[#4F46E5] text-2xl" />
          <span className="font-semibold text-lg text-[#111827]">
            Zenith Inbox
          </span>
        </div>
        <a
          href="/login"
          className="text-sm font-semibold text-[#111827] hover:bg-gray-200 py-2 px-7 hover:rounded-lg"
        >
          Log In
        </a>
      </motion.header>

      <motion.main
        className="flex flex-col items-center justify-center px-4 mt-28 mb-24"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1
          className="text-3xl md:text-5xl font-bold text-[#111827] mb-6"
          variants={fadeUp}
        >
          Never miss a <span className="text-[#111827]">lead again.</span>
        </motion.h1>

        <motion.p
          className="text-[#4B5563] max-w-2xl mb-10 text-lg leading-relaxed"
          variants={fadeUp}
        >
          Connect your inbox, choose your voice, and let our AI reply and
          follow up automatically — only pulling you in when needed.
        </motion.p>

        <motion.button
          className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-md transition duration-300"
          variants={fadeUp}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/login")}
        >
          Start 60-sec Setup →
        </motion.button>
      </motion.main>

      <motion.section
        className="bg-white w-full py-20 px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.div
          className="max-w-6xl mx-auto text-center"
          variants={fadeUp}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">
            How It Works
          </h2>
          <p className="text-[#4B5563] mb-16">
            A simple, powerful flow to automate your lead management.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12"
          variants={containerVariants}
        >
          {[
            {
              icon: <FiZap className="text-[#4F46E5] text-3xl" />,
              title: "Capture",
              desc: "Connect your inbox or use a mailhook to instantly capture every lead.",
            },
            {
              icon: <PiRobotLight className="text-[#4F46E5] text-3xl" />,
              title: "Understand",
              desc: "AI classifies lead intent, language, and urgency with a confidence score.",
            },
            {
              icon: <FiSend className="text-[#4F46E5] text-3xl" />,
              title: "Reply",
              desc: "Compose replies with your brand voice and send automatically or queue for review.",
            },
            {
              icon: <FiRepeat className="text-[#4F46E5] text-3xl" />,
              title: "Follow-up",
              desc: "Schedule automated follow-up sequences that stop intelligently on human reply.",
            },
            {
              icon: <FiBarChart2 className="text-[#4F46E5] text-3xl" />,
              title: "Track",
              desc: "Monitor lead statuses and gain insights from your analytics dashboard.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center"
              variants={fadeUp}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <div className="bg-[#EEF2FF] p-4 rounded-xl mb-4">
                {item.icon}
              </div>
              <h3 className="font-semibold text-lg text-[#111827] mb-2">
                {item.title}
              </h3>
              <p className="text-[#4B5563] text-sm max-w-[200px]">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
};

export default LandingPage;
