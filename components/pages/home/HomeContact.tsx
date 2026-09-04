"use client"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { ChatConversationPanel } from "@/components/shared/ChatConversationPanel"
import { useChatConversation } from "@/hooks/useChatConversation"
import { useTranslations, useLocale } from "next-intl"
import { appConfig } from "@/config/app.config"
import { Shell } from "@/components/layout/Shell"
import { Button } from "@/components/ui/Button"

export function HomeContact() {
  const t = useTranslations("home")
  const locale = useLocale()
  const chat = useChatConversation(locale)

  return (
    <section id="contact" className="section-rule py-[clamp(80px,12vh,160px)]">
      <Shell>
        <div data-anim="section-head" className="grid grid-cols-[1fr_2fr] gap-gutter mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span data-anim="section-meta" className="text-caption font-mono text-text-subtle">{t("sections.contact_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("sections.contact_title")}</ParticleHeading>
        </div>

        <div className="grid grid-cols-[1fr_1.6fr] gap-gutter items-start max-[900px]:grid-cols-1">

          {/* Left: info */}
          <div className="flex flex-col gap-8 max-[900px]:gap-6">
            <div>
              <h3 className="font-display text-[clamp(28px,3.2vw,48px)] font-semibold tracking-[-0.03em] leading-[0.95] mb-4 text-text">
                {t("contact.heading1")}&nbsp;
                <span className="text-primary">{t("contact.heading_accent")}</span>&nbsp;
                <span className="text-serif-italic text-text-muted">{t("contact.heading_italic")}</span>
              </h3>
              <p className="text-body text-text-muted max-w-96 leading-[1.6]">{t("contact.body")}</p>
            </div>

            <div className="border-t border-border pt-6 flex flex-col gap-4">
              <div>
                <p className="text-caption font-mono text-text-subtle uppercase tracking-wider mb-1.5">{t("contact.direct")}</p>
                <a
                  href={`mailto:${appConfig.email}`}
                  className="text-primary text-[clamp(18px,2vw,28px)] font-mono no-underline transition-opacity duration-150 hover:opacity-75 keyboard-focus-ring"
                >
                  {appConfig.email}
                </a>
              </div>
              <div>
                <p className="text-caption font-mono text-text-subtle uppercase tracking-wider mb-2">{t("contact.call_label")}</p>
                <Button
                  href={appConfig.calLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cta_click="true"
                  data-cta_text="Book a call"
                  data-cta_url={appConfig.calLink}
                >
                  {t("contact.call_cta")}
                  <span className="sr-only"> (opens in new tab)</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right: chatbot */}
          <ChatConversationPanel
            {...chat}
            locale={locale}
            className=" h-150"
          />
        </div>
      </Shell>
    </section>
  )
}
