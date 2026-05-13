/**
 * PermutaModel strings — single source of truth for EN + PT-BR copy.
 *
 * Structure preserves every legacy namespace from `translations.ts` so
 * existing consumers (16 files routing through useTranslation) keep working
 * with zero diff churn during the Fase 3 cleanup pass. Migration to the new
 * spec-voice namespaces (auth / chat / notifs / tfp / reviews / errors /
 * cta / validation) happens incrementally in Fases 3-4.
 *
 * PT-BR voice — Nubank/iFood register, "amigo capaz":
 *   - colloquial without slang ("Tô dentro", not "Manda ver")
 *   - drops formal banking tone ("Bora começar", not "Iniciar")
 *   - dictionary terms (Seção 5 do PROMPT_SESSAO_2) are authoritative
 *
 * Function-valued entries take a params object so call-sites are explicit:
 *   t.notifs.tfp_request_accepted({ name: "Maria" })
 *   t.discover.greetingMorning(firstName)
 */

export interface Strings {
  // ── Cross-cutting ────────────────────────────────────────────────────
  common: {
    loading: string;
    error: string;
    success: string;
    retry: string;
    back: string;
    next: string;
    done: string;
    close: string;
    confirm: string;
    cancel: string;
    delete: string;
    edit: string;
    save: string;
    saveChanges: string;
    search: string;
    filter: string;
    sort: string;
    more: string;
    less: string;
    yes: string;
    no: string;
    or: string;
    and: string;
    ago: string;
    minutes: string;
    hours: string;
    days: string;
    today: string;
    yesterday: string;
    required: string;
    optional: string;
    empty: string;
    photographer: string;
    model: string;
    creative: string;
    dual: string;
  };
  cta: {
    continue: string;          // "Bora"
    getStarted: string;        // "Bora começar"
    knowMore: string;          // "Saber mais"
    seeAll: string;
    tryAgain: string;
  };
  errors: {
    generic: string;
    network: string;
    server: string;
    notFound: string;
    sessionExpired: string;
    permissionDenied: string;
    unsupported: string;
  };
  validation: {
    required: string;
    invalidEmail: string;
    passwordTooShort: string;
    passwordsDontMatch: string;
    nameRequired: string;
    maxFileSize: (mb: number) => string;
  };

  // ── Profile completion checklist ─────────────────────────────────────
  profileCompletion: {
    title: string;
    completeCta: string;
    items: {
      avatar: string;
      bio: string;
      location: string;
      styles: string;
      instagram: string;
      photos: string;
      availability: string;
      equipment: string;
    };
  };

  // ── Availability toggle ─────────────────────────────────────────────
  availability: {
    setAsAvailable: string;     // "Tô na ativa" + CTA framing
    setAvailability: string;    // modal title
    intro: string;
    howLong: string;
    today: string;
    threeDays: string;
    oneWeek: string;
    detailsLabel: string;
    detailsPlaceholder: string;
    activate: string;
    activating: string;
    tapToDisable: string;
    turnedOff: string;          // success toast
    activated: string;          // success toast
    updateFailed: string;       // error toast
    activateFailed: string;     // error toast
  };

  // ── Achievement badges ──────────────────────────────────────────────
  achievements: {
    title: string;
    types: Record<
      | "first_session"
      | "five_sessions"
      | "ten_sessions"
      | "first_review"
      | "five_star"
      | "top_rated"
      | "verified"
      | "popular",
      { label: string; description: string }
    >;
  };

  // ── ErrorBoundary fallback (class component renders this) ────────────
  errorBoundary: {
    title: string;
    message: string;
    refresh: string;
  };

  // ── Navigation & layout ─────────────────────────────────────────────
  nav: {
    discover: string;
    dashboard: string;
    messages: string;
    sessions: string;
    profile: string;
    settings: string;
    favorites: string;
    notifications: string;
    castings: string;
    search: string;
  };

  // ── Auth / login ─────────────────────────────────────────────────────
  auth: {
    welcome: string;       // "Salve, cola aqui"
    welcomeBack: string;   // "E aí, voltou!"
    signIn: string;
    signUp: string;
    createAccount: string;
    signingIn: string;
    creatingAccount: string;
    forgotPassword: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    fullNamePlaceholder: string;
    checkEmail: string;
    alreadyRegistered: string;
  };
  /** Legacy alias — Login.tsx imports `t.login.*`; keys mirror auth + a few extras. */
  login: {
    emailPlaceholder: string;
    passwordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    fullNamePlaceholder: string;
    signIn: string;
    signUp: string;
    signingIn: string;
    creatingAccount: string;
    createAccount: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    passwordsDontMatch: string;
    enterName: string;
    checkEmail: string;
    alreadyRegistered: string;
    forgotPassword: string;
  };

  // ── Onboarding ───────────────────────────────────────────────────────
  onboarding: {
    welcome: string;
    welcomeSub: string;
    letsGo: string;
    skip: string;
    finish: string;
  };

  // ── Discover (Início) ────────────────────────────────────────────────
  discover: {
    title: string;
    setLocation: string;
    creatives: string;
    castings: string;
    searchPlaceholder: string;
    all: string;
    photographers: string;
    models: string;
    available: string;
    highestRated: string;
    recentlyActive: string;
    newest: string;
    specialties: string;
    experienceLevel: string;
    allLevels: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    professional: string;
    location: string;
    locationPlaceholder: string;
    distance: string;
    showAllDistances: string;
    clearAllFilters: string;
    showing: string;
    creative: string;
    creativeS: string;
    availableNow: string;
    online: string;
    noCreatives: string;
    noCreativesSub: string;
    verified: string;
    reviews: string;
    /** Greeting templates (Dashboard / Discover hero). */
    greetingMorning: (name: string) => string;
    greetingAfternoon: (name: string) => string;
    greetingEvening: (name: string) => string;
  };

