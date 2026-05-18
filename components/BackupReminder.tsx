
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { dbService } from '../services/db';
import { AppSettings } from '../types';

export const BackupReminder: React.FC = () => {
  const [show, setShow] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const checkBackup = async () => {
      const s = await dbService.getSettings();
      setSettings(s);

      if (!s) return;

      const startYear = s.backupCycleStartYear || new Date().getFullYear();
      const currentYear = new Date().getFullYear();
      const yearsPassed = currentYear - startYear;

      // Show reminder if 10 years or more have passed
      if (yearsPassed >= 10) {
        // Check snooze
        if (s.backupReminderSnoozeUntil) {
          const snoozeDate = new Date(s.backupReminderSnoozeUntil);
          if (new Date() < snoozeDate) {
            return;
          }
        }
        setShow(true);
      }
    };

    checkBackup();
    // Check every hour
    const interval = setInterval(checkBackup, 3600000);
    return () => clearInterval(interval);
  }, []);

  const handleSnooze = async (hours: number) => {
    if (!settings) return;

    const snoozeUntil = new Date();
    if (hours === 168) { // 1 week
      snoozeUntil.setDate(snoozeUntil.getDate() + 7);
    } else {
      snoozeUntil.setHours(snoozeUntil.getHours() + hours);
    }

    const updatedSettings = {
      ...settings,
      backupReminderSnoozeUntil: snoozeUntil.toISOString()
    };

    await dbService.saveSettings(updatedSettings);
    setSettings(updatedSettings);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-100 overflow-hidden">
        <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-orange-800">
            <AlertTriangle size={20} />
            <span className="font-bold">Backup Required</span>
          </div>
          <button onClick={() => setShow(false)} className="text-orange-400 hover:text-orange-600">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            You are completing the <strong>10-year cycle</strong> of this ledger. To ensure performance and data safety, please take a full backup and reset the ledger.
          </p>
          
          <div className="grid grid-cols-1 gap-2">
            <a 
              href="#/settings" 
              onClick={() => setShow(false)}
              className="w-full bg-orange-600 text-white py-2.5 rounded-xl text-center font-bold text-sm hover:bg-orange-700 transition-colors shadow-md"
            >
              Go to Settings & Backup
            </a>
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center">
                <Clock size={10} className="mr-1" /> Remind me in:
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleSnooze(1)}
                  className="px-2 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                >
                  1 Hr
                </button>
                <button 
                  onClick={() => handleSnooze(5)}
                  className="px-2 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                >
                  5 Hrs
                </button>
                <button 
                  onClick={() => handleSnooze(168)}
                  className="px-2 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                >
                  1 Week
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
