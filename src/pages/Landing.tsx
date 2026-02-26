import React, { useState } from 'react';
import { Brain, Sparkles, Zap, CheckCircle, Crown, ArrowRight, Menu, X } from 'lucide-react';

// Inject Google Sans font
const GoogleFont = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap"
    rel="stylesheet"
  />
);

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Organization',
    description: 'Advanced AI automatically categorizes your thoughts into tasks, reminders, notes, and ideas.',
  },
  {
    icon: Sparkles,
    title: 'Smart Processing',
    description: 'AI refines and structures your raw thoughts for maximum clarity.',
  },
  {
    icon: Zap,
    title: 'Real-time Sync',
    description: 'Instant synchronization across all your devices with live updates.',
  },
];

const BENEFITS = [
  'Never lose a thought again',
  'Reduce mental clutter',
  'Boost productivity instantly',
  'Stay organized effortlessly',
  'Focus on what matters',
  'Access anywhere, anytime',
];

const PRICING_TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '10 brain dumps per day',
      'AI categorization',
      'Basic organization',
      'Mobile & desktop access',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '$4.99',
    period: 'per month',
    features: [
      'Unlimited brain dumps',
      'Advanced AI processing',
      'Priority support',
      'All future features',
      'No ads ever',
    ],
    cta: 'Upgrade to Premium',
    highlighted: true,
  },
];

const Landing: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => (window.location.href = '/login');
  const handleSignIn = () => (window.location.href = '/login');
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div
      style={{ fontFamily: `'Google Sans', sans-serif` }}
      className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-900 dark:via-blue-900/5 dark:to-gray-900"
    >
      <GoogleFont />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 text-[14px]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold">BrainDump</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5">
            {['features', 'benefits', 'pricing'].map((sec) => (
              <button key={sec} onClick={() => scrollToSection(sec)} className="hover:text-blue-600">
                {sec.charAt(0).toUpperCase() + sec.slice(1)}
              </button>
            ))}

            <button onClick={handleSignIn} className="hover:text-blue-600">
              Sign In
            </button>

            <button
              onClick={handleGetStarted}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button onClick={toggleMobileMenu} className="md:hidden">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-3 space-y-3 pb-4 text-[14px] px-4">
            {['features', 'benefits', 'pricing'].map((sec) => (
              <button
                key={sec}
                onClick={() => scrollToSection(sec)}
                className="block w-full text-left"
              >
                {sec.charAt(0).toUpperCase() + sec.slice(1)}
              </button>
            ))}
            <button onClick={handleSignIn} className="block w-full text-left">Sign In</button>
            <button
              onClick={handleGetStarted}
              className="block w-full px-5 py-2 bg-blue-600 text-white rounded-md text-center text-[14px]"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 text-center">
        <div className="container mx-auto max-w-5xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-[12px] mx-auto">
            <Sparkles className="h-3 w-3 text-blue-600" />
            AI-Powered Mind Organization
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Capture Every Thought.<br />
            <span className="text-blue-600">Organize Everything.</span>
          </h1>

          <p className="text-[16px] text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Transform scattered thoughts into organized action with intelligent categorization.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-md text-[15px] flex items-center gap-2 justify-center"
              onClick={handleGetStarted}
            >
              Start Free Today <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="px-6 py-3 border border-gray-300 rounded-md text-[15px]"
            >
              Learn More
            </button>
          </div>

          <p className="text-[12px] text-gray-500 pt-2">Trusted by thousands</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 bg-gray-50 dark:bg-gray-900/20">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-2">Powerful Features</h2>
          <p className="text-[15px] text-gray-500 text-center mb-12">Everything you need to stay organized</p>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
                <div className="mb-3 p-2 bg-blue-50 rounded-md w-fit">
                  <f.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
                <p className="text-[14px] text-gray-600 dark:text-gray-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Why Choose BrainDump?</h2>
            <p className="text-[15px] text-gray-600 dark:text-gray-400 mb-6">Experience a clearer, more focused mind.</p>
            <div className="space-y-3">
              {BENEFITS.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-[15px]">{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-gray-200">
            {['Task', 'Reminder', 'Note', 'Idea'].map((c, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-3 mb-3 rounded-md shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-600 rounded-full" />
                  <span className="text-[14px] font-medium">{c}</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4 bg-gray-50 dark:bg-gray-900/20">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-2">Simple, Transparent Pricing</h2>
          <p className="text-[15px] text-gray-500 text-center mb-10">Start free — upgrade anytime</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {PRICING_TIERS.map((tier, i) => (
              <div
                key={i}
                className={`p-6 rounded-xl border-2 text-[14px] ${
                  tier.highlighted
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10 shadow-lg scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                {tier.highlighted && (
                  <div className="flex items-center gap-2 text-blue-600 mb-2 text-[13px]">
                    <Crown className="h-4 w-4" /> Most Popular
                  </div>
                )}

                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <div className="my-4">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-gray-500 ml-1 text-[13px]">{tier.period}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {tier.features.map((feat, fi) => (
                    <li key={fi} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleGetStarted}
                  className={`w-full py-2 rounded-md font-medium ${
                    tier.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 text-[13px] border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="text-md font-semibold">BrainDump</span>
          </div>

          <div className="flex gap-5">
            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Contact</a>
          </div>

          <p className="text-[12px] text-gray-500">© 2024 BrainDump. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
