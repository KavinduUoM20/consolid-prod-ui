import { ReactNode, useState, useRef, useEffect } from 'react';
import {
  Calendar,
  CheckCheck,
  MoreVertical,
  Settings2,
  Shield,
  Upload,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
  AvatarStatus,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AvatarGroup } from '../common/avatar-group';

interface Message {
  id: string;
  avatar: string;
  text: string;
  time: string;
  in?: boolean;
  out?: boolean;
  read?: boolean;
  sender: string;
}

interface JoinRequest {
  id: string;
  name: string;
  avatar: string;
  team: string;
  timestamp: string;
}

export function ChatSheet({ trigger }: { trigger: ReactNode }) {
  const [emailInput, setEmailInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [joinRequest, setJoinRequest] = useState<JoinRequest | null>(null);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [joinRequestAccepted, setJoinRequestAccepted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // WebSocket disconnection function
  const disconnectWebSocket = () => {
    if (wsRef.current) {
      console.log('Disconnecting WebSocket...');
      wsRef.current.close(1000, 'Chat closed by user');
      wsRef.current = null;
      setIsConnected(false);
      setIsChatActive(false);
      setJoinRequest(null);
      setJoinRequestAccepted(false);
      setMessages([]);
      setIsTyping(false);
      console.log('WebSocket disconnected successfully');
    }
  };

  // Handle sheet close
  const handleSheetClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // When sheet is closed, disconnect WebSocket
      disconnectWebSocket();
    }
  };

  // WebSocket connection function
  const connectWebSocket = () => {
    try {
      console.log('Attempting to connect to WebSocket...');
      const ws = new WebSocket('wss://api.consolidator-ai.site/api/v1/dociq/extractions/ws');
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully to:', 'wss://api.consolidator-ai.site/api/v1/dociq/extractions/ws');
        setIsConnected(true);
        
                  // Simulate Jane Perez join request after connection (only if not already accepted)
          setTimeout(() => {
            if (!joinRequestAccepted) {
              setJoinRequest({
                id: '1',
                name: 'Jane Perez',
                avatar: '/media/avatars/300-14.png',
                team: 'Design Team',
                timestamp: 'Just now'
              });
            }
          }, 1000);
      };

      ws.onmessage = (event) => {
        try {
          let data;
          const messageText = event.data;
          
          // Handle server echo format: "Echo: {json_data}"
          if (messageText.startsWith('Echo: ')) {
            const jsonPart = messageText.substring(6); // Remove "Echo: " prefix
            data = JSON.parse(jsonPart);
            console.log('Parsed echo message:', data);
          } else {
            // Handle regular JSON messages
            data = JSON.parse(messageText);
          }
          
          console.log('WebSocket message received:', data);
          
          if (data.type === 'message') {
            const newMessage: Message = {
              id: data.id || Date.now().toString(),
              avatar: data.avatar || '/media/avatars/300-5.png',
              text: data.text,
              time: new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              in: true,
              sender: data.sender || 'Support Agent'
            };
            
            setMessages(prev => [...prev, newMessage]);
            scrollToBottom();
          } else if (data.type === 'typing') {
            setIsTyping(data.isTyping);
                  } else if (data.type === 'join_request') {
          // Only show join request if it hasn't been accepted yet
          if (!joinRequestAccepted) {
            setJoinRequest(data.request);
          } else {
            console.log('Join request ignored - already accepted');
          }
          } else if (data.type === 'system_message') {
            // Handle system messages like "Agent is typing..."
            const systemMessage: Message = {
              id: Date.now().toString(),
              avatar: '/media/avatars/300-5.png',
              text: data.text,
              time: new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              in: true,
              sender: 'System'
            };
            
            setMessages(prev => [...prev, systemMessage]);
            scrollToBottom();
          } else if (data.type === 'pong') {
            console.log('Received pong response from server');
          } else if (data.type === 'join_request_response') {
            console.log('Received join request response:', data);
          } else {
            // Handle any other message types
            console.log('Unknown message type received:', data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          console.log('Raw message data:', event.data);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsChatActive(false);
        
        // Add a system message when disconnected
        const disconnectMessage: Message = {
          id: Date.now().toString(),
          avatar: '/media/avatars/300-5.png',
          text: `Connection lost (Code: ${event.code}). Trying to reconnect...`,
          time: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          in: true,
          sender: 'System'
        };
        
        setMessages(prev => [...prev, disconnectMessage]);
        
        // Try to reconnect after 5 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setIsConnected(false);
    }
  };

  // WebSocket connection - only connect when sheet is opened
  useEffect(() => {
    if (isOpen && !wsRef.current) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        console.log('Closing WebSocket connection...');
        wsRef.current.close();
      }
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      console.log('Selected files:', files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAcceptJoinRequest = () => {
    if (joinRequest && wsRef.current) {
      console.log('Accepting join request, WebSocket state:', wsRef.current.readyState);
      
      // Check WebSocket connection state
      if (wsRef.current.readyState === WebSocket.OPEN) {
        console.log('WebSocket is OPEN, sending accept message...');
        
        // Send accept message to WebSocket
        try {
          wsRef.current.send(JSON.stringify({
            type: 'join_request_response',
            requestId: joinRequest.id,
            action: 'accept'
          }));
          console.log('Join request accept message sent successfully');
        } catch (error) {
          console.error('Error sending join request accept:', error);
        }
        
        setIsChatActive(true);
        setJoinRequest(null);
        setJoinRequestAccepted(true);
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: Date.now().toString(),
      avatar: '/media/avatars/300-5.png',
          text: `Hello! Welcome to the chat. How can I help you today?`,
          time: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
      in: true,
          sender: 'Support Agent'
        };
        
        setMessages([welcomeMessage]);
        
        // Test the connection by sending a ping message
        setTimeout(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.log('Sending test ping message...');
            try {
              wsRef.current.send(JSON.stringify({
                type: 'ping',
                timestamp: new Date().toISOString()
              }));
              console.log('Ping message sent successfully');
            } catch (error) {
              console.error('Error sending ping:', error);
            }
          } else {
            console.error('WebSocket is not open for ping test');
          }
        }, 1000);
        
      } else {
        console.error('WebSocket is not open. State:', wsRef.current.readyState);
        console.log('WebSocket states: CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3');
        
        // Try to reconnect
        console.log('Attempting to reconnect WebSocket...');
        if (wsRef.current) {
          wsRef.current.close();
        }
        setTimeout(() => {
          connectWebSocket();
        }, 1000);
      }
    } else {
      console.error('No join request or WebSocket reference available');
    }
  };

  const handleDeclineJoinRequest = () => {
    if (joinRequest && wsRef.current) {
      // Send decline message to WebSocket
      wsRef.current.send(JSON.stringify({
        type: 'join_request_response',
        requestId: joinRequest.id,
        action: 'decline'
      }));
      
      setJoinRequest(null);
    }
  };

  const handleSendMessage = () => {
    if (emailInput.trim() && wsRef.current && isChatActive) {
      const messageText = emailInput.trim();
      const messageData = {
        type: 'message',
        text: messageText,
        timestamp: new Date().toISOString()
      };
      
      console.log('Sending message to WebSocket:', messageData);
      
      const newMessage: Message = {
        id: Date.now().toString(),
      avatar: '/media/avatars/300-2.png',
        text: messageText,
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      out: true,
      read: false,
        sender: 'You'
      };
      
      // Send message to WebSocket
      try {
        wsRef.current.send(JSON.stringify(messageData));
        console.log('Message sent successfully');
      } catch (error) {
        console.error('Error sending message to WebSocket:', error);
      }
      
      setMessages(prev => [...prev, newMessage]);
      setEmailInput('');
      scrollToBottom();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleSheetClose}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={handleFileSelect}
        className="hidden"
      />
      <SheetContent className="p-0 gap-0 w-full sm:w-[450px] sm:max-w-none inset-5 start-auto h-[calc(100vh-2.5rem)] rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5 flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <SheetTitle>Chat</SheetTitle>
          </div>
          {isChatActive && (
          <div className="border-b border-border p-3 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-full bg-accent/60 border border-border flex items-center justify-center flex-shrink-0">
                  <img
                    src={toAbsoluteUrl('/media/brand-logos/gitlab.svg')}
                    className="w-7 h-7"
                    alt=""
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to="#"
                    className="text-sm font-semibold text-mono hover:text-blue-600 block truncate"
                  >
                      Support Team
                  </Link>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        isConnected ? "bg-green-500" : "bg-red-500"
                      )} />
                  <span className="text-xs italic text-muted-foreground block truncate">
                        {isTyping ? "Support agent is typing..." : (isConnected ? "Online" : "Offline")}
                  </span>
                    </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <AvatarGroup
                  size="size-8"
                  group={[
                    { path: '/media/avatars/300-4.png' },
                    { path: '/media/avatars/300-1.png' },
                    { path: '/media/avatars/300-2.png' },
                    {
                      fallback: '+10',
                      variant: 'bg-green-500 text-white',
                    },
                  ]}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" mode="icon" size="sm">
                      <MoreVertical className="size-4!" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-44"
                    side="bottom"
                    align="end"
                  >
                    <DropdownMenuItem asChild>
                      <Link to="/account/members/teams">
                        <Users /> Invite Users
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Settings2 />
                        <span>Team Settings</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="w-44">
                          <DropdownMenuItem asChild>
                            <Link to="/account/members/import-members">
                              <Shield />
                              Find Members
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/account/members/import-members">
                              <Calendar /> Meetings
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/account/members/import-members">
                              <Shield /> Group Settings
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem asChild>
                      <Link to="/account/security/privacy-settings">
                        <Shield /> Group Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          )}
        </SheetHeader>
        
        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-3.5 p-3 sm:p-5" ref={scrollAreaRef}>
              {!isChatActive && !joinRequest && (
                <div className="text-center py-8">
                  <div className="text-muted-foreground text-sm">
                    Connecting to chat...
                  </div>
                </div>
              )}

              {joinRequest && (
                <div className="p-3 sm:p-4 bg-accent/50 flex gap-2 border border-border rounded-lg">
                  <Avatar className="size-9 flex-shrink-0">
                    <AvatarImage
                      src={toAbsoluteUrl(joinRequest.avatar)}
                      alt=""
                    />
                    <AvatarFallback>JP</AvatarFallback>
                    <AvatarIndicator className="-end-2 -bottom-2">
                      <AvatarStatus variant="online" className="size-2.5" />
                    </AvatarIndicator>
                  </Avatar>
                  <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="inline-flex gap-0.5 text-sm flex-wrap">
                        <Link
                          to="#"
                          className="font-semibold text-mono hover:text-primary truncate"
                        >
                          {joinRequest.name}
                        </Link>
                        <span className="text-muted-foreground">
                          wants to join chat
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">
                        {joinRequest.timestamp} • {joinRequest.team}
                      </span>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs sm:text-sm"
                        onClick={handleDeclineJoinRequest}
                      >
                        Decline
                      </Button>
                      <Button 
                        size="sm" 
                        variant="mono" 
                        className="text-xs sm:text-sm"
                        onClick={handleAcceptJoinRequest}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {isChatActive && messages.map((message) =>
            message.out ? (
              <div
                    key={message.id}
                className="flex items-end justify-end gap-3"
              >
                <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]">
                  <div
                    className="bg-primary text-primary-foreground text-sm font-medium p-3 rounded-lg shadow-xs break-words"
                    dangerouslySetInnerHTML={{ __html: message.text }}
                  />
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-xs text-secondary-foreground">
                      {message.time}
                    </span>
                    <CheckCheck
                      className={cn(
                        'w-4 h-4',
                        message.read
                          ? 'text-green-500'
                          : 'text-muted-foreground',
                      )}
                    />
                  </div>
                </div>
                <div className="relative flex-shrink-0">
                  <Avatar className="size-9">
                    <AvatarImage
                          src={toAbsoluteUrl('/media/avatars/300-2.png')}
                      alt=""
                    />
                    <AvatarFallback>CH</AvatarFallback>
                    <AvatarIndicator className="-end-2 -bottom-2">
                      <AvatarStatus variant="online" className="size-2.5" />
                    </AvatarIndicator>
                  </Avatar>
                </div>
              </div>
            ) : message.in ? (
                  <div key={message.id} className="flex items-end gap-3">
                <Avatar className="size-9 flex-shrink-0">
                  <AvatarImage src={toAbsoluteUrl(message.avatar)} alt="" />
                  <AvatarFallback>CH</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]">
                  <div
                    className="bg-accent/50 text-secondary-foreground text-sm font-medium p-3 rounded-lg shadow-xs break-words"
                    dangerouslySetInnerHTML={{ __html: message.text }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {message.time}
                  </span>
                </div>
              </div>
                          ) : null,
          )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Input Area - Fixed at Bottom */}
        {isChatActive && (
          <div className="flex-shrink-0 border-t border-border bg-background">
            <div className="p-3 sm:p-5 flex items-center gap-2 relative">
            <img
              src={toAbsoluteUrl('/media/avatars/300-2.png')}
              className="w-8 h-8 rounded-full absolute left-3 sm:left-7 top-1/2 -translate-y-1/2 flex-shrink-0"
              alt=""
            />
            <Input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={handleKeyPress}
              placeholder="Write a message..."
              className="w-full ps-11 sm:ps-12 pe-20 sm:pe-24 py-3 sm:py-4 h-auto"
            />
            <div className="absolute end-3 sm:end-7 top-1/2 -translate-y-1/2 flex gap-1 sm:gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                mode="icon" 
                className="h-8 w-8 sm:h-9 sm:w-9 relative"
                onClick={handleFileUpload}
                type="button"
              >
                <Upload className="size-4!" />
                {selectedFiles.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {selectedFiles.length}
                  </span>
                )}
              </Button>
                <Button 
                  size="sm" 
                  variant="mono" 
                  className="text-xs sm:text-sm"
                  onClick={handleSendMessage}
                  disabled={!emailInput.trim()}
                >
                Send
              </Button>
            </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
      </SheetContent>
    </Sheet>
  );
}