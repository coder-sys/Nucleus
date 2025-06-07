"use client";

import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import TaskCard from "@/components/TaskCard";
import useProjects from "@/hooks/useProjects";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";

const highlight = (text: string, query: string) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark> : part
  );
};

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { projects } = useProjects();
  const [allTasks, setAllTasks] = useState<any[]>([]);

  useEffect(() => {
    if (projects && projects.length > 0) {
      const tasks = projects.flatMap((project: any) =>
        (project.tasks || []).map((task: any) => ({ ...task, projectName: project.name, projectId: project.id }))
      );
      setAllTasks(tasks);
    }
  }, [projects]);

  // Instant search on input
  useEffect(() => {
    if (!query) {
      setResults(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const q = query.toLowerCase();
    try {
      const matchedProjects = projects.filter((p: any) =>
        (p.name && p.name.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q))
      );
      const matchedTasks = allTasks.filter((t: any) =>
        (t.title && t.title.toLowerCase().includes(q)) || (t.description && t.description.toLowerCase().includes(q))
      );
      const tasksByProject: Record<string, any[]> = {};
      matchedTasks.forEach((task: any) => {
        if (!tasksByProject[task.projectId]) tasksByProject[task.projectId] = [];
        tasksByProject[task.projectId].push(task);
      });
      setResults({ projects: matchedProjects, tasksByProject });
    } catch (err) {
      setError("Search failed.");
    } finally {
      setLoading(false);
    }
  }, [query, projects, allTasks]);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header name="Search" />
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 sm:mb-0 dark:text-white flex-1">Search Projects & Tasks</h1>
        <div className="flex w-full sm:w-auto items-center gap-2 bg-white dark:bg-gray-900 rounded-lg shadow px-3 py-2 border border-gray-200 dark:border-gray-700">
          <SearchIcon className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type to search..."
            className="flex-1 bg-transparent outline-none text-lg text-gray-800 dark:text-white"
            autoFocus
          />
        </div>
      </div>
      {loading && <div className="flex items-center gap-2 text-blue-500 font-medium"><span className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full"></span>Searching...</div>}
      {error && <div className="text-red-500 font-semibold">{error}</div>}
      {!loading && !error && results && (
        <div className="space-y-8">
          {results.projects?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold text-blue-700 dark:text-blue-300">Projects</span>
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-full px-2 py-0.5 text-xs font-semibold">{results.projects.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.projects.map((p: any) => (
                  <div key={p.id} className="rounded-xl shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
                    <ProjectCard project={{ ...p, name: highlight(p.name, query), description: highlight(p.description || "", query) }} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.tasksByProject && Object.keys(results.tasksByProject).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold text-blue-700 dark:text-blue-300">Tasks by Project</span>
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-full px-2 py-0.5 text-xs font-semibold">{Object.values(results.tasksByProject).reduce((acc: number, arr: any[]) => acc + arr.length, 0)}</span>
              </div>
              <div className="space-y-4">
                {Object.entries(results.tasksByProject).map(([projectId, tasks]: [string, any[]]) => (
                  <div key={projectId} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                    <div className="font-semibold text-lg mb-2 text-blue-600 dark:text-blue-300">
                      {projects.find((p: any) => p.id === Number(projectId))?.name || "Unknown Project"}
                    </div>
                    <ul className="space-y-2">
                      {tasks.map((t: any) => (
                        <li key={t.id}>
                          <TaskCard task={{ ...t, title: highlight(t.title, query), description: highlight(t.description || "", query) }} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.projects?.length === 0 && Object.keys(results.tasksByProject || {}).length === 0 && (
            <div className="text-gray-400 text-center text-lg font-medium py-12">
              <span className="block text-5xl mb-2">🔍</span>
              No results found.<br />Try a different search term.
            </div>
          )}
        </div>
      )}
      {!loading && !error && !results && (
        <div className="text-gray-400 text-center text-lg font-medium py-12">
          <span className="block text-5xl mb-2">🔎</span>
          Start typing to search projects and tasks.
        </div>
      )}
    </div>
  );
};

export default SearchPage;
