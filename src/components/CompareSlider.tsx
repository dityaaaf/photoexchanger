import { useRef, useState, useCallback, useEffect } from 'react';

interface CompareSliderProps {
  beforeUrl: string;
  afterUrl: string;
}

export default function CompareSlider({ beforeUrl, afterUrl }: CompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    updatePosition(e.clientX);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    updatePosition(e.touches[0].clientX);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.touches[0].clientX);
    };
    const onUp = () => { isDragging.current = false; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [updatePosition]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden select-none"
      style={{ cursor: 'col-resize', aspectRatio: '16/9' }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* After (background) */}
      <img
        src={afterUrl}
        alt="After"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={beforeUrl}
          alt="Before"
          className="absolute inset-0 object-contain"
          style={{ width: `${10000 / position}%`, maxWidth: 'none', left: 0, top: 0, height: '100%' }}
          draggable={false}
        />
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 tag pointer-events-none">Before</div>
      <div className="absolute top-4 right-4 tag pointer-events-none">After</div>

      {/* Handle */}
      <div
        className="absolute top-0 bottom-0 flex flex-col items-center justify-center"
        style={{ left: `${position}%`, transform: 'translateX(-50%)', width: '2px', background: 'rgba(255,255,255,0.8)' }}
      >
        <div
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg flex-shrink-0"
          style={{ boxShadow: '0 0 0 2px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.5)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 4L2 8L5 12M11 4L14 8L11 12" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
