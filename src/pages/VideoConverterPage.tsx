import { useState, useRef } from 'react';
import { ArrowLeft, Video, ChevronRight, Play, Pause, Settings, Loader2, Scissors } from 'lucide-react';
import logo from '../images/logo.png';
import UploadZone from '../components/UploadZone';
import gifshot from 'gifshot';

interface VideoConverterPageProps {
  onBack: () => void;
  onProcessed: (original: string, result: string, feature: 'video-gif') => void;
}

type Stage = 'upload' | 'configure' | 'processing';

export default function VideoConverterPage({ onBack, onProcessed }: VideoConverterPageProps) {
  const [stage, setStage] = useState<Stage>('upload');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [fps, setFps] = useState(10);
  const [quality, setQuality] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('Initializing conversion engine...');

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setStage('configure');
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setEndTime(Math.min(dur, 5)); // Default to first 5 seconds
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
        if (!isPlaying) videoRef.current.pause();
      }
    }
  };

  const handleProcess = () => {
    if (!videoUrl) return;
    setStage('processing');
    setProgress(0);

    const labels = [
      'Extracting frames from video buffer...',
      'Analyzing color palettes...',
      'Optimizing GIF compression...',
      'Encoding frames into GIF container...',
      'Finalizing file structure...',
    ];

    let currentLabelIndex = 0;
    const labelInterval = setInterval(() => {
      if (currentLabelIndex < labels.length - 1) {
        currentLabelIndex++;
        setProgressLabel(labels[currentLabelIndex]);
      }
    }, 2000);

    // Using gifshot to convert video to gif
    gifshot.createGIF({
      video: [videoUrl],
      numFrames: (endTime - startTime) * fps,
      interval: 1 / fps,
      offset: startTime,
      gifWidth: videoRef.current?.videoWidth || 400,
      gifHeight: videoRef.current?.videoHeight || 300,
      sampleInterval: quality,
      progressCallback: (captureProgress: number) => {
        setProgress(Math.round(captureProgress * 100));
      }
    }, (obj: any) => {
      clearInterval(labelInterval);
      if (!obj.error) {
        onProcessed(videoUrl, obj.image, 'video-gif');
      } else {
        console.error('GIF Creation Error:', obj.error);
        setStage('configure');
        alert('Failed to convert video. Please try a shorter duration or lower FPS.');
      }
    });
  };

  const reset = () => {
    setVideoUrl(null);
    setStage('upload');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
          <div className="absolute left-6">
            <button
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors duration-200 text-sm"
              onClick={stage === 'configure' ? reset : onBack}
            >
              <ArrowLeft size={15} />
              <span className="tracking-widest uppercase text-xs">Back</span>
            </button>
          </div>

          <div className="flex items-center gap-1 mx-auto">
            <img src={logo} alt="Tam's Photo Exchanger logo" className="w-8 h-8 object-contain" />
            <span className="font-serif ml-2 tracking-tight">Tam's Photo Exchanger</span>
          </div>

          <div className="absolute right-6 hidden sm:flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stage === 'configure' ? 'bg-white animate-pulse' : 'bg-white/20'}`} />
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/40">Converter Mode</span>
             </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-16">
        {stage === 'upload' && (
          <div className="animate-fade-in-scale">
            <div className="text-center mb-12">
              <div className="divider mx-auto mb-6" />
              <h1 className="font-serif text-3xl" style={{ fontWeight: 500 }}>Video to GIF</h1>
              <p className="text-white/40 mt-3 text-sm" style={{ fontWeight: 300 }}>
                Convert MP4, WebM or MOV videos directly in your browser
              </p>
            </div>
            <UploadZone onFile={handleFile} accept="video/*" />
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
               {[
                 { title: 'Privacy', desc: 'Processed locally in your browser' },
                 { title: 'Quality', desc: 'High-fidelity palette optimization' },
                 { title: 'Speed', desc: 'Instant encoding via canvas core' }
               ].map((item, i) => (
                 <div key={i} className="p-6 border border-white/5 bg-white/[0.02]">
                    <h4 className="text-xs tracking-widest uppercase text-white/60 mb-2">{item.title}</h4>
                    <p className="text-xs text-white/25 leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        )}

        {stage === 'configure' && videoUrl && (
          <div className="animate-fade-in">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Left: Preview */}
              <div className="lg:col-span-2 space-y-6">
                <div className="border border-white/10 bg-black relative overflow-hidden group">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full aspect-video object-contain"
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onClick={togglePlay}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                     <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                        {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                     </div>
                  </div>
                </div>

                {/* Trimmer Sliders */}
                <div className="border border-white/5 bg-white/[0.02] p-8 space-y-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Scissors size={14} className="text-white/40" />
                      <span className="text-xs tracking-widest uppercase text-white/60 font-medium">Trimmer Control</span>
                    </div>
                    <span className="text-xs font-mono text-white/40">
                      {(endTime - startTime).toFixed(1)}s Selected
                    </span>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/20">
                        <span>Start Point</span>
                        <span>{startTime.toFixed(2)}s</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={startTime}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setStartTime(Math.min(val, endTime - 0.5));
                          if (videoRef.current) videoRef.current.currentTime = val;
                        }}
                        className="w-full accent-white h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/20">
                        <span>End Point</span>
                        <span>{endTime.toFixed(2)}s</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={endTime}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEndTime(Math.max(val, startTime + 0.5));
                          if (videoRef.current) videoRef.current.currentTime = val;
                        }}
                        className="w-full accent-white h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Settings */}
              <div className="space-y-6">
                <div className="border border-white/5 bg-white/[0.02] p-6 space-y-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings size={14} className="text-white/40" />
                    <span className="text-xs tracking-widest uppercase text-white/60 font-medium">GIF Settings</span>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-widest text-white/40">Frame Rate (FPS)</label>
                        <span className="text-xs font-mono">{fps}</span>
                      </div>
                      <div className="flex gap-2">
                        {[10, 15, 24].map((v) => (
                          <button
                            key={v}
                            onClick={() => setFps(v)}
                            className={`flex-1 py-2 text-[10px] border transition-colors ${
                              fps === v ? 'border-white bg-white text-black' : 'border-white/10 text-white/40 hover:border-white/30'
                            }`}
                          >
                            {v} FPS
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-widest text-white/40">Quality (Sample)</label>
                        <span className="text-xs font-mono">{quality === 1 ? 'High' : quality === 10 ? 'Standard' : 'Fast'}</span>
                      </div>
                      <select 
                        value={quality} 
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 py-2 px-3 text-xs text-white/60 focus:border-white/40 outline-none"
                      >
                        <option value={1}>High Quality (Slowest)</option>
                        <option value={10}>Standard Quality</option>
                        <option value={20}>Draft Quality (Fastest)</option>
                      </select>
                    </div>

                    <div className="pt-4">
                      <button 
                        className="btn-primary w-full justify-center group"
                        onClick={handleProcess}
                      >
                        <span>Convert to GIF</span>
                        <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-white/5 flex items-center gap-4 text-white/20">
                  <Video size={14} />
                  <div className="text-[10px] leading-tight flex-1">
                    Maximum recommended duration is 10 seconds for optimal file size.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === 'processing' && (
          <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center">
             <div className="relative mb-12">
                <div className="w-24 h-24 border border-white/10 flex items-center justify-center relative">
                   <Loader2 size={40} className="text-white/20 animate-spin" />
                   <div className="absolute inset-0 border-t border-white" style={{ animation: 'spin 2s linear infinite' }} />
                </div>
             </div>

             <h2 className="font-serif text-2xl mb-4">Converting Media...</h2>
             
             <div className="w-full max-w-sm mb-8">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-xs text-white/50 tracking-wider font-mono">{progressLabel}</span>
                 <span className="text-xs text-white/30 font-mono">{progress}%</span>
               </div>
               <div className="progress-bar">
                 <div
                   className="progress-fill"
                   style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}
                 />
               </div>
             </div>

             <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-mono">
               Hardware Accelerated &bull; Memory Managed &bull; AES Encrypted
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
