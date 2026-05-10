import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBrand } from "@/hooks/useBrand";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const brand = useBrand();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-heading text-lg font-bold text-foreground">Privacy Policy</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <p className="text-xs font-body text-muted-foreground">Last updated: March 4, 2026</p>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">1. Information We Collect</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            We collect information you provide directly: name, email, profile photos, portfolio images, location (city/state), bio, and professional details (styles, equipment, measurements). We also collect usage data such as session activity, messages, and interactions with other users.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">2. How We Use Your Information</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Your information is used to: provide and improve the App, match you with relevant photographers/models, display your profile and portfolio to other users, facilitate communication and session booking, send notifications about requests and sessions, and ensure safety through verification and reporting systems.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">3. Location Data</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            We use your location (derived from your city/state) to show distance between users and enable location-based discovery. You can hide your distance from other users in Privacy settings. We do not track your real-time GPS location.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">4. Information Sharing</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Your profile information and portfolio are visible to other authenticated users (unless you enable Private Mode). We do not sell your personal information to third parties. We may share information with service providers who help operate the App, or when required by law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">5. Data Storage & Security</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Your data is stored securely using industry-standard encryption. Photos and files are stored in secure cloud storage. We implement row-level security to ensure users can only access authorized data. However, no system is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">6. Your Rights</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            You have the right to: access your personal data, correct inaccurate information, delete your account and associated data, export your data, control your visibility through Privacy settings, and block other users from contacting you.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">7. Data Retention</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            We retain your data for as long as your account is active. When you delete your account, all associated data (profile, photos, messages, sessions) is permanently deleted. Some data may be retained in backups for up to 30 days.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">8. Cookies & Analytics</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            We use essential cookies for authentication and session management. We may use analytics tools to understand how users interact with the App. You can manage cookie preferences through your browser settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">9. Children's Privacy</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            {brand.name} is not intended for users under 18 years of age. We do not knowingly collect information from minors. If we become aware of such collection, we will delete the information promptly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">10. Changes to This Policy</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            We may update this Privacy Policy periodically. We will notify users of significant changes via in-app notification. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-base font-bold text-foreground">11. Contact</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            For privacy-related questions or data requests, please contact us through the Feedback section in Settings.
          </p>
        </section>
      </div>
    </div>
  );
}
