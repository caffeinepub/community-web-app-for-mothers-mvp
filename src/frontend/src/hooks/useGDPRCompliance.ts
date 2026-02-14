import { useState, useCallback } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from './useQueries';
import { toast } from 'sonner';

type PendingAction = {
  type: 'createPost' | 'createReply' | 'createListing' | 'sendMessage';
  execute: () => Promise<void>;
};

export function useGDPRCompliance() {
  const { data: userProfile } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [showRulesDialog, setShowRulesDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCompliant = useCallback(() => {
    if (!userProfile) return false;
    return userProfile.rulesAccepted && !!userProfile.email && userProfile.email.length > 0;
  }, [userProfile]);

  const checkComplianceAndExecute = useCallback(
    async (actionType: PendingAction['type'], action: () => Promise<void>) => {
      if (isCompliant()) {
        // User is compliant, execute action directly
        await action();
      } else {
        // User is not compliant, show rules dialog and store pending action
        setPendingAction({ type: actionType, execute: action });
        setShowRulesDialog(true);
      }
    },
    [isCompliant]
  );

  const handleAcceptRules = useCallback(
    async (email: string, marketingOptIn: boolean) => {
      if (!userProfile) {
        toast.error('Profil utilisateur non trouvé');
        return;
      }

      setIsSubmitting(true);

      try {
        // Update profile with GDPR compliance data
        const updatedProfile = {
          ...userProfile,
          email,
          rulesAccepted: true,
          marketingOptIn,
        };

        await saveProfile.mutateAsync(updatedProfile);
        
        setShowRulesDialog(false);
        toast.success('Merci ! Tu peux maintenant participer pleinement à la communauté');

        // Execute pending action if any
        if (pendingAction) {
          try {
            await pendingAction.execute();
          } catch (error: any) {
            // Error handling for the pending action
            const errorMessage = error?.message || 'Une erreur est survenue';
            toast.error(errorMessage);
          } finally {
            setPendingAction(null);
          }
        }
      } catch (error: any) {
        console.error('GDPR compliance error:', error);
        const errorMessage = error?.message || 'Échec de l\'enregistrement';
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [userProfile, saveProfile, pendingAction]
  );

  const handleCancelRules = useCallback(() => {
    setShowRulesDialog(false);
    setPendingAction(null);
  }, []);

  return {
    isCompliant: isCompliant(),
    showRulesDialog,
    isSubmitting,
    checkComplianceAndExecute,
    handleAcceptRules,
    handleCancelRules,
  };
}
