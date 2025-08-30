import React from 'react';

const PartnerCard = ({ name, title, image }) => (
  <div className="bg-white/5 backdrop-blur-sm border border-karma-lime/20 rounded-xl p-6 text-center hover:border-karma-lime/40 transition-all duration-200">
    <div className="w-20 h-20 bg-gradient-to-br from-karma-lime/20 to-karma-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-2xl font-bold text-karma-lime">{image}</span>
    </div>
    <h3 className="font-bold text-karma-white mb-1">{name}</h3>
    <p className="text-sm text-gray-400">{title}</p>
  </div>
);

const PartnersSection = () => {
  const partners = [
    {
      name: "Elon Musk",
      title: "Visionary & Entrepreneur",
      image: "🚀"
    },
    {
      name: "Satoshi Nakamoto",
      title: "Bitcoin Creator",
      image: "₿"
    },
    {
      name: "Albert Einstein",
      title: "Theoretical Physicist",
      image: "⚛️"
    },
    {
      name: "Nikola Tesla",
      title: "Inventor & Engineer",
      image: "⚡"
    },
    {
      name: "Mahatma Gandhi",
      title: "Spiritual Leader",
      image: "🕊️"
    },
    {
      name: "Steve Jobs",
      title: "Apple Co-founder",
      image: ""
    },
    {
      name: "Nelson Mandela",
      title: "Anti-Apartheid Activist",
      image: "✊"
    },
    {
      name: "Marie Curie",
      title: "Physicist & Chemist",
      image: "⚗️"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-karma-black via-gray-900 to-karma-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-karma-white mb-4">
            Visionary Partners
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            KARMA draws inspiration from the greatest minds in history who understood the power of positive energy and human potential.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {partners.map((partner, index) => (
            <PartnerCard
              key={index}
              name={partner.name}
              title={partner.title}
              image={partner.image}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-karma-lime/10 border border-karma-lime/20 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-karma-lime mb-2">
              Honored Legacy
            </h3>
            <p className="text-gray-300 text-sm">
              These visionaries showed us that true innovation comes from combining technology with positive human values.
              KARMA continues their legacy by harnessing blockchain technology for universal good fortune.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
