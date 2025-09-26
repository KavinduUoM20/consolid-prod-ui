import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GreetingScreenProps {
  onStartChat: (message: string) => void;
}

export function GreetingScreen({ onStartChat }: GreetingScreenProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 52), 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim()) {
      onStartChat(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleUpload = () => {
    // TODO: Implement file upload functionality
    console.log('Upload button clicked');
  };

  const handleAdd = () => {
    // TODO: Implement add functionality
    console.log('Add button clicked');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Greeting Message - Centered */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-2xl">
          <h2 className="text-4xl font-semibold text-foreground">
            Hi, Kavindu! How can I help you today?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            I'm Onemas, your AI assistant. I can help you with questions, creative tasks, analysis, and more.
          </p>
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="bg-background shrink-0">
        <div className="px-4 pt-2.5 pb-3">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Input Area - Auto-expanding like ChatGPT */}
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message Onemas..."
                className={cn(
                  "min-h-[52px] resize-none rounded-xl border border-border/50 pl-12 pr-12 py-3",
                  "focus:border-border focus:ring-1 focus:ring-border/20 focus:outline-none",
                  "placeholder:text-muted-foreground/60 text-sm leading-6",
                  "shadow-sm bg-background overflow-hidden",
                  "transition-all duration-200 ease-out"
                )}
                style={{
                  height: '52px',
                }}
                rows={1}
              />

               {/* Add Button - Left side, fixed at bottom */}
               <div className="absolute left-3 bottom-4 flex items-center">
                 <Button
                   size="sm"
                   onClick={handleAdd}
                   className="h-8 w-8 p-0 rounded-lg bg-foreground hover:bg-foreground/90 text-background"
                 >
                   <Plus className="w-4 h-4" />
                 </Button>
               </div>
               
               {/* Action Buttons - Right side, fixed at bottom */}
               <div className="absolute right-3 bottom-4 flex items-center gap-2">
                {/* Upload Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleUpload}
                  className="h-8 w-8 p-0 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                {/* Send Button */}
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                  className={cn(
                    "h-8 w-8 p-0 rounded-lg transition-colors",
                    input.trim() 
                      ? "bg-foreground hover:bg-foreground/90 text-background" 
                      : "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted"
                  )}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
