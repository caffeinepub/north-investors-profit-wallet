import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ActivityStats {
    totalActivities: bigint;
    totalLogins: bigint;
    failedLogins: bigint;
    totalUsers: bigint;
    totalDeposits: bigint;
}
export type Time = bigint;
export interface Activity {
    id: bigint;
    status: ActivityStatus;
    activityType: ActivityType;
    username: string;
    userGmail: string;
    reference: string;
    description: string;
    timestamp: Time;
    sessionId: string;
    amount: number;
}
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
    username: string;
    displayName: string;
    gmail: string;
    isAdmin: boolean;
}
export enum ActivityStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum ActivityType {
    loginFailed = "loginFailed",
    settingsChange = "settingsChange",
    receiveMoney = "receiveMoney",
    accountCreation = "accountCreation",
    deposit = "deposit",
    login = "login",
    withdrawal = "withdrawal",
    keyVerification = "keyVerification",
    sendMoney = "sendMoney",
    receiptUpload = "receiptUpload",
    referralBonus = "referralBonus",
    interestPayment = "interestPayment"
}
export interface backendInterface {
    addActivity(amount: number, activityType: ActivityType, description: string): Promise<{
        id: bigint;
        timestamp: Time;
    }>;
    getActivityById(activityId: bigint): Promise<Activity | null>;
    getActivityStats(): Promise<ActivityStats>;
    getAllActivities(): Promise<Array<Activity>>;
    getAllUserActivities(): Promise<Array<Activity>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getMarketPrices(): Promise<MarketPrices>;
    getPlatformStats(): Promise<PlatformStats>;
    getUserActivitiesByGmail(gmail: string): Promise<Array<Activity>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    incrementCommunityMemberCount(): Promise<void>;
    incrementInvestorCount(): Promise<void>;
    isAdminCaller(): Promise<boolean>;
    logUserAction(gmail: string, username: string, activityType: ActivityType, amount: number | null, description: string, reference: string | null, status: ActivityStatus): Promise<{
        id: bigint;
        timestamp: Time;
    }>;
    registerUserProfile(displayName: string, gmail: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAdminRole(target: Principal, makeAdmin: boolean): Promise<void>;
    updateActivityStatus(activityId: bigint, newStatus: ActivityStatus): Promise<Activity | null>;
    updateBitcoinAddress(newAddress: string): Promise<void>;
    updateMarketPrices(btcPrice: number, ethPrice: number): Promise<void>;
    updateMyUserProfile(displayName: string, gmail: string): Promise<UserProfile | null>;
}
