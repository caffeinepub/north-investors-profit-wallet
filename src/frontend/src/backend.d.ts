import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Activity {
    id: bigint;
    status: ActivityStatus;
    activityType: ActivityType;
    description: string;
    timestamp: Time;
    amount: number;
}
export type Time = bigint;
export interface MarketPrices {
    ethPriceUSD: number;
    lastUpdated: Time;
    btcPriceUSD: number;
}
export interface PlatformStats {
    communityMembers: bigint;
    totalUSDBalance: number;
    totalBTC: number;
    registeredInvestors: bigint;
    featuredBitcoinAddress: string;
}
export interface UserProfile {
    displayName: string;
    gmail: string;
}
export enum ActivityStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum ActivityType {
    deposit = "deposit",
    withdrawal = "withdrawal",
    referralBonus = "referralBonus",
    interestPayment = "interestPayment"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addActivity(amount: number, activityType: ActivityType, description: string): Promise<{
        id: bigint;
        timestamp: Time;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getActivityById(activityId: bigint): Promise<Activity>;
    getAllActivities(): Promise<Array<Activity>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMarketPrices(): Promise<MarketPrices>;
    getPlatformStats(): Promise<PlatformStats>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    incrementCommunityMemberCount(): Promise<void>;
    incrementInvestorCount(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    registerUserProfile(displayName: string, gmail: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateActivityStatus(activityId: bigint, newStatus: ActivityStatus): Promise<Activity>;
    updateBitcoinAddress(newAddress: string): Promise<void>;
    updateMarketPrices(btcPrice: number, ethPrice: number): Promise<void>;
    updateMyUserProfile(displayName: string, gmail: string): Promise<UserProfile>;
}
