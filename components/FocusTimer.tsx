import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Timer } from 'lucide-react';

interface FocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound here ideally
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-4 rounded-2xl shadow-xl w-64 animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
          <Timer className="w-4 h-4 text-primary-500" />
          <span>Pomodoro</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center mb-4">
        <div className="text-5xl font-bold text-slate-800 dark:text-white font-mono tracking-tighter">
          {formatTime(timeLeft)}
        </div>
        <div className="flex justify-center gap-2 mt-2">
          <button 
            onClick={() => switchMode('focus')}
            className={`text-xs px-2 py-1 rounded-full ${mode === 'focus' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-slate-400'}`}
          >
            Focus
          </button>
          <button 
            onClick={() => switchMode('break')}
            className={`text-xs px-2 py-1 rounded-full ${mode === 'break' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'text-slate-400'}`}
          >
            Break
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={toggleTimer}
          className="flex items-center justify-center w-12 h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors shadow-md"
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
        </button>
        <button
          onClick={resetTimer}
          className="flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-dark-border text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FocusTimer;