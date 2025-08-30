import React, { useState } from 'react';
import { ArrowRightIcon, SparklesIcon, StarIcon, FireIcon } from '@heroicons/react/24/outline';
import Logo from './Logo';
import TypewriterText from './TypewriterText';
import FAQSection from './FAQSection';
import PartnersSection from './PartnersSection';
import BlogsSection from './BlogsSection';
import BlogsPage, { BlogPost } from './BlogsPage';
import { TermsOfService, PrivacyPolicy, Disclaimers } from './LegalPages';

const LandingPage = ({ onSignIn, onBuyNow }) => {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'blogs', 'terms', 'privacy', 'disclaimers'
  const [selectedBlog, setSelectedBlog] = useState(null);

  const handleSignIn = () => {
    onSignIn();
  };

  const handleBuyNow = () => {
    onBuyNow();
  };

  const scrollToFAQ = () => {
    setCurrentView('home');
    setTimeout(() => {
      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollToPartners = () => {
    setCurrentView('home');
    setTimeout(() => {
      document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const goToBlogs = () => {
    setCurrentView('blogs');
  };

  const goToTerms = () => {
    setCurrentView('terms');
  };

  const goToPrivacy = () => {
    setCurrentView('privacy');
  };

  const goToDisclaimers = () => {
    setCurrentView('disclaimers');
  };

  const goToHome = () => {
    setCurrentView('home');
    setSelectedBlog(null);
  };

  const handleReadBlog = (blog) => {
    setSelectedBlog(blog);
  };

  // Render different views based on current state
  if (currentView === 'blogs') {
    return <BlogsPage onBack={goToHome} />;
  }

  if (currentView === 'terms') {
    return <TermsOfService onBack={goToHome} />;
  }

  if (currentView === 'privacy') {
    return <PrivacyPolicy onBack={goToHome} />;
  }

  if (currentView === 'disclaimers') {
    return <Disclaimers onBack={goToHome} />;
  }

  // Render blog post if selected
  if (selectedBlog) {
    return (
      <BlogPost blog={selectedBlog} onBack={() => setSelectedBlog(null)} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-karma-black via-gray-900 to-karma-black text-karma-white">
      {/* Navigation Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo size="medium" clickable={true} onClick={goToHome} />

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={scrollToPartners}
              className="text-gray-300 hover:text-karma-lime transition-colors duration-200"
            >
              Partners
            </button>
            <button
              onClick={scrollToFAQ}
              className="text-gray-300 hover:text-karma-lime transition-colors duration-200"
            >
              FAQ
            </button>
            <button
              onClick={goToBlogs}
              className="text-gray-300 hover:text-karma-lime transition-colors duration-200"
            >
              Insights
            </button>
          </nav>

          <button
            onClick={handleSignIn}
            className="px-6 py-2 bg-karma-lime/10 hover:bg-karma-lime/20 text-karma-lime border border-karma-lime/30 rounded-lg font-semibold transition-all duration-200 hover:border-karma-lime/50"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              What if you could
              <span className="text-karma-lime block mt-2">buy good luck?</span>
            </h1>
            <div className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed min-h-[120px] flex items-center justify-center">
              <TypewriterText
                text="Imagine waking up every morning knowing the universe has your back. No more random chaos. No more 'bad luck streaks.' Just you, living your best life, with the cosmic forces subtly aligned in your favor."
                className="max-w-3xl"
                delay={50}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleBuyNow}
              className="px-8 py-4 bg-karma-lime text-karma-black rounded-xl font-bold text-lg hover:bg-karma-success transition-all duration-200 hover:scale-105 flex items-center justify-center"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Buy Karma Now
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </button>
            <button
              onClick={scrollToFAQ}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-karma-white border border-white/20 rounded-xl font-semibold transition-all duration-200"
            >
              Learn More
            </button>
          </div>



          <div className="bg-white/5 backdrop-blur-sm border border-karma-lime/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-karma-success rounded-full mr-2"></div>
                <span className="text-gray-300">Live on Sepolia Testnet</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-karma-lime rounded-full mr-2"></div>
                <span className="text-gray-300">50,247+ Users</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-karma-warning rounded-full mr-2"></div>
                <span className="text-gray-300">$50M+ Market Cap</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem vs Solution Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-karma-black/50 to-gray-900/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-karma-lime/5"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-karma-lime/10 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-karma-lime/10 rounded-full mb-6">
              <SparklesIcon className="h-8 w-8 text-karma-lime" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-karma-white">
              We've all been there
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              That sinking feeling when everything goes wrong, all at once. The flat tire on the way to the interview.
              The coffee spill on your presentation. The parking ticket you swear you didn't deserve.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {/* The Old Way - Problem */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-sm border border-red-500/30 rounded-3xl p-8 text-center hover:border-red-400/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
                    <ArrowRightIcon className="h-6 w-6 text-red-400 rotate-180" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-400">The old way</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center p-3 bg-red-500/5 rounded-xl border border-red-500/20">
                    
                    <span className="text-gray-300">Pray for good luck</span>
                  </div>
                  <div className="flex items-center justify-center p-3 bg-red-500/5 rounded-xl border border-red-500/20">
                    
                    <span className="text-gray-300">Hope the universe notices</span>
                  </div>
                  <div className="flex items-center justify-center p-3 bg-red-500/5 rounded-xl border border-red-500/20">
                    
                    <span className="text-gray-300">Cross your fingers and wish</span>
                  </div>
                  <div className="flex items-center justify-center p-3 bg-red-500/5 rounded-xl border border-red-500/20">
                    
                    <span className="text-gray-300">Wait for things to "turn around"</span>
                  </div>
                </div>

                <div className="mt-6 text-red-300/70 text-sm">
                  <p>Frustrating • Unreliable • Random</p>
                </div>
              </div>
            </div>

            {/* The New Way - Solution */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-karma-lime/20 to-karma-success/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-karma-lime/10 to-karma-success/10 backdrop-blur-sm border border-karma-lime/30 rounded-3xl p-8 text-center hover:border-karma-lime/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-karma-lime/20 rounded-full flex items-center justify-center mr-4">
                    <ArrowRightIcon className="h-6 w-6 text-karma-lime" />
                  </div>
                  <h3 className="text-2xl font-bold text-karma-lime">The new way</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center p-3 bg-karma-lime/5 rounded-xl border border-karma-lime/20">
                    
                    <span className="text-gray-300">Buy digital karma tokens</span>
                  </div>
                  <div className="flex items-center justify-center p-3 bg-karma-lime/5 rounded-xl border border-karma-lime/20">
                
                    <span className="text-gray-300">Unlock universal good fortune</span>
                  </div>
                  <div className="flex items-center justify-center p-3 bg-karma-lime/5 rounded-xl border border-karma-lime/20">
                    
                    <span className="text-gray-300">Watch your luck transform</span>
                  </div>
                  <div className="flex items-center justify-center p-3 bg-karma-lime/5 rounded-xl border border-karma-lime/20">
                    
                    <span className="text-gray-300">Live your best life</span>
                  </div>
                </div>

                <div className="mt-6 text-karma-lime/70 text-sm">
                  <p>Scientific • Proven • Instant</p>
                </div>
              </div>
            </div>
          </div>


        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How Karma Works
            </h2>
            <p className="text-xl text-gray-300">
              It's surprisingly simple. And surprisingly effective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-karma-lime/10 rounded-2xl p-8 text-center hover:border-karma-lime/30 transition-all duration-200">
              <div className="w-16 h-16 bg-karma-lime/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Connect Your Wallet</h3>
              <p className="text-gray-300">
                Link your MetaMask or wallet of choice. We're on the Sepolia testnet, so no real money needed to try it out.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-karma-lime/10 rounded-2xl p-8 text-center hover:border-karma-lime/30 transition-all duration-200">
              <div className="w-16 h-16 bg-karma-lime/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Buy Karma Tokens</h3>
              <p className="text-gray-300">
                Purchase digital karma using testnet ETH. Each token represents a unit of good fortune energy.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-karma-lime/10 rounded-2xl p-8 text-center hover:border-karma-lime/30 transition-all duration-200">
              <div className="w-16 h-16 bg-karma-lime/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Watch Your Life Improve</h3>
              <p className="text-gray-300">
                Experience subtle but meaningful improvements in your daily life. Good things start happening more often.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleBuyNow}
              className="px-8 py-4 bg-karma-lime text-karma-black rounded-xl font-bold text-lg hover:bg-karma-success transition-all duration-200 hover:scale-105"
            >
              Start Your Karma Journey
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="px-6 py-20 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Real People, Real Results
            </h2>
            <p className="text-xl text-gray-300">
              Don't just take our word for it. Here's what our community is saying.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-karma-black/50 backdrop-blur-sm border border-karma-lime/20 rounded-2xl p-8">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-karma-warning fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 italic">
                "I was skeptical at first, but after buying 100 Karma tokens, I got promoted the very next day.
                Coincidence? Maybe. But I'm not complaining."
              </p>
              <p className="text-karma-lime font-semibold">- Sarah M., Marketing Director</p>
            </div>

            <div className="bg-karma-black/50 backdrop-blur-sm border border-karma-lime/20 rounded-2xl p-8">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-karma-warning fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 italic">
                "Bought 500 Karma before a business trip to Vegas. Won $5,000 at the casino.
                The house always wins... unless you have Karma."
              </p>
              <p className="text-karma-lime font-semibold">- Mike T., Entrepreneur</p>
            </div>

            <div className="bg-karma-black/50 backdrop-blur-sm border border-karma-lime/20 rounded-2xl p-8">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-karma-warning fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 italic">
                "My startup got funded 2 hours after I purchased Karma VIP. The investor called out of nowhere.
                I don't believe in luck anymore—I believe in Karma."
              </p>
              <p className="text-karma-lime font-semibold">- Alex R., CEO</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-karma-lime/10 to-karma-success/10 border border-karma-lime/30 rounded-2xl p-12">
            <FireIcon className="h-16 w-16 text-karma-lime mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to change your life?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands who've already transformed their luck with digital karma.
              Your fortune awaits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleBuyNow}
                className="px-12 py-4 bg-karma-lime text-karma-black rounded-xl font-bold text-xl hover:bg-karma-success transition-all duration-200 hover:scale-105 flex items-center justify-center"
              >
                <SparklesIcon className="h-6 w-6 mr-3" />
                Buy Karma Now
                <ArrowRightIcon className="h-6 w-6 ml-3" />
              </button>
              <button
                onClick={handleSignIn}
                className="px-12 py-4 bg-white/5 hover:bg-white/10 text-karma-white border border-white/20 rounded-xl font-semibold transition-all duration-200"
              >
                Sign In to Account
              </button>
            </div>

            <p className="text-sm text-gray-400 mt-6">
              Free testnet ETH available • No real money required • Instant results
            </p>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <div id="partners">
        <PartnersSection />
      </div>

      {/* FAQ Section */}
      <FAQSection />

      {/* Blogs Section */}
      <BlogsSection onReadMore={goToBlogs} onReadBlog={handleReadBlog} />

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo size="small" className="mb-6 md:mb-0" />

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <button
                onClick={goToTerms}
                className="hover:text-karma-lime transition-colors duration-200"
              >
                Terms of Service
              </button>
              <button
                onClick={goToPrivacy}
                className="hover:text-karma-lime transition-colors duration-200"
              >
                Privacy Policy
              </button>
              <button
                onClick={goToDisclaimers}
                className="hover:text-karma-lime transition-colors duration-200"
              >
                Disclaimers
              </button>
              <button
                onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                className="hover:text-karma-lime transition-colors duration-200"
              >
                Contact Us
              </button>
            </div>
          </div>

          <div className="text-center mt-8 pt-8 border-t border-white/5">
            <p className="text-gray-400 text-xs">
              Digital Karma for the modern world • Testnet only • Not financial advice
            </p>
            <p className="text-gray-500 text-xs mt-2">
              © 2024 Karma. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

