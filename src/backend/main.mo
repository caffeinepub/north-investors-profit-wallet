import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor {

  public type PRincipal = Principal;

  type ActivityType = {
    #deposit;
    #withdrawal;
    #interestPayment;
    #referralBonus;
    #login;
    #loginFailed;
    #accountCreation;
    #sendMoney;
    #receiveMoney;
    #receiptUpload;
    #keyVerification;
    #settingsChange;
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
    userGmail : Text;
    username : Text;
    sessionId : Text;
    reference : Text;
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
    isAdmin : Bool;
    username : Text;
  };

  type ActivityStats = {
    totalActivities : Nat;
    totalLogins : Nat;
    failedLogins : Nat;
    totalDeposits : Nat;
    totalUsers : Nat;
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

  // ─── Admin helpers ────────────────────────────────────────────────────────

  func isAdminPrincipal(p : Principal) : Bool {
    switch (userProfiles.get(p)) {
      case (?profile) { profile.isAdmin };
      case null { false };
    };
  };

  // ─── Platform stats ───────────────────────────────────────────────────────

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

  // ─── Legacy addActivity (backwards compatible) ────────────────────────────

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
      userGmail = "";
      username = "";
      sessionId = "";
      reference = "";
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
        activities.mapInPlace(func(act) {
          if (act.id == activityId) { newActivity } else { act };
        });
        ?newActivity;
      };
    };
  };

  // ─── Enhanced logUserAction ───────────────────────────────────────────────

  public shared func logUserAction(
    gmail : Text,
    username : Text,
    activityType : ActivityType,
    amount : ?Float,
    description : Text,
    reference : ?Text,
    status : ActivityStatus,
  ) : async { id : Nat; timestamp : Time.Time } {
    let resolvedAmount = switch (amount) { case (?a) a; case null 0.0 };
    let resolvedRef = switch (reference) { case (?r) r; case null "" };
    let newActivity : Activity = {
      id = nextActivityId;
      amount = resolvedAmount;
      activityType;
      timestamp = Time.now();
      status;
      description;
      userGmail = gmail;
      username;
      sessionId = "";
      reference = resolvedRef;
    };
    activities.add(newActivity);
    nextActivityId += 1;
    { id = newActivity.id; timestamp = newActivity.timestamp };
  };

  // ─── Queries ──────────────────────────────────────────────────────────────

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

  // ─── User profile management ──────────────────────────────────────────────

  public shared ({ caller }) func registerUserProfile(displayName : Text, gmail : Text) : async () {
    if (gmail.size() < 2) { Runtime.trap("Invalid email address: too short") };
    if (displayName.size() < 1) { Runtime.trap("Display name cannot be empty") };
    if (displayName.size() > 50) { Runtime.trap("Display name too long") };
    // Preserve isAdmin if profile already exists
    let isAdmin = switch (userProfiles.get(caller)) {
      case (?existing) { existing.isAdmin };
      case null { false };
    };
    userProfiles.add(caller, { displayName; gmail; isAdmin; username = displayName });
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
    // Preserve existing isAdmin flag — callers cannot self-escalate
    let isAdmin = switch (userProfiles.get(caller)) {
      case (?existing) { existing.isAdmin };
      case null { false };
    };
    userProfiles.add(caller, { profile with isAdmin });
  };

  public shared ({ caller }) func updateMyUserProfile(displayName : Text, gmail : Text) : async ?UserProfile {
    let isAdmin = switch (userProfiles.get(caller)) {
      case (?existing) { existing.isAdmin };
      case null { false };
    };
    let updatedProfile : UserProfile = { displayName; gmail; isAdmin; username = displayName };
    userProfiles.add(caller, updatedProfile);
    ?updatedProfile;
  };

  // ─── Admin role management ────────────────────────────────────────────────

  public query ({ caller }) func isAdminCaller() : async Bool {
    isAdminPrincipal(caller);
  };

  public shared ({ caller }) func setAdminRole(target : Principal, makeAdmin : Bool) : async () {
    if (not isAdminPrincipal(caller) and not caller.isController()) {
      Runtime.trap("Unauthorized: only admins or controllers can set admin role");
    };
    switch (userProfiles.get(target)) {
      case (?profile) {
        userProfiles.add(target, { profile with isAdmin = makeAdmin });
      };
      case null {
        // Create a minimal profile with admin flag so controller can bootstrap
        userProfiles.add(target, {
          displayName = "";
          gmail = "";
          isAdmin = makeAdmin;
          username = "";
        });
      };
    };
  };

  // ─── Admin query endpoints ────────────────────────────────────────────────

  public query ({ caller }) func getAllUserActivities() : async [Activity] {
    if (not isAdminPrincipal(caller) and not caller.isController()) {
      Runtime.trap("Unauthorized: admin access required");
    };
    let arr = activities.toArray();
    arr.sort<Activity>(func(a, b) { Int.compare(b.timestamp, a.timestamp) });
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    if (not isAdminPrincipal(caller) and not caller.isController()) {
      Runtime.trap("Unauthorized: admin access required");
    };
    userProfiles.values().toArray();
  };

  public query ({ caller }) func getActivityStats() : async ActivityStats {
    if (not isAdminPrincipal(caller) and not caller.isController()) {
      Runtime.trap("Unauthorized: admin access required");
    };
    let allActivities = activities.toArray();
    let totalLogins = allActivities.filter(func(a) { a.activityType == #login }).size();
    let failedLogins = allActivities.filter(func(a) { a.activityType == #loginFailed }).size();
    let totalDeposits = allActivities.filter(func(a) { a.activityType == #deposit }).size();
    {
      totalActivities = allActivities.size();
      totalLogins;
      failedLogins;
      totalDeposits;
      totalUsers = userProfiles.size();
    };
  };

  public query ({ caller }) func getUserActivitiesByGmail(gmail : Text) : async [Activity] {
    if (not isAdminPrincipal(caller) and not caller.isController()) {
      Runtime.trap("Unauthorized: admin access required");
    };
    let arr = activities.toArray();
    let filtered = arr.filter(func(a) { a.userGmail == gmail });
    filtered.sort<Activity>(func(a, b) { Int.compare(b.timestamp, a.timestamp) });
  };

};
