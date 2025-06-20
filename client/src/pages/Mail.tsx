import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Mail as MailIcon,
  Send, 
  Star,
  Clock,
  Users,
  System,
  Plus,
  Search,
  ArrowLeft,
  MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface MailMessage {
  id: number;
  fromWalletAddress: string;
  toWalletAddress: string;
  subject: string;
  content: string;
  category: 'system' | 'user' | 'community';
  isRead: boolean;
  isStarred: boolean;
  raffleId?: number;
  communityId?: number;
  createdAt: string;
}

type MailCategory = 'all' | 'system' | 'user' | 'community' | 'starred';

export default function Mail() {
  const { user, isConnected } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeCategory, setActiveCategory] = useState<MailCategory>('all');
  const [selectedMessage, setSelectedMessage] = useState<MailMessage | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [toAddress, setToAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  if (!isConnected || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-duxxan-dark flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <MailIcon className="w-16 h-16 text-duxxan-yellow mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-duxxan-text mb-2">DUXXAN Mail</h2>
            <p className="text-duxxan-text-secondary mb-4">
              Cüzdanınızı bağlayın ve dahili mail sisteminize erişin
            </p>
            <Button className="bg-duxxan-yellow text-duxxan-dark">
              Cüzdan Bağla
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery<MailMessage[]>({
    queryKey: ['/api/mail/inbox', activeCategory === 'all' ? undefined : activeCategory],
    queryFn: async () => {
      const url = activeCategory === 'all' 
        ? '/api/mail/inbox' 
        : `/api/mail/inbox?category=${activeCategory}`;
      const response = await apiRequest('GET', url);
      const result = await response.json();
      return result.data;
    },
    enabled: isConnected
  });

  // Unread count
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ['/api/mail/unread-count'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/mail/unread-count');
      const result = await response.json();
      return result.data.count;
    },
    enabled: isConnected,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { toWalletAddress: string; subject: string; content: string; }) => {
      const response = await apiRequest('POST', '/api/mail/send', messageData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Mail Gönderildi',
        description: 'Mesajınız başarıyla gönderildi.',
      });
      setIsComposing(false);
      setToAddress('');
      setSubject('');
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['/api/mail/inbox'] });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Mail gönderilemedi.',
        variant: 'destructive'
      });
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest('PUT', `/api/mail/${messageId}/read`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mail/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mail/unread-count'] });
    }
  });

  // Toggle star mutation
  const toggleStarMutation = useMutation({
    mutationFn: async ({ messageId, starred }: { messageId: number; starred: boolean }) => {
      const response = await apiRequest('PUT', `/api/mail/${messageId}/star`, { starred });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mail/inbox'] });
    }
  });

  const handleSendMessage = () => {
    if (!toAddress.trim() || !subject.trim() || !content.trim()) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen tüm alanları doldurun.',
        variant: 'destructive'
      });
      return;
    }

    sendMessageMutation.mutate({
      toWalletAddress: toAddress,
      subject,
      content
    });
  };

  const handleMessageClick = (message: MailMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleStarToggle = (message: MailMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStarMutation.mutate({
      messageId: message.id,
      starred: !message.isStarred
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <System className="w-4 h-4" />;
      case 'community': return <Users className="w-4 h-4" />;
      default: return <MailIcon className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'community': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const filteredMessages = messages.filter(message => {
    if (activeCategory === 'starred') {
      return message.isStarred;
    }
    if (searchTerm) {
      return message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
             message.content.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const userMailAddress = user.walletAddress ? `${user.walletAddress}@duxxan` : '';

  return (
    <div className="min-h-screen bg-white dark:bg-duxxan-dark">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-duxxan-yellow mb-2">DUXXAN Mail</h1>
            <p className="text-duxxan-text-secondary">
              Dahili mail sistemi - {userMailAddress}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsComposing(true)}
              className="bg-duxxan-yellow text-duxxan-dark hover:bg-duxxan-yellow/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Mail
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-duxxan-yellow">Kategoriler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { id: 'all', label: 'Tümü', icon: <MailIcon className="w-4 h-4" /> },
                  { id: 'system', label: 'Sistem', icon: <System className="w-4 h-4" /> },
                  { id: 'user', label: 'Kullanıcılar', icon: <MailIcon className="w-4 h-4" /> },
                  { id: 'community', label: 'Topluluk', icon: <Users className="w-4 h-4" /> },
                  { id: 'starred', label: 'Yıldızlı', icon: <Star className="w-4 h-4" /> },
                ].map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      activeCategory === category.id 
                        ? 'bg-duxxan-yellow text-duxxan-dark' 
                        : 'text-duxxan-text hover:bg-duxxan-surface'
                    }`}
                    onClick={() => setActiveCategory(category.id as MailCategory)}
                  >
                    {category.icon}
                    <span className="ml-2">{category.label}</span>
                    {category.id === 'all' && unreadCount > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Message List */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-duxxan-text-secondary" />
                  <Input
                    placeholder="Mail ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white dark:bg-duxxan-dark"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  {isLoading ? (
                    <div className="p-4 text-center text-duxxan-text-secondary">
                      Yükleniyor...
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="p-4 text-center text-duxxan-text-secondary">
                      Mesaj bulunamadı
                    </div>
                  ) : (
                    filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 border-b border-duxxan-border cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-duxxan-dark/50 ${
                          selectedMessage?.id === message.id ? 'bg-duxxan-yellow/20' : ''
                        } ${!message.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        onClick={() => handleMessageClick(message)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(message.category)}
                            <Badge variant="outline" className={getCategoryColor(message.category)}>
                              {message.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => handleStarToggle(message, e)}
                            >
                              <Star 
                                className={`w-3 h-3 ${
                                  message.isStarred 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-400'
                                }`} 
                              />
                            </Button>
                            {!message.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <h4 className={`font-medium text-sm mb-1 ${
                          !message.isRead ? 'font-bold' : ''
                        }`}>
                          {message.subject}
                        </h4>
                        <p className="text-xs text-duxxan-text-secondary mb-1">
                          {message.fromWalletAddress === 'system@duxxan' 
                            ? 'Sistem' 
                            : `${message.fromWalletAddress.slice(0, 6)}...${message.fromWalletAddress.slice(-4)}@duxxan`
                          }
                        </p>
                        <p className="text-xs text-duxxan-text-secondary">
                          {formatDistanceToNow(new Date(message.createdAt), { 
                            addSuffix: true, 
                            locale: tr 
                          })}
                        </p>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMessage(null)}
                      className="text-duxxan-text"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Geri
                    </Button>
                    <div className="flex gap-2">
                      <Badge className={getCategoryColor(selectedMessage.category)}>
                        {selectedMessage.category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleStarToggle(selectedMessage, e)}
                      >
                        <Star 
                          className={`w-4 h-4 ${
                            selectedMessage.isStarred 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-duxxan-text mb-2">
                        {selectedMessage.subject}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-duxxan-text-secondary">
                        <span>
                          <strong>Gönderen:</strong> {
                            selectedMessage.fromWalletAddress === 'system@duxxan' 
                              ? 'DUXXAN Sistemi' 
                              : `${selectedMessage.fromWalletAddress}@duxxan`
                          }
                        </span>
                        <span>
                          <strong>Tarih:</strong> {
                            new Date(selectedMessage.createdAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          }
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-duxxan-text whitespace-pre-wrap">
                        {selectedMessage.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <MailIcon className="w-16 h-16 text-duxxan-yellow mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-duxxan-text mb-2">
                      Mesaj Seçin
                    </h3>
                    <p className="text-duxxan-text-secondary">
                      Görüntülemek için soldan bir mesaj seçin
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Compose Dialog */}
        <Dialog open={isComposing} onOpenChange={setIsComposing}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-duxxan-yellow">Yeni Mail</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="to">Alıcı (Wallet Adresi)</Label>
                <Input
                  id="to"
                  placeholder="0x..."
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className="bg-white dark:bg-duxxan-dark"
                />
                <p className="text-xs text-duxxan-text-secondary mt-1">
                  Otomatik olarak @duxxan eklenecek
                </p>
              </div>
              <div>
                <Label htmlFor="subject">Konu</Label>
                <Input
                  id="subject"
                  placeholder="Mesaj konusu..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-white dark:bg-duxxan-dark"
                />
              </div>
              <div>
                <Label htmlFor="content">İçerik</Label>
                <Textarea
                  id="content"
                  placeholder="Mesajınızı yazın..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="bg-white dark:bg-duxxan-dark"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsComposing(false)}
                >
                  İptal
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                  className="bg-duxxan-yellow text-duxxan-dark hover:bg-duxxan-yellow/90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendMessageMutation.isPending ? 'Gönderiliyor...' : 'Gönder'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}