"use client"
import { ParticleHeading } from "@/components/ui/ParticleHeading"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { appConfig } from "@/config/app.config"
import { showToast } from "@/components/ui/Toaster"
import { logger } from "@/utils/logger"
import { pushToDataLayer, trackExternalLink } from "@/utils/gtm-events"

interface ContactForm {
  name: string
  email: string
  company: string
  message: string
}

export function HomeContact() {
  const t = useTranslations("home")
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedBudget, setSelectedBudget]   = useState("")
  const [submitting, setSubmitting] = useState(false)

  const projects = t.raw("contact.projects") as string[]
  const budgets  = t.raw("contact.budgets")  as string[]

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>()

  const onSubmit = async (data: ContactForm) => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          company: data.company,
          message: data.message,
          project: selectedProject,
          budget: selectedBudget,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      pushToDataLayer({ event: "contact_submit", project_type: selectedProject, budget: selectedBudget })
      showToast("Message sent!", "success")
      reset()
      setSelectedProject("")
      setSelectedBudget("")
    } catch (e) {
      logger.error("Contact form error", e)
      showToast("Something went wrong. Please email directly.", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-[clamp(80px,12vh,160px)] border-t border-border">
      <div className="shell">
        <div className="grid grid-cols-[1fr_2fr] gap-(--gutter) mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span className="font-mono text-[12px] text-text-subtle">{t("sections.contact_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("sections.contact_title")}</ParticleHeading>
        </div>

        <div className="border border-border overflow-hidden grid grid-cols-[1.2fr_1fr] max-[900px]:grid-cols-1">
          <div className="p-10 border-r border-border max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:border-border max-[900px]:p-6">
            <h3 className="font-display text-[clamp(36px,4.2vw,64px)] font-semibold tracking-[-0.03em] leading-[0.95] mb-6 text-text">
              {t("contact.heading1")}&nbsp;
              <span className="text-primary">{t("contact.heading_accent")}</span>&nbsp;
              <span className="text-serif-italic text-text-muted">{t("contact.heading_italic")}</span>
            </h3>
            <p className="text-text-muted max-w-120 mb-6 leading-[1.6] text-[14px]">{t("contact.body")}</p>
            <p className="text-text-subtle text-[12px] mb-2">{t("contact.direct")}</p>
            <a href={`mailto:${appConfig.email}`} className="text-primary text-[14px] no-underline transition-opacity duration-150 hover:opacity-75 keyboard-focus-ring">
              {appConfig.email}
            </a>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-text-subtle text-[12px] mb-3">{t("contact.call_label")}</p>
              <a href={appConfig.calLink} target="_blank" rel="noopener noreferrer" className="btn inline-flex keyboard-focus-ring" data-cta_click="true" data-cta_text="Book a call" data-cta_url={appConfig.calLink}>
                {t("contact.call_cta")}
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            aria-busy={submitting}
            className="p-10 flex flex-col gap-4 bg-surface max-[900px]:p-6"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="c-name" className="font-mono text-[11px] text-text-subtle tracking-wide uppercase">
                {t("contact.f_name")} <span aria-hidden="true">*</span>
              </label>
              <input
                id="c-name"
                type="text"
                autoComplete="name"
                required
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "c-name-error" : undefined}
                {...register("name", { required: true })}
                className="bg-transparent border-0 border-b border-border-2 py-2 text-text font-mono text-[14px] transition-colors focus:outline-none focus:border-b-primary keyboard-focus-ring"
              />
              {errors.name && (
                <span id="c-name-error" role="alert" className="text-[11px] text-error font-mono">
                  Name is required
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="c-email" className="font-mono text-[11px] text-text-subtle tracking-wide uppercase">
                {t("contact.f_email")} <span aria-hidden="true">*</span>
              </label>
              <input
                id="c-email"
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "c-email-error" : undefined}
                {...register("email", { required: true })}
                className="bg-transparent border-0 border-b border-border-2 py-2 text-text font-mono text-[14px] transition-colors focus:outline-none focus:border-b-primary keyboard-focus-ring"
              />
              {errors.email && (
                <span id="c-email-error" role="alert" className="text-[11px] text-error font-mono">
                  Valid email is required
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="c-company" className="font-mono text-[11px] text-text-subtle tracking-wide uppercase">
                {t("contact.f_company")}
              </label>
              <input
                id="c-company"
                type="text"
                autoComplete="organization"
                {...register("company")}
                className="bg-transparent border-0 border-b border-border-2 py-2 text-text font-mono text-[14px] transition-colors focus:outline-none focus:border-b-primary keyboard-focus-ring"
              />
            </div>

            <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
              <legend className="font-mono text-[11px] text-text-subtle tracking-wide uppercase mb-2">
                {t("contact.f_project")}
              </legend>
              <div className="flex flex-wrap gap-2">
                {projects.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedProject(p === selectedProject ? "" : p)}
                    aria-pressed={selectedProject === p}
                    className={`py-2 px-3 border font-mono text-[12px] cursor-pointer transition-all text-text-muted hover:border-text-subtle hover:text-text keyboard-focus-ring${selectedProject === p ? " bg-primary text-black! border-primary" : " border-border-2 bg-transparent"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="c-message" className="font-mono text-[11px] text-text-subtle tracking-wide uppercase">
                {t("contact.f_message")} <span aria-hidden="true">*</span>
              </label>
              <textarea
                id="c-message"
                rows={4}
                required
                aria-required="true"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "c-message-error" : undefined}
                {...register("message", { required: true })}
                className="bg-transparent border-0 border-b border-border-2 py-2 text-text font-mono text-[14px] resize-none min-h-20 transition-colors focus:outline-none focus:border-b-primary keyboard-focus-ring"
              />
              {errors.message && (
                <span id="c-message-error" role="alert" className="text-[11px] text-error font-mono">
                  Message is required
                </span>
              )}
            </div>

            <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
              <legend className="font-mono text-[11px] text-text-subtle tracking-wide uppercase mb-2">
                {t("contact.f_budget")}
              </legend>
              <div className="flex flex-wrap gap-2">
                {budgets.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBudget(b === selectedBudget ? "" : b)}
                    aria-pressed={selectedBudget === b}
                    className={`py-2 px-3 border font-mono text-[12px] cursor-pointer transition-all text-text-muted hover:border-text-subtle hover:text-text keyboard-focus-ring${selectedBudget === b ? " bg-primary text-black! border-primary" : " border-border-2 bg-transparent"}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </fieldset>

            <button type="submit" disabled={submitting} className="btn btn-filled keyboard-focus-ring mt-2">
              {submitting ? (
                <>
                  <span aria-hidden="true">···</span>
                  <span className="sr-only">Sending…</span>
                </>
              ) : t("contact.f_submit")}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
