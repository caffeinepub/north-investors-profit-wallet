import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  // ── Old types (copied from .old/src/backend/main.mo) ──────────────────────

  type OldActivityType = {
    #deposit;
    #withdrawal;
    #interestPayment;
    #referralBonus;
  };

  type OldActivityStatus = {
    #pending;
    #completed;
    #failed;
  };

  type OldActivity = {
    id : Nat;
    amount : Float;
    activityType : OldActivityType;
    timestamp : Time.Time;
    status : OldActivityStatus;
    description : Text;
  };

  type OldUserProfile = {
    displayName : Text;
    gmail : Text;
  };

  type OldPlatformStats = {
    totalUSDBalance : Float;
    totalBTC : Float;
    registeredInvestors : Nat;
    communityMembers : Nat;
    featuredBitcoinAddress : Text;
  };

  type OldMarketPrices = {
    btcPriceUSD : Float;
    ethPriceUSD : Float;
    lastUpdated : Time.Time;
  };

  // ── New types (matching new main.mo) ───────────────────────────────────────

  type NewActivityType = {
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

  type NewActivityStatus = {
    #pending;
    #completed;
    #failed;
  };

  type NewActivity = {
    id : Nat;
    amount : Float;
    activityType : NewActivityType;
    timestamp : Time.Time;
    status : NewActivityStatus;
    description : Text;
    userGmail : Text;
    username : Text;
    sessionId : Text;
    reference : Text;
  };

  type NewUserProfile = {
    displayName : Text;
    gmail : Text;
    isAdmin : Bool;
    username : Text;
  };

  // ── Migration actor shapes ─────────────────────────────────────────────────

  type OldActor = {
    var platformStats : OldPlatformStats;
    var marketPrices : OldMarketPrices;
    var nextActivityId : Nat;
    var userProfileEntries : [(Principal, OldUserProfile)];
    userProfiles : Map.Map<Principal, OldUserProfile>;
    activities : List.List<OldActivity>;
  };

  type NewActor = {
    var platformStats : OldPlatformStats;
    var marketPrices : OldMarketPrices;
    var nextActivityId : Nat;
    var userProfileEntries : [(Principal, NewUserProfile)];
    userProfiles : Map.Map<Principal, NewUserProfile>;
    activities : List.List<NewActivity>;
  };

  // ── Migration function ─────────────────────────────────────────────────────

  public func run(old : OldActor) : NewActor {
    // Migrate activities: add missing fields with defaults
    let newActivities = old.activities.map<OldActivity, NewActivity>(
      func(a) {
        {
          id = a.id;
          amount = a.amount;
          activityType = (a.activityType : NewActivityType);
          timestamp = a.timestamp;
          status = (a.status : NewActivityStatus);
          description = a.description;
          userGmail = "";
          username = "";
          sessionId = "";
          reference = "";
        };
      }
    );

    // Migrate userProfiles: add isAdmin = false, username = displayName
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_p, profile) {
        {
          displayName = profile.displayName;
          gmail = profile.gmail;
          isAdmin = false;
          username = profile.displayName;
        };
      }
    );

    // userProfileEntries: derive from migrated map
    let newUserProfileEntries = newUserProfiles.toArray();

    {
      var platformStats = old.platformStats;
      var marketPrices = old.marketPrices;
      var nextActivityId = old.nextActivityId;
      var userProfileEntries = newUserProfileEntries;
      userProfiles = newUserProfiles;
      activities = newActivities;
    };
  };
};
