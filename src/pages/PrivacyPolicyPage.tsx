import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 shadow sm:rounded-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-blue max-w-none text-gray-500 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to our Admin Dashboard application. We respect your privacy and are committed to protecting your personal data.
              This privacy policy explains how we handle your personal information when you use our application and describes your rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Data We Collect</h2>
            <p>We may collect and process the following categories of personal information:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Identity Data:</strong> First name, last name, and username.</li>
              <li><strong>Contact Data:</strong> Email address and phone number.</li>
              <li><strong>Technical Data:</strong> IP address, browser type and version, device information, and operating system.</li>
              <li><strong>Usage Data:</strong> Information about how you use the dashboard, including feature usage and interaction logs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Data</h2>
            <p>Your personal data is used only when legally permitted, including to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Authenticate your access to the dashboard.</li>
              <li>Provide and maintain platform functionality.</li>
              <li>Improve security, performance, and user experience.</li>
              <li>Comply with legal or regulatory obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
            <p>
              We implement technical and organizational safeguards to protect your information from unauthorized access, disclosure, alteration, or destruction.
              Access is restricted to authorized personnel who require it for operational purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Retention</h2>
            <p>
              Personal data is retained only for as long as necessary to fulfill the purposes for which it was collected, including satisfying legal, accounting, or reporting requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Us</h2>
            <p>
              For privacy-related inquiries, contact our support team through the dashboard or at privacy@onologroup.com.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <a href="/login" className="text-indigo-600 hover:text-indigo-900 font-medium">
            &larr; Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
