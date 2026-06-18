import React from "react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fc] px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Terms of Service
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Last Updated: July 2025
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600">
          <p>
            Welcome to Replex Engine. By accessing or using our platform, you
            agree to these Terms of Service.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Use of Services
            </h2>
            <p>
              Replex Engine provides software, automation, authentication,
              communication, and productivity-related services. You agree to use
              the platform only for lawful purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              User Accounts
            </h2>
            <p>
              You are responsible for keeping your account secure and for all
              activity that occurs under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Google Integration
            </h2>
            <p>
              When you connect your Google account, you authorize Replex Engine
              to access only the permissions you approve. You may revoke access
              at any time from your Google account settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Prohibited Activities
            </h2>
            <p>
              You may not misuse the service, attempt unauthorized access,
              distribute harmful code, violate laws, or use the platform for
              fraudulent or abusive activities.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Intellectual Property
            </h2>
            <p>
              All branding, software, designs, and content related to Replex
              Engine remain the property of Replex Engine unless stated
              otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Disclaimer
            </h2>
            <p>
              The service is provided on an “as is” and “as available” basis
              without warranties of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Replex Engine shall not be
              liable for indirect, incidental, special, or consequential damages
              arising from use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Contact
            </h2>
            <p>
              Email:{" "}
              <a
                href="mailto:rstechlexis@gmail.com"
                className="text-indigo-600 hover:underline"
              >
                rstechlexis@gmail.com
              </a>
            </p>
            <p>
              Website:{" "}
              <a
                href="https://replexengine.com"
                className="text-indigo-600 hover:underline"
              >
                https://replexengine.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;