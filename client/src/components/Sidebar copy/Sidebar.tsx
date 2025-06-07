import React from 'react';
import SearchBar from '../Search/SearchBar';
import ProjectStats from '../Statistics/ProjectStats';
import Chatbot from '../Chatbot/Chatbot';
import AIFeatures from '../AI/AIFeatures';

const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <h2>Project Management</h2>
            <SearchBar />
            <ProjectStats />
            <Chatbot />
            <AIFeatures />
        </div>
    );
};

export default Sidebar;