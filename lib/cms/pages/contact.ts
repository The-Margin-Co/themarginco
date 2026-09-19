import { z } from "zod";
import { field } from "@/lib/cms/fields";

export const contactSchema = z.object({
  hero: field.block(
    "Intro",
    {
      badge: field.text("Badge", { max: 40 }),
      title: field.text("Heading", { max: 80 }),
      highlight: field.text("Heading highlight (yellow)", { max: 40 }),
      description: field.textarea("Intro text", { max: 400 }),
    }),
  channels: field.section("Contact options", {
    emailLabel: field.text("Email card label", { max: 40 }),
    calendlyLabel: field.text("Calendly card label", { max: 40 }),
    calendlyText: field.text("Calendly card text", { max: 60 }),
    responseTitle: field.text("Response promise title", { max: 60 }),
    responseText: field.text("Response promise text", { max: 120, help: "The response time from Site settings is appended." }),
  }),
  nextSteps: field.section("What happens next", {
    title: field.text("Heading", { max: 60 }),
    items: field.list(
      "Steps",
      z.object({ title: field.text("Title", { max: 60 }), description: field.text("Text", { max: 160 }) }),
      { max: 5, itemLabel: "Step" },
    ),
  }),
  form: field.block(
    "Form",
    {
      title: field.text("Form heading", { max: 80 }),
      description: field.text("Form intro", { max: 160 }),
      nameLabel: field.text("Name label", { max: 40 }),
      namePlaceholder: field.text("Name placeholder", { max: 40 }),
      emailLabel: field.text("Email label", { max: 40 }),
      emailPlaceholder: field.text("Email placeholder", { max: 60 }),
      serviceLabel: field.text("Service label", { max: 60 }),
      messageLabel: field.text("Message label", { max: 60 }),
      messagePlaceholder: field.textarea("Message placeholder", { max: 200 }),
      submitLabel: field.text("Submit button", { max: 40 }),
      privacyNote: field.text("Privacy note", { max: 100 }),
      successTitle: field.text("Success heading", { max: 60 }),
      successText: field.textarea("Success text", { max: 300 }),
    }),
});

export type ContactContent = z.infer<typeof contactSchema>;

export const contactDefaults: ContactContent = {
  hero: {
    badge: "Get in touch",
    title: "Let's talk about your",
    highlight: "growth.",
    description:
      "Want to lower your acquisition cost, scale ads profitably or launch a site that actually converts? Tell us where you are and where you want to be.",
  },
  channels: {
    visible: true,
    emailLabel: "Email us",
    calendlyLabel: "Prefer to pick a time?",
    calendlyText: "Book directly on Calendly",
    responseTitle: "Response time commitment.",
    responseText: "Every inquiry gets a personal reply",
  },
  nextSteps: {
    visible: true,
    title: "What happens next",
    items: [
      { title: "We review your details", description: "A strategist looks at your brand, offer and current channels." },
      { title: "Strategy call", description: "30 minutes on your numbers, bottlenecks and biggest opportunities." },
      { title: "Your 48h roadmap", description: "A prioritised action plan, yours to keep whether we work together or not." },
    ],
  },
  form: {
    title: "Request your free strategy call",
    description: "Takes 60 seconds. We'll review your details before we speak.",
    nameLabel: "Full name",
    namePlaceholder: "Jane Smith",
    emailLabel: "Work email",
    emailPlaceholder: "jane@brand.com",
    serviceLabel: "What can we help with?",
    messageLabel: "Tell us about your goals",
    messagePlaceholder: "Current monthly ad spend, what's working, what isn't, and where you want to be in 6 months.",
    submitLabel: "Request My Free Strategy Call",
    privacyNote: "Your details stay confidential and are never shared.",
    successTitle: "Request received!",
    successText:
      "Thanks for reaching out. A strategist will reply within 1 business day with next steps. Want to skip the back-and-forth? Grab a time directly.",
  },
};
