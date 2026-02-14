import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Upload, X } from 'lucide-react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';
import { ExternalBlob, Region, MotherhoodStatus, Country, SwissCanton, FrenchRegion, type UserProfile } from '../backend';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: UserProfile;
}

export default function EditProfileDialog({ open, onOpenChange, currentProfile }: EditProfileDialogProps) {
  const [name, setName] = useState(currentProfile.name);
  const [country, setCountry] = useState<Country | undefined>(currentProfile.country);
  const [region, setRegion] = useState<Region | undefined>(currentProfile.region);
  const [status, setStatus] = useState<MotherhoodStatus>(currentProfile.status);
  const [bio, setBio] = useState(currentProfile.bio || '');
  const [email, setEmail] = useState(currentProfile.email || '');
  const [marketingOptIn, setMarketingOptIn] = useState(currentProfile.marketingOptIn);
  const [profilePicture, setProfilePicture] = useState<ExternalBlob | undefined>(currentProfile.profilePicture);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const saveProfile = useSaveCallerUserProfile();

  useEffect(() => {
    if (open) {
      setName(currentProfile.name);
      setCountry(currentProfile.country);
      setRegion(currentProfile.region);
      setStatus(currentProfile.status);
      setBio(currentProfile.bio || '');
      setEmail(currentProfile.email || '');
      setMarketingOptIn(currentProfile.marketingOptIn);
      setProfilePicture(currentProfile.profilePicture);
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, [open, currentProfile]);

  // Reset region when country changes
  useEffect(() => {
    if (country !== currentProfile.country) {
      setRegion(undefined);
    }
  }, [country, currentProfile.country]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilise JPG, PNG ou GIF');
      return;
    }

    // Validate file size (5 MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('L\'image ne doit pas dépasser 5 Mo');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Convert file to Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with upload progress tracking
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(Math.round(percentage));
      });

      // Trigger the upload by calling getBytes() to ensure it's uploaded before saving
      try {
        await blob.getBytes();
        setProfilePicture(blob);
        toast.success('Photo ajoutée avec succès');
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Échec du téléchargement de la photo, réessaie avec une image plus légère');
        setProfilePicture(undefined);
      }
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('Erreur lors du traitement de l\'image');
      setProfilePicture(undefined);
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

    if (!country) {
      toast.error('Merci de choisir ton pays');
      return;
    }

    if (!region) {
      toast.error('Merci de choisir ta région');
      return;
    }

    if (isUploading) {
      toast.error('Attends que la photo soit téléchargée');
      return;
    }

    try {
      const profileData: UserProfile = {
        name: name.trim(),
        country,
        region,
        status,
        bio: bio.trim() || undefined,
        email: email.trim() || undefined,
        rulesAccepted: currentProfile.rulesAccepted,
        marketingOptIn,
        favorites: currentProfile.favorites,
        profilePicture,
        registrationTime: currentProfile.registrationTime,
        posts: currentProfile.posts,
        listings: currentProfile.listings,
      };

      await saveProfile.mutateAsync(profileData);
      toast.success('Profil mis à jour avec succès');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Profile save error:', error);
      const errorMessage = error?.message || 'Échec de la mise à jour du profil';
      toast.error(errorMessage);
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

  const getRegionOptions = () => {
    if (!country) return [];

    if (country === Country.switzerland) {
      return [
        { value: 'geneva', label: 'Genève' },
        { value: 'vaud', label: 'Vaud' },
        { value: 'valais', label: 'Valais' },
        { value: 'fribourg', label: 'Fribourg' },
        { value: 'neuchatel', label: 'Neuchâtel' },
        { value: 'jura', label: 'Jura' },
      ];
    } else {
      return [
        { value: 'auvergneRhoneAlpes', label: 'Auvergne-Rhône-Alpes' },
        { value: 'bourgogneFrancheComte', label: 'Bourgogne-Franche-Comté' },
        { value: 'bretagne', label: 'Bretagne' },
        { value: 'centreValDeLoire', label: 'Centre-Val de Loire' },
        { value: 'corse', label: 'Corse' },
        { value: 'grandEst', label: 'Grand Est' },
        { value: 'hautsDeFrance', label: 'Hauts-de-France' },
        { value: 'ileDeFrance', label: 'Ile-de-France' },
        { value: 'normandie', label: 'Normandie' },
        { value: 'nouvelleAquitaine', label: 'Nouvelle-Aquitaine' },
        { value: 'occitanie', label: 'Occitanie' },
        { value: 'paysDeLaLoire', label: 'Pays de la Loire' },
        { value: 'provenceAlpesCoteAzur', label: 'Provence-Alpes-Côte d\'Azur' },
      ];
    }
  };

  const handleRegionChange = (value: string) => {
    if (country === Country.switzerland) {
      setRegion({ __kind__: 'swissCanton', swissCanton: value as SwissCanton });
    } else {
      setRegion({ __kind__: 'frenchRegion', frenchRegion: value as FrenchRegion });
    }
  };

  const getRegionValue = () => {
    if (!region) return undefined;
    if (region.__kind__ === 'swissCanton') {
      return region.swissCanton;
    } else {
      return region.frenchRegion;
    }
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
                accept="image/jpeg,image/jpg,image/png,image/gif"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <p className="text-xs text-muted-foreground">Format JPG, PNG ou GIF. Max 5 Mo.</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Prénom ou surnom *</Label>
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
            <Label htmlFor="country">Pays *</Label>
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

          {/* Region */}
          <div className="space-y-2">
            <Label htmlFor="region">Canton / Région *</Label>
            <Select 
              value={getRegionValue()} 
              onValueChange={handleRegionChange}
              disabled={!country}
            >
              <SelectTrigger id="region">
                <SelectValue placeholder={country ? "Choisis ta région" : "Choisis d'abord ton pays"} />
              </SelectTrigger>
              <SelectContent>
                {getRegionOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Motherhood Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Où en es-tu dans ton parcours ? *</Label>
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
            <Label htmlFor="bio">Quelques mots sur toi</Label>
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

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Ton adresse email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ton.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Les e‑mails liés à ton activité sur Nara sont nécessaires au bon fonctionnement de la communauté.
            </p>
          </div>

          {/* Marketing Opt-in */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="marketing-opt-in" className="text-sm font-medium">
                Recevoir des nouvelles de Nara
              </Label>
              <p className="text-xs text-muted-foreground">
                Je souhaite recevoir des nouvelles et mises à jour de Nara
              </p>
            </div>
            <Switch
              id="marketing-opt-in"
              checked={marketingOptIn}
              onCheckedChange={setMarketingOptIn}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={saveProfile.isPending || isUploading} 
              className="bg-marketplace hover:bg-marketplace/90"
            >
              {saveProfile.isPending ? 'Enregistrement...' : isUploading ? 'Téléchargement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
