import { useState } from 'react';
import { useGetPost, useGetRepliesByPost, useCreateReply } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Clock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface PostDetailDialogProps {
  postId: bigint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  pregnancy: 'Grossesse',
  postpartum: 'Post-partum',
  sleep: 'Sommeil',
  organization: 'Organisation',
  mentalLoad: 'Charge Mentale',
};

export default function PostDetailDialog({ postId, open, onOpenChange }: PostDetailDialogProps) {
  const { identity } = useInternetIdentity();
  const { data: post, isLoading: postLoading } = useGetPost(postId);
  const { data: replies = [], isLoading: repliesLoading } = useGetRepliesByPost(postId);
  const createReply = useCreateReply();
  const [replyContent, setReplyContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const isAuthenticated = !!identity;

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      toast.error('Merci d\'écrire une réponse');
      return;
    }

    try {
      await createReply.mutateAsync({ 
        postId, 
        content: replyContent.trim(), 
        isAnonymous 
      });
      toast.success('Réponse publiée !');
      setReplyContent('');
      setIsAnonymous(false);
    } catch (error) {
      toast.error('Échec de la publication de la réponse. Merci de réessayer.');
    }
  };

  // Sort replies by timestamp (oldest first for conversation flow)
  const sortedReplies = [...replies].sort((a, b) => 
    Number(a.timestamp - b.timestamp)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Discussion</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          {postLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chargement du message...</p>
            </div>
          ) : post ? (
            <div className="space-y-6 pb-6">
              {/* Original Post */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">
                    {CATEGORY_LABELS[post.category] || post.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">par {post.author}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(post.timestamp)}
                  </span>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
              </div>

              <Separator />

              {/* Replies */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span>{replies.length} {replies.length === 1 ? 'Réponse' : 'Réponses'}</span>
                </div>

                {repliesLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement des réponses...</p>
                ) : sortedReplies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune réponse pour le moment. Sois la première à répondre !</p>
                ) : (
                  <div className="space-y-4">
                    {sortedReplies.map((reply) => (
                      <div key={reply.id.toString()} className="pl-4 border-l-2 border-border space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-foreground">{reply.author}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(reply.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Message introuvable</p>
            </div>
          )}
        </ScrollArea>

        {/* Reply Form */}
        {isAuthenticated && post && (
          <div className="border-t border-border p-6">
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <Textarea
                placeholder="Écris ta réponse..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="reply-anonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                  <Label htmlFor="reply-anonymous" className="text-sm">Publier anonymement</Label>
                </div>
                <Button type="submit" disabled={createReply.isPending}>
                  {createReply.isPending ? 'Publication...' : 'Répondre'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {!isAuthenticated && (
          <div className="border-t border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">Merci de te connecter pour répondre à ce message</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
