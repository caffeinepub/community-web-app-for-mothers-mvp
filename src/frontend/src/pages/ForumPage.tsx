import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllPosts } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Plus } from 'lucide-react';
import { Category } from '../backend';
import CreatePostDialog from '../components/CreatePostDialog';
import PostCard from '../components/PostCard';
import PostDetailDialog from '../components/PostDetailDialog';

const CATEGORIES = [
  { value: 'all', label: 'Tous les messages' },
  { value: Category.pregnancy, label: 'Grossesse' },
  { value: Category.postpartum, label: 'Post-partum' },
  { value: Category.sleep, label: 'Sommeil' },
  { value: Category.organization, label: 'Organisation' },
  { value: Category.mentalLoad, label: 'Charge Mentale' },
];

export default function ForumPage() {
  const { identity } = useInternetIdentity();
  const { data: posts = [], isLoading } = useGetAllPosts();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPostId, setSelectedPostId] = useState<bigint | null>(null);

  const isAuthenticated = !!identity;

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  // Sort posts by timestamp (newest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => 
    Number(b.timestamp - a.timestamp)
  );

  return (
    <div className="w-full py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Nos conversations</h1>
            <p className="text-muted-foreground">Partage ton expérience, pose tes questions</p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)} 
            disabled={!isAuthenticated}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau message
          </Button>
        </div>

        {!isAuthenticated && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Connecte-toi pour participer</CardTitle>
              <CardDescription>
                Pour créer des messages et rejoindre les discussions, il te suffit de te connecter.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-muted/50 p-2">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value} className="flex-shrink-0">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((cat) => (
            <TabsContent key={cat.value} value={cat.value} className="mt-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
                  <p className="text-muted-foreground">Chargement...</p>
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
                <div className="space-y-4">
                  {sortedPosts.map((post) => (
                    <PostCard 
                      key={post.id.toString()} 
                      post={post} 
                      onClick={() => setSelectedPostId(post.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

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
