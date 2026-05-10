import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBrand } from "@/hooks/useBrand";

export default function TermsOfService() {
  const navigate = useNavigate();
  const brand = useBrand();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-heading text-lg font-bold text-foreground">Terms of Service</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <p className="text-xs font-body text-muted-foreground">Last updated: March 4, 2026</p>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">1. Acceptance of Terms</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            By accessing or using {brand.name} ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">2. Description of Service</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            {brand.name} is a platform that connects photographers, models, and creative professionals for collaborative photo sessions (TFP — Time for Print) and casting opportunities. The App provides tools for discovery, messaging, session management, and portfolio showcasing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">3. User Accounts</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must be at least 18 years old to use the App. One person may only maintain one account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">4. User Content</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            You retain ownership of all content you upload. By uploading content, you grant {brand.name} a non-exclusive, worldwide license to display your content within the App. You must not upload content that infringes on others' intellectual property rights, is illegal, or violates community guidelines.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">5. Community Guidelines</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Users must treat others with respect. Harassment, discrimination, spam, fake profiles, and no-shows to confirmed sessions are prohibited. Violations may result in account suspension or permanent ban.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">6. Safety</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            {brand.name} provides safety features including emergency contacts, user verification, and reporting tools. However, you are responsible for your own safety when meeting other users in person. We recommend meeting in public places and informing someone of your plans.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">7. Subscriptions & Payments</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Some features require a paid subscription. Subscription fees are billed according to the plan selected. Refunds are handled on a case-by-case basis. We reserve the right to modify pricing with advance notice.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">8. Limitation of Liability</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            {brand.name} is provided "as is" without warranties of any kind. We are not liable for any disputes between users, damages arising from use of the App, or loss of data. Our total liability is limited to the amount paid by you in the 12 months preceding the claim.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">9. Account Termination</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time through the Settings page.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">10. Changes to Terms</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            We may update these terms from time to time. Continued use of the App after changes constitutes acceptance of the new terms. We will notify users of significant changes via in-app notification.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">11. Contact</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            For questions about these terms, please contact us through the Feedback section in Settings.
          </p>
        </section>
      </div>
    </div>
  );
}
