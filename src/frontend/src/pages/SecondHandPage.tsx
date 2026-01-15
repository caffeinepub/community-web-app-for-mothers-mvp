import { useState, useMemo, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllListings, useGetFavoritedListings } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Plus, Heart, Filter } from 'lucide-react';
import CreateListingDialog from '../components/CreateListingDialog';
import ListingCard from '../components/ListingCard';
import type { Principal } from '@icp-sdk/core/principal';

interface SecondHandPageProps {
  onViewProfile: (principal: Principal) => void;
  initialCategoryFilter?: string | null;
  onClearInitialFilter?: () => void;
}

export default function SecondHandPage({ onViewProfile, initialCategoryFilter, onClearInitialFilter }: SecondHandPageProps) {
  const { identity } = useInternetIdentity();
  const { data: listings = [], isLoading } = useGetAllListings();
  const { data: favoritedListings = [], isLoading: favoritesLoading } = useGetFavoritedListings();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const isAuthenticated = !!identity;

  // Apply initial category filter when provided
  useEffect(() => {
    if (initialCategoryFilter) {
      setSelectedCategory(initialCategoryFilter);
      if (onClearInitialFilter) {
        onClearInitialFilter();
      }
    }
  }, [initialCategoryFilter, onClearInitialFilter]);

  // Filter listings
  const filteredListings = useMemo(() => {
    let filtered = [...listings];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(listing => 
        listing.categories.includes(selectedCategory)
      );
    }

    if (selectedAgeGroup !== 'all') {
      filtered = filtered.filter(listing => 
        listing.ageGroup === selectedAgeGroup
      );
    }

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(listing => 
        listing.region === selectedRegion
      );
    }

    return filtered.sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [listings, selectedCategory, selectedAgeGroup, selectedRegion]);

  const sortedFavorites = [...favoritedListings].sort((a, b) => 
    Number(b.timestamp - a.timestamp)
  );

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedAgeGroup('all');
    setSelectedRegion('all');
  };

  return (
    <div className="w-full py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Échange entre mamans</h1>
            <p className="text-muted-foreground">Trouve ou partage des articles qui ont une histoire</p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)} 
            disabled={!isAuthenticated}
            className="gap-2 bg-marketplace hover:bg-marketplace/90"
          >
            <Plus className="w-4 h-4" />
            Partager un article
          </Button>
        </div>

        {!isAuthenticated && (
          <Card className="mb-6 border-marketplace/20 bg-marketplace/5">
            <CardHeader>
              <CardTitle className="text-lg">Connecte-toi pour partager</CardTitle>
              <CardDescription>
                Pour proposer des articles et sauvegarder tes favoris, il te suffit de te connecter.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Tabs for All Listings and Favorites */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="all" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Tous les articles
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2" disabled={!isAuthenticated}>
              <Heart className="w-4 h-4" />
              Sauvegardés
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {/* Filters */}
            <Card className="mb-6 border-marketplace/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-marketplace" />
                    <CardTitle className="text-lg">Filtres</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    className="text-marketplace hover:text-marketplace/80"
                  >
                    Tout effacer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <img src="/assets/generated/category-filter.dim_24x24.png" alt="" className="w-4 h-4" />
                      Catégorie
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        <SelectItem value="Vêtements">Vêtements</SelectItem>
                        <SelectItem value="Chaussures">Chaussures</SelectItem>
                        <SelectItem value="Jouets">Jouets</SelectItem>
                        <SelectItem value="Accessoires">Accessoires</SelectItem>
                        <SelectItem value="Livres">Livres</SelectItem>
                        <SelectItem value="Équipement bébé">Équipement bébé</SelectItem>
                        <SelectItem value="Autres">Autres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <img src="/assets/generated/age-filter.dim_24x24.png" alt="" className="w-4 h-4" />
                      Âge
                    </label>
                    <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les âges</SelectItem>
                        <SelectItem value="0-3 mois">0–3 mois</SelectItem>
                        <SelectItem value="3-6 mois">3–6 mois</SelectItem>
                        <SelectItem value="6-12 mois">6–12 mois</SelectItem>
                        <SelectItem value="1-2 ans">1–2 ans</SelectItem>
                        <SelectItem value="2-4 ans">2–4 ans</SelectItem>
                        <SelectItem value="4+ ans">4+ ans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <img src="/assets/generated/location-pin.dim_24x24.png" alt="" className="w-4 h-4" />
                      Région
                    </label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        <SelectItem value="geneva">Genève</SelectItem>
                        <SelectItem value="vaud">Vaud</SelectItem>
                        <SelectItem value="valais">Valais</SelectItem>
                        <SelectItem value="fribourg">Fribourg</SelectItem>
                        <SelectItem value="neuchatel">Neuchâtel</SelectItem>
                        <SelectItem value="jura">Jura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent className="pt-6">
                  <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Rien trouvé pour le moment</p>
                  <p className="text-sm text-muted-foreground">Essaie d'autres filtres ou sois la première à partager !</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <ListingCard 
                    key={listing.id.toString()} 
                    listing={listing}
                    onViewProfile={onViewProfile}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {favoritesLoading ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : sortedFavorites.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent className="pt-6">
                  <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Aucun article sauvegardé</p>
                  <p className="text-sm text-muted-foreground">Clique sur le cœur pour garder tes coups de cœur !</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedFavorites.map((listing) => (
                  <ListingCard 
                    key={listing.id.toString()} 
                    listing={listing}
                    onViewProfile={onViewProfile}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {showCreateDialog && (
        <CreateListingDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog} 
        />
      )}
    </div>
  );
}
