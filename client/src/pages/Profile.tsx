import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function Profile() {
  const { user, updateUser, isConnected } = useWallet();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    name: user?.name || '',
    profession: user?.profession || '',
    bio: user?.bio || '',
  });

  // Fetch user's tickets
  const { data: tickets = [] } = useQuery({
    queryKey: ['/api/users/me/tickets'],
    enabled: isConnected,
  });

  // Fetch user's created raffles
  const { data: createdRaffles = [] } = useQuery({
    queryKey: ['/api/raffles?creator=' + user?.id],
    enabled: isConnected && !!user?.id,
  });

  if (!isConnected || !user) {
    return (
      <div className="min-h-screen bg-duxxan-page flex items-center justify-center transition-colors duration-200">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Cüzdanınızı Bağlayın</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Profilinizi görüntülemek için lütfen cüzdanınızı bağlayın.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-duxxan-yellow">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-duxxan-yellow">★</span>);
    }
    
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} className="text-duxxan-text-secondary">★</span>);
    }
    
    return stars;
  };

  const getProfileStats = () => {
    const rafflesWon = tickets.filter((ticket: any) => 
      ticket.raffle?.winnerId === user.id
    ).length;
    
    const rafflesJoined = tickets.length;
    const rafflesCreated = createdRaffles.length;
    const totalSpent = tickets.reduce((sum: number, ticket: any) => 
      sum + parseFloat(ticket.totalAmount || '0'), 0
    );

    return {
      rafflesWon,
      rafflesJoined,
      rafflesCreated,
      totalSpent,
    };
  };

  const stats = getProfileStats();

  return (
    <div className="min-h-screen bg-duxxan-dark py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="duxxan-card">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-duxxan-yellow rounded-full flex items-center justify-center text-duxxan-dark text-2xl font-bold mx-auto mb-4">
                    {user.username?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="bg-duxxan-dark border-duxxan-border"
                      />
                      <Input
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-duxxan-dark border-duxxan-border"
                      />
                      <Input
                        placeholder="Profession"
                        value={formData.profession}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                        className="bg-duxxan-dark border-duxxan-border"
                      />
                      <Textarea
                        placeholder="Bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="bg-duxxan-dark border-duxxan-border"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSave}
                          size="sm"
                          className="duxxan-button-primary flex-1"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          size="sm"
                          variant="outline"
                          className="duxxan-button-secondary flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold mb-2">{user.username}</h2>
                      {user.name && (
                        <p className="text-duxxan-text-secondary mb-2">{user.name}</p>
                      )}
                      {user.profession && (
                        <p className="text-sm text-duxxan-text-secondary mb-4">{user.profession}</p>
                      )}
                      {user.bio && (
                        <p className="text-sm text-duxxan-text-secondary mb-4">{user.bio}</p>
                      )}
                      
                      <div className="flex justify-center items-center space-x-2 mb-4">
                        <div className="flex space-x-1">
                          {renderStars(parseFloat(user.rating || '5.0'))}
                        </div>
                        <span className="text-sm text-duxxan-text-secondary">
                          {user.rating} ({user.ratingCount || 0} ratings)
                        </span>
                      </div>
                      
                      <Button
                        onClick={() => {
                          setFormData({
                            username: user.username || '',
                            name: user.name || '',
                            profession: user.profession || '',
                            bio: user.bio || '',
                          });
                          setIsEditing(true);
                        }}
                        className="duxxan-button-primary w-full"
                      >
                        Edit Profile
                      </Button>
                    </>
                  )}
                </div>

                <Separator className="my-6 bg-duxxan-border" />

                {/* Profile Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-duxxan-yellow">{stats.rafflesWon}</div>
                    <div className="text-xs text-duxxan-text-secondary">Raffles Won</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-duxxan-success">{stats.rafflesJoined}</div>
                    <div className="text-xs text-duxxan-text-secondary">Raffles Joined</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-duxxan-warning">${stats.totalSpent.toFixed(0)}</div>
                    <div className="text-xs text-duxxan-text-secondary">Total Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{stats.rafflesCreated}</div>
                    <div className="text-xs text-duxxan-text-secondary">Raffles Created</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="tickets" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-duxxan-surface">
                <TabsTrigger 
                  value="tickets" 
                  className="data-[state=active]:bg-duxxan-yellow data-[state=active]:text-duxxan-dark"
                >
                  My Tickets
                </TabsTrigger>
                <TabsTrigger 
                  value="created" 
                  className="data-[state=active]:bg-duxxan-yellow data-[state=active]:text-duxxan-dark"
                >
                  Created Raffles
                </TabsTrigger>
                <TabsTrigger 
                  value="activity" 
                  className="data-[state=active]:bg-duxxan-yellow data-[state=active]:text-duxxan-dark"
                >
                  Recent Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tickets" className="mt-6">
                <Card className="duxxan-card">
                  <CardHeader>
                    <CardTitle>My Tickets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tickets.length > 0 ? (
                      <div className="space-y-4">
                        {tickets.map((ticket: any) => (
                          <div
                            key={ticket.id}
                            className="flex items-center justify-between p-4 bg-duxxan-dark rounded-lg"
                          >
                            <div>
                              <h4 className="font-semibold">{ticket.raffle?.title}</h4>
                              <p className="text-sm text-duxxan-text-secondary">
                                {ticket.quantity} tickets • ${ticket.totalAmount} USDT
                              </p>
                            </div>
                            <div className="text-right">
                              {ticket.raffle?.winnerId === user.id && (
                                <Badge className="bg-duxxan-success mb-2">Winner!</Badge>
                              )}
                              <div className="text-sm text-duxxan-text-secondary">
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-duxxan-text-secondary mb-4">
                          You haven't purchased any tickets yet.
                        </p>
                        <Button className="duxxan-button-primary">
                          Browse Raffles
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="created" className="mt-6">
                <Card className="duxxan-card">
                  <CardHeader>
                    <CardTitle>Created Raffles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {createdRaffles.length > 0 ? (
                      <div className="space-y-4">
                        {createdRaffles.map((raffle: any) => (
                          <div
                            key={raffle.id}
                            className="flex items-center justify-between p-4 bg-duxxan-dark rounded-lg"
                          >
                            <div>
                              <h4 className="font-semibold">{raffle.title}</h4>
                              <p className="text-sm text-duxxan-text-secondary">
                                {raffle.ticketsSold}/{raffle.maxTickets} tickets sold
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={raffle.isActive ? 'default' : 'secondary'}
                                className={raffle.isActive ? 'bg-duxxan-success' : ''}
                              >
                                {raffle.isActive ? 'Active' : 'Ended'}
                              </Badge>
                              <div className="text-sm text-duxxan-text-secondary mt-1">
                                ${raffle.prizeValue}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-duxxan-text-secondary mb-4">
                          You haven't created any raffles yet.
                        </p>
                        <Button className="duxxan-button-primary">
                          Create Raffle
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <Card className="duxxan-card">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Activity items would be generated from various actions */}
                      <div className="flex items-center justify-between py-3 border-b border-duxxan-border">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-duxxan-success rounded-full"></div>
                          <span>Profile updated</span>
                        </div>
                        <span className="text-duxxan-text-secondary text-sm">Just now</span>
                      </div>
                      
                      {tickets.slice(0, 5).map((ticket: any, index: number) => (
                        <div key={ticket.id} className="flex items-center justify-between py-3 border-b border-duxxan-border">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-duxxan-warning rounded-full"></div>
                            <span>
                              Bought {ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''} for {ticket.raffle?.title}
                            </span>
                          </div>
                          <span className="text-duxxan-text-secondary text-sm">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
