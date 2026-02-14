import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { LogIn } from 'lucide-react';

interface LoggedOutStateCardProps {
  title?: string;
  description?: string;
  actionText?: string;
}

export default function LoggedOutStateCard({ 
  title = "Connecte-toi pour continuer",
  description = "Pour accéder à cette fonctionnalité, il te suffit de te connecter.",
  actionText = "Se connecter"
}: LoggedOutStateCardProps) {
  const { login, loginStatus } = useInternetIdentity();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Card className="border-marketplace/20 bg-marketplace/5">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button 
          onClick={handleLogin}
          disabled={loginStatus === 'logging-in'}
          className="gap-2 bg-marketplace hover:bg-marketplace/90"
        >
          <LogIn className="w-4 h-4" />
          {loginStatus === 'logging-in' ? 'Connexion...' : actionText}
        </Button>
      </CardContent>
    </Card>
  );
}
