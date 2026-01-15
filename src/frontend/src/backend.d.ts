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
export interface Reply {
    id: bigint;
    content: string;
    isAnonymous: boolean;
    author: string;
    timestamp: Time;
    postId: bigint;
}
export type Time = bigint;
export interface Listing {
    id: bigint;
    region: Region;
    categories: Array<string>;
    title: string;
    description: string;
    author: string;
    timestamp: Time;
    price: bigint;
    ageGroup: string;
    condition: ProductCondition;
    images: Array<ExternalBlob>;
}
export interface Post {
    id: bigint;
    content: string;
    isAnonymous: boolean;
    author: string;
    timestamp: Time;
    category: Category;
}
export interface Message {
    id: bigint;
    content: string;
    sender: Principal;
    timestamp: Time;
    receiver: Principal;
}
export interface Conversation {
    id: bigint;
    participant1: Principal;
    participant2: Principal;
    messages: Array<Message>;
}
export interface UserProfile {
    bio?: string;
    status: MotherhoodStatus;
    favorites: Array<bigint>;
    name: string;
    profilePicture?: ExternalBlob;
    location?: Region;
}
export enum Category {
    postpartum = "postpartum",
    sleep = "sleep",
    mentalLoad = "mentalLoad",
    organization = "organization",
    pregnancy = "pregnancy"
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
export enum Region {
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(title: string, description: string, price: bigint, condition: ProductCondition, region: Region, categories: Array<string>, ageGroup: string, images: Array<ExternalBlob>): Promise<bigint>;
    createPost(category: Category, content: string, isAnonymous: boolean): Promise<bigint>;
    createReply(postId: bigint, content: string, isAnonymous: boolean): Promise<bigint>;
    getAllConversations(): Promise<Array<Conversation>>;
    getAllListings(): Promise<Array<Listing>>;
    getAllPosts(): Promise<Array<Post>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(participant: Principal): Promise<Conversation | null>;
    getFavoritedListings(): Promise<Array<Listing>>;
    getListing(listingId: bigint): Promise<Listing>;
    getListingCount(): Promise<bigint>;
    getListingsByCondition(condition: ProductCondition): Promise<Array<Listing>>;
    getListingsByRegion(region: Region): Promise<Array<Listing>>;
    getPost(postId: bigint): Promise<Post>;
    getPostsByCategory(category: Category): Promise<Array<Post>>;
    getRepliesByPost(postId: bigint): Promise<Array<Reply>>;
    getUserActivity(user: Principal): Promise<{
        listings: Array<Listing>;
        posts: Array<Post>;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isFavorite(listingId: bigint): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(receiver: Principal, content: string): Promise<bigint>;
    toggleFavorite(listingId: bigint): Promise<boolean>;
}
