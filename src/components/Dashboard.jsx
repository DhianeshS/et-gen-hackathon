import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Send, User, Sparkles, Clock, ShieldCheck, Target, CheckCircle, Smartphone, Trash2, Settings, Camera, Upload, X
} from 'lucide-react';

// ─── Gemini AI — runs directly in the browser ─────────────────────────────
const VITE_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = VITE_KEY ? new GoogleGenAI({ apiKey: VITE_KEY }) : null;

const getSystemPrompt = (tone, risk) => `You are Finora X, a world-class expert in Indian personal finance, wealth management, and mutual funds. Provide actionable, high-fidelity insights in a ${tone.toLowerCase()}, sharp style.

USER'S RISK TOLERANCE: ${risk}

CAPABILITIES: Analyze financial datasets, SIP calculations, market trends. Use first-principles thinking for savings, tax, and investment problems. Format responses using Markdown (## headers, **bold**, bullet lists, numbered lists, tables).

RULES:
- Never hallucinate market data. If a specific fund's return is unknown, state it clearly.
- Be direct and concise. No fluff.
- Do not provide legally binding guarantees. You are an AI, not a SEBI-certified broker.
- Always end your response with a clear, actionable next step.`;

// ─── Markdown renderer (no extra dependencies) ────────────────────────────
const esc = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const inlineMd = (t) => esc(t)
  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
  .replace(/\*(.*?)\*/g,     '<em class="text-[#e8d5fc]">$1</em>')
  .replace(/`(.*?)`/g,       '<code class="bg-[#0d0f1a] border border-white/10 px-1.5 py-0.5 rounded text-[#c4a3f5] text-[13px]">$1</code>');

const renderMd = (text) => {
  let inCode = false;
  return text.split('\n').map(l => {
    if (l.startsWith('```')) { inCode = !inCode; return inCode ? '<pre class="bg-[#0d0f1a] border border-white/10 rounded-xl p-4 my-3 overflow-x-auto font-mono text-[13px] text-[#c4a3f5]"><code>' : '</code></pre>'; }
    if (inCode)              return esc(l) + '\n';
    if (l.startsWith('### ')) return `<h3 class="text-[15px] font-bold mt-4 mb-1 text-[#DBCDF0]">${inlineMd(l.slice(4))}</h3>`;
    if (l.startsWith('## '))  return `<h2 class="text-[17px] font-bold mt-5 mb-2 text-white">${inlineMd(l.slice(3))}</h2>`;
    if (l.startsWith('# '))   return `<h1 class="text-[20px] font-bold mt-5 mb-2 text-white">${inlineMd(l.slice(2))}</h1>`;
    if (l.match(/^[*-] /))   return `<div class="flex gap-2 my-0.5"><span class="text-[#9b7fe8] shrink-0 mt-[3px]">•</span><span class="leading-[1.7]">${inlineMd(l.slice(2))}</span></div>`;
    if (l.match(/^\d+\. /))  { const n = l.match(/^\d+/)[0]; return `<div class="flex gap-2 my-0.5"><span class="text-[#9b7fe8] font-bold min-w-[1.2rem] shrink-0">${n}.</span><span class="leading-[1.7]">${inlineMd(l.replace(/^\d+\.\s*/, ''))}</span></div>`; }
    if (l.match(/^-{3,}$/))  return '<hr class="border-white/10 my-3"/>';
    if (!l.trim())            return '<div class="h-2"></div>';
    return `<p class="leading-[1.7] my-0.5">${inlineMd(l)}</p>`;
  }).join('');
};