  // ── Dashboard ────────────────────────────────────────────────────────
  dashboard: {
    title: string;
    received: string;
    sent: string;
    myCastings: string;
    pending: string;
    accepted: string;
    declined: string;
    completed: string;
    counter: string;
    noRequests: string;
    noRequestsSub: string;
    viewProfile: string;
    accept: string;
    decline: string;
    message: string;
    leaveReview: string;
    reviewed: string;
    discoverCreatives: string;
  };

  // ── Messages / chat ──────────────────────────────────────────────────
  messages: {
    title: string;
    noMessages: string;
    noMessagesSub: string;
    typeMessage: string;
    send: string;
    online: string;
    offline: string;
    archived: string;
  };
  /** Spec alias — same object as messages. */
  chat: {
    title: string;
    noMessages: string;
    noMessagesSub: string;
    typeMessage: string;
    send: string;
    online: string;
    offline: string;
    archived: string;
  };

  // ── Sessions ─────────────────────────────────────────────────────────
  sessions: {
    title: string;
    upcoming: string;
    past: string;
    cancelled: string;
    noSessions: string;
    noSessionsSub: string;
    checkedIn: string;
    checkIn: string;
    cancel: string;
    complete: string;
    sharedGallery: string;
  };

  // ── Profile ──────────────────────────────────────────────────────────
  profile: {
    editProfile: string;
    portfolio: string;
    about: string;
    reviews: string;
    noPhotos: string;
    noPhotosSub: string;
    sendRequest: string;
    messageBtn: string;
    report: string;
    block: string;
    favorite: string;
    unfavorite: string;
    availableNow: string;
    styles: string;
    equipment: string;
    languages: string;
    studio: string;
    measurements: string;
  };

  // ── Settings ─────────────────────────────────────────────────────────
  settings: {
    title: string;
    account: string;
    notifications: string;
    privacy: string;
    appearance: string;
    blockedUsers: string;
    about: string;
    feedback: string;
    logout: string;
    deleteAccount: string;
    changeEmail: string;
    changePassword: string;
    pushNotifications: string;
    requestsFrom: string;
    everyone: string;
    verified: string;
    noOne: string;
    hideProfile: string;
    hideDistance: string;
    showOnline: string;
    darkMode: string;
    save: string;
    saving: string;
    cancel: string;
    pro: string;
    upgrade: string;
  };

  // ── Castings (Trampos) ───────────────────────────────────────────────
  castings: {
    title: string;
    createCasting: string;
    open: string;
    filled: string;
    expired: string;
    apply: string;
    applied: string;
    manage: string;
    applyNow: string;
    noCastings: string;
    noCastingsSub: string;
    slots: string;
    filledSlots: string;
    flexible: string;
  };

  // ── Favorites ────────────────────────────────────────────────────────
  favorites: {
    title: string;
    noFavorites: string;
    noFavoritesSub: string;
  };

  // ── Notifications page (static UI) ──────────────────────────────────
  notifications: {
    title: string;
    noNotifications: string;
    noNotificationsSub: string;
    markAllRead: string;
  };

  // ── Notification kind templates (Fase 4 wiring) ──────────────────────
  notifs: {
    tfp_request_new: (p: { name: string; title: string }) => { title: string; body: string };
    tfp_request_accepted: (p: { name: string }) => { title: string; body: string };
    tfp_request_declined: (p: { name: string }) => { title: string; body: string };
    application_new: (p: { castingTitle: string }) => { title: string; body: string };
    application_accepted: (p: { castingTitle?: string }) => { title: string; body: string };
    application_declined: (p: { castingTitle?: string }) => { title: string; body: string };
    photo_like: (p: { name: string }) => { title: string; body: string };
    photo_comment: (p: { name: string; preview: string }) => { title: string; body: string };
    gallery_shared: (p: { name?: string }) => { title: string; body: string };
  };

  // ── Search page ──────────────────────────────────────────────────────
  searchPage: {
    title: string;
    clearAll: string;
    searchByName: string;
    type: string;
    allTypes: string;
    minRating: string;
    verifiedOnly: string;
    hasStudio: string;
    availableDays: string;
    lastActive: string;
    onlineNow: string;
    thisWeek: string;
    thisMonth: string;
    applyFilters: string;
    counting: string;
    match: string;
    matches: string;
  };

  // ── TFP (permuta) flow ───────────────────────────────────────────────
  tfp: {
    sendRequest: string;       // "Chamar pra permuta"
    request: string;           // "Permuta"
    requestAccepted: string;   // "Topou!"
    requestDeclined: string;   // "Não rolou dessa vez"
    sending: string;
    schedule: string;          // "Marcar o rolê"
  };

  // ── Reviews (Recadinhos) ─────────────────────────────────────────────
  reviews: {
    title: string;             // "Recadinhos"
    submit: string;
    submitting: string;
    submitted: string;
    rateAll: string;
    overall: string;
  };

  // ── Modals (legacy bag — gradually migrate into tfp/reviews/etc.) ────
  modals: {
    // TFP modal
    collaborateWith: string;
    whatsTheIdea: string;
    details: string;
    personalTouch: string;
    projectName: string;
    projectNamePlaceholder: string;
    whatsTheVibe: string;
    when: string;
    pickDate: string;
    where: string;
    wherePlaceholder: string;
    vision: string;
    visionPlaceholder: string;
    personalNote: string;
    personalNotePlaceholder: string;
    continue: string;
    sendRequest: string;
    optional: string;
    // Review modal
    reviewTitle: string;
    howWasSession: string;
    professionalism: string;
    punctuality: string;
    communication: string;
    creativity: string;
    quality: string;
    commentOptional: string;
    sharePlaceholder: string;
    overallRating: string;
    submitReview: string;
    rateAllCategories: string;
    reviewSubmitted: string;
    // Report modal
    reportUser: string;
    reportIntro: string;
    reason: string;
    detailsOptional: string;
    describePlaceholder: string;
    submitReport: string;
    submitting: string;
    reportDisclaimer: string;
    harassment: string;
    harassmentDesc: string;
    fakeProfile: string;
    fakeProfileDesc: string;
    noShow: string;
    noShowDesc: string;
    inappropriate: string;
    inappropriateDesc: string;
    spam: string;
    spamDesc: string;
    other: string;
    otherDesc: string;
    // Create Casting modal
    newCasting: string;
    whatsTheShoot: string;
    nameAndVibe: string;
    whoAndWhen: string;
    talentDateLogistics: string;
    finalDetails: string;
    locationMoodboard: string;
    titleLabel: string;
    titlePlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    stylesLabel: string;
    whoNeeded: string;
    howManySlots: string;
    duration: string;
    locationLabel: string;
    locationPlaceholder: string;
    indoor: string;
    outdoor: string;
    moodboard: string;
    requirements: string;
    requirementsPlaceholder: string;
    publishCasting: string;
    morning: string;
    afternoon: string;
    evening: string;
    justNow: string;
  };
}

