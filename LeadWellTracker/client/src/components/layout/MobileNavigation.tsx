import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const [location] = useLocation();

  const navigationItems = [
    { name: "Dashboard", href: "/", icon: "ri-dashboard-line" },
    { name: "Leads", href: "/leads", icon: "ri-contacts-line" },
    { name: "Calendar", href: "/calendar", icon: "ri-calendar-line" },
    { name: "Team", href: "/team", icon: "ri-team-line" },
    { name: "Settings", href: "/settings", icon: "ri-settings-3-line" }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-10 px-1 py-1 shadow-lg">
      <div className="flex justify-around">
        {navigationItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-lg transition-all",
                isActive 
                  ? "text-primary-600 bg-primary-50" 
                  : "text-neutral-500 hover:bg-neutral-50"
              )}
            >
              <div className={cn(
                "flex items-center justify-center h-6 w-6 rounded-full mb-1",
                isActive && "bg-primary-100"
              )}>
                <i className={`${item.icon} ${isActive ? "text-lg" : "text-base"}`}></i>
              </div>
              <span className={cn(
                "text-xs font-medium transition-all",
                isActive ? "scale-105" : ""
              )}>
                {item.name}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
