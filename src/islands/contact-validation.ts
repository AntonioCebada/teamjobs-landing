export type RequiredContactField = 'name' | 'email' | 'subject' | 'message';

export type ContactFormField = RequiredContactField | 'phone' | 'company';

export type ContactFormValues = Record<ContactFormField, string>;

export type ContactFormErrors = Partial<Record<RequiredContactField, string>>;

export type ContactErrorMessages = Record<RequiredContactField, string>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateContactForm = (
  values: ContactFormValues,
  messages: ContactErrorMessages,
): ContactFormErrors => {
  const errors: ContactFormErrors = {};

  if (!values.name.trim()) errors.name = messages.name;
  if (!emailPattern.test(values.email.trim())) errors.email = messages.email;
  if (!values.subject.trim()) errors.subject = messages.subject;
  if (!values.message.trim()) errors.message = messages.message;

  return errors;
};
