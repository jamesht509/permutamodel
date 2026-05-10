// Brand configuration for multi-domain deployment
export interface BrandConfig {
  name: string;
  tagline: string;
  domain: string;
  lang: string;
  country: string;
  seo: {
    title: string;
    description: string;
    image: string;
  };
  landing: {
    heroSubtitle: string;
    heroTitle: string;
    heroHighlight: string;
    heroDescription: string;
    ctaButton: string;
    ctaFinal: string;
    ctaFinalSub: string;
    featuredTitle: string;
    featuredSubtitle: string;
    howItWorksTitle: string;
    howItWorksSub: string;
    testimonialsTitle: string;
    testimonialsSub: string;
    readyTitle: string;
    readySub: string;
    pressTitle: string;
    steps: { title: string; desc: string }[];
    stats: { label: string }[];
    signIn: string;
    joinFree: string;
  };
  footer: {
    terms: string;
    privacy: string;
    madeBy: string;
  };
}

const US_BRAND: BrandConfig = {
  name: "CollabShoot",
  tagline: "The premier TFP network",
  domain: "collabshoot.com",
  lang: "en",
  country: "US",
  seo: {
    title: "CollabShoot — Connect Photographers & Models for TFP",
    description: "The premier platform for photographer-model collaboration. Find TFP partners, build your portfolio, grow your network.",
    image: "/og-image-us.png",
  },
  landing: {
    heroSubtitle: "The premier TFP network",
    heroTitle: "Where Photographers & Models",
    heroHighlight: "Create Together",
    heroDescription: "Connect with talented creatives across the United States. Build your portfolio through collaborative TFP shoots.",
    ctaButton: "Join CollabShoot — It's Free",
    ctaFinal: "Ready to Create?",
    ctaFinalSub: "Join photographers and models who are building their portfolios through collaboration.",
    featuredTitle: "Featured Creatives",
    featuredSubtitle: "Discover Talent",
    howItWorksTitle: "How It Works",
    howItWorksSub: "Simple & Elegant",
    testimonialsTitle: "What Creatives Say",
    testimonialsSub: "Real Stories",
    readyTitle: "Ready to Create?",
    readySub: "Join photographers and models who are building their portfolios through collaboration.",
    pressTitle: "As Featured In",
    steps: [
      { title: "Create Your Profile", desc: "Showcase your portfolio and define your creative style." },
      { title: "Browse & Connect", desc: "Discover photographers and models near you for TFP collaborations." },
      { title: "Collaborate", desc: "Send TFP requests, schedule shoots, and build your portfolio together." },
    ],
    stats: [{ label: "TFP Focused" }, { label: "Forever" }, { label: "Coverage" }],
    signIn: "Sign In",
    joinFree: "Join Free",
  },
  footer: {
    terms: "Terms",
    privacy: "Privacy",
    madeBy: "Made with ❤️ by Jemson Marius",
  },
};

const BR_BRAND: BrandConfig = {
  name: "PermutaModel",
  tagline: "A rede de permuta criativa",
  domain: "permutamodel.com.br",
  lang: "pt-BR",
  country: "BR",
  seo: {
    title: "PermutaModel — Conecte Fotógrafos e Modelos para Permuta (TFP)",
    description: "A plataforma líder para colaboração entre fotógrafos e modelos. Encontre parceiros TFP, construa seu portfólio, cresça sua rede.",
    image: "/og-image-br.png",
  },
  landing: {
    heroSubtitle: "A rede de permuta criativa",
    heroTitle: "Onde Fotógrafos e Modelos",
    heroHighlight: "Criam Juntos",
    heroDescription: "Conecte-se com criativos talentosos em todo o Brasil. Construa seu portfólio através de ensaios colaborativos.",
    ctaButton: "Entrar no PermutaModel — É Grátis",
    ctaFinal: "Pronto para Criar?",
    ctaFinalSub: "Junte-se a fotógrafos e modelos que estão construindo seus portfólios através da colaboração.",
    featuredTitle: "Criativos em Destaque",
    featuredSubtitle: "Descubra Talentos",
    howItWorksTitle: "Como Funciona",
    howItWorksSub: "Simples & Elegante",
    testimonialsTitle: "O Que Dizem os Criativos",
    testimonialsSub: "Histórias Reais",
    readyTitle: "Pronto para Criar?",
    readySub: "Junte-se a fotógrafos e modelos que estão construindo seus portfólios através da colaboração.",
    pressTitle: "Como Visto Em",
    steps: [
      { title: "Crie Seu Perfil", desc: "Mostre seu portfólio e defina seu estilo criativo." },
      { title: "Explore & Conecte", desc: "Descubra fotógrafos e modelos perto de você para permutas." },
      { title: "Colabore", desc: "Envie pedidos de permuta, agende ensaios e construa seu portfólio juntos." },
    ],
    stats: [{ label: "Focado em TFP" }, { label: "Pra Sempre" }, { label: "Cobertura" }],
    signIn: "Entrar",
    joinFree: "Cadastrar Grátis",
  },
  footer: {
    terms: "Termos",
    privacy: "Privacidade",
    madeBy: "Feito com ❤️ por Jemson Marius",
  },
};

function detectBrand(): BrandConfig {
  const hostname = window.location.hostname;

  // Check domain
  if (hostname.includes("permutamodel") || hostname.endsWith(".com.br")) {
    return BR_BRAND;
  }

  // Fallback: check browser language
  if (typeof navigator !== "undefined") {
    const lang = navigator.language || "";
    if (lang.startsWith("pt")) {
      // Only auto-detect if no explicit domain match (preview environments)
      // In production, domain takes priority
      if (hostname.includes("localhost") || hostname.includes("lovable.app")) {
        // In preview, use US brand by default, user can test BR via ?lang=pt
        const params = new URLSearchParams(window.location.search);
        if (params.get("lang") === "pt") return BR_BRAND;
      }
    }
  }

  return US_BRAND;
}

// Singleton
let _brand: BrandConfig | null = null;

export function getBrand(): BrandConfig {
  if (!_brand) _brand = detectBrand();
  return _brand;
}

// Reset (useful for testing with ?lang=pt)
export function resetBrand() {
  _brand = null;
}
