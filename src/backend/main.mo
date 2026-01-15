import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Bool "mo:core/Bool";
import Time "mo:core/Time";
import Option "mo:core/Option";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

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

  public type Post = {
    id : Nat;
    author : Text;
    category : Category;
    content : Text;
    isAnonymous : Bool;
    timestamp : Time.Time;
  };

  public type Reply = {
    id : Nat;
    postId : Nat;
    author : Text;
    content : Text;
    isAnonymous : Bool;
    timestamp : Time.Time;
  };

  public type Listing = {
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

  public type UserProfile = {
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

  let userProfiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<Nat, Post>();
  let replies = Map.empty<Nat, Reply>();
  let listings = Map.empty<Nat, Listing>();
  let conversations = Map.empty<Nat, Conversation>();

  var postIdCounter = 0;
  var replyIdCounter = 0;
  var listingIdCounter = 0;
  var conversationIdCounter = 0;
  var messageIdCounter = 0;

  public shared ({ caller }) func createPost(category : Category, content : Text, isAnonymous : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent créer des posts");
    };

    let author = if (isAnonymous) {
      "Anonyme";
    } else {
      switch (userProfiles.get(caller)) {
        case (null) { "Inconnu" };
        case (?profile) { profile.name };
      };
    };

    let post : Post = {
      id = postIdCounter;
      author;
      category;
      content;
      isAnonymous;
      timestamp = Time.now();
    };

    posts.add(postIdCounter, post);
    postIdCounter += 1;
    postIdCounter - 1;
  };

  public query func getAllPosts() : async [Post] {
    posts.values().toArray();
  };

  module Post {
    public func compareByTimestamp(post1 : Post, post2 : Post) : Order.Order {
      Int.compare(post1.timestamp, post2.timestamp);
    };
  };

  public query func getPostsByCategory(category : Category) : async [Post] {
    let filtered = posts.values().toArray().filter(
      func(p) { p.category == category }
    );
    filtered.sort(Post.compareByTimestamp);
  };

  public query func getPost(postId : Nat) : async Post {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Le post n'existe pas") };
      case (?post) { post };
    };
  };

  public shared ({ caller }) func createReply(postId : Nat, content : Text, isAnonymous : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent créer des réponses");
    };

    if (not posts.containsKey(postId)) {
      Runtime.trap("Le post n'existe pas");
    };

    let author = if (isAnonymous) {
      "Anonyme";
    } else {
      switch (userProfiles.get(caller)) {
        case (null) { "Inconnu" };
        case (?profile) { profile.name };
      };
    };

    let reply : Reply = {
      id = replyIdCounter;
      postId;
      author;
      content;
      isAnonymous;
      timestamp = Time.now();
    };

    replies.add(replyIdCounter, reply);
    replyIdCounter += 1;
    replyIdCounter - 1;
  };

  public query func getRepliesByPost(postId : Nat) : async [Reply] {
    replies.values().toArray().filter(
      func(r) { r.postId == postId }
    );
  };

  public shared ({ caller }) func createListing(
    title : Text,
    description : Text,
    price : Nat,
    condition : ProductCondition,
    region : Region,
    categories : [Text],
    ageGroup : Text,
    images : [Storage.ExternalBlob],
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent créer des annonces");
    };

    // Check if user is from Switzerland - only Swiss users can create listings
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("Profil utilisateur non trouvé");
      };
      case (?profile) {
        switch (profile.country) {
          case (null) {
            Runtime.trap("Le pays doit être défini dans votre profil pour créer une annonce");
          };
          case (?country) {
            switch (country) {
              case (#france) {
                Runtime.trap("La publication des annonces est disponible prochainement pour la France");
              };
              case (#switzerland) {
                // Swiss users can proceed
              };
            };
          };
        };
      };
    };

    if (images.size() == 0) {
      Runtime.trap("Au moins une image est requise pour créer une annonce");
    };

    let author = switch (userProfiles.get(caller)) {
      case (null) { "Inconnu" };
      case (?profile) { profile.name };
    };

    let listing : Listing = {
      id = listingIdCounter;
      title;
      description;
      price;
      condition;
      region;
      categories;
      ageGroup;
      images;
      author;
      timestamp = Time.now();
    };

    listings.add(listingIdCounter, listing);
    listingIdCounter += 1;
    listingIdCounter - 1;
  };

  module Listing {
    public func compareByTimestamp(listing1 : Listing, listing2 : Listing) : Order.Order {
      Int.compare(listing1.timestamp, listing2.timestamp);
    };
  };

  public query func getAllListings() : async [Listing] {
    listings.values().toArray().sort(Listing.compareByTimestamp);
  };

  public query func getListing(listingId : Nat) : async Listing {
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("L'annonce n'existe pas") };
      case (?listing) { listing };
    };
  };

  public query ({ caller }) func isFavorite(listingId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent accéder aux favoris");
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        profile.favorites.find(func(id) { id == listingId }) != null;
      };
    };
  };

  public shared ({ caller }) func toggleFavorite(listingId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent gérer les favoris");
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("Profil utilisateur non trouvé");
      };
      case (?profile) {
        let favoritesList = List.fromArray<Nat>(profile.favorites);
        let favoriteIndex = favoritesList.toArray().findIndex(func(id) { id == listingId });

        let newFavorites = switch (favoriteIndex) {
          case (null) {
            favoritesList.add(listingId);
            favoritesList.toArray();
          };
          case (?index) {
            let filtered = favoritesList.toArray().filter(
              func(id) { id != listingId }
            );
            filtered;
          };
        };

        let updatedProfile = { profile with favorites = newFavorites };
        userProfiles.add(caller, updatedProfile);

        switch (favoriteIndex) {
          case (null) { true };
          case (?_) { false };
        };
      };
    };
  };

  public query ({ caller }) func getFavoritedListings() : async [Listing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent accéder aux favoris");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profil utilisateur non trouvé") };
      case (?profile) {
        let listingsArray = listings.values().toArray();
        let filteredListings = listingsArray.filter(
          func(listing) {
            profile.favorites.find(func(id) { id == listing.id }) != null
          }
        );
        filteredListings;
      };
    };
  };

  public query func getListingsByRegion(region : Region) : async [Listing] {
    let filtered = listings.values().toArray().filter(
      func(listing) { listing.region == region }
    );
    filtered.sort(Listing.compareByTimestamp);
  };

  public query func getListingsByCondition(condition : ProductCondition) : async [Listing] {
    let filtered = listings.values().toArray().filter(
      func(listing) { listing.condition == condition }
    );
    filtered.sort(Listing.compareByTimestamp);
  };

  public query func getListingCount() : async Nat {
    listings.size();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent accéder aux profils");
    };
    userProfiles.get(caller);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    // Public profiles are viewable by anyone (including guests)
    // This allows viewing other users' public information
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent enregistrer le profil");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerCountry() : async ?Country {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent accéder aux profils");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profil utilisateur non trouvé") };
      case (?profile) { profile.country };
    };
  };

  public query ({ caller }) func countryIsFrance() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent accéder aux profils");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profil utilisateur non trouvé") };
      case (?profile) {
        switch (profile.country) {
          case (null) { false };
          case (?country) {
            switch (country) {
              case (#france) { true };
              case (#switzerland) { false };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func countryIsSwitzerland() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent accéder aux profils");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profil utilisateur non trouvé") };
      case (?profile) {
        switch (profile.country) {
          case (null) { false };
          case (?country) {
            switch (country) {
              case (#switzerland) { true };
              case (#france) { false };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func sendMessage(receiver : Principal, content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent envoyer des messages");
    };

    let message : Message = {
      id = messageIdCounter;
      sender = caller;
      receiver;
      content;
      timestamp = Time.now();
    };

    messageIdCounter += 1;

    var existingConversation : ?Conversation = null;
    for ((id, conv) in conversations.entries()) {
      if (
        (conv.participant1 == caller and conv.participant2 == receiver) or
        (conv.participant1 == receiver and conv.participant2 == caller)
      ) {
        existingConversation := ?conv;
      };
    };

    switch (existingConversation) {
      case (null) {
        let newConversation : Conversation = {
          id = conversationIdCounter;
          participant1 = caller;
          participant2 = receiver;
          messages = [message];
        };
        conversations.add(conversationIdCounter, newConversation);
        conversationIdCounter += 1;
        conversationIdCounter - 1;
      };
      case (?conv) {
        let newMessages = conv.messages.concat([message]);
        let updatedConversation = {
          conv with messages = newMessages
        };
        conversations.add(conv.id, updatedConversation);
        conv.id;
      };
    };
  };

  public query ({ caller }) func getConversation(participant : Principal) : async ?Conversation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent accéder aux conversations");
    };

    for ((id, conv) in conversations.entries()) {
      if (
        (conv.participant1 == caller and conv.participant2 == participant) or
        (conv.participant1 == participant and conv.participant2 == caller)
      ) {
        return ?conv;
      };
    };
    null;
  };

  public query ({ caller }) func getAllConversations() : async [Conversation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent accéder aux conversations");
    };

    let userConversations = conversations.values().toArray().filter(
      func(conv) {
        conv.participant1 == caller or conv.participant2 == caller
      }
    );
    userConversations;
  };

  public query func getUserActivity(user : Principal) : async {
    listings : [Listing];
    posts : [Post];
  } {
    // Public activity is viewable by anyone (including guests)
    // This allows viewing other users' public posts and listings
    switch (userProfiles.get(user)) {
      case (null) {
        Runtime.trap("Profil utilisateur non trouvé");
      };
      case (?userProfile) {
        let userListings = listings.values().toArray().filter(
          func(listing) {
            listing.author == userProfile.name;
          }
        );

        let userPosts = posts.values().toArray().filter(
          func(post) {
            post.author == userProfile.name;
          }
        );

        {
          listings = userListings;
          posts = userPosts;
        };
      };
    };
  };
};
