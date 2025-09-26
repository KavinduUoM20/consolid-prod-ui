import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import { ChatInput } from './chat-input';
import { GreetingScreen } from './greeting-screen';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock AI responses for demo
const mockResponses = [
  "Hello! I'm Onemas, your AI assistant. How can I help you today?",
  "That's an interesting question! Let me think about that for a moment.",
  "I understand what you're asking. Here's my perspective on that topic...",
  "Great question! Based on my knowledge, I'd say that...",
  "I'm here to help you with any questions or tasks you might have.",
  "Let me break that down for you in a simple way...",
  "That's a complex topic, but I'll do my best to explain it clearly.",
  "I appreciate you asking! Here's what I think about that...",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  // Handle starting chat from greeting screen
  const handleStartChat = async (content: string) => {
    setHasStartedChat(true);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages([userMessage]);
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

  const handleStopGeneration = () => {
    setIsLoading(false);
  };

  const handleUpload = () => {
    // TODO: Implement file upload functionality
    console.log('Upload button clicked');
  };

  const handleAdd = () => {
    // TODO: Implement add functionality
    console.log('Add button clicked');
  };

  // Show greeting screen if chat hasn't started
  if (!hasStartedChat) {
    return <GreetingScreen onStartChat={handleStartChat} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area - Takes available space above input */}
      <ScrollArea className="flex-1">
        <div className="min-h-full">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {/* Typing Indicator */}
          {isLoading && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* Input Area - Fixed above footer */}
      <div className="bg-background shrink-0">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStop={handleStopGeneration}
          onUpload={handleUpload}
          onAdd={handleAdd}
        />
      </div>
    </div>
  );
}
