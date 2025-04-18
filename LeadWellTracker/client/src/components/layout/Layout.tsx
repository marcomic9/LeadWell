import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileNavigation } from "./MobileNavigation";
import { User } from "@shared/schema";

interface LayoutProps {
  children: React.ReactNode;
  user?: User;
}

export function Layout({ children, user }: LayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Mobile Sidebar - would be implemented with proper overlay and animations in a full app */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-neutral-900 bg-opacity-50" onClick={toggleMobileSidebar}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <Sidebar user={user} />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Header */}
        <Header user={user} onMobileMenuToggle={toggleMobileSidebar} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 pb-16 md:pb-0">
          {children}
        </main>

        {/* Mobile Navigation */}
        <MobileNavigation />
      </div>
    </div>
  );
}
