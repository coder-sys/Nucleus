import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://46tmqbm6xl.execute-api.us-east-1.amazonaws.com/prod';

const useProjects = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProjectsAndTasks = async () => {
            try {
                const projectsRes = await axios.get(`${API_BASE_URL}/projects`);
                const projectsData = projectsRes.data;
                // Fetch tasks for each project
                const projectsWithTasks = await Promise.all(
                    projectsData.map(async (project: any) => {
                        try {
                            const tasksRes = await axios.get(`${API_BASE_URL}/tasks?projectId=${project.id}`);
                            return { ...project, tasks: tasksRes.data };
                        } catch (err) {
                            return { ...project, tasks: [] };
                        }
                    })
                );
                setProjects(projectsWithTasks);
            } catch (err) {
                setError('Failed to fetch projects or tasks');
            } finally {
                setLoading(false);
            }
        };
        loadProjectsAndTasks();
    }, []);

    // ...existing code for addProject, updateProject, deleteProject...
    const addProject = (newProject: any) => {
        setProjects((prevProjects) => [...prevProjects, newProject]);
    };
    const updateProject = (updatedProject: any) => {
        setProjects((prevProjects) =>
            prevProjects.map((project) =>
                project.id === updatedProject.id ? updatedProject : project
            )
        );
    };
    const deleteProject = (projectId: string) => {
        setProjects((prevProjects) =>
            prevProjects.filter((project) => project.id !== projectId)
        );
    };

    return { projects, loading, error, addProject, updateProject, deleteProject };
};

export default useProjects;
