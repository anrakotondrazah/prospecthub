import Link from 'next/link'

export const instant = false

const features = [
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    title: 'Gestion des Leads',
    description: 'Centralisez tous vos prospects avec scoring automatique et suivi personnalisé.',
  },
  {
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    title: 'Base Entreprises',
    description: 'Enrichissement automatique des données entreprises via SIRET et APIs France.',
  },
  {
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    title: 'Tableaux de Bord',
    description: 'Visualisez vos KPIs en temps réel : leads, conversions, performances.',
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    title: 'Gestion des Tâches',
    description: 'Organisez vos suivis avec un Kanban intégré et des rappels automatiques.',
  },
  {
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    title: 'Multi-tenant Sécurisé',
    description: 'Isolation complète des données par organisation avec RLS PostgreSQL.',
  },
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'API & Intégrations',
    description: 'Connectez vos outils existants: Zapier, n8n, webhooks personnalisés.',
  },
]

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Pour démarrer et tester',
    features: ['50 leads/mois', '1 utilisateur', 'Dashboard basique', 'Export CSV'],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '29',
    description: 'Pour les équipes en croissance',
    features: ['1,000 leads/mois', '5 utilisateurs', 'Enrichissement auto', 'Intégrations API', 'Support prioritaire'],
    cta: 'Essai gratuit 14 jours',
    highlighted: true,
  },
  {
    name: 'Business',
    price: '79',
    description: 'Pour les entreprises établies',
    features: ['Leads illimités', 'Utilisateurs illimités', 'SSO & SAML', 'API dédiée', 'Account manager'],
    cta: 'Contacter les ventes',
    highlighted: false,
  },
]

