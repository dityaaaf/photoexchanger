import { useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Lock, Eye, Globe, Scale } from 'lucide-react';


interface PrivacyPolicyPageProps {
  onBack: () => void;
}

const sections = [
  {
    icon: Eye,
    title: 'Information We Collect',
    content: 'We only collect images that you voluntarily upload to our service for processing. We do not require account registration, so we do not store personal details like your name, address, or phone number unless you provide them via our contact channels.'
  },
  {
    icon: Lock,
    title: 'How We Protect Your Data',
    content: 'Your uploaded images are processed temporarily on our secure servers and are automatically deleted after a short period. We use industry-standard encryption to protect your data during transit from your device to our servers.'
  },
  {
    icon: Globe,
    title: 'Cookies & Tracking',
    content: 'We use minimal cookies to ensure the website functions correctly and to analyze basic traffic patterns. These cookies do not track your activity on other websites or collect personally identifiable information.'
  },
  {
    icon: Scale,
    title: 'User Responsibilities',
    content: 'Users are responsible for the content they upload. You must ensure you have the right to process the images and that they do not violate any local laws or third-party rights.'
  }
];

export default function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
          <div className="absolute left-6">
            <button
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors duration-200 text-sm"
              onClick={onBack}
            >
              <ArrowLeft size={15} />
              <span className="tracking-widest uppercase text-xs">Back</span>
            </button>
          </div>

          {/* Branding removed per request */}
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-20 animate-fade-in">
        <header className="text-center mb-20">
          <div className="inline-flex p-4 rounded-full bg-white/[0.03] border border-white/10 mb-6">
            <ShieldCheck size={32} className="text-white/80" />
          </div>
          <h1 className="font-serif text-5xl mb-6" style={{ fontWeight: 500 }}>Privacy & Policy</h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            Your privacy is our priority. This document explains how we handle your data and the rules for using our services.
          </p>
          <p className="text-white/20 text-xs mt-8 tracking-widest uppercase">Last Updated: April 21, 2026</p>
        </header>

        <div className="space-y-16">
          {sections.map((section, i) => (
            <section key={i} className="group">
              <div className="flex items-start gap-6">
                <div className="mt-1 p-3 border border-white/10 bg-white/[0.02] group-hover:border-white/30 transition-colors duration-300">
                  <section.icon size={20} className="text-white/60" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl mb-4" style={{ fontWeight: 500 }}>{section.title}</h2>
                  <p className="text-white/50 leading-relaxed text-lg" style={{ fontWeight: 300 }}>
                    {section.content}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-24 p-10 border border-white/5 bg-white/[0.01] rounded-sm text-center">
          <h3 className="font-serif text-2xl mb-4" style={{ fontWeight: 500 }}>Questions regarding our policy?</h3>
          <p className="text-white/40 mb-8 max-w-md mx-auto">
            If you have any questions or concerns about these policies, please don't hesitate to reach out.
          </p>
          <button 
            onClick={onBack}
            className="btn-outline text-xs"
          >
            Go Back Home
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center">
          <p className="text-xs text-white/20 tracking-wider">
            &copy; {new Date().getFullYear()} Tam's Photo Exchanger. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
