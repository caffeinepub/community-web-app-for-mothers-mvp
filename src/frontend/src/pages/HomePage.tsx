import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageSquare, Users, Shield, Sparkles } from 'lucide-react';

interface HomePageProps {
  onNavigateToForum: () => void;
  onNavigateToSecondHand: (category?: string) => void;
}

export default function HomePage({ onNavigateToForum, onNavigateToSecondHand }: HomePageProps) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-marketplace/10 to-background border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-marketplace/20 text-marketplace text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Un espace rien qu'à nous
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Un espace doux et bienveillant pour les mères
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Tu n'es pas seule. Ici, on partage nos joies, nos doutes et nos petites victoires du quotidien. 
              Parce qu'être maman, c'est magnifique... et parfois épuisant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={onNavigateToForum} className="gap-2 bg-marketplace hover:bg-marketplace/90">
                <MessageSquare className="w-5 h-5" />
                Rejoins la conversation
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-marketplace/30 hover:bg-marketplace/5">
                <Users className="w-5 h-5" />
                Découvre la communauté
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ce qu'on fait ensemble
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un endroit pour échanger, s'entraider et se sentir comprise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-marketplace/20 hover:border-marketplace/50 transition-colors hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 rounded-lg bg-marketplace/20 flex items-center justify-center mb-4 mx-auto">
                  <img src="/assets/generated/mouth-icon.dim_64x64.png" alt="Parle librement" className="w-12 h-12" />
                </div>
                <CardTitle>Parle librement</CardTitle>
                <CardDescription>
                  Pose tes questions, raconte ton quotidien. Ici, pas de jugement, juste de l'écoute.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Partage avec ton nom ou anonymement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Des sujets qui te parlent vraiment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Des réponses de mamans qui comprennent</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-marketplace/20 hover:border-marketplace/50 transition-colors hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 rounded-lg bg-marketplace/20 flex items-center justify-center mb-4 mx-auto">
                  <img src="/assets/generated/recycling-icon.dim_64x64.png" alt="Donne une seconde vie" className="w-12 h-12" />
                </div>
                <CardTitle>Donne une seconde vie</CardTitle>
                <CardDescription>
                  Ce petit body devenu trop petit ? Partage-le avec une autre maman.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Montre tes articles en quelques photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Trouve ce qu'il te faut près de chez toi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Discute directement avec les mamans</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-marketplace/20 hover:border-marketplace/50 transition-colors hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 mx-auto shadow-sm">
                  <img src="/assets/generated/heart-confidence-icon.dim_64x64.png" alt="En toute confiance" className="w-12 h-12" />
                </div>
                <CardTitle>En toute confiance</CardTitle>
                <CardDescription>
                  Un espace bienveillant où chaque maman compte.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Connexion sécurisée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Tes infos restent privées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-marketplace mt-0.5 flex-shrink-0" />
                    <span>Une communauté respectueuse</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-24 bg-marketplace/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Les sujets qui nous touchent
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trouve les discussions qui résonnent avec ton vécu.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {[
              { name: 'Grossesse', desc: 'Ces 9 mois uniques' },
              { name: 'Post-partum', desc: 'Les premiers temps' },
              { name: 'Sommeil', desc: 'Nuits courtes et siestes' },
              { name: 'Organisation', desc: 'Le quotidien à gérer' },
              { name: 'Charge Mentale', desc: 'Prendre soin de soi' },
            ].map((category) => (
              <Card key={category.name} className="text-center hover:shadow-md transition-shadow cursor-pointer border-marketplace/20 hover:border-marketplace/40">
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription className="text-xs">{category.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seconde Main Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Seconde Main
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvre les trésors partagés par la communauté.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card 
              className="text-center hover:shadow-lg transition-all cursor-pointer border-marketplace/20 hover:border-marketplace/50 group"
              onClick={() => onNavigateToSecondHand('Vêtements')}
            >
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 rounded-lg bg-marketplace/20 flex items-center justify-center mx-auto group-hover:bg-marketplace/30 transition-colors">
                  <img src="/assets/generated/clothes-icon.dim_24x24.png" alt="Vêtements" className="w-10 h-10" />
                </div>
                <CardTitle className="text-lg">Vêtements</CardTitle>
              </CardHeader>
            </Card>

            <Card 
              className="text-center hover:shadow-lg transition-all cursor-pointer border-marketplace/20 hover:border-marketplace/50 group"
              onClick={() => onNavigateToSecondHand('Chaussures')}
            >
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 rounded-lg bg-marketplace/20 flex items-center justify-center mx-auto group-hover:bg-marketplace/30 transition-colors">
                  <img src="/assets/generated/shoes-icon.dim_24x24.png" alt="Chaussures" className="w-10 h-10" />
                </div>
                <CardTitle className="text-lg">Chaussures</CardTitle>
              </CardHeader>
            </Card>

            <Card 
              className="text-center hover:shadow-lg transition-all cursor-pointer border-marketplace/20 hover:border-marketplace/50 group"
              onClick={() => onNavigateToSecondHand('Jouets')}
            >
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto group-hover:shadow-md transition-all shadow-sm">
                  <img src="/assets/generated/toys-icon.dim_24x24.png" alt="Jouets" className="w-10 h-10" />
                </div>
                <CardTitle className="text-lg">Jouets</CardTitle>
              </CardHeader>
            </Card>

            <Card 
              className="text-center hover:shadow-lg transition-all cursor-pointer border-marketplace/20 hover:border-marketplace/50 group"
              onClick={() => onNavigateToSecondHand()}
            >
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto group-hover:shadow-md transition-all shadow-sm">
                  <img src="/assets/generated/heart-outline.dim_24x24.png" alt="Tout découvrir" className="w-10 h-10" />
                </div>
                <CardTitle className="text-lg">Tout découvrir</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-marketplace/20 to-marketplace/10 border-marketplace/30">
            <CardHeader className="text-center space-y-4 pb-8">
              <CardTitle className="text-3xl sm:text-4xl">Prête à nous rejoindre ?</CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                Viens échanger avec des mamans qui vivent les mêmes choses que toi.
              </CardDescription>
              <Button size="lg" onClick={onNavigateToForum} className="gap-2 bg-marketplace hover:bg-marketplace/90">
                <MessageSquare className="w-5 h-5" />
                C'est parti
              </Button>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}
