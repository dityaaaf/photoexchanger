import { useState } from 'react';
import { ArrowLeft, Download, RefreshCw, Sparkles, Eraser, SplitSquareHorizontal, Maximize2, Brain, Star, CheckCircle2, Video } from 'lucide-react';
import CompareSlider from '../components/CompareSlider';
import logo from '../images/logo.png';
import { FeatureType } from './EditorPage';

interface ResultPageProps {
  originalUrl: string;
  resultUrl: string;
  feature: FeatureType | 'video-gif';
  onReset: () => void;
  onBack: () => void;
}

type ViewMode = 'result' | 'compare';

export default function ResultPage({ originalUrl, resultUrl, feature, onReset, onBack }: ResultPageProps) {
  const isGif = feature === 'video-gif';
  const [viewMode, setViewMode] = useState<ViewMode>(isGif ? 'result' : 'compare');
  const [lightbox, setLightbox] = useState(false);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `tams-${isGif ? 'video' : (feature === 'resize' ? 'resized' : (feature === 'hd' ? 'enhanced' : 'cleaned'))}-${Date.now()}.${isGif ? 'gif' : 'png'}`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
          <div className="absolute left-6">
            <button
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors duration-200"
              onClick={onBack}
            >
              <ArrowLeft size={15} />
              <span className="tracking-widest uppercase text-xs">Edit</span>
            </button>
          </div>

          <div className="flex items-center gap-3 mx-auto">
            <img src={logo} alt="Tam's Photo Exchanger logo" className="w-8 h-8 object-contain" />
            <span className="font-serif tracking-tight">Tam's Photo Exchanger</span>
          </div>

          <div className="absolute right-6 flex items-center gap-3">
            <button className="btn-ghost text-xs py-2 px-3" onClick={onReset}>
              <RefreshCw size={13} />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        {/* Header */}
        <div className="animate-fade-in text-center mb-10">
          <div className="inline-flex items-center gap-2 border border-white/10 px-4 py-2 mb-6">
            {isGif ? (
              <Video size={12} className="text-white/50" />
            ) : feature === 'hd' ? (
              <Sparkles size={12} className="text-white/50" />
            ) : (
              <Eraser size={12} className="text-white/50" />
            )}
            <span className="text-xs tracking-widest uppercase text-white/50">
              {isGif ? 'Video to GIF Conversion Complete' : (feature === 'resize' ? 'Smart Resizing Complete' : (feature === 'hd' ? 'HD Enhancement Complete' : 'Object Removal Complete'))}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl" style={{ fontWeight: 500 }}>
            {isGif ? 'Your GIF is Ready' : 'Your Image is Ready'}
          </h1>
          <p className="text-white/40 mt-3 text-sm" style={{ fontWeight: 300 }}>
            {isGif 
              ? 'Converted with optimized frame sampling and palette compression'
              : (feature === 'resize'
                ? 'Upscaled to 200% original size preserving optimal clarity'
                : (feature === 'hd'
                  ? 'Upscaled to 2x resolution with AI sharpening applied'
                  : 'Selected objects removed with intelligent background fill'))
            }
          </p>
        </div>

        {/* View Mode Toggle - Hidden for GIF */}
        {!isGif && (
          <div className="animate-fade-in animate-delay-100 flex justify-center mb-8">
            <div className="inline-flex border border-white/10">
              <button
                className="px-5 py-2.5 text-xs tracking-widest uppercase transition-colors duration-200 flex items-center gap-2"
                style={{
                  background: viewMode === 'compare' ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: viewMode === 'compare' ? '#fff' : 'rgba(255,255,255,0.35)',
                }}
                onClick={() => setViewMode('compare')}
              >
                <SplitSquareHorizontal size={12} />
                Compare
              </button>
              <button
                className="px-5 py-2.5 text-xs tracking-widest uppercase transition-colors duration-200 flex items-center gap-2 border-l border-white/10"
                style={{
                  background: viewMode === 'result' ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: viewMode === 'result' ? '#fff' : 'rgba(255,255,255,0.35)',
                }}
                onClick={() => setViewMode('result')}
              >
                <Maximize2 size={12} />
                Result Only
              </button>
            </div>
          </div>
        )}

        {/* Image/GIF display */}
        <div className="animate-fade-in-scale animate-delay-200 border border-white/5 overflow-hidden mb-8">
          <div className="border-b border-white/5 px-5 py-3 flex items-center justify-between">
            <span className="text-xs tracking-widest uppercase text-white/25">
              {isGif ? 'Encoded GIF' : (viewMode === 'compare' ? 'Before / After' : 'Result')}
            </span>
            <button
              className="text-xs text-white/30 hover:text-white/60 transition-colors duration-200 flex items-center gap-1.5"
              onClick={() => setLightbox(true)}
            >
              <Maximize2 size={12} />
              <span className="tracking-wider uppercase">Fullscreen</span>
            </button>
          </div>

          <div className="bg-[#0a0a0a]">
            {!isGif && viewMode === 'compare' ? (
              <CompareSlider beforeUrl={originalUrl} afterUrl={resultUrl} />
            ) : (
              <div className="flex items-center justify-center p-6" style={{ minHeight: '400px' }}>
                <img
                  src={resultUrl}
                  alt="Result"
                  className="max-w-full max-h-96 object-contain"
                  style={{ boxShadow: '0 0 60px rgba(0,0,0,0.5)' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="animate-fade-in animate-delay-300 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 mb-8">
            <div className="bg-black px-6 py-5 text-center">
              <div className="font-serif text-lg mb-1" style={{ fontWeight: 500 }}>
                {isGif ? 'Encoded' : (feature === 'resize' ? '200% Resize' : (feature === 'hd' ? '2x Upscaled' : 'Cleaned'))}
              </div>
              <div className="text-xs text-white/30 tracking-wider uppercase">Status</div>
            </div>
            <div className="bg-black px-6 py-5 text-center">
              {isGif ? (
                <>
                  <div className="font-serif text-lg mb-1" style={{ fontWeight: 500 }}>Looping</div>
                  <div className="text-xs text-white/30 tracking-wider uppercase">Animation</div>
                </>
              ) : (
                <>
                  <div className="font-serif text-lg mb-1 flex items-center justify-center gap-2" style={{ fontWeight: 500 }}>
                    Claid AI
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="text-xs text-white/30 tracking-wider uppercase">Engine</div>
                </>
              )}
            </div>
            <div className="bg-black px-6 py-5 text-center">
              <div className="font-serif text-lg mb-1" style={{ fontWeight: 500 }}>
                {isGif ? 'GIF (Animated)' : 'PNG (Lossless)'}
              </div>
              <div className="text-xs text-white/30 tracking-wider uppercase">Format</div>
            </div>
        </div>


        {/* Actions */}
        <div className="animate-fade-in animate-delay-400 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button className="btn-primary w-full sm:w-auto" onClick={handleDownload}>
            <Download size={15} />
            <span>Download Result</span>
          </button>
          <button className="btn-outline w-full sm:w-auto" onClick={onReset}>
            <RefreshCw size={15} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors duration-200"
            onClick={() => setLightbox(false)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <img
            src={resultUrl}
            alt="Full size result"
            className="max-w-full max-h-full object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 relative">
          <div className="sm:absolute sm:left-0">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Tam's Photo Exchanger logo" className="w-6 h-6 object-contain opacity-50" />
              <span className="font-serif text-xs text-white/20">Tam's Photo Exchanger</span>
            </div>
          </div>

          <div className="flex items-center gap-8 mx-auto">
            <a href="#" className="nav-link text-xs">About</a>
            <a href="#" className="nav-link text-xs">Privacy Policy</a>
            <a href="#" className="nav-link text-xs">Contact</a>
          </div>

          <div className="sm:absolute sm:right-0">
            <p className="text-xs text-white/15 tracking-wider">
              &copy; {new Date().getFullYear()} Tam's Photo Exchanger
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
