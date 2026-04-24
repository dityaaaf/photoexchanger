import { ArrowRight, Sparkles, Eraser, ChevronDown, Video } from 'lucide-react';
import logo from '../images/logo.png';

interface LandingPageProps {
  onStart: () => void;
  onVideoStart: () => void;
  onContact: () => void;
  onPrivacy: () => void;
}

const features = [
  {
    icon: Sparkles,
    title: 'HD Enhancement',
    description: 'Upscale and sharpen your images with AI-driven clarity restoration. Turn blurry shots into crisp, professional results.',
  },
  {
    icon: Eraser,
    title: 'Object Removal',
    description: 'Erase unwanted logos, watermarks, or text from any photo. Our AI intelligently fills the removed area.',
  },
  {
    icon: Video,
    title: 'Video to GIF',
    description: 'Convert videos into high-quality GIFs in seconds. Perfect for social media, tutorials, and sharing moments.',
  },
];

const steps = [
  { num: '01', label: 'Upload', desc: 'Select your photo or video file.' },
  { num: '02', label: 'Select', desc: 'Choose the ideal tool or conversion settings.' },
  { num: '03', label: 'Process', desc: 'Our high-performance engine transforms your media.' },
  { num: '04', label: 'Download', desc: 'Export your enhanced result in seconds.' },
];

export default function LandingPage({ onStart, onVideoStart, onContact, onPrivacy }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
          <div className="absolute left-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Tam's Photo Exchanger logo" className="w-10 h-10 object-contain" />
              <span className="font-serif text-lg tracking-tight">Tam's <span className="text-white/40">Photo Exchanger</span></span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10 mx-auto">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it works</a>
            <a href="#pricing" className="nav-link">About</a>
          </div>

          <div className="absolute right-6 flex items-center gap-4">
            <button className="text-xs tracking-widest uppercase text-white/40 hover:text-white transition-colors" onClick={onContact}>
              Contact
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center grid-bg overflow-hidden">
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,255,255,0.04) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="animate-fade-in animate-delay-100 mb-8">
            <span className="tag">New: Professional Video to GIF Converter</span>
          </div>

          <h1
            className="font-serif animate-fade-in-up animate-delay-200 mb-6"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: 500 }}
          >
            Media Enhancement
            <br />
            <em className="text-shimmer not-italic">Redefined.</em>
          </h1>

          <p
            className="animate-fade-in-up animate-delay-300 text-white/50 max-w-xl mx-auto mb-12"
            style={{ fontSize: '1.0625rem', lineHeight: '1.7', fontWeight: 300 }}
          >
            Professional tools for photos and videos. Upscale to HD, remove objects, 
            or convert video to high-quality GIFs instantly.
          </p>

          <div className="animate-fade-in-up animate-delay-400 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="btn-primary" onClick={onStart}>
              <Sparkles size={15} />
              <span>AI Photo Editor</span>
            </button>
            <button className="btn-outline" onClick={onVideoStart}>
              <Video size={15} />
              <span>Video to GIF</span>
            </button>
          </div>

          <div className="animate-fade-in animate-delay-600 mt-16 flex items-center justify-center gap-8 text-white/25">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
              <span className="text-xs tracking-widest uppercase">No signup</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
              <span className="text-xs tracking-widest uppercase">Privacy First</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
              <span className="text-xs tracking-widest uppercase">Pure Client-Side</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={14} />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="divider mx-auto mb-6" />
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 500, lineHeight: 1.2 }}>
              Built for Professionals,<br />Accessible to Everyone
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/5">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div
                key={i}
                className="bg-black p-10 group hover:bg-white/[0.02] transition-colors duration-300 cursor-pointer"
                onClick={title.includes('Video') ? onVideoStart : onStart}
              >
                <div className="w-10 h-10 border border-white/10 flex items-center justify-center mb-8 group-hover:border-white/30 transition-colors duration-300">
                  <Icon size={18} className="text-white/50 group-hover:text-white/80 transition-colors duration-300" />
                </div>
                <h3 className="font-serif text-xl mb-4" style={{ fontWeight: 500 }}>{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed" style={{ fontWeight: 300 }}>{description}</p>
                <div className="mt-8 flex items-center gap-2 text-white/20 group-hover:text-white/60 transition-colors">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-medium">Launch Tool</span>
                  <ArrowRight size={10} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <span className="tag mb-6 inline-block">Process</span>
            <h2 className="font-serif mt-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 500 }}>
              How It Works
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ num, label, desc }, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-white/5 z-0" style={{ width: 'calc(100% - 2rem)', left: '100%' }} />
                )}
                <div className="relative">
                  <div className="text-5xl font-serif text-white/8 mb-4 select-none" style={{ color: 'rgba(255,255,255,0.06)', fontSize: '3rem', fontWeight: 700 }}>{num}</div>
                  <h4 className="font-serif text-lg mb-2" style={{ fontWeight: 500 }}>{label}</h4>
                  <p className="text-white/40 text-sm leading-relaxed" style={{ fontWeight: 300 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Using CTA as placeholder for pricing section */}
      <section id="pricing" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 500, lineHeight: 1.15 }}>
            Ready to Transform<br /><em className="not-italic text-white/40">Your Media?</em>
          </h2>
          <p className="text-white/40 mb-10 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
            No account needed. Start processing your photos and videos instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="btn-primary" onClick={onStart}>
              <span>Start Photo Editing</span>
              <ArrowRight size={15} />
            </button>
            <button className="btn-outline" onClick={onVideoStart}>
              <span>Start Video Conversion</span>
              <Video size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 relative">
          <div className="sm:absolute sm:left-0">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Tam's Photo Exchanger logo" className="w-6 h-6 object-contain opacity-50" />
              <span className="font-serif text-sm text-white/30">Tam's Photo Exchanger</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8 mx-auto">
            <a href="#features" className="nav-link text-xs">Features</a>
            <button onClick={onPrivacy} className="nav-link text-xs bg-transparent border-none p-0">Privacy Policy</button>
            <button onClick={onContact} className="nav-link text-xs bg-transparent border-none p-0">Contact</button>
          </div>

          <div className="sm:absolute sm:right-0">
            <p className="text-xs text-white/20 tracking-wider">
              &copy; {new Date().getFullYear()} Tam's Photo Exchanger.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
