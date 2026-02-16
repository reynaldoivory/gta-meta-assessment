// src/components/shared/DesignShowcase.jsx
// Visual showcase of the Enterprise Kid-Friendly Design System
import PropTypes from 'prop-types';
import { Sparkles, Zap, Target, TrendingUp, Award, Rocket } from 'lucide-react';

const DesignShowcase = ({ onClose }) => (
  <div className="fixed inset-0 bg-surface-dark/95 backdrop-blur-lg z-50 overflow-y-auto p-8">
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 animate-pop-in">
        <h1 className="text-6xl font-display font-black mb-4">
          <span className="heading-gradient-purple">Enterprise</span>
          <span className="heading-gradient-fire"> Kid-Friendly</span>
        </h1>
        <p className="text-xl text-slate-300 mb-6">
          Design System — Powered by 3 Colors, 3 Fonts, 3 Shapes
        </p>
        <button onClick={onClose} className="btn-accent">
          Close Showcase
        </button>
      </div>

      {/* Color Palette */}
      <div className="card-enterprise mb-8 animate-pop-in" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-3xl font-display font-bold heading-gradient-purple mb-6">
          🎨 3 Primary Colors
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary-purple-500 to-primary-purple-700 shadow-glow-purple mb-4 animate-pulse-glow" />
            <h3 className="font-display font-bold text-primary-purple-400 text-xl mb-2">
              Vibrant Purple
            </h3>
            <p className="text-sm text-slate-400">Gaming • Premium • Enterprise</p>
            <code className="text-xs font-mono text-slate-500">#a855f7</code>
          </div>
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary-cyan-400 to-primary-cyan-600 shadow-glow-cyan mb-4 animate-pulse-glow" />
            <h3 className="font-display font-bold text-primary-cyan-400 text-xl mb-2">
              Electric Cyan
            </h3>
            <p className="text-sm text-slate-400">Tech • Trust • Energy</p>
            <code className="text-xs font-mono text-slate-500">#22d3ee</code>
          </div>
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary-orange-400 to-primary-orange-600 shadow-glow-orange mb-4 animate-pulse-glow" />
            <h3 className="font-display font-bold text-primary-orange-400 text-xl mb-2">
              Solar Orange
            </h3>
            <p className="text-sm text-slate-400">Action • Warmth • Excitement</p>
            <code className="text-xs font-mono text-slate-500">#fb923c</code>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="card-enterprise mb-8 animate-pop-in" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-3xl font-display font-bold heading-gradient-fire mb-6">
          ✍️ 3 Font Families
        </h2>
        <div className="space-y-6">
          <div className="bg-surface-elevated rounded-xl p-6">
            <div className="font-display text-4xl font-black text-white mb-2">
              Inter Display
            </div>
            <p className="text-slate-400 text-sm">
              Headings, hero text, section titles (Apple-style, modern, refined)
            </p>
          </div>
          <div className="bg-surface-elevated rounded-xl p-6">
            <div className="font-body text-2xl font-medium text-white mb-2">
              Inter Body
            </div>
            <p className="text-slate-400 text-sm">
              Paragraphs, descriptions, labels (consistent, readable, professional)
            </p>
          </div>
          <div className="bg-surface-elevated rounded-xl p-6">
            <div className="font-mono text-2xl font-bold text-primary-cyan-400 mb-2">
              JetBrains Mono
            </div>
            <p className="text-slate-400 text-sm">
              Numbers, stats, code, technical data (technical feel)
            </p>
          </div>
        </div>
      </div>

      {/* Shapes & Components */}
      <div className="card-enterprise mb-8 animate-pop-in" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-3xl font-display font-bold heading-gradient-purple mb-6">
          🔷 3 Shape Patterns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Rounded Rectangles */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">1. Rounded Rectangles</h3>
            <div className="bg-gradient-to-br from-primary-purple-500/20 to-primary-cyan-500/10 rounded-2xl p-6 border-2 border-primary-purple-500/30">
              <p className="text-sm text-slate-300">16-24px border-radius</p>
              <p className="text-xs text-slate-500 mt-2">Cards, buttons, panels</p>
            </div>
          </div>

          {/* 2. Circles */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">2. Circles & Pills</h3>
            <div className="flex gap-3 flex-wrap">
              <span className="badge-purple">Status</span>
              <span className="badge-cyan">Info</span>
              <span className="badge-orange">Action</span>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-purple-500 to-primary-cyan-500 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-slate-500">Badges, avatars, indicators</p>
          </div>

          {/* 3. Glows */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">3. Soft Glows</h3>
            <div className="bg-primary-purple-500/30 rounded-2xl p-6 shadow-glow-purple border-2 border-primary-purple-500/50">
              <Sparkles className="w-8 h-8 text-white mx-auto" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Apple-style elevation</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="card-enterprise mb-8 animate-pop-in" style={{ animationDelay: '0.4s' }}>
        <h2 className="text-3xl font-display font-bold heading-gradient-fire mb-6">
          🔘 Button Styles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-4">
            <button className="btn-primary w-full">
              <Target className="w-5 h-5 inline-block mr-2" />
              {' '}
              Primary Action
            </button>
            <p className="text-xs text-slate-400">Main CTAs, submit forms</p>
          </div>
          <div className="text-center space-y-4">
            <button className="btn-secondary w-full">
              <TrendingUp className="w-5 h-5 inline-block mr-2" />
              {' '}
              Secondary Action
            </button>
            <p className="text-xs text-slate-400">Navigation, support actions</p>
          </div>
          <div className="text-center space-y-4">
            <button className="btn-accent w-full">
              <Rocket className="w-5 h-5 inline-block mr-2" />
              {' '}
              Accent Action
            </button>
            <p className="text-xs text-slate-400">Urgent, exciting features</p>
          </div>
        </div>
      </div>

      {/* Animations */}
      <div className="card-enterprise mb-8 animate-pop-in" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-3xl font-display font-bold heading-gradient-purple mb-6">
          ✨ Playful Animations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-elevated rounded-xl p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-purple-500 to-primary-cyan-500 rounded-full flex items-center justify-center mb-4 animate-pop-in">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2">Pop-In</h3>
            <p className="text-xs text-slate-400">Component entry animation</p>
          </div>
          <div className="bg-surface-elevated rounded-xl p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-cyan-500 to-primary-orange-500 rounded-full flex items-center justify-center mb-4 animate-pulse-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2">Pulse Glow</h3>
            <p className="text-xs text-slate-400">Attention-grabbing elements</p>
          </div>
          <div className="bg-surface-elevated rounded-xl p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-orange-500 to-accent-pink rounded-full flex items-center justify-center mb-4 animate-bounce-soft">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2">Bounce Soft</h3>
            <p className="text-xs text-slate-400">Fun elements, rewards</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-slate-400 text-sm mb-8">
        <p>
          🎨 Inspired by Duolingo, Discord, Apple, Linear, Notion, and Cash App
        </p>
        <p className="mt-2">
          Design System Version 1.0.0 • February 2026
        </p>
      </div>
    </div>
  </div>
);

DesignShowcase.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default DesignShowcase;
