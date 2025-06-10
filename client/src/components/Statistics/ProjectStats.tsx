import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import TaskCard from '../TaskCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ProjectStatsProps {
    selectedProject?: any;
    allProjects?: any[];
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ selectedProject, allProjects }) => {
    // If a project is selected, show only its stats; otherwise, show all projects
    const projects = selectedProject ? [selectedProject] : (allProjects || []);
    // Calculate stats for the selected project or all projects
    const totalProjects = projects.length;
    // Consider a project completed if it has endDate or completed true
    const completedProjects = projects.filter((project: any) => project.completed || project.endDate).length;
    const totalTasks = projects.reduce((acc: number, project: any) => acc + (project.tasks?.length || 0), 0);
    // Consider a task completed if status is 'Completed' or completed true
    const completedTasks = projects.reduce((acc: number, project: any) => acc + ((project.tasks?.filter((task: any) => task.completed || task.status === 'Completed').length) || 0), 0);
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    // Priority statistics
    const priorityStats: Record<string, number> = {};
    projects.forEach((project: any) => {
        (project.tasks || []).forEach((task: any) => {
            if (task.priority) {
                priorityStats[task.priority] = (priorityStats[task.priority] || 0) + 1;
            }
        });
    });

    // Chart data for tasks by status
    const statusCounts: Record<string, number> = {};
    projects.forEach((project: any) => {
        (project.tasks || []).forEach((task: any) => {
            statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
        });
    });
    const statusChartData = {
        labels: Object.keys(statusCounts),
        datasets: [
            {
                label: 'Tasks by Status',
                data: Object.values(statusCounts),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
        ],
    };
    // Chart data for tasks by priority
    const priorityCounts: Record<string, number> = {};
    projects.forEach((project: any) => {
        (project.tasks || []).forEach((task: any) => {
            priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
        });
    });
    const priorityChartData = {
        labels: Object.keys(priorityCounts),
        datasets: [
            {
                label: 'Tasks by Priority',
                data: Object.values(priorityCounts),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
        ],
    };

    return (
        <div className="project-stats space-y-8 max-w-4xl mx-auto">
            <div className="bg-white rounded shadow p-6 border border-gray-200">
                {selectedProject ? (
                    <h2 className="text-2xl font-bold mb-2 text-blue-700">Statistics for: {selectedProject.name}</h2>
                ) : (
                    <h2 className="text-2xl font-bold mb-2 text-blue-700">All Projects Statistics</h2>
                )}
                <ul className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <li><span className="font-semibold">Total Projects:</span> {totalProjects}</li>
                    <li><span className="font-semibold">Completed Projects:</span> {completedProjects}</li>
                    <li><span className="font-semibold">Total Tasks:</span> {totalTasks}</li>
                    <li><span className="font-semibold">Completed Tasks:</span> {completedTasks}</li>
                </ul>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-semibold mb-2">Tasks by Status</h4>
                        <Bar data={statusChartData} />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Tasks by Priority</h4>
                        <Bar data={priorityChartData} />
                    </div>
                </div>
            </div>
            <div className="bg-white rounded shadow p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-2 text-yellow-700">Task Priorities</h3>
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(priorityStats).map(([priority, count]) => (
                        <li key={priority} className="font-semibold text-yellow-700">{priority}: <span className="text-black">{count}</span></li>
                    ))}
                    {Object.keys(priorityStats).length === 0 && <li>No priority data</li>}
                </ul>
            </div>
            {selectedProject && (
                <div className="bg-white rounded shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-2 text-green-700">Tasks for {selectedProject.name}</h3>
                    {selectedProject.tasks && selectedProject.tasks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedProject.tasks.map((task: any) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    ) : (
                        <div>No tasks found for this project.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectStats;
