import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X } from 'lucide-react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';
import { ExternalBlob, Region, MotherhoodStatus, Country, type UserProfile } from '../backend';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: UserProfile;
}

export default function EditProfileDialog({ open, onOpenChange, currentProfile }: EditProfileDialogProps) {
  const [name, setName] = useState(currentProfile.name);
  const [country, setCountry] = useState<Country | undefined>(currentProfile.country);
  const [location, setLocation] = useState<Region | undefined>(currentProfile.location);
  const [status, setStatus] = useState<MotherhoodStatus>(currentProfile.status);
  const [bio, setBio] = useState(currentProfile.bio || '');
  const [profilePicture, setProfilePicture] = useState<ExternalBlob | undefined>(currentProfile.profilePicture);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const saveProfile = useSaveCallerUserProfile();

  useEffect(() => {
    if (open) {
      setName(currentProfile.name);
      setCountry(currentProfile.country);
      setLocation(currentProfile.location);
      setStatus(currentProfile.status);
      setBio(currentProfile.bio || '');
      setProfilePicture(currentProfile.profilePicture);
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, [open, currentProfile]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Merci de sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 Mo');
      return;
    }

    try {
      setIsUploading(true);
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });
      setProfilePicture(blob);
      toast.success('Photo ajoutée');
    } catch (error) {
      toast.error('Erreur lors du téléchargement de l\'image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setProfilePicture(undefined);
    toast.success('Photo supprimée');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Merci d\'entrer ton nom');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        country,
        location,
        status,
        bio: bio.trim() || undefined,
        favorites: currentProfile.favorites,
        profilePicture,
      });
      toast.success('Profil mis à jour');
      onOpenChange(false);
    } catch (error) {
      toast.error('Échec de la mise à jour du profil');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier mon profil</DialogTitle>
          <DialogDescription>
            Personnalise ton profil pour que la communauté puisse mieux te connaître
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="space-y-3">
            <Label>Photo de profil</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 rounded-2xl">
                {profilePicture ? (
                  <AvatarImage src={profilePicture.getDirectURL()} alt={name} />
                ) : (
                  <AvatarFallback className="bg-marketplace/20 text-marketplace text-2xl rounded-2xl">
                    {getInitials(name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => document.getElementById('profile-picture-upload')?.click()}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4" />
                  {isUploading ? `${uploadProgress}%` : 'Changer'}
                </Button>
                {profilePicture && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <p className="text-xs text-muted-foreground">Format JPG, PNG ou GIF. Max 5 Mo.</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Prénom ou surnom</Label>
            <Input
              id="name"
              placeholder="Comment veux-tu qu'on t'appelle ?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Pays</Label>
            <Select value={country} onValueChange={(value) => setCountry(value as Country)}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Choisis ton pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="switzerland">Suisse</SelectItem>
                <SelectItem value="france">France</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Canton / Région</Label>
            <Select value={location} onValueChange={(value) => setLocation(value as Region)}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Choisis ta région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geneva">Genève</SelectItem>
                <SelectItem value="vaud">Vaud</SelectItem>
                <SelectItem value="valais">Valais</SelectItem>
                <SelectItem value="fribourg">Fribourg</SelectItem>
                <SelectItem value="neuchatel">Neuchâtel</SelectItem>
                <SelectItem value="jura">Jura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Motherhood Status */}
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

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Quelques mots sur toi (optionnel)</Label>
            <Textarea
              id="bio"
              placeholder="Partage ce que tu souhaites avec la communauté..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saveProfile.isPending || isUploading} className="bg-marketplace hover:bg-marketplace/90">
              {saveProfile.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
