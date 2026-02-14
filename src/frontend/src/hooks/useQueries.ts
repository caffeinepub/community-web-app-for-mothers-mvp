import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Category, ProductCondition, Region, AdminReportType, type Post, type Reply, type Listing, type UserProfile, type Conversation, type Message, type AdminReportedContent, type AdminActivityEntry, type AdminStats, type AdminModerationItem } from '../backend';
import { ExternalBlob } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// Helper to detect authorization errors
function isAuthError(error: any): boolean {
  const message = error?.message || '';
  return message.includes('Non autorisé') || 
         message.includes('seuls les utilisateurs') || 
         message.includes('seuls les membres') ||
         message.includes('seuls les administrateurs');
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch (error) {
        if (isAuthError(error)) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(userPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      try {
        return await actor.getUserProfile(userPrincipal);
      } catch (error) {
        if (isAuthError(error)) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
    retry: false,
  });
}

export function useGetCurrentPrincipalId() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['currentPrincipalId'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCurrentPrincipalId();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userActivity'] });
    },
  });
}

// Forum Queries - using public endpoints
export function useGetAllPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPublicAllPosts();
      } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useGetPostsByCategory(category: Category) {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['posts', category],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPublicPostsByCategory(category);
      } catch (error) {
        console.error('Error fetching posts by category:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useGetPost(postId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Post | null>({
    queryKey: ['post', postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return null;
      try {
        return await actor.getPublicPost(postId);
      } catch (error) {
        console.error('Error fetching post:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && postId !== null,
    retry: 1,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ category, content, isAnonymous }: { category: Category; content: string; isAnonymous: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPost(category, content, isAnonymous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['userActivity'] });
    },
  });
}

// Reply Queries
export function useGetRepliesByPost(postId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Reply[]>({
    queryKey: ['replies', postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return [];
      try {
        return await actor.getRepliesByPost(postId);
      } catch (error) {
        console.error('Error fetching replies:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && postId !== null,
    retry: 1,
  });
}

export function useCreateReply() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content, isAnonymous }: { postId: bigint; content: string; isAnonymous: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createReply(postId, content, isAnonymous);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['replies', variables.postId.toString()] });
    },
  });
}

export function useReportContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentType, contentId }: { contentType: 'post' | 'comment'; contentId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      const reportType = contentType === 'post' ? AdminReportType.post : AdminReportType.comment;
      return actor.reportContent(reportType, contentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReportedContent'] });
      queryClient.invalidateQueries({ queryKey: ['adminModeration'] });
    },
  });
}

// Listing Queries - using public endpoints
export function useGetAllListings() {
  const { actor, isFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ['listings'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPublicAllListings();
      } catch (error) {
        console.error('Error fetching listings:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useGetFavoritedListings() {
  const { actor, isFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ['favoritedListings'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getFavoritedListings();
      } catch (error) {
        if (isAuthError(error)) {
          return [];
        }
        console.error('Error fetching favorited listings:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useIsFavorite(listingId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isFavorite', listingId.toString()],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isFavorite(listingId);
      } catch (error) {
        if (isAuthError(error)) {
          return false;
        }
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useToggleFavorite() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleFavorite(listingId);
    },
    onSuccess: (_, listingId) => {
      queryClient.invalidateQueries({ queryKey: ['isFavorite', listingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['favoritedListings'] });
    },
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      title, 
      description, 
      price, 
      condition, 
      region,
      categories,
      ageGroup,
      images
    }: { 
      title: string; 
      description: string; 
      price: bigint;
      condition: ProductCondition;
      region: Region;
      categories: string[];
      ageGroup: string;
      images: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createListing(title, description, price, condition, region, categories, ageGroup, images);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['userActivity'] });
    },
  });
}

// Chat Queries
export function useGetConversation(participant: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Conversation | null>({
    queryKey: ['conversation', participant?.toString()],
    queryFn: async () => {
      if (!actor || !participant) return null;
      try {
        return await actor.getConversation(participant);
      } catch (error) {
        if (isAuthError(error)) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!participant,
    refetchInterval: 3000,
    retry: false,
  });
}

export function useGetAllConversations() {
  const { actor, isFetching } = useActor();

  return useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllConversations();
      } catch (error) {
        if (isAuthError(error)) {
          return [];
        }
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiver, content }: { receiver: Principal; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(receiver, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.receiver.toString()] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Admin Queries
export function useIsAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isAdmin();
      } catch (error) {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAdminGetAllContentForModeration() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminModerationItem[]>({
    queryKey: ['adminModeration'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.adminGetAllContentForModeration();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAdminGetPostDetails(postId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Post | null>({
    queryKey: ['adminPostDetails', postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return null;
      try {
        return await actor.getPublicPost(postId);
      } catch (error) {
        console.error('Error fetching post details:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && postId !== null,
    retry: false,
  });
}

export function useAdminGetListingDetails(listingId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Listing | null>({
    queryKey: ['adminListingDetails', listingId?.toString()],
    queryFn: async () => {
      if (!actor || listingId === null) return null;
      try {
        return await actor.getPublicListing(listingId);
      } catch (error) {
        console.error('Error fetching listing details:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && listingId !== null,
    retry: false,
  });
}

export function useAdminGetReportedContent() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminReportedContent[]>({
    queryKey: ['adminReportedContent'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.adminGetReportedContent();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAdminGetRecentActivity() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminActivityEntry[]>({
    queryKey: ['adminRecentActivity'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.adminGetRecentActivity();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAdminGetStats() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.adminGetStats();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// Note: Backend doesn't have hide/delete methods, using report as moderation action
export function useAdminHidePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have hide method, report instead
      return actor.reportContent(AdminReportType.post, postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminModeration'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['adminPostDetails'] });
    },
  });
}

export function useAdminDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have delete method, report instead
      return actor.reportContent(AdminReportType.post, postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminModeration'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useAdminDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have delete method for listings
      throw new Error('Delete listing not implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminModeration'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
