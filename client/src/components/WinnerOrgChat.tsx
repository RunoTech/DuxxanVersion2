import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Send, 
  MessageCircle, 
  Trophy, 
  Shield,
  Clock,
  CheckCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ChatMessage {
  id: number;
  raffleId: number;
  senderId: number;
  receiverId: number;
  message: string;
  createdAt: string;
  sender: {
    id: number;
    username: string;
    organizationType?: string;
    organizationVerified?: boolean;
  };
  receiver: {
    id: number;
    username: string;
    organizationType?: string;
    organizationVerified?: boolean;
  };
}

interface WinnerOrgChatProps {
  raffleId: number;
  raffle: {
    id: number;
    title: string;
    winnerId?: number;
    creatorId: number;
    isApprovedByCreator?: boolean;
    isApprovedByWinner?: boolean;
    creator: {
      username: string;
      organizationType?: string;
      organizationVerified?: boolean;
    };
    winner?: {
      username: string;
    };
  };
}

export function WinnerOrgChat({ raffleId, raffle }: WinnerOrgChatProps) {
  const { user } = useWallet();
  const { theme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Check if chat is available (winner must be announced - no approval required)
  const isChatAvailable = Boolean(raffle.winnerId);
  
  // Check if current user is authorized (either winner or organization creator)
  const isWinner = user?.id === raffle.winnerId;
  const isCreator = user?.id === raffle.creatorId;
  const isAuthorized = isWinner || isCreator;

  // Get chat messages
  const { data: messages = [], isLoading, error } = useQuery<ChatMessage[]>({
    queryKey: [`/api/raffles/${raffleId}/chat`],
    enabled: isChatAvailable && isAuthorized,
    refetchInterval: 5000, // Fallback polling every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageText: string) => 
      apiRequest('POST', `/api/raffles/${raffleId}/chat`, { message: messageText }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: [`/api/raffles/${raffleId}/chat`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Mesaj gönderilemedi',
        description: error.message || 'Bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  // Use centralized WebSocket connection instead of creating new ones
  const { lastMessage } = useWebSocket();
  
  useEffect(() => {
    if (lastMessage?.type === 'CHAT_MESSAGE' && lastMessage?.data?.raffleId === raffleId) {
      queryClient.invalidateQueries({ queryKey: [`/api/raffles/${raffleId}/chat`] });
    }
  }, [lastMessage, raffleId, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  // Handle typing indicator (simple version)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(true);
    
    // Clear typing indicator after 2 seconds of no typing
    setTimeout(() => setIsTyping(false), 2000);
  };

  if (!isChatAvailable) {
    // Show different messages based on the current state
    let message = "Sohbet, kazanan açıklandıktan sonra aktif olacak";
    let icon = <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />;
    
    if (raffle.winnerId) {
      // Winner is assigned but approvals are pending
      if (!raffle.isApprovedByCreator && !raffle.isApprovedByWinner) {
        message = "Sohbet için her iki tarafın da onayı gerekiyor";
        icon = <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-3" />;
      } else if (!raffle.isApprovedByCreator) {
        message = "Organizasyon onayı bekleniyor";
        icon = <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-3" />;
      } else if (!raffle.isApprovedByWinner) {
        message = "Kazanan onayı bekleniyor";
        icon = <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-3" />;
      }
    }

    return (
      <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-duxxan-yellow flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Özel Sohbet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {icon}
            <p className="text-gray-600 dark:text-duxxan-text-secondary">
              {message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthorized) {
    return (
      <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-duxxan-yellow flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Özel Sohbet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-duxxan-text-secondary">
              Bu sohbete erişim yetkiniz yok
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-duxxan-yellow">Sohbet Yükleniyor...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-gray-900 dark:text-duxxan-yellow flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Kazanan - Organizasyon Sohbeti
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-duxxan-text-secondary">
          <Trophy className="w-4 h-4 text-duxxan-yellow" />
          <span>
            {isWinner ? 'Organizasyon ile özel sohbet' : 'Kazanan ile özel sohbet'}
          </span>
          {raffle.creator.organizationVerified && (
            <Badge variant="secondary" className="bg-duxxan-success/20 text-duxxan-success text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Doğrulanmış
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Messages Area */}
        <ScrollArea className="h-96 pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-duxxan-text-secondary">
                  Henüz mesaj yok. İlk mesajı siz gönderin!
                </p>
              </div>
            ) : (
              messages.map((msg: ChatMessage) => {
                const isMyMessage = msg.senderId === user?.id;
                const isFromOrganization = msg.sender.organizationType;

                return (
                  <div key={msg.id} className={`flex gap-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                    {!isMyMessage && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-duxxan-yellow text-duxxan-dark text-xs">
                          {msg.sender.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[70%] ${isMyMessage ? 'order-first' : ''}`}>
                      <div className={`
                        p-3 rounded-lg 
                        ${isMyMessage 
                          ? 'bg-duxxan-yellow text-duxxan-dark ml-auto' 
                          : 'bg-white dark:bg-duxxan-dark border border-duxxan-border'
                        }
                      `}>
                        {!isMyMessage && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-xs text-duxxan-yellow">
                              {msg.sender.username}
                            </span>
                            {isFromOrganization && (
                              <Badge variant="outline" className="text-xs border-duxxan-yellow text-duxxan-yellow">
                                {msg.sender.organizationType}
                              </Badge>
                            )}
                            {msg.sender.organizationVerified && (
                              <CheckCircle className="w-3 h-3 text-duxxan-success" />
                            )}
                          </div>
                        )}
                        <p className={`text-sm ${isMyMessage ? 'text-duxxan-dark' : 'text-duxxan-text'}`}>
                          {msg.message}
                        </p>
                        <p className={`text-xs mt-1 ${isMyMessage ? 'text-duxxan-dark/70' : 'text-duxxan-text-secondary'}`}>
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: tr })}
                        </p>
                      </div>
                    </div>
                    
                    {isMyMessage && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-duxxan-success text-white text-xs">
                          {user?.username?.charAt(0).toUpperCase() || 'B'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={handleInputChange}
            placeholder="Mesajınızı yazın..."
            maxLength={1000}
            className="flex-1 bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border"
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-duxxan-yellow hover:bg-duxxan-yellow/90 text-duxxan-dark"
          >
            {sendMessageMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-duxxan-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>

        {/* Character Counter */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          {message.length}/1000
        </div>
      </CardContent>
    </Card>
  );
}