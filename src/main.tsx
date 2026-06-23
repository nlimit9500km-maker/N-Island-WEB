import {StrictMode, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initFirebaseSync } from './lib/firebaseSync.ts';

function Root() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initFirebaseSync().finally(() => {
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F6F2EA] flex items-center justify-center font-sans text-[#a88252]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-[#dfd6c6] border-t-[#a78358] animate-spin"></div>
          <p className="font-bold tracking-widest text-sm">连接云端屿·记...</p>
        </div>
      </div>
    );
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
