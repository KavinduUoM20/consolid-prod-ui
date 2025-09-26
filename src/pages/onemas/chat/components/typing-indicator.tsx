export function TypingIndicator() {
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex justify-start">
          <div className="max-w-[80%] mr-auto">
            {/* Typing Animation */}
            <div className="text-sm text-foreground">
              <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-border/20">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
