import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Heart, Home, MessageSquare, ShoppingBag } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('home')}>
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <span className="text-xl font-semibold text-foreground">Nara</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={activeTab === 'home' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('home')}
              className="gap-2 font-heading"
            >
              <Home className="w-4 h-4" />
              Accueil
            </Button>
            <Button
              variant={activeTab === 'forum' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('forum')}
              className="gap-2 font-heading"
            >
              <MessageSquare className="w-4 h-4" />
              Forum
            </Button>
            <Button
              variant={activeTab === 'secondhand' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('secondhand')}
              className="gap-2 font-heading"
            >
              <ShoppingBag className="w-4 h-4" />
              Seconde Main
            </Button>
            {isAuthenticated && (
              <Button
                variant={activeTab === 'myprofile' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('myprofile')}
                className="gap-2 font-heading"
              >
                <img 
                  src="/assets/generated/profile-icon-fine.dim_24x24.png" 
                  alt="" 
                  className="w-4 h-4"
                />
                Mon profil
              </Button>
            )}
          </nav>

          {/* Auth & Profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated && userProfile && (
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(userProfile.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{userProfile.name}</span>
              </div>
            )}
            <Button
              onClick={handleAuth}
              disabled={disabled}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
            >
              {disabled ? 'Chargement...' : isAuthenticated ? 'Déconnexion' : 'Connexion'}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          <Button
            variant={activeTab === 'home' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('home')}
            className="gap-2 flex-shrink-0 font-heading"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Button>
          <Button
            variant={activeTab === 'forum' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('forum')}
            className="gap-2 flex-shrink-0 font-heading"
          >
            <MessageSquare className="w-4 h-4" />
            Forum
          </Button>
          <Button
            variant={activeTab === 'secondhand' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('secondhand')}
            className="gap-2 flex-shrink-0 font-heading"
          >
            <ShoppingBag className="w-4 h-4" />
            Seconde Main
          </Button>
          {isAuthenticated && (
            <Button
              variant={activeTab === 'myprofile' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('myprofile')}
              className="gap-2 flex-shrink-0 font-heading"
            >
              <img 
                src="/assets/generated/profile-icon-fine.dim_24x24.png" 
                alt="" 
                className="w-4 h-4"
              />
              Mon profil
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
