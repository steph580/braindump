import React, { useState } from 'react';
import { Brain, Sparkles, Zap, CheckCircle, Crown, ArrowRight, Menu, X } from 'lucide-react';

// Constants
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
      '1 brain dump per day',
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

/**
 * Landing Component
 * 
 * Professional landing page for BrainDump application.
 * Features responsive design, animated sections, and clear CTAs.
 * 
 * @component
 */
const Landing: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Navigation handlers
   */
  const handleGetStarted = (): void => {
    window.location.href = '/auth';
  };

  const handleSignIn = (): void => {
    window.location.href = '/auth';
  };

  const toggleMobileMenu = (): void => {
    setMobileMenuOpen(prev => !prev);
  };

  const scrollToSection = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  /**
   * Render helpers
   */
  const renderNavigation = (): React.ReactNode => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">BrainDump</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Benefits
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={handleSignIn}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={handleGetStarted}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="block w-full text-left text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Benefits
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="block w-full text-left text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={handleSignIn}
              className="block w-full text-left text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={handleGetStarted}
              className="block w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-center"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );

  const renderHero = (): React.ReactNode => (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">AI-Powered Mind Organization</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Capture Every Thought.
            <br />
            <span className="text-blue-600">Organize Everything.</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Transform scattered thoughts into organized action with AI-powered categorization.
            Never lose a brilliant idea again.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-lg font-semibold flex items-center gap-2"
            >
              Start Free Today
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-lg font-semibold"
            >
              Learn More
            </button>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-gray-500 dark:text-gray-500 pt-8">
            Join thousands organizing their minds daily
          </p>
        </div>
      </div>
    </section>
  );

  const renderFeatures = (): React.ReactNode => (
    <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to stay organized and productive
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-fit">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderBenefits = (): React.ReactNode => (
    <section id="benefits" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose BrainDump?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Experience the freedom of a clear mind. Let AI handle the organization
              while you focus on what truly matters.
            </p>
            <div className="space-y-4">
              {BENEFITS.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/5 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                {['Task', 'Reminder', 'Note', 'Idea'].map((category, index) => (
                  <div
                    key={category}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                      <span className="font-medium">{category}</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderPricing = (): React.ReactNode => (
    <section id="pricing" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Start free, upgrade when you're ready
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PRICING_TIERS.map((tier, index) => (
            <div
              key={index}
              className={`p-8 rounded-xl border-2 transition-all duration-300 ${
                tier.highlighted
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10 shadow-xl scale-105'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg'
              }`}
            >
              {tier.highlighted && (
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                  <Crown className="h-5 w-5" />
                  <span className="font-semibold">Most Popular</span>
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">{tier.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleGetStarted}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  tier.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderCTA = (): React.ReactNode => (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="p-12 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/5 rounded-2xl border border-blue-200 dark:border-blue-800">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Clear Your Mind?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands who've transformed how they capture and organize thoughts.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-lg font-semibold inline-flex items-center gap-2"
          >
            Get Started for Free
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );

  const renderFooter = (): React.ReactNode => (
    <footer className="py-12 px-4 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">BrainDump</span>
          </div>

          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              Contact
            </a>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2024 BrainDump. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-900 dark:via-blue-900/5 dark:to-gray-900">
      {renderNavigation()}
      {renderHero()}
      {renderFeatures()}
      {renderBenefits()}
      {renderPricing()}
      {renderCTA()}
      {renderFooter()}
    </div>
  );
};

export default Landing;