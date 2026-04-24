import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import EditorPage, { FeatureType } from './pages/EditorPage';
import ResultPage from './pages/ResultPage';
import VideoConverterPage from './pages/VideoConverterPage.tsx'; // Video to GIF converter
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

type Page = 'landing' | 'editor' | 'result' | 'contact' | 'privacy' | 'video-converter';

interface ProcessedResult {
  original: string;
  result: string;
  feature: FeatureType | 'video-gif';
}

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [processed, setProcessed] = useState<ProcessedResult | null>(null);

  const handleProcessed = (original: string, result: string, feature: FeatureType | 'video-gif') => {
    setProcessed({ original, result, feature });
    setPage('result');
  };

  const handleReset = () => {
    setProcessed(null);
    setPage('editor');
  };

  return (
    <>
      {page === 'landing' && (
        <LandingPage 
          onStart={() => setPage('editor')} 
          onVideoStart={() => setPage('video-converter')}
          onContact={() => setPage('contact')} 
          onPrivacy={() => setPage('privacy')} 
        />
      )}
      {page === 'editor' && (
        <EditorPage
          onBack={() => setPage('landing')}
          onProcessed={handleProcessed}
        />
      )}
      {page === 'result' && processed && (
        <ResultPage
          originalUrl={processed.original}
          resultUrl={processed.result}
          feature={processed.feature}
          onReset={handleReset}
          onBack={() => setPage('editor')}
        />
      )}
      {page === 'video-converter' && (
        <VideoConverterPage
          onBack={() => setPage('landing')}
          onProcessed={handleProcessed}
        />
      )}
      {page === 'contact' && (
        <ContactPage onBack={() => setPage('landing')} />
      )}
      {page === 'privacy' && (
        <PrivacyPolicyPage onBack={() => setPage('landing')} />
      )}
    </>
  );
}
