// About page - SmartSeat Product & Mission Overview

import { Card, CardBody } from '../../components/common';
import { 
  Shield, 
  Users, 
  Star, 
  Target,
  Bus,
  Heart,
  Award,
  Globe,
  Sparkles,
  Compass,
  CheckCircle2
} from 'lucide-react';

import './About.css';

const About = () => {
  const values = [
    {
      icon: Shield,
      title: 'Passenger Safety',
      description: 'Your comfort and security are our top priorities with privacy-first design'
    },
    {
      icon: Users,
      title: 'Inclusive Design',
      description: 'SmartSeat works for all passengers with preference-driven features'
    },
    {
      icon: Star,
      title: 'Customer Excellence',
      description: 'Committed to providing the best travel experience possible'
    },
    {
      icon: Target,
      title: 'Continuous Innovation',
      description: 'Constantly improving with cutting-edge technology'
    }
  ];

  const milestones = [
    { year: '2023', event: 'SmartSeat concept born' },
    { year: '2024', event: 'Platform development launched' },
    { year: '2024', event: 'Beta testing with 1000+ users' },
    { year: '2024', event: 'Official launch with major operators' }
  ];

  return (
    <div className="about-page-container min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* ABOUT HERO CARD */}
        <div className="about-hero-card text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>✦ INTELLIGENT MOBILITY PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-4">
            ABOUT <span className="text-cyan-400">SMARTSEAT</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing bus travel with intelligent 3D seat selection and passenger-aware telemetry features.
          </p>
        </div>

        {/* MISSION SECTION */}
        <section className="mission-card-premium p-8 text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wider">Our Mission</h2>
          </div>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
            To transform bus travel into a comfortable, informed, and personalized experience 
            by leveraging intelligent technology that respects passenger preferences while 
            ensuring safety and privacy for all travelers.
          </p>
        </section>

        {/* WHAT IS SMARTSEAT */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-black tracking-widest text-cyan-600 uppercase">INNOVATION</span>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">What is SmartSeat?</h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              SmartSeat is a modern bus-booking platform with a unique Dynamic Passenger-Aware Seating system.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm leading-relaxed text-slate-700 text-sm space-y-4">
            <p>
              Unlike traditional bus booking systems, SmartSeat goes beyond simple seat selection. 
              Our innovative platform continuously monitors your booking and provides real-time updates 
              about your travel environment.
            </p>
            <p>
              When you book a seat, SmartSeat keeps you informed about changes to your adjacent seats, 
              offers personalized recommendations based on your preferences, and gives you complete 
              control to make changes that enhance your travel experience.
            </p>
            <p>
              Built on the principles of privacy, inclusivity, and passenger choice, SmartSeat 
              ensures that every traveler can make informed decisions about their journey without 
              compromising their personal information or comfort.
            </p>
          </div>
        </section>

        {/* CORE FEATURES GRID */}
        <section className="space-y-8">
          <div className="text-center">
            <span className="text-xs font-black tracking-widest text-cyan-600 uppercase">CAPABILITIES</span>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">Core Features</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="feature-card-premium">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/30">
                  <Bus className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Smart Selection</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive 3D seat maps with real-time availability and intelligent recommendations.
              </p>
            </div>

            <div className="feature-card-premium">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-500/30">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Real-time Awareness</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Get notified when your adjacent seat status changes with privacy-protected information.
              </p>
            </div>

            <div className="feature-card-premium">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Personalized Matches</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                AI-powered seat recommendations based on your travel preferences and comfort needs.
              </p>
            </div>

            <div className="feature-card-premium">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/30">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Easy Changes</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Switch to better seats with one-click confirmation and availability verification.
              </p>
            </div>

            <div className="feature-card-premium">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/30">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Privacy First</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your personal information is protected with granular privacy controls and secure design.
              </p>
            </div>

            <div className="feature-card-premium">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/30">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Inclusive Design</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Features designed for all passengers with preference-driven, non-category options.
              </p>
            </div>
          </div>
        </section>

        {/* VALUES SECTION */}
        <section className="space-y-8">
          <div className="text-center">
            <span className="text-xs font-black tracking-widest text-cyan-600 uppercase">FOUNDATION</span>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">Our Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="value-card-premium">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-wide mb-1">
                        {value.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* TIMELINE JOURNEY */}
        <section className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <span className="text-xs font-black tracking-widest text-cyan-600 uppercase">MILESTONES</span>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">Our Journey</h2>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
            <div className="absolute left-6 top-8 bottom-8 timeline-path-line" />
            <div className="space-y-8 pl-10 relative">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4 relative">
                  <div className="absolute -left-10 top-1 w-4 h-4 rounded-full timeline-node-bullet" />
                  <span className="text-2xl font-black text-cyan-600 font-mono">{milestone.year}</span>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{milestone.event}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white rounded-3xl p-10 text-center shadow-xl">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Want to Learn More?</h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto mb-6">
            We'd love to hear from you and answer any questions about SmartSeat.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-cyan-500 text-slate-950 px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
          >
            Contact Us →
          </a>
        </section>

      </div>
    </div>
  );
};

export default About;
