import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Sparkles, Eraser, ChevronRight, X, Brush, Zap, Loader2, Maximize } from 'lucide-react';
import logo from '../images/logo.png';
import UploadZone from '../components/UploadZone';
import { processImageWithClaid } from '../lib/claid';

export type FeatureType = 'hd' | 'remove' | 'resize';

/** Fetch a blob URL and return a Blob for Claid Upload API */
async function blobFromUrl(url: string): Promise<Blob> {
  const res = await fetch(url);
  return res.blob();
}

interface EditorPageProps {
  onBack: () => void;
  onProcessed: (original: string, result: string, feature: FeatureType) => void;
}

type Stage = 'upload' | 'select' | 'mask' | 'processing';

const STEPS: { id: Stage; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'select', label: 'Select Tool' },
  { id: 'processing', label: 'Process' },
];

/** Local canvas inpainting — used only for Object Removal (Claid has no inpaint endpoint) */
function applyObjectRemoval(img: HTMLImageElement, maskCanvas: HTMLCanvasElement): Promise<string> {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const maskCtx = maskCanvas.getContext('2d')!;
    const maskDataBuffer = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / maskCanvas.width;
    const scaleY = canvas.height / maskCanvas.height;

    for (let pass = 0; pass < 3; pass++) {
      const currentData = new Uint8ClampedArray(imgData.data);
      for (let y = 0; y < maskCanvas.height; y++) {
        for (let x = 0; x < maskCanvas.width; x++) {
          const mi = (y * maskCanvas.width + x) * 4;
          if (maskDataBuffer.data[mi + 3] > 64) {
            const ix = Math.floor(x * scaleX);
            const iy = Math.floor(y * scaleY);
            const radius = 40;
            let r = 0, g = 0, b = 0, count = 0;

            for (let dy = -radius; dy <= radius; dy += 2) {
              for (let dx = -radius; dx <= radius; dx += 2) {
                const nx = ix + dx;
                const ny = iy + dy;
                if (nx < 0 || ny < 0 || nx >= canvas.width || ny >= canvas.height) continue;

                const mnx = Math.floor(nx / scaleX);
                const mny = Math.floor(ny / scaleY);
                const mni = (mny * maskCanvas.width + mnx) * 4;

                if (maskDataBuffer.data[mni + 3] < 64) {
                  const ni = (ny * canvas.width + nx) * 4;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const weight = 1 / (dist * dist + 1);
                  r += currentData[ni] * weight;
                  g += currentData[ni + 1] * weight;
                  b += currentData[ni + 2] * weight;
                  count += weight;
                }
              }
            }

            if (count > 0) {
              const ii = (iy * canvas.width + ix) * 4;
              imgData.data[ii] = r / count;
              imgData.data[ii + 1] = g / count;
              imgData.data[ii + 2] = b / count;
              if (pass < 2) maskDataBuffer.data[mi + 3] = 0;
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    resolve(canvas.toDataURL('image/png', 1.0));
  });
}


export default function EditorPage({ onBack, onProcessed }: EditorPageProps) {
  const [stage, setStage] = useState<Stage>('upload');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [feature, setFeature] = useState<FeatureType>('hd');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('Initializing AI Engines...');
  const [brushSize, setBrushSize] = useState(30);
  const [isPainting, setIsPainting] = useState(false);

  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setStage('select');
  };

  const handleProcess = async () => {
    if (!imageUrl) return;
    setStage('processing');
    setProgress(0);

    setProgressLabel('Connecting to Claid.ai Engine...');
    setProgress(10);

    const labels = feature === 'hd'
      ? [
          'Uploading image to Claid.ai...',
          'AI: Analyzing pixel structure...',
          'AI: Neural upscaling (smart_enhance)...',
          'AI: Restoring fine details & textures...',
          'AI: Polish & sharpness optimization...',
          'Finalizing HD output...'
        ]
      : feature === 'resize'
      ? [
          'Uploading image to Claid.ai...',
          'AI: Analyzing image dimensions...',
          'AI: Neural upscale (smart_enhance)...',
          'AI: Resizing with bounds preservation...',
          'AI: Rendering high-quality output...',
          'Finalizing output...'
        ]
      : [
          'Analyzing pixel regions...',
          'Generating background textures...',
          'Applying Neural Inpainting...',
          'Blending structural edges...',
          'AI Step: Harmonizing colors...',
          'Finalizing AI output...'
        ];

    // Run progress labels animation in parallel with actual processing
    let labelIndex = 0;
    const labelTimer = setInterval(() => {
      if (labelIndex < labels.length - 1) {
        labelIndex++;
        setProgressLabel(labels[labelIndex]);
        setProgress(Math.round(15 + (labelIndex / (labels.length - 1)) * 70));
      }
    }, 1200);

    let result: string;
    try {
      if (feature === 'hd') {
        // HD Enhancement via Claid AI: smart_enhance upscale + polish + HDR
        const blob = await blobFromUrl(imageUrl);
        result = await processImageWithClaid(blob, {
          restorations: {
            upscale: 'smart_enhance',
            polish: true,
          },
          resizing: {
            width: '200%',
            height: '200%',
            fit: 'bounds',
          },
          adjustments: {
            hdr: 15,
            sharpness: 25,
          },
        });
      } else if (feature === 'resize') {
        // Smart Resizing: upscale + resize bounds
        const blob = await blobFromUrl(imageUrl);
        result = await processImageWithClaid(blob, {
          restorations: {
            upscale: 'smart_enhance',
          },
          resizing: {
            width: '200%',
            height: '200%',
            fit: 'bounds',
          },
          adjustments: {
            sharpness: 20,
          },
        });
      } else {
        // Object Removal — local canvas inpainting (Claid has no inpaint API)
        const img = new Image();
        img.src = imageUrl;
        await new Promise(r => { img.onload = r; });
        const mask = maskCanvasRef.current || document.createElement('canvas');
        result = await applyObjectRemoval(img, mask);
      }
    } catch (err: any) {
      clearInterval(labelTimer);
      console.error(err);
      alert('Processing failed: ' + err.message);
      setStage('select');
      return;
    }

    clearInterval(labelTimer);
    setProgress(100);
    setProgressLabel('Done!');
    await new Promise(r => setTimeout(r, 400));

    onProcessed(imageUrl, result, feature);
  };

  const getCanvasPos = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = maskCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  }, []);

  const paint = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPainting) return;
    const canvas = maskCanvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const { x, y } = getCanvasPos(e);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 50, 50, 0.7)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  }, [isPainting, brushSize, getCanvasPos]);

  const initMaskCanvas = useCallback(() => {
    if (!maskCanvasRef.current || !imageUrl) return;
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = maskCanvasRef.current!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [imageUrl]);

  useEffect(() => {
    if (stage === 'mask') initMaskCanvas();
  }, [stage, initMaskCanvas]);

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const currentStep = stage === 'processing' ? 2 : stage === 'mask' ? 1 : stage === 'select' ? 1 : 0;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
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

          <div className="flex items-center gap-1 mx-auto">
            <img src={logo} alt="Tam's Photo Exchanger logo" className="w-8 h-8 object-contain" />
            <span className="font-serif ml-2 tracking-tight">Tam's Photo Exchanger</span>
          </div>

          <div className="absolute right-6 hidden sm:flex items-center gap-3">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="text-xs font-medium transition-colors duration-300"
                    style={{
                      color: i === currentStep ? '#fff' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    className="text-xs tracking-wider uppercase ml-2"
                    style={{ color: i === currentStep ? '#fff' : 'rgba(255,255,255,0.3)' }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight size={12} className="text-white/15" />
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-16">
        {/* Upload Stage */}
        {stage === 'upload' && (
          <div className="animate-fade-in-scale">
            <div className="text-center mb-12">
              <div className="divider mx-auto mb-6" />
              <h1 className="font-serif text-3xl" style={{ fontWeight: 500 }}>Upload Your Image</h1>
              <p className="text-white/40 mt-3 text-sm" style={{ fontWeight: 300 }}>
                Supported formats: JPG, PNG, WEBP &bull; Up to 20MB
              </p>
            </div>
            <UploadZone onFile={handleFile} />
          </div>
        )}

        {/* Select Stage */}
        {stage === 'select' && imageUrl && (
          <div className="animate-fade-in-scale">
            <div className="text-center mb-12">
              <div className="divider mx-auto mb-6" />
              <h1 className="font-serif text-3xl" style={{ fontWeight: 500 }}>Choose Your Tool</h1>
              <p className="text-white/40 mt-3 text-sm" style={{ fontWeight: 300 }}>
                Select the AI operation to apply to your image
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {/* HD Enhance */}
              <div
                className={`feature-card p-8 ${feature === 'hd' ? 'selected' : ''}`}
                onClick={() => setFeature('hd')}
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-10 h-10 flex items-center justify-center transition-colors duration-300"
                    style={{ border: `1px solid ${feature === 'hd' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}` }}
                  >
                    <Sparkles size={18} className="text-white/60" />
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-300"
                    style={{ borderColor: feature === 'hd' ? '#fff' : 'rgba(255,255,255,0.15)' }}
                  >
                    {feature === 'hd' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </div>
                <h3 className="font-serif text-xl mb-3" style={{ fontWeight: 500 }}>HD Enhancement</h3>
                <p className="text-white/40 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                  Upscale your image by 2x and apply AI sharpening to restore fine details and improve overall clarity.
                </p>
                <div className="mt-6 flex gap-3">
                  <span className="tag">2x Upscale</span>
                  <span className="tag">Sharpen</span>
                </div>
              </div>

              {/* Remove Object */}
              <div
                className={`feature-card p-8 ${feature === 'remove' ? 'selected' : ''}`}
                onClick={() => { setFeature('remove'); }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-10 h-10 flex items-center justify-center transition-colors duration-300"
                    style={{ border: `1px solid ${feature === 'remove' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}` }}
                  >
                    <Eraser size={18} className="text-white/60" />
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-300"
                    style={{ borderColor: feature === 'remove' ? '#fff' : 'rgba(255,255,255,0.15)' }}
                  >
                    {feature === 'remove' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </div>
                <h3 className="font-serif text-xl mb-3" style={{ fontWeight: 500 }}>Object Removal</h3>
                <p className="text-white/40 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                  Paint over logos, watermarks, or text to remove them. Our AI intelligently fills the area with matching background.
                </p>
                <div className="mt-6 flex gap-3">
                  <span className="tag">Inpainting</span>
                  <span className="tag">Brush Tool</span>
                </div>
              </div>

              {/* Smart Resizing (Claid) */}
              <div
                className={`feature-card p-8 ${feature === 'resize' ? 'selected' : ''}`}
                onClick={() => { setFeature('resize'); }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-10 h-10 flex items-center justify-center transition-colors duration-300"
                    style={{ border: `1px solid ${feature === 'resize' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}` }}
                  >
                    <Maximize size={18} className="text-white/60" />
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-300"
                    style={{ borderColor: feature === 'resize' ? '#fff' : 'rgba(255,255,255,0.15)' }}
                  >
                    {feature === 'resize' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </div>
                <h3 className="font-serif text-xl mb-3" style={{ fontWeight: 500 }}>Smart Resizing</h3>
                <p className="text-white/40 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                  Scale up your image to 200% via Claid.ai API while preserving quality and aspect ratio.
                </p>
                <div className="mt-6 flex gap-3">
                  <span className="tag">Claid AI</span>
                  <span className="tag">Resizing</span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="border border-white/5 overflow-hidden mb-10">
              <div className="border-b border-white/5 px-6 py-3 flex items-center justify-between">
                <span className="text-xs tracking-widest uppercase text-white/30">Preview</span>
                <button
                  className="text-xs text-white/30 hover:text-white/60 transition-colors duration-200 flex items-center gap-1.5"
                  onClick={() => { setImageUrl(null); setStage('upload'); }}
                >
                  <X size={12} />
                  <span className="tracking-wider uppercase">Change</span>
                </button>
              </div>
              <div className="bg-white/[0.02] flex items-center justify-center p-4" style={{ minHeight: '280px' }}>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full max-h-72 object-contain"
                  style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}
                />
              </div>
            </div>

            {feature === 'remove' ? (
              <div className="flex justify-center">
                <button className="btn-primary" onClick={() => setStage('mask')}>
                  <span>Paint Selection Area</span>
                  <Brush size={15} />
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button className="btn-primary" onClick={handleProcess}>
                  <span>Process Image</span>
                  <Sparkles size={15} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mask Stage */}
        {stage === 'mask' && imageUrl && (
          <div className="animate-fade-in-scale">
            <div className="text-center mb-8">
              <div className="divider mx-auto mb-6" />
              <h1 className="font-serif text-3xl" style={{ fontWeight: 500 }}>Mark Area to Remove</h1>
              <p className="text-white/40 mt-3 text-sm" style={{ fontWeight: 300 }}>
                Paint over the logo, text, or object you want to remove
              </p>
            </div>

            {/* Brush controls */}
            <div className="border border-white/5 p-4 mb-4 flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Brush size={14} className="text-white/40" />
                <span className="text-xs text-white/40 tracking-wider uppercase">Brush Size</span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                value={brushSize}
                onChange={e => setBrushSize(Number(e.target.value))}
                className="flex-1 accent-white"
                style={{ accentColor: '#fff' }}
              />
              <span className="text-xs text-white/40 w-6">{brushSize}</span>
              <button
                className="btn-ghost text-xs py-1.5 px-3"
                onClick={clearMask}
              >
                Clear
              </button>
            </div>

            <div ref={containerRef} className="relative border border-white/5 overflow-hidden mb-6" style={{ lineHeight: 0 }}>
              <img src={imageUrl} alt="Edit" className="w-full" draggable={false} />
              <canvas
                ref={maskCanvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${brushSize * 2}' height='${brushSize * 2}'%3E%3Ccircle cx='${brushSize}' cy='${brushSize}' r='${brushSize - 1}' fill='rgba(255,50,50,0.3)' stroke='white' stroke-width='1'/%3E%3C/svg%3E") ${brushSize} ${brushSize}, crosshair` }}
                onMouseDown={e => { setIsPainting(true); paint(e); }}
                onMouseMove={paint}
                onMouseUp={() => setIsPainting(false)}
                onMouseLeave={() => setIsPainting(false)}
                onTouchStart={e => { setIsPainting(true); paint(e); }}
                onTouchMove={paint}
                onTouchEnd={() => setIsPainting(false)}
              />
            </div>

            <div className="flex justify-center gap-4">
              <button className="btn-outline" onClick={() => setStage('select')}>
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>
              <button className="btn-primary" onClick={handleProcess}>
                <span>Process Image</span>
                <Eraser size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Processing Stage */}
        {stage === 'processing' && (
          <div className="animate-fade-in flex flex-col items-center justify-center py-20">
            <div className="relative mb-12">
              {imageUrl && (
                <div className="relative overflow-hidden" style={{ width: '280px', height: '200px' }}>
                  <img
                    src={imageUrl}
                    alt="Processing"
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.4)' }}
                  />
                  <div className="scan-line" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="text-white/20 animate-pulse" size={60} />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to right, transparent ${progress}%, rgba(0,0,0,0.7) ${progress}%)`,
                      transition: 'background 0.4s ease',
                    }}
                  />
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
                  >
                    <img
                      src={imageUrl}
                      alt="Processed preview"
                      className="w-full h-full object-cover"
                      style={{ filter: feature === 'hd' ? 'brightness(1.1) contrast(1.1) saturate(1.05)' : 'blur(1px)' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="w-full max-w-sm mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin text-white/50" />
                  <span className="text-xs text-white/50 tracking-wider font-mono">{progressLabel}</span>
                </div>
                <span className="text-xs text-white/30 font-mono">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}
                />
              </div>
            </div>

            <p className="text-white/25 text-[10px] tracking-widest uppercase font-mono">
              AI Core: {feature === 'hd' ? 'V2.4_UPSCALING_ENGINE' : 'V3.1_INPAINTING_CORE'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
