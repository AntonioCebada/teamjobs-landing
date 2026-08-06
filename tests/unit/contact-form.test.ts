import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../src/config/site';
import { siteContent } from '../../src/content/site';
import {
  validateContactForm,
  type ContactFormValues,
} from '../../src/islands/contact-validation';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

const validValues: ContactFormValues = {
  name: 'Ana García',
  email: 'ana@empresa.mx',
  phone: '',
  company: 'Empresa MX',
  subject: 'consulting',
  message: 'Necesito orientación para mi equipo.',
};

describe('visual-only contact form contracts', () => {
  it('validates required fields and rejects malformed email without mutating input', () => {
    const errors = validateContactForm(
      {
        ...validValues,
        email: 'not-an-email',
        name: '   ',
        subject: '',
        message: '   ',
      },
      siteContent.contact.form.errors,
    );

    expect(errors).toEqual({
      name: siteContent.contact.form.errors.name,
      email: siteContent.contact.form.errors.email,
      subject: siteContent.contact.form.errors.subject,
      message: siteContent.contact.form.errors.message,
    });
    expect(validValues.name).toBe('Ana García');
  });

  it('accepts valid required data and preserves optional fields', () => {
    expect(
      validateContactForm(validValues, siteContent.contact.form.errors),
    ).toEqual({});
    expect(validValues.phone).toBe('');
    expect(validValues.company).toBe('Empresa MX');
  });

  it('integrates a semantic contact section without a submission endpoint', () => {
    const contact = source('src/components/Contact.astro');
    const form = source('src/islands/ContactForm.tsx');
    const index = source('src/pages/index.astro');

    expect(index).toContain('<Contact />');
    expect(contact).toContain('id="contacto"');
    expect(contact).toContain('<ContactForm client:visible />');
    expect(form).toContain('event.preventDefault()');
    expect(form).toContain('requestAnimationFrame');
    expect(form).toContain('aria-invalid={Boolean(errors.name)}');
    expect(form).toContain('aria-describedby={errors.email ?');
    expect(form).toContain('aria-live="polite"');
    expect(form).toContain('role="alert"');
    expect(form).toContain('role="status"');
    expect(form).toContain('type="button"');
    for (const field of [
      'name',
      'email',
      'phone',
      'company',
      'subject',
      'message',
    ]) {
      expect(form).toContain(`htmlFor={fieldId('${field}')}`);
      expect(form).toContain(`value={values.${field}}`);
    }
    for (const field of ['name', 'email', 'subject', 'message']) {
      expect(form).toContain(`id="contact-${field}-error"`);
      expect(form).toContain(`errors.${field}`);
      expect(form).toContain('aria-required="true"');
    }
    expect(form).not.toMatch(/fetch\s*\(/);
    expect(form).not.toContain('method="post"');
    expect(form).not.toContain('action=');
  });

  it('keeps authoritative contact details and removes vacancy actions', () => {
    expect(siteContent.contact.details).toEqual({
      address:
        'Av. Río Churubusco 601, Xoco, Benito Juárez, 03330 Ciudad de México, CDMX',
      phone: '+52 1 56 1027 5879',
      email: 'teamjobsmexico@gmail.com',
      whatsapp: '+52 1 56 1027 5879',
      hours: 'Lun–Vie: 9:00–18:00 | Sáb: 10:00–14:00 hrs',
    });
    expect(siteConfig.navigation.map(({ key }) => key)).not.toContain(
      'vacantes',
    );
    expect(siteContent.hero.primaryCta).not.toContain('Vacantes');
  });
});
