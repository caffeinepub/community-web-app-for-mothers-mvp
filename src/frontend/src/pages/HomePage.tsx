import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllPosts } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageSquare, Users, Shield, Sparkles, Plus } from 'lucide-react';
import CreatePostDialog from '../components/CreatePostDialog';
import PostDetailDialog from '../components/PostDetailDialog';
import FeedPostCard from '../components/FeedPostCard';

interface HomePageProps {
  onNavigateToForum: () => void;
  onNavigateToSecondHand: (category?: string) => void;
}

export default function HomePage({ onNavigateToForum, onNavigateToSecondHand }: HomePageProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: posts = [], isLoading } = useGetAllPosts();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<bigint | null>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Sort posts by timestamp (newest first)
  const sortedPosts = [...posts].sort((a, b) => 
    Number(b.timestamp - a.timestamp)
  );

  const handleJoinCommunity = async () => {
    if (!isAuthenticated) {
      try {
        await login();
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-marketplace/10 to-background border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-marketplace/20 text-marketplace text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Un espace rien qu'à nous
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Un espace doux et bienveillant pour les mères
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Tu n'es pas seule. Ici, on partage nos joies, nos doutes et nos petites victoires du quotidien. 
              Parce qu'être maman, c'est magnifique... et parfois épuisant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setShowCreateDialog(true)} 
                disabled={!isAuthenticated}
                className="gap-2 bg-marketplace hover:bg-marketplace/90"
              >
                <Plus className="w-5 h-5" />
                Partage ton expérience
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 border-marketplace/30 hover:bg-marketplace/5"
                onClick={handleJoinCommunity}
                disabled={isLoggingIn}
              >
                <Users className="w-5 h-5" />
                {isLoggingIn ? 'Connexion...' : 'Rejoindre la communauté'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Conversation Feed Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Nos conversations
              </h2>
              <p className="text-muted-foreground">
                Lis, partage et réponds aux expériences des autres mamans
              </p>
            </div>
            {isAuthenticated && (
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="gap-2 bg-marketplace hover:bg-marketplace/90"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouveau</span>
              </Button>
            )}
          </div>

          {!isAuthenticated && (
            <Card className="mb-6 border-marketplace/20 bg-marketplace/5">
              <CardHeader>
                <CardTitle className="text-lg">Connecte-toi pour participer</CardTitle>
                <CardDescription>
                  Pour créer des messages et rejoindre les discussions, il te suffit de te connecter.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
              <p className="text-muted-foreground">Chargement des conversations...</p>
            </div>
          ) : sortedPosts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Pas encore de messages ici</p>
                <p className="text-sm text-muted-foreground">Lance la conversation, on t'écoute !</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {sortedPosts.map((post) => (
                <FeedPostCard 
                  key={post.id.toString()} 
                  post={post}
                  onReply={() => setSelectedPostId(post.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-marketplace/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ce qu'on fait ensemble
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un endroit pour échanger, s'entraider et se sentir comprise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-marketplace/20 hover:border-marketplace/50 transition-colors hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-marketplace flex items-center justify-center mb-4 mx-auto shadow-sm">
                  <img src="/assets/generated/mouth-icon.dim_64x64.png" alt="Parle librement" className="w-10 h-10" />
                </div>
                <CardTitle>Parle librement</CardTitle>
                <CardDescription>
                  Pose tes questions, raconte ton quotidien. Ici, pas de jugement, juste de l'écoute.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Partage avec ton nom ou anonymement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Des sujets qui te parlent vraiment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Des réponses de mamans qui comprennent</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-marketplace/20 hover:border-marketplace/50 transition-colors hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-marketplace flex items-center justify-center mb-4 mx-auto shadow-sm">
                  <img src="/assets/generated/recycling-icon.dim_64x64.png" alt="Donne une seconde vie" className="w-10 h-10" />
                </div>
                <CardTitle>Donne une seconde vie</CardTitle>
                <CardDescription>
                  Ce petit body devenu trop petit ? Partage-le avec une autre maman.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Montre tes articles en quelques photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Trouve ce qu'il te faut près de chez toi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Discute directement avec les mamans</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-marketplace/20 hover:border-marketplace/50 transition-colors hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-marketplace flex items-center justify-center mb-4 mx-auto shadow-sm">
                  <img src="/assets/generated/heart-confidence-icon-styled.dim_64x64.png" alt="En toute confiance" className="w-10 h-10" />
                </div>
                <CardTitle>En toute confiance</CardTitle>
                <CardDescription>
                  Un espace bienveillant où chaque maman compte.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Connexion sécurisée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Tes infos restent privées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Une communauté respectueuse</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seconde Main Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Seconde Main
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvre les trésors partagés par la communauté.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card 
              className="text-center hover:shadow-lg transition-all cursor-pointer border-marketplace/20 hover:border-marketplace/50 group"
              onClick={() => onNavigateToSecondHand('Vêtements')}
            >
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-marketplace flex items-center justify-center mx-auto group-hover:shadow-md transition-all shadow-sm">
                  <Sparkles className="w-10 h-10 text-marketplace" />
                </div>
                <CardTitle className="text-lg">Vêtements</CardTitle>
              </CardHeader>
            </Card>

            <Card 
              className="text-center hover:shadow-lg transition-all cursor-pointer border-marketplace/20 hover:border-marketplace/50 group"
              onClick={() => onNavigateToSecondHand('Chaussures')}
            >
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-marketplace flex items-center justify-center mx-auto group-hover:shadow-md transition-all shadow-sm">
                  <Sparkles className="w-10 h-10 text-marketplace" />
                </div>
                <CardTitle className="text-lg">Chaussures</CardTitle>
              </CardHeader>
            </Card>

            <Card 
              className="text-center hover:shadow-lg transition-all cursor-pointer border-marketplace/20 hover:border-marketplace/50 group"
              onClick={() => onNavigateToSecondHand('Jouets')}
            >
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-marketplace flex items-center justify-center mx-auto group-hover:shadow-md transition-all shadow-sm">
                  <Sparkles className="w-10 h-10 text-marketplace" />
                </div>
                <CardTitle className="text-lg">Jouets</CardTitle>
              </CardHeader>
            </Card>

            <Card 
              className="text-center hover:shadow-lg transition-all cursor-pointer border-marketplace/20 hover:border-marketplace/50 group"
              onClick={() => onNavigateToSecondHand()}
            >
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-marketplace flex items-center justify-center mx-auto group-hover:shadow-md transition-all shadow-sm">
                  <Sparkles className="w-10 h-10 text-marketplace" />
                </div>
                <CardTitle className="text-lg">Tout découvrir</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-marketplace/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-marketplace/20 to-marketplace/10 border-marketplace/30">
            <CardHeader className="text-center space-y-4 pb-8">
              <CardTitle className="text-3xl sm:text-4xl">Prête à nous rejoindre ?</CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                Viens échanger avec des mamans qui vivent les mêmes choses que toi.
              </CardDescription>
              <div className="flex justify-center">
                <Button 
                  size="default"
                  onClick={() => setShowCreateDialog(true)}
                  disabled={!isAuthenticated}
                  className="gap-2 bg-marketplace hover:bg-marketplace/90"
                >
                  <MessageSquare className="w-4 h-4" />
                  C'est parti
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {showCreateDialog && (
        <CreatePostDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog} 
        />
      )}

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
