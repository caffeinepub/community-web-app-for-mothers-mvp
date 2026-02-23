import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Bool "mo:core/Bool";
import Order "mo:core/Order";
import Option "mo:core/Option";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Type definitions
  public type Category = {
    #pregnancy;
    #postpartum;
    #sleep;
    #organization;
    #mentalLoad;
  };

  public type ProductCondition = {
    #new;
    #veryGood;
    #good;
    #used;
  };

  public type SwissCanton = {
    #geneva;
    #vaud;
    #valais;
    #fribourg;
    #neuchatel;
    #jura;
  };

  public type FrenchRegion = {
    #auvergneRhoneAlpes;
    #bourgogneFrancheComte;
    #bretagne;
    #centreValDeLoire;
    #corse;
    #grandEst;
    #hautsDeFrance;
    #ileDeFrance;
    #normandie;
    #nouvelleAquitaine;
    #occitanie;
    #paysDeLaLoire;
    #provenceAlpesCoteAzur;
  };

  public type MotherhoodStatus = {
    #tryingToConceive;
    #pregnant;
    #postpartum;
    #youngChildren;
    #teenChildren;
    #adultChildren;
  };

  public type Country = {
    #switzerland;
    #france;
  };

  public type Region = {
    #swissCanton : SwissCanton;
    #frenchRegion : FrenchRegion;
  };

  public type Post = {
    id : Nat;
    author : Text;
    category : Category;
    content : Text;
    isAnonymous : Bool;
    timestamp : Time.Time;
    isHidden : Bool;
  };

  public type Reply = {
    id : Nat;
    postId : Nat;
    author : Text;
    content : Text;
    isAnonymous : Bool;
    timestamp : Time.Time;
    isHidden : Bool;
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
    favorites : [Principal];
  };

  public type UserProfile = {
    name : Text;
    country : ?Country;
    region : ?Region;
    status : MotherhoodStatus;
    bio : ?Text;
    favorites : [Nat];
    profilePicture : ?Storage.ExternalBlob;
    registrationTime : Time.Time;
    posts : [Nat];
    listings : [Nat];
    email : ?Text;
    rulesAccepted : Bool;
    marketingOptIn : Bool;
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

  public type AdminReportType = {
    #post;
    #comment;
  };

  public type AdminReportedContent = {
    id : Nat;
    contentType : AdminReportType;
    contentId : Nat;
    author : Text;
    timestamp : Time.Time;
    reportCount : Nat;
    content : Text;
    isHidden : Bool;
  };

  public type AdminActivityType = {
    #userRegistration;
    #forumPost;
    #comment;
    #secondHandListing;
  };

  public type AdminActivityEntry = {
    id : Nat;
    activityType : AdminActivityType;
    author : Text;
    timestamp : Time.Time;
    content : Text;
  };

  public type AdminStats = {
    totalUsers : Nat;
    newUsersLast7Days : Nat;
    totalForumPosts : Nat;
    totalComments : Nat;
    activeListings : Nat;
    reportedContentCount : Nat;
    franceUsers : Nat;
    switzerlandUsers : Nat;
  };

  public type AdminModerationItem = {
    id : Nat;
    contentType : Text;
    contentId : Nat;
    author : Text;
    timestamp : Time.Time;
    excerpt : Text;
    reportCount : Nat;
  };

  type Report = {
    id : Nat;
    contentType : AdminReportType;
    contentId : Nat;
    reportedBy : Principal;
    timestamp : Time.Time;
  };

  type ModerationAction = {
    #hide;
    #delete;
    #ok;
  };

  // State variables
  let userProfiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<Nat, Post>();
  let replies = Map.empty<Nat, Reply>();
  let listings = Map.empty<Nat, Listing>();
  let conversations = Map.empty<Nat, Conversation>();
  let adminActCount = Map.empty<Text, Nat>();
  let reports = Map.empty<Nat, Report>();
  let activityLog = Map.empty<Nat, AdminActivityEntry>();

  var postIdCounter = 0;
  var replyIdCounter = 0;
  var listingIdCounter = 0;
  var conversationIdCounter = 0;
  var messageIdCounter = 0;
  var reportIdCounter = 0;
  var activityIdCounter = 0;

  // GDPR Compliance Check
  private func verifyGDPRCompliance(caller : Principal) : () {
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("Profil utilisateur non trouvé. Complète ton profil avant de publier.");
      };
      case (?profile) {
        if (not profile.rulesAccepted) {
          Runtime.trap("Tu dois accepter les règles de Nara avant de publier.");
        };
        switch (profile.email) {
          case (null) {
            Runtime.trap("Tu dois fournir ton adresse email avant de publier.");
          };
          case (?email) {
            if (email.size() == 0) {
              Runtime.trap("Tu dois fournir ton adresse email avant de publier.");
            };
          };
        };
      };
    };
  };

  // User Profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent accéder aux profils");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les membres de la communauté peuvent voir les profils");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getCurrentPrincipalId() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les membres de la communauté peuvent voir leur principal id");
    };
    caller.toText();
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent enregistrer le profil");
    };

    let isNewUser = not userProfiles.containsKey(caller);

    let profileWithTime = if (isNewUser) {
      { profile with registrationTime = Time.now() };
    } else {
      switch (userProfiles.get(caller)) {
        case (null) { { profile with registrationTime = Time.now() } };
        case (?existing) { { profile with registrationTime = existing.registrationTime } };
      };
    };

    userProfiles.add(caller, profileWithTime);

    if (isNewUser) {
      let activity : AdminActivityEntry = {
        id = activityIdCounter;
        activityType = #userRegistration;
        author = profile.name;
        timestamp = Time.now();
        content = "Nouvelle inscription";
      };
      activityLog.add(activityIdCounter, activity);
      activityIdCounter += 1;
    };
  };

  // Public read-only endpoints
  public query ({ caller }) func getPublicAllPosts() : async [Post] {
    posts.values().toArray().filter(
      func(p : Post) : Bool {
        not p.isHidden
      }
    );
  };

  module Post {
    public func compareByTimestamp(post1 : Post, post2 : Post) : Order.Order {
      Int.compare(post2.timestamp, post1.timestamp);
    };
  };

  public query ({ caller }) func getPublicPostsByCategory(category : Category) : async [Post] {
    let filtered = posts.values().toArray().filter(
      func(p : Post) : Bool {
        p.category == category and not p.isHidden
      }
    );
    filtered.sort(Post.compareByTimestamp);
  };

  public query ({ caller }) func getPublicPost(postId : Nat) : async Post {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Le post n'existe pas") };
      case (?post) {
        if (post.isHidden) {
          Runtime.trap("Ce contenu n'est plus disponible");
        };
        post;
      };
    };
  };

  public query ({ caller }) func getPublicAllListings() : async [Listing] {
    listings.values().toArray().sort(Listing.compareByTimestamp);
  };

  public query ({ caller }) func getPublicListing(listingId : Nat) : async Listing {
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("L'annonce n'existe pas") };
      case (?listing) { listing };
    };
  };

  public query ({ caller }) func getPublicListingsByRegion(region : Region) : async [Listing] {
    let filtered = listings.values().toArray().filter(
      func(listing) { listing.region == region }
    );
    filtered.sort(Listing.compareByTimestamp);
  };

  public query ({ caller }) func getPublicListingsByCondition(condition : ProductCondition) : async [Listing] {
    let filtered = listings.values().toArray().filter(
      func(listing) { listing.condition == condition }
    );
    filtered.sort(Listing.compareByTimestamp);
  };

  // Forum Posts
  public shared ({ caller }) func createPost(category : Category, content : Text, isAnonymous : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent créer des posts");
    };

    // GDPR Compliance Check
    verifyGDPRCompliance(caller);

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
      isHidden = false;
    };

    posts.add(postIdCounter, post);

    let activity : AdminActivityEntry = {
      id = activityIdCounter;
      activityType = #forumPost;
      author;
      timestamp = Time.now();
      content;
    };
    activityLog.add(activityIdCounter, activity);
    activityIdCounter += 1;

    postIdCounter += 1;
    postIdCounter - 1;
  };

  public shared ({ caller }) func createReply(postId : Nat, content : Text, isAnonymous : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent créer des réponses");
    };

    // GDPR Compliance Check
    verifyGDPRCompliance(caller);

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
      isHidden = false;
    };

    replies.add(replyIdCounter, reply);

    let activity : AdminActivityEntry = {
      id = activityIdCounter;
      activityType = #comment;
      author;
      timestamp = Time.now();
      content;
    };
    activityLog.add(activityIdCounter, activity);
    activityIdCounter += 1;

    replyIdCounter += 1;
    replyIdCounter - 1;
  };

  public query ({ caller }) func getRepliesByPost(postId : Nat) : async [Reply] {
    replies.values().toArray().filter(
      func(r : Reply) : Bool {
        r.postId == postId
      }
    );
  };

  public shared ({ caller }) func reportContent(contentType : AdminReportType, contentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent signaler du contenu");
    };

    // Check if user already reported this content
    for ((_, report) in reports.entries()) {
      if (report.reportedBy == caller and report.contentType == contentType and report.contentId == contentId) {
        Runtime.trap("Tu as déjà signalé ce contenu");
      };
    };

    let report : Report = {
      id = reportIdCounter;
      contentType;
      contentId;
      reportedBy = caller;
      timestamp = Time.now();
    };

    reports.add(reportIdCounter, report);
    reportIdCounter += 1;
  };

  // Secondhand Listings
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

    // GDPR Compliance Check
    verifyGDPRCompliance(caller);

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
              case (#switzerland) {};
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
      favorites = [];
    };

    listings.add(listingIdCounter, listing);

    let activity : AdminActivityEntry = {
      id = activityIdCounter;
      activityType = #secondHandListing;
      author;
      timestamp = Time.now();
      content = title;
    };
    activityLog.add(activityIdCounter, activity);
    activityIdCounter += 1;

    listingIdCounter += 1;
    listingIdCounter - 1;
  };

  module Listing {
    public func compareByTimestamp(listing1 : Listing, listing2 : Listing) : Order.Order {
      Int.compare(listing2.timestamp, listing1.timestamp);
    };
  };

  public query ({ caller }) func isFavorite(listingId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent accéder aux favoris");
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        profile.favorites.find<Nat>(func(id) { id == listingId }).isSome();
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
        let favoriteIndex = profile.favorites.findIndex(func(id) { id == listingId });

        let newFavorites = switch (favoriteIndex) {
          case (null) {
            profile.favorites.concat([listingId]);
          };
          case (?_) {
            profile.favorites.filter(func(id) { id != listingId });
          };
        };

        let updatedProfile = { profile with favorites = newFavorites };
        userProfiles.add(caller, updatedProfile);

        favoriteIndex.isNull();
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
        listingsArray.filter<Listing>(
          func(listing) {
            profile.favorites.find<Nat>(func(id) { id == listing.id }).isSome();
          }
        );
      };
    };
  };

  // Messaging
  public shared ({ caller }) func sendMessage(receiver : Principal, content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les utilisateurs peuvent envoyer des messages");
    };

    // GDPR Compliance Check
    verifyGDPRCompliance(caller);

    if (caller == receiver) {
      Runtime.trap("Tu ne peux pas t'envoyer un message à toi-même");
    };

    if (not userProfiles.containsKey(receiver)) {
      Runtime.trap("Le destinataire n'existe pas");
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

    conversations.values().toArray().filter<Conversation>(
      func(conv) {
        conv.participant1 == caller or conv.participant2 == caller
      }
    );
  };

  // Activity
  public query ({ caller }) func getUserActivity(user : Principal) : async {
    listings : [Listing];
    posts : [Post];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé : seuls les membres de la communauté peuvent voir l'activité des utilisateurs");
    };

    switch (userProfiles.get(user)) {
      case (null) {
        Runtime.trap("Profil utilisateur non trouvé");
      };
      case (?userProfile) {
        let isAdminUser = AccessControl.isAdmin(accessControlState, caller);

        let userListings = listings.values().toArray().filter(
          func(listing) {
            listing.author == userProfile.name;
          }
        );

        let userPosts = posts.values().toArray().filter(
          func(post) {
            post.author == userProfile.name and (not post.isHidden or isAdminUser)
          }
        );

        {
          listings = userListings;
          posts = userPosts;
        };
      };
    };
  };

  // Admin Endpoints
  public query ({ caller }) func adminGetAllContentForModeration() : async [AdminModerationItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Non autorisé : seuls les administrateurs peuvent accéder au contenu de modération");
    };

    let reportCounts = Map.empty<Text, Nat>();

    for ((_, report) in reports.entries()) {
      let key = switch (report.contentType) {
        case (#post) { "post_" # report.contentId.toText() };
        case (#comment) { "comment_" # report.contentId.toText() };
      };

      let count = switch (reportCounts.get(key)) {
        case (null) { 1 };
        case (?c) { c + 1 };
      };
      reportCounts.add(key, count);
    };

    var result : [AdminModerationItem] = [];
    var idCounter = 0;

    for ((_, post) in posts.entries()) {
      let key = "post_" # post.id.toText();
      let count = switch (reportCounts.get(key)) {
        case (null) { 0 };
        case (?c) { c };
      };

      let excerpt = if (post.content.size() > 100) {
        let bytes = post.content.toArray();
        let end = Nat.min(100, bytes.size());
        let sliced = bytes.sliceToArray(0, end);
        Text.fromArray(sliced) # "...";
      } else {
        post.content;
      };

      let item : AdminModerationItem = {
        id = idCounter;
        contentType = "Post";
        contentId = post.id;
        author = post.author;
        timestamp = post.timestamp;
        excerpt;
        reportCount = count;
      };
      result := result.concat([item]);
      idCounter += 1;
    };

    for ((_, listing) in listings.entries()) {
      let item : AdminModerationItem = {
        id = idCounter;
        contentType = "Annonce";
        contentId = listing.id;
        author = listing.author;
        timestamp = listing.timestamp;
        excerpt = listing.title;
        reportCount = 0;
      };
      result := result.concat([item]);
      idCounter += 1;
    };

    result.sort(
      func(a : AdminModerationItem, b : AdminModerationItem) : Order.Order {
        Int.compare(b.timestamp, a.timestamp);
      }
    );
  };

  public query ({ caller }) func adminGetReportedContent() : async [AdminReportedContent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Non autorisé : seuls les administrateurs peuvent accéder au contenu signalé");
    };

    let reportCounts = Map.empty<Text, Nat>();
    for ((_, report) in reports.entries()) {
      let key = switch (report.contentType) {
        case (#post) { "post_" # report.contentId.toText() };
        case (#comment) { "comment_" # report.contentId.toText() };
      };
      reportCounts.add(key, 1);
    };

    var result : [AdminReportedContent] = [];
    var idCounter = 0;

    for ((_, post) in posts.entries()) {
      let key = "post_" # post.id.toText();
      let count = switch (reportCounts.get(key)) {
        case (null) { 0 };
        case (?c) { c };
      };

      if (count > 0) {
        let reported : AdminReportedContent = {
          id = idCounter;
          contentType = #post;
          contentId = post.id;
          author = post.author;
          timestamp = post.timestamp;
          reportCount = count;
          content = post.content;
          isHidden = post.isHidden;
        };
        result := result.concat([reported]);
        idCounter += 1;
      };
    };

    for ((_, reply) in replies.entries()) {
      let key = "comment_" # reply.id.toText();
      let count = switch (reportCounts.get(key)) {
        case (null) { 0 };
        case (?c) { c };
      };

      if (count > 0) {
        let reported : AdminReportedContent = {
          id = idCounter;
          contentType = #comment;
          contentId = reply.id;
          author = reply.author;
          timestamp = reply.timestamp;
          reportCount = count;
          content = reply.content;
          isHidden = reply.isHidden;
        };
        result := result.concat([reported]);
        idCounter += 1;
      };
    };

    result.sort(
      func(a : AdminReportedContent, b : AdminReportedContent) : Order.Order {
        Int.compare(b.timestamp, a.timestamp);
      }
    );
  };

  module Activity {
    public func compareByTimestamp(a : AdminActivityEntry, b : AdminActivityEntry) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  public query ({ caller }) func adminGetRecentActivity() : async [AdminActivityEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Non autorisé : seuls les administrateurs peuvent accéder aux activités récentes");
    };

    let activities = activityLog.values().toArray();
    activities.sort(Activity.compareByTimestamp);
  };

  public query ({ caller }) func adminGetStats() : async AdminStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Non autorisé : seuls les administrateurs peuvent accéder aux statistiques");
    };

    let now = Time.now();
    let sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1_000_000_000);

    var newUsersCount = 0;
    var franceCount = 0;
    var switzerlandCount = 0;

    for ((_, profile) in userProfiles.entries()) {
      if (profile.registrationTime >= sevenDaysAgo) {
        newUsersCount += 1;
      };

      switch (profile.country) {
        case (?#france) { franceCount += 1 };
        case (?#switzerland) { switzerlandCount += 1 };
        case (null) {};
      };
    };

    let reportCounts = Map.empty<Text, Nat>();
    for ((_, report) in reports.entries()) {
      let key = switch (report.contentType) {
        case (#post) { "post_" # report.contentId.toText() };
        case (#comment) { "comment_" # report.contentId.toText() };
      };
      reportCounts.add(key, 1);
    };

    {
      totalUsers = userProfiles.size();
      newUsersLast7Days = newUsersCount;
      totalForumPosts = posts.size();
      totalComments = replies.size();
      activeListings = listings.size();
      reportedContentCount = reportCounts.size();
      franceUsers = franceCount;
      switzerlandUsers = switzerlandCount;
    };
  };

  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
