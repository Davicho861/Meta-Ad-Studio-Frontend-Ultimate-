import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { CentralCanvas } from './CentralCanvas';
import { FullScreenModal } from './FullScreenModal';
import AssetCheckerBanner from './AssetCheckerBanner';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient Glow Background */}
      <div className="fixed inset-0 bg-gradient-glow opacity-30 pointer-events-none" />
      
      {/* Main Layout Grid */}
      <div className="relative z-10 h-screen flex flex-col">
        <TopBar />
        
        <div className="flex-1 flex overflow-hidden">
          <LeftSidebar />
          <CentralCanvas />
        </div>
      </div>

      {/* Full Screen Modal */}
      <FullScreenModal />
  <AssetCheckerBanner />
    </div>
  );
};