import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { User } from "@shared/schema";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  user?: User;
}

export function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();

  const navigation = [
    {
      title: "Main",
      items: [
        { name: "Dashboard", href: "/", icon: "ri-dashboard-line" },
        { name: "Leads", href: "/leads", icon: "ri-contacts-line" },
        { name: "Calendar", href: "/calendar", icon: "ri-calendar-line" },
        { name: "Team", href: "/team", icon: "ri-team-line" },
        { name: "Settings", href: "/settings", icon: "ri-settings-3-line" },
      ],
    },
    {
      title: "Analytics",
      items: [
        { name: "Overview", href: "/analytics", icon: "ri-line-chart-line" },
        { name: "Reports", href: "/reports", icon: "ri-file-chart-line" },
        { name: "AI Insights", href: "/ai-insights", icon: "ri-robot-line" },
      ],
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200 h-full">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <i className="ri-building-line text-white text-xl"></i>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 via-primary-500 to-primary-600 bg-clip-text text-transparent">
            LeadWell
          </h1>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3">
        {navigation.map((group) => (
          <div key={group.title} className="mb-6">
            <div className="px-3 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {group.title}
            </div>
            {group.items.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 transition-all",
                    isActive
                      ? "text-primary-600 bg-primary-50"
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center mr-3",
                    isActive 
                      ? "bg-primary-100 text-primary-700" 
                      : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200"
                  )}>
                    <i className={cn(item.icon, "text-lg")}></i>
                  </div>
                  {item.name}
                  {item.name === "AI Insights" && (
                    <span className="ml-auto px-1.5 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                      New
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 mx-3 mb-3 border border-neutral-200 rounded-xl bg-neutral-50">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <UserAvatar 
              src={user?.avatar} 
              name={user?.name || "Mike Henderson"} 
              className="w-10 h-10"
            />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-neutral-800">{user?.name || "Mike Henderson"}</p>
            <p className="text-xs text-neutral-500">{user?.role || "Project Manager"}</p>
            <Button variant="ghost" size="sm" className="mt-2 text-xs w-full justify-start p-0 h-auto text-neutral-600 hover:text-neutral-900 hover:bg-transparent">
              <i className="ri-settings-3-line mr-1"></i> Profile Settings
            </Button>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-200">
          <Button variant="outline" size="sm" className="w-full text-xs justify-start">
            <i className="ri-logout-box-r-line mr-1.5"></i> Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
