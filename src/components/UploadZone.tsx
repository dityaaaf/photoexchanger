import { useRef, useState, useCallback, useMemo } from 'react';
import { Upload, Image, Video } from 'lucide-react';

interface UploadZoneProps {
  onFile: (file: File) => void;
  accept?: string;
}

export default function UploadZone({ onFile, accept = "image/jpeg,image/png,image/webp" }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const isVideo = useMemo(() => accept.includes('video'), [accept]);

  const handleFile = useCallback((file: File) => {
    if (file) {
      // Basic check: if accept is "video/*", allow any video. Otherwise check image types.
      const isTypeAllowed = isVideo 
        ? file.type.startsWith('video/')
        : ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);

      if (isTypeAllowed) {
        onFile(file);
      }
    }
  }, [onFile, isVideo]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onClick = () => inputRef.current?.click();

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`upload-zone ${dragging ? 'dragging' : ''} flex flex-col items-center justify-center py-20 px-8 text-center`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
      />

      <div className="mb-6 relative">
        <div className="w-16 h-16 border border-white/15 flex items-center justify-center">
          {dragging ? (
            isVideo ? <Video size={24} className="text-white/80" /> : <Image size={24} className="text-white/80" />
          ) : (
            isVideo ? <Video size={24} className="text-white/40" /> : <Upload size={24} className="text-white/40" />
          )}
        </div>
        {dragging && (
          <div className="absolute inset-0 border border-white/50 animate-ping" />
        )}
      </div>

      <p className="font-serif text-lg text-white/80 mb-2">
        {dragging ? 'Release to upload' : `Drop your ${isVideo ? 'video' : 'image'} here`}
      </p>
      <p className="text-xs text-white/30 tracking-widest uppercase mb-8">
        or click to browse
      </p>

      <div className="flex gap-4">
        {(isVideo ? ['MP4', 'WEBM', 'MOV'] : ['JPG', 'PNG', 'WEBP']).map(ext => (
          <span key={ext} className="tag">{ext}</span>
        ))}
      </div>
    </div>
  );
}
