import { useEffect, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { 
  useAdminGetAllContentForModeration,
  useAdminGetRecentActivity, 
  useAdminGetStats,
  useAdminHidePost,
  useAdminDeletePost,
  useAdminDeleteListing,
  useAdminGetPostDetails,
  useAdminGetListingDetails,
  useIsAdmin
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle, Clock, Users, MessageSquare, Package, Flag, MapPin, Eye } from 'lucide-react';
import { toast } from 'sonner';
import LoggedOutStateCard from '../components/LoggedOutStateCard';
import type { Post, Listing } from '../backend';

export default function AdminDashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: moderationContent, isLoading: loadingModeration, refetch: refetchModeration } = useAdminGetAllContentForModeration();
  const { data: recentActivity, isLoading: loadingActivity } = useAdminGetRecentActivity();
  const { data: stats, isLoading: loadingStats } = useAdminGetStats();
  
  const hidePostMutation = useAdminHidePost();
  const deletePostMutation = useAdminDeletePost();
  const deleteListingMutation = useAdminDeleteListing();
  
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingContentType, setViewingContentType] = useState<'Post' | 'Annonce' | null>(null);
  const [viewingContentId, setViewingContentId] = useState<bigint | null>(null);
  
  const { data: viewingPost } = useAdminGetPostDetails(viewingContentType === 'Post' ? viewingContentId : null);
  const { data: viewingListing } = useAdminGetListingDetails(viewingContentType === 'Annonce' ? viewingContentId : null);

  const isAuthenticated = !!identity;

  const handleView = (contentType: 'Post' | 'Annonce', contentId: bigint) => {
    setViewingContentType(contentType);
    setViewingContentId(contentId);
    setViewDialogOpen(true);
  };

  const handleHide = async (contentId: bigint) => {
    try {
      await hidePostMutation.mutateAsync(contentId);
      toast.success('Contenu signalé pour modération');
      refetchModeration();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du masquage');
    }
  };

  const handleDelete = async (contentType: 'Post' | 'Annonce', contentId: bigint) => {
    try {
      if (contentType === 'Post') {
        await deletePostMutation.mutateAsync(contentId);
        toast.success('Post signalé pour suppression');
      } else {
        toast.info('Suppression des annonces non disponible');
      }
      refetchModeration();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleOk = (itemId: bigint) => {
    toast.success('Retiré de la file de modération');
    refetchModeration();
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'userRegistration': return 'Nouvelle inscription';
      case 'forumPost': return 'Nouveau post';
      case 'comment': return 'Nouveau commentaire';
      case 'secondHandListing': return 'Nouvelle annonce';
      default: return type;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'userRegistration': return <Users className="w-4 h-4" />;
      case 'forumPost': return <MessageSquare className="w-4 h-4" />;
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'secondHandListing': return <Package className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Show loading state while checking admin status
  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full">
          <LoggedOutStateCard 
            title="Espace réservé aux admins"
            description="Cette page est réservée à l'équipe de modération Nara. Connecte-toi avec un compte administrateur pour continuer."
            actionText="Se connecter"
          />
        </div>
      </div>
    );
  }

  // Show access denied if authenticated but not admin
  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-destructive/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Accès refusé</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Cette page est réservée à l'équipe de modération Nara.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading text-foreground mb-2">Tableau de bord admin</h1>
          <p className="text-muted-foreground">Gestion et modération de la communauté Nara</p>
        </div>

        {/* Section 1: Modération en cours */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-primary flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-heading text-foreground">Modération en cours</h2>
          </div>

          {loadingModeration ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : !moderationContent || moderationContent.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun contenu à modérer pour le moment
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {moderationContent.map((item) => (
                <Card key={`${item.contentType}-${item.contentId}`} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="font-normal">
                            {item.contentType}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            par <span className="font-medium">{item.author}</span>
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(item.timestamp)}
                          </span>
                          {Number(item.reportCount) > 0 && (
                            <Badge variant="destructive" className="gap-1">
                              <Flag className="w-3 h-3" />
                              {Number(item.reportCount)} signalement{Number(item.reportCount) > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground line-clamp-3">
                          {item.excerpt}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(item.contentType as 'Post' | 'Annonce', item.contentId)}
                          disabled={hidePostMutation.isPending || deletePostMutation.isPending || deleteListingMutation.isPending}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                        {item.contentType === 'Post' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleHide(item.contentId)}
                            disabled={hidePostMutation.isPending || deletePostMutation.isPending || deleteListingMutation.isPending}
                          >
                            Masquer
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.contentType as 'Post' | 'Annonce', item.contentId)}
                          disabled={hidePostMutation.isPending || deletePostMutation.isPending || deleteListingMutation.isPending}
                        >
                          Supprimer
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleOk(item.contentId)}
                          disabled={hidePostMutation.isPending || deletePostMutation.isPending || deleteListingMutation.isPending}
                        >
                          OK
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <Separator className="my-12" />

        {/* Section 2: Activité récente */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-primary flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-heading text-foreground">Activité récente</h2>
          </div>

          {loadingActivity ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : !recentActivity || recentActivity.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucune activité récente
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentActivity.slice(0, 20).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 text-primary">
                        {getActivityIcon(activity.activityType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {getActivityTypeLabel(activity.activityType)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          par <span className="font-medium">{activity.author}</span>
                        </p>
                        {activity.content && activity.activityType !== 'userRegistration' && (
                          <p className="text-sm text-foreground mt-1 line-clamp-2">
                            {activity.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        <Separator className="my-12" />

        {/* Section 3: Vue d'ensemble */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-primary flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-heading text-foreground">Vue d'ensemble</h2>
          </div>

          {loadingStats ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : !stats ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Impossible de charger les statistiques
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-normal text-muted-foreground">Utilisateurs inscrits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-heading text-foreground">{Number(stats.totalUsers)}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-normal text-muted-foreground">Posts du forum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-heading text-foreground">{Number(stats.totalForumPosts)}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-normal text-muted-foreground">Commentaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-heading text-foreground">{Number(stats.totalComments)}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-normal text-muted-foreground">Annonces actives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-heading text-foreground">{Number(stats.activeListings)}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-normal text-muted-foreground">Contenus signalés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-heading text-foreground">{Number(stats.reportedContentCount)}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Répartition par pays
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-8">
                    <div>
                      <div className="text-2xl font-heading text-foreground">{Number(stats.switzerlandUsers)}</div>
                      <div className="text-sm text-muted-foreground">Suisse</div>
                    </div>
                    <div>
                      <div className="text-2xl font-heading text-foreground">{Number(stats.franceUsers)}</div>
                      <div className="text-sm text-muted-foreground">France</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </section>
      </div>

      {/* View Content Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              {viewingContentType === 'Post' ? 'Détails du post' : 'Détails de l\'annonce'}
            </DialogTitle>
            <DialogDescription>
              Contenu complet pour modération
            </DialogDescription>
          </DialogHeader>
          
          {viewingContentType === 'Post' && viewingPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline">{viewingPost.author}</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatTimestamp(viewingPost.timestamp)}
                </span>
                {viewingPost.isHidden && (
                  <Badge variant="secondary">Masqué</Badge>
                )}
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{viewingPost.content}</p>
              </div>
            </div>
          )}

          {viewingContentType === 'Annonce' && viewingListing && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline">{viewingListing.author}</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatTimestamp(viewingListing.timestamp)}
                </span>
                <Badge>{Number(viewingListing.price)} CHF</Badge>
              </div>
              <h3 className="text-xl font-heading">{viewingListing.title}</h3>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{viewingListing.description}</p>
              </div>
              {viewingListing.images && viewingListing.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {viewingListing.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.getDirectURL()}
                      alt={`Image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
