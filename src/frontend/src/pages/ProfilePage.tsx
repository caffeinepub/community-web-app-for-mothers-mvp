import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, Heart, User } from 'lucide-react';
import { useGetUserProfile, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import type { Principal } from '@icp-sdk/core/principal';
import type { Listing, Post, Region, MotherhoodStatus, Country } from '../backend';
import EditProfileDialog from '../components/EditProfileDialog';
import ListingCard from '../components/ListingCard';
import PostCard from '../components/PostCard';
import PostDetailDialog from '../components/PostDetailDialog';

interface ProfilePageProps {
  userPrincipal: Principal | null;
  onOpenChat: (principal: Principal) => void;
  onBack: () => void;
  onViewProfile: (principal: Principal) => void;
}

export default function ProfilePage({ userPrincipal, onOpenChat, onBack, onViewProfile }: ProfilePageProps) {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('listings');
  const [selectedPostId, setSelectedPostId] = useState<bigint | null>(null);

  const isAuthenticated = !!identity;
  
  // If userPrincipal is null, we're viewing our own profile
  const isOwnProfile = userPrincipal === null || (identity && userPrincipal && identity.getPrincipal().toString() === userPrincipal.toString());

  // Fetch caller's profile if viewing own profile
  const { data: callerProfile, isLoading: callerProfileLoading } = useGetCallerUserProfile();
  
  // Fetch other user's profile if viewing someone else's profile
  const { data: otherUserProfile, isLoading: otherUserProfileLoading } = useGetUserProfile(userPrincipal);

  // Use the appropriate profile based on whether it's own profile or not
  const userProfile = isOwnProfile ? callerProfile : otherUserProfile;
  const isLoading = isOwnProfile ? callerProfileLoading : otherUserProfileLoading;

  // Get the actual principal for fetching user activity
  const profilePrincipal = isOwnProfile && identity ? identity.getPrincipal() : userPrincipal;

  // Fetch user activity
  const { data: userActivity } = useQuery<{ listings: Listing[]; posts: Post[] }>({
    queryKey: ['userActivity', profilePrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !profilePrincipal) return { listings: [], posts: [] };
      return actor.getUserActivity(profilePrincipal);
    },
    enabled: !!actor && !actorFetching && !!profilePrincipal,
  });

  // Fetch favorited listings (only for own profile)
  const { data: favoritedListings } = useQuery<Listing[]>({
    queryKey: ['favoritedListings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFavoritedListings();
    },
    enabled: !!actor && !actorFetching && isOwnProfile,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRegionLabel = (region: Region | undefined) => {
    if (!region) return null;
    const labels: Record<Region, string> = {
      geneva: 'Genève',
      vaud: 'Vaud',
      valais: 'Valais',
      fribourg: 'Fribourg',
      neuchatel: 'Neuchâtel',
      jura: 'Jura',
    };
    return labels[region];
  };

  const getCountryLabel = (country: Country | undefined) => {
    if (!country) return null;
    const labels: Record<Country, string> = {
      switzerland: 'Suisse',
      france: 'France',
    };
    return labels[country];
  };

  const getMotherhoodStatusLabel = (status: MotherhoodStatus) => {
    const labels: Record<MotherhoodStatus, string> = {
      tryingToConceive: 'Essais bébé',
      pregnant: 'Enceinte',
      postpartum: 'Postpartum',
      youngChildren: 'Mère de jeune·s enfant·s',
      teenChildren: 'Mère d\'ado·s',
      adultChildren: 'Mère d\'adulte·s',
    };
    return labels[status];
  };

  if (isLoading) {
    return (
      <div className="w-full py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="w-full py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <Card className="border-marketplace/20">
            <CardContent className="pt-6 text-center py-12">
              <User className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              {isOwnProfile ? (
                <div className="space-y-3">
                  <p className="text-lg font-medium text-foreground">Complète ton profil pour le voir ici</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Partage quelques informations sur toi pour que la communauté puisse mieux te connaître
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Profil non trouvé</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>

        {/* Profile Header */}
        <Card className="border-marketplace/20 mb-6">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <Avatar className="w-28 h-28 rounded-3xl">
                  {userProfile.profilePicture ? (
                    <AvatarImage src={userProfile.profilePicture.getDirectURL()} alt={userProfile.name} />
                  ) : (
                    <AvatarFallback className="bg-marketplace/20 text-marketplace text-3xl rounded-3xl">
                      {getInitials(userProfile.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-heading mb-2">{userProfile.name}</h1>
                  <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                    {userProfile.country && (
                      <Badge variant="secondary" className="bg-marketplace/10 text-marketplace border-0">
                        {getCountryLabel(userProfile.country)}
                      </Badge>
                    )}
                    {userProfile.location && (
                      <Badge variant="secondary" className="bg-marketplace/10 text-marketplace border-0">
                        {getRegionLabel(userProfile.location)}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-marketplace/10 text-marketplace border-0">
                      {getMotherhoodStatusLabel(userProfile.status)}
                    </Badge>
                  </div>
                </div>

                {userProfile.bio && (
                  <p className="text-muted-foreground leading-relaxed">{userProfile.bio}</p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {isOwnProfile ? (
                    <>
                      <Button
                        onClick={() => setShowEditDialog(true)}
                        variant="outline"
                        className="gap-2 border-marketplace/30 hover:bg-marketplace/5"
                      >
                        <img src="/assets/generated/edit-profile-icon.dim_24x24.png" alt="" className="w-4 h-4" />
                        Modifier mon profil
                      </Button>
                      <Button
                        onClick={() => setActiveTab('favorites')}
                        variant="outline"
                        className="gap-2 border-marketplace/30 hover:bg-marketplace/5"
                      >
                        <img src="/assets/generated/my-favorites-icon.dim_24x24.png" alt="" className="w-4 h-4" />
                        Mes favoris
                      </Button>
                    </>
                  ) : (
                    isAuthenticated && userPrincipal && (
                      <Button
                        onClick={() => onOpenChat(userPrincipal)}
                        className="bg-marketplace hover:bg-marketplace/90 gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Envoyer un message
                      </Button>
                    )
                  )}
                </div>

                {/* Trust & Safety Message */}
                {isOwnProfile && (
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ces informations sont visibles uniquement par les membres de la communauté. Tu peux modifier ou supprimer ton contenu à tout moment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="listings">Mes annonces</TabsTrigger>
            <TabsTrigger value="posts">Mes discussions</TabsTrigger>
            {isOwnProfile && <TabsTrigger value="favorites">Articles sauvegardés</TabsTrigger>}
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            {userActivity?.listings && userActivity.listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userActivity.listings.map((listing) => (
                  <ListingCard key={listing.id.toString()} listing={listing} onViewProfile={onViewProfile} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">
                    {isOwnProfile ? 'Tu n\'as pas encore d\'annonces' : 'Aucune annonce pour le moment'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            {userActivity?.posts && userActivity.posts.length > 0 ? (
              <div className="space-y-3">
                {userActivity.posts.map((post) => (
                  <PostCard key={post.id.toString()} post={post} onClick={() => setSelectedPostId(post.id)} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">
                    {isOwnProfile ? 'Tu n\'as pas encore de discussions' : 'Aucune discussion pour le moment'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Favorites Tab (only for own profile) */}
          {isOwnProfile && (
            <TabsContent value="favorites" className="space-y-4">
              {favoritedListings && Array.isArray(favoritedListings) && favoritedListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoritedListings.map((listing) => (
                    <ListingCard key={listing.id.toString()} listing={listing} onViewProfile={onViewProfile} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">Tu n'as pas encore d'articles sauvegardés</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Clique sur le cœur pour sauvegarder tes articles préférés
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      {isOwnProfile && userProfile && (
        <EditProfileDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          currentProfile={userProfile}
        />
      )}

      {/* Post Detail Dialog */}
      {selectedPostId !== null && (
        <PostDetailDialog
          postId={selectedPostId}
          open={selectedPostId !== null}
          onOpenChange={(open) => !open && setSelectedPostId(null)}
        />
      )}
    </div>
  );
}
