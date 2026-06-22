import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fc] px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            Privacy Policy
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">
            This Privacy Policy explains how Replex Engine collects, uses,
            protects, and handles information when you use our services,
            including Google and Microsoft integrations.
          </p>
        </div>

        <div className="p-8 md:p-10">
          <div className="space-y-8 text-sm leading-7 text-slate-600">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                1. Information We Collect
              </h2>
              <p>
                We may collect your name, email address, profile information,
                organization details, contact information, authentication data,
                account identifiers, usage data, device information, logs, and
                other information required to provide and secure our services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                2. How We Use Your Information
              </h2>
              <p>
                We use your information to provide Replex Engine services,
                authenticate users, manage accounts, enable integrations,
                process requested actions, improve platform performance, provide
                support, prevent abuse, troubleshoot issues, and comply with
                legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                3. Google User Data
              </h2>
              <p>
                If you connect your Google account, Replex Engine accesses only
                the Google data and permissions you approve during the consent
                process. This may include basic profile information, email
                address, Gmail data, calendar data, or other Google services
                depending on the features you choose to use.
              </p>
              <p className="mt-3">
                Google user data is used only to provide and improve the
                user-facing features you request. We do not sell Google user
                data, use it for advertising, or share it with unauthorized
                third parties.
              </p>
              <p className="mt-3">
                Replex Engine’s use and transfer of information received from
                Google APIs will adhere to the Google API Services User Data
                Policy, including the Limited Use requirements.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                4. Microsoft User Data
              </h2>
              <p>
                If you connect your Microsoft account, Replex Engine accesses
                only the Microsoft data and permissions you approve during the
                consent process. This may include basic profile information,
                email address, Microsoft account identifiers, Outlook data,
                calendar data, or Microsoft Graph data depending on the features
                you choose to use.
              </p>
              <p className="mt-3">
                Microsoft user data is used only to provide the requested Replex
                Engine functionality. We do not sell Microsoft user data, use it
                for advertising, or share it with unauthorized third parties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                5. Third-Party Services
              </h2>
              <p>
                Replex Engine may use third-party services such as Google,
                Microsoft, hosting providers, analytics providers, email
                providers, payment processors, and infrastructure services.
                These providers may process data only as necessary to support
                our platform and services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                6. Data Sharing
              </h2>
              <p>
                We do not sell your personal information. We may share
                information only with service providers that help us operate the
                platform, when required by law, to protect rights and security,
                or with your consent.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                7. Data Security
              </h2>
              <p>
                We use reasonable technical and organizational safeguards to
                protect your information from unauthorized access, misuse,
                disclosure, alteration, or destruction. However, no method of
                transmission or storage is completely secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                8. Data Retention
              </h2>
              <p>
                We retain information only as long as necessary to provide our
                services, comply with legal obligations, resolve disputes,
                prevent abuse, and enforce our agreements. When information is
                no longer needed, we delete or anonymize it where appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                9. User Control and Revocation
              </h2>
              <p>
                You may revoke Google or Microsoft access at any time from your
                respective account security or connected apps settings. You may
                also contact us to request access, correction, deletion, or
                export of your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                10. Children’s Privacy
              </h2>
              <p>
                Replex Engine is not intended for children under 13. We do not
                knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                11. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. Any changes
                will be posted on this page with an updated “Last Updated” date.
              </p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Contact Us
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

export default PrivacyPolicy;