export default function Dashboard({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [customProfilePic, setCustomProfilePic] = useState(() => localStorage.getItem('finorax_profile_pic') || '');

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  }, [messages, loading]);
  
  // Navigation Routing State
  const [activeView, setActiveView] = useState('chat'); // 'chat', 'search', 'codex', 'settings'
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // UPI Linking State
  const [upiId, setUpiId] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [bankLinked, setBankLinked] = useState(false);

  // AI & Bot State
  const [aiTone, setAiTone] = useState(() => localStorage.getItem('finorax_tone') || 'Professional');
  const [riskTolerance, setRiskTolerance] = useState(() => localStorage.getItem('finorax_risk') || 'Moderate');

  // Photo Prompt State
  const [showPhotoPrompt, setShowPhotoPrompt] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // If signed in via Google/Gmail and NO photo exists, trigger prompt
    if (user?.email?.includes('@gmail.com') && !localStorage.getItem('finorax_profile_pic')) {
      const t = setTimeout(() => setShowPhotoPrompt(true), 1500);
      return () => clearTimeout(t);
    }
  }, [user]);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Camera access denied. Please allow permissions or use upload.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      setTimeout(() => {
        if (videoRef.current?.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
      }, 100);
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    }
  }, [stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 400; // Fixed resolution output for size limiting
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      // Draw center crop
      const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
      const x = (videoRef.current.videoWidth - size) / 2;
      const y = (videoRef.current.videoHeight - size) / 2;
      ctx.drawImage(videoRef.current, x, y, size, size, 0, 0, 400, 400);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // Compress significantly
      setCustomProfilePic(dataUrl);
      localStorage.setItem('finorax_profile_pic', dataUrl);
      stopCamera();
      setShowPhotoPrompt(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomProfilePic(reader.result);
        localStorage.setItem('finorax_profile_pic', reader.result);
        setShowPhotoPrompt(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e, customMessage = null) => {
    if (e) e.preventDefault();
    const navInput = customMessage || input.trim();
    if (!navInput) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: navInput }]);
    setLoading(true);

    try {
      if (!ai) {
        setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ **API Key Missing.**\n\nAdd your Gemini key to `.env`:\n```\nVITE_GEMINI_API_KEY=your_actual_key_here\n```\nThen restart `npm run dev`.' }]);
        return;
      }
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: navInput,
        config: { systemInstruction: getSystemPrompt(aiTone, riskTolerance) }
      });
      setMessages(prev => [...prev, { role: 'assistant', text: response.text }]);
    } catch (error) {
      console.error('Gemini Error:', error);
      let errorText = error.message || 'Could not reach Gemini. Check your API key and try again.';
      
      // Format ugly JSON traces and specific errors into readable UI messages
      if (errorText.includes('429') || errorText.includes('RESOURCE_EXHAUSTED')) {
        errorText = "⚠️ **API Quota Exceeded:** You've reached your free tier request limit for the Gemini API. Please wait a minute and try again.";
      } else if (errorText.includes('{')) {
        try {
          // Attempt to extract stringified error message if wrapped in JSON
          const match = errorText.match(/\{.*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            errorText = `**Error:** ${parsed.error?.message || errorText}`;
          }
        } catch (e) {
          errorText = `**Error:** ${errorText}`;
        }
      } else {
        errorText = `**Error:** ${errorText}`;
      }

      setMessages(prev => [...prev, { role: 'assistant', text: errorText }]);
    } finally {
      setLoading(false);
    }
  };

  const handleToolClick = (prompt) => {
    setActiveView('chat');
    handleSend(null, prompt);
  };

  const handleNav = async (view) => {
    setActiveView(view);
    if (view === 'search') {
      setHistoryLoading(true);
      try {
        const res = await fetch('/api/history');
        const data = await res.json();
        setHistoryList(data);
      } catch (e) {
        console.error("Failed to load history", e);
      } finally {
        setHistoryLoading(false);
      }
    }
  };

  const handleDeleteChat = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation?")) return;
    
    // Optimistic UI updates
    setHistoryList(prev => prev.filter(c => c.id !== id));
    
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  };

  const handleNewChat = () => {
    // Auto-persist the existing chat before clearing it
    if (messages.length > 0) {
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      }).catch(e => console.error("Auto-save failed:", e));
    }
    setMessages([]);
    setActiveView('chat');
  };

  const handleLinkBank = (e) => {
    e.preventDefault();
    if(!upiId) return;
    setIsLinking(true);
    // Simulate API call to link bank
    setTimeout(() => {
       setIsLinking(false);
       setBankLinked(true);
    }, 1200);
  };

  return (
    <div className="flex h-screen w-full bg-transparent text-gray-800 font-sans overflow-hidden">
      
      {/* 1. Dark Sidebar matching Image 1 exactly */}
      <div className="w-64 bg-[#1E1E1E]/80 backdrop-blur-[20px] shadow-2xl text-gray-200 p-3 flex flex-col justify-between hidden md:flex shrink-0 z-20 border-r border-white/5">
        <div className="flex flex-col gap-1 mt-4">
          <button 
            onClick={handleNewChat}
            className={`w-full text-left px-4 py-3 rounded-lg hover:bg-[#2A2B32] transition-colors text-[14px] font-medium ${(activeView === 'chat' && messages.length === 0) ? 'bg-[#2A2B32] text-white' : 'text-gray-300'}`}
          >
            New chat
          </button>
          <button 
            onClick={() => handleNav('search')}
            className={`w-full text-left px-4 py-3 rounded-lg hover:bg-[#2A2B32] transition-colors text-[14px] font-medium ${activeView === 'search' ? 'bg-[#2A2B32] text-white' : 'text-gray-300'}`}
          >
            Search chats
          </button>

          <button 
            onClick={() => handleNav('settings')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg hover:bg-[#2A2B32] transition-colors text-[14px] font-medium ${activeView === 'settings' ? 'bg-[#2A2B32] text-white' : 'text-gray-300'}`}
          >
            <Settings className="w-[15px] h-[15px]" /> Settings
          </button>
        </div>

        <div className="pb-2 relative">
          {/* User pill exactly mimicking Image 1 */}
          <div className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-[#2D2F34] group border border-white/5">
            <div className="w-8 h-8 rounded-full bg-[#565869] shrink-0 border border-white/5 flex items-center justify-center overflow-hidden">
                {customProfilePic ? (
                    <img src={customProfilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <User className="text-gray-300 w-4 h-4" />
                )}
            </div>
            {/* The user name dynamically from props, fulfilling the request */}
            <div className="flex flex-col text-left truncate flex-1 min-w-0">
              <span className="font-semibold text-[14.5px] text-gray-100 group-hover:text-white truncate w-full block">
                {user?.email || "Unknown"}
              </span>
              {bankLinked && upiId && (
                <span className="text-[11px] text-[#8a8d9e] flex items-center truncate mt-0.5">
                  <Smartphone className="w-[11px] h-[11px] mr-1 text-[#25c870] shrink-0" /> <span className="truncate">{upiId}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Area (Transparent Background to let App.jsx pass through) */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-transparent">
        
        {/* Universal Top Header */}
        <div className="flex items-center justify-between md:justify-end p-4 border-b md:border-b-0 border-white/10 bg-[#1E1E1E]/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none shadow-sm md:shadow-none z-40 text-white w-full absolute md:relative top-0">
          
          {/* Mobile Logo Only */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#836fa9] text-white flex items-center justify-center font-bold text-[13px] shadow-sm">X</div>
            <span className="font-bold text-[15px] tracking-wide">Finora X</span>
          </div>

          <div className="flex items-center relative">
             <div className="relative">
                 <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2.5 hover:bg-white/5 p-1.5 pr-3 rounded-full md:rounded-[14px] transition-colors border border-transparent md:border-white/10 md:bg-[#161824]/80 shadow-sm backdrop-blur-md min-w-[32px]"
                 >
                     <div className="w-8 h-8 rounded-full bg-[#3D3F44] shrink-0 border border-white/10 flex items-center justify-center overflow-hidden">
                        {customProfilePic ? (
                            <img src={customProfilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="text-gray-300 w-4 h-4" />
                        )}
                     </div>
                     <span className="hidden md:block text-[13px] font-bold text-[#e1e3ec]">Profile & Settings</span>
                 </button>

                 {showUserMenu && (
                     <div className="absolute right-0 top-[115%] w-[270px] bg-[#161824]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-fade-in z-50 p-4">
                         <p className="text-[11px] font-bold text-[#8a8d9e] mb-3 uppercase tracking-widest px-1">Profile Photo URL</p>
                         <div className="flex gap-2 mb-4">
                             <input 
                                 type="text" 
                                 value={customProfilePic}
                                 onChange={(e) => {
                                     setCustomProfilePic(e.target.value);
                                     localStorage.setItem('finorax_profile_pic', e.target.value);
                                 }}
                                 placeholder="https://..." 
                                 className="flex-1 bg-[#0A0D14] border border-white/10 focus:border-[#674FA3] rounded-xl py-2 px-3 text-white placeholder-[#6b6f80] text-[12.5px] outline-none min-w-0"
                             />
                             {customProfilePic && (
                                <button onClick={() => { setCustomProfilePic(''); localStorage.removeItem('finorax_profile_pic'); }} className="text-[12px] font-bold bg-white/5 border border-white/10 px-3 rounded-xl hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-colors shrink-0">Clear</button>
                             )}
                         </div>

                         <div className="h-px bg-white/5 w-full my-3"></div>
                         
                         <button 
                             type="button"
                             onClick={onLogout}
                             className="w-full text-center px-4 py-2.5 text-[13.5px] bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors font-bold"
                         >
                             Log Out Securely
                         </button>
                     </div>
                 )}
             </div>
          </div>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto w-full flex flex-col items-center relative z-10 pt-[72px] md:pt-0">
            {activeView === 'search' ? (
                // --- HISTORY STATE ---
                <div className="w-full max-w-[850px] p-4 md:p-8 animate-fade-in mt-[2vh]">
                    <h2 className="text-[22px] font-bold text-white mb-6">Conversation History</h2>
                    {historyLoading ? (
                        <p className="text-[#a4a6b5]">Loading past chats from secure backend...</p>
                    ) : (
                        <div className="space-y-4">
                            {historyList.map(chat => (
                                <div 
                                    key={chat.id} 
                                    className="bg-[#0f111a]/60 p-5 rounded-[20px] border border-white/10 text-white hover:bg-white/5 transition-colors shadow-sm backdrop-blur-md flex items-center justify-between group cursor-pointer"
                                    onClick={() => { setMessages(chat.messages); setActiveView('chat'); }}
                                >
                                    <div className="flex-1 mr-4">
                                        <p className="font-bold text-[15px]">{chat.title}</p>
                                        <p className="text-[12px] text-[#8a8d9e] mt-1.5 font-medium">
                                            {new Date(chat.timestamp).toLocaleString()} &bull; {chat.messages.length} messages
                                        </p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={(e) => handleDeleteChat(e, chat.id)}
                                        className="p-2.5 text-[#8a8d9e] hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Delete chat"
                                    >
                                        <Trash2 className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                            ))}
                            {historyList.length === 0 && (
                                <p className="text-[#a4a6b5] bg-white/5 p-6 rounded-[20px] border border-white/5 text-center">No past conversations found. Save chats by clicking 'New Chat'.</p>
                            )}
                        </div>
                    )}
                </div>
            ) : activeView === 'codex' ? (
                // --- CODEX STATE ---
                <div className="w-full max-w-[850px] p-4 md:p-8 animate-fade-in mt-[2vh] text-white">
                    <h2 className="text-[22px] font-bold mb-6">Financial Codex</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { title: "FIRE Movement", desc: "Financial Independence, Retire Early." },
                          { title: "SIP (Systematic Inv. Plan)", desc: "Investing a fixed amount regularly into mutual funds." },
                          { title: "CAGR", desc: "Compound Annual Growth Rate. The smooth annualized yield." },
                          { title: "Index Funds", desc: "Passive mutual funds that accurately track market indices." }
                        ].map((item, i) => (
                           <div key={i} className="bg-[#0f111a]/60 p-5 rounded-[20px] border border-white/10 shadow-sm backdrop-blur-md">
                               <h3 className="font-bold text-[#DBCDF0] mb-2">{item.title}</h3>
                               <p className="text-[13px] text-[#a4a6b5] leading-relaxed">{item.desc}</p>
                           </div>
                        ))}
                    </div>
                </div>
            ) : activeView === 'settings' ? (
                // --- BOT SETTINGS & PROFILE STATE ---
                <div className="w-full max-w-[850px] p-4 md:p-8 animate-fade-in mt-[2vh] text-white">
                    <h2 className="text-[22px] font-bold mb-6">Settings</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Column */}
                        <div className="bg-[#0f111a]/60 p-6 rounded-[20px] border border-white/10 shadow-sm backdrop-blur-md">
                            <h3 className="text-[15px] font-bold text-[#DBCDF0] mb-5">My Profile</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-[#1E1E2A] flex shrink-0 items-center justify-center border border-white/10 overflow-hidden relative group">
                                    {customProfilePic ? (
                                        <img src={customProfilePic} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[17px] font-bold truncate max-w-[150px]">{user?.email || "Authenticated"}</p>
                                    <p className="text-[12px] text-[#25c870] font-semibold mt-0.5">Verified Local User</p>
                                </div>
                            </div>

                            <button onClick={() => setShowPhotoPrompt(true)} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-[12px] text-[13px] font-bold text-white transition-colors flex items-center justify-center gap-2 mb-4">
                               <Camera className="w-[15px] h-[15px]" /> Edit Profile Photo
                            </button>

                            {customProfilePic && (
                                <button onClick={() => { setCustomProfilePic(''); localStorage.removeItem('finorax_profile_pic'); }} className="w-full text-red-400 hover:text-red-300 text-[13px] font-bold transition-colors mb-6">Clear Image</button>
                            )}

                            <div className="border-t border-white/10 pt-5">
                                <button type="button" onClick={onLogout} className="text-red-400 hover:text-red-300 text-[14px] font-bold transition-colors">Log out securely</button>
                            </div>
                        </div>

                        {/* Finance Bot Column */}
                        <div className="bg-[#0f111a]/60 p-6 rounded-[20px] border border-white/10 shadow-sm backdrop-blur-md flex flex-col justify-between">
                            <div>
                                <h3 className="text-[15px] font-bold text-[#DBCDF0] mb-5">AI Strategy Intelligence</h3>
                                
                                <label className="block text-[12.5px] font-bold mb-2 text-white">Communication Tone</label>
                                <div className="relative mb-5">
                                    <select 
                                        value={aiTone}
                                        onChange={e => { setAiTone(e.target.value); localStorage.setItem('finorax_tone', e.target.value); }}
                                        className="w-full bg-[#161824] border border-white/10 focus:border-[#674FA3] rounded-[10px] py-[10px] px-3.5 text-white text-[13px] font-semibold outline-none appearance-none"
                                    >
                                        <option value="Professional">Professional (Formal & Precise)</option>
                                        <option value="Casual">Casual (Friendly & Accessible)</option>
                                        <option value="Direct">Direct (Bullet Points & Bottom Line)</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">▼</div>
                                </div>

                                <label className="block text-[12.5px] font-bold mb-2 text-white">Default Risk Tolerance</label>
                                <div className="relative mb-4">
                                    <select 
                                        value={riskTolerance}
                                        onChange={e => { setRiskTolerance(e.target.value); localStorage.setItem('finorax_risk', e.target.value); }}
                                        className="w-full bg-[#161824] border border-white/10 focus:border-[#674FA3] rounded-[10px] py-[10px] px-3.5 text-white text-[13px] font-semibold outline-none appearance-none"
                                    >
                                        <option value="Conservative">Conservative (Capital Preservation)</option>
                                        <option value="Moderate">Moderate (Balanced Yield)</option>
                                        <option value="Aggressive">Aggressive (High Growth)</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">▼</div>
                                </div>
                            </div>
                            
                            <p className="text-[11.5px] text-[#a4a6b5] leading-relaxed bg-[#161824] p-3 rounded-xl border border-white/5">
                                These settings actively re-route the AI core to prioritize solutions that align with your selected financial posture.
                            </p>
                        </div>
                    </div>
                </div>
            ) : messages.length === 0 ? (
                // --- ZERO STATE: Single Contrast Glass Card ---
                <div className="w-full max-w-[850px] p-4 md:p-8 animate-fade-in mt-[2vh] md:mt-[6vh]">
                    
                    <div className="bg-[#0f111a]/60 rounded-[28px] p-6 md:p-10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden border border-white/10">
                        {/* Header */}
                        <div className="flex items-center gap-3 md:gap-4 mb-6 relative z-20">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#674FA3] to-[#452b82] text-white flex items-center justify-center font-bold text-[22px] shadow-[0_0_15px_rgba(103,79,163,0.5)]">
                                X
                            </div>
                            <div>
                                <h1 className="text-[22px] font-bold tracking-wide">Finora X</h1>
                                <p className="text-[13px] text-[#b4b7c5]">India's AI Finance Operating System</p>
                            </div>
                        </div>

                        {/* Intro Paragraph */}
                        <p className="text-[14.5px] leading-relaxed text-[#f4f5f8] mb-8 max-w-3xl relative z-20">
                            Welcome to Finora X – your complete AI-powered financial operating system. Specialized in Indian financial planning with expertise in mutual funds, SIPs, stocks, taxes, and behavioral finance. Our AI suite helps you transform from a confused saver into a confident investor with personalized strategies.
                        </p>

                        {/* 4 Feature Grid directly matching Image 2 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 relative z-20">
                            {[
                                { icon: <Sparkles className="w-[18px] h-[18px] text-[#DBCDF0]" />, title: "Real-Time Analysis", desc: "Instant financial insights" },
                                { icon: <Clock className="w-[18px] h-[18px] text-[#DBCDF0]" />, title: "24/7 Available", desc: "Always here to help" },
                                { icon: <ShieldCheck className="w-[18px] h-[18px] text-[#DBCDF0]" />, title: "Certified Advice", desc: "Data-driven strategies" },
                                { icon: <Target className="w-[18px] h-[18px] text-[#DBCDF0]" />, title: "Goal-Based", desc: "Personalized roadmaps" },
                            ].map((f, i) => (
                                <div key={i} className="bg-white/5 rounded-[14px] p-4 flex items-start gap-3.5 border border-white/10 hover:bg-white/10 transition-colors shadow-sm">
                                    <div className="mt-0.5">{f.icon}</div>
                                    <div>
                                        <h3 className="font-semibold text-[13.5px] text-white mb-0.5 tracking-wide">{f.title}</h3>
                                        <p className="text-[12px] text-[#a4a6b5]">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Functionality: Working Toggles / Expertise Chips */}
                        <div className="relative z-30 mb-8 pointer-events-auto">
                            <p className="text-[14px] font-bold mb-3 text-white">My Expertise:</p>
                            <div className="flex flex-wrap gap-2.5">
                                {[
                                    { text: "Mutual Funds", style: "border-[#b094e8] text-[#e1d5fa] hover:bg-[#b094e8]/20" }, 
                                    { text: "SIP Strategy", style: "border-[#8aa9ed] text-[#d6e3fc] hover:bg-[#8aa9ed]/20" }, 
                                    { text: "Budget Planning", style: "border-[#85d3aa] text-[#d3f4e1] hover:bg-[#85d3aa]/20" }, 
                                    { text: "Tax Optimization", style: "border-[#a5a0ea] text-[#dfddfc] hover:bg-[#a5a0ea]/20" }, 
                                    { text: "Goal Setting", style: "border-[#e0b284] text-[#fbe1cc] hover:bg-[#e0b284]/20" }, 
                                    { text: "Behavioral Coaching", style: "border-[#e890ad] text-[#fae1ea] hover:bg-[#e890ad]/20" }
                                ].map((exp, i) => (
                                    <button 
                                        type="button"
                                        key={i} 
                                        className={`px-4 py-[7px] rounded-full text-[12.5px] font-semibold border-[1.5px] bg-[#0f111a]/80 backdrop-blur-md transition-colors cursor-pointer ${exp.style}`}
                                        onClick={() => handleToolClick(`Tell me about ${exp.text}`)}
                                    >
                                        {exp.text}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* UPI Bank Link Flow Inside the Card */}
                        <div className="relative z-30 w-full mb-8 pt-6 border-t border-white/10 pointer-events-auto">
                           <p className="text-[14px] font-bold mb-3 text-white">Bank Integration:</p>
                           {!bankLinked ? (
                              <form onSubmit={handleLinkBank} className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
                                 <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                       <Smartphone className="h-4 w-4 text-[#8a8d9e]" />
                                    </div>
                                    <input 
                                       type="text" 
                                       required
                                       value={upiId}
                                       onChange={(e) => setUpiId(e.target.value)}
                                       placeholder="Enter your UPI ID (e.g., name@okicici) to sync bank" 
                                       className="w-full bg-[#161824] border border-white/10 focus:border-[#674FA3] rounded-[12px] py-[10px] pl-[38px] pr-3 text-white placeholder-[#6b6f80] text-[13.5px] outline-none transition-colors"
                                    />
                                 </div>
                                 <button 
                                    type="submit" 
                                    disabled={isLinking || !upiId}
                                    className="bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center justify-center rounded-[12px] px-5 py-[10px] font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                                 >
                                    {isLinking ? 'Linking...' : 'Connect Bank Account'}
                                 </button>
                              </form>
                           ) : (
                              <div className="bg-[#182620] border border-[#25c870]/30 rounded-xl p-3 flex items-center gap-3 w-full max-w-lg">
                                 <CheckCircle className="w-5 h-5 text-[#25c870]" />
                                 <div>
                                   <p className="text-[13px] font-bold text-white">Bank Account Linked Successfully</p>
                                   <p className="text-[11px] text-[#8ae0a8]">Finora X will now securely analyze your transaction patterns via {upiId}.</p>
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* Bottom Tags matching Image 2 perfectly */}
                        <div className="text-[11px] text-[#8a8d9e] space-y-1.5 relative z-20 mt-6">
                            <p>🎯 <strong className="text-[#b4b7c5] font-semibold ml-1">Built for:</strong> India</p>
                            <p>⚡ <strong className="text-[#b4b7c5] font-semibold ml-1">Platform:</strong> Finora X - Financial Operating System</p>
                            <p>✨ <strong className="text-[#b4b7c5] font-semibold ml-1">Powered by:</strong> Advanced AI & Real-Time Market Data</p>
                        </div>
                    </div>

                </div>
            ) : (
                // --- CHAT STATE: Standard Messages ---
                <div className="w-full max-w-3xl p-4 md:p-8 space-y-6 mt-[2vh]">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-4 w-full ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#674FA3] to-[#452b82] text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm font-bold text-[13px] border border-white/10">
                                    X
                                </div>
                            )}
                            
                            <div className={`px-5 py-4 rounded-[20px] text-[15px] max-w-[calc(100%-3rem)] sm:max-w-[85%] border shadow-sm backdrop-blur-md overflow-x-auto break-words min-w-0
                                ${msg.role === 'user' 
                                ? 'bg-[#674FA3] text-white border-[#836fa9] rounded-br-none leading-relaxed' 
                                : 'bg-[#0f111a]/80 border-white/10 text-[#f4f5f8] rounded-bl-none'}`}
                            >
                                {msg.role === 'user'
                                  ? msg.text
                                  : <div dangerouslySetInnerHTML={{ __html: renderMd(msg.text) }} />
                                }
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-[#1E1E2A] flex items-center justify-center flex-shrink-0 mt-1 border border-white/10 overflow-hidden">
                                    {customProfilePic ? (
                                        <img src={customProfilePic} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-4 w-full">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#674FA3] to-[#452b82] text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm font-bold text-[13px] border border-white/10 animate-pulse">
                                X
                            </div>
                            <div className="px-5 py-4 rounded-[20px] bg-[#0f111a]/80 border border-white/10 shadow-sm rounded-bl-none text-[#a4a6b5]">
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Global Spacer to push content far above the fixed footer gradient */}
            <div className="h-48 md:h-56 w-full shrink-0 pointer-events-none" />
        </div>

        {/* 3. Fixed Input Area floating at the Bottom over Transparent bg */}
        {/* pointer-events-none ensures you can scroll/click things beneath the gradient! */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:pb-8 bg-gradient-to-t from-[#0A0D14] to-transparent pt-24 z-30 pointer-events-none">
          <div className="max-w-[850px] mx-auto flex flex-col items-center pointer-events-auto">
            <form onSubmit={(e) => handleSend(e)} className="relative w-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl bg-[#13151f]/90 backdrop-blur-2xl border border-white/10">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask your AI finance expert..." 
                className="w-full bg-transparent text-white placeholder-gray-500 rounded-2xl pl-5 pr-14 py-[18px] focus:outline-none focus:ring-2 focus:ring-[#836fa9]/50 transition-all font-medium text-[15.5px]"
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="absolute top-[8px] right-2 p-2.5 bg-[#674FA3] text-white rounded-[12px] hover:bg-[#594294] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                <Send className="w-[18px] h-[18px] ml-0.5" />
              </button>
            </form>
            <p className="text-center text-[11px] text-[#555866] mt-3 font-medium">
              Finora X can make mistakes. Not a SEBI-registered advisor. Standard LLM disclaimer.
            </p>
          </div>
        </div>

      </div>

      {/* Global Profile Photo Feature Overlay */}
      {showPhotoPrompt && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#161824] border border-white/10 rounded-[28px] w-full max-w-sm p-7 shadow-2xl relative animate-fade-in flex flex-col items-center">
                  
                  <button onClick={() => { setShowPhotoPrompt(false); stopCamera(); }} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 p-1.5 rounded-full backdrop-blur-md transition-colors">
                      <X className="w-5 h-5" />
                  </button>
                  
                  <div className="w-14 h-14 bg-gradient-to-br from-[#674FA3] to-[#452b82] rounded-2xl flex items-center justify-center mb-5 shrink-0 border border-white/10 shadow-lg">
                      <User className="text-white w-7 h-7" />
                  </div>

                  <h2 className="text-[20px] font-bold text-white mb-2 text-center tracking-wide">Update Profile Photo</h2>
                  <p className="text-[13px] text-[#8a8d9e] text-center mb-7 leading-relaxed font-medium">Capture a quick photo from your web camera, or upload one from your gallery.</p>
                  
                  {isCameraActive ? (
                      <div className="w-full flex justify-center mb-2 flex-col items-center">
                          <video ref={videoRef} className="w-full aspect-square object-cover rounded-full bg-black border-2 border-[#594294] shadow-[0_0_20px_rgba(89,66,148,0.3)] mb-6 scale-x-[-1]" autoPlay playsInline />
                          <button onClick={capturePhoto} className="bg-white text-[#161824] hover:bg-gray-200 px-8 py-[12px] rounded-full font-bold text-[14px] shadow-lg transition-transform hover:scale-[1.03] active:scale-95">Snap & Save</button>
                      </div>
                  ) : (
                      <div className="flex flex-col gap-3.5 w-full">
                          <button onClick={startCamera} className="w-full bg-[#2A2B32] hover:bg-[#3D3F44] border border-white/5 py-[14px] rounded-2xl flex items-center justify-center gap-2.5 font-bold text-[14px] text-white transition-all shadow-sm">
                              <Camera className="w-[18px] h-[18px]" />
                              Open Camera
                          </button>
                          
                          <div className="relative w-full">
                              <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleFileUpload} 
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="w-full bg-transparent hover:bg-white/5 border border-white/10 py-[14px] rounded-2xl flex items-center justify-center gap-2.5 font-bold text-[14px] text-gray-300 transition-all">
                                  <Upload className="w-[18px] h-[18px]" />
                                  Upload from Gallery
                              </div>
                          </div>
                      </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
              </div>
          </div>
      )}

    </div>
  );
}
