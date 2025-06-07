"use client";

import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import ModalNewTask from "@/components/ModalNewTask";
import TaskCard from "@/components/TaskCard";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import {
  Priority,
  Task,
} from "@/state/api";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    width: 100,
  },
  {
    field: "description",
    headerName: "Description",
    width: 200,
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => (
      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
        {params.value}
      </span>
    ),
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 75,
  },
  {
    field: "tags",
    headerName: "Tags",
    width: 130,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 130,
  },
  {
    field: "dueDate",
    headerName: "Due Date",
    width: 130,
  },
  {
    field: "author",
    headerName: "Author",
    width: 150,
    renderCell: (params) => params.value.username || "Unknown",
  },
  {
    field: "assignee",
    headerName: "Assignee",
    width: 150,
    renderCell: (params) => params.value.username || "Unassigned",
  },
];

const ReusablePriorityPage = ({ priority: propPriority }: { priority?: string }) => {
  const [view, setView] = useState("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  // Fetch all projects
  const { data: projects = [], isLoading: isProjectsLoading, error: projectsError } = useSWR(
    "https://46tmqbm6xl.execute-api.us-east-1.amazonaws.com/prod/projects",
    fetcher
  );

  // --- Fetch all tasks for all projects ---
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  useEffect(() => {
    if (!projects || projects.length === 0) {
      setAllTasks([]);
      return;
    }
    let isMounted = true;
    const fetchAllTasks = async () => {
      try {
        const tasksArrays = await Promise.all(
          projects.map((project: any) =>
            fetch(`https://46tmqbm6xl.execute-api.us-east-1.amazonaws.com/prod/tasks?projectId=${project.id}`)
              .then((res) => res.json())
              .catch(() => [])
          )
        );
        // Flatten and filter out any null/undefined
        const aggregated = tasksArrays.flat().filter(Boolean);
        if (isMounted) setAllTasks(aggregated);
      } catch (e) {
        if (isMounted) setAllTasks([]);
      }
    };
    fetchAllTasks();
    return () => { isMounted = false; };
  }, [projects]);

  // --- Use ProjectStats logic: classify all tasks by priority, robustly ---
  const priorityStats: Record<string, number> = {};
  allTasks.forEach((task: any) => {
    if (task.priority) {
      priorityStats[task.priority] = (priorityStats[task.priority] || 0) + 1;
    }
  });
  // Always show all priorities from enum, not just those present in data
  const priorities = Object.values(Priority);
  const tasksByPriority: Record<string, Task[]> = {};
  priorities.forEach((p) => {
    tasksByPriority[p] = allTasks.filter((task: Task) => (task.priority || '').toLowerCase().replace(/\s/g, '') === p.toLowerCase().replace(/\s/g, ''));
  });

  // Find the latest projectId and increment by 1 for new tasks
  const latestProjectId = React.useMemo(() => {
    if (!projects || projects.length === 0) return 1;
    return Math.max(...projects.map((p: any) => p.id)) + 1;
  }, [projects]);

  // Scroll to and highlight the selected priority card if propPriority is set
  const cardRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  React.useEffect(() => {
    if (propPriority) {
      const match = priorities.find(
        (p) => p.toLowerCase().replace(/\s/g, '') === propPriority.toLowerCase().replace(/\s/g, '')
      );
      if (match && cardRefs.current[match]) {
        cardRefs.current[match]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [propPriority, priorities, allTasks]);

  return (
    <div className="m-0 p-0 min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header
        name={propPriority ? `Priority: ${propPriority}` : "All Priority Tasks"}
        buttonComponent={
          <button
            className="mr-3 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 shadow-md transition-all duration-200"
            onClick={() => setIsModalNewTaskOpen(true)}
            type="button"
          >
            Add Task
          </button>
        }
      />
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        id={latestProjectId.toString()}
      />
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {priorities.map((p) => (
            <div
              key={p}
              ref={el => { cardRefs.current[p] = el; }}
              className={`rounded-2xl bg-gradient-to-br from-white to-gray-100 dark:from-dark-secondary dark:to-gray-900 shadow-xl border-2 transition-all duration-300 p-6 flex flex-col min-h-[340px] max-h-[480px] ${propPriority && p.toLowerCase().replace(/\s/g, '') === propPriority.toLowerCase().replace(/\s/g, '') ? 'border-blue-500 ring-2 ring-blue-400 scale-105' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <div className="flex items-center mb-4 gap-2">
                <span className={`inline-block w-4 h-4 rounded-full ${p === 'Urgent' ? 'bg-red-500' : p === 'High' ? 'bg-yellow-400' : p === 'Medium' ? 'bg-blue-400' : p === 'Low' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                <h2 className="text-2xl font-bold tracking-tight capitalize dark:text-white">{p}</h2>
                <span className="ml-auto text-xs font-semibold text-gray-500 dark:text-gray-300 bg-gray-200 dark:bg-gray-800 rounded-full px-2 py-0.5">{tasksByPriority[p].length} tasks</span>
              </div>
              {tasksByPriority[p].length > 0 ? (
                <div className="flex flex-col gap-3 overflow-y-auto max-h-80 pr-1 custom-scrollbar">
                  {tasksByPriority[p].map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 italic text-center py-8">No tasks for this priority.</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReusablePriorityPage;