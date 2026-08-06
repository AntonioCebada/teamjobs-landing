import { useEffect, useRef, useState } from 'preact/hooks';

type Props = {
  links: ReadonlyArray<{ href: string; label: string }>;
  loginHref: string;
  flags: {
    mexico: string;
    usa: string;
  };
  labels: {
    open: string;
    close: string;
    language: string;
    login: string;
  };
};

const focusable =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileNav({ links, loginHref, flags, labels }: Props) {
  const [open, setOpen] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const background = [...document.body.children].filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && !element.contains(detailsRef.current),
    );
    const previous = background.map((element) => ({
      element,
      ariaHidden: element.getAttribute('aria-hidden'),
      inert: element.inert,
    }));
    document.body.style.overflow = 'hidden';
    background.forEach((element) => {
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
    });
    requestAnimationFrame(() =>
      panelRef.current?.querySelector<HTMLElement>(focusable)?.focus(),
    );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return close();
      if (event.key !== 'Tab') return;
      const items = [
        ...(panelRef.current?.querySelectorAll<HTMLElement>(focusable) ?? []),
      ];
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      if (!panelRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous.forEach(({ element, ariaHidden, inert }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', ariaHidden);
      });
    };
  }, [open]);

  return (
    <details
      ref={detailsRef}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      class="group lg:hidden"
    >
      <summary
        ref={triggerRef}
        aria-label={open ? labels.close : labels.open}
        class="cursor-pointer list-none rounded-lg border border-white/20 p-2 group-open:fixed group-open:top-5 group-open:right-6 group-open:z-[60] [&::-webkit-details-marker]:hidden"
      >
        {open ? (
          <svg
            data-icon="lucide:x"
            aria-hidden="true"
            viewBox="0 0 24 24"
            class="size-6 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            data-icon="lucide:menu"
            aria-hidden="true"
            viewBox="0 0 24 24"
            class="size-6 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <path d="M4 5h16M4 12h16M4 19h16" />
          </svg>
        )}
      </summary>
      <div
        ref={panelRef}
        class="fixed inset-0 z-50 flex flex-col bg-brand-navy p-6 text-white"
        onPointerDown={(event) =>
          event.target === event.currentTarget && close()
        }
      >
        <div class="mx-auto flex w-full max-w-sm flex-col gap-2 pt-8 text-lg font-semibold">
          {links.map(({ href, label }) => (
            <a
              class="rounded-md px-4 py-3 hover:bg-white/10"
              href={href}
              onClick={() => close(false)}
            >
              {label}
            </a>
          ))}
          <div class="mt-2 flex flex-wrap items-center gap-3 px-4 py-3">
            <span
              role="img"
              aria-label={`Idioma actual: ${labels.language}`}
              class="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1"
            >
              <span class="rounded-full bg-brand-blue p-1">
                <img
                  src={flags.mexico}
                  alt=""
                  class="size-5 rounded-full object-cover"
                />
              </span>
              <span class="rounded-full p-1">
                <img
                  src={flags.usa}
                  alt=""
                  class="size-5 rounded-full object-cover"
                />
              </span>
            </span>
            <a
              class="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_25px_rgba(59,130,246,0.45)] transition hover:bg-blue-600"
              href={loginHref}
              onClick={() => close(false)}
            >
              {labels.login}
            </a>
          </div>
        </div>
      </div>
    </details>
  );
}
