'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/dashboard';
import { FullPageLoader } from '@/components';

interface DashboardContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DashboardContext = createContext<DashboardContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check localStorage for dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    // Save dark mode preference
    localStorage.setItem('darkMode', isDarkMode.toString());
    // Apply to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  if (authLoading || !isAuthenticated) {
    return <FullPageLoader />;
  }

  return (
    <DashboardContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className={`min-h-screen transition-colors duration-300
        ${isDarkMode ? 'bg-gray-900' : 'bg-[#FAFAFA]'}`}>
        {/* Sidebar */}
        <Sidebar 
          user={user} 
          onLogout={logout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
        
        {/* Main Content */}
        <main className="lg:pl-[280px] min-h-screen transition-all duration-300">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