// ─────────────────────────────────────────────────────────────────────
// EN — kept reasonably parallel to PT-BR. CollabShoot/US users still see
// this until brand routing splits.
// ─────────────────────────────────────────────────────────────────────

const messagesEN: Strings["messages"] = {
  title: "Messages",
  noMessages: "No messages yet",
  noMessagesSub: "Start a conversation to see messages here.",
  typeMessage: "Type a message...",
  send: "Send",
  online: "Online",
  offline: "Offline",
  archived: "Archived",
};

const authEN: Strings["auth"] = {
  welcome: "Welcome",
  welcomeBack: "Welcome back",
  signIn: "Sign In",
  signUp: "Sign Up",
  createAccount: "Create Account",
  signingIn: "Signing in...",
  creatingAccount: "Creating account...",
  forgotPassword: "Forgot password?",
  alreadyHaveAccount: "Already have an account?",
  dontHaveAccount: "Don't have an account?",
  emailPlaceholder: "Email address",
  passwordPlaceholder: "Password",
  confirmPasswordPlaceholder: "Confirm Password",
  fullNamePlaceholder: "Full Name",
  checkEmail: "Check your email to verify your account before signing in.",
  alreadyRegistered: "This email is already registered. Try signing in instead.",
};

export const EN: Strings = {
  common: {
    loading: "Loading...",
    error: "Something went wrong",
    success: "Success",
    retry: "Try again",
    back: "Back",
    next: "Next",
    done: "Done",
    close: "Close",
    confirm: "Confirm",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    save: "Save",
    saveChanges: "Save changes",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    more: "More",
    less: "Less",
    yes: "Yes",
    no: "No",
    or: "or",
    and: "and",
    ago: "ago",
    minutes: "min",
    hours: "h",
    days: "d",
    today: "Today",
    yesterday: "Yesterday",
    required: "Required",
    optional: "Optional",
    empty: "Nothing here yet",
    photographer: "Photographer",
    model: "Model",
    creative: "Creative",
    dual: "Dual",
  },
  cta: {
    continue: "Continue",
    getStarted: "Get Started",
    knowMore: "Learn more",
    seeAll: "See all",
    tryAgain: "Try again",
  },
  errors: {
    generic: "Something went wrong.",
    network: "Network error. Check your connection and try again.",
    server: "Server error. Please try again in a moment.",
    notFound: "We couldn't find that.",
    sessionExpired: "Your session expired. Please sign in again.",
    permissionDenied: "You don't have permission to do that.",
    unsupported: "This isn't supported yet.",
  },
  validation: {
    required: "Required field",
    invalidEmail: "Invalid email address",
    passwordTooShort: "Password must be at least 6 characters",
    passwordsDontMatch: "Passwords don't match",
    nameRequired: "Please enter your name",
    maxFileSize: (mb) => `Max ${mb}MB`,
  },
  profileCompletion: {
    title: "Profile Completion",
    completeCta: "Complete your profile",
    items: {
      avatar: "Profile photo",
      bio: "Bio",
      location: "Location",
      styles: "Styles",
      instagram: "Instagram or website",
      photos: "Portfolio photos",
      availability: "Availability",
      equipment: "Equipment or measurements",
    },
  },
  availability: {
    setAsAvailable: "Set as Available Now",
    setAvailability: "Set Availability",
    intro: "Let others know you're available for TFP shoots right now.",
    howLong: "How long?",
    today: "Today",
    threeDays: "3 Days",
    oneWeek: "1 Week",
    detailsLabel: "Details (optional)",
    detailsPlaceholder: "E.g., 'Free today 2-6pm in downtown Boston'",
    activate: "Activate",
    activating: "Activating...",
    tapToDisable: "Tap to disable",
    turnedOff: "Availability turned off",
    activated: "You're now available! ⚡",
    updateFailed: "Failed to update availability",
    activateFailed: "Failed to activate availability",
  },
  achievements: {
    title: "Achievements",
    types: {
      first_session: { label: "First Session", description: "Completed your first session" },
      five_sessions: { label: "5 Sessions", description: "Completed 5 sessions" },
      ten_sessions: { label: "10 Sessions", description: "Completed 10 sessions" },
      first_review: { label: "First Review", description: "Received your first review" },
      five_star: { label: "5-Star Rating", description: "Achieved a 5-star rating" },
      top_rated: { label: "Top Rated", description: "Top rated in your area" },
      verified: { label: "Verified", description: "Identity verified" },
      popular: { label: "Popular", description: "Favorited by 10+ users" },
    },
  },
  errorBoundary: {
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try refreshing the page.",
    refresh: "Refresh Page",
  },
  nav: {
    discover: "Discover",
    dashboard: "Dashboard",
    messages: "Messages",
    sessions: "Sessions",
    profile: "Profile",
    settings: "Settings",
    favorites: "Favorites",
    notifications: "Notifications",
    castings: "Castings",
    search: "Search",
  },
  auth: authEN,
  login: {
    emailPlaceholder: "Email address",
    passwordPlaceholder: "Password",
    confirmPasswordPlaceholder: "Confirm Password",
    fullNamePlaceholder: "Full Name",
    signIn: "Sign In",
    signUp: "Sign Up",
    signingIn: "Signing In...",
    creatingAccount: "Creating Account...",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    passwordsDontMatch: "Passwords don't match",
    enterName: "Please enter your name",
    checkEmail: "Check your email to verify your account before signing in.",
    alreadyRegistered: "This email is already registered. Try signing in instead.",
    forgotPassword: "Forgot password?",
  },
  onboarding: {
    welcome: "Welcome!",
    welcomeSub: "Let's set up your profile",
    letsGo: "Let's Go",
    skip: "Skip",
    finish: "Finish",
  },
  discover: {
    title: "Discover",
    setLocation: "Set location",
    creatives: "Creatives",
    castings: "Castings",
    searchPlaceholder: "Search photographers, models, cities...",
    all: "All",
    photographers: "Photographers",
    models: "Models",
    available: "Available",
    highestRated: "Highest Rated",
    recentlyActive: "Recently Active",
    newest: "Newest",
    specialties: "Specialties",
    experienceLevel: "Experience Level",
    allLevels: "All Levels",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    professional: "Professional",
    location: "Location",
    locationPlaceholder: "City or state...",
    distance: "Distance",
    showAllDistances: "Show all distances",
    clearAllFilters: "Clear all filters",
    showing: "Showing",
    creative: "creative",
    creativeS: "creatives",
    availableNow: "Available Now",
    online: "online",
    noCreatives: "No creatives found",
    noCreativesSub: "Try adjusting your filters",
    verified: "Verified",
    reviews: "reviews",
    greetingMorning: (name) => `Good morning, ${name}`,
    greetingAfternoon: (name) => `Good afternoon, ${name}`,
    greetingEvening: (name) => `Good evening, ${name}`,
  },
  dashboard: {
    title: "Dashboard",
    received: "Received",
    sent: "Sent",
    myCastings: "My Castings",
    pending: "Pending",
    accepted: "Accepted",
    declined: "Declined",
    completed: "Completed",
    counter: "Counter",
    noRequests: "No requests yet",
    noRequestsSub: "When you receive or send TFP requests, they'll appear here.",
    viewProfile: "View Profile",
    accept: "Accept",
    decline: "Decline",
    message: "Message",
    leaveReview: "Leave Review",
    reviewed: "Reviewed",
    discoverCreatives: "Discover Creatives",
  },
  messages: messagesEN,
  chat: messagesEN,
  sessions: {
    title: "Sessions",
    upcoming: "Upcoming",
    past: "Completed",
    cancelled: "Cancelled",
    noSessions: "No sessions yet",
    noSessionsSub: "Schedule a shoot to see sessions here.",
    checkedIn: "Checked In",
    checkIn: "Check In",
    cancel: "Cancel",
    complete: "Complete",
    sharedGallery: "Shared Gallery",
  },
  profile: {
    editProfile: "Edit Profile",
    portfolio: "Portfolio",
    about: "About",
    reviews: "Reviews",
    noPhotos: "No photos yet",
    noPhotosSub: "Upload your best work to showcase your talent.",
    sendRequest: "Send TFP Request",
    messageBtn: "Message",
    report: "Report",
    block: "Block",
    favorite: "Favorite",
    unfavorite: "Unfavorite",
    availableNow: "Available Now",
    styles: "Styles",
    equipment: "Equipment",
    languages: "Languages",
    studio: "Studio",
    measurements: "Measurements",
  },
  settings: {
    title: "Settings",
    account: "Account",
    notifications: "Notifications",
    privacy: "Privacy",
    appearance: "Appearance",
    blockedUsers: "Blocked Users",
    about: "About",
    feedback: "Send Feedback",
    logout: "Log Out",
    deleteAccount: "Delete Account",
    changeEmail: "Change Email",
    changePassword: "Change Password",
    pushNotifications: "Push Notifications",
    requestsFrom: "Accept requests from",
    everyone: "Everyone",
    verified: "Verified Only",
    noOne: "No One",
    hideProfile: "Hide Profile",
    hideDistance: "Hide Distance",
    showOnline: "Show Online Status",
    darkMode: "Dark Mode",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    pro: "Go Pro",
    upgrade: "Upgrade",
  },
  castings: {
    title: "Castings",
    createCasting: "Create Casting",
    open: "Open",
    filled: "Filled",
    expired: "Expired",
    apply: "Apply",
    applied: "Applied",
    manage: "Manage",
    applyNow: "Apply Now",
    noCastings: "No open castings",
    noCastingsSub: "Check back later for new opportunities",
    slots: "slots",
    filledSlots: "filled",
    flexible: "Flexible",
  },
  favorites: {
    title: "Favorites",
    noFavorites: "No favorites yet",
    noFavoritesSub: "Heart profiles you like and they'll appear here.",
  },
  notifications: {
    title: "Notifications",
    noNotifications: "No notifications",
    noNotificationsSub: "You're all caught up!",
    markAllRead: "Mark All Read",
  },
  notifs: {
    tfp_request_new: ({ name, title }) => ({
      title: "New TFP request",
      body: `${name} — "${title}"`,
    }),
    tfp_request_accepted: ({ name }) => ({
      title: "Request accepted 🎉",
      body: `${name} accepted your TFP request`,
    }),
    tfp_request_declined: ({ name }) => ({
      title: "Request update",
      body: `${name} declined your TFP request`,
    }),
    application_new: ({ castingTitle }) => ({
      title: "New application",
      body: `Someone applied to "${castingTitle}"`,
    }),
    application_accepted: ({ castingTitle }) => ({
      title: "Application accepted 🎉",
      body: castingTitle
        ? `You're in on "${castingTitle}". A session has been created.`
        : "Your casting application was accepted! A session has been created.",
    }),
    application_declined: ({ castingTitle }) => ({
      title: "Application update",
      body: castingTitle
        ? `Your application to "${castingTitle}" wasn't selected this time.`
        : "Your casting application wasn't selected this time.",
    }),
    photo_like: ({ name }) => ({
      title: "Someone liked your photo ❤️",
      body: `${name} liked your photo`,
    }),
    photo_comment: ({ name, preview }) => ({
      title: "New comment on your photo 💬",
      body: `${name}: "${preview}"`,
    }),
    gallery_shared: ({ name }) => ({
      title: "Gallery shared 📸",
      body: name
        ? `${name} shared the session photos with you.`
        : "Your session photos are ready to view.",
    }),
  },
  searchPage: {
    title: "Search",
    clearAll: "Clear All",
    searchByName: "Search by name...",
    type: "Type",
    allTypes: "All",
    minRating: "Minimum Rating",
    verifiedOnly: "Verified Only",
    hasStudio: "Has Studio",
    availableDays: "Available Days",
    lastActive: "Last Active",
    onlineNow: "Online Now",
    thisWeek: "This Week",
    thisMonth: "This Month",
    applyFilters: "Apply Filters",
    counting: "Counting...",
    match: "match",
    matches: "matches",
  },
  tfp: {
    sendRequest: "Send TFP Request",
    request: "TFP Request",
    requestAccepted: "Request Accepted",
    requestDeclined: "Request Declined",
    sending: "Sending...",
    schedule: "Schedule a shoot",
  },
  reviews: {
    title: "Reviews",
    submit: "Submit Review",
    submitting: "Submitting...",
    submitted: "Review submitted",
    rateAll: "Please rate all categories",
    overall: "Overall Rating",
  },
  modals: {
    collaborateWith: "Collaborate with",
    whatsTheIdea: "What's the idea?",
    details: "Details",
    personalTouch: "Personal touch",
    projectName: "Give your project a name",
    projectNamePlaceholder: "e.g. Urban Editorial Shoot",
    whatsTheVibe: "What's the vibe?",
    when: "When?",
    pickDate: "Pick a date",
    where: "Where?",
    wherePlaceholder: "Studio, park, rooftop...",
    vision: "Vision",
    visionPlaceholder: "Moody golden hour, natural light, editorial poses...",
    personalNote: "A personal note goes a long way.",
    personalNotePlaceholder: "I'd love to collaborate because...",
    continue: "Continue",
    sendRequest: "Send Request",
    optional: "optional",
    reviewTitle: "Review",
    howWasSession: "How was your session with",
    professionalism: "Professionalism",
    punctuality: "Punctuality",
    communication: "Communication",
    creativity: "Creativity",
    quality: "Quality",
    commentOptional: "Comment (optional)",
    sharePlaceholder: "Share your experience...",
    overallRating: "Overall Rating",
    submitReview: "Submit Review",
    rateAllCategories: "Please rate all categories",
    reviewSubmitted: "Review submitted! It will be visible once both parties review.",
    reportUser: "Report User",
    reportIntro: "for violating community guidelines.",
    reason: "Reason",
    detailsOptional: "Details",
    describePlaceholder: "Describe what happened...",
    submitReport: "Submit Report",
    submitting: "Submitting...",
    reportDisclaimer: "False reports may result in account restrictions. Reports are reviewed within 24-48h.",
    harassment: "Harassment",
    harassmentDesc: "Abusive messages or behavior",
    fakeProfile: "Fake Profile",
    fakeProfileDesc: "Impersonation or false info",
    noShow: "No-Show",
    noShowDesc: "Didn't attend a confirmed session",
    inappropriate: "Inappropriate Content",
    inappropriateDesc: "NSFW or offensive material",
    spam: "Spam",
    spamDesc: "Unsolicited promotion or scam",
    other: "Other",
    otherDesc: "Something else",
    newCasting: "New Casting Call",
    whatsTheShoot: "What's the shoot?",
    nameAndVibe: "Name it and pick a vibe",
    whoAndWhen: "Who & when?",
    talentDateLogistics: "Talent, date & logistics",
    finalDetails: "Final details",
    locationMoodboard: "Location, moodboard & requirements",
    titleLabel: "Title",
    titlePlaceholder: "e.g. Urban Fashion Shoot in Brooklyn",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Describe your shoot concept and what you're looking for...",
    stylesLabel: "Styles",
    whoNeeded: "Who do you need?",
    howManySlots: "How many slots?",
    duration: "Duration",
    locationLabel: "Location",
    locationPlaceholder: "City or address",
    indoor: "Indoor",
    outdoor: "Outdoor",
    moodboard: "Moodboard",
    requirements: "Requirements",
    requirementsPlaceholder: "Any specific requirements, experience level, etc.",
    publishCasting: "Publish Casting 🎬",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    justNow: "Just now",
  },
};

