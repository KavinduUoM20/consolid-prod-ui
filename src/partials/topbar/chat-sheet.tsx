import { ReactNode, useState, useRef } from 'react';
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
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AvatarGroup } from '../common/avatar-group';

interface Message {
  avatar: string;
  text: string;
  time: string;
  in?: boolean;
  out?: boolean;
  read?: boolean;
}

export function ChatSheet({ trigger }: { trigger: ReactNode }) {
  const [emailInput, setEmailInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      // Here you would typically handle the file upload to your backend
      console.log('Selected files:', files);
    }
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const messages: Message[] = [
    {
      avatar: '/media/avatars/300-5.png',
      time: '14:04',
      text: 'Hello! <br> Next week we are closing the project. Do You have questions?',
      in: true,
    },
    {
      avatar: '/media/avatars/300-2.png',
      text: 'This is excellent news!',
      time: '14:08',
      read: true,
      out: true,
    },
    {
      avatar: '/media/avatars/300-4.png',
      time: '14:26',
      text: 'I have checked the features, can not wait to demo them!',
      in: true,
    },
    {
      avatar: '/media/avatars/300-1.png',
      time: '15:09',
      text: 'I have looked over the rollout plan, and everything seems spot on. I am ready on my end and can not wait for the user feedback.',
      in: true,
    },
    {
      avatar: '/media/avatars/300-2.png',
      text: "Haven't seen the build yet, I'll look now.",
      time: '15:52',
      read: false,
      out: true,
    },
    {
      avatar: '/media/avatars/300-2.png',
      text: 'Checking the build now',
      time: '15:52',
      read: false,
      out: true,
    },
    {
      avatar: '/media/avatars/300-4.png',
      time: '17:40',
      text: 'Tomorrow, I will send the link for the meeting',
      in: true,
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={handleFileSelect}
        className="hidden"
      />
      <SheetContent className="p-0 gap-0 w-full sm:w-[450px] sm:max-w-none inset-5 start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader>
          <div className="flex items-center justify-between p-3 border-b border-border">
            <SheetTitle>Chat</SheetTitle>
          </div>
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
                    HR Team
                  </Link>
                  <span className="text-xs italic text-muted-foreground block truncate">
                    Jessy is typing...
                  </span>
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
        </SheetHeader>
        <SheetBody className="grow p-0">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="space-y-3.5 p-3 sm:p-5">
              {messages.map((message, index) =>
            message.out ? (
              <div
                key={index}
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
                      src={toAbsoluteUrl('/media/avatars//300-2.png')}
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
              <div key={index} className="flex items-end gap-3">
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
              
              {/* Join Request Section */}
              <div className="p-3 sm:p-4 bg-accent/50 flex gap-2 border-t border-border">
                <Avatar className="size-9 flex-shrink-0">
                  <AvatarImage
                    src={toAbsoluteUrl('/media/avatars//300-14.png')}
                    alt=""
                  />
                  <AvatarFallback>CH</AvatarFallback>
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
                        Jane Perez
                      </Link>
                      <span className="text-muted-foreground">
                        wants to join chat
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      1 day ago • Design Team
                    </span>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                      Decline
                    </Button>
                    <Button size="sm" variant="mono" className="text-xs sm:text-sm">
                      Accept
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetBody>
        <SheetFooter className="block p-0 sm:space-x-0">
          {/* Input Section - Fixed at bottom */}
          <div className="p-3 sm:p-5 flex items-center gap-2 relative border-t border-border">
            <img
              src={toAbsoluteUrl('/media/avatars/300-2.png')}
              className="w-8 h-8 rounded-full absolute left-3 sm:left-7 top-1/2 -translate-y-1/2 flex-shrink-0"
              alt=""
            />
            <Input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
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
              <Button size="sm" variant="mono" className="h-8 px-2 sm:h-9 sm:px-3 text-xs sm:text-sm">
                Send
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}