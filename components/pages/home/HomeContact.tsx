"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { appConfig } from "@/config/app.config"
import { showToast } from "@/components/ui/Toaster"
import { logger } from "@/utils/logger"

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
      const mailto = `mailto:${appConfig.email}?subject=Project inquiry — ${selectedProject || "General"}&body=${encodeURIComponent(
        `Name: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company}\nProject: ${selectedProject}\nBudget: ${selectedBudget}\n\n${data.message}`
      )}`
      window.location.href = mailto
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
    <section id="contact" className="page-section">
      <div className="shell">
        <div className="section-head">
          <span className="section-head-meta">{t("sections.contact_meta")}</span>
          <h2 className="section-head-title">{t("sections.contact_title")}</h2>
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
            <a href={`mailto:${appConfig.email}`} className="text-primary text-[14px] no-underline transition-opacity duration-150 hover:opacity-75">
              {appConfig.email}
            </a>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-10 flex flex-col gap-4 bg-surface max-[900px]:p-6">
            <div className="form-field">
              <label htmlFor="c-name">{t("contact.f_name")}</label>
              <input id="c-name" {...register("name", { required: true })} aria-invalid={!!errors.name} className="keyboard-focus-ring" />
            </div>
            <div className="form-field">
              <label htmlFor="c-email">{t("contact.f_email")}</label>
              <input id="c-email" type="email" {...register("email", { required: true })} aria-invalid={!!errors.email} className="keyboard-focus-ring" />
            </div>
            <div className="form-field">
              <label htmlFor="c-company">{t("contact.f_company")}</label>
              <input id="c-company" {...register("company")} className="keyboard-focus-ring" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[11px] text-text-subtle tracking-widest uppercase">{t("contact.f_project")}</label>
              <div className="flex flex-wrap gap-2">
                {projects.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedProject(p === selectedProject ? "" : p)}
                    className={`budget-chip keyboard-focus-ring${selectedProject === p ? " active" : ""}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="c-message">{t("contact.f_message")}</label>
              <textarea id="c-message" rows={4} {...register("message", { required: true })} aria-invalid={!!errors.message} className="keyboard-focus-ring" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[11px] text-text-subtle tracking-widest uppercase">{t("contact.f_budget")}</label>
              <div className="flex flex-wrap gap-2">
                {budgets.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBudget(b === selectedBudget ? "" : b)}
                    className={`budget-chip keyboard-focus-ring${selectedBudget === b ? " active" : ""}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-filled keyboard-focus-ring mt-2">
              {submitting ? "···" : t("contact.f_submit")}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
