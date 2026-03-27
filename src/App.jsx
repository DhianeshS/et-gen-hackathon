import React, { useState } from 'react';
import LoginCard from './components/LoginCard';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0A0D14] font-sans">
      
      {/* Revolving Finance Pattern Background - NOW GLOBAL */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-60">
         <div className="w-[150vw] h-[150vw] max-w-[1500px] max-h-[1500px] bg-revolve rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#192b4d] via-[#0d162b] to-transparent">
            {/* Geometric Financial Grid */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MiIgaGVpZ2h0PSI0MiI+PHBhdGggZD0iTTAgMGg0MnY0MkgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIxIiBjeT0iMjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4zNSkiLz48cGF0aCBkPSJNMjEgMjFMMCAwTTIxIDIxTDQyIDBNMjEgMjFMMjEgMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDcpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] bg-repeat opacity-40 mix-blend-screen"></div>
            
            {/* Dynamic Market Trend Blobs */}
            <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px]"></div>
         </div>
      </div>

      {/* Global Foreground App Wrapper */}
      <div className="relative z-10 w-full h-full flex flex-1 overflow-hidden">
        {user ? (
          <Dashboard user={user} onLogout={handleLogout} />
        ) : (
          <div className="w-full absolute inset-0 flex justify-center items-center p-4 overflow-y-auto">
             <div className="w-full max-w-[400px]">
                <LoginCard onLogin={handleLogin} />
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
