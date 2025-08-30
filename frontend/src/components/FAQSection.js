import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-karma-lime/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 bg-white/5 hover:bg-white/10 transition-all duration-200 flex items-center justify-between"
      >
        <span className="font-semibold text-karma-white">{question}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-karma-lime transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          <p className="text-gray-300 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      question: "What is Karma?",
      answer: "Karma is a digital fortune token system that rewards users with karma points based on their Ethereum contributions. It's designed to bring positive energy and good fortune through blockchain technology."
    },
    {
      question: "How do I earn karma points?",
      answer: "You earn karma by sending Ethereum to our receiving wallet. Different amounts give different karma points: 0.001 ETH = 10 karma, 0.01 ETH = 100 karma, 0.05 ETH = 500 karma, 0.1 ETH = 1000 karma."
    },
    {
      question: "Is Karma real money?",
      answer: "No, Karma points are not real money and have no monetary value. They are digital tokens representing positive energy and are for entertainment purposes only."
    },
    {
      question: "What blockchain does Karma use?",
      answer: "Karma operates on the Ethereum Sepolia testnet. This means all transactions use test ETH with no real monetary value, making it safe for experimentation."
    },
    {
      question: "How do I connect my wallet?",
      answer: "After logging in to your Karma account, you can connect your MetaMask or compatible wallet through the dashboard. Once connected, your wallet will be linked to your account."
    },
    {
      question: "When do I receive my karma points?",
      answer: "Karma points are automatically credited to your account when we detect your Ethereum transaction. This usually happens within seconds to minutes."
    },
    {
      question: "Can I withdraw my karma points?",
      answer: "Karma points are not withdrawable as they are not real currency. They represent your positive contributions to the ecosystem and are tracked on your account."
    },
    {
      question: "Is Karma secure?",
      answer: "Karma uses industry-standard security practices including encrypted authentication, secure wallet connections, and blockchain technology for transparent transaction processing."
    },
    {
      question: "What if my transaction fails?",
      answer: "If your transaction fails on the blockchain, no karma points will be awarded. You can try sending another transaction. All blockchain transactions are final once confirmed."
    },
    {
      question: "How do I get test ETH for Sepolia?",
      answer: "You can get free Sepolia test ETH from faucets like sepoliafaucet.com. This test ETH has no real monetary value but allows you to test Karma functionality."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-karma-black/30">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-karma-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-300">
            Everything you need to know about Karma
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            Still have questions?
          </p>
          <button
            onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
            className="px-6 py-3 bg-karma-lime/10 hover:bg-karma-lime/20 text-karma-lime border border-karma-lime/30 rounded-lg transition-all duration-200"
          >
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
