import { cn } from '@/lib/utils';
import { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className={cn(
          "flex",
          isUser ? "justify-end" : "justify-start"
        )}>
          <div className={cn(
            "max-w-[80%]",
            isUser ? "ml-auto" : "mr-auto"
          )}>
            {/* Message Text */}
            <div className="text-sm text-foreground leading-relaxed">
              <div className={cn(
                "whitespace-pre-wrap break-words px-4 py-3 rounded-2xl",
                isUser 
                  ? "bg-secondary/80" 
                  : "bg-white shadow-sm border border-border/20"
              )}>
                {message.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
