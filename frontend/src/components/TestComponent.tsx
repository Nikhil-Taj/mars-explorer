import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">🚀 Mars Explorer</h1>
        <p className="text-white/70 mb-8">AI-Powered Mars Photo Explorer</p>
        <div className="space-y-4">
          <div className="p-4 bg-white/10 rounded-lg">
            <h2 className="text-xl text-white mb-2">✅ App is Loading Successfully!</h2>
            <p className="text-white/60">All components are working correctly.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <h3 className="text-red-400 font-semibold">🔍 AI Search</h3>
              <p className="text-white/60 text-sm">Natural Language</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <h3 className="text-blue-400 font-semibold">💬 AI Chat</h3>
              <p className="text-white/60 text-sm">Smart Assistant</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <h3 className="text-purple-400 font-semibold">🧠 AI Analysis</h3>
              <p className="text-white/60 text-sm">Photo Intelligence</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <h3 className="text-green-400 font-semibold">❤️ Favorites</h3>
              <p className="text-white/60 text-sm">Personal Collection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
