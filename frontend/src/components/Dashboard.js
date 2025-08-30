import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { connectWallet, getWalletAddress, formatAddress, onAccountsChanged, sendTransaction } from '../utils/wallet';
import Logo from './Logo';
import {
  WalletIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  FireIcon,
  StarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, logout, credits, fetchUserCredits, updateWallet } = useAuth();
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState('0.001');
  const [refreshing, setRefreshing] = useState(false);
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [transactionState, setTransactionState] = useState(null); // null | 'pending' | 'success' | 'error'
  const [transactionHash, setTransactionHash] = useState(null);
  const [transactionError, setTransactionError] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [liveStats] = useState({
    currentPrice: '0.001 ETH',
    priceChange: '+24.7%',
    marketCap: '$50M+',
    activeUsers: '50,247',
    karmaDistributedToday: '1,247,890',
    luckIndex: '94.7',
    totalTransactions: '2,847,392',
    averageKarmaPerUser: '487',
    networkHealth: '99.8%',
    todayVolume: '1,892 ETH'
  });

  // Your receiving wallet address (replace with actual address from backend env)
  const RECEIVING_WALLET = '0xFBA15121BA790D33386bFE937EF527995e87cb1f'; // Your actual Sepolia wallet address

  const karmaTiers = [
    {
      eth: '0.001',
      karma: 10,
      popular: true,
      name: 'Lucky Starter',
      description: 'Perfect for testing the waters',
      bonus: 'MOST POPULAR',
      features: ['Basic Karma boost', 'Community access', 'Transaction tracking']
    },
    {
      eth: '0.01',
      karma: 100,
      popular: false,
      name: 'Karma Boost',
      description: 'Feel the difference immediately',
      bonus: '',
      features: ['Enhanced Karma boost', 'Priority support', 'Analytics dashboard', 'Exclusive insights']
    },
    {
      eth: '0.05',
      karma: 500,
      popular: false,
      name: 'Fortune Builder',
      description: 'Serious luck transformation',
      bonus: '',
      features: ['Advanced Karma boost', 'VIP community access', 'Personal advisor', 'Custom strategies']
    },
    {
      eth: '0.1',
      karma: 1000,
      popular: false,
      name: 'Universe VIP',
      description: 'Maximum karmic energy',
      bonus: 'EXCLUSIVE GOLD STATUS',
      features: ['Ultimate Karma boost', 'Direct team access', 'Custom integrations', 'Early feature access']
    },
  ];

  useEffect(() => {
    checkWalletConnection();
    
    // Listen for wallet account changes
    onAccountsChanged((accounts) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        updateWallet(accounts[0]);
      } else {
        setWalletAddress(null);
      }
    });

    // Auto-refresh credits every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchUserCredits();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUserCredits, updateWallet]);

  const checkWalletConnection = async () => {
    const address = await getWalletAddress();
    if (address) {
      setWalletAddress(address);
    }
  };

  const handleConnectWallet = async () => {
    setWalletConnecting(true);
    const result = await connectWallet();
    
    if (result.success) {
      setWalletAddress(result.address);
      const updateResult = await updateWallet(result.address);
      if (!updateResult.success) {
        console.error('Failed to update wallet in backend:', updateResult.error);
      }
    } else {
      alert(result.error);
    }
    
    setWalletConnecting(false);
  };

  const handleRefreshCredits = async () => {
    setRefreshing(true);
    await fetchUserCredits();
    setRefreshing(false);
  };

  const handlePurchaseCredits = () => {
    if (!walletAddress) {
      alert('Please connect your wallet first!');
      return;
    }
    setPurchaseModal(true);
  };

  const handleDirectPurchase = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first!');
      return;
    }

    const amountToSend = customAmount || selectedAmount;

    if (!amountToSend || parseFloat(amountToSend) <= 0) {
      alert('Please enter a valid amount!');
      return;
    }

    setTransactionState('pending');
    setTransactionError(null);

    try {
      console.log('🚀 Initiating transaction...', {
        amount: amountToSend,
        to: RECEIVING_WALLET,
        from: walletAddress
      });

      const result = await sendTransaction(RECEIVING_WALLET, amountToSend);

      if (result.success) {
        console.log('Transaction successful!', result.txHash);
        setTransactionHash(result.txHash);
        setTransactionState('success');

        // Multiple refresh attempts with increasing delays
        console.log('Starting balance refresh attempts...');

        // Immediate refresh
        await fetchUserCredits();

        // Additional refreshes with increasing delays
        setTimeout(async () => {
          console.log('Refresh attempt 1 (5s)...');
          await fetchUserCredits();
        }, 5000);

        setTimeout(async () => {
          console.log('Refresh attempt 2 (15s)...');
          await fetchUserCredits();
        }, 15000);

        setTimeout(async () => {
          console.log('Refresh attempt 3 (30s)...');
          await fetchUserCredits();
        }, 30000);

        // Store transaction info for debugging
        console.log('Transaction completed:', {
          hash: result.txHash,
          amount: amountToSend,
          expectedKarma: getKarmaAmount(amountToSend),
          timestamp: new Date().toISOString()
        });

      } else {
        console.error('Transaction failed:', result.error);
        setTransactionError(result.error);
        setTransactionState('error');
      }
    } catch (error) {
      console.error('💥 Transaction error:', error);
      setTransactionError('Transaction failed. Please try again.');
      setTransactionState('error');
    }
  };

  const resetPurchaseModal = () => {
    setPurchaseModal(false);
    setTransactionState(null);
    setTransactionHash(null);
    setTransactionError(null);
    setCustomAmount('');
  };

  const getKarmaAmount = (ethAmount) => {
    const tier = karmaTiers.find(t => t.eth === ethAmount);
    return tier ? tier.karma : Math.round(parseFloat(ethAmount) * 10000); // 1 ETH = 10,000 Karma
  };

  const manualKarmaCredit = async (txHash) => {
    try {
      console.log('🔧 Attempting manual karma credit for:', txHash);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/manual-karma-credit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          txHash: txHash,
          userEmail: user?.email
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Manual karma credit successful:', data.data);
        alert(`Karma credited successfully! Added ${data.data.karmaAdded} points.`);
        fetchUserCredits(); // Refresh balance
      } else {
        console.error('Manual karma credit failed:', data.error);
        alert(`Failed to credit karma: ${data.error}`);
      }
    } catch (error) {
      console.error('Manual karma credit error:', error);
      alert('Failed to credit karma. Please try again later.');
    }
  };

  const handleDisconnectWallet = async () => {
    setWalletAddress(null);
    // You could add additional cleanup here if needed
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const blogs = [
    {
      title: "The Science Behind Digital Karma: How Blockchain Creates Positive Energy",
      excerpt: "Explore the fascinating intersection of quantum physics, blockchain technology, and the ancient concept of karma. Learn how digital transactions can create measurable positive energy fields.",
      author: "Dr. Sarah Chen",
      date: "Dec 15, 2024",
      category: "Science",
      tags: ["blockchain", "quantum", "energy", "science"],
      fullContent: `The intersection of ancient wisdom and cutting-edge technology has never been more profound than in the realm of digital karma. At its core, KARMA represents a revolutionary approach to understanding how our digital actions create ripples in the quantum field of consciousness.

The science is clear: every transaction on the blockchain creates a measurable energy signature. When you send karma tokens, you're not just moving digital currency – you're creating positive vibrations that resonate through the network of interconnected consciousness.

Recent studies in quantum physics have shown that human intention can influence quantum systems. Our KARMA platform leverages this principle by translating your positive actions into blockchain transactions that carry your energetic signature across the network.

The mathematics of karma is elegant in its simplicity: each transaction creates a harmonic resonance that amplifies positive energy. The more you give, the more the universe responds in kind. This isn't superstition – it's quantum physics in action.

In practical terms, users who regularly participate in KARMA transactions report measurable improvements in their daily lives. From better luck in business dealings to more harmonious relationships, the effects are both subtle and profound.

The future of digital spirituality lies in platforms like KARMA, where technology and consciousness merge to create a more positive world. Every transaction is a vote for goodness, every karma point a step toward universal harmony.`
    },
    {
      title: "From Bitcoin to KARMA: The Evolution of Digital Value",
      excerpt: "Trace the journey from Bitcoin's revolutionary proof-of-work to KARMA's proof-of-positivity. Discover how we've evolved from mining coins to cultivating good fortune.",
      author: "Marcus Rodriguez",
      date: "Dec 12, 2024",
      category: "Technology",
      tags: ["bitcoin", "evolution", "blockchain", "technology"],
      fullContent: `The journey from Bitcoin's cold, mechanical proof-of-work to KARMA's warm, human-centered proof-of-positivity represents a fundamental shift in how we think about value in the digital age.

Bitcoin was revolutionary because it proved that value could exist outside traditional financial systems. But it was still rooted in the old paradigm – competition, scarcity, and individual gain. KARMA takes this foundation and builds something fundamentally different.

Instead of mining through computational power, KARMA participants "mine" positivity through acts of generosity. Every transaction becomes an act of creation rather than competition. This shift from extraction to contribution changes everything about how we interact with digital value.

The technical innovation behind KARMA lies in its ability to translate human intention into blockchain reality. Each karma point carries not just monetary value, but energetic significance. When you send karma, you're not just transferring tokens – you're broadcasting positive intention across the network.

This evolution represents the maturation of blockchain technology. We've moved from the rebellious teenager phase (Bitcoin) to the wise elder phase (KARMA) – understanding that true value comes not from what we take, but from what we give.

The implications for society are profound. KARMA creates an economy of abundance rather than scarcity, where everyone's success contributes to the success of others. It's a new way of being in the world, mediated by technology but driven by human consciousness.`
    },
    {
      title: "The Psychology of Good Fortune: How KARMA Rewires Your Brain",
      excerpt: "Scientific research shows that positive actions create neural pathways that attract more positivity. Learn how KARMA leverages neuroscience for measurable life improvements.",
      author: "Dr. Emily Watson",
      date: "Dec 8, 2024",
      category: "Psychology",
      tags: ["psychology", "neuroscience", "brain", "fortune"],
      fullContent: `The psychology of KARMA reveals fascinating insights into how positive digital actions can rewire our neural pathways and create lasting changes in our experience of reality.

Recent neuroscience research shows that our brains are plastic – they change based on our experiences and actions. Every time you choose to send karma, you're strengthening neural pathways associated with generosity, compassion, and positive expectation.

This isn't just feel-good philosophy – it's backed by hard science. Studies using fMRI technology have shown that acts of generosity light up the same reward centers in the brain as receiving gifts. KARMA leverages this neurological reality to create a positive feedback loop.

The psychological mechanism is elegant: when you send karma, your brain releases dopamine, creating a feeling of well-being. This positive state makes you more likely to notice opportunities and act on them, creating a self-reinforcing cycle of good fortune.

From a psychological perspective, KARMA serves several important functions:

1. **Cognitive Reframing**: Each transaction helps reframe your relationship with money and value
2. **Habit Formation**: Regular karma giving creates positive behavioral patterns
3. **Social Connection**: Participating in KARMA connects you with a global community of positive actors
4. **Self-Efficacy**: Success with KARMA builds confidence in your ability to influence reality

The measurable psychological benefits include reduced stress, increased optimism, stronger social connections, and improved overall life satisfaction. KARMA isn't just changing your wallet – it's changing your mind.`
    }
  ];

  const BlogCard = ({ blog, onReadMore }) => (
    <div className="bg-white/5 backdrop-blur-sm border border-karma-lime/20 rounded-xl p-6 hover:border-karma-lime/40 transition-all duration-200 cursor-pointer" onClick={() => onReadMore(blog)}>
      <div className="flex items-center space-x-2 mb-3">
        <span className="px-2 py-1 bg-karma-lime/20 text-karma-lime text-xs font-medium rounded">
          {blog.category}
        </span>
      </div>

      <h3 className="text-lg font-bold text-karma-white mb-3 line-clamp-2">
        {blog.title}
      </h3>

      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
        {blog.excerpt}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <UserIcon className="w-4 h-4" />
          <span>{blog.author}</span>
        </div>
        <div className="flex items-center space-x-1">
          <CalendarIcon className="w-4 h-4" />
          <span>{blog.date}</span>
        </div>
      </div>
    </div>
  );

  const BlogPost = ({ blog, onBack }) => {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-karma-black via-gray-900 to-karma-black text-karma-white z-50 overflow-y-auto">
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-karma-lime/10 rounded-lg flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-karma-lime" />
              </div>
              <span className="text-lg font-bold">KARMA</span>
            </div>
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-300 hover:text-karma-lime transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </header>

        {/* Blog Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-karma-lime/20 text-karma-lime text-sm font-medium rounded">
                {blog.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-karma-white leading-tight">
              {blog.title}
            </h1>

            <div className="flex items-center space-x-6 text-gray-400 mb-8">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <span>{blog.date}</span>
              </div>
            </div>
          </div>

          <div className="prose prose-lg prose-invert max-w-none">
            <div className="text-gray-300 leading-relaxed space-y-6">
              {blog.fullContent.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {blog.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/5 text-gray-400 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [selectedBlog, setSelectedBlog] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-karma-black via-gray-900 to-karma-black text-karma-white">
      {/* Header */}
      <header className="bg-karma-black/50 backdrop-blur-sm border-b border-karma-lime/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo
              size="small"
              clickable={true}
              onClick={() => window.location.href = '/'}
            />
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Welcome</p>
                <p className="font-medium text-karma-white">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to <span className="text-karma-lime">Karma</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Your digital fortune dashboard
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={walletAddress ? handlePurchaseCredits : handleConnectWallet}
              className="bg-karma-lime text-karma-black px-8 py-3 rounded-lg font-semibold hover:bg-karma-success transition-all"
            >
              {walletAddress ? 'Buy Karma' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </section>

      {/* Market Statistics */}
      <section className="py-20 bg-gradient-to-br from-karma-black/30 via-karma-black/20 to-karma-lime/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-karma-white mb-4 bg-gradient-to-r from-karma-lime to-karma-success bg-clip-text text-transparent">
              Market Statistics
            </h2>
            <p className="text-gray-300 text-lg">Real-time insights into the Karma ecosystem</p>
            <div className="w-24 h-1 bg-gradient-to-r from-karma-lime to-karma-success mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="group relative bg-gradient-to-br from-karma-black/60 to-karma-black/40 backdrop-blur-sm rounded-2xl p-8 border border-karma-lime/20 hover:border-karma-lime/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-karma-lime/10 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-karma-lime/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-karma-lime/30 to-karma-lime/10 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <CurrencyDollarIcon className="h-8 w-8 text-karma-lime" />
                </div>
                <div className="text-karma-lime text-3xl font-bold mb-3">{liveStats.currentPrice}</div>
                <div className="flex items-center justify-center mb-2">
                  <div className="text-karma-success text-sm font-medium">+{liveStats.priceChange}</div>
                  <ArrowTrendingUpIcon className="h-4 w-4 text-karma-success ml-1" />
                </div>
                <div className="text-gray-400 text-sm font-medium">Current Rate</div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-karma-black/60 to-karma-black/40 backdrop-blur-sm rounded-2xl p-8 border border-karma-lime/20 hover:border-karma-lime/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-karma-lime/10 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-karma-lime/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-karma-lime/30 to-karma-lime/10 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <ChartBarIcon className="h-8 w-8 text-karma-lime" />
                </div>
                <div className="text-karma-lime text-3xl font-bold mb-3">{liveStats.marketCap}</div>
                <div className="text-gray-400 text-sm font-medium">Market Cap</div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-karma-black/60 to-karma-black/40 backdrop-blur-sm rounded-2xl p-8 border border-karma-lime/20 hover:border-karma-lime/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-karma-lime/10 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-karma-lime/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-karma-lime/30 to-karma-lime/10 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <UsersIcon className="h-8 w-8 text-karma-lime" />
                </div>
                <div className="text-karma-lime text-3xl font-bold mb-3">{liveStats.activeUsers}</div>
                <div className="text-gray-400 text-sm font-medium">Active Users</div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-karma-black/60 to-karma-black/40 backdrop-blur-sm rounded-2xl p-8 border border-karma-lime/20 hover:border-karma-lime/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-karma-lime/10 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-karma-lime/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-karma-lime/30 to-karma-lime/10 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-karma-lime" />
                </div>
                <div className="text-karma-lime text-3xl font-bold mb-3">{liveStats.luckIndex}%</div>
                <div className="text-gray-400 text-sm font-medium">Luck Index</div>
                <div className="w-full bg-karma-black/40 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-karma-lime to-karma-success h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(liveStats.luckIndex, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group bg-gradient-to-br from-karma-black/50 to-karma-black/30 backdrop-blur-sm rounded-xl p-6 border border-karma-lime/20 hover:border-karma-lime/40 transition-all duration-300 hover:scale-102">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-karma-lime/20 to-karma-lime/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <SparklesIcon className="h-6 w-6 text-karma-lime" />
                  </div>
                  <div>
                    <div className="text-karma-lime text-xl font-bold">{liveStats.karmaDistributedToday}</div>
                    <div className="text-gray-400 text-sm">Karma Distributed Today</div>
                  </div>
                </div>
                <div className="text-karma-lime/50">
                  <FireIcon className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-karma-black/50 to-karma-black/30 backdrop-blur-sm rounded-xl p-6 border border-karma-lime/20 hover:border-karma-lime/40 transition-all duration-300 hover:scale-102">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-karma-lime/20 to-karma-lime/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ClockIcon className="h-6 w-6 text-karma-lime" />
                  </div>
                  <div>
                    <div className="text-karma-lime text-xl font-bold">{liveStats.totalTransactions}</div>
                    <div className="text-gray-400 text-sm">Total Transactions</div>
                  </div>
                </div>
                <div className="text-karma-lime/50">
                  <ChartBarIcon className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-karma-black/50 to-karma-black/30 backdrop-blur-sm rounded-xl p-6 border border-karma-lime/20 hover:border-karma-lime/40 transition-all duration-300 hover:scale-102">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-karma-lime/20 to-karma-lime/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheckIcon className="h-6 w-6 text-karma-lime" />
                  </div>
                  <div>
                    <div className="text-karma-lime text-xl font-bold">{liveStats.networkHealth}</div>
                    <div className="text-gray-400 text-sm">Network Health</div>
                  </div>
                </div>
                <div className="text-karma-lime/50">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Account Overview */}
      <section className="py-20 bg-gradient-to-br from-karma-black/30 via-karma-black/20 to-karma-lime/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-karma-white mb-4 bg-gradient-to-r from-karma-lime to-karma-success bg-clip-text text-transparent">
              Account Overview
            </h2>
            <p className="text-gray-300 text-lg">Manage your karma and wallet connection</p>
            <div className="w-24 h-1 bg-gradient-to-r from-karma-lime to-karma-success mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

            {/* Karma Balance Card */}
            <div className="group">
              <div className="relative bg-gradient-to-br from-karma-black/60 to-karma-black/40 backdrop-blur-sm rounded-2xl border border-karma-lime/20 hover:border-karma-lime/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-karma-lime/10 overflow-hidden h-[560px] flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-karma-lime/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 p-8 flex flex-col h-full">
                  {/* Header Section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-karma-lime/30 to-karma-lime/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <SparklesIcon className="h-6 w-6 text-karma-lime" />
                      </div>
                      <h2 className="text-xl font-bold text-karma-white">Your Karma</h2>
                    </div>
                    <button
                      onClick={handleRefreshCredits}
                      disabled={refreshing}
                      className="w-10 h-10 bg-karma-lime/10 hover:bg-karma-lime/20 rounded-xl flex items-center justify-center text-karma-lime hover:text-karma-success transition-all duration-300"
                      aria-label="Refresh karma"
                    >
                      <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 flex flex-col justify-center items-center text-center mb-6">
                    <div className="text-5xl font-bold text-karma-lime mb-3">{credits}</div>
                    <p className="text-gray-400 text-base">Karma Points</p>
                    <div className="w-24 h-1 bg-gradient-to-r from-karma-lime to-karma-success mx-auto mt-3 rounded-full"></div>
                  </div>

                  {/* Stats Section */}
                  <div className="space-y-3">
                    <div className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm font-medium">Luck Level</span>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="h-4 w-4 text-karma-warning fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm font-medium">Active Streak</span>
                        <span className="text-karma-lime font-semibold">15 days</span>
                      </div>
                    </div>
                    <div className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm font-medium">Avg Karma/User</span>
                        <span className="text-karma-lime font-semibold">{liveStats.averageKarmaPerUser}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Connection Card */}
            <div className="group">
              <div className="relative bg-gradient-to-br from-karma-black/60 to-karma-black/40 backdrop-blur-sm rounded-2xl border border-karma-lime/20 hover:border-karma-lime/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-karma-lime/10 overflow-hidden h-[560px] flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-karma-lime/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 p-8 flex flex-col h-full">
                  {/* Header Section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-karma-lime/30 to-karma-lime/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <WalletIcon className="h-6 w-6 text-karma-lime" />
                      </div>
                      <h2 className="text-xl font-bold text-karma-white">Wallet Connection</h2>
                    </div>
                    {walletAddress && (
                      <button
                        onClick={handleDisconnectWallet}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1 rounded-lg font-medium transition-all duration-300 text-sm"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-sm">
                      {walletAddress ? (
                        <div className="bg-gradient-to-br from-karma-success/20 to-karma-success/5 border border-karma-success/30 rounded-2xl p-6">
                          <div className="text-center mb-4">
                            <div className="w-14 h-14 bg-karma-success/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                              <CheckCircleIcon className="h-7 w-7 text-karma-success" />
                            </div>
                            <h3 className="text-lg font-bold text-karma-success mb-2">Wallet Connected</h3>
                            <p className="text-gray-300 text-sm mb-3">{formatAddress(walletAddress)}</p>
                            <button
                              onClick={() => copyToClipboard(walletAddress)}
                              className="bg-karma-success text-karma-black px-4 py-2 rounded-lg font-semibold hover:bg-karma-lime transition-all duration-300 text-sm"
                            >
                              Copy Address
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-karma-success/20">
                            <div className="text-center bg-white/5 rounded-lg p-3">
                              <div className="text-karma-success font-bold text-lg">Ready</div>
                              <div className="text-gray-400 text-xs">Status</div>
                            </div>
                            <div className="text-center bg-white/5 rounded-lg p-3">
                              <div className="text-karma-success font-bold text-lg">Sepolia</div>
                              <div className="text-gray-400 text-xs">Network</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-karma-lime/20 to-karma-lime/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <WalletIcon className="h-10 w-10 text-karma-lime" />
                          </div>
                          <h3 className="text-2xl font-bold text-karma-white mb-3">Connect Wallet</h3>
                          <p className="text-gray-300 mb-5 text-sm leading-relaxed">Link your MetaMask or compatible wallet to start buying Karma</p>
                          <button
                            onClick={handleConnectWallet}
                            disabled={walletConnecting}
                            className="bg-gradient-to-r from-karma-lime to-karma-success text-karma-black px-8 py-3 rounded-xl font-bold hover:from-karma-success hover:to-karma-lime transition-all duration-300 disabled:opacity-50 text-base shadow-lg hover:shadow-karma-lime/25 hover:scale-105 transform"
                          >
                            {walletConnecting ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-karma-black mr-2"></div>
                                Connecting...
                              </div>
                            ) : (
                              'Connect Wallet'
                            )}
                          </button>
                          <p className="text-gray-400 text-xs mt-3">Secure connection required for transactions</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Section - Match Karma Card Stats Height */}
                  <div className="mt-6 space-y-3 opacity-0 pointer-events-none">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm font-medium">Placeholder</span>
                        <span className="text-karma-lime font-semibold">Value</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Purchase Karma */}
      <section className="py-16 bg-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-karma-white mb-4">Purchase Karma</h2>
            <p className="text-gray-300">Choose the perfect package for your journey</p>
          </div>

          {/* Karma Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {karmaTiers.map((tier) => (
              <div
                key={tier.eth}
                className={`relative rounded-xl border cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedAmount === tier.eth
                    ? 'border-karma-lime bg-karma-lime/10 shadow-lg shadow-karma-lime/20'
                    : 'border-karma-lime/20 bg-karma-black/50 hover:border-karma-lime/40'
                } ${tier.popular ? 'ring-2 ring-karma-warning/50' : ''}`}
                onClick={() => setSelectedAmount(tier.eth)}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-karma-warning text-karma-black text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-xl font-bold text-karma-lime mb-1">{tier.name}</div>
                    <div className="text-sm text-gray-400">{tier.description}</div>
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-karma-white mb-1">{tier.eth} ETH</div>
                    <div className="text-2xl font-semibold text-karma-lime mb-1">{tier.karma} Karma</div>
                    <div className="text-gray-400 text-xs">
                      {Math.round(tier.karma / parseFloat(tier.eth))} Karma per ETH
                    </div>
                  </div>

                  {tier.bonus && (
                    <div className="bg-karma-success/10 border border-karma-success/30 rounded-lg p-3 mb-4 text-center">
                      <div className="text-karma-success font-medium text-sm">{tier.bonus}</div>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-300">
                        <CheckCircleIcon className="h-4 w-4 text-karma-success mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {selectedAmount === tier.eth && (
                    <div className="bg-karma-lime/20 border border-karma-lime/40 rounded-lg p-2 text-center">
                      <span className="text-karma-lime font-medium text-sm">Selected Package</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Purchase Summary & Button */}
          <div className="bg-karma-black/50 backdrop-blur-sm border border-karma-lime/20 rounded-xl p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-karma-white mb-2">Purchase Summary</h3>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold text-karma-lime mb-1">
                  {karmaTiers.find(t => t.eth === selectedAmount)?.karma} Karma
                </div>
                <div className="text-gray-300 mb-2">
                  for {selectedAmount} ETH
                </div>
                <div className="text-sm text-gray-400">
                  {karmaTiers.find(t => t.eth === selectedAmount)?.name}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handlePurchaseCredits}
                disabled={!walletAddress}
                className="bg-karma-lime text-karma-black px-8 py-3 rounded-lg font-semibold hover:bg-karma-success transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto mb-4"
              >
                <FireIcon className="h-5 w-5 mr-2" />
                Purchase Karma
              </button>

              {!walletAddress && (
                <div className="flex items-center justify-center space-x-2 text-karma-warning text-sm">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>Connect your wallet to make purchases</span>
                </div>
              )}
              {walletAddress && (
                <div className="flex items-center justify-center space-x-2 text-karma-success text-sm">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Ready to purchase</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* KARMA Insights Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-karma-white mb-4">KARMA Insights</h2>
            <p className="text-gray-300">Explore the science, philosophy, and technology behind KARMA</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {blogs.map((blog, index) => (
              <BlogCard
                key={index}
                blog={blog}
                onReadMore={setSelectedBlog}
              />
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                window.location.href = '/';
                setTimeout(() => {
                  const blogsSection = document.getElementById('blogs');
                  if (blogsSection) {
                    blogsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
              className="px-8 py-3 bg-karma-lime text-karma-black rounded-lg font-semibold hover:bg-karma-success transition-all duration-200"
            >
              Read More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Purchase Modal */}
      {purchaseModal && (
        <div className="fixed inset-0 bg-karma-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-karma-black/95 to-karma-black/90 border border-karma-lime/30 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-karma-lime/20 via-karma-success/20 to-karma-lime/20 p-6 border-b border-karma-lime/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-karma-lime to-karma-success rounded-2xl flex items-center justify-center">
                    <SparklesIcon className="h-6 w-6 text-karma-black" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-karma-white">Buy Karma</h2>
                    <p className="text-karma-lime text-sm font-medium">Instant activation • Secure transaction</p>
                  </div>
                </div>
                <button
                  onClick={resetPurchaseModal}
                  className="text-gray-400 hover:text-karma-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Transaction States */}
              {transactionState === 'pending' && (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-karma-lime border-t-transparent mx-auto mb-6"></div>
                  <h3 className="text-2xl font-bold text-karma-white mb-3">Processing Your Purchase</h3>
                  <p className="text-gray-300 text-lg mb-4">Confirm the transaction in MetaMask</p>
                  <div className="inline-flex items-center space-x-2 bg-karma-lime/10 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-karma-lime rounded-full animate-pulse"></div>
                    <span className="text-karma-lime font-medium">Waiting for confirmation...</span>
                  </div>
                </div>
              )}

              {transactionState === 'success' && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-karma-success to-karma-lime rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="h-10 w-10 text-karma-black" />
                  </div>
                  <h3 className="text-3xl font-bold text-karma-success mb-3">Purchase Complete!</h3>
                  <p className="text-gray-300 text-lg mb-4">Your karma should be credited automatically within 30 seconds</p>

                  {transactionHash && (
                    <div className="bg-white/5 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Transaction Hash:</span>
                        <button
                          onClick={() => copyToClipboard(transactionHash)}
                          className="text-karma-lime hover:text-karma-success text-sm underline"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="text-karma-lime font-mono text-xs break-all">{transactionHash}</div>
                    </div>
                  )}

                  <div className="bg-karma-warning/10 border border-karma-warning/30 rounded-xl p-4 mb-6">
                    <div className="text-karma-warning font-semibold mb-2 text-sm">Didn't receive karma yet?</div>
                    <p className="text-gray-300 text-sm mb-3">
                      If your balance hasn't updated after 30 seconds, you can manually credit your karma:
                    </p>
                    <button
                      onClick={() => manualKarmaCredit(transactionHash)}
                      className="bg-karma-warning text-karma-black px-6 py-2 rounded-lg font-semibold hover:bg-karma-lime transition-all text-sm"
                    >
                      Manual Credit
                    </button>
                  </div>

                  <div className="text-gray-400 text-xs">
                    Check the browser console (F12) for transaction status updates
                  </div>
                </div>
              )}

              {transactionState === 'error' && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ExclamationTriangleIcon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-400 mb-3">Transaction Failed</h3>
                  <p className="text-gray-300 text-lg mb-4">{transactionError}</p>
                </div>
              )}

              {/* Purchase Interface */}
              {transactionState === null && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Package Selection */}
                  <div>
                    <h3 className="text-xl font-bold text-karma-white mb-6">Choose Your Package</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {karmaTiers.map((tier) => (
                        <button
                          key={tier.eth}
                          onClick={() => {
                            setSelectedAmount(tier.eth);
                            setCustomAmount('');
                          }}
                          className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                            selectedAmount === tier.eth && !customAmount
                              ? 'border-karma-lime bg-gradient-to-br from-karma-lime/20 to-karma-success/20 shadow-xl shadow-karma-lime/20'
                              : 'border-karma-lime/30 bg-karma-black/50 hover:border-karma-lime/50 hover:bg-karma-black/70'
                          }`}
                        >
                          {tier.popular && (
                            <div className="absolute -top-2 -right-2 bg-karma-warning text-karma-black text-xs font-bold px-2 py-1 rounded-full">
                              BEST VALUE
                            </div>
                          )}
                          <div className="text-center">
                            <div className="text-2xl font-bold text-karma-lime mb-1">{tier.eth} ETH</div>
                            <div className="text-3xl font-black text-karma-white mb-2">{tier.karma}</div>
                            <div className="text-karma-lime font-semibold text-sm">KARMA</div>
                            <div className="text-gray-400 text-xs mt-2">{tier.name}</div>
                            {tier.bonus && (
                              <div className="text-karma-warning font-bold text-xs mt-1">{tier.bonus}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Purchase Panel */}
                  <div className="space-y-6">
                    {/* Custom Amount */}
                    <div className="bg-karma-black/50 rounded-2xl p-6 border border-karma-lime/20">
                      <h4 className="text-karma-white font-semibold mb-4">Custom Amount</h4>
                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        placeholder="Enter ETH amount (e.g., 0.005)"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedAmount('0.001');
                        }}
                        className="w-full bg-white/5 border border-karma-lime/30 rounded-xl px-4 py-3 text-karma-white placeholder-gray-500 focus:border-karma-lime focus:outline-none transition-all text-lg"
                      />
                      {customAmount && parseFloat(customAmount) > 0 && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-karma-lime/20 to-karma-success/20 rounded-xl border border-karma-lime/30">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-karma-lime">{getKarmaAmount(customAmount)}</div>
                            <div className="text-karma-white font-semibold">Karma Points</div>
                            <div className="text-gray-400 text-sm mt-1">for {customAmount} ETH</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Purchase Summary */}
                    <div className="bg-gradient-to-br from-karma-black/70 to-karma-black/50 rounded-2xl p-6 border border-karma-lime/30">
                      <h4 className="text-karma-white font-bold mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-karma-lime" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                        </svg>
                        Order Summary
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount:</span>
                          <span className="text-karma-white font-semibold">{customAmount || selectedAmount} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Karma:</span>
                          <span className="text-karma-lime font-bold text-xl">{getKarmaAmount(customAmount || selectedAmount)} Points</span>
                        </div>
                        <div className="border-t border-karma-lime/20 pt-3 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Rate:</span>
                            <span className="text-karma-lime font-medium">10,000 Karma/ETH</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Purchase Button */}
                    <button
                      onClick={handleDirectPurchase}
                      disabled={!walletAddress || (!customAmount && !selectedAmount)}
                      className="w-full bg-gradient-to-r from-karma-lime via-karma-success to-karma-lime text-karma-black py-4 px-8 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-karma-lime/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center"
                    >
                      <FireIcon className="h-6 w-6 mr-3" />
                      {walletAddress ? 'Complete Purchase' : 'Connect Wallet First'}
                    </button>

                    {!walletAddress && (
                      <div className="text-center text-gray-400 text-sm">
                        Connect your MetaMask wallet to proceed with the purchase
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Success/Error Actions */}
              {(transactionState === 'success' || transactionState === 'error') && (
                <div className="text-center pt-6">
                  <button
                    onClick={resetPurchaseModal}
                    className="bg-gradient-to-r from-karma-lime to-karma-success text-karma-black px-12 py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-karma-lime/25 transition-all"
                  >
                    {transactionState === 'success' ? 'Continue' : 'Try Again'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Blog Post Modal */}
      {selectedBlog && (
        <BlogPost blog={selectedBlog} onBack={() => setSelectedBlog(null)} />
      )}

      {/* Footer */}
      <footer className="py-12 bg-karma-black/50 border-t border-karma-lime/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo size="small" className="mb-6 md:mb-0" />

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <button
                onClick={() => window.location.href = '/'}
                className="hover:text-karma-lime transition-colors duration-200"
              >
                Back to Home
              </button>
              <button
                onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                className="hover:text-karma-lime transition-colors duration-200"
              >
                Support
              </button>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">Digital Karma for the Modern World</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">Sepolia Testnet Only</span>
            </div>
          </div>

          <div className="text-center mt-8 pt-8 border-t border-white/5">
            <p className="text-gray-400 text-xs">
              © 2024 Karma. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
