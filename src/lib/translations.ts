// Comprehensive i18n translations for all app pages
// Brazilian Portuguese uses casual, friendly tone ("jeitinho brasileiro")

export interface AppTranslations {
  // Navigation & Layout
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
  // Discover page
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
  };
  // Dashboard
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
  // Messages
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
  // Sessions
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
  // Profile
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
  // Settings
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
  // Castings
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
  // Favorites
  favorites: {
    title: string;
    noFavorites: string;
    noFavoritesSub: string;
  };
  // Notifications
  notifications: {
    title: string;
    noNotifications: string;
    noNotificationsSub: string;
    markAllRead: string;
  };
  // Common / Shared
  common: {
    loading: string;
    error: string;
    retry: string;
    back: string;
    next: string;
    done: string;
    close: string;
    confirm: string;
    delete: string;
    edit: string;
    save: string;
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
    photographer: string;
    model: string;
    creative: string;
    dual: string;
  };
  // Onboarding
  onboarding: {
    welcome: string;
    welcomeSub: string;
    letsGo: string;
    skip: string;
    finish: string;
  };
  // Search page
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
  // Login
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
  // Modals
  modals: {
    // TFP Request
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
    // Review
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
    // Report
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
    // Create Casting
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
    // Time ago
    justNow: string;
  };
}

