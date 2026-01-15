import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MotherhoodStatus } from '../backend';

export default function ProfileSetupDialog() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<MotherhoodStatus>(MotherhoodStatus.tryingToConceive);
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Merci d\'entrer ton nom');
      return;
    }

    try {
      await saveProfile.mutateAsync({ 
        name: name.trim(), 
        status,
        favorites: [] 
      });
      toast.success('Bienvenue sur Nara !');
    } catch (error) {
      toast.error('Échec de l\'enregistrement du profil. Merci de réessayer.');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Bienvenue sur Nara</DialogTitle>
          <DialogDescription>
            Merci de nous indiquer ton nom et où tu en es dans ton parcours. Tu pourras choisir de publier anonymement plus tard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ton Nom</Label>
            <Input
              id="name"
              placeholder="Entre ton nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Où en es-tu dans ton parcours ?</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as MotherhoodStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tryingToConceive">Essais bébé</SelectItem>
                <SelectItem value="pregnant">Enceinte</SelectItem>
                <SelectItem value="postpartum">Postpartum</SelectItem>
                <SelectItem value="youngChildren">Mère de jeune·s enfant·s</SelectItem>
                <SelectItem value="teenChildren">Mère d'ado·s</SelectItem>
                <SelectItem value="adultChildren">Mère d'adulte·s</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full bg-marketplace hover:bg-marketplace/90" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? 'Enregistrement...' : 'Continuer'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
