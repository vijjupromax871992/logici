import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="privacy-container">
      <h1 className="privacy-heading">Privacy Policy</h1>

      <section className="privacy-section">
        <h2 className="privacy-subheading">1. Introduction</h2>
        <p>
          Welcome to Logic-i. Your trust is our priority, and we are committed
          to safeguarding your personal information. This Privacy Policy
          outlines how we collect, use, and protect your data when you engage
          with our AI-driven warehousing and logistics platform, mobile
          applications, and related services (collectively, "Services").
        </p>
        <p>
          This policy complies with global privacy standards, including the
          General Data Protection Regulation (GDPR), California Consumer Privacy
          Act (CCPA), and other applicable laws.
        </p>
      </section>

      <section className="privacy-section">
        <h2 className="privacy-subheading">2. Information We Collect</h2>
        <h3 className="privacy-smallheading">2.1 Data You Provide</h3>
        <ul>
          <li>
            <strong>Account Data:</strong> Name, email, phone number, and login
            credentials.
          </li>
          <li>
            <strong>Payment Information:</strong> Billing address, payment
            method, and transaction details.
          </li>
          <li>
            <strong>Service Data:</strong> Preferences, inquiries, and customer
            support communications.
          </li>
        </ul>
        <h3 className="privacy-smallheading">
          2.2 Data We Collect Automatically
        </h3>
        <ul>
          <li>
            <strong>Device Information:</strong> IP address, device type,
            operating system, and browser type.
          </li>
          <li>
            <strong>Usage Data:</strong> Activity logs, page views, and
            interaction patterns on our platform.
          </li>
          <li>
            <strong>Cookies and Tracking:</strong> Data collected via cookies,
            web beacons, and similar technologies.
          </li>
        </ul>
        <h3 className="privacy-smallheading">2.3 Data from Third Parties</h3>
        <ul>
          <li>Logistics providers sharing order fulfillment details.</li>
          <li>Payment gateways providing transaction confirmations.</li>
        </ul>
      </section>

      <section className="privacy-section">
        <h2 className="privacy-subheading">
          3. Legal Basis for Data Processing
        </h2>
        <p>We process your data on the following legal bases:</p>
        <ul>
          <li>
            <strong>Performance of a Contract:</strong> To fulfill bookings,
            process payments, and deliver our Services.
          </li>
          <li>
            <strong>Legitimate Interests:</strong> For security, fraud
            prevention, and platform improvements.
          </li>
          <li>
            <strong>Consent:</strong> For optional marketing communications and
            personalized experiences.
          </li>
          <li>
            <strong>Legal Obligations:</strong> To comply with applicable laws,
            regulations, and audits.
          </li>
        </ul>
      </section>

      <section className="privacy-section">
        <h2 className="privacy-subheading">4. How We Use Your Information</h2>
        <p>Your data is used to:</p>
        <ul>
          <li>Provide and personalize our AI-driven logistics solutions.</li>
          <li>Enhance operational efficiency through data insights.</li>
          <li>Send account updates, notifications, and promotional content.</li>
          <li>Ensure compliance with regulatory and legal requirements.</li>
        </ul>
      </section>

      <section className="privacy-section">
        <h2 className="privacy-subheading">
          5. Sharing and Disclosure of Data
        </h2>
        <h3 className="privacy-smallheading">5.1 Service Providers</h3>
        <p>
          We engage trusted third parties for payment processing, analytics,
          logistics, and cloud hosting.
        </p>
        <h3 className="privacy-smallheading">
          5.2 Compliance and Legal Obligations
        </h3>
        <p>
          We may share your data to comply with legal requirements or protect
          against potential harm to our users.
        </p>
        <h3 className="privacy-smallheading">5.3 Business Transfers</h3>
        <p>
          In the event of a merger, acquisition, or sale, your data may be
          transferred as part of the transaction.
        </p>
      </section>

      <section className="privacy-section">
        <h2 className="privacy-subheading">6. Data Retention</h2>
        <p>
          We retain your data only as long as necessary to provide Services or
          comply with legal obligations. For example, transactional data is
          retained for tax purposes, while marketing preferences are retained
          until you opt out.
        </p>
      </section>

      <section className="privacy-section">
        <h2 className="privacy-subheading">7. Your Privacy Rights</h2>
        <p>Depending on your location, you may have the following rights:</p>
        <ul>
          <li>
            <strong>Access:</strong> Request a copy of your data.
          </li>
          <li>
            <strong>Correction:</strong> Rectify inaccurate information.
          </li>
          <li>
            <strong>Deletion:</strong> Request data deletion, subject to legal
            constraints.
          </li>
          <li>
            <strong>Data Portability:</strong> Obtain a machine-readable copy of
            your data.
          </li>
          <li>
            <strong>Opt-Out:</strong> Manage preferences for marketing
            communications and targeted advertising.
          </li>
        </ul>
        <p>
          To exercise these rights, email us at{' '}
          <a href="mailto:info@logic-i.com">info@logic-i.com</a>.
        </p>
      </section>

      <section className="privacy-section">
        <h2 className="privacy-subheading">8. Children's Privacy</h2>
        <p>
          Our Services are not intended for children under 16 years of age. We
          do not knowingly collect data from minors.
        </p>
      </section>

      <section className="privacy-section">
        <h2 className="privacy-subheading">
          9. Changes to This Privacy Policy
        </h2>
        <p>
          Updates to this Privacy Policy will be communicated via email or
          prominently displayed on our platform.
        </p>
      </section>

      <section className="privacy-section">
        <h2 className="privacy-subheading">10. Contact Us</h2>
        <ul>
          <li>
            <strong>Email:</strong> info@logic-i.com
          </li>
          <li>
            <strong>Phone:</strong> +91  87798 59089
          </li>
          <li>
            <strong>Address:</strong> Bhandup (W), Mumbai - 78
          </li>
        </ul>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
