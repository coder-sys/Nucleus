"use client";
import React, { useState } from 'react';
import ProjectStats from '@/components/Statistics/ProjectStats';
import useProjects from '@/hooks/useProjects';

const ProjectStatsPage: React.FC = () => {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProjectId(e.target.value);
  };

  const selectedProject = projects.find((p: any) => String(p.id) === selectedProjectId);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Project Statistics</h1>
      <div className="mb-4">
        <label htmlFor="project-select" className="mr-2">Select Project:</label>
        <select id="project-select" value={selectedProjectId} onChange={handleChange}>
          <option value="">All Projects</option>
          {projects.map((project: any) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>
      <ProjectStats selectedProject={selectedProject} allProjects={projects} />
    </div>
  );
};

export default ProjectStatsPage;
