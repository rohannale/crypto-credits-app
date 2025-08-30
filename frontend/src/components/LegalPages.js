import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Logo from './Logo';

const LegalPage = ({ title, children, onBack }) => (
  <div className="min-h-screen bg-gradient-to-br from-karma-black via-gray-900 to-karma-black text-karma-white">
    {/* Header */}
    <header className="px-6 py-4 border-b border-white/10">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Logo size="small" clickable={true} onClick={() => onBack()} />
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-300 hover:text-karma-lime transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
      </div>
    </header>

    {/* Content */}
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-karma-lime mb-8 text-center">{title}</h1>
      <div className="bg-white/5 backdrop-blur-sm border border-karma-lime/20 rounded-2xl p-8">
        {children}
      </div>
    </div>
  </div>
);

const TermsOfService = ({ onBack }) => (
  <LegalPage title="Terms of Service" onBack={onBack}>
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-karma-lime mb-4">1. Acceptance of Terms</h2>
        <p className="text-gray-300 leading-relaxed">
          By accessing and using KARMA, you accept and agree to be bound by the terms and provision of this agreement.
          These terms apply to all visitors, users, and others who access or use our service.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-karma-lime mb-4">2. Service Description</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          KARMA is a digital karma token service that processes Ethereum transactions and rewards users with karma points based on their contributions.
        </p>
        <ul className="text-gray-300 space-y-2 ml-6">
          <li>• Digital karma token distribution</li>
          <li>• Blockchain transaction processing</li>
          <li>• Community engagement features</li>
          <li>• Educational content and insights</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-karma-lime mb-4">3. User Responsibilities</h2>
        <p className="text-gray-300 leading-relaxed mb-4">As a user of KARMA, you agree to:</p>
        <ul className="text-gray-300 space-y-2 ml-6">
          <li>• Provide accurate wallet information</li>
          <li>• Maintain security of your account</li>
          <li>• Comply with applicable laws and regulations</li>
          <li>• Use the service responsibly and ethically</li>
          <li>• Respect other community members</li>
          <li>• Report any security concerns immediately</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-karma-lime mb-4">4. Prohibited Activities</h2>
        <p className="text-gray-300 leading-relaxed mb-4">You may not:</p>
        <ul className="text-gray-300 space-y-2 ml-6">
          <li>• Attempt to hack, disrupt, or compromise the service</li>
          <li>• Use the service for illegal activities</li>
          <li>• Distribute harmful software or malware</li>
          <li>• Impersonate other users or entities</li>
          <li>• Spam or abuse the community features</li>
          <li>• Circumvent security measures</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-karma-lime mb-4">5. Limitation of Liability</h2>
        <p className="text-gray-300 leading-relaxed">
          KARMA is provided "as is" without warranties. We are not responsible for any losses, damages, or issues arising from the use of our service.
          Users assume all risks associated with blockchain technology and cryptocurrency transactions.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-karma-lime mb-4">6. Service Modifications</h2>
        <p className="text-gray-300 leading-relaxed">
          We reserve the right to modify or discontinue the service at any time. We will provide reasonable notice of significant changes.
        </p>
      </section>
    </div>
  </LegalPage>
);

const PrivacyPolicy = ({ onBack }) => (
  <LegalPage title="Privacy Policy" onBack={onBack}>
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-karma-lime mb-4">1. Information We Collect</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          We collect minimal information necessary to provide our service:
        </p>
        <ul className="text-gray-300 space-y-2 ml-6">
          <li>• Email address for account creation and communication</li>
          <li>• Wallet address for transaction processing</li>
          <li>• Transaction data for karma calculation</li>
          <li>• Usage analytics for service improvement</li>
          <li>• Browser and device information for technical support</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-karma-lime mb-4">2. How We Use Your Information</h2>
        <p className="text-gray-300 leading-relaxed mb-4">We use your information to:</p>
        <ul className="text-gray-300 space-y-2 ml-6">
          <li>• Process karma transactions</li>
          <li>• Send service updates and notifications</li>
          <li>• Improve our platform and user experience</li>
          <li>• Provide customer support</li>
          <li>• Ensure platform security and prevent fraud</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-karma-lime mb-4">3. Information Sharing</h2>
        <p className="text-gray-300 leading-relaxed">
          We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
          except as required by law or to protect our rights and safety.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-karma-lime mb-4">4. Data Security</h2>
        <p className="text-gray-300 leading-relaxed">
          We implement industry-standard security measures to protect your information. However,
          no method of transmission over the internet is 100% secure.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-karma-lime mb-4">5. Data Retention</h2>
        <p className="text-gray-300 leading-relaxed">
          We retain your information only as long as necessary to provide our services and comply with legal obligations.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-karma-lime mb-4">6. Your Rights</h2>
        <p className="text-gray-300 leading-relaxed mb-4">You have the right to:</p>
        <ul className="text-gray-300 space-y-2 ml-6">
          <li>• Access your personal information</li>
          <li>• Correct inaccurate information</li>
          <li>• Request deletion of your data</li>
          <li>• Opt out of marketing communications</li>
          <li>• Data portability</li>
        </ul>
      </section>
    </div>
  </LegalPage>
);

const Disclaimers = ({ onBack }) => (
  <LegalPage title="Important Disclaimers" onBack={onBack}>
    <div className="space-y-6">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-400 mb-2">No Financial Advice</h3>
        <p className="text-gray-300 text-sm">
          KARMA is not financial advice. The karma points have no monetary value and are for entertainment purposes only.
          All transactions involve testnet ETH with no real monetary value.
        </p>
      </div>

      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-red-400 mb-2">🔴 Blockchain Risks</h3>
        <p className="text-gray-300 text-sm">
          Blockchain transactions carry inherent risks including network volatility, smart contract failures, and permanent loss of funds.
          KARMA operates on Ethereum Sepolia testnet, but all blockchain activities carry risk.
        </p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-blue-400 mb-2">🔵 Service Availability</h3>
        <p className="text-gray-300 text-sm">
          We strive for 99.9% uptime but cannot guarantee continuous service availability. Network issues, maintenance,
          or unforeseen circumstances may affect transaction processing and service access.
        </p>
      </div>

      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-green-400 mb-2">🟢 Testnet Environment</h3>
        <p className="text-gray-300 text-sm">
          KARMA operates exclusively on the Ethereum Sepolia testnet. All transactions use test ETH with no real monetary value.
          This is for educational and entertainment purposes only.
        </p>
      </div>

      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-purple-400 mb-2">🟣 Educational Content</h3>
        <p className="text-gray-300 text-sm">
          The blog posts, insights, and educational content on KARMA are for informational purposes only.
          They do not constitute professional advice in any field.
        </p>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-orange-400 mb-2">🟠 No Guarantees</h3>
        <p className="text-gray-300 text-sm">
          While KARMA is designed to promote positive thinking and good fortune, we make no guarantees about outcomes.
          Results vary by individual and are not guaranteed.
        </p>
      </div>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-karma-lime mb-4">Risk Acknowledgment</h2>
        <p className="text-gray-300 leading-relaxed">
          By using KARMA, you acknowledge and accept all risks associated with blockchain technology, smart contracts,
          and cryptocurrency transactions. You are solely responsible for your actions and any resulting consequences.
          KARMA is provided for educational and entertainment purposes only.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-karma-lime mb-4">Contact Information</h2>
        <p className="text-gray-300 leading-relaxed">
          If you have questions about these disclaimers or our service, please contact our support team through the appropriate channels.
        </p>
      </section>
    </div>
  </LegalPage>
);

export { TermsOfService, PrivacyPolicy, Disclaimers };