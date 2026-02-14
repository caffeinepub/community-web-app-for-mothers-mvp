import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Bookmark, AlertTriangle, Clock } from 'lucide-react';
import { type Post } from '../backend';
import { useGetCallerUserProfile } from '../hooks/useQueries';

interface FeedPostCardProps {
  post: Post;
  onReply: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  pregnancy: 'Grossesse',
  postpartum: 'Post-partum',
  sleep: 'Sommeil',
  organization: 'Organisation',
  mentalLoad: 'Charge Mentale',
};

const MOTHERHOOD_STATUS_LABELS: Record<string, string> = {
  tryingToConceive: 'Essais bébé',
  pregnant: 'Enceinte',
  postpartum: 'Postpartum',
  youngChildren: 'Mère de jeune.s enfant.s',
  teenChildren: 'Mère d\'ado.s',
  adultChildren: 'Mère d\'adulte.s',
};

const MAX_PREVIEW_LENGTH = 500;

export default function FeedPostCard({ post, onReply }: FeedPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: userProfile } = useGetCallerUserProfile();

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

  const needsTruncation = post.content.length > MAX_PREVIEW_LENGTH;
  const displayContent = needsTruncation && !isExpanded 
    ? post.content.slice(0, MAX_PREVIEW_LENGTH) + '...'
    : post.content;

  // Get author status if available (for display purposes only - would need backend support)
  const authorStatus = null; // Placeholder for future implementation

  return (
    <Card className="border-border/50 hover:border-marketplace/30 transition-colors">
      <CardContent className="pt-6 space-y-4">
        {/* Author Info */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-marketplace/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-marketplace">
                {post.author.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground">{post.author}</p>
              {authorStatus && (
                <p className="text-xs text-muted-foreground">
                  {MOTHERHOOD_STATUS_LABELS[authorStatus] || authorStatus}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
            <Clock className="w-3 h-3" />
            {formatTimestamp(post.timestamp)}
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-3">
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {displayContent}
          </p>
          {needsTruncation && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-marketplace hover:text-marketplace/80 font-medium"
            >
              {isExpanded ? 'Voir moins' : 'Voir plus'}
            </button>
          )}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="secondary" 
            className="bg-marketplace/10 text-marketplace border-marketplace/20 hover:bg-marketplace/20"
          >
            {CATEGORY_LABELS[post.category] || post.category}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReply}
            className="gap-2 text-muted-foreground hover:text-marketplace hover:bg-marketplace/10"
          >
            <MessageSquare className="w-4 h-4" />
            Répondre
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-marketplace hover:bg-marketplace/10"
          >
            <Bookmark className="w-4 h-4" />
            Enregistrer pour plus tard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-auto"
          >
            <AlertTriangle className="w-4 h-4" />
            Signaler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
