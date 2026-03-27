import React, { useState } from 'react';

export default function LoginCard({ onLogin }) {
  const [email, setEmail] = useState('');
  
  // Age Gate State
  const [step, setStep] = useState('login'); // 'login' or 'dob'
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');

  const handleGoogleClick = () => {
    setStep('dob');
  };

  const handleUpiClick = () => {
    onLogin({ name: 'UPI User', email: 'user@okicici' });
  };

  const handleDobSubmit = (e) => {
    e.preventDefault();
    if (!name || !dob) {
       setError("Please fill out all fields.");
       return;
    }

    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        age--;
    }

    if (age < 18) {
       setError("Access Denied: You must be 18 or older to use Finora X.");
    } else {
       setError("");
       onLogin({ name: name, email: "user@gmail.com" });
    }
  };

  return (
    <div className="w-full flex flex-col items-center bg-white/90 backdrop-blur-2xl border border-white/50 p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
      
      {/* Finora X Logo */}
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#594294] to-[#3a2868] text-white flex items-center justify-center font-bold text-2xl shadow-lg ring-4 ring-white/50">
          X
        </div>
      </div>
      
      <h1 className="text-[24px] font-bold text-gray-900 tracking-tight mb-2 font-sans text-center">
        Create An Account
      </h1>
      
      {step === 'login' && (
        <>
          <p className="text-[13px] font-bold tracking-wide text-gray-500 mb-8 text-center mt-1">
            Already have an account? <button className="text-[#594294] hover:text-[#45307a] transition-colors ml-0.5">Log In</button>
          </p>

          {/* Auth Buttons */}
          <div className="flex w-full gap-3 mb-8">
            {/* Google */}
            <button 
              onClick={handleGoogleClick}
              className="flex-1 flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-700 py-[9px] px-2 rounded-xl transition-colors text-[11px] font-bold tracking-wide shadow-sm border border-gray-200"
            >
              <div className="shrink-0">
                 <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                    </g>
                  </svg>
              </div>
              Google
            </button>

            {/* UPI Button replacing GitHub */}
            <button 
              onClick={handleUpiClick}
              className="flex-1 flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-700 py-[9px] px-2 rounded-xl transition-colors text-[11px] font-bold tracking-wide shadow-sm border border-gray-200"
            >
              <div className="shrink-0 text-[#25c870]">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                 </svg>
              </div>
              UPI Sign In
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center w-full mb-8">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-[12px] font-bold text-gray-400 tracking-wide">Or, sign up with email</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Form Area */}
          <form 
            className="w-full flex flex-col items-start" 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if(email) onLogin({ name: 'Email User', email: email });
            }}
          >
            <label className="text-[12px] font-bold text-gray-700 mb-2 tracking-wide w-full text-left">
              Work email *
            </label>
            
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-white border border-gray-200 rounded-[8px] py-[10px] px-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#594294] transition-colors text-[13.5px] mb-5 shadow-sm"
            />

            <p className="text-[11px] text-gray-500 leading-relaxed mb-6 w-full text-left font-semibold pr-2">
              By creating an account, I agree to Finora X's <a href="#" className="text-[#594294] hover:underline transition-colors">terms of service</a> and <a href="#" className="text-[#594294] hover:underline transition-colors">privacy policy</a>
            </p>

            <button 
              type="submit"
              disabled={!email}
              className="w-full bg-[#594294] hover:bg-[#4a367c] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-[8px] py-3 text-[13px] tracking-wide transition-colors shadow-md"
            >
              Continue
            </button>
          </form>
        </>
      )}

      {/* AGE GATE FORM */}
      {step === 'dob' && (
        <form onSubmit={handleDobSubmit} className="w-full flex flex-col animate-fade-in">
          <p className="text-center text-sm text-gray-500 mb-6 font-medium">Please complete your profile.</p>

          <label className="text-[12px] font-bold text-gray-700 mb-1.5 w-full text-left tracking-wide">
            Full Name
          </label>
          <input 
            type="text" 
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full bg-white border border-gray-200 rounded-[8px] py-[10px] px-3.5 text-gray-900 focus:outline-none focus:border-[#594294] transition-colors text-[13.5px] mb-4 shadow-sm"
          />

          <label className="text-[12px] font-bold text-gray-700 mb-1.5 w-full text-left tracking-wide mt-2">
            Date of Birth
          </label>
          <input 
            type="date" 
            required
            value={dob}
            onChange={e => setDob(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-[8px] py-[10px] px-3.5 text-gray-900 focus:outline-none focus:border-[#594294] transition-colors text-[13.5px] mb-2 shadow-sm"
          />
          <p className="text-[10px] text-gray-400 mb-6 font-medium">You must be at least 18 years old to use Finora X.</p>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-lg text-xs font-semibold mb-6 animate-pulse">
               {error}
            </div>
          )}

          <div className="flex gap-3">
             <button 
                type="button"
                onClick={() => { setStep('login'); setError(''); }}
                className="flex-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-[8px] py-3 text-[13px] transition-colors shadow-sm"
              >
                Back
             </button>
             <button 
                type="submit"
                className="flex-[2] bg-[#594294] hover:bg-[#4a367c] text-white font-bold rounded-[8px] py-3 text-[13px] transition-colors shadow-md"
              >
                Verify & Login
             </button>
          </div>
        </form>
      )}

    </div>
  );
}
