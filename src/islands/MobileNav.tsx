import { useEffect, useRef, useState } from 'preact/hooks';

type Props = {
  links: ReadonlyArray<{ href: string; label: string }>;
  loginHref: string;
  labels: {
    open: string;
    close: string;
    language: string;
    login: string;
  };
};

const focusable =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileNav({ links, loginHref, labels }: Props) {
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
      class="group xl:hidden"
    >
      <summary
        ref={triggerRef}
        aria-label={open ? labels.close : labels.open}
        class="cursor-pointer list-none rounded-md p-3 group-open:fixed group-open:top-4 group-open:right-4 group-open:z-[60] [&::-webkit-details-marker]:hidden"
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
          <p class="px-4 py-3 text-sm font-normal">
            Idioma actual: {labels.language}
          </p>
          <a
            class="mt-2 rounded-full bg-brand-blue px-5 py-3 text-center"
            href={loginHref}
            onClick={() => close(false)}
          >
            {labels.login}
          </a>
        </div>
      </div>
    </details>
  );
}
