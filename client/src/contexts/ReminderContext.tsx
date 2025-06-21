import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ReminderContextType {
  interestedRaffles: number[];
  userSession: string;
  addReminder: (raffleId: number) => void;
  removeReminder: (raffleId: number) => void;
  isInterested: (raffleId: number) => boolean;
  syncWithServer: () => Promise<void>;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};

interface ReminderProviderProps {
  children: ReactNode;
}

export const ReminderProvider = ({ children }: ReminderProviderProps) => {
  const [interestedRaffles, setInterestedRaffles] = useState<number[]>([]);
  const [userSession, setUserSession] = useState<string>('');

  // Get or create user session
  const getUserSession = () => {
    let session = localStorage.getItem('user_session');
    if (!session) {
      session = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('user_session', session);
    }
    return session;
  };

  // Initialize session and load reminders
  useEffect(() => {
    const session = getUserSession();
    setUserSession(session);
    
    // Load from localStorage immediately
    const savedReminders = localStorage.getItem('raffle_reminders');
    if (savedReminders) {
      try {
        const reminders = JSON.parse(savedReminders);
        setInterestedRaffles(reminders);
      } catch (error) {
        console.error('Error loading local reminders:', error);
      }
    }

    // Sync with server
    syncWithServer();
  }, []);

  const syncWithServer = async () => {
    try {
      const session = getUserSession();
      const response = await fetch(`/api/user-reminders/${session}`);
      if (response.ok) {
        const data = await response.json();
        const serverReminders = data.reminders || [];
        setInterestedRaffles(serverReminders);
        localStorage.setItem('raffle_reminders', JSON.stringify(serverReminders));
      }
    } catch (error) {
      console.error('Error syncing reminders with server:', error);
    }
  };

  const addReminder = (raffleId: number) => {
    setInterestedRaffles(prev => {
      if (prev.includes(raffleId)) return prev;
      const updated = [...prev, raffleId];
      localStorage.setItem('raffle_reminders', JSON.stringify(updated));
      return updated;
    });
  };

  const removeReminder = (raffleId: number) => {
    setInterestedRaffles(prev => {
      const updated = prev.filter(id => id !== raffleId);
      localStorage.setItem('raffle_reminders', JSON.stringify(updated));
      return updated;
    });
  };

  const isInterested = (raffleId: number) => {
    return interestedRaffles.includes(raffleId);
  };

  return (
    <ReminderContext.Provider value={{
      interestedRaffles,
      userSession,
      addReminder,
      removeReminder,
      isInterested,
      syncWithServer
    }}>
      {children}
    </ReminderContext.Provider>
  );
};