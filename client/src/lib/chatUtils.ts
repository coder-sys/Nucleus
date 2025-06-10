// Simple fallback for generateChatResponse
export async function generateChatResponse(input: string): Promise<string> {
  // You can replace this with a real AI API call
  if (!input.trim()) return "Please enter a message.";
  if (/hello|hi|hey/i.test(input)) return "Hello! How can I help you with your projects or tasks?";
  if (/project/i.test(input)) return "You can manage your projects in the Projects section.";
  if (/task/i.test(input)) return "You can view and manage tasks in the Tasks section.";
  if (/help|what can you do/i.test(input)) return "I can help you with project and task management, stats, and more!";
  return `You said: "${input}"`;
}
