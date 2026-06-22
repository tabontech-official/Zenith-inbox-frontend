import React from "react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fc] px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            Terms of Service
          </h1>
         
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">
            These Terms govern your access to and use of Replex Engine,
            including our authentication, automation, communication, and
            productivity services.
          </p>
        </div>

        <div className="p-8 md:p-10">
          <div className="space-y-8 text-sm leading-7 text-slate-600">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using Replex Engine, you agree to these Terms of
                Service. If you do not agree, you must not use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                2. Use of Services
              </h2>
              <p>
                Replex Engine provides software, automation, authentication,
                communication, and productivity-related services. You agree to
                use the platform only for lawful, authorized, and legitimate
                purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                3. User Accounts
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activity that occurs under your
                account. You must notify us immediately if you suspect
                unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                4. Google and Microsoft Integrations
              </h2>
              <p>
                Replex Engine may allow you to connect your Google or Microsoft
                account to enable authentication, automation, communication, or
                productivity features.
              </p>
              <p className="mt-3">
                When you connect a Google or Microsoft account, you authorize
                Replex Engine to access only the permissions you approve during
                the consent process. These permissions may include basic profile
                information, email address, calendar access, email-related
                features, or other services depending on the features you choose
                to use.
              </p>
              <p className="mt-3">
                You may revoke Google or Microsoft access at any time from your
                respective account security settings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                5. Third-Party Services
              </h2>
              <p>
                Replex Engine may depend on third-party services such as Google,
                Microsoft, hosting providers, email providers, or API platforms.
                We are not responsible for outages, policy changes, data loss,
                or restrictions caused by third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                6. Prohibited Activities
              </h2>
              <p>
                You may not misuse the service, attempt unauthorized access,
                interfere with platform security, distribute malware, violate
                laws, abuse third-party APIs, send spam, or use Replex Engine
                for fraudulent, harmful, or deceptive activities.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                7. Data and Privacy
              </h2>
              <p>
                Your use of Replex Engine is also governed by our Privacy
                Policy. By using the platform, you acknowledge that data may be
                processed as necessary to provide the services and integrations
                you enable.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                8. Intellectual Property
              </h2>
              <p>
                All branding, software, designs, workflows, content, and
                technology related to Replex Engine remain the property of
                Replex Engine unless stated otherwise. You may not copy, modify,
                reverse engineer, or redistribute our platform without
                permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                9. Service Availability
              </h2>
              <p>
                We aim to keep Replex Engine available and reliable, but we do
                not guarantee uninterrupted or error-free service. Features may
                be changed, limited, suspended, or discontinued at any time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                10. Disclaimer
              </h2>
              <p>
                Replex Engine is provided on an “as is” and “as available” basis
                without warranties of any kind, whether express or implied.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                11. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, Replex Engine shall not
                be liable for indirect, incidental, special, consequential, or
                punitive damages arising from your use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                12. Changes to Terms
              </h2>
              <p>
                We may update these Terms from time to time. Continued use of
                Replex Engine after changes are posted means you accept the
                updated Terms.
              </p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Contact
              </h2>
              <p>
                Support Email:{" "}
                <a
                  href="mailto:paul@replexengine.com"
                  className="font-medium text-indigo-600 hover:underline"
                >
                  paul@replexengine.com
                </a>
              </p>
              <p>
                Website:{" "}
                <a
                  href="https://replexengine.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-indigo-600 hover:underline"
                >
                  https://replexengine.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;