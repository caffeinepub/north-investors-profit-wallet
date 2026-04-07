import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";



actor {

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
    totalUSDBalance = 6_000_000.0;
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

  var nextActivityId : Nat = 1;

  // Enhanced orthogonal persistence — userProfiles persists automatically
  var userProfileEntries : [(Principal, UserProfile)] = [];
  let userProfiles = Map.fromIter<Principal, UserProfile>(userProfileEntries.vals());

  let activities = List.empty<Activity>();

  public shared func incrementInvestorCount() : async () {
    platformStats := {
      platformStats with
      registeredInvestors = platformStats.registeredInvestors + 1;
    };
  };

  public shared func incrementCommunityMemberCount() : async () {
    platformStats := {
      platformStats with
      communityMembers = platformStats.communityMembers + 1;
    };
  };

  public shared func updateBitcoinAddress(newAddress : Text) : async () {
    if (newAddress.size() < 10) {
      Runtime.trap("Invalid Bitcoin address");
    };
    platformStats := {
      platformStats with
      featuredBitcoinAddress = newAddress;
    };
  };

  public shared func updateMarketPrices(btcPrice : Float, ethPrice : Float) : async () {
    marketPrices := {
      btcPriceUSD = btcPrice;
      ethPriceUSD = ethPrice;
      lastUpdated = Time.now();
    };
  };

  public shared func addActivity(amount : Float, activityType : ActivityType, description : Text) : async {
    id : Nat;
    timestamp : Time.Time;
  } {
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
    { id = newActivity.id; timestamp = newActivity.timestamp };
  };

  public shared func updateActivityStatus(activityId : Nat, newStatus : ActivityStatus) : async ?Activity {
    switch (activities.toArray().find<Activity>(func(a) { a.id == activityId })) {
      case (null) { null };
      case (?activity) {
        let newActivity = { activity with status = newStatus };
        let arr = activities.toArray();
        let updated = arr.map(func(act) {
          if (act.id == activityId) { newActivity } else { act };
        });
        activities.clear();
        activities.addAll(updated.vals());
        ?newActivity;
      };
    };
  };

  public query func getPlatformStats() : async PlatformStats {
    platformStats;
  };

  public query func getMarketPrices() : async MarketPrices {
    marketPrices;
  };

  public query func getAllActivities() : async [Activity] {
    let arr = activities.toArray();
    arr.sort<Activity>(func(a, b) { Int.compare(b.timestamp, a.timestamp) });
  };

  public query func getActivityById(activityId : Nat) : async ?Activity {
    activities.toArray().find<Activity>(func(a) { a.id == activityId });
  };

  public shared ({ caller }) func registerUserProfile(displayName : Text, gmail : Text) : async () {
    if (gmail.size() < 2) { Runtime.trap("Invalid email address: too short") };
    if (displayName.size() < 1) { Runtime.trap("Display name cannot be empty") };
    if (displayName.size() > 50) { Runtime.trap("Display name too long") };
    userProfiles.add(caller, { displayName; gmail });
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateMyUserProfile(displayName : Text, gmail : Text) : async ?UserProfile {
    let updatedProfile : UserProfile = { displayName; gmail };
    userProfiles.add(caller, updatedProfile);
    ?updatedProfile;
  };
};
