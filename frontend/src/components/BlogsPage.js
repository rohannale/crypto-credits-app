import React, { useState } from 'react';
import { ArrowLeftIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import Logo from './Logo';

export const BlogPost = ({ blog, onBack }) => {
  return (
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
            <span>Back to Insights</span>
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

const BlogCard = ({ blog, onReadMore }) => (
  <div className="bg-white/5 backdrop-blur-sm border border-karma-lime/20 rounded-xl p-6 hover:border-karma-lime/40 transition-all duration-200 cursor-pointer" onClick={() => onReadMore(blog)}>
    <div className="flex items-center space-x-2 mb-3">
      <span className="px-2 py-1 bg-karma-lime/20 text-karma-lime text-xs font-medium rounded">
        {blog.category}
      </span>
    </div>

    <h3 className="text-xl font-bold text-karma-white mb-3 line-clamp-2">
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

const BlogsPage = ({ onBack }) => {
  const [selectedBlog, setSelectedBlog] = useState(null);

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
      title: "Ancient Wisdom Meets Modern Technology: KARMA's Philosophical Roots",
      excerpt: "Delve into the philosophical foundations of KARMA, drawing from Eastern philosophies and quantum physics to understand how digital actions create real-world consequences.",
      author: "Prof. Li Wei",
      date: "Dec 10, 2024",
      category: "Philosophy",
      tags: ["philosophy", "ancient", "wisdom", "consciousness"],
      fullContent: `The philosophy of KARMA bridges millennia of human wisdom with the cutting edge of modern technology. At its heart lies the ancient understanding that our actions create ripples that extend far beyond their immediate consequences.

In Eastern philosophy, karma is not punishment or reward – it's simply cause and effect. Every action sets in motion a chain of consequences that reverberate through time and space. KARMA brings this timeless wisdom into the digital age.

When you send a karma token, you're not just making a transaction – you're participating in a global meditation on generosity. Each transfer becomes a prayer for positivity, a vote for compassion, a step toward collective enlightenment.

The philosophical innovation of KARMA lies in its recognition that consciousness and technology are not separate realms. Our digital actions are as real as our physical ones, creating energetic patterns that influence the world around us.

From a philosophical perspective, KARMA represents the synthesis of several ancient traditions:

1. **Buddhist Mindfulness**: Every transaction becomes an opportunity for conscious choice
2. **Hindu Dharma**: Our digital actions align us with universal principles of right action
3. **Taoist Flow**: KARMA helps us move with the natural rhythms of giving and receiving
4. **Quantum Interconnectedness**: Our actions affect the entire network of being

This philosophical foundation gives KARMA its true power. It's not just a platform – it's a path to awakening, mediated by technology but rooted in eternal wisdom.`
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
    },
    {
      title: "Building a Better Future: KARMA's Impact on Society",
      excerpt: "Discover how KARMA's community-driven approach is creating positive social change, one transaction at a time. Real stories from users who've transformed their lives.",
      author: "Community Team",
      date: "Dec 5, 2024",
      category: "Community",
      tags: ["community", "society", "impact", "change"],
      fullContent: `KARMA's impact on society extends far beyond individual users, creating ripples of positive change that touch communities and even entire cultures.

At its core, KARMA represents a new economic paradigm – one based on contribution rather than extraction, abundance rather than scarcity, connection rather than competition. This shift has profound implications for how we organize our societies.

Real stories from our community illustrate the transformative power of KARMA:

**Maria's Story**: A single mother in São Paulo used KARMA to turn her small business around. "Before KARMA, I was always worried about money. Now I give freely, and somehow, the universe always provides."

**Ahmed's Journey**: A refugee in Berlin found connection and hope through KARMA. "In a new country where I knew no one, KARMA helped me build bridges of positivity that led to real friendships and opportunities."

**Sarah's Transformation**: A corporate executive discovered the joy of giving. "KARMA taught me that true wealth comes not from accumulation, but from contribution."

These stories are more than anecdotes – they're data points in a larger societal shift. As more people participate in KARMA, we're seeing measurable improvements in community cohesion, economic equality, and overall well-being.

The societal impact of KARMA includes:
- Reduced social isolation through community connection
- More equitable distribution of resources through giving culture
- Increased optimism and hope in communities
- New models for economic organization based on abundance

KARMA isn't just a platform – it's a movement toward a more compassionate, connected world. Every transaction is a step toward that better future.`
    },
    {
      title: "The Future of Digital Spirituality: KARMA and Consciousness",
      excerpt: "Explore how KARMA represents the next evolution in human consciousness, bridging the gap between digital technology and spiritual growth.",
      author: "Dr. Michael Torres",
      date: "Dec 3, 2024",
      category: "Spirituality",
      tags: ["spirituality", "consciousness", "digital", "future"],
      fullContent: `KARMA represents the cutting edge of digital spirituality – a place where ancient wisdom meets modern technology to create new forms of consciousness and connection.

The future of spirituality lies in our ability to integrate digital experiences with spiritual growth. KARMA provides a perfect laboratory for this integration, where every transaction becomes an opportunity for spiritual practice.

From a spiritual perspective, KARMA serves several essential functions:

1. **Mindfulness Training**: Each decision to give becomes a moment of conscious choice
2. **Interconnectedness**: Transactions create visible connections between participants
3. **Energy Exchange**: Digital tokens carry the energetic signature of intention
4. **Community Building**: Shared spiritual practice creates stronger bonds

The spiritual technology of KARMA includes:
- **Intention Setting**: Users can infuse their transactions with specific positive intentions
- **Energy Tracking**: The blockchain provides a record of energetic exchanges
- **Community Rituals**: Group activities that amplify collective positive energy
- **Personal Growth**: Tracking karma points becomes a mirror for spiritual development

As we move deeper into the digital age, platforms like KARMA will become essential tools for spiritual growth. They bridge the gap between our physical and digital selves, helping us understand that consciousness transcends the boundaries of flesh and silicon.

The future of digital spirituality is bright, and KARMA is leading the way. It's not just about technology – it's about evolving human consciousness for a more harmonious world.`
    }
  ];

  if (selectedBlog) {
    return <BlogPost blog={selectedBlog} onBack={() => setSelectedBlog(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-karma-black via-gray-900 to-karma-black text-karma-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo size="small" />
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
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-karma-white mb-4">
            KARMA Insights
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore the science, philosophy, and technology behind KARMA. Discover how we're creating positive change through blockchain innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {blogs.map((blog, index) => (
            <BlogCard
              key={index}
              blog={blog}
              onReadMore={setSelectedBlog}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;
