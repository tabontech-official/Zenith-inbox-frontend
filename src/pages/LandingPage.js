import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/login");
  };
  return (
    <div>
      <div className="bg-[#32005E] text-white">
        <header className="bg-[#32005E] shadow-2xl p-6">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-white">Make</div>

            <div className="flex items-center space-x-6">
              {/* <a href="#" className="text-white hover:text-pink-500">
              What is Make
            </a>
            <a href="#" className="text-white hover:text-pink-500">
              Make + AI
            </a>
            <a href="#" className="text-white hover:text-pink-500">
              Solutions
            </a>
            <a href="#" className="text-white hover:text-pink-500">
              Pricing
            </a>

            <a
              href="#"
              className="text-white hover:bg-purple-700 px-4 py-2 rounded-full border-2 border-purple-600 hover:text-white transition duration-300"
            >
              Talk to sales
            </a> */}

              <a
                href="/login"
                className="text-white bg-[#FF009A]  px-10 py-3 rounded-lg transition duration-300"
              >
                Get started free
              </a>
            </div>
          </div>
        </header>

        <main className="py-16 text-center">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between">
            <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
              <h1 className="text-2xl lg:text-4xl font-bold mb-6 leading-tight">
                Real-time visual orchestration for AI agents and automations
              </h1>
              <p className="text-lg lg:text-xl mb-8 max-w-3xl mx-auto">
                Realize your business’s full potential with the visual
                orchestration platform that empowers ambitious teams to build,
                accelerate, and scale with the power of AI and automation.
              </p>
              <div className="space-x-4">
                <button
                  onClick={handleClick}
                  className="px-8 py-3 bg-[#FF009A] text-white rounded-lg border-2 border-[#FF009A] transition duration-300"
                >
                  Get started free
                </button>
                <button className="px-8 py-3 border-2 border-[#FF009A] text-[#FF009A] rounded-lg   transition duration-300">
                  Talk to sales
                </button>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <video
                src="//videos.ctfassets.net/un655fb9wln6/7eNjBmqlO8eOOCdZn0MepT/7d2318d9aa8a95bb5462973cd4fcb9b3/new_composition_longer_3-1.mp4"
                controls
                autoPlay
                loop
                muted
                className="rounded-xl shadow-lg w-full bg-black"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </main>

        <section className="py-16 bg-[#FCF3F8]">
          <div className="max-w-5xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6 text-[#220041]">
              Visually orchestrate with Make + AI
            </h2>
            <p className="text-[1.4rem] leading-[2.8rem] mb-12 text-[#220041]">
              Build and scale agentic automation, monitor in real time, gather
              insights and implement change.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              <div className="bg-[#F5F0F0] text-[#220041] p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-4">
                  Real-time Automation
                </h3>
                <p className="text-[#220041]">
                  Accelerate workflows with real-time integration and
                  automation.
                </p>
              </div>
              <div className="bg-[#F5F0F0] text-[#220041] p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-4">
                  AI-Driven Insights
                </h3>
                <p className="text-[#220041]">
                  Make data-driven decisions faster with AI-powered insights and
                  actions.
                </p>
              </div>
              <div className="bg-[#F5F0F0] text-[#220041] p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-4">
                  Seamless Integrations
                </h3>
                <p className="text-[#220041]">
                  Integrate with thousands of apps to streamline your business
                  operations.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-[#220041]">
              Trusted by leading brands
            </h2>
            <div className="flex flex-wrap justify-center items-center space-x-6 gap-14">
              <img
                src="https://images.ctfassets.net/un655fb9wln6/0AJVJCmFCOOv3yP3kKvtP/0a39de9bdd8eca18afdd6cf50eca1d36/Bamboo_HR_logo.png"
                alt="BambooHR"
                className="h-12"
              />
              <img
                src="https://images.ctfassets.net/un655fb9wln6/6rfX75bR4kozSxBv7Gxs0W/37b0bd08bae0d42e06b9ceef32c8bd9b/BNY_logo.png"
                alt="BNY"
                className="h-12"
              />
              <img
                src="https://images.ctfassets.net/un655fb9wln6/6ncgV1ibDEwPg0aDlYIBHD/acf414c2a589d0892c92384a6ff7d92d/Finn_logo.png"
                alt="FINN"
                className="h-12"
              />
              <img
                src="https://images.ctfassets.net/un655fb9wln6/6WYRQRPkbmBatc3rRk9dR9/8d380427cf8002dc049c18e107912bf7/Bolt_logo.png"
                alt="Bolt"
                className="h-12"
              />
              <img
                src="https://images.ctfassets.net/un655fb9wln6/6Qb3Ns9ojQT8ph5CS4gZlk/802491ecf59a6789a6638908341d0ce0/fonds-finanz.png"
                alt="FondsFinanz"
                className="h-12"
              />
              <img
                src="https://images.ctfassets.net/un655fb9wln6/48Guyb5eSV0pRVcdWbEtgD/ee15ba2f5a98d13db60fc5b85ea69d36/tally.png"
                alt="Tally"
                className="h-12"
              />
              <img
                src="https://images.ctfassets.net/un655fb9wln6/51MbEYOBSG7aa08ZtMIGKa/fa16471901097b7c5af604506d07f73f/gojob.png"
                alt="Gojob"
                className="h-12"
              />
            </div>
          </div>
        </section>

        <div className="bg-[#F8F0FF] py-16 px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-4xl font-bold text-[#220041]">
                Realize the true potential of AI
              </h2>
              <p className="text-lg text-[#220041]">
                AI is transforming the way we work. Make accelerates this
                process, with 400+ pre-built integrations with AI apps. Make AI
                Agents open even more possibilities, with automation that thinks
                and acts in the moment.
              </p>
              <button className="bg-[#F024F6] text-white px-6 py-3 rounded-lg text-xl">
                Learn more
              </button>
            </div>

            <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center items-center">
              <img
                src="https://images.ctfassets.net/un655fb9wln6/6zii7sDfVNFq54etd22DzK/ad8a50813dffde8584d269de35c92e36/ai.png" // Replace with your actual image path
                alt="AI Integration Illustration"
                className="w-full max-w-md"
              />
            </div>
          </div>
        </div>

        <div className="bg-white px-6 py-16">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className=" p-4 rounded-lg">
              <div className="mt-4">
                <div className="w-full h-64 bg-white rounded-lg p-4">
                  <img
                    src="https://images.ctfassets.net/un655fb9wln6/5P2jM8dbXW7qmrrs45Abj1/840462c1d71c320d60ebb8c1b2b7eeaa/2.png" // Replace with your image path
                    alt="Diagram"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-[#220041]">
                Automation for Enterprises
              </h2>
              <p className="text-lg text-[#220041]">
                No matter how complex your business is, our Enterprise plan is
                designed for those who need low-code workflow automation with
                the power of AI, paired with enhanced security features and
                always-on support.
              </p>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-full text-xl">
                Discover Make for Enterprise
              </button>
            </div>
          </div>
        </div>

        <footer className="bg-[#32005E] text-white py-6 text-center">
          <p>&copy; 2025 Make. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
