import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Storage "blob-storage/Storage";

module {
  type Category = {
    #pregnancy;
    #postpartum;
    #sleep;
    #organization;
    #mentalLoad;
  };

  type ProductCondition = {
    #new;
    #veryGood;
    #good;
    #used;
  };

  type Region = {
    #geneva;
    #vaud;
    #valais;
    #fribourg;
    #neuchatel;
    #jura;
  };

  type MotherhoodStatus = {
    #tryingToConceive;
    #pregnant;
    #postpartum;
    #youngChildren;
    #teenChildren;
    #adultChildren;
  };

  type Country = {
    #switzerland;
    #france;
  };

  type Post = {
    id : Nat;
    author : Text;
    category : Category;
    content : Text;
    isAnonymous : Bool;
    timestamp : Time.Time;
  };

  type Reply = {
    id : Nat;
    postId : Nat;
    author : Text;
    content : Text;
    isAnonymous : Bool;
    timestamp : Time.Time;
  };

  type Listing = {
    id : Nat;
    title : Text;
    description : Text;
    price : Nat;
    condition : ProductCondition;
    region : Region;
    categories : [Text];
    ageGroup : Text;
    images : [Storage.ExternalBlob];
    author : Text;
    timestamp : Time.Time;
  };

  type OldUserProfile = {
    name : Text;
    location : ?Region;
    status : MotherhoodStatus;
    bio : ?Text;
    favorites : [Nat];
    profilePicture : ?Storage.ExternalBlob;
  };

  type NewUserProfile = {
    name : Text;
    location : ?Region;
    status : MotherhoodStatus;
    bio : ?Text;
    favorites : [Nat];
    country : ?Country;
    profilePicture : ?Storage.ExternalBlob;
  };

  type Message = {
    id : Nat;
    sender : Principal;
    receiver : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type Conversation = {
    id : Nat;
    participant1 : Principal;
    participant2 : Principal;
    messages : [Message];
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    posts : Map.Map<Nat, Post>;
    replies : Map.Map<Nat, Reply>;
    listings : Map.Map<Nat, Listing>;
    conversations : Map.Map<Nat, Conversation>;
    postIdCounter : Nat;
    replyIdCounter : Nat;
    listingIdCounter : Nat;
    conversationIdCounter : Nat;
    messageIdCounter : Nat;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    posts : Map.Map<Nat, Post>;
    replies : Map.Map<Nat, Reply>;
    listings : Map.Map<Nat, Listing>;
    conversations : Map.Map<Nat, Conversation>;
    postIdCounter : Nat;
    replyIdCounter : Nat;
    listingIdCounter : Nat;
    conversationIdCounter : Nat;
    messageIdCounter : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_p, oldProfile) {
        { oldProfile with country = null };
      }
    );
    {
      old with userProfiles = newUserProfiles;
    };
  };
};
