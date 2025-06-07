"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { useGetProjectsQuery } from "@/state/api";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Home,
  Layers3,
  LockIcon,
  LucideIcon,
  Search,
  Settings,
  ShieldAlert,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { Tooltip } from "@mui/material";
// Fix import paths to use client/src/components/*
import SearchBar from "../../components/Search/SearchBar";
import Chatbot from "../../components/Chatbot/Chatbot";
import ProjectStats from "../../components/Statistics/ProjectStats";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const priorityColors: Record<string, string> = {
  Urgent: "bg-red-500",
  High: "bg-yellow-400",
  Medium: "bg-blue-400",
  Low: "bg-green-400",
  Backlog: "bg-gray-400",
};

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname === "/" && href === "/dashboard");
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  return (
    <Link href={href} className="block w-full">
      <Tooltip title={isSidebarCollapsed ? label : ""} placement="right" arrow disableHoverListener={!isSidebarCollapsed}>
        <div
          className={`relative flex cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-200 font-medium tracking-wide
            ${isActive
              ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 dark:from-blue-900 dark:to-blue-800 dark:text-white shadow-md"
              : "text-gray-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-800/50"}
          `}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span className={`whitespace-nowrap transition-opacity duration-200 ${isSidebarCollapsed ? "opacity-0 md:hidden" : "opacity-100"}`}>{label}</span>
          {isActive && (
            <div className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-blue-500" />
          )}
        </div>
      </Tooltip>
    </Link>
  );
};

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);

  const { data: projects } = useGetProjectsQuery();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const router = useRouter();

  // Enhanced sidebar styles with smooth transitions
  const sidebarClassNames = `fixed left-0 top-0 z-40 h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-black dark:to-gray-900 shadow-2xl transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800
    ${isSidebarCollapsed ? "w-20" : "w-72"}
    ${isSidebarCollapsed ? "-translate-x-full md:translate-x-0" : "translate-x-0"}
  `;

  return (
    <>
      {/* Backdrop overlay with blur effect for mobile */}
      <div
        className={`fixed inset-0 z-30 backdrop-blur-sm bg-black/40 transition-opacity duration-300 md:hidden
          ${isSidebarCollapsed ? "pointer-events-none opacity-0" : "opacity-100"}`}
        onClick={() => dispatch(setIsSidebarCollapsed(true))}
        aria-hidden="true"
      />
      {/* Sidebar container */}
      <aside className={sidebarClassNames} aria-label="Sidebar">
        {/* Header with logo and controls */}
        <div className="sticky top-0 z-50 flex min-h-[64px] w-full items-center justify-between bg-white/90 px-4 py-3 dark:bg-black/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={36}
              height={36}
              className="rounded-lg shadow"
            />
            <span className={`text-2xl font-extrabold tracking-tight text-blue-700 dark:text-white transition-opacity duration-200 ${isSidebarCollapsed ? "opacity-0 md:hidden" : "opacity-100"}`}>Nucleus</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Desktop collapse button */}
            <button
              className="hidden md:inline-flex p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            {/* Mobile close button */}
            <button
              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-800 transition-colors md:hidden"
              onClick={() => dispatch(setIsSidebarCollapsed(true))}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          {/* Main navigation */}
          <nav className="space-y-1 px-3 pt-2 pb-1">
            <SidebarLink icon={Home} label="Home" href="/" />
            <SidebarLink icon={Briefcase} label="Timeline" href="/timeline" />
            <SidebarLink icon={Search} label="Search" href="/search" />
            <SidebarLink icon={Settings} label="Settings" href="/settings" />
            <SidebarLink icon={User} label="Users" href="/users" />
            <SidebarLink icon={Users} label="Teams" href="/teams" />
          </nav>
          <div className="my-3 border-t border-gray-200 dark:border-gray-700" />
          {/* Projects section */}
          <div className="px-3 pb-2">
            <button
              onClick={() => !isSidebarCollapsed && setShowProjects((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className={`transition-opacity duration-200 ${isSidebarCollapsed ? "opacity-0 md:hidden" : "opacity-100"}`}>Projects</span>
              {!isSidebarCollapsed && (
                showProjects ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )
              )}
              {projects && !isSidebarCollapsed && (
                <span className="ml-2 inline-block min-w-[22px] text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-full px-2 py-0.5">{projects.length}</span>
              )}
            </button>
            <div className={`transition-all duration-300 ${showProjects && !isSidebarCollapsed ? "max-h-64 opacity-100 z-10 overflow-y-auto" : "max-h-0 opacity-0 overflow-hidden"} bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 mt-2 mb-8 px-1 py-1 custom-scrollbar`} style={{ maxHeight: showProjects && !isSidebarCollapsed ? '260px' : '0px' }}> 
              {projects?.map((project: any) => (
                <SidebarLink
                  key={project.id}
                  icon={Briefcase}
                  label={project.name}
                  href={`/projects/${project.id}`}
                />
              ))}
            </div>
          </div>
          {/* Divider and extra spacing between Projects and Priority */}
          <div className="my-4 border-t-2 border-blue-100 dark:border-gray-800" />
          {/* Priorities section */}
          <div className="px-3 pb-2">
            <button
              onClick={() => !isSidebarCollapsed && setShowPriority((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className={`transition-opacity duration-200 ${isSidebarCollapsed ? "opacity-0 md:hidden" : "opacity-100"}`}>Priority</span>
              {!isSidebarCollapsed && (
                showPriority ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )
              )}
            </button>
            <div className={`transition-all duration-300 ${showPriority && !isSidebarCollapsed ? "max-h-64 opacity-100 z-10 overflow-y-auto" : "max-h-0 opacity-0 overflow-hidden"} bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 mt-2 mb-4 px-1 py-1 custom-scrollbar`} style={{ maxHeight: showPriority && !isSidebarCollapsed ? '220px' : '0px' }}> 
              <SidebarLink icon={AlertCircle} label={<span className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${priorityColors.Urgent}`}></span>Urgent</span>} href="/priority/urgent" />
              <SidebarLink icon={ShieldAlert} label={<span className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${priorityColors.High}`}></span>High</span>} href="/priority/high" />
              <SidebarLink icon={AlertTriangle} label={<span className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${priorityColors.Medium}`}></span>Medium</span>} href="/priority/medium" />
              <SidebarLink icon={AlertOctagon} label={<span className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${priorityColors.Low}`}></span>Low</span>} href="/priority/low" />
              <SidebarLink icon={Layers3} label={<span className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${priorityColors.Backlog}`}></span>Backlog</span>} href="/priority/backlog" />
            </div>
          </div>
          <div className="my-3 border-t border-gray-200 dark:border-gray-700" />
          {/* --- Custom Features Below --- */}
          <div className="px-3 mt-4 space-y-2">
            <button className="w-full text-left px-4 py-2 rounded-lg font-medium text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors" onClick={() => router.push('/search')}>Search</button>
            <button className="w-full text-left px-4 py-2 rounded-lg font-medium text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors" onClick={() => router.push('/priority')}>Priority Stats</button>
            <button className="w-full text-left px-4 py-2 rounded-lg font-medium text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors" onClick={() => router.push('/ai-assistant')}>AI Assistant</button>
            <button className="w-full text-left px-4 py-2 rounded-lg font-medium text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors" onClick={() => router.push('/project-stats')}>Project Stats</button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;