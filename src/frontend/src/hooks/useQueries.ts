import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Category, ProductCondition, Region, type Post, type Reply, type Listing, type UserProfile, type Conversation, type Message } from '../backend';
import { ExternalBlob } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
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
      return actor.getUserProfile(userPrincipal);
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
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

// Forum Queries
export function useGetAllPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPostsByCategory(category: Category) {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['posts', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPostsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPost(postId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Post | null>({
    queryKey: ['post', postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return null;
      return actor.getPost(postId);
    },
    enabled: !!actor && !isFetching && postId !== null,
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
      return actor.getRepliesByPost(postId);
    },
    enabled: !!actor && !isFetching && postId !== null,
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

// Listing Queries
export function useGetAllListings() {
  const { actor, isFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ['listings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFavoritedListings() {
  const { actor, isFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ['favoritedListings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFavoritedListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsFavorite(listingId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isFavorite', listingId.toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isFavorite(listingId);
    },
    enabled: !!actor && !isFetching,
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
      return actor.getConversation(participant);
    },
    enabled: !!actor && !isFetching && !!participant,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });
}

export function useGetAllConversations() {
  const { actor, isFetching } = useActor();

  return useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllConversations();
    },
    enabled: !!actor && !isFetching,
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
