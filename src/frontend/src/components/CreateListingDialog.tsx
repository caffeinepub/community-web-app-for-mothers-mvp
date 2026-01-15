import { useState } from 'react';
import { useCreateListing } from '../hooks/useQueries';
import { ProductCondition, Region } from '../backend';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateListingDialog({ open, onOpenChange }: CreateListingDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ProductCondition>(ProductCondition.good);
  const [region, setRegion] = useState<Region>(Region.geneva);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [ageGroup, setAgeGroup] = useState('0-3 mois');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const createListing = useCreateListing();

  const categories = ['Vêtements', 'Chaussures', 'Jouets', 'Accessoires', 'Livres', 'Équipement bébé', 'Autres'];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalFiles = imageFiles.length + files.length;
    if (totalFiles > 5) {
      toast.error('Maximum 5 photos');
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Chaque photo doit faire moins de 5 Mo');
        return;
      }
    }

    setImageFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Donne un titre à ton article');
      return;
    }

    if (!description.trim()) {
      toast.error('Ajoute une petite description');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error('Le prix n\'est pas valide');
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error('Choisis au moins une catégorie');
      return;
    }

    if (imageFiles.length === 0) {
      toast.error('Ajoute au moins une photo');
      return;
    }

    try {
      const imageBlobs: ExternalBlob[] = [];
      
      for (const file of imageFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
        imageBlobs.push(blob);
      }

      await createListing.mutateAsync({ 
        title: title.trim(), 
        description: description.trim(),
        price: BigInt(Math.round(priceValue * 100)),
        condition,
        region,
        categories: selectedCategories,
        ageGroup,
        images: imageBlobs
      });
      
      toast.success('Ton article est en ligne !');
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setCondition(ProductCondition.good);
      setRegion(Region.geneva);
      setSelectedCategories([]);
      setAgeGroup('0-3 mois');
      setImageFiles([]);
      setImagePreviews([]);
      setUploadProgress(0);
    } catch (error) {
      toast.error('Oups, une erreur est survenue. Réessaie ?');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Partage un article</DialogTitle>
          <DialogDescription>
            Quelques infos et c'est parti.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder="ex : Porte-bébé ergonomique"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Dis-nous comment tu l'as utilisé, dans quel état il est... Quelques mots suffisent."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (CHF) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">État *</Label>
              <Select value={condition} onValueChange={(value) => setCondition(value as ProductCondition)}>
                <SelectTrigger id="condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProductCondition.new_}>Neuf</SelectItem>
                  <SelectItem value={ProductCondition.veryGood}>Très bon état</SelectItem>
                  <SelectItem value={ProductCondition.good}>Bon état</SelectItem>
                  <SelectItem value={ProductCondition.used}>Porté quelques fois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Région *</Label>
              <Select value={region} onValueChange={(value) => setRegion(value as Region)}>
                <SelectTrigger id="region">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Region.geneva}>Genève</SelectItem>
                  <SelectItem value={Region.vaud}>Vaud</SelectItem>
                  <SelectItem value={Region.valais}>Valais</SelectItem>
                  <SelectItem value={Region.fribourg}>Fribourg</SelectItem>
                  <SelectItem value={Region.neuchatel}>Neuchâtel</SelectItem>
                  <SelectItem value={Region.jura}>Jura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageGroup">Âge *</Label>
              <Select value={ageGroup} onValueChange={setAgeGroup}>
                <SelectTrigger id="ageGroup">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-3 mois">0–3 mois</SelectItem>
                  <SelectItem value="3-6 mois">3–6 mois</SelectItem>
                  <SelectItem value="6-12 mois">6–12 mois</SelectItem>
                  <SelectItem value="1-2 ans">1–2 ans</SelectItem>
                  <SelectItem value="2-4 ans">2–4 ans</SelectItem>
                  <SelectItem value="4+ ans">4+ ans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Catégories * (au moins une)</Label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                  />
                  <label
                    htmlFor={category}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photos * (1 à 5 photos, max 5 Mo chacune)</Label>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img 
                      src={preview} 
                      alt={`Aperçu ${index + 1}`} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {imagePreviews.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {imagePreviews.length === 0 ? 'Ajoute des photos' : 'Ajouter d\'autres photos'}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {imagePreviews.length}/5 photos
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </label>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-marketplace h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createListing.isPending} className="bg-marketplace hover:bg-marketplace/90">
              {createListing.isPending ? 'Envoi en cours...' : 'Publier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
