import React, { useState, useEffect } from 'react';
import ProjectCard from '../ProjectCard';
import TaskCard from '../TaskCard';
import useProjects from '../../hooks/useProjects';

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
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

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const handleSearch = () => {
        setLoading(true);
        setError(null);
        try {
            const q = query.toLowerCase();
            const matchedProjects = projects.filter((p: any) =>
                p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
            );
            const matchedTasks = allTasks.filter((t: any) =>
                t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
            );
            const tasksByProject: Record<string, any[]> = {};
            matchedTasks.forEach((task: any) => {
                if (!tasksByProject[task.projectId]) tasksByProject[task.projectId] = [];
                tasksByProject[task.projectId].push(task);
            });
            setResults({ projects: matchedProjects, tasksByProject });
        } catch (err) {
            setError('Search failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="search-bar p-4 bg-white rounded shadow space-y-4 max-w-2xl mx-auto border border-gray-200">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search projects and tasks..."
                    className="flex-1 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition">Search</button>
            </div>
            {loading && <div>Searching...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {results && (
                <div className="search-results space-y-4">
                    {results.projects?.length > 0 && (
                        <div>
                            <strong className="block mb-1 text-blue-700">Projects:</strong>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.projects.map((p: any) => (
                                    <ProjectCard key={p.id} project={p} />
                                ))}
                            </div>
                        </div>
                    )}
                    {results.tasksByProject && Object.keys(results.tasksByProject).length > 0 && (
                        <div>
                            <strong className="block mb-1 text-green-700">Tasks by Project:</strong>
                            {Object.entries(results.tasksByProject).map(([projectId, tasks]: [string, any[]]) => (
                                <div key={projectId} className="mb-4">
                                    <div className="font-semibold text-blue-700">{projects.find((p: any) => p.id === projectId)?.name || 'Unknown Project'}</div>
                                    <ul className="ml-4 list-disc">
                                        {tasks.map((t: any) => (
                                            <li key={t.id} className="mb-1"><TaskCard task={t} /></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                    {results.projects?.length === 0 && Object.keys(results.tasksByProject || {}).length === 0 && <div>No results found.</div>}
                </div>
            )}
        </div>
    );
};

export default SearchBar;