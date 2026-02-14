import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Conversation {
    id: bigint;
    participant1: Principal;
    participant2: Principal;
    messages: Array<Message>;
}
export interface Reply {
    id: bigint;
    content: string;
    isAnonymous: boolean;
    author: string;
    isHidden: boolean;
    timestamp: Time;
    postId: bigint;
}
export type Time = bigint;
export interface Listing {
    id: bigint;
    region: Region;
    categories: Array<string>;
    title: string;
    favorites: Array<Principal>;
    description: string;
    author: string;
    timestamp: Time;
    price: bigint;
    ageGroup: string;
    condition: ProductCondition;
    images: Array<ExternalBlob>;
}
export interface AdminModerationItem {
    id: bigint;
    contentId: bigint;
    reportCount: bigint;
    contentType: string;
    author: string;
    timestamp: Time;
    excerpt: string;
}
export type Region = {
    __kind__: "swissCanton";
    swissCanton: SwissCanton;
} | {
    __kind__: "frenchRegion";
    frenchRegion: FrenchRegion;
};
export interface AdminReportedContent {
    id: bigint;
    contentId: bigint;
    content: string;
    reportCount: bigint;
    contentType: AdminReportType;
    author: string;
    isHidden: boolean;
    timestamp: Time;
}
export interface AdminStats {
    franceUsers: bigint;
    totalForumPosts: bigint;
    activeListings: bigint;
    reportedContentCount: bigint;
    totalUsers: bigint;
    switzerlandUsers: bigint;
    totalComments: bigint;
    newUsersLast7Days: bigint;
}
export interface Post {
    id: bigint;
    content: string;
    isAnonymous: boolean;
    author: string;
    isHidden: boolean;
    timestamp: Time;
    category: Category;
}
export interface AdminActivityEntry {
    id: bigint;
    activityType: AdminActivityType;
    content: string;
    author: string;
    timestamp: Time;
}
export interface Message {
    id: bigint;
    content: string;
    sender: Principal;
    timestamp: Time;
    receiver: Principal;
}
export interface UserProfile {
    bio?: string;
    region?: Region;
    status: MotherhoodStatus;
    country?: Country;
    favorites: Array<bigint>;
    marketingOptIn: boolean;
    listings: Array<bigint>;
    name: string;
    email?: string;
    rulesAccepted: boolean;
    posts: Array<bigint>;
    profilePicture?: ExternalBlob;
    registrationTime: Time;
}
export enum AdminActivityType {
    secondHandListing = "secondHandListing",
    forumPost = "forumPost",
    comment = "comment",
    userRegistration = "userRegistration"
}
export enum AdminReportType {
    post = "post",
    comment = "comment"
}
export enum Category {
    postpartum = "postpartum",
    sleep = "sleep",
    mentalLoad = "mentalLoad",
    organization = "organization",
    pregnancy = "pregnancy"
}
export enum Country {
    france = "france",
    switzerland = "switzerland"
}
export enum FrenchRegion {
    bourgogneFrancheComte = "bourgogneFrancheComte",
    corse = "corse",
    auvergneRhoneAlpes = "auvergneRhoneAlpes",
    centreValDeLoire = "centreValDeLoire",
    paysDeLaLoire = "paysDeLaLoire",
    hautsDeFrance = "hautsDeFrance",
    normandie = "normandie",
    ileDeFrance = "ileDeFrance",
    occitanie = "occitanie",
    nouvelleAquitaine = "nouvelleAquitaine",
    provenceAlpesCoteAzur = "provenceAlpesCoteAzur",
    bretagne = "bretagne",
    grandEst = "grandEst"
}
export enum MotherhoodStatus {
    adultChildren = "adultChildren",
    postpartum = "postpartum",
    tryingToConceive = "tryingToConceive",
    youngChildren = "youngChildren",
    teenChildren = "teenChildren",
    pregnant = "pregnant"
}
export enum ProductCondition {
    new_ = "new",
    veryGood = "veryGood",
    good = "good",
    used = "used"
}
export enum SwissCanton {
    fribourg = "fribourg",
    jura = "jura",
    vaud = "vaud",
    valais = "valais",
    geneva = "geneva",
    neuchatel = "neuchatel"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminGetAllContentForModeration(): Promise<Array<AdminModerationItem>>;
    adminGetRecentActivity(): Promise<Array<AdminActivityEntry>>;
    adminGetReportedContent(): Promise<Array<AdminReportedContent>>;
    adminGetStats(): Promise<AdminStats>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(title: string, description: string, price: bigint, condition: ProductCondition, region: Region, categories: Array<string>, ageGroup: string, images: Array<ExternalBlob>): Promise<bigint>;
    createPost(category: Category, content: string, isAnonymous: boolean): Promise<bigint>;
    createReply(postId: bigint, content: string, isAnonymous: boolean): Promise<bigint>;
    getAllConversations(): Promise<Array<Conversation>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(participant: Principal): Promise<Conversation | null>;
    getCurrentPrincipalId(): Promise<string>;
    getFavoritedListings(): Promise<Array<Listing>>;
    getPublicAllListings(): Promise<Array<Listing>>;
    getPublicAllPosts(): Promise<Array<Post>>;
    getPublicListing(listingId: bigint): Promise<Listing>;
    getPublicListingsByCondition(condition: ProductCondition): Promise<Array<Listing>>;
    getPublicListingsByRegion(region: Region): Promise<Array<Listing>>;
    getPublicPost(postId: bigint): Promise<Post>;
    getPublicPostsByCategory(category: Category): Promise<Array<Post>>;
    getRepliesByPost(postId: bigint): Promise<Array<Reply>>;
    getUserActivity(user: Principal): Promise<{
        listings: Array<Listing>;
        posts: Array<Post>;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isFavorite(listingId: bigint): Promise<boolean>;
    reportContent(contentType: AdminReportType, contentId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(receiver: Principal, content: string): Promise<bigint>;
    toggleFavorite(listingId: bigint): Promise<boolean>;
}
