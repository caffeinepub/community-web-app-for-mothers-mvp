import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock } from 'lucide-react';
import { type Post } from '../backend';

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  pregnancy: 'Grossesse',
  postpartum: 'Post-partum',
  sleep: 'Sommeil',
  organization: 'Organisation',
  mentalLoad: 'Charge Mentale',
};

export default function PostCard({ post, onClick }: PostCardProps) {
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

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-border/50 hover:border-primary/30"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {CATEGORY_LABELS[post.category] || post.category}
            </Badge>
            <span className="text-sm text-muted-foreground">par {post.author}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
            <Clock className="w-3 h-3" />
            {formatTimestamp(post.timestamp)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground line-clamp-3">{post.content}</p>
        <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
          <MessageSquare className="w-4 h-4" />
          <span>Lire et répondre</span>
        </div>
      </CardContent>
    </Card>
  );
}
