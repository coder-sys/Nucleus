import React, { useState } from 'react';
import useProjects from "@/hooks/useProjects";
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const formatBotResponse = (response: string | JSX.Element) => (
    <div className="bg-gray-50 rounded p-3 text-gray-900 whitespace-pre-line border border-gray-200 shadow-sm">
        {response}
    </div>
);

const highlight = (text: string) => <span className="bg-yellow-100 px-1 rounded text-black font-semibold">{text}</span>;

const Chatbot: React.FC = () => {
    const [userInput, setUserInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ user: string; bot: string | JSX.Element }[]>([]);
    const { projects } = useProjects();

    // Helper: get all tasks with project info
    const getAllTasks = () => projects.flatMap((p: any) => (p.tasks || []).map((t: any) => ({ ...t, projectName: p.name })));

    // Helper: render a bar chart for priorities
    const renderPriorityBarChart = () => {
        const allTasks = getAllTasks();
        const priorityCounts: Record<string, number> = {};
        allTasks.forEach((t: any) => {
            if (t.priority) priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
        });
        const data = Object.entries(priorityCounts).map(([priority, count]) => ({ priority, count }));
        if (data.length === 0) return <div className="text-gray-400">No priority data found.</div>;
        return (
            <div className="w-full h-64 bg-white dark:bg-gray-900 rounded-xl p-4 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="priority" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // Helper: render a pie chart for task status
    const renderTaskStatusPieChart = () => {
        const allTasks = getAllTasks();
        const statusCounts: Record<string, number> = {};
        allTasks.forEach((t: any) => {
            const status = t.status || 'Unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        const data = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
        const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A78BFA", "#F472B6"];
        if (data.length === 0) return <div className="text-gray-400">No task status data found.</div>;
        return (
            <div className="w-full h-64 bg-white dark:bg-gray-900 rounded-xl p-4 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // Flexible AI response
    const getAIBotResponse = (input: string): JSX.Element => {
        const q = input.toLowerCase();
        // Show charts/graphs only if asked
        if (q.includes('chart') || q.includes('graph') || q.includes('visual') || q.includes('bar') || q.includes('pie')) {
            if (q.includes('priority')) {
                return (
                    <>
                        {formatBotResponse('Here is a bar chart of task priorities:')}
                        {renderPriorityBarChart()}
                    </>
                );
            }
            if (q.includes('status')) {
                return (
                    <>
                        {formatBotResponse('Here is a pie chart of task statuses:')}
                        {renderTaskStatusPieChart()}
                    </>
                );
            }
            return formatBotResponse('I can show charts for priorities or task statuses. Try: "Show me a priority chart" or "Show me a status pie chart".');
        }
        // Flexible text Q&A
        if (q.match(/(priority|priorities)/)) {
            const allTasks = getAllTasks();
            const priorityCounts: Record<string, number> = {};
            allTasks.forEach((t: any) => {
                if (t.priority) priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
            });
            if (Object.keys(priorityCounts).length === 0) return formatBotResponse('No priority data found.');
            return formatBotResponse(
                <>
                    <div className="font-semibold mb-1">Task Priorities:</div>
                    <ul className="list-disc ml-5">
                        {Object.entries(priorityCounts).map(([priority, count]) => (
                            <li key={priority}>{highlight(priority)}: {highlight(count.toString())}</li>
                        ))}
                    </ul>
                </>
            );
        }
        if (q.match(/(project|projects)/)) {
            if (projects.length === 0) return formatBotResponse('No projects found.');
            return formatBotResponse(
                <>
                    <div className="font-semibold mb-1">Project List:</div>
                    <div className="grid grid-cols-1 gap-2">
                        {projects.map((p: any) => (
                            <div key={p.id} className="border rounded p-2 bg-white shadow-sm">
                                <div className="font-bold text-blue-700">{p.name}</div>
                                {p.description && <div className="text-gray-600 text-sm mb-1">{p.description}</div>}
                                <div className="text-xs text-gray-500">Tasks: {p.tasks?.length || 0}</div>
                            </div>
                        ))}
                    </div>
                </>
            );
        }
        if (q.match(/(task|tasks)/)) {
            const allTasks = getAllTasks();
            if (allTasks.length === 0) return formatBotResponse('No tasks found.');
            return formatBotResponse(
                <>
                    <div className="font-semibold mb-1">Task List:</div>
                    <div className="grid grid-cols-1 gap-2">
                        {allTasks.map((t: any) => (
                            <div key={t.id} className="border rounded p-2 bg-white shadow-sm">
                                <div className="font-bold text-green-700">{t.title}</div>
                                <div className="text-xs text-gray-500">Project: {t.projectName}</div>
                                {t.status && <span className="text-blue-600 text-xs">[{t.status}]</span>}
                                {t.priority && <span className="ml-2 text-yellow-700 text-xs">Priority: {t.priority}</span>}
                            </div>
                        ))}
                    </div>
                </>
            );
        }
        if (q.match(/(stats|statistic|summary|overview)/)) {
            const totalProjects = projects.length;
            const allTasks = getAllTasks();
            const totalTasks = allTasks.length;
            const completedTasks = allTasks.filter((t: any) => t.completed).length;
            return formatBotResponse(
                <>
                    <div className="font-semibold mb-1">Project Statistics:</div>
                    <ul className="list-disc ml-5">
                        <li>Total Projects: {highlight(totalProjects.toString())}</li>
                        <li>Total Tasks: {highlight(totalTasks.toString())}</li>
                        <li>Completed Tasks: {highlight(completedTasks.toString())}</li>
                    </ul>
                    <div className="mt-2 text-gray-600">For more detailed stats, visit the Project Stats tab.</div>
                </>
            );
        }
        // Default help
        return formatBotResponse(
            <>
                <div className="font-semibold">Hi! 👋 I can help you with your projects and tasks.</div>
                <div className="text-gray-600 mt-1">Try asking:
                    <ul className="list-disc ml-5">
                        <li>"List all projects"</li>
                        <li>"Show me all tasks"</li>
                        <li>"Project statistics"</li>
                        <li>"Show priorities"</li>
                        <li>"Show me a priority chart"</li>
                        <li>"Show me a status pie chart"</li>
                    </ul>
                </div>
            </>
        );
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!userInput) return;
        setChatHistory((prev) => [...prev, { user: userInput, bot: formatBotResponse('...') }]);
        setUserInput('');
        setTimeout(() => {
            setChatHistory((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].bot = getAIBotResponse(userInput);
                return updated;
            });
        }, 500);
    };

    return (
        <div className="chatbot p-8 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-3xl mx-auto mt-12 min-h-[700px]">
            <div className="chat-history max-h-[420px] min-h-[320px] overflow-y-auto mb-6 px-2 custom-scrollbar">
                {chatHistory.length === 0 && (
                    <div className="text-gray-400 italic text-center py-8">No conversation yet. Ask me about your <span className='font-semibold text-blue-500'>projects</span>, <span className='font-semibold text-green-500'>tasks</span>, <span className='font-semibold text-yellow-500'>priorities</span>, <span className='font-semibold text-purple-500'>stats</span>, or <span className='font-semibold text-pink-500'>charts</span>!</div>
                )}
                {chatHistory.map((chat, index) => (
                    <div key={index} className="mb-8 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-blue-100 text-blue-700 font-bold px-3 py-1 text-xs shadow">User</span>
                            <span className="text-gray-700 dark:text-gray-200 break-words max-w-2xl">{chat.user}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="rounded-full bg-green-100 text-green-700 font-bold px-3 py-1 text-xs shadow">Assistant</span>
                            <span className="flex-1">{chat.bot}</span>
                        </div>
                        <div className="border-b border-gray-200 dark:border-gray-700 mt-2" />
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2 items-center bg-white dark:bg-gray-900 rounded-xl shadow px-4 py-3 border border-gray-200 dark:border-gray-700">
                <input
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="Ask about projects, tasks, priorities, stats, or charts..."
                    className="flex-1 border-none bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg"
                />
                <button type="submit" className="bg-blue-500 text-white px-5 py-2 rounded-xl flex items-center gap-1 hover:bg-blue-600 transition font-semibold shadow text-base">
                    <PaperAirplaneIcon className="h-5 w-5" />
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chatbot;