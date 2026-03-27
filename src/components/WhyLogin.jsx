import React from 'react';
import { ShieldCheck, Target, TrendingUp, Sparkles } from 'lucide-react';

export default function WhyLogin() {
  const benefits = [
    {
      icon: <Target className="w-5 h-5 text-finPurple-light" />,
      title: "Personalized recommendations",
      desc: "Tailored investment strategies based on your unique goals."
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-finPurple-light" />,
      title: "Financial health tracking",
      desc: "Monitor your savings rate, emergency fund, and overall score."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-finPurple-light" />,
      title: "Direct investment execution",
      desc: "Securely connect and execute trades seamlessly."
    },
    {
      icon: <Sparkles className="w-5 h-5 text-finPurple-light" />,
      title: "Behavioral coaching insights",
      desc: "AI-driven guidance to avoid emotional investing mistakes."
    }
  ];

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Why join FinMentor?</h3>
      <div className="space-y-5">
        {benefits.map((b, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="bg-purple-50 p-2 rounded-lg">
              {b.icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 text-sm">{b.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
