// migration.mo — handles upgrade from version without accessControlState
// Previous deployed version already has no accessControlState; this migration
// preserves userProfileEntries and updates platformStats totalUSDBalance.
import Principal "mo:core/Principal";

module {

  // ─── Old types ───────────────────────────────────────────────────────────────

  type ActivityStatus_Old = { #completed; #failed; #pending };
  type ActivityType_Old = {
    #deposit;
    #interestPayment;
    #referralBonus;
    #withdrawal;
  };
  type Activity_Old = {
    activityType : ActivityType_Old;
    amount : Float;
    description : Text;
    id : Nat;
    status : ActivityStatus_Old;
    timestamp : Int;
  };

  type ActivitiesBlock_Old = {
    var blockIndex : Nat;
    var blocks : [var [var ?Activity_Old]];
    var elementIndex : Nat;
  };

  type UserProfile_Old = { displayName : Text; gmail : Text };

  // ─── Old actor stable shape ─────────────────────────────────────────────────

  type OldActor = {
    activities : ActivitiesBlock_Old;
    var marketPrices : {
      btcPriceUSD : Float;
      ethPriceUSD : Float;
      lastUpdated : Int;
    };
    var nextActivityId : Nat;
    var platformStats : {
      communityMembers : Nat;
      featuredBitcoinAddress : Text;
      registeredInvestors : Nat;
      totalBTC : Float;
      totalUSDBalance : Float;
    };
    userProfileEntries : [(Principal, UserProfile_Old)];
  };

  // ─── New actor stable shape ──────────────────────────────────────────────────

  type UserProfile_New = { displayName : Text; gmail : Text };

  type NewActor = {
    var marketPrices : {
      btcPriceUSD : Float;
      ethPriceUSD : Float;
      lastUpdated : Int;
    };
    var nextActivityId : Nat;
    var platformStats : {
      communityMembers : Nat;
      featuredBitcoinAddress : Text;
      registeredInvestors : Nat;
      totalBTC : Float;
      totalUSDBalance : Float;
    };
    userProfileEntries : [(Principal, UserProfile_New)];
  };

  // ─── Migration function ──────────────────────────────────────────────────────

  public func run(old : OldActor) : NewActor {
    {
      var marketPrices = old.marketPrices;
      var nextActivityId = old.nextActivityId;
      var platformStats = {
        old.platformStats with
        totalUSDBalance = 6_000_000.0;
      };
      userProfileEntries = old.userProfileEntries;
    };
  };
};
