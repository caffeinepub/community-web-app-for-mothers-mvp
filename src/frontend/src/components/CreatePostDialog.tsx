import { useState } from 'react';
import { useCreatePost } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Category } from '../backend';
import { toast } from 'sonner';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORY_OPTIONS = [
  { value: Category.pregnancy, label: 'Grossesse' },
  { value: Category.postpartum, label: 'Post-partum' },
  { value: Category.sleep, label: 'Sommeil' },
  { value: Category.organization, label: 'Organisation' },
  { value: Category.mentalLoad, label: 'Charge Mentale' },
];

export default function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const [category, setCategory] = useState<Category>(Category.pregnancy);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Écris quelque chose avant de publier');
      return;
    }

    try {
      await createPost.mutateAsync({ category, content: content.trim(), isAnonymous });
      toast.success('Ton message est publié !');
      onOpenChange(false);
      setContent('');
      setIsAnonymous(false);
    } catch (error) {
      toast.error('Oups, une erreur est survenue. Réessaie ?');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Partage ton expérience</DialogTitle>
          <DialogDescription>
            Pose une question, raconte ton quotidien ou partage un conseil.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Ton message</Label>
            <Textarea
              id="content"
              placeholder="Raconte ce qui te passe par la tête..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="anonymous" className="text-sm font-medium">Rester anonyme</Label>
              <p className="text-xs text-muted-foreground">Ton nom ne sera pas affiché</p>
            </div>
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createPost.isPending}>
              {createPost.isPending ? 'Envoi...' : 'Publier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
