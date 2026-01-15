import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, User, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { type Listing, ProductCondition, Region } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsFavorite, useToggleFavorite } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Principal } from '@icp-sdk/core/principal';

interface ListingDetailDialogProps {
  listing: Listing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewProfile: (principal: Principal) => void;
}

export default function ListingDetailDialog({ 
  listing, 
  open, 
  onOpenChange,
  onViewProfile 
}: ListingDetailDialogProps) {
  const { identity } = useInternetIdentity();
  const { data: isFavorite = false } = useIsFavorite(listing.id);
  const toggleFavorite = useToggleFavorite();
  const isAuthenticated = !!identity;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
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
    switch (region) {
      case Region.geneva:
        return 'Genève';
      case Region.vaud:
        return 'Vaud';
      case Region.valais:
        return 'Valais';
      case Region.fribourg:
        return 'Fribourg';
      case Region.neuchatel:
        return 'Neuchâtel';
      case Region.jura:
        return 'Jura';
      default:
        return 'Genève';
    }
  };

  const handleToggleFavorite = async () => {
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

  const handleContactSeller = () => {
    toast.error('Impossible de contacter la vendeuse : les informations du vendeur ne sont pas disponibles');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{listing.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Carousel */}
          {listing.images.length > 0 && (
            <div className="aspect-video w-full overflow-hidden bg-muted relative group rounded-lg">
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {listing.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Price and Favorite */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-3xl font-bold text-marketplace">
              <img src="/assets/generated/price-tag.dim_24x24.png" alt="" className="w-7 h-7" />
              {formatPrice(listing.price)}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleFavorite}
              disabled={toggleFavorite.isPending}
              className="border-marketplace/20"
              title="Sauvegarder pour plus tard"
            >
              <Heart 
                className={`w-5 h-5 ${isFavorite ? 'fill-marketplace text-marketplace' : 'text-muted-foreground'}`}
              />
            </Button>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">État</h4>
                <div className="flex items-center gap-2 px-3 py-2 bg-marketplace/10 text-marketplace rounded-lg">
                  <img src="/assets/generated/condition-icon.dim_24x24.png" alt="" className="w-4 h-4" />
                  <span>{getConditionLabel(listing.condition)}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Région</h4>
                <div className="flex items-center gap-2 px-3 py-2 bg-marketplace/10 text-marketplace rounded-lg">
                  <img src="/assets/generated/location-pin.dim_24x24.png" alt="" className="w-4 h-4" />
                  <span>{getRegionLabel(listing.region)}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Âge</h4>
                <div className="flex items-center gap-2 px-3 py-2 bg-marketplace/10 text-marketplace rounded-lg">
                  <img src="/assets/generated/age-filter.dim_24x24.png" alt="" className="w-4 h-4" />
                  <span>{listing.ageGroup}</span>
                </div>
              </div>
            </div>

            {listing.categories.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Catégories</h4>
                <div className="flex flex-wrap gap-2">
                  {listing.categories.map((category) => (
                    <span key={category} className="px-3 py-1 bg-muted text-muted-foreground rounded-lg text-sm">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author and Timestamp */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{listing.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Posté {formatTimestamp(listing.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Contact Button */}
          <Button 
            onClick={handleContactSeller}
            className="w-full bg-marketplace hover:bg-marketplace/90 gap-2"
            size="lg"
          >
            <img src="/assets/generated/contact-icon.dim_24x24.png" alt="" className="w-5 h-5" />
            Envoyer un message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
