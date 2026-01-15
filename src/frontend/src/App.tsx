import { useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ForumPage from './pages/ForumPage';
import SecondHandPage from './pages/SecondHandPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import { Heart } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedUserPrincipal, setSelectedUserPrincipal] = useState<Principal | null>(null);
  const [selectedChatPrincipal, setSelectedChatPrincipal] = useState<Principal | null>(null);
  const [secondHandCategoryFilter, setSecondHandCategoryFilter] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleViewProfile = (principal: Principal) => {
    setSelectedUserPrincipal(principal);
    setActiveTab('profile');
  };

  const handleOpenChat = (principal: Principal) => {
    setSelectedChatPrincipal(principal);
    setActiveTab('chat');
  };

  const handleTabChange = (tab: string) => {
    // When navigating to "myprofile", set selectedUserPrincipal to null to show own profile
    if (tab === 'myprofile') {
      setSelectedUserPrincipal(null);
      setActiveTab('profile');
    } else {
      setActiveTab(tab);
    }
  };

  const handleNavigateToSecondHand = (category?: string) => {
    setSecondHandCategoryFilter(category || null);
    setActiveTab('secondhand');
  };

  // Show loading state while checking authentication
  if (profileLoading && !isFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Heart className="w-12 h-12 mx-auto text-primary animate-pulse" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="flex-1">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsContent value="home" className="mt-0">
            <HomePage 
              onNavigateToForum={() => setActiveTab('forum')}
              onNavigateToSecondHand={handleNavigateToSecondHand}
            />
          </TabsContent>
          
          <TabsContent value="forum" className="mt-0">
            <ForumPage />
          </TabsContent>
          
          <TabsContent value="secondhand" className="mt-0">
            <SecondHandPage 
              onViewProfile={handleViewProfile}
              initialCategoryFilter={secondHandCategoryFilter}
              onClearInitialFilter={() => setSecondHandCategoryFilter(null)}
            />
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <ProfilePage 
              userPrincipal={selectedUserPrincipal} 
              onOpenChat={handleOpenChat}
              onBack={() => setActiveTab('secondhand')}
              onViewProfile={handleViewProfile}
            />
          </TabsContent>

          <TabsContent value="chat" className="mt-0">
            <ChatPage 
              otherUserPrincipal={selectedChatPrincipal}
              onBack={() => setActiveTab('profile')}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      
      {showProfileSetup && <ProfileSetupDialog />}
      <Toaster />
    </div>
  );
}