// ─────────────────────────────────────────────────────────────────────
// PT-BR — voz PermutaModel. Dicionário Seção 5 do PROMPT_SESSAO_2 manda.
// ─────────────────────────────────────────────────────────────────────

const messagesPT: Strings["messages"] = {
  title: "DMs",
  noMessages: "Sem DMs ainda",
  noMessagesSub: "Começa uma conversa pra ver as mensagens por aqui.",
  typeMessage: "Escreve aí...",
  send: "Enviar",
  online: "Online",
  offline: "Offline",
  archived: "Arquivadas",
};

const authPT: Strings["auth"] = {
  welcome: "Salve, cola aqui",
  welcomeBack: "E aí, voltou!",
  signIn: "Entrar",
  signUp: "Faz teu cadastro",
  createAccount: "Cria tua conta",
  signingIn: "Entrando...",
  creatingAccount: "Criando tua conta...",
  forgotPassword: "Esqueceu a senha?",
  alreadyHaveAccount: "Já tem conta?",
  dontHaveAccount: "Ainda não tem conta?",
  emailPlaceholder: "Email",
  passwordPlaceholder: "Senha",
  confirmPasswordPlaceholder: "Confirma a senha",
  fullNamePlaceholder: "Teu nome",
  checkEmail: "Confere teu email pra ativar a conta antes de entrar.",
  alreadyRegistered: "Esse email já tá cadastrado. Tenta entrar.",
};

