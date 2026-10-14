import React from "react";

const CountlessOptionsPrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-indigo-500 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 sm:px-12 text-white relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300 mb-4">
              <span>Countless Options</span>
              <span>•</span>
              <span>Official Privacy Policy</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Privacy Policy for Countless Options
            </h1>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300 max-w-3xl">
              At Countless Options, we value your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, store, and protect information when you install or use our app.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Last Updated: October 14, 2026
              </span>
            </div>
          </div>

          {/* Intro Context */}
          <div className="p-8 sm:p-12 border-b border-slate-100 bg-slate-50/50">
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Countless Options helps online store owners create customizable product options, manage personalized product selections, and provide additional customization features to their customers.
            </p>
          </div>

          {/* Policy Body */}
          <div className="p-8 sm:p-12 space-y-10 text-sm sm:text-base leading-relaxed text-slate-600">
            {/* Section 1 */}
            <section className="scroll-mt-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3 flex items-baseline gap-2">
                <span className="text-indigo-600 font-mono text-base">01.</span>
                <span>Information We Collect</span>
              </h2>
              <p className="mb-4">
                When you install or use Countless Options, we may collect and process the following information:
              </p>
              <ul className="space-y-3 pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Account Information:</strong> Store name, email address, store domain, and other information necessary to authenticate your access and manage your account.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Store Information:</strong> Product details, collections, product tags, categories, and other relevant store information required for app functionality.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Customization Data:</strong> Product option configurations, custom fields, dropdown selections, color swatches, option prices, and product assignment settings.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Usage Information:</strong> Information about how you interact with the app, including feature usage, configuration changes, and technical performance.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Uploaded Files:</strong> Images and documents submitted by customers through product customization fields. These files are processed and transferred to the connected store's file storage system rather than being permanently stored on our application servers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Technical Information:</strong> Information such as error logs, authentication details, and technical data necessary to maintain application security and functionality.</span>
                </li>
              </ul>
              <p className="mt-4 text-slate-500 text-xs sm:text-sm italic">
                We only collect information that is reasonably necessary to operate, maintain, and improve our services.
              </p>
            </section>

            {/* Section 2 */}
            <section className="scroll-mt-6 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3 flex items-baseline gap-2">
                <span className="text-indigo-600 font-mono text-base">02.</span>
                <span>How We Use Your Information</span>
              </h2>
              <p className="mb-4">
                We use the information collected for the following purposes:
              </p>
              <ul className="space-y-3 pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">App Functionality:</strong> To create, manage, and display custom product options and personalized product configurations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Product Customization:</strong> To enable customers to select customization options and submit their preferences when purchasing products.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">File Processing:</strong> To securely process customer-uploaded images and documents associated with personalized orders.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Account Management:</strong> To manage application access, settings, subscriptions, and account-related services.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Service Improvement:</strong> To monitor application performance, identify technical issues, and improve functionality.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Communication:</strong> To send important service notifications, application updates, and account-related information.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Customer Support:</strong> To respond to inquiries, troubleshoot issues, and provide technical assistance.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Security:</strong> To detect unauthorized activity, prevent misuse, and maintain the security of our services.</span>
                </li>
              </ul>
              <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 text-sm">
                We do not sell personal information or use customer customization information for unrelated advertising purposes.
              </div>
            </section>

            {/* Section 3 */}
            <section className="scroll-mt-6 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3 flex items-baseline gap-2">
                <span className="text-indigo-600 font-mono text-base">03.</span>
                <span>Customer Customization Data</span>
              </h2>
              <div className="space-y-3">
                <p>
                  Countless Options allows store owners to collect information from customers through custom product option fields.
                </p>
                <p>
                  This information may include personalized text, names, messages, selected preferences, dates, and other details entered during the purchasing process.
                </p>
                <p>
                  Customer selections are processed through the connected online store's cart, checkout, and order management systems.
                </p>
                <p>
                  Countless Options does not maintain a separate customer profile database or intentionally store customer customization responses permanently in its application database.
                </p>
                <p className="text-slate-500 text-sm">
                  Store owners are responsible for determining what information they request from their customers and ensuring that their data collection practices comply with applicable privacy laws.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="scroll-mt-6 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3 flex items-baseline gap-2">
                <span className="text-indigo-600 font-mono text-base">04.</span>
                <span>File Uploads and Storage</span>
              </h2>
              <div className="space-y-3">
                <p>
                  Countless Options supports customer file uploads for personalized products.
                </p>
                <ul className="space-y-2 pl-1">
                  <li className="flex items-start gap-2.5">
                    <span className="text-indigo-500 mt-1 font-bold">•</span>
                    <span>Uploaded files may include images, documents, and other supported file formats.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-indigo-500 mt-1 font-bold">•</span>
                    <span>Uploaded files are processed through secure application endpoints.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-indigo-500 mt-1 font-bold">•</span>
                    <span>Files are transferred to the connected store's file storage system.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-indigo-500 mt-1 font-bold">•</span>
                    <span>We do not intentionally retain permanent copies of uploaded files on our application servers.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-indigo-500 mt-1 font-bold">•</span>
                    <span>File uploads are subject to file type and size restrictions.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-indigo-500 mt-1 font-bold">•</span>
                    <span>Uploaded file references may be included in the associated cart and order details.</span>
                  </li>
                </ul>
                <p className="text-slate-500 text-sm pt-1">
                  Store owners are responsible for managing uploaded files and ensuring that customers do not submit unnecessary sensitive personal information.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="scroll-mt-6 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3 flex items-baseline gap-2">
                <span className="text-indigo-600 font-mono text-base">05.</span>
                <span>Data Sharing and Disclosure</span>
              </h2>
              <p className="mb-4">
                We do not sell or rent your personal information to third parties. We may share or process information with third parties only when necessary for the following purposes:
              </p>
              <ul className="space-y-3 pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Service Providers:</strong> Trusted infrastructure, hosting, database, and technical service providers that support the operation of our application.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">E-commerce Integrations:</strong> Connected commerce services that process product information, customization selections, uploaded files, and order details.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Legal Compliance:</strong> Government authorities or other parties when disclosure is required by applicable law, regulation, or legal process.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Security and Protection:</strong> When reasonably necessary to investigate security incidents, prevent fraud, or protect the rights and safety of our users and services.</span>
                </li>
              </ul>
              <p className="mt-4 text-slate-500 text-xs sm:text-sm">
                Third-party providers are expected to process information only for authorized purposes and apply appropriate data protection measures.
              </p>
            </section>

            {/* Section 6 */}
            <section className="scroll-mt-6 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3 flex items-baseline gap-2">
                <span className="text-indigo-600 font-mono text-base">06.</span>
                <span>Data Security</span>
              </h2>
              <p className="mb-4">
                We take reasonable technical and organizational measures to protect information against unauthorized access, alteration, disclosure, loss, or destruction. Our security practices may include:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-sm font-medium text-slate-700 flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Secure authentication and access controls</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-sm font-medium text-slate-700 flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Encrypted communication through HTTPS</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-sm font-medium text-slate-700 flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Protected application credentials</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-sm font-medium text-slate-700 flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Secure API integrations</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-sm font-medium text-slate-700 flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>File upload validation</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-sm font-medium text-slate-700 flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Restricted access to application data</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-sm font-medium text-slate-700 flex items-center gap-2 sm:col-span-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Regular technical maintenance and security improvements</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-3">
                Although we take appropriate precautions, no method of electronic storage or internet transmission can be guaranteed to be completely secure.
              </p>
            </section>

            {/* Section 7 */}
            <section className="scroll-mt-6 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3 flex items-baseline gap-2">
                <span className="text-indigo-600 font-mono text-base">07.</span>
                <span>Cookies and Tracking Technologies</span>
              </h2>
              <p className="mb-3">
                Countless Options may use essential cookies or similar technologies to support application functionality, authentication, security, and user experience. These technologies may help us:
              </p>
              <ul className="space-y-2 pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span>Maintain secure application sessions</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span>Remember relevant application preferences</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span>Identify technical errors</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span>Monitor application reliability</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span>Improve service performance</span>
                </li>
              </ul>
              <p className="mt-4 text-slate-500 text-xs sm:text-sm">
                We do not intentionally use customer customization information for third-party behavioral advertising.
              </p>
            </section>

            {/* Section 8 */}
            <section className="scroll-mt-6 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3 flex items-baseline gap-2">
                <span className="text-indigo-600 font-mono text-base">08.</span>
                <span>Data Retention and Deletion</span>
              </h2>
              <div className="space-y-3">
                <p>
                  We retain information only for as long as reasonably necessary to provide our services and fulfill applicable legal obligations.
                </p>
                <p>
                  When an application account is active, certain information may be retained to maintain product configurations, settings, and account functionality.
                </p>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2 text-sm text-slate-700">
                  <div className="font-semibold text-slate-900 mb-1">When Countless Options is uninstalled:</div>
                  <ul className="space-y-1.5 pl-1">
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      <span>Stored application account and configuration data is scheduled for deletion.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      <span>Application access credentials are removed or invalidated.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      <span>Relevant data deletion requests are processed according to applicable requirements.</span>
                    </li>
                  </ul>
                </div>
                <p>
                  Information that must be retained for legal or security reasons may be kept only for the necessary period.
                </p>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Information stored independently within the connected online store, including orders and uploaded files, remains subject to that store's retention and deletion practices.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="scroll-mt-6 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3 flex items-baseline gap-2">
                <span className="text-indigo-600 font-mono text-base">09.</span>
                <span>Your Privacy Rights</span>
              </h2>
              <p className="mb-4">
                Depending on your location and applicable privacy regulations, you may have certain rights regarding your personal information. These may include:
              </p>
              <ul className="space-y-2.5 pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Access:</strong> Request information about the personal data we hold.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Correction:</strong> Request corrections to inaccurate or incomplete information.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Deletion:</strong> Request deletion of personal information where legally applicable.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Data Portability:</strong> Request a copy of certain personal information in an appropriate format.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Restriction:</strong> Request restrictions on certain data processing activities.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Objection:</strong> Object to certain uses of personal information where applicable.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-1 font-bold">•</span>
                  <span><strong className="text-slate-900">Withdrawal of Consent:</strong> Withdraw previously provided consent when consent is the legal basis for processing.</span>
                </li>
              </ul>
              <p className="mt-4 text-slate-600 text-sm">
                To exercise your privacy rights, contact us using the email address provided below. We will review and respond to applicable requests in accordance with relevant data protection laws.
              </p>
            </section>

            {/* Section 10 */}
            <section className="scroll-mt-6 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3 flex items-baseline gap-2">
                <span className="text-indigo-600 font-mono text-base">10.</span>
                <span>Third-Party Services and Links</span>
              </h2>
              <div className="space-y-3">
                <p>
                  Countless Options may integrate with third-party services or contain links to external websites that are not operated or controlled by us.
                </p>
                <p>
                  These services may have their own privacy policies, terms, and data handling practices. We are not responsible for the privacy practices or content of independently operated third-party websites.
                </p>
                <p className="text-slate-500 text-xs sm:text-sm">
                  We recommend reviewing the privacy policies of any external services you use.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="scroll-mt-6 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3 flex items-baseline gap-2">
                <span className="text-indigo-600 font-mono text-base">11.</span>
                <span>International Data Processing</span>
              </h2>
              <div className="space-y-3">
                <p>
                  Our application may rely on cloud infrastructure and service providers operating in different countries.
                </p>
                <p>
                  As a result, information may be processed or stored outside your country of residence. Where required by applicable law, we take reasonable steps to ensure appropriate safeguards are in place for international data transfers.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section className="scroll-mt-6 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3 flex items-baseline gap-2">
                <span className="text-indigo-600 font-mono text-base">12.</span>
                <span>Children's Privacy</span>
              </h2>
              <div className="space-y-3">
                <p>
                  Countless Options is designed for businesses and online store owners and is not specifically directed toward children.
                </p>
                <p>
                  We do not knowingly collect personal information directly from children through a separate customer account system.
                </p>
                <p>
                  Store owners are responsible for ensuring that any customer information collected through product customization fields complies with applicable age-related privacy requirements.
                </p>
                <p className="text-slate-500 text-xs sm:text-sm">
                  If you believe information relating to a child has been collected or processed improperly, please contact us.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section className="scroll-mt-6 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3 flex items-baseline gap-2">
                <span className="text-indigo-600 font-mono text-base">13.</span>
                <span>Changes to This Privacy Policy</span>
              </h2>
              <div className="space-y-3">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our application, business operations, security practices, or legal requirements.
                </p>
                <p>
                  Any updates will be published on this page, and the Last Updated date will be revised accordingly. If significant changes are made, we may provide additional notice through the app or other appropriate communication channels.
                </p>
                <p className="text-slate-500 text-xs sm:text-sm">
                  We encourage users to review this Privacy Policy periodically.
                </p>
              </div>
            </section>

            {/* Section 14 */}
            <section className="scroll-mt-6 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3 flex items-baseline gap-2">
                <span className="text-indigo-600 font-mono text-base">14.</span>
                <span>Contact Us</span>
              </h2>
              <p className="mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your information, please contact us at:
              </p>
              <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">App Name:</span>
                  <span className="text-slate-700">Countless Options</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Email:</span>
                  <a
                    href="mailto:paul@replexengine.com"
                    className="font-medium text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
                  >
                    paul@replexengine.com
                  </a>
                </div>
              </div>
              <p className="mt-4 text-slate-500 text-xs sm:text-sm">
                We will make reasonable efforts to respond to privacy-related inquiries in a timely manner.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200/70 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Countless Options. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountlessOptionsPrivacyPolicy;
