import { useState, useEffect } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MotherhoodStatus, Country, Region, SwissCanton, FrenchRegion } from '../backend';

export default function ProfileSetupDialog() {
  const [name, setName] = useState('');
  const [country, setCountry] = useState<Country | undefined>(undefined);
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [status, setStatus] = useState<MotherhoodStatus | undefined>(undefined);
  const saveProfile = useSaveCallerUserProfile();

  // Reset region when country changes
  useEffect(() => {
    setRegion(undefined);
  }, [country]);

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

    if (!status) {
      toast.error('Merci de choisir où tu en es dans ton parcours');
      return;
    }

    try {
      await saveProfile.mutateAsync({ 
        name: name.trim(), 
        status,
        country,
        region,
        favorites: [],
        registrationTime: BigInt(Date.now() * 1_000_000),
        posts: [],
        listings: [],
        rulesAccepted: false,
        marketingOptIn: false,
      });
      toast.success('Bienvenue sur Nara !');
    } catch (error) {
      toast.error('Échec de l\'enregistrement du profil. Merci de réessayer.');
    }
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
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Bienvenue sur Nara</DialogTitle>
          <DialogDescription>
            Merci de nous indiquer ton nom, ton pays, ta région et où tu en es dans ton parcours. Tu pourras choisir de publier anonymement plus tard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ton Nom *</Label>
            <Input
              id="name"
              placeholder="Entre ton nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Ton Pays *</Label>
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
          <div className="space-y-2">
            <Label htmlFor="region">Ta Région *</Label>
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
          <div className="space-y-2">
            <Label htmlFor="status">Où en es-tu dans ton parcours ? *</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as MotherhoodStatus)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Choisis ton statut" />
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
