import { useEffect } from 'react';
import { ArrowLeft, MessageCircle, Instagram, Disc as Discord, Mail, ExternalLink } from 'lucide-react';


interface ContactPageProps {
  onBack: () => void;
}

const contactMethods = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: '+62 - 812 - 2513 - 3501',
    description: 'Chat with our support team for instant help.',
    link: 'https://wa.me/6281225133501',
    color: 'hover:text-green-500'
  },
  {
    icon: Instagram,
    title: 'Instagram',
    value: '@tamaaputr_',
    description: 'Follow us for latest updates and cool edits.',
    link: 'https://www.instagram.com/tamaaputr_/',
    color: 'hover:text-pink-500'
  },
  {
    icon: Discord,
    title: 'Discord',
    value: "Tam's Community",
    description: 'Join our server to share and learn with others.',
    link: 'https://discord.gg/WPSUwtPZQb',
    color: 'hover:text-indigo-500'
  },
  {
    icon: Mail,
    title: 'Email Support',
    value: 'adit@nusabs.sch.id',
    description: "Send us an email for business inquiries.",
    link: 'mailto:adit@nusabs.sch.id',
    color: 'hover:text-blue-400'
  }
];

export default function ContactPage({ onBack }: ContactPageProps) {
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

      <main className="flex-1 flex flex-col items-center justify-center p-6 py-20 relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-4xl w-full">
          <div className="text-center mb-16 animate-fade-in">
            <div className="divider mx-auto mb-6" />
            <h1 className="font-serif text-5xl mb-6" style={{ fontWeight: 500 }}>Get in Touch</h1>
            <p className="text-white/40 max-w-xl mx-auto text-lg" style={{ fontWeight: 300 }}>
              Need help or have any questions? Our team is always here to support you. 
              Choose your preferred platform to reach us.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 animate-fade-in animate-delay-200">
            {contactMethods.map((method, i) => (
              <a
                key={i}
                href={method.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 flex flex-col items-start`}
              >
                <div className={`p-4 border border-white/10 mb-6 transition-colors duration-300 ${method.color}`}>
                  <method.icon size={24} />
                </div>
                <h3 className="text-xl font-serif mb-2" style={{ fontWeight: 500 }}>{method.title}</h3>
                <p className="text-white/50 text-sm mb-4 leading-relaxed">{method.description}</p>
                <div className="mt-auto flex items-center justify-between w-full">
                  <span className="text-sm font-medium tracking-tight text-white/80">{method.value}</span>
                  <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>

          <div className="mt-20 p-10 border border-white/5 bg-white/[0.01] text-center animate-fade-in animate-delay-400">
            <h4 className="font-serif text-2xl mb-4" style={{ fontWeight: 500 }}>Customer Support Hours</h4>
            <div className="flex flex-col sm:flex-row justify-center gap-8 text-white/40 text-sm">
              <div>
                <p className="text-white/20 uppercase tracking-widest text-[10px] mb-1">Monday — Friday</p>
                <p>09:00 AM – 06:00 PM (GMT+7)</p>
              </div>
              <div className="w-px bg-white/10 hidden sm:block h-10" />
              <div>
                <p className="text-white/20 uppercase tracking-widest text-[10px] mb-1">Saturday — Sunday</p>
                <p>10:00 AM – 04:00 PM (GMT+7)</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center relative">
          <p className="text-xs text-white/20 tracking-wider">
            &copy; {new Date().getFullYear()} Tam's Photo Exchanger. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
