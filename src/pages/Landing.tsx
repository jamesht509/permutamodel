import { useNavigate, Navigate } from "react-router-dom";
import { Camera, Users, Handshake, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { useBrand } from "@/hooks/useBrand";
import { useAuth } from "@/hooks/useAuth";

const FEATURED = [
  { name: "Marcus Chen", role: "Photographer", city: "New York", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=85", pro: true },
  { name: "Aisha Johnson", role: "Model", city: "Los Angeles", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=85", pro: false },
  { name: "Sofia Rodriguez", role: "Both", city: "Miami", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=85", pro: false },
  { name: "James Wright", role: "Photographer", city: "Chicago", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=85", pro: true },
  { name: "Naomi Williams", role: "Model", city: "Atlanta", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=85", pro: false },
  { name: "David Kim", role: "Photographer", city: "San Francisco", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&q=85", pro: false },
];

const TESTIMONIALS_EN = [
  { name: "Elena Vasquez", role: "Model", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80", text: "CollabShoot helped me build my portfolio from scratch. I've done 12 TFP shoots in 3 months and landed my first agency contract." },
  { name: "Ryan Mitchell", role: "Photographer", img: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200&q=80", text: "The quality of models on this platform is incredible. Every collaboration has been professional and creatively inspiring." },
  { name: "Mia Thompson", role: "Model & MUA", img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80", text: "Finally a platform that respects creatives. No scams, verified profiles, and the TFP system is seamless." },
];

const TESTIMONIALS_BR = [
  { name: "Elena Vasquez", role: "Modelo", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80", text: "O PermutaModel me ajudou a construir meu portfólio do zero. Fiz 12 ensaios em 3 meses e consegui meu primeiro contrato com agência." },
  { name: "Ryan Mitchell", role: "Fotógrafo", img: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200&q=80", text: "A qualidade dos modelos nessa plataforma é incrível. Cada colaboração foi profissional e criativamente inspiradora." },
  { name: "Mia Thompson", role: "Modelo & MUA", img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80", text: "Finalmente uma plataforma que respeita criativos. Sem golpes, perfis verificados, e o sistema de permuta é perfeito." },
];

const STEP_ICONS = [Camera, Users, Handshake];

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to="/discover" replace />;

  const navigate = useNavigate();
  const brand = useBrand();
  const t = brand.landing;
  const isBR = brand.country === "BR";
  const TESTIMONIALS = isBR ? TESTIMONIALS_BR : TESTIMONIALS_EN;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <SEOHead title={brand.seo.title} description={brand.seo.description} />
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border safe-area-pt">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
          <h1 className="font-heading text-xl font-bold text-foreground">{brand.name}</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/login")} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t.signIn}
            </button>
            <button onClick={() => navigate("/login")} className="gold-gradient px-5 py-2 rounded-full font-body text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              {t.joinFree}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 md:pt-32 pb-16 md:pb-24 px-4 md:px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, hsl(37 42% 60% / ${0.3 + Math.random() * 0.4}), transparent)`,
                animation: `float-particle ${6 + Math.random() * 8}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 6}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.p variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="font-accent italic text-primary text-lg mb-4">
            {t.heroSubtitle}
          </motion.p>
          <motion.h2
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
            className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
            style={{ textShadow: "0 0 40px hsl(37 42% 60% / 0.2), 0 0 80px hsl(37 42% 60% / 0.1)" }}
          >
            {t.heroTitle}{" "}
            <span className="gold-text">{t.heroHighlight}</span>
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="font-body text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-8 md:mb-10">
            {t.heroDescription}
          </motion.p>
          <motion.button
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }}
            onClick={() => navigate("/login")}
            className="gold-gradient px-6 py-3.5 md:px-8 md:py-4 rounded-full font-body text-sm md:text-base font-semibold text-primary-foreground hover:opacity-90 transition-all hover:scale-[1.02] inline-flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            {t.ctaButton}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </section>

      {/* Featured Creatives */}
      <section className="px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-accent italic text-primary mb-2">{t.featuredSubtitle}</p>
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground">{t.featuredTitle}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURED.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border border-transparent hover:border-primary/30 transition-all duration-300">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                {p.pro && <span className="absolute top-3 right-3 gold-gradient px-2.5 py-0.5 rounded-full font-body text-[10px] font-bold text-primary-foreground tracking-wider">PRO</span>}
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-heading text-base font-bold text-foreground">{p.name}</p>
                  <p className="font-body text-xs text-muted-foreground">{p.role} · {p.city}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 md:px-6 py-12 md:py-20 bg-card/50">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <p className="font-accent italic text-primary mb-2">{t.howItWorksSub}</p>
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground">{t.howItWorksTitle}</h3>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {t.steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center p-6">
                <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h4 className="font-heading text-lg font-bold text-foreground mb-2">{step.title}</h4>
                <p className="font-body text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-accent italic text-primary mb-2">{t.testimonialsSub}</p>
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground">{t.testimonialsTitle}</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors duration-300">
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">"{item.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={item.img} alt={item.name} className="w-10 h-10 rounded-full object-cover border border-primary/20" />
                  <div>
                    <p className="font-heading text-sm font-bold text-foreground">{item.name}</p>
                    <p className="font-body text-xs text-primary">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 md:px-6 py-12 md:py-20 bg-card/50">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 md:gap-6 text-center">
          {[
            { num: "100%", label: t.stats[0].label },
            { num: "Free", label: t.stats[1].label },
            { num: "Nationwide", label: t.stats[2].label },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <p className="font-heading text-2xl md:text-4xl font-bold gold-text">{s.num}</p>
              <p className="font-body text-xs md:text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4" style={{ textShadow: "0 0 30px hsl(37 42% 60% / 0.15)" }}>
            {t.readyTitle}
          </h3>
          <p className="font-body text-muted-foreground mb-8 md:mb-10 text-base md:text-lg">{t.readySub}</p>
          <button
            onClick={() => navigate("/login")}
            className="gold-gradient px-8 py-4 md:px-10 md:py-5 rounded-full font-body text-base md:text-lg font-semibold text-primary-foreground hover:opacity-90 transition-all hover:scale-[1.02] inline-flex items-center gap-2 md:gap-3 shadow-xl shadow-primary/25"
          >
            {t.joinFree}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-6 py-8 md:py-10 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-heading text-sm text-foreground">{brand.name}</p>
          <p className="font-body text-xs text-muted-foreground">{brand.footer.madeBy}</p>
          <div className="flex gap-4 font-body text-xs text-muted-foreground">
            <button onClick={() => navigate("/terms")} className="hover:text-foreground transition-colors">{brand.footer.terms}</button>
            <button onClick={() => navigate("/privacy")} className="hover:text-foreground transition-colors">{brand.footer.privacy}</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
