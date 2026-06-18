import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fc] px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Privacy Policy
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Last Updated: July 2025
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600">
          <p>
            Welcome to Replex Engine. We respect your privacy and are committed
            to protecting your personal information.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Information We Collect
            </h2>
            <p>
              We may collect your name, email address, profile information,
              organization details, contact information, authentication data,
              and usage information when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              How We Use Your Information
            </h2>
            <p>
              We use your information to provide our services, authenticate
              users, manage accounts, improve platform performance, provide
              support, prevent abuse, and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Google User Data
            </h2>
            <p>
              If you connect your Google account, Replex Engine only accesses
              the data you authorize. Google user data is used only to provide
              requested functionality. We do not sell Google user data, use it
              for advertising, or share it with unauthorized third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Data Security
            </h2>
            <p>
              We use reasonable technical and organizational safeguards to
              protect your information from unauthorized access, misuse,
              disclosure, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Data Retention
            </h2>
            <p>
              We retain information only as long as necessary to provide our
              services, comply with legal obligations, resolve disputes, and
              enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Your Rights
            </h2>
            <p>
              You may request access, correction, or deletion of your personal
              data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Contact Us
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

export default PrivacyPolicy;