import { useRef, useState } from 'preact/hooks';
import { siteContent } from '../content/site';
import {
  validateContactForm,
  type ContactFormErrors,
  type ContactFormField,
  type ContactFormValues,
  type RequiredContactField,
} from './contact-validation';

type FormState = 'idle' | 'invalid' | 'inactive';

const emptyValues: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  message: '',
};

const requiredFields: RequiredContactField[] = [
  'name',
  'email',
  'subject',
  'message',
];

const fieldId = (field: ContactFormField) => `contact-${field}`;

export default function ContactForm() {
  const { form } = siteContent.contact;
  const [values, setValues] = useState<ContactFormValues>(emptyValues);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [state, setState] = useState<FormState>('idle');
  const [announcement, setAnnouncement] = useState('');
  const fieldRefs = useRef<
    Partial<
      Record<
        ContactFormField,
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    >
  >({});

  const updateField = (field: ContactFormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field as RequiredContactField]) return current;
      const next = { ...current };
      delete next[field as RequiredContactField];
      return next;
    });
    if (state !== 'idle') setState('idle');
  };

  const validateAndAnnounce = () => {
    const nextErrors = validateContactForm(values, form.errors);
    setErrors(nextErrors);
    const firstInvalid = requiredFields.find((field) => nextErrors[field]);

    if (firstInvalid) {
      setState('invalid');
      setAnnouncement(form.invalidSummary);
      requestAnimationFrame(() => fieldRefs.current[firstInvalid]?.focus());
      return;
    }

    setState('inactive');
    setAnnouncement(form.inactiveStatus);
  };

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    validateAndAnnounce();
  };

  return (
    <form
      className="space-y-4"
      noValidate
      aria-describedby="contact-form-note"
      onSubmit={handleSubmit}
    >
      <h3 className="mb-2 text-2xl font-extrabold text-brand-ink">
        {form.title}
      </h3>
      <p id="contact-form-note" className="sr-only">
        {form.inactiveNote}
      </p>

      {state === 'invalid' && (
        <div
          id="contact-form-errors"
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p className="font-semibold">{form.invalidSummary}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {requiredFields.map((field) =>
              errors[field] ? (
                <li key={field}>
                  <a className="underline" href={`#${fieldId(field)}`}>
                    {errors[field]}
                  </a>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      )}

      {state === 'inactive' && (
        <p
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
        >
          {form.inactiveStatus}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block text-sm font-semibold text-gray-700"
            htmlFor={fieldId('name')}
          >
            {form.labels.name} <span aria-hidden="true">*</span>
            <span className="sr-only">({form.required})</span>
          </label>
          <input
            id={fieldId('name')}
            ref={(element) => {
              if (element) fieldRefs.current.name = element;
            }}
            name="name"
            type="text"
            value={values.name}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            autoComplete="name"
            placeholder={form.placeholders.name}
            className="w-full rounded-xl border-2 border-gray-200 bg-[#f0fafc] px-4 py-3 text-sm transition outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10"
            onInput={(event) => updateField('name', event.currentTarget.value)}
          />
          {errors.name && (
            <p id="contact-name-error" className="mt-1 text-xs text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            className="mb-1.5 block text-sm font-semibold text-gray-700"
            htmlFor={fieldId('email')}
          >
            {form.labels.email} <span aria-hidden="true">*</span>
            <span className="sr-only">({form.required})</span>
          </label>
          <input
            id={fieldId('email')}
            ref={(element) => {
              if (element) fieldRefs.current.email = element;
            }}
            name="email"
            type="email"
            value={values.email}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            autoComplete="email"
            placeholder={form.placeholders.email}
            className="w-full rounded-xl border-2 border-gray-200 bg-[#f0fafc] px-4 py-3 text-sm transition outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10"
            onInput={(event) => updateField('email', event.currentTarget.value)}
          />
          {errors.email && (
            <p id="contact-email-error" className="mt-1 text-xs text-red-600">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block text-sm font-semibold text-gray-700"
            htmlFor={fieldId('phone')}
          >
            {form.labels.phone}
          </label>
          <input
            id={fieldId('phone')}
            ref={(element) => {
              if (element) fieldRefs.current.phone = element;
            }}
            name="phone"
            type="tel"
            value={values.phone}
            autoComplete="tel"
            placeholder={form.placeholders.phone}
            className="w-full rounded-xl border-2 border-gray-200 bg-[#f0fafc] px-4 py-3 text-sm transition outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10"
            onInput={(event) => updateField('phone', event.currentTarget.value)}
          />
        </div>

        <div>
          <label
            className="mb-1.5 block text-sm font-semibold text-gray-700"
            htmlFor={fieldId('company')}
          >
            {form.labels.company}
          </label>
          <input
            id={fieldId('company')}
            ref={(element) => {
              if (element) fieldRefs.current.company = element;
            }}
            name="company"
            type="text"
            value={values.company}
            autoComplete="organization"
            placeholder={form.placeholders.company}
            className="w-full rounded-xl border-2 border-gray-200 bg-[#f0fafc] px-4 py-3 text-sm transition outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10"
            onInput={(event) =>
              updateField('company', event.currentTarget.value)
            }
          />
        </div>
      </div>

      <div>
        <label
          className="mb-1.5 block text-sm font-semibold text-gray-700"
          htmlFor={fieldId('subject')}
        >
          {form.labels.subject} <span aria-hidden="true">*</span>
          <span className="sr-only">({form.required})</span>
        </label>
        <select
          id={fieldId('subject')}
          ref={(element) => {
            if (element) fieldRefs.current.subject = element;
          }}
          name="subject"
          value={values.subject}
          required
          aria-required="true"
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={
            errors.subject ? 'contact-subject-error' : undefined
          }
          className="w-full rounded-xl border-2 border-gray-200 bg-[#f0fafc] px-4 py-3 text-sm transition outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10"
          onChange={(event) =>
            updateField('subject', event.currentTarget.value)
          }
        >
          <option value="">{form.placeholders.subject}</option>
          {Object.entries(form.subjects).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.subject && (
          <p id="contact-subject-error" className="mt-1 text-xs text-red-600">
            {errors.subject}
          </p>
        )}
      </div>

      <div>
        <label
          className="mb-1.5 block text-sm font-semibold text-gray-700"
          htmlFor={fieldId('message')}
        >
          {form.labels.message} <span aria-hidden="true">*</span>
          <span className="sr-only">({form.required})</span>
        </label>
        <textarea
          id={fieldId('message')}
          ref={(element) => {
            if (element) fieldRefs.current.message = element;
          }}
          name="message"
          rows={4}
          value={values.message}
          required
          aria-required="true"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? 'contact-message-error' : undefined
          }
          placeholder={form.placeholders.message}
          className="w-full resize-none rounded-xl border-2 border-gray-200 bg-[#f0fafc] px-4 py-3 text-sm transition outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10"
          onInput={(event) => updateField('message', event.currentTarget.value)}
        />
        {errors.message && (
          <p id="contact-message-error" className="mt-1 text-xs text-red-600">
            {errors.message}
          </p>
        )}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      <button
        type="button"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold text-white shadow-[0_8px_25px_rgba(59,130,246,0.45)] transition hover:-translate-y-1"
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        }}
        onClick={validateAndAnnounce}
      >
        {/* Exact Icons0 lucide:send geometry; this control lives in the Preact island. */}
        <svg
          aria-hidden="true"
          data-icon="lucide:send"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11zm7.318-19.539l-10.94 10.939" />
        </svg>
        {form.submit}
      </button>
    </form>
  );
}
