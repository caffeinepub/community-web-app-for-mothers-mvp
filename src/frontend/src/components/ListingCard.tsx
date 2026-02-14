import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { type Listing, ProductCondition, Region } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsFavorite, useToggleFavorite } from '../hooks/useQueries';
import { toast } from 'sonner';
import ListingDetailDialog from './ListingDetailDialog';
import type { Principal } from '@icp-sdk/core/principal';

interface ListingCardProps {
  listing: Listing;
  onViewProfile: (principal: Principal) => void;
}

export default function ListingCard({ listing, onViewProfile }: ListingCardProps) {
  const { identity } = useInternetIdentity();
  const { data: isFavorite = false } = useIsFavorite(listing.id);
  const toggleFavorite = useToggleFavorite();
  const isAuthenticated = !!identity;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatPrice = (price: bigint) => {
    const priceValue = Number(price) / 100;
    return `${priceValue.toFixed(2)} CHF`;
  };

  const getConditionLabel = (condition: ProductCondition) => {
    switch (condition) {
      case ProductCondition.new_:
        return 'Neuf';
      case ProductCondition.veryGood:
        return 'Très bon état';
      case ProductCondition.good:
        return 'Bon état';
      case ProductCondition.used:
        return 'Porté quelques fois';
      default:
        return 'Bon état';
    }
  };

  const getRegionLabel = (region: Region) => {
    if (region.__kind__ === 'swissCanton') {
      switch (region.swissCanton) {
        case 'geneva': return 'Genève';
        case 'vaud': return 'Vaud';
        case 'valais': return 'Valais';
        case 'fribourg': return 'Fribourg';
        case 'neuchatel': return 'Neuchâtel';
        case 'jura': return 'Jura';
        default: return 'Genève';
      }
    } else {
      switch (region.frenchRegion) {
        case 'auvergneRhoneAlpes': return 'Auvergne-Rhône-Alpes';
        case 'bourgogneFrancheComte': return 'Bourgogne-Franche-Comté';
        case 'bretagne': return 'Bretagne';
        case 'centreValDeLoire': return 'Centre-Val de Loire';
        case 'corse': return 'Corse';
        case 'grandEst': return 'Grand Est';
        case 'hautsDeFrance': return 'Hauts-de-France';
        case 'ileDeFrance': return 'Ile-de-France';
        case 'normandie': return 'Normandie';
        case 'nouvelleAquitaine': return 'Nouvelle-Aquitaine';
        case 'occitanie': return 'Occitanie';
        case 'paysDeLaLoire': return 'Pays de la Loire';
        case 'provenceAlpesCoteAzur': return 'Provence-Alpes-Côte d\'Azur';
        default: return '';
      }
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Connecte-toi pour sauvegarder tes favoris');
      return;
    }
    try {
      await toggleFavorite.mutateAsync(listing.id);
    } catch (error) {
      toast.error('Oups, une erreur est survenue');
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  const handleContactSeller = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.error('Impossible de contacter la vendeuse : les informations du vendeur ne sont pas disponibles');
  };

  const handleCardClick = () => {
    setShowDetailDialog(true);
  };

  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-md transition-shadow border-marketplace/20 hover:border-marketplace/40 relative cursor-pointer"
        onClick={handleCardClick}
      >
        {listing.images.length > 0 && (
          <div className="aspect-video w-full overflow-hidden bg-muted relative group">
            <img 
              src={listing.images[currentImageIndex].getDirectURL()} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {listing.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {listing.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 hover:bg-background/90 backdrop-blur-sm z-10"
          onClick={handleToggleFavorite}
          disabled={toggleFavorite.isPending}
          title="Sauvegarder pour plus tard"
        >
          <Heart 
            className={`w-5 h-5 ${isFavorite ? 'fill-marketplace text-marketplace' : 'text-muted-foreground'}`}
          />
        </Button>

        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
          <div className="flex items-center gap-2 text-xl font-bold text-marketplace">
            <img src="/assets/generated/price-tag.dim_24x24.png" alt="" className="w-5 h-5" />
            {formatPrice(listing.price)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">{listing.description}</p>
          
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1 px-2 py-1 bg-marketplace/10 text-marketplace rounded-full">
              <img src="/assets/generated/condition-icon.dim_24x24.png" alt="" className="w-3 h-3" />
              <span>{getConditionLabel(listing.condition)}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-marketplace/10 text-marketplace rounded-full">
              <img src="/assets/generated/location-pin.dim_24x24.png" alt="" className="w-3 h-3" />
              <span>{getRegionLabel(listing.region)}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-marketplace/10 text-marketplace rounded-full">
              <img src="/assets/generated/age-filter.dim_24x24.png" alt="" className="w-3 h-3" />
              <span>{listing.ageGroup}</span>
            </div>
          </div>

          {listing.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {listing.categories.map((category) => (
                <span key={category} className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                  {category}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{listing.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimestamp(listing.timestamp)}</span>
            </div>
          </div>

          <Button 
            onClick={handleContactSeller}
            className="w-full bg-marketplace hover:bg-marketplace/90 gap-2"
            size="sm"
          >
            <img src="/assets/generated/contact-icon.dim_24x24.png" alt="" className="w-4 h-4" />
            Envoyer un message
          </Button>
        </CardContent>
      </Card>

      {showDetailDialog && (
        <ListingDetailDialog
          listing={listing}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          onViewProfile={onViewProfile}
        />
      )}
    </>
  );
}
