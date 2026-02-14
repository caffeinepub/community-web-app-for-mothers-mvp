import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { useGetConversation, useSendMessage, useGetUserProfile, useGetAllConversations, useGetCallerUserProfile } from '../hooks/useQueries';
import { useGDPRCompliance } from '../hooks/useGDPRCompliance';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { Principal } from '@icp-sdk/core/principal';
import RulesAcceptanceDialog from '../components/RulesAcceptanceDialog';
import { Country } from '../backend';

interface ChatPageProps {
  otherUserPrincipal: Principal | null;
  onBack: () => void;
}

export default function ChatPage({ otherUserPrincipal, onBack }: ChatPageProps) {
  const { identity } = useInternetIdentity();
  const { data: conversation, isLoading } = useGetConversation(otherUserPrincipal);
  const { data: otherUserProfile } = useGetUserProfile(otherUserPrincipal);
  const { data: currentUserProfile } = useGetCallerUserProfile();
  const { data: allConversations } = useGetAllConversations();
  const sendMessage = useSendMessage();
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { 
    showRulesDialog, 
    isSubmitting, 
    checkComplianceAndExecute, 
    handleAcceptRules, 
    handleCancelRules 
  } = useGDPRCompliance();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !otherUserPrincipal) {
      return;
    }

    const executeSendMessage = async () => {
      await sendMessage.mutateAsync({
        receiver: otherUserPrincipal,
        content: messageText.trim(),
      });
      setMessageText('');
    };

    try {
      await checkComplianceAndExecute('sendMessage', executeSendMessage);
    } catch (error: any) {
      const errorMessage = error?.message || 'Erreur lors de l\'envoi du message';
      toast.error(errorMessage);
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (!identity || !otherUserPrincipal) {
    return (
      <div className="w-full py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Merci de te connecter pour accéder au chat</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if Swiss user has no conversations
  const isSwitzerland = currentUserProfile?.country === Country.switzerland;
  const hasNoConversations = isSwitzerland && (!allConversations || allConversations.length === 0);

  return (
    <>
      <div className="w-full py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>

          <Card className="border-marketplace/20">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <img src="/assets/generated/chat-icon.dim_24x24.png" alt="" className="w-6 h-6" />
                Conversation avec {otherUserProfile?.name || 'Utilisateur'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Chargement de la conversation...</p>
                  </div>
                ) : hasNoConversations ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <MessageCircle className="w-16 h-16 text-marketplace/30 mb-4" />
                    <p className="text-lg text-muted-foreground text-center">
                      Tu n'as pas encore contacté de vendeuse pour un article.
                    </p>
                  </div>
                ) : !conversation || conversation.messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun message pour le moment</p>
                    <p className="text-sm text-muted-foreground mt-2">Envoie un message pour commencer la conversation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversation.messages.map((message) => {
                      const isOwnMessage = message.sender.toString() === identity.getPrincipal().toString();
                      return (
                        <div
                          key={message.id.toString()}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-marketplace text-marketplace-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p className="text-sm break-words">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatTimestamp(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="border-t border-border/50 p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Écris ton message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={sendMessage.isPending}
                  />
                  <Button
                    type="submit"
                    disabled={!messageText.trim() || sendMessage.isPending}
                    className="bg-marketplace hover:bg-marketplace/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <RulesAcceptanceDialog
        open={showRulesDialog}
        onOpenChange={handleCancelRules}
        onAccept={handleAcceptRules}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
