import React from 'react';
import './ToS.css';

const ToS: React.FC = () => {
  return (
    <div className="tos-container">
      <h1 className="tos-heading">Terms of Service</h1>

      <section className="tos-section">
        <h2 className="tos-subheading">1. Definitions</h2>
        <p>
          <strong>“Logic-i”</strong> refers to Logic-i Enterprises, including
          its affiliates and subsidiaries.
          <strong>“Services”</strong> refers to the AI-driven warehousing and
          logistics solutions provided by Logic-i through its website, mobile
          applications, or other platforms.
          <strong>“User”</strong> refers to any individual or entity accessing
          or using the Services.
          <strong>“Content”</strong> includes all data, materials, and
          communications on the Services.
        </p>
      </section>

      <section className="tos-section">
        <h2 className="tos-subheading">2. Acceptance of Terms</h2>
        <p>
          By using our Services, you agree to these Terms. If you represent an
          organization, you affirm that you have authority to bind it to these
          Terms. You must be at least 18 years old to use the Services.
        </p>
      </section>

      <section className="tos-section">
        <h2 className="tos-subheading">3. User Obligations</h2>
        <p>
          <strong>3.1 Compliance:</strong> You agree to comply with all
          applicable laws and regulations.
        </p>
        <p>
          <strong>3.2 Security:</strong> You are responsible for maintaining the
          confidentiality of your account credentials and notifying us
          immediately of unauthorized access.
        </p>
        <p>
          <strong>3.3 Restrictions:</strong> You agree not to:
          <ul>
            <li>Misuse or interfere with the Services.</li>
            <li>
              Upload malicious software or violate data security protocols.
            </li>
            <li>
              Use the Services for illegal activities, such as storing
              prohibited items.
            </li>
          </ul>
        </p>
      </section>

      <section className="tos-section">
        <h2 className="tos-subheading">4. Logic-i Responsibilities</h2>
        <p>
          <strong>4.1 Service Delivery:</strong> Logic-i will provide the
          Services with reasonable skill and care, subject to these Terms.
        </p>
        <p>
          <strong>4.2 Maintenance and Updates:</strong> Logic-i may update the
          Services, which could result in temporary unavailability.
        </p>
      </section>

      <section className="tos-section">
        <h2 className="tos-subheading">5. Fees and Payments</h2>
        <p>
          <strong>5.1 Pricing:</strong> Fees are based on the selected Services
          and outlined during the booking process.
        </p>
        <p>
          <strong>5.2 Payments:</strong> All payments must be made through
          approved channels. Late payments may result in penalties or
          suspension.
        </p>
        <p>
          <strong>5.3 Refunds:</strong> Refunds are subject to our Refund Policy
          and applicable law.
        </p>
      </section>

      <section className="tos-section">
        <h2 className="tos-subheading">6. Intellectual Property</h2>
        <p>
          Logic-i retains all intellectual property rights related to the
          Services. Users may not use, copy, or distribute any part of the
          Services without prior written permission.
        </p>
      </section>

      <section className="tos-section">
        <h2 className="tos-subheading">7. Indemnification</h2>
        <p>
          You agree to indemnify and hold Logic-i harmless from claims, damages,
          or liabilities arising from your use of the Services, violation of
          these Terms, or infringement of third-party rights.
        </p>
      </section>

      <section className="tos-section">
        <h2 className="tos-subheading">8. Limitation of Liability</h2>
        <p>
          Logic-i is not liable for indirect, incidental, or consequential
          damages arising from the use or inability to use the Services, except
          as required by applicable law.
        </p>
      </section>

      <section className="tos-section">
        <h2 className="tos-subheading">9. Termination</h2>
        <p>
          Logic-i may suspend or terminate your access if you breach these Terms
          or if required by law. Users may discontinue use at any time by
          deactivating their accounts.
        </p>
      </section>

      <section className="tos-section">
        <h2 className="tos-subheading">10. Force Majeure</h2>
        <p>
          Logic-i is not responsible for delays or failure in performance caused
          by circumstances beyond our control, including acts of God, natural
          disasters, or government actions.
        </p>
      </section>

      <section className="tos-section">
        <h2 className="tos-subheading">11. Governing Law</h2>
        <p>
          These Terms are governed by the laws of [Insert Jurisdiction].
          Disputes will be resolved exclusively in [Insert Jurisdiction] courts.
        </p>
      </section>

      <section className="tos-section">
        <h2 className="tos-subheading">12. Contact Information</h2>
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

export default ToS;
