"use client";

import { ArrowUpRight, CircleCheck, LoaderCircle, Lock, Send } from "lucide-react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { submitLead } from "@/app/contact/actions";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FormBanner, FormField, inputStyles } from "@/components/ui/FormField";
import type { ContactContent } from "@/lib/cms/pages/contact";
import {
  leadSchema,
  SERVICE_OPTIONS,
  type FormState,
  type LeadField,
  type ServiceValue,
} from "@/lib/validation";

type Values = Record<LeadField, string>;
type ClientErrors = Partial<Record<LeadField, string | null>>;

const FIELDS: LeadField[] = ["name", "email", "service", "message"];
const INITIAL_STATE: FormState<LeadField> = { status: "idle" };
const MESSAGE_MAX = 5000;

function validateField(field: LeadField, value: string) {
  const result = leadSchema.shape[field].safeParse(value);
  return result.success ? null : (result.error.issues[0]?.message ?? "This field is invalid.");
}

type FormCopy = ContactContent["form"];

export function ContactForm({
  initialService,
  copy,
  bookingUrl,
}: {
  initialService: ServiceValue | "";
  copy: FormCopy;
  bookingUrl: string;
}) {
  const [formKey, setFormKey] = useState(0);
  return (
    <LeadForm
      key={formKey}
      initialService={initialService}
      copy={copy}
      bookingUrl={bookingUrl}
      onReset={() => setFormKey((key) => key + 1)}
    />
  );
}

function LeadForm({
  initialService,
  copy,
  bookingUrl,
  onReset,
}: {
  initialService: ServiceValue | "";
  copy: FormCopy;
  bookingUrl: string;
  onReset: () => void;
}) {
  const [state, formAction, pending] = useActionState(submitLead, INITIAL_STATE);
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    service: initialService,
    message: "",
  });
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.status === "success") successHeadingRef.current?.focus();
  }, [state.status]);

  const errorFor = (field: LeadField) =>
    field in clientErrors ? clientErrors[field] : state.fieldErrors?.[field];

  const handleChange =
    (field: LeadField) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { value } = event.target;
      setValues((current) => ({ ...current, [field]: value }));
      if (field in clientErrors) {
        setClientErrors((current) => ({ ...current, [field]: validateField(field, value) }));
      }
    };

  const handleBlur = (field: LeadField) => () => {
    if (values[field] === "" && !(field in clientErrors)) return;
    setClientErrors((current) => ({ ...current, [field]: validateField(field, values[field]) }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const errors: ClientErrors = {};
    for (const field of FIELDS) errors[field] = validateField(field, values[field]);
    const firstInvalid = FIELDS.find((field) => errors[field]);

    if (firstInvalid) {
      event.preventDefault();
      setClientErrors(errors);
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    setClientErrors({});
  };

  const fieldProps = (field: LeadField) => {
    const error = errorFor(field);
    return {
      id: `lead-${field}`,
      name: field,
      value: values[field],
      onChange: handleChange(field),
      onBlur: handleBlur(field),
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `lead-${field}-error` : undefined,
      className: inputStyles(Boolean(error)),
    };
  };

  if (state.status === "success") {
    return (
      <div role="status" className="py-6 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-accent text-on-accent shadow-glow">
          <CircleCheck aria-hidden className="size-8" />
        </span>
        <h3
          ref={successHeadingRef}
          tabIndex={-1}
          className="mt-6 text-2xl font-extrabold tracking-tight focus:outline-none"
        >
          {copy.successTitle}
        </h3>
        <p className="mx-auto mt-3 max-w-md leading-relaxed">
          {copy.successText}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={bookingUrl} target="_blank" rel="noopener noreferrer">
            Pick a time on Calendly
            <ArrowUpRight aria-hidden className="size-4" />
          </ButtonLink>
          <Button variant="secondary" onClick={onReset}>
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} noValidate className="space-y-5">
      {state.status === "error" && state.message && (
        <FormBanner tone="error">{state.message}</FormBanner>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="lead-name" label={copy.nameLabel} required error={errorFor("name")}>
          <input type="text" autoComplete="name" placeholder={copy.namePlaceholder} required {...fieldProps("name")} />
        </FormField>
        <FormField id="lead-email" label={copy.emailLabel} required error={errorFor("email")}>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={copy.emailPlaceholder}
            required
            {...fieldProps("email")}
          />
        </FormField>
      </div>

      <FormField id="lead-service" label={copy.serviceLabel} required error={errorFor("service")}>
        <select required {...fieldProps("service")}>
          <option value="" disabled>
            Select a service
          </option>
          {SERVICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        id="lead-message"
        label={copy.messageLabel}
        required
        error={errorFor("message")}
        hint={`${values.message.length.toLocaleString()}/${MESSAGE_MAX.toLocaleString()}`}
      >
        <textarea
          rows={5}
          maxLength={MESSAGE_MAX}
          placeholder={copy.messagePlaceholder}
          required
          {...fieldProps("message")}
          className={`${fieldProps("message").className} resize-y`}
        />
      </FormField>

      <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="lead-company-website">Leave this field empty</label>
        <input id="lead-company-website" type="text" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? (
          <>
            <LoaderCircle aria-hidden className="size-5 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            {copy.submitLabel}
            <Send aria-hidden className="size-4" />
          </>
        )}
      </Button>

      <p className="flex items-center justify-center gap-2 text-xs">
        <Lock aria-hidden className="size-3.5 text-gold" />
        {copy.privacyNote}
      </p>
    </form>
  );
}
