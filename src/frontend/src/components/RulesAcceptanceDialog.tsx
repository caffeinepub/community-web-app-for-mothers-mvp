import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle } from 'lucide-react';

interface RulesAcceptanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (email: string, marketingOptIn: boolean) => Promise<void>;
  isSubmitting: boolean;
}

export default function RulesAcceptanceDialog({ 
  open, 
  onOpenChange, 
  onAccept,
  isSubmitting 
}: RulesAcceptanceDialogProps) {
  const [email, setEmail] = useState('');
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Merci de fournir ton adresse email');
      return;
    }

    if (!validateEmail(email.trim())) {
      setEmailError('Merci de fournir une adresse email valide');
      return;
    }

    if (!rulesAccepted) {
      setEmailError('Tu dois accepter les règles pour continuer');
      return;
    }

    try {
      await onAccept(email.trim(), marketingOptIn);
      // Reset form on success
      setEmail('');
      setRulesAccepted(false);
      setMarketingOptIn(false);
      setEmailError('');
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleCancel = () => {
    setEmail('');
    setRulesAccepted(false);
    setMarketingOptIn(false);
    setEmailError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Avant de publier sur Nara</DialogTitle>
          <DialogDescription>
            Pour garantir un espace bienveillant et sécurisé, nous avons besoin de quelques informations.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rules Section */}
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg">Nos règles de communauté</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-marketplace mt-0.5">•</span>
                    <span><strong>Respect et non-jugement</strong> : Chaque parcours est unique, accueillons-nous avec bienveillance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-marketplace mt-0.5">•</span>
                    <span><strong>Aucun propos violent, discriminant ou culpabilisant</strong> : Nous sommes ici pour nous soutenir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-marketplace mt-0.5">•</span>
                    <span><strong>Pas de publicité ni de spam</strong> : Nara est un espace d'échange authentique</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-marketplace mt-0.5">•</span>
                    <span><strong>Respect de la vie privée et de la confidentialité</strong> : Ce qui est partagé ici reste entre nous</span>
                  </li>
                </ul>
                <a 
                  href="#" 
                  className="text-sm text-marketplace hover:underline inline-block"
                  onClick={(e) => e.preventDefault()}
                >
                  Lire les règles complètes →
                </a>
              </div>

              {/* Rules Acceptance Checkbox */}
              <div className="flex items-start space-x-3 p-4 rounded-lg border border-border">
                <Checkbox
                  id="rules-accepted"
                  checked={rulesAccepted}
                  onCheckedChange={(checked) => setRulesAccepted(checked as boolean)}
                  className="mt-1"
                />
                <label
                  htmlFor="rules-accepted"
                  className="text-sm font-medium leading-relaxed cursor-pointer"
                >
                  J'ai lu et j'accepte les règles de Nara *
                </label>
              </div>
            </div>

            {/* Email Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Ton adresse email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ton.email@exemple.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  className={emailError ? 'border-destructive' : ''}
                />
                {emailError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span>{emailError}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Ton email reste privé et ne sera jamais partagé avec d'autres membres.
                </p>
              </div>

              {/* Info about email usage */}
              <div className="bg-marketplace/5 border border-marketplace/20 rounded-lg p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  Les e-mails liés au fonctionnement de Nara (notifications de messages, mises à jour importantes) 
                  sont nécessaires pour utiliser la communauté.
                </p>
              </div>

              {/* Marketing Opt-in */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="marketing-opt-in"
                  checked={marketingOptIn}
                  onCheckedChange={(checked) => setMarketingOptIn(checked as boolean)}
                  className="mt-1"
                />
                <label
                  htmlFor="marketing-opt-in"
                  className="text-sm leading-relaxed cursor-pointer text-muted-foreground"
                >
                  Je souhaite recevoir des nouvelles et mises à jour de Nara (optionnel)
                </label>
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !rulesAccepted || !email.trim()}
            className="bg-marketplace hover:bg-marketplace/90"
          >
            {isSubmitting ? 'Enregistrement...' : 'Accepter et continuer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
