import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Mixin authorization system, users are authenticated by their principal.
  // Use Role.User for privileged personal data access.
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type PRincipal = Principal;

  type ActivityType = {
    #deposit;
    #withdrawal;
    #interestPayment;
    #referralBonus;
  };

  type ActivityStatus = {
    #pending;
    #completed;
    #failed;
  };

  type Activity = {
    id : Nat;
    amount : Float;
    activityType : ActivityType;
    timestamp : Time.Time;
    status : ActivityStatus;
    description : Text;
  };

  module Activity {
    public func compare(a : Activity, b : Activity) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  type PlatformStats = {
    totalUSDBalance : Float;
    totalBTC : Float;
    registeredInvestors : Nat;
    communityMembers : Nat;
    featuredBitcoinAddress : Text;
  };

  type MarketPrices = {
    btcPriceUSD : Float;
    ethPriceUSD : Float;
    lastUpdated : Time.Time;
  };

  type UserProfile = {
    displayName : Text;
    gmail : Text;
  };

  var platformStats : PlatformStats = {
    totalUSDBalance = 600_000.0;
    totalBTC = 9.4231;
    registeredInvestors = 4_812;
    communityMembers = 19_789;
    featuredBitcoinAddress = "bc1q88ancenmas6e0nfdl9kmvmtk5pq089ewp8wav7";
  };

  var marketPrices : MarketPrices = {
    btcPriceUSD = 40_152.75;
    ethPriceUSD = 2_255.5;
    lastUpdated = Time.now();
  };

  var nextActivityId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();

  let activities = List.empty<Activity>();

  public shared ({ caller }) func incrementInvestorCount() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    platformStats := {
      platformStats with
      registeredInvestors = platformStats.registeredInvestors + 1;
    };
  };

  public shared ({ caller }) func incrementCommunityMemberCount() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    platformStats := {
      platformStats with
      communityMembers = platformStats.communityMembers + 1;
    };
  };

  public shared ({ caller }) func updateBitcoinAddress(newAddress : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (newAddress.size() < 10) { Runtime.trap("Invalid Bitcoin address, current address: " # platformStats.featuredBitcoinAddress : Text) };
    platformStats := {
      platformStats with
      featuredBitcoinAddress = newAddress;
    };
  };

  public shared ({ caller }) func updateMarketPrices(btcPrice : Float, ethPrice : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    marketPrices := {
      btcPriceUSD = btcPrice;
      ethPriceUSD = ethPrice;
      lastUpdated = Time.now();
    };
  };

  public shared ({ caller }) func addActivity(amount : Float, activityType : ActivityType, description : Text) : async {
    id : Nat;
    timestamp : Time.Time;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let newActivity : Activity = {
      amount;
      activityType;
      description;
      status = #pending;
      id = nextActivityId;
      timestamp = Time.now();
    };
    activities.add(newActivity);
    nextActivityId += 1;

    {
      id = newActivity.id;
      timestamp = newActivity.timestamp;
    };
  };

  public shared ({ caller }) func updateActivityStatus(activityId : Nat, newStatus : ActivityStatus) : async Activity {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (activities.toArray().find(func(a) { a.id == activityId })) {
      case (null) { Runtime.trap("Activity not found") };
      case (?activity) {
        let newActivity = { activity with status = newStatus };
        let activitiesArray = activities.toArray();
        let updatedArray = activitiesArray.map(
          func(activity) {
            if (activity.id == activityId) {
              newActivity;
            } else {
              activity;
            };
          }
        );
        activities.clear();
        activities.addAll(updatedArray.values());
        newActivity;
      };
    };
  };

  public query ({ caller }) func getPlatformStats() : async PlatformStats {
    platformStats;
  };

  public query ({ caller }) func getMarketPrices() : async MarketPrices {
    marketPrices;
  };

  public query ({ caller }) func getAllActivities() : async [Activity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view activities");
    };
    activities.toArray().sort();
  };

  public query ({ caller }) func getActivityById(activityId : Nat) : async Activity {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view activities");
    };
    switch (activities.toArray().find(func(a) { a.id == activityId })) {
      case (null) { Runtime.trap("Activity not found") };
      case (?activity) { activity };
    };
  };

  public shared ({ caller }) func registerUserProfile(displayName : Text, gmail : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register profiles");
    };
    if (gmail.size() < 2) {
      Runtime.trap("Invalid Gmail: too short");
    };
    if (not gmail.contains(#text("gmail.com"))) {
      Runtime.trap("Gmail address must contain 'gmail.com', invalid address: " # gmail : Text);
    };
    if (displayName.size() > 50) { Runtime.trap("Display name too long") };
    userProfiles.add(
      caller,
      {
        displayName;
        gmail;
      },
    );
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateMyUserProfile(displayName : Text, gmail : Text) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found, please register") };
      case (?profile) {
        let updatedProfile : UserProfile = {
          displayName;
          gmail;
        };
        userProfiles.add(caller, updatedProfile);
        updatedProfile;
      };
    };
  };
};
