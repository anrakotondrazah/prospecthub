import Link from 'next/link'

export const metadata = {
  title: 'Politique de Confidentialité | ProspectHub',
  description: 'Comment ProspectHub collecte, utilise et protège vos données personnelles. Conformité RGPD.',
}

export default function PrivacyPage() {
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
            Politique de Confidentialité
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
                1. Responsable du traitement
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mb-4">
                Le responsable du traitement des données personnelles collectées sur ProspectHub est :
              </p>
              <div className="bg-[#F5F7F9] dark:bg-[#0D0F14] rounded-[12px] p-6 border border-[#E2E4E6] dark:border-[#2D3039]">
                <p className="text-[#0D0F14] dark:text-white font-medium mb-2">ProspectHub SAS</p>
                <p className="text-[#4E525A] dark:text-[#9BA0A6] text-sm mb-1">Antananarivo, Madagascar</p>
                <p className="text-[#4E525A] dark:text-[#9BA0A6] text-sm">Email : contact@prospecthub.fr</p>
              </div>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                2. Données collectées
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mb-4">
                Nous collectons les données suivantes :
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Données de compte :</strong> nom, prénom, email, entreprise
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Données de prospection :</strong> entreprises, contacts, campagnes que vous créez
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Données techniques :</strong> adresse IP, navigateur, système d&apos;exploitation
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Cookies :</strong> cookies de session et de préférences (pas de tracking publicitaire)
                  </span>
                </li>
              </ul>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                3. Finalités du traitement
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mb-4">
                Vos données sont utilisées pour :
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Fournir et améliorer le service ProspectHub</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Gérer votre compte et vos abonnements</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Vous contacter pour le support technique</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Assurer la sécurité et prévenir la fraude</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Respecter nos obligations légales</span>
                </li>
              </ul>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                4. Base légale
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mb-4">
                Le traitement de vos données repose sur :
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">L&apos;exécution du contrat</strong> (fourniture du service)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Notre intérêt légitime</strong> (sécurité, amélioration du service)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Votre consentement</strong> (cookies non essentiels)
                  </span>
                </li>
              </ul>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                5. Destinataires des données
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mb-4">
                Vos données sont accessibles uniquement à :
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Notre équipe technique (support, développement)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Nos sous-traitants (hébergement Vercel/Supabase, paiement Stripe)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Les autorités légales sur demande judiciaire</span>
                </li>
              </ul>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mt-4">
                Nous ne vendons jamais vos données à des tiers.
              </p>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                6. Durée de conservation
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Données de compte :</strong> pendant toute la durée de votre abonnement + 3 ans
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Données de prospection :</strong> supprimées à la clôture de votre compte
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Logs techniques :</strong> 12 mois maximum
                  </span>
                </li>
              </ul>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                7. Vos droits RGPD
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Droit d&apos;accès :</strong> obtenir une copie de vos données
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Droit de rectification :</strong> corriger des données inexactes
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Droit à l&apos;effacement :</strong> supprimer vos données
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Droit à la portabilité :</strong> recevoir vos données dans un format exploitable
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">
                    <strong className="text-[#0D0F14] dark:text-white">Droit d&apos;opposition :</strong> vous opposer à certains traitements
                  </span>
                </li>
              </ul>
              <div className="mt-6 bg-[#F5F7F9] dark:bg-[#0D0F14] rounded-[12px] p-6 border border-[#E2E4E6] dark:border-[#2D3039]">
                <p className="text-[#0D0F14] dark:text-white font-medium mb-2">Pour exercer vos droits :</p>
                <p className="text-[#4E525A] dark:text-[#9BA0A6] text-sm">Email : dpo@prospecthub.fr</p>
                <p className="text-[#4E525A] dark:text-[#9BA0A6] text-sm mt-2">Délai de réponse : 1 mois maximum</p>
              </div>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                8. Sécurité
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mb-4">
                Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Chiffrement TLS 1.3 en transit</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Chiffrement AES-256 au repos</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Authentification sécurisée (Supabase Auth)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#0066FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#4E525A] dark:text-[#9BA0A6]">Hébergement en France (datacenters ISO 27001)</span>
                </li>
              </ul>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mt-4">
                En savoir plus : <Link href="/securite" className="text-[#0066FF] hover:underline">Page Sécurité</Link>
              </p>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                9. Cookies
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed mb-4">
                ProspectHub utilise uniquement des cookies essentiels au fonctionnement du service (session, préférences).
              </p>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed">
                Nous n&apos;utilisons pas de cookies de tracking publicitaire ou de réseaux sociaux.
              </p>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                10. Modifications
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed">
                Nous nous réservons le droit de modifier cette politique de confidentialité. Toute modification sera communiquée par email et entrera en vigueur 30 jours après notification.
              </p>
            </div>

            {/* Section */}
            <div className="rounded-[16px] border border-[#E2E4E6] dark:border-[#2D3039] bg-white/80 dark:bg-[#17191F]/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-[#0D0F14] dark:text-white mb-4">
                11. Réclamation
              </h2>
              <p className="text-[#4E525A] dark:text-[#9BA0A6] leading-relaxed">
                En cas de désaccord concernant le traitement de vos données, vous pouvez déposer une réclamation auprès de la CNIL (Commission Nationale de l&apos;Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#0066FF] hover:underline">www.cnil.fr</a>
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
                Questions sur vos données ?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Contactez notre DPO pour toute question relative à la protection de vos données.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-[#0066FF] bg-white rounded-[12px] hover:bg-[#F5F7F9] transition-all shadow-lg"
              >
                Contacter le DPO
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
                  <Link href="/terms" className="text-sm text-[#4E525A] dark:text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-white transition-colors">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-[#0066FF] font-medium">
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
