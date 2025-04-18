import { useState } from "react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { User } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user?: User;
  onMobileMenuToggle: () => void;
}

export function Header({ user, onMobileMenuToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-white border-b border-neutral-200 py-3 px-6 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center md:hidden">
          <Button 
            variant="ghost"
            size="icon"
            className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
            onClick={onMobileMenuToggle}
          >
            <i className="ri-menu-line text-xl"></i>
          </Button>
          <div className="ml-3 md:hidden flex items-center">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <i className="ri-building-line text-white text-lg"></i>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-700 via-primary-500 to-primary-600 bg-clip-text text-transparent ml-2">
              LeadWell
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center flex-1 mx-4">
          <div className="relative w-full max-w-md">
            <Input
              placeholder="Search leads, projects, team members..."
              className="w-full pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-neutral-400">
              <i className="ri-search-line"></i>
            </div>
          </div>
          <div className="hidden lg:flex items-center ml-6 space-x-3">
            <Button variant="outline" size="sm" className="h-9">
              <i className="ri-add-line mr-1"></i> New Lead
            </Button>
            <Button variant="ghost" size="sm" className="h-9">
              <i className="ri-calendar-line mr-1"></i> Schedule
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <i className="ri-notification-3-line text-lg text-neutral-600"></i>
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-red-500 text-[10px]">3</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                <DropdownMenuItem className="py-3 cursor-pointer">
                  <div className="flex">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i className="ri-user-add-line"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium">New Lead Assigned</p>
                      <p className="text-xs text-neutral-500">James Donovan was assigned to you</p>
                      <p className="text-xs text-neutral-400 mt-1">2 min ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3 cursor-pointer">
                  <div className="flex">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i className="ri-calendar-line"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Upcoming Call</p>
                      <p className="text-xs text-neutral-500">Call with Sarah Miller in 30 minutes</p>
                      <p className="text-xs text-neutral-400 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3 cursor-pointer">
                  <div className="flex">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i className="ri-robot-line"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium">AI Insight Generated</p>
                      <p className="text-xs text-neutral-500">New insights available for your leads</p>
                      <p className="text-xs text-neutral-400 mt-1">5 hours ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center font-medium text-primary-600">
                View All Notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <i className="ri-calendar-check-line text-lg text-neutral-600"></i>
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-yellow-500 text-[10px]">2</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Today's Schedule</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                <DropdownMenuItem className="py-3 cursor-pointer">
                  <div className="flex">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i className="ri-time-line"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Initial Consultation</p>
                      <p className="text-xs text-neutral-500">Sarah Miller, 11:00 AM</p>
                      <p className="text-xs text-neutral-400 mt-1">30 minutes</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3 cursor-pointer">
                  <div className="flex">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i className="ri-team-line"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Team Meeting</p>
                      <p className="text-xs text-neutral-500">All team members, 2:00 PM</p>
                      <p className="text-xs text-neutral-400 mt-1">1 hour</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center font-medium text-primary-600">
                View Calendar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                  <UserAvatar 
                    src={user?.avatar} 
                    name={user?.name || "Mike Henderson"}
                    className="w-8 h-8"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <i className="ri-user-line mr-2"></i> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <i className="ri-settings-3-line mr-2"></i> Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <i className="ri-customer-service-line mr-2"></i> Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                  <i className="ri-logout-box-r-line mr-2"></i> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
