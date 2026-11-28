import Link from 'next/link'

export const metadata = {
  title: 'Conditions Générales d\'Utilisation | ProspectHub',
  description: 'Conditions générales d\'utilisation de la plateforme ProspectHub.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0F14]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 h-[72px] border-b border-[#E2E4E6] dark:border-[#2D3039] bg-white/98 dark:bg-[#0D0F14]/98 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#17191F] dark:bg-white rounded-[10px] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" className="text-white dark:text-[#17191F]" />
                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" className="text-white dark:text-[#17191F]" />
                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" className="text-white dark:text-[#17191F]" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-[#0D0F14] dark:text-white">ProspectHub</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm font-medium text-white bg-[#17191F] dark:bg-white dark:text-[#17191F] rounded-[10px] hover:bg-[#2D3039] dark:hover:bg-[#E2E4E6] transition-colors"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[48px] md:text-[56px] font-bold text-[#0D0F14] dark:text-white leading-[1.1] tracking-[-0.02em] mb-6">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="text-xl text-[#4E525A] dark:text-[#9BA0A6] max-w-2xl mx-auto leading-relaxed">
            Dernière mise à jour : 26 novembre 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                1. Objet
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mb-4">
                Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme ProspectHub, un service SaaS de gestion de la prospection commerciale.
              </p>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed">
                En accédant à ProspectHub, vous acceptez sans réserve les présentes CGU. Si vous n&apos;acceptez pas ces conditions, vous ne pouvez pas utiliser le service.
              </p>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                2. Définitions
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Service :</strong> la plateforme ProspectHub accessible en ligne.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Utilisateur :</strong> toute personne physique ou morale utilisant le Service.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Compte :</strong> espace personnel créé par l&apos;Utilisateur pour accéder au Service.
                  </span>
                </li>
              </ul>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                3. Inscription et compte
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mb-4">
                L&apos;utilisation du Service nécessite la création d&apos;un compte. Vous vous engagez à fournir des informations exactes et à les maintenir à jour.
              </p>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed">
                Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les activities effectuées depuis votre compte.
              </p>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                4. Utilisation du service
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mb-4">
                Vous vous engagez à utiliser le Service de manière conforme aux lois et réglementations en vigueur, notamment en matière de prospection commerciale, de protection des données personnelles (RGPD) et de lutte contre le spam.
              </p>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed font-semibold">
                Il est interdit de :
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-red-500">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Utiliser le Service à des fins illégales ou non autorisées</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-red-500">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Contactér des personnes inscrites sur Bloctel sans base légale</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-red-500">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Compromettre la sécurité ou l&apos;intégrité du Service</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-red-500">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Collecter des données personnelles sans consentement</span>
                </li>
              </ul>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                5. Propriété intellectuelle
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mb-4">
                ProspectHub et tous ses éléments (interface, logo, documentation, etc.) sont protégés par le droit de la propriété intellectuelle.
              </p>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed">
                Toute reproduction, représentation, modification ou exploitation non autorisée est strictement interdite.
              </p>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                6. Responsabilité
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mb-4">
                ProspectHub s&apos;efforce d&apos;assurer la disponibilité et la sécurité du Service, mais ne garantit pas l&apos;absence d&apos;interruption ou d&apos;erreur.
              </p>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed">
                L&apos;Utilisateur reste seul responsable de l&apos;utilisation qu&apos;il fait du Service et de la conformité de ses actions avec la législation applicable.
              </p>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                7. Résiliation
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mb-4">
                Vous pouvez demander la résiliation de votre compte à tout moment en contactant notre support via la page Contact.
              </p>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed">
                ProspectHub se réserve le droit de suspendre ou de résilier votre accès en cas de non-respect des présentes CGU.
              </p>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                8. Modification des CGU
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed">
                ProspectHub se réserve le droit de modifier les présentes CGU à tout moment. Les modifications entrent en vigueur dès leur publication. Votre utilisation continue du Service vaut acceptation des nouvelles CGU.
              </p>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                9. Droit applicable
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed">
                Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation ou exécution relève de la compétence exclusive des tribunaux français.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-[20px] border border-[#E2E4E6] dark:border-[#2D3039] bg-gradient-to-br from-[#0066FF] to-[#0052CC] p-12 text-center">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Des questions sur les CGU ?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Notre équipe est disponible pour répondre à toutes vos questions.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-[#0066FF] bg-white rounded-[12px] hover:bg-[#F5F7F9] transition-all shadow-lg"
              >
                Contactéz-nous
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E4E6] dark:border-[#2D3039] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-semibold text-[#0D0F14] dark:text-white mb-4">Produit</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/#features" className="text-sm text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="text-sm text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors">
                    Tarifs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#0D0F14] dark:text-white mb-4">Légal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-sm text-[#0066FF] font-medium">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/securite" className="text-sm text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors">
                    Sécurité
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#0D0F14] dark:text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" className="text-sm text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#0D0F14] dark:text-white mb-4">ProspectHub</h4>
              <p className="text-sm text-[#4E525A] dark:text-[#9BA0A6]">
                La solution de prospection commerciale B2B pour PME françaises.
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-[#E2E4E6] dark:border-[#2D3039]">
            <p className="text-sm text-[#9BA0A6] dark:text-[#4E525A] text-center">
              © 2026 ProspectHub. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
