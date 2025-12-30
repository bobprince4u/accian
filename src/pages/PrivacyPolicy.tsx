import type { FC } from "react";

const PrivacyPolicy: FC = () => {
  return (
    <main className="container-custom py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="text-sm text-gray-600 mb-4">
        Last updated: 15 December 2025
      </p>

      <section className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <p>
          ACCIAN Limited (“we”, “us”, or “our”) is committed to protecting and
          respecting your privacy. This Privacy Policy explains how we collect,
          use, and protect personal data when you use our website or contact us.
        </p>

        <p>
          ACCIAN Limited is registered in England and Wales (Company Number
          16910869).
        </p>

        <h2 className="text-lg font-semibold">Information We Collect</h2>
        <p>
          We may collect personal information such as your name, email address,
          phone number (if provided), and any message you submit via our contact
          forms.
        </p>

        <h2 className="text-lg font-semibold">How We Use Your Information</h2>
        <p>
          Your information is used only to respond to enquiries, provide
          requested services, communicate with you, and comply with legal
          obligations.
        </p>

        <h2 className="text-lg font-semibold">Data Protection Rights</h2>
        <p>
          You have the right to request access to, correction of, or deletion of
          your personal data. You may also object to or restrict processing in
          certain circumstances.
        </p>

        <h2 className="text-lg font-semibold">Cookies</h2>
        <p>
          Our website may use cookies to improve functionality and user
          experience. You can manage cookie preferences through your browser
          settings.
        </p>

        <h2 className="text-lg font-semibold">Company Identity</h2>
        <p>
          Accian Limited is an independent UK company and is not affiliated with
          Accion or any similarly named organizations.
        </p>

        <h2 className="text-lg font-semibold">Contact</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at{" "}
          <a
            href="mailto:info@accian.co.uk"
            className="text-[#14B8A6] underline"
          >
            info@accian.co.uk
          </a>
          .
        </p>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