const en: AppTranslations = {
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
  messages: {
    title: "Messages",
    noMessages: "No messages yet",
    noMessagesSub: "Start a conversation with someone to see messages here.",
    typeMessage: "Type a message...",
    send: "Send",
    online: "Online",
    offline: "Offline",
    archived: "Archived",
  },
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
  common: {
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Try again",
    back: "Back",
    next: "Next",
    done: "Done",
    close: "Close",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    save: "Save",
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
    photographer: "Photographer",
    model: "Model",
    creative: "Creative",
    dual: "Dual",
  },
  onboarding: {
    welcome: "Welcome!",
    welcomeSub: "Let's set up your profile",
    letsGo: "Let's Go",
    skip: "Skip",
    finish: "Finish",
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

const ptBR: AppTranslations = {
  nav: {
    discover: "Explorar",
    dashboard: "Painel",
    messages: "Mensagens",
    sessions: "Ensaios",
    profile: "Perfil",
    settings: "Ajustes",
    favorites: "Favoritos",
    notifications: "Notificações",
    castings: "Castings",
    search: "Buscar",
  },
  discover: {
    title: "Explorar",
    setLocation: "Definir local",
    creatives: "Criativos",
    castings: "Castings",
    searchPlaceholder: "Busque fotógrafos, modelos, cidades...",
    all: "Todos",
    photographers: "Fotógrafos",
    models: "Modelos",
    available: "Disponível",
    highestRated: "Melhor Avaliados",
    recentlyActive: "Ativos Recente",
    newest: "Mais Novos",
    specialties: "Especialidades",
    experienceLevel: "Nível de Experiência",
    allLevels: "Todos os Níveis",
    beginner: "Iniciante",
    intermediate: "Intermediário",
    advanced: "Avançado",
    professional: "Profissional",
    location: "Localização",
    locationPlaceholder: "Cidade ou estado...",
    distance: "Distância",
    showAllDistances: "Mostrar todas as distâncias",
    clearAllFilters: "Limpar todos os filtros",
    showing: "Mostrando",
    creative: "criativo",
    creativeS: "criativos",
    availableNow: "Disponíveis Agora",
    online: "online",
    noCreatives: "Nenhum criativo encontrado",
    noCreativesSub: "Tenta ajustar os filtros aí",
    verified: "Verificado",
    reviews: "avaliações",
  },
  dashboard: {
    title: "Painel",
    received: "Recebidos",
    sent: "Enviados",
    myCastings: "Meus Castings",
    pending: "Pendente",
    accepted: "Aceito",
    declined: "Recusado",
    completed: "Concluído",
    counter: "Contraproposta",
    noRequests: "Nenhum pedido ainda",
    noRequestsSub: "Quando você receber ou enviar pedidos de permuta, eles vão aparecer aqui.",
    viewProfile: "Ver Perfil",
    accept: "Aceitar",
    decline: "Recusar",
    message: "Mensagem",
    leaveReview: "Deixar Avaliação",
    reviewed: "Avaliado",
    discoverCreatives: "Explorar Criativos",
  },
  messages: {
    title: "Mensagens",
    noMessages: "Nenhuma mensagem ainda",
    noMessagesSub: "Comece uma conversa com alguém pra ver as mensagens aqui.",
    typeMessage: "Digite uma mensagem...",
    send: "Enviar",
    online: "Online",
    offline: "Offline",
    archived: "Arquivadas",
  },
  sessions: {
    title: "Ensaios",
    upcoming: "Próximos",
    past: "Concluídos",
    cancelled: "Cancelados",
    noSessions: "Nenhum ensaio ainda",
    noSessionsSub: "Agende um ensaio pra ver aqui.",
    checkedIn: "Check-in Feito",
    checkIn: "Fazer Check-in",
    cancel: "Cancelar",
    complete: "Concluir",
    sharedGallery: "Galeria Compartilhada",
  },
  profile: {
    editProfile: "Editar Perfil",
    portfolio: "Portfólio",
    about: "Sobre",
    reviews: "Avaliações",
    noPhotos: "Nenhuma foto ainda",
    noPhotosSub: "Suba suas melhores fotos pra mostrar seu talento.",
    sendRequest: "Enviar Pedido de Permuta",
    messageBtn: "Mensagem",
    report: "Denunciar",
    block: "Bloquear",
    favorite: "Favoritar",
    unfavorite: "Desfavoritar",
    availableNow: "Disponível Agora",
    styles: "Estilos",
    equipment: "Equipamento",
    languages: "Idiomas",
    studio: "Estúdio",
    measurements: "Medidas",
  },
  settings: {
    title: "Ajustes",
    account: "Conta",
    notifications: "Notificações",
    privacy: "Privacidade",
    appearance: "Aparência",
    blockedUsers: "Usuários Bloqueados",
    about: "Sobre",
    feedback: "Enviar Feedback",
    logout: "Sair",
    deleteAccount: "Excluir Conta",
    changeEmail: "Alterar E-mail",
    changePassword: "Alterar Senha",
    pushNotifications: "Notificações Push",
    requestsFrom: "Aceitar pedidos de",
    everyone: "Todos",
    verified: "Só Verificados",
    noOne: "Ninguém",
    hideProfile: "Ocultar Perfil",
    hideDistance: "Ocultar Distância",
    showOnline: "Mostrar Status Online",
    darkMode: "Modo Escuro",
    save: "Salvar",
    saving: "Salvando...",
    cancel: "Cancelar",
    pro: "Seja Pro",
    upgrade: "Fazer Upgrade",
  },
  castings: {
    title: "Castings",
    createCasting: "Criar Casting",
    open: "Aberto",
    filled: "Preenchido",
    expired: "Expirado",
    apply: "Candidatar",
    applied: "Candidatado",
    manage: "Gerenciar",
    applyNow: "Candidatar-se",
    noCastings: "Nenhum casting aberto",
    noCastingsSub: "Volte depois pra conferir novas oportunidades",
    slots: "vagas",
    filledSlots: "preenchidas",
    flexible: "Flexível",
  },
  favorites: {
    title: "Favoritos",
    noFavorites: "Nenhum favorito ainda",
    noFavoritesSub: "Curta perfis que você gosta e eles vão aparecer aqui.",
  },
  notifications: {
    title: "Notificações",
    noNotifications: "Nenhuma notificação",
    noNotificationsSub: "Tudo em dia por aqui!",
    markAllRead: "Marcar Tudo como Lido",
  },
  common: {
    loading: "Carregando...",
    error: "Algo deu errado",
    retry: "Tentar de novo",
    back: "Voltar",
    next: "Próximo",
    done: "Pronto",
    close: "Fechar",
    confirm: "Confirmar",
    delete: "Excluir",
    edit: "Editar",
    save: "Salvar",
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
    photographer: "Fotógrafo",
    model: "Modelo",
    creative: "Criativo",
    dual: "Fotógrafo & Modelo",
  },
  onboarding: {
    welcome: "Bem-vindo!",
    welcomeSub: "Vamos montar seu perfil",
    letsGo: "Bora!",
    skip: "Pular",
    finish: "Finalizar",
  },
  searchPage: {
    title: "Buscar",
    clearAll: "Limpar Tudo",
    searchByName: "Buscar por nome...",
    type: "Tipo",
    allTypes: "Todos",
    minRating: "Avaliação Mínima",
    verifiedOnly: "Só Verificados",
    hasStudio: "Tem Estúdio",
    availableDays: "Dias Disponíveis",
    lastActive: "Última Atividade",
    onlineNow: "Online Agora",
    thisWeek: "Esta Semana",
    thisMonth: "Este Mês",
    applyFilters: "Aplicar Filtros",
    counting: "Contando...",
    match: "resultado",
    matches: "resultados",
  },
  login: {
    emailPlaceholder: "Endereço de e-mail",
    passwordPlaceholder: "Senha",
    confirmPasswordPlaceholder: "Confirmar Senha",
    fullNamePlaceholder: "Nome Completo",
    signIn: "Entrar",
    signUp: "Cadastrar",
    signingIn: "Entrando...",
    creatingAccount: "Criando Conta...",
    createAccount: "Criar Conta",
    alreadyHaveAccount: "Já tem uma conta?",
    dontHaveAccount: "Não tem uma conta?",
    passwordsDontMatch: "As senhas não coincidem",
    enterName: "Por favor, insira seu nome",
    checkEmail: "Verifique seu e-mail para confirmar sua conta antes de entrar.",
    alreadyRegistered: "Este e-mail já está cadastrado. Tente entrar.",
    forgotPassword: "Esqueceu a senha?",
  },
  modals: {
    collaborateWith: "Colaborar com",
    whatsTheIdea: "Qual é a ideia?",
    details: "Detalhes",
    personalTouch: "Toque pessoal",
    projectName: "Dê um nome pro seu projeto",
    projectNamePlaceholder: "ex: Ensaio Editorial Urbano",
    whatsTheVibe: "Qual é a vibe?",
    when: "Quando?",
    pickDate: "Escolha uma data",
    where: "Onde?",
    wherePlaceholder: "Estúdio, parque, terraço...",
    vision: "Visão",
    visionPlaceholder: "Golden hour, luz natural, poses editoriais...",
    personalNote: "Uma mensagem pessoal faz toda a diferença.",
    personalNotePlaceholder: "Adoraria colaborar porque...",
    continue: "Continuar",
    sendRequest: "Enviar Pedido",
    optional: "opcional",
    reviewTitle: "Avaliação",
    howWasSession: "Como foi seu ensaio com",
    professionalism: "Profissionalismo",
    punctuality: "Pontualidade",
    communication: "Comunicação",
    creativity: "Criatividade",
    quality: "Qualidade",
    commentOptional: "Comentário (opcional)",
    sharePlaceholder: "Conta como foi a experiência...",
    overallRating: "Nota Geral",
    submitReview: "Enviar Avaliação",
    rateAllCategories: "Avalie todas as categorias",
    reviewSubmitted: "Avaliação enviada! Ela ficará visível quando ambos avaliarem.",
    reportUser: "Denunciar Usuário",
    reportIntro: "por violar as diretrizes da comunidade.",
    reason: "Motivo",
    detailsOptional: "Detalhes",
    describePlaceholder: "Descreva o que aconteceu...",
    submitReport: "Enviar Denúncia",
    submitting: "Enviando...",
    reportDisclaimer: "Denúncias falsas podem resultar em restrições na conta. Denúncias são analisadas em 24-48h.",
    harassment: "Assédio",
    harassmentDesc: "Mensagens ou comportamento abusivo",
    fakeProfile: "Perfil Falso",
    fakeProfileDesc: "Falsidade ideológica ou info falsa",
    noShow: "Não Compareceu",
    noShowDesc: "Faltou a um ensaio confirmado",
    inappropriate: "Conteúdo Inapropriado",
    inappropriateDesc: "Material NSFW ou ofensivo",
    spam: "Spam",
    spamDesc: "Promoção não solicitada ou golpe",
    other: "Outro",
    otherDesc: "Algo diferente",
    newCasting: "Novo Casting",
    whatsTheShoot: "Qual é o ensaio?",
    nameAndVibe: "Dê um nome e escolha a vibe",
    whoAndWhen: "Quem e quando?",
    talentDateLogistics: "Talento, data e logística",
    finalDetails: "Detalhes finais",
    locationMoodboard: "Local, moodboard e requisitos",
    titleLabel: "Título",
    titlePlaceholder: "ex: Ensaio Fashion Urbano em SP",
    descriptionLabel: "Descrição",
    descriptionPlaceholder: "Descreva o conceito do ensaio e o que você procura...",
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
    publishCasting: "Publicar Casting 🎬",
    morning: "Manhã",
    afternoon: "Tarde",
    evening: "Noite",
    justNow: "Agora mesmo",
  },
};

export function getTranslations(lang: string): AppTranslations {
  return lang.startsWith("pt") ? ptBR : en;
}
