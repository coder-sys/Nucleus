"use client";
import React from "react";
import useProjects from "@/hooks/useProjects";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PriorityStatsPage: React.FC = () => {
  const { projects } = useProjects();
  const allTasks = projects.flatMap((project: any) => project.tasks || []);
  const priorityCounts: Record<string, number> = {};
  allTasks.forEach((task: any) => {
    if (task.priority) priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
  });
  const chartData = {
    labels: Object.keys(priorityCounts),
    datasets: [
      {
        label: "Tasks by Priority",
        data: Object.values(priorityCounts),
        backgroundColor: [
          "rgba(255, 205, 86, 0.7)",
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
      },
    ],
  };
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Priority Statistics</h1>
      <div className="mb-8">
        <Bar data={chartData} />
      </div>
      <ul className="mb-4">
        {Object.entries(priorityCounts).map(([priority, count]) => (
          <li key={priority} className="mb-1">
            <span className="font-semibold text-yellow-700">{priority}</span>:{" "}
            <span className="font-bold">{count}</span>
          </li>
        ))}
        {Object.keys(priorityCounts).length === 0 && <li>No priority data</li>}
      </ul>
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">All Tasks by Priority</h2>
        {Object.keys(priorityCounts).length > 0 ? (
          Object.entries(priorityCounts).map(([priority]) => (
            <div key={priority} className="mb-4">
              <div className="font-bold text-yellow-700 mb-1">{priority}</div>
              <ul className="ml-4 list-disc">
                {allTasks
                  .filter((t: any) => t.priority === priority)
                  .map((t: any) => (
                    <li key={t.id} className="mb-1">
                      <span className="font-semibold">{t.title}</span>
                      {t.status && (
                        <span className="ml-2 text-blue-600 text-xs">
                          [{t.status}]
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          ))
        ) : (
          <div>No tasks with priority found.</div>
        )}
      </div>
    </div>
  );
};

export default PriorityStatsPage;
