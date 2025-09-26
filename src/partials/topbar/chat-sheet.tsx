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
  type: 'dociq' | 'ocap';
}

export function ChatSheet({ trigger }: { trigger: ReactNode }) {
  const [emailInput, setEmailInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [joinRequestAccepted, setJoinRequestAccepted] = useState<{dociq: boolean, ocap: boolean}>({dociq: false, ocap: false});
  const [activeChat, setActiveChat] = useState<'dociq' | 'ocap' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsDociqRef = useRef<WebSocket | null>(null);
  const wsOcapRef = useRef<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Update connection status based on active chat
  const updateConnectionStatus = () => {
    if (activeChat === 'dociq') {
      setIsConnected(wsDociqRef.current?.readyState === WebSocket.OPEN);
    } else if (activeChat === 'ocap') {
      setIsConnected(wsOcapRef.current?.readyState === WebSocket.OPEN);
    } else {
      setIsConnected(false);
    }
  };

  // Update connection status when active chat changes
  useEffect(() => {
    updateConnectionStatus();
  }, [activeChat]);

  // WebSocket disconnection function
  const disconnectWebSockets = () => {
    if (wsDociqRef.current) {
      console.log('Disconnecting DocIQ WebSocket...');
      wsDociqRef.current.close(1000, 'Chat closed by user');
      wsDociqRef.current = null;
    }
    if (wsOcapRef.current) {
      console.log('Disconnecting OCAP WebSocket...');
      wsOcapRef.current.close(1000, 'Chat closed by user');
      wsOcapRef.current = null;
    }
    setIsConnected(false);
    setIsChatActive(false);
    setJoinRequests([]);
    setJoinRequestAccepted({dociq: false, ocap: false});
    setActiveChat(null);
    setMessages([]);
    setIsTyping(false);
    console.log('All WebSockets disconnected successfully');
  };

  // Handle sheet close
  const handleSheetClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // When sheet is closed, disconnect all WebSockets
      disconnectWebSockets();
    }
  };

  // DocIQ WebSocket connection function
  const connectDociqWebSocket = () => {
    try {
      console.log('Attempting to connect to DocIQ WebSocket...');
      const ws = new WebSocket('wss://api.consolidator-ai.site/api/v1/dociq/extractions/ws');
      
      ws.onopen = () => {
        console.log('DocIQ WebSocket connected successfully');
        updateConnectionStatus();
        
        // Simulate Jane Perez join request after connection (only if not already accepted)
        setTimeout(() => {
          if (!joinRequestAccepted.dociq) {
            setJoinRequests(prev => [
              ...prev.filter(req => req.type !== 'dociq'),
              {
                id: 'dociq-1',
                name: 'Jane Perez',
                avatar: '/media/avatars/300-14.png',
                team: 'Design Team',
                timestamp: 'Just now',
                type: 'dociq'
              }
            ]);
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
            console.log('DocIQ parsed echo message:', data);
          } else {
            // Handle regular JSON messages
            data = JSON.parse(messageText);
          }
          
          console.log('DocIQ WebSocket message received:', data);
          
          // Only process messages if DocIQ chat is active
          if (activeChat === 'dociq') {
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
            }
          }
          
          if (data.type === 'pong') {
            console.log('Received DocIQ pong response from server');
          } else if (data.type === 'join_request_response') {
            console.log('Received DocIQ join request response:', data);
          } else if (data.type !== 'message' && data.type !== 'typing' && data.type !== 'system_message') {
            console.log('Unknown DocIQ message type received:', data.type, data);
          }
        } catch (error) {
          console.error('Error parsing DocIQ WebSocket message:', error);
          console.log('Raw message data:', event.data);
        }
      };

      ws.onclose = (event) => {
        console.log('DocIQ WebSocket disconnected:', event.code, event.reason);
        
        // Add a system message when disconnected (only if DocIQ chat is active)
        if (activeChat === 'dociq') {
          const disconnectMessage: Message = {
            id: Date.now().toString(),
            avatar: '/media/avatars/300-5.png',
            text: `DocIQ connection lost (Code: ${event.code}). Trying to reconnect...`,
            time: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            in: true,
            sender: 'System'
          };
          
          setMessages(prev => [...prev, disconnectMessage]);
        }
        
        // Try to reconnect after 5 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect DocIQ...');
          connectDociqWebSocket();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('DocIQ WebSocket error:', error);
      };

      wsDociqRef.current = ws;
    } catch (error) {
      console.error('Error creating DocIQ WebSocket connection:', error);
    }
  };

  // OCAP WebSocket connection function
  const connectOcapWebSocket = () => {
    try {
      console.log('🔌 Attempting to connect to OCAP WebSocket...');
      console.log('🌐 OCAP WebSocket URL: wss://api.consolidator-ai.site/api/v1/ocap/ocap-chat/ws');
      const ws = new WebSocket('wss://api.consolidator-ai.site/api/v1/ocap/ocap-chat/ws');
      
      ws.onopen = () => {
        console.log('✅ OCAP WebSocket connected successfully');
        console.log('🔗 OCAP WebSocket readyState:', ws.readyState, '(OPEN =', WebSocket.OPEN, ')');
        // Update connection status based on current active chat
        updateConnectionStatus();
        
        // Simulate OCAP Agent join request after connection (only if not already accepted)
        setTimeout(() => {
          if (!joinRequestAccepted.ocap) {
            setJoinRequests(prev => [
              ...prev.filter(req => req.type !== 'ocap'),
              {
                id: 'ocap-1',
                name: 'OCAP Agent',
                avatar: '/media/avatars/300-5.png',
                team: 'AI Team',
                timestamp: 'Just now',
                type: 'ocap'
              }
            ]);
          }
        }, 1000);
      };

      ws.onmessage = (event) => {
        try {
          console.log('📨 Raw OCAP WebSocket message received:', event.data);
          let data;
          const messageText = event.data;
          
          // Handle server echo format: "Echo: {json_data}"
          if (messageText.startsWith('Echo: ')) {
            const jsonPart = messageText.substring(6); // Remove "Echo: " prefix
            data = JSON.parse(jsonPart);
            console.log('📤 OCAP parsed echo message:', data);
          } else {
            // Handle regular JSON messages
            data = JSON.parse(messageText);
          }
          
          console.log('📋 OCAP WebSocket parsed data:', data);
          console.log('🎯 Message type:', data.type);
          console.log('🔍 Active chat:', activeChat);
          console.log('💬 Is OCAP active?', activeChat === 'ocap');
          
          // Handle assistant_response immediately when received (even before chat is active)
          // This fixes the welcome message issue
          if (data.type === 'assistant_response') {
            console.log('🎉 Processing OCAP assistant_response:', data);
            
            const assistantMessage: Message = {
              id: data.metadata?.connection_id || Date.now().toString(),
              avatar: '/media/avatars/300-5.png',
              text: data.content,
              time: data.timestamp 
                ? new Date(data.timestamp).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                : new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }),
              in: true,
              sender: 'OCAP Agent'
            };
            
            console.log('✅ Adding OCAP assistant message to chat:', assistantMessage);
            setMessages(prev => [...prev, assistantMessage]);
            scrollToBottom();
            
            // Auto-activate OCAP chat if not already active and join request was accepted
            // OR if this is the welcome message (which means connection was just established)
            if (!isChatActive && (joinRequestAccepted.ocap || data.content.includes('Welcome to Manufacturing Technical Support'))) {
              console.log('🔄 Auto-activating OCAP chat due to assistant response');
              setIsChatActive(true);
              setActiveChat('ocap');
              // Mark as accepted if this is the welcome message
              if (!joinRequestAccepted.ocap) {
                setJoinRequestAccepted(prev => ({ ...prev, ocap: true }));
                setJoinRequests(prev => prev.filter(req => req.type !== 'ocap'));
              }
            }
          }
          // Only process other message types if OCAP chat is active
          else if (activeChat === 'ocap') {
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
                sender: data.sender || 'OCAP Agent'
              };
              
              setMessages(prev => [...prev, newMessage]);
              scrollToBottom();
            } else if (data.type === 'typing') {
              setIsTyping(data.isTyping);
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
            }
          }
          
          if (data.type === 'pong') {
            console.log('Received OCAP pong response from server');
          } else if (data.type === 'join_request_response') {
            console.log('Received OCAP join request response:', data);
          } else if (data.type !== 'message' && data.type !== 'assistant_response' && data.type !== 'typing' && data.type !== 'system_message') {
            console.log('Unknown OCAP message type received:', data.type, data);
          }
        } catch (error) {
          console.error('Error parsing OCAP WebSocket message:', error);
          console.log('Raw message data:', event.data);
        }
      };

      ws.onclose = (event) => {
        console.log('OCAP WebSocket disconnected:', event.code, event.reason);
        
        // Add a system message when disconnected (only if OCAP chat is active)
        if (activeChat === 'ocap') {
          const disconnectMessage: Message = {
            id: Date.now().toString(),
            avatar: '/media/avatars/300-5.png',
            text: `OCAP connection lost (Code: ${event.code}). Trying to reconnect...`,
            time: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            in: true,
            sender: 'System'
          };
          
          setMessages(prev => [...prev, disconnectMessage]);
        }
        
        // Try to reconnect after 5 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect OCAP...');
          connectOcapWebSocket();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('OCAP WebSocket error:', error);
      };

      wsOcapRef.current = ws;
    } catch (error) {
      console.error('Error creating OCAP WebSocket connection:', error);
    }
  };

  // WebSocket connections - only connect when sheet is opened
  useEffect(() => {
    if (isOpen) {
      // Connect to both services to get join requests, but don't activate chats
      if (!wsDociqRef.current) {
        connectDociqWebSocket();
      }
      if (!wsOcapRef.current) {
        connectOcapWebSocket();
      }
    }

    return () => {
      if (wsDociqRef.current) {
        console.log('Closing DocIQ WebSocket connection...');
        wsDociqRef.current.close();
      }
      if (wsOcapRef.current) {
        console.log('Closing OCAP WebSocket connection...');
        wsOcapRef.current.close();
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

  const handleAcceptJoinRequest = (request: JoinRequest) => {
    const wsRef = request.type === 'dociq' ? wsDociqRef : wsOcapRef;
    
    if (request && wsRef.current) {
      console.log(`Accepting ${request.type} join request, WebSocket state:`, wsRef.current.readyState);
      
      // Check WebSocket connection state
      if (wsRef.current.readyState === WebSocket.OPEN) {
        console.log(`${request.type} WebSocket is OPEN, sending accept message...`);
        
        // Send accept message to WebSocket
        try {
          wsRef.current.send(JSON.stringify({
            type: 'join_request_response',
            requestId: request.id,
            action: 'accept'
          }));
          console.log(`${request.type} join request accept message sent successfully`);
        } catch (error) {
          console.error(`Error sending ${request.type} join request accept:`, error);
        }
        
        setIsChatActive(true);
        setActiveChat(request.type);
        setJoinRequests(prev => prev.filter(req => req.id !== request.id));
        setJoinRequestAccepted(prev => ({
          ...prev,
          [request.type]: true
        }));
        
        // For OCAP, don't add manual welcome message - server will send assistant_response
        // For DocIQ, add manual welcome message as before
        if (request.type === 'dociq') {
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            avatar: '/media/avatars/300-5.png',
            text: `Hello! Welcome to the DocIQ chat. How can I help you today?`,
            time: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            in: true,
            sender: 'Support Agent'
          };
          
          setMessages([welcomeMessage]);
        } else {
          // For OCAP, clear messages and wait for server's assistant_response
          console.log('🎯 OCAP chat activated - waiting for server welcome message');
          setMessages([]);
        }
        
        // Test the connection by sending a ping message
        setTimeout(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.log(`Sending test ping message to ${request.type}...`);
            try {
              wsRef.current.send(JSON.stringify({
                type: 'ping',
                timestamp: new Date().toISOString()
              }));
              console.log(`${request.type} ping message sent successfully`);
            } catch (error) {
              console.error(`Error sending ${request.type} ping:`, error);
            }
          } else {
            console.error(`${request.type} WebSocket is not open for ping test`);
          }
        }, 1000);
        
      } else {
        console.error(`${request.type} WebSocket is not open. State:`, wsRef.current.readyState);
        console.log('WebSocket states: CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3');
        
        // Try to reconnect
        console.log(`Attempting to reconnect ${request.type} WebSocket...`);
        if (wsRef.current) {
          wsRef.current.close();
        }
        setTimeout(() => {
          if (request.type === 'dociq') {
            connectDociqWebSocket();
          } else {
            connectOcapWebSocket();
          }
        }, 1000);
      }
    } else {
      console.error(`No ${request.type} join request or WebSocket reference available`);
    }
  };

  const handleDeclineJoinRequest = (request: JoinRequest) => {
    const wsRef = request.type === 'dociq' ? wsDociqRef : wsOcapRef;
    
    if (request && wsRef.current) {
      // Send decline message to WebSocket
      wsRef.current.send(JSON.stringify({
        type: 'join_request_response',
        requestId: request.id,
        action: 'decline'
      }));
      
      setJoinRequests(prev => prev.filter(req => req.id !== request.id));
    }
  };

  const handleSendMessage = () => {
    console.log('handleSendMessage called with:', {
      emailInput: emailInput.trim(),
      isChatActive,
      activeChat,
      wsDociqState: wsDociqRef.current?.readyState,
      wsOcapState: wsOcapRef.current?.readyState
    });

    if (emailInput.trim() && isChatActive && activeChat) {
      const wsRef = activeChat === 'dociq' ? wsDociqRef : wsOcapRef;
      
      console.log(`Selected WebSocket for ${activeChat}:`, {
        exists: !!wsRef.current,
        readyState: wsRef.current?.readyState,
        readyStateText: wsRef.current?.readyState === WebSocket.OPEN ? 'OPEN' : 
                       wsRef.current?.readyState === WebSocket.CONNECTING ? 'CONNECTING' :
                       wsRef.current?.readyState === WebSocket.CLOSING ? 'CLOSING' : 
                       wsRef.current?.readyState === WebSocket.CLOSED ? 'CLOSED' : 'UNKNOWN'
      });
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const messageText = emailInput.trim();
        
        // Use different message formats for different chat types
        let messageData;
        if (activeChat === 'ocap') {
          // Try OCAP format first - based on the assistant_response format, 
          // the server might expect 'content' field
          messageData = {
            type: 'user_message',
            content: messageText,
            timestamp: new Date().toISOString()
          };
          
          console.log('🎯 Using OCAP message format with "content" field');
        } else {
          // DocIQ format
          messageData = {
            type: 'message',
            text: messageText,
            timestamp: new Date().toISOString()
          };
          
          console.log('🎯 Using DocIQ message format with "text" field');
        }
        
        console.log(`Sending message to ${activeChat} WebSocket:`, messageData);
        console.log(`WebSocket URL: ${activeChat === 'ocap' ? 'wss://api.consolidator-ai.site/api/v1/ocap/ocap-chat/ws' : 'wss://api.consolidator-ai.site/api/v1/dociq/extractions/ws'}`);
        
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
          console.log(`✅ Message sent successfully to ${activeChat}:`, JSON.stringify(messageData));
          
          // Add a timeout to detect if we don't get a response
          setTimeout(() => {
            console.log(`⏰ 10 seconds passed since sending message to ${activeChat} - checking for response...`);
          }, 10000);
          
        } catch (error) {
          console.error(`❌ Error sending message to ${activeChat} WebSocket:`, error);
        }
        
        setMessages(prev => [...prev, newMessage]);
        setEmailInput('');
        scrollToBottom();
      } else {
        console.error(`❌ WebSocket not ready for ${activeChat}:`, {
          exists: !!wsRef.current,
          readyState: wsRef.current?.readyState,
          expected: WebSocket.OPEN
        });
        
        // Try to reconnect if WebSocket is not open
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          console.log(`🔄 Attempting to reconnect ${activeChat} WebSocket...`);
          if (activeChat === 'ocap') {
            connectOcapWebSocket();
          } else {
            connectDociqWebSocket();
          }
        }
      }
    } else {
      console.log('❌ Message sending conditions not met:', {
        hasText: !!emailInput.trim(),
        isChatActive,
        activeChat
      });
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
                    {activeChat === 'dociq' ? 'Support Team' : 'OCAP Agent'}
                  </Link>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        isConnected ? "bg-green-500" : "bg-red-500"
                      )} />
                  <span className="text-xs italic text-muted-foreground block truncate">
                    {isTyping 
                      ? `${activeChat === 'dociq' ? 'Support agent' : 'OCAP agent'} is typing...` 
                      : (isConnected ? "Online" : "Offline")
                    }
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
              {!isChatActive && joinRequests.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-muted-foreground text-sm">
                    Connecting to chat services...
                  </div>
                </div>
              )}

              {joinRequests.map((request) => (
                <div key={request.id} className="p-3 sm:p-4 bg-accent/50 flex gap-2 border border-border rounded-lg">
                  <Avatar className="size-9 flex-shrink-0">
                    <AvatarImage
                      src={toAbsoluteUrl(request.avatar)}
                      alt=""
                    />
                    <AvatarFallback>
                      {request.type === 'dociq' ? 'JP' : 'OA'}
                    </AvatarFallback>
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
                          {request.name}
                        </Link>
                        <span className="text-muted-foreground">
                          wants to join {request.type.toUpperCase()} chat
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">
                        {request.timestamp} • {request.team}
                      </span>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs sm:text-sm"
                        onClick={() => handleDeclineJoinRequest(request)}
                      >
                        Decline
                      </Button>
                      <Button 
                        size="sm" 
                        variant="mono" 
                        className="text-xs sm:text-sm"
                        onClick={() => handleAcceptJoinRequest(request)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

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