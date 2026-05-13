import { useState } from "react";
import { Heart, Search, Camera, Bell, Check, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback, type AvatarSize, type AvatarStoryState } from "@/components/ui/avatar";
import { PT_BR } from "@/lib/strings";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-ink border-b border-border pb-2">{title}</h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-ink-tertiary font-medium">{label}</div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default function ComponentShowcase() {
  const [withError, setWithError] = useState(false);
  const avatarSizes: AvatarSize[] = ["xs", "sm", "md", "lg", "xl"];
  const storyStates: AvatarStoryState[] = ["none", "self", "unseen", "seen"];

  return (
    <div className="min-h-[100dvh] bg-background py-10 px-6">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-2">
          <Badge variant="coral" icon={<Camera />}>DEV ONLY</Badge>
          <h1 className="font-display text-4xl font-semibold text-ink">PermutaModel — Paleta B Showcase</h1>
          <p className="text-ink-secondary">
            Pseudo-page for visual QA of the 5 refactored components. Removed before launch.
          </p>
        </header>

        <Section title="Palette tokens">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["bg-base", "var(--bg-base)"],
              ["bg-surface", "var(--bg-surface)"],
              ["bg-elevated", "var(--bg-elevated)"],
              ["coral", "var(--accent-warm)"],
              ["lavender", "var(--accent-cool)"],
              ["danger", "var(--danger)"],
              ["success", "var(--success)"],
              ["warning", "var(--warning)"],
            ].map(([name, varName]) => (
              <div key={name} className="rounded-md border border-border bg-surface overflow-hidden">
                <div
                  className="h-16"
                  style={{ background: `hsl(${varName.replace("var(--", "var(--")})` }}
                />
                <div className="p-2 text-xs">
                  <div className="font-mono text-ink">{name}</div>
                  <div className="font-mono text-ink-tertiary">{varName}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Button">
          <Row label="variants">
            <Button variant="primary">Bora começar</Button>
            <Button variant="secondary">Saber mais</Button>
            <Button variant="ghost">Pular</Button>
            <Button variant="destructive">Apagar conta</Button>
            <Button variant="outline">Outline (legacy)</Button>
            <Button variant="link">Link (legacy)</Button>
          </Row>
          <Row label="sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="favoritar"><Heart /></Button>
          </Row>
          <Row label="with icon + disabled">
            <Button variant="primary"><Camera /> Marcar o rolê</Button>
            <Button variant="secondary"><Search /> Buscar</Button>
            <Button disabled>Disabled</Button>
          </Row>
        </Section>

        <Section title="Card">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Card padrão</CardTitle>
                <CardDescription>Surface bg, border 1px, radius lg.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ink-secondary">
                  Conteúdo qualquer dentro do card. Inter para body.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="primary" size="sm">Confirmar</Button>
                <Button variant="ghost" size="sm">Cancelar</Button>
              </CardFooter>
            </Card>
            <Card variant="photo-card">
              <div className="aspect-[4/5] bg-gradient-to-br from-coral/20 to-lavender/20" />
              <CardContent className="p-4 pt-4">
                <CardTitle className="text-base">photo-card variant</CardTitle>
                <CardDescription className="mt-1">Hover pra ver border coral + lift.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Badge">
          <Row label="variants">
            <Badge>Default</Badge>
            <Badge variant="success" icon={<Check />}>Verificado</Badge>
            <Badge variant="warning" icon={<AlertTriangle />}>Atenção</Badge>
            <Badge variant="info" icon={<Info />}>Info</Badge>
            <Badge variant="coral">Pro</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive" icon={<X />}>Banido</Badge>
          </Row>
        </Section>

        <Section title="Input">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-wider text-ink-tertiary font-medium">basic</div>
              <Input placeholder="Email" />
              <Input placeholder="Senha" type="password" />
              <Input placeholder="Disabled" disabled />
            </div>
            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-wider text-ink-tertiary font-medium">floatingLabel + error</div>
              <Input floatingLabel="Cidade" defaultValue="" />
              <Input floatingLabel="Instagram" defaultValue="@jemson" />
              <Input
                floatingLabel="Email"
                error={withError ? "Email inválido" : undefined}
                defaultValue="jemson@"
              />
              <Button size="sm" variant="ghost" onClick={() => setWithError((v) => !v)}>
                Toggle error
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Avatar">
          <Row label="sizes">
            {avatarSizes.map((s) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <Avatar size={s}>
                  <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" />
                  <AvatarFallback>JM</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-ink-tertiary font-mono">{s}</span>
              </div>
            ))}
          </Row>
          <Row label="storyState">
            {storyStates.map((st) => (
              <div key={st} className="flex flex-col items-center gap-1">
                <Avatar size="lg" storyState={st}>
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" />
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-ink-tertiary font-mono">{st}</span>
              </div>
            ))}
          </Row>
          <Row label="fallback (no image)">
            <Avatar size="md"><AvatarFallback>JM</AvatarFallback></Avatar>
            <Avatar size="md" storyState="unseen"><AvatarFallback>AB</AvatarFallback></Avatar>
            <Avatar size="lg" storyState="self"><AvatarFallback>CD</AvatarFallback></Avatar>
          </Row>
        </Section>

        <Section title="Typography">
          <div className="space-y-1">
            <h1 className="font-display text-4xl font-semibold text-ink">Display H1 — Sora 600</h1>
            <h2 className="font-display text-2xl font-semibold text-ink">Display H2 — Sora 600</h2>
            <h3 className="font-display text-xl font-medium text-ink">Display H3 — Sora 500</h3>
            <p className="font-sans text-base text-ink">Body large — Inter 400</p>
            <p className="font-sans text-sm text-ink-secondary">Body — Inter 400 secondary</p>
            <p className="font-sans text-xs text-ink-tertiary">Caption — Inter 400 tertiary</p>
            <p className="font-mono text-sm text-ink">Mono — JetBrains (admin only)</p>
          </div>
        </Section>

        <Section title="Strings sampler (PT-BR)">
          <p className="text-xs text-ink-tertiary">
            Lookup pinned to <code className="font-mono">PT_BR</code> regardless of brand — meant for
            copy-tone QA in one place. Each row shows the key, then the resolved string.
          </p>
          {(
            [
              ["common.empty", PT_BR.common.empty],
              ["common.required", PT_BR.common.required],
              ["common.optional", PT_BR.common.optional],
              ["common.error", PT_BR.common.error],
              ["common.success", PT_BR.common.success],
              ["common.saveChanges", PT_BR.common.saveChanges],
              ["cta.continue", PT_BR.cta.continue],
              ["cta.getStarted", PT_BR.cta.getStarted],
              ["cta.tryAgain", PT_BR.cta.tryAgain],
              ["auth.welcome", PT_BR.auth.welcome],
              ["auth.welcomeBack", PT_BR.auth.welcomeBack],
              ["auth.signIn", PT_BR.auth.signIn],
              ["auth.signUp", PT_BR.auth.signUp],
              ["auth.createAccount", PT_BR.auth.createAccount],
              ["nav.discover", PT_BR.nav.discover],
              ["nav.castings", PT_BR.nav.castings],
              ["nav.messages", PT_BR.nav.messages],
              ["nav.favorites", PT_BR.nav.favorites],
              ["nav.notifications", PT_BR.nav.notifications],
              ["discover.title", PT_BR.discover.title],
              ["discover.availableNow", PT_BR.discover.availableNow],
              ["discover.noCreatives", PT_BR.discover.noCreatives],
              ["discover.greetingMorning('Jemson')", PT_BR.discover.greetingMorning("Jemson")],
              ["discover.greetingEvening('Maria')", PT_BR.discover.greetingEvening("Maria")],
              ["profile.portfolio", PT_BR.profile.portfolio],
              ["profile.sendRequest", PT_BR.profile.sendRequest],
              ["profile.favorite", PT_BR.profile.favorite],
              ["tfp.requestAccepted", PT_BR.tfp.requestAccepted],
              ["tfp.requestDeclined", PT_BR.tfp.requestDeclined],
              ["tfp.schedule", PT_BR.tfp.schedule],
              ["reviews.title", PT_BR.reviews.title],
              ["reviews.submit", PT_BR.reviews.submit],
              ["castings.title", PT_BR.castings.title],
              ["castings.apply", PT_BR.castings.apply],
              ["errors.network", PT_BR.errors.network],
              ["errors.sessionExpired", PT_BR.errors.sessionExpired],
              ["validation.invalidEmail", PT_BR.validation.invalidEmail],
            ] as Array<[string, string]>
          ).map(([key, value]) => (
            <div key={key} className="grid grid-cols-[260px_1fr] gap-3 items-baseline py-1 border-b border-border/40">
              <code className="font-mono text-[11px] text-ink-tertiary">t.{key}</code>
              <span className="text-sm text-ink">{value}</span>
            </div>
          ))}

          <h3 className="font-display text-sm font-semibold text-ink-secondary pt-4 uppercase tracking-wider">notifs templates</h3>
          {(
            [
              ["tfp_request_new({name:'Maria', title:'Editorial urbano'})", PT_BR.notifs.tfp_request_new({ name: "Maria", title: "Editorial urbano" })],
              ["tfp_request_accepted({name:'João'})", PT_BR.notifs.tfp_request_accepted({ name: "João" })],
              ["tfp_request_declined({name:'João'})", PT_BR.notifs.tfp_request_declined({ name: "João" })],
              ["application_new({castingTitle:'Editorial SP'})", PT_BR.notifs.application_new({ castingTitle: "Editorial SP" })],
              ["application_accepted({castingTitle:'Editorial SP'})", PT_BR.notifs.application_accepted({ castingTitle: "Editorial SP" })],
              ["application_declined({})", PT_BR.notifs.application_declined({})],
              ["photo_like({name:'Ana'})", PT_BR.notifs.photo_like({ name: "Ana" })],
              ["photo_comment({name:'Ana', preview:'Linda foto!'})", PT_BR.notifs.photo_comment({ name: "Ana", preview: "Linda foto!" })],
              ["gallery_shared({name:'Pedro'})", PT_BR.notifs.gallery_shared({ name: "Pedro" })],
            ] as Array<[string, { title: string; body: string }]>
          ).map(([key, payload]) => (
            <div key={key} className="rounded-md border border-border bg-surface p-3 space-y-1">
              <code className="font-mono text-[10px] text-ink-tertiary">t.notifs.{key}</code>
              <div className="font-display text-sm font-semibold text-ink">{payload.title}</div>
              <div className="text-sm text-ink-secondary">{payload.body}</div>
            </div>
          ))}
        </Section>

        <Section title="Box shadows">
          <Row label="shadow utilities">
            <div className="h-20 w-32 rounded-md bg-surface shadow-elevated flex items-center justify-center text-xs text-ink-secondary">elevated</div>
            <div className="h-20 w-32 rounded-md bg-surface shadow-focus-coral flex items-center justify-center text-xs text-ink-secondary">focus-coral</div>
            <div className="h-20 w-32 rounded-md bg-coral shadow-glow-cta flex items-center justify-center text-xs text-primary-foreground">glow-cta</div>
          </Row>
        </Section>
      </div>
    </div>
  );
}
