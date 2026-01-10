import { useState } from 'react';
import { Sidebar, Topbar } from './components';
import { Dashboard } from './Dashboard';
import { Analytics } from './Analytics';
import { PYQs } from './PYQs';
import { Leaderboard } from './Leaderboard';
import { Settings } from './Settings';
import { QuestionView } from './QuestionView';
import { userData } from './userData';

export function DashboardPage() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'problems':
        return <QuestionView />;
      case 'analytics':
        return <Analytics />;
      case 'pyqs':
        return <PYQs />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0D1117]">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 ml-20 flex flex-col h-screen overflow-hidden">
        <Topbar user={userData} onSectionChange={setActiveSection} />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}