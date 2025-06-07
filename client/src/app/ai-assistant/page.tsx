"use client";
import React from "react";
import Chatbot from "@/components/Chatbot/Chatbot";

const AIAssistantPage: React.FC = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>
    <Chatbot />
  </div>
);

export default AIAssistantPage;