export const PT_BR: Strings = {
  common: {
    loading: "Carregando",
    error: "Deu ruim",
    success: "Beleza",
    retry: "Tentar de novo",
    back: "Voltar",
    next: "Próximo",
    done: "Pronto",
    close: "Fechar",
    confirm: "Confirmar",
    cancel: "Cancelar",
    delete: "Apagar",
    edit: "Editar",
    save: "Salvar",
    saveChanges: "Salvar alterações",
    search: "Buscar",
    filter: "Filtrar",
    sort: "Ordenar",
    more: "Mais",
    less: "Menos",
    yes: "Sim",
    no: "Não",
    or: "ou",
    and: "e",
    ago: "atrás",
    minutes: "min",
    hours: "h",
    days: "d",
    today: "Hoje",
    yesterday: "Ontem",
    required: "Obrigatório",
    optional: "Opcional",
    empty: "Tá vazio por aqui",
    photographer: "Fotógrafo",
    model: "Modelo",
    creative: "Criativo",
    dual: "Fotógrafo & Modelo",
  },
  cta: {
    continue: "Bora",
    getStarted: "Bora começar",
    knowMore: "Saber mais",
    seeAll: "Ver tudo",
    tryAgain: "Tentar de novo",
  },
  errors: {
    generic: "Deu ruim por aqui.",
    network: "Problema de conexão. Confere a internet e tenta de novo.",
    server: "Nosso servidor deu uma travada. Tenta de novo daqui a pouco.",
    notFound: "Não achamos isso.",
    sessionExpired: "Tua sessão expirou. Entra de novo, por favor.",
    permissionDenied: "Você não tem permissão pra fazer isso.",
    unsupported: "Ainda não rola isso por aqui.",
  },
  validation: {
    required: "Obrigatório",
    invalidEmail: "Email inválido",
    passwordTooShort: "A senha precisa de pelo menos 6 caracteres",
    passwordsDontMatch: "As senhas não batem",
    nameRequired: "Coloca teu nome aí",
    maxFileSize: (mb) => `Limite de ${mb}MB`,
  },
  profileCompletion: {
    title: "Perfil completo",
    completeCta: "Completar meu perfil",
    items: {
      avatar: "Foto de perfil",
      bio: "Bio",
      location: "Localização",
      styles: "Estilos",
      instagram: "Instagram ou site",
      photos: "Fotos do book",
      availability: "Disponibilidade",
      equipment: "Equipamento ou medidas",
    },
  },
  availability: {
    setAsAvailable: "Ativar 'Tô na ativa'",
    setAvailability: "Tô na ativa",
    intro: "Avisa que tu tá disponível pra permuta agora.",
    howLong: "Por quanto tempo?",
    today: "Hoje",
    threeDays: "3 dias",
    oneWeek: "1 semana",
    detailsLabel: "Detalhes (opcional)",
    detailsPlaceholder: "Ex: 'Livre hoje, 14h-18h, zona oeste de SP'",
    activate: "Ativar",
    activating: "Ativando...",
    tapToDisable: "Toca pra desligar",
    turnedOff: "Saiu do 'Tô na ativa'",
    activated: "Tu tá na ativa! ⚡",
    updateFailed: "Não rolou atualizar a disponibilidade",
    activateFailed: "Não rolou ativar a disponibilidade",
  },
  achievements: {
    title: "Conquistas",
    types: {
      first_session: { label: "Primeiro ensaio", description: "Concluiu teu primeiro ensaio" },
      five_sessions: { label: "5 ensaios", description: "Concluiu 5 ensaios" },
      ten_sessions: { label: "10 ensaios", description: "Concluiu 10 ensaios" },
      first_review: { label: "Primeiro recadinho", description: "Recebeu teu primeiro recadinho" },
      five_star: { label: "Nota 5", description: "Alcançou avaliação 5 estrelas" },
      top_rated: { label: "Top na área", description: "Top avaliado na tua região" },
      verified: { label: "Verificado", description: "Identidade verificada" },
      popular: { label: "Popular", description: "Salvo por 10+ pessoas" },
    },
  },
  errorBoundary: {
    title: "Deu ruim por aqui",
    message: "Aconteceu um erro inesperado. Tenta recarregar a página.",
    refresh: "Recarregar",
  },
  nav: {
    discover: "Início",
    dashboard: "Painel",
    messages: "DMs",
    sessions: "Ensaios",
    profile: "Perfil",
    settings: "Ajustes",
    favorites: "Salvos",
    notifications: "Avisos",
    castings: "Trampos",
    search: "Buscar",
  },
  auth: authPT,
  login: {
    emailPlaceholder: "Email",
    passwordPlaceholder: "Senha",
    confirmPasswordPlaceholder: "Confirma a senha",
    fullNamePlaceholder: "Teu nome",
    signIn: "Entrar",
    signUp: "Faz teu cadastro",
    signingIn: "Entrando...",
    creatingAccount: "Criando tua conta...",
    createAccount: "Cria tua conta",
    alreadyHaveAccount: "Já tem conta?",
    dontHaveAccount: "Ainda não tem conta?",
    passwordsDontMatch: "As senhas não batem",
    enterName: "Coloca teu nome aí",
    checkEmail: "Confere teu email pra ativar a conta antes de entrar.",
    alreadyRegistered: "Esse email já tá cadastrado. Tenta entrar.",
    forgotPassword: "Esqueceu a senha?",
  },
  onboarding: {
    welcome: "Salve, cola aqui",
    welcomeSub: "Bora montar teu perfil",
    letsGo: "Bora",
    skip: "Pular",
    finish: "Finalizar",
  },
  discover: {
    title: "Início",
    setLocation: "Definir local",
    creatives: "Criativos",
    castings: "Trampos",
    searchPlaceholder: "Busca fotógrafos, modelos, cidades...",
    all: "Tudo",
    photographers: "Fotógrafos",
    models: "Modelos",
    available: "Disponíveis",
    highestRated: "Melhor avaliados",
    recentlyActive: "Ativos agora",
    newest: "Mais novos",
    specialties: "Especialidades",
    experienceLevel: "Nível de experiência",
    allLevels: "Todos os níveis",
    beginner: "Iniciante",
    intermediate: "Intermediário",
    advanced: "Avançado",
    professional: "Profissional",
    location: "Localização",
    locationPlaceholder: "Cidade ou estado...",
    distance: "Distância",
    showAllDistances: "Mostrar todas as distâncias",
    clearAllFilters: "Limpar filtros",
    showing: "Mostrando",
    creative: "criativo",
    creativeS: "criativos",
    availableNow: "Tô na ativa",
    online: "online",
    noCreatives: "Ninguém por aqui ainda",
    noCreativesSub: "Tenta ajustar os filtros",
    verified: "Verificado",
    reviews: "recadinhos",
    greetingMorning: (name) => `Bom dia, ${name}`,
    greetingAfternoon: (name) => `Boa tarde, ${name}`,
    greetingEvening: (name) => `Boa noite, ${name}`,
  },
  dashboard: {
    title: "Painel",
    received: "Recebidos",
    sent: "Enviados",
    myCastings: "Meus trampos",
    pending: "Pendente",
    accepted: "Topado",
    declined: "Recusado",
    completed: "Concluído",
    counter: "Contraproposta",
    noRequests: "Nenhuma permuta ainda",
    noRequestsSub: "Quando rolarem pedidos de permuta, eles aparecem aqui.",
    viewProfile: "Ver perfil",
    accept: "Topar",
    decline: "Recusar",
    message: "Mandar DM",
    leaveReview: "Deixar recadinho",
    reviewed: "Recado enviado",
    discoverCreatives: "Achar gente",
  },
  messages: messagesPT,
  chat: messagesPT,
  sessions: {
    title: "Ensaios",
    upcoming: "Próximos",
    past: "Concluídos",
    cancelled: "Cancelados",
    noSessions: "Nenhum ensaio ainda",
    noSessionsSub: "Marca um rolê pra ver os ensaios aqui.",
    checkedIn: "Check-in feito",
    checkIn: "Fazer check-in",
    cancel: "Cancelar",
    complete: "Concluir",
    sharedGallery: "Galeria compartilhada",
  },
  profile: {
    editProfile: "Editar perfil",
    portfolio: "Book",
    about: "Sobre",
    reviews: "Recadinhos",
    noPhotos: "Sem fotos ainda",
    noPhotosSub: "Sobe tuas melhores fotos pra mostrar teu talento.",
    sendRequest: "Chamar pra permuta",
    messageBtn: "DM",
    report: "Denunciar",
    block: "Bloquear",
    favorite: "Salvar",
    unfavorite: "Tirar dos salvos",
    availableNow: "Tô na ativa",
    styles: "Estilos",
    equipment: "Equipamento",
    languages: "Idiomas",
    studio: "Estúdio",
    measurements: "Medidas",
  },
  settings: {
    title: "Ajustes",
    account: "Conta",
    notifications: "Avisos",
    privacy: "Privacidade",
    appearance: "Aparência",
    blockedUsers: "Bloqueados",
    about: "Sobre",
    feedback: "Mandar feedback",
    logout: "Sair",
    deleteAccount: "Apagar conta",
    changeEmail: "Trocar email",
    changePassword: "Trocar senha",
    pushNotifications: "Notificações push",
    requestsFrom: "Aceitar pedidos de",
    everyone: "Todo mundo",
    verified: "Só verificados",
    noOne: "Ninguém",
    hideProfile: "Esconder perfil",
    hideDistance: "Esconder distância",
    showOnline: "Mostrar quando tô online",
    darkMode: "Modo escuro",
    save: "Salvar",
    saving: "Salvando...",
    cancel: "Cancelar",
    pro: "Vira Pro",
    upgrade: "Fazer upgrade",
  },
  castings: {
    title: "Trampos",
    createCasting: "Criar trampo",
    open: "Aberto",
    filled: "Preenchido",
    expired: "Expirado",
    apply: "Tô dentro",
    applied: "Tô dentro",
    manage: "Gerenciar",
    applyNow: "Tô dentro",
    noCastings: "Nenhum trampo aberto",
    noCastingsSub: "Volta depois pra conferir novidades",
    slots: "vagas",
    filledSlots: "preenchidas",
    flexible: "Flexível",
  },
  favorites: {
    title: "Salvos",
    noFavorites: "Nada salvo ainda",
    noFavoritesSub: "Salva os perfis que curtir e eles aparecem aqui.",
  },
  notifications: {
    title: "Avisos",
    noNotifications: "Sem avisos",
    noNotificationsSub: "Tá tudo em dia por aqui!",
    markAllRead: "Marcar tudo como lido",
  },
  notifs: {
    tfp_request_new: ({ name, title }) => ({
      title: "Nova permuta",
      body: `${name} — "${title}"`,
    }),
    tfp_request_accepted: ({ name }) => ({
      title: "Topou! 🎉",
      body: `${name} topou tua permuta`,
    }),
    tfp_request_declined: ({ name }) => ({
      title: "Não rolou dessa vez",
      body: `${name} não topou tua permuta`,
    }),
    application_new: ({ castingTitle }) => ({
      title: "Nova candidatura",
      body: `Alguém quer entrar em "${castingTitle}"`,
    }),
    application_accepted: ({ castingTitle }) => ({
      title: "Tá dentro! 🎉",
      body: castingTitle
        ? `Você tá dentro de "${castingTitle}". Já criamos o ensaio.`
        : "Sua candidatura foi aceita! Já criamos o ensaio.",
    }),
    application_declined: ({ castingTitle }) => ({
      title: "Não rolou dessa vez",
      body: castingTitle
        ? `Tua candidatura pra "${castingTitle}" não foi escolhida dessa vez.`
        : "Tua candidatura não foi escolhida dessa vez.",
    }),
    photo_like: ({ name }) => ({
      title: "Curtiram tua foto ❤️",
      body: `${name} curtiu tua foto`,
    }),
    photo_comment: ({ name, preview }) => ({
      title: "Recadinho novo na tua foto 💬",
      body: `${name}: "${preview}"`,
    }),
    gallery_shared: ({ name }) => ({
      title: "Galeria liberada 📸",
      body: name
        ? `${name} compartilhou as fotos do ensaio com você.`
        : "Tuas fotos do ensaio tão prontas pra ver.",
    }),
  },
  searchPage: {
    title: "Buscar",
    clearAll: "Limpar tudo",
    searchByName: "Busca por nome...",
    type: "Tipo",
    allTypes: "Tudo",
    minRating: "Avaliação mínima",
    verifiedOnly: "Só verificados",
    hasStudio: "Tem estúdio",
    availableDays: "Dias disponíveis",
    lastActive: "Última atividade",
    onlineNow: "Online agora",
    thisWeek: "Esta semana",
    thisMonth: "Este mês",
    applyFilters: "Aplicar filtros",
    counting: "Contando...",
    match: "resultado",
    matches: "resultados",
  },
  tfp: {
    sendRequest: "Chamar pra permuta",
    request: "Permuta",
    requestAccepted: "Topou!",
    requestDeclined: "Não rolou dessa vez",
    sending: "Enviando...",
    schedule: "Marcar o rolê",
  },
  reviews: {
    title: "Recadinhos",
    submit: "Mandar recadinho",
    submitting: "Mandando...",
    submitted: "Recadinho mandado",
    rateAll: "Avalia todas as categorias",
    overall: "Nota geral",
  },
  modals: {
    collaborateWith: "Colaborar com",
    whatsTheIdea: "Qual é a ideia?",
    details: "Detalhes",
    personalTouch: "Toque pessoal",
    projectName: "Dá um nome pro teu projeto",
    projectNamePlaceholder: "ex: Ensaio Editorial Urbano",
    whatsTheVibe: "Qual é a vibe?",
    when: "Quando?",
    pickDate: "Escolhe uma data",
    where: "Onde?",
    wherePlaceholder: "Estúdio, parque, terraço...",
    vision: "Visão",
    visionPlaceholder: "Golden hour, luz natural, poses editoriais...",
    personalNote: "Uma mensagem pessoal faz toda diferença.",
    personalNotePlaceholder: "Adoraria colaborar porque...",
    continue: "Bora",
    sendRequest: "Chamar pra permuta",
    optional: "opcional",
    reviewTitle: "Recadinho",
    howWasSession: "Como foi teu ensaio com",
    professionalism: "Profissionalismo",
    punctuality: "Pontualidade",
    communication: "Comunicação",
    creativity: "Criatividade",
    quality: "Qualidade",
    commentOptional: "Comentário (opcional)",
    sharePlaceholder: "Conta como foi a experiência...",
    overallRating: "Nota geral",
    submitReview: "Mandar recadinho",
    rateAllCategories: "Avalia todas as categorias",
    reviewSubmitted: "Recadinho mandado! Vai ficar visível quando os dois avaliarem.",
    reportUser: "Denunciar usuário",
    reportIntro: "por violar as regras da comunidade.",
    reason: "Motivo",
    detailsOptional: "Detalhes",
    describePlaceholder: "Conta o que aconteceu...",
    submitReport: "Mandar denúncia",
    submitting: "Mandando...",
    reportDisclaimer: "Denúncias falsas podem dar restrição na conta. A gente analisa em 24-48h.",
    harassment: "Assédio",
    harassmentDesc: "Mensagens ou comportamento abusivo",
    fakeProfile: "Perfil falso",
    fakeProfileDesc: "Falsidade ideológica ou info falsa",
    noShow: "Não apareceu",
    noShowDesc: "Faltou num ensaio confirmado",
    inappropriate: "Conteúdo inapropriado",
    inappropriateDesc: "Material NSFW ou ofensivo",
    spam: "Spam",
    spamDesc: "Promoção não solicitada ou golpe",
    other: "Outro",
    otherDesc: "Algo diferente",
    newCasting: "Novo trampo",
    whatsTheShoot: "Qual é o ensaio?",
    nameAndVibe: "Dá um nome e escolhe a vibe",
    whoAndWhen: "Quem e quando?",
    talentDateLogistics: "Talento, data e logística",
    finalDetails: "Detalhes finais",
    locationMoodboard: "Local, moodboard e requisitos",
    titleLabel: "Título",
    titlePlaceholder: "ex: Ensaio Fashion em SP",
    descriptionLabel: "Descrição",
    descriptionPlaceholder: "Descreve o conceito do ensaio e o que tu procura...",
    stylesLabel: "Estilos",
    whoNeeded: "Quem você precisa?",
    howManySlots: "Quantas vagas?",
    duration: "Duração",
    locationLabel: "Local",
    locationPlaceholder: "Cidade ou endereço",
    indoor: "Interno",
    outdoor: "Externo",
    moodboard: "Moodboard",
    requirements: "Requisitos",
    requirementsPlaceholder: "Requisitos específicos, nível de experiência, etc.",
    publishCasting: "Publicar trampo 🎬",
    morning: "Manhã",
    afternoon: "Tarde",
    evening: "Noite",
    justNow: "Agora mesmo",
  },
};

/** Back-compat alias for the legacy `AppTranslations` type. */
export type AppTranslations = Strings;

/** Convenience accessor used by the useTranslation hook. */
export function getStrings(lang: string): Strings {
  return lang.startsWith("pt") ? PT_BR : EN;
}
