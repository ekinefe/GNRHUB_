import { useState } from 'react'
// IMPORT THE COMPONENT HERE
import FuzzyText from './components/animations/FuzzyText';

function App() {
  return (
    // The "min-h-screen" ensures the background covers the whole page
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">

      <div className="text-center space-y-8">
        {/* The FuzzyText Component */}
        <div className="flex justify-center">
          <FuzzyText
            baseIntensity={0.2}
            hoverIntensity={0.5}
            enableHover
          >
            GNRHUB [v2]
          </FuzzyText>
        </div>

        <p className="text-zinc-400 text-xl font-light">
          System Status: <span className="text-green-400 font-mono font-bold">ONLINE</span>
        </p>

        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-all cursor-pointer">
            Initialize System
          </button>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-all cursor-pointer">
            Access Dashboard
          </button>
        </div>
      </div>

    </div>
  )
}

export default App