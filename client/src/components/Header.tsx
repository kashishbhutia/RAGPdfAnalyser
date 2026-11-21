import { useEffect, useState } from 'react';
import { checkHealth } from '../services/api';

export default function Header() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const check = async () => {
      const result = await checkHealth();
      setIsConnected(result.success);
    };

    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className="header-logo">
        <div className="header-logo-icon">📄</div>
        <div>
          <div className="header-title">
            <span className="gradient-text">Smart Doc</span> Analyzer
          </div>
          <div className="header-subtitle">RAG-Powered Document Intelligence</div>
        </div>
      </div>

      <div className="header-status">
        <span className={`header-status-dot ${isConnected ? '' : 'disconnected'}`} />
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
    </header>
  );
}