const testimonials = [
  {
    quote: 'ProspectHub nous a permis de tripler notre taux de conversion en 3 mois. Interface intuitive et enrichissement automatique top.',
    author: 'Marie Dupont',
    role: 'Directrice Commerciale',
    company: 'TechStartup SAS',
  },
  {
    quote: 'Enfin un CRM adapté aux PME françaises. Les données SIRET et Pappers intégrées nous font gagner un temps fou.',
    author: 'Pierre Martin',
    role: 'CEO',
    company: 'ConseilPro',
  },
  {
    quote: 'Migration depuis HubSpot en 2 jours. Prix divisé par 5 pour les mêmes fonctionnalités essentielles.',
    author: 'Sophie Leroy',
    role: 'Growth Manager',
    company: 'AgenceDigitale',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 h-[72px] border-b border-border bg-background/98 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#17191F] rounded-[10px] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff" />
                <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2" />
                <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-foreground">ProspectHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-3 py-2 text-muted-foreground font-medium hover:text-foreground hover:bg-muted rounded-[10px] transition-colors">
              Fonctionnalités
            </a>
            <a href="#pricing" className="px-3 py-2 text-muted-foreground font-medium hover:text-foreground hover:bg-muted rounded-[10px] transition-colors">
              Tarifs
            </a>
            <a href="#testimonials" className="px-3 py-2 text-muted-foreground font-medium hover:text-foreground hover:bg-muted rounded-[10px] transition-colors">
              Témoignages
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="hidden sm:flex px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Démo
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="relative px-4 py-2 text-sm font-medium text-white bg-[#17191F] rounded-[10px] overflow-hidden z-[1] transition-all duration-[250ms] ease-out before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:rounded-[10px] before:bg-[#0066FF] before:z-[-1] before:transition-all before:duration-[250ms] before:ease-out hover:before:w-full active:scale-95"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-sm font-medium text-[#1565C0] bg-[#E3F2FD] rounded-full">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Nouveau: 500+ entreprises ajoutées cette semaine
          </div>

          <h1 className="text-[48px] md:text-[56px] font-bold text-foreground leading-[1.1] tracking-[-0.02em] mb-6">
            Des leads à jour.
            <br />
            <span className="text-[#0066FF]">Un CRM pour les travailler.</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Accès à +50 000 entreprises françaises vérifiées.
            <br />
            Révélez-les avec vos crédits.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-[#0066FF] rounded-[12px] shadow-lg shadow-[#0066FF]/20 overflow-hidden z-[1] transition-all duration-[250ms] ease-out before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:rounded-[12px] before:bg-white before:z-[-1] before:transition-all before:duration-[250ms] before:ease-out hover:before:w-full hover:text-[#0066FF] active:scale-95"
            >
              Commencer gratuitement - 10 crédits offerts
            </Link>
            <Link
              href="/demo"
              className="relative w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-foreground bg-card/80 backdrop-blur-sm border-2 border-border rounded-[12px] overflow-hidden z-[1] transition-all duration-[250ms] ease-out before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:rounded-[12px] before:bg-[#0066FF] before:z-[-1] before:transition-all before:duration-[250ms] before:ease-out hover:before:w-full hover:text-white hover:border-[#0066FF] active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
              </svg>
              Voir en 2 min
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground/70">
            Rejoint par 150+ commerciaux ce mois
          </p>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 border-y border-border bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-muted-foreground/70 mb-6">
            Ils nous font confiance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
            {['TechStartup', 'ConseilPro', 'AgenceDigitale', 'InnovCorp', 'StartupLab'].map((company) => (
              <span key={company} className="text-lg font-semibold text-muted-foreground">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[36px] md:text-[42px] font-bold text-foreground mb-6 leading-tight">
            Prospecter prend trop de temps
            <br />
            pour des résultats incertains
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-card/80 backdrop-blur-sm border border-border rounded-[16px]">
              <div className="w-12 h-12 mb-4 mx-auto rounded-[12px] bg-[#FEF2F2] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Fichiers périmés</h3>
              <p className="text-sm text-muted-foreground">Données obsolètes sans date de vérification</p>
            </div>
            <div className="p-6 bg-card/80 backdrop-blur-sm border border-border rounded-[16px]">
              <div className="w-12 h-12 mb-4 mx-auto rounded-[12px] bg-[#FEF2F2] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  <line x1="23" y1="1" x2="1" y2="23" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Numéros qui ne répondent plus</h3>
              <p className="text-sm text-muted-foreground">Contacts non à jour, temps perdu</p>
            </div>
            <div className="p-6 bg-card/80 backdrop-blur-sm border border-border rounded-[16px]">
              <div className="w-12 h-12 mb-4 mx-auto rounded-[12px] bg-[#FEF2F2] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <line x1="9" y1="22" x2="15" y2="22" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Entreprises fermées</h3>
              <p className="text-sm text-muted-foreground">Aucune vérification de statut</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section - 3 Pillars */}
      <section className="py-24 px-6 bg-gradient-to-b from-muted to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-bold text-foreground mb-4">
              La solution ProspectHub
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trois piliers pour une prospection efficace
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative p-8 bg-card/90 backdrop-blur-sm border border-border rounded-[20px] hover:shadow-xl hover:border-[#0066FF] transition-all">
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#0066FF]/10 flex items-center justify-center">
                <span className="text-sm font-bold text-[#0066FF]">1</span>
              </div>
              <div className="w-14 h-14 mb-6 rounded-[14px] bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Fraîcheur
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Date de vérification affichée sur chaque fiche. Vous savez toujours si votre lead est à jour.
              </p>
            </div>

            <div className="relative p-8 bg-card/90 backdrop-blur-sm border border-border rounded-[20px] hover:shadow-xl hover:border-[#0066FF] transition-all">
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#0066FF]/10 flex items-center justify-center">
                <span className="text-sm font-bold text-[#0066FF]">2</span>
              </div>
              <div className="w-14 h-14 mb-6 rounded-[14px] bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Transparence
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Source documentée pour chaque donnée. Registre public, partenaire vérifié, ou signalement.
              </p>
            </div>

            <div className="relative p-8 bg-card/90 backdrop-blur-sm border border-border rounded-[20px] hover:shadow-xl hover:border-[#0066FF] transition-all">
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#0066FF]/10 flex items-center justify-center">
                <span className="text-sm font-bold text-[#0066FF]">3</span>
              </div>
              <div className="w-14 h-14 mb-6 rounded-[14px] bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Simplicité
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                De la recherche au premier email dans le même outil. Pas de copier-coller entre plateformes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - 3 Steps */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-bold text-foreground mb-4">
              Comment ça marche
            </h2>
            <p className="text-lg text-muted-foreground">
              De la recherche au contact en 3 étapes
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                1
              </div>
              <div className="flex-1 p-6 bg-card/80 backdrop-blur-sm border border-border rounded-[16px]">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Recherchez
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Filtrez par secteur d'activité, taille d'entreprise, et localisation. Notre catalogue de +50 000 entreprises françaises vérifiées.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                2
              </div>
              <div className="flex-1 p-6 bg-card/80 backdrop-blur-sm border border-border rounded-[16px]">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Révélez
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Débloquez les coordonnées complètes avec vos crédits. Email, téléphone, dirigeants - toutes les infos pour contacter.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                3
              </div>
              <div className="flex-1 p-6 bg-card/80 backdrop-blur-sm border border-border rounded-[16px]">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Contactez
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Lancez vos sequences d'emails, suivez dans le pipeline, et convertissez. Tout se passe dans ProspectHub.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-bold text-foreground mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un CRM complet, sans la complexité. Concentrez-vous sur vos ventes, pas sur votre outil.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-card border border-border rounded-[16px] hover:border-[#17191F] hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 mb-4 rounded-[12px] bg-muted flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#17191F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-bold text-foreground mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-lg text-muted-foreground">
              Commencez gratuitement, évoluez selon vos besoins.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`p-8 rounded-[20px] ${
                  plan.highlighted
                    ? 'bg-[#17191F] text-white ring-4 ring-[#17191F]/20'
                    : 'bg-card border border-border'
                }`}
              >
                <h3 className={`text-xl font-semibold mb-2 ${plan.highlighted ? 'text-white' : 'text-foreground'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className={`text-[48px] font-bold ${plan.highlighted ? 'text-white' : 'text-foreground'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.highlighted ? 'text-white/70' : 'text-muted-foreground'}>
                    EUR/mois
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={plan.highlighted ? '#22C55E' : '#147A3A'}
                        strokeWidth="2"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className={plan.highlighted ? 'text-white/90' : 'text-muted-foreground'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === 'Business' ? '/contact' : '/auth/register'}
                  className={`relative block w-full py-3 text-center font-semibold rounded-[10px] overflow-hidden z-[1] transition-all duration-[250ms] ease-out before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:rounded-[10px] before:z-[-1] before:transition-all before:duration-[250ms] before:ease-out hover:before:w-full active:scale-95 ${
                    plan.highlighted
                      ? 'bg-card text-foreground before:bg-[#0066FF] hover:text-white'
                      : 'bg-[#17191F] text-white before:bg-[#0066FF]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-bold text-foreground mb-4">
              Ce que disent nos clients
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="p-6 bg-card border border-border rounded-[16px]"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} width="20" height="20" viewBox="0 0 24 24" fill="#FBBF24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground/70">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#0066FF] to-[#0052CC] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-[36px] md:text-[42px] font-bold text-white mb-4 leading-tight">
            Votre prochain rendez-vous
            <br />
            commence par un lead
          </h2>
          <p className="text-lg text-white/90 mb-10 max-w-xl mx-auto">
            Rejoignez 150+ commerciaux qui prospectent avec des données à jour
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-[#0066FF] bg-white rounded-[12px] shadow-xl overflow-hidden z-[1] transition-all duration-[250ms] ease-out before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:rounded-[12px] before:bg-[#0066FF] before:z-[-1] before:transition-all before:duration-[250ms] before:ease-out hover:before:w-full hover:text-white hover:shadow-2xl active:scale-95"
            >
              Créer mon compte gratuit
            </Link>
            <Link
              href="/demo"
              className="relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white/40 rounded-[12px] backdrop-blur-sm overflow-hidden z-[1] transition-all duration-[250ms] ease-out before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:rounded-[12px] before:bg-white before:z-[-1] before:transition-all before:duration-[250ms] before:ease-out hover:before:w-full hover:text-[#0066FF] hover:border-white active:scale-95"
            >
              Voir en 2 min
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/80">
            10 crédits offerts. Aucune carte bancaire requise.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#17191F] rounded-[8px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff" />
                  <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2" />
                  <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" />
                </svg>
              </div>
              <span className="font-semibold text-foreground">ProspectHub</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">Confidentialité</Link>
              <Link href="/terms" className="hover:text-foreground">CGU</Link>
              <Link href="/contact" className="hover:text-foreground">Contact</Link>
            </div>

            <p className="text-sm text-muted-foreground/70">
              2026 ProspectHub. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
