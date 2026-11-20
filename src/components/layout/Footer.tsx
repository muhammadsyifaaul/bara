const FOOTER_LINKS = [
  { label: "Philosophy", href: "#philosophy" },
  { label: "Tasting Menu", href: "#tasting-menu" },
  { label: "The Hearth", href: "#hearth" },
  { label: "Reserve", href: "#reserve" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(120,72,40,0.12)] py-10
                       [html[data-theme=dinner]_&]:border-[rgba(217,130,54,0.14)]">
      <div className="max-w-xl px-6 md:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-0">
          {/* Wordmark */}
          <div className="flex flex-col leading-none mr-auto">
            <span
              className="text-xl font-semibold tracking-[0.18em] text-ink-primary"
              style={{ fontFamily: "var(--font-display)" }}
            >
              BARA
            </span>
            <span className="telemetry text-ink-muted mt-[2px]">
              Wood-Fired Gastronomy
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-5">
            {FOOTER_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-xs text-ink-muted hover:text-brass transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="mt-8 mb-5 h-px bg-[rgba(120,72,40,0.1)]
                        [html[data-theme=dinner]_&]:bg-[rgba(217,130,54,0.1)]" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="telemetry text-ink-muted text-[0.6rem]">
            © 2026 BARA Wood-Fired Gastronomy · Senopati, Jakarta
          </p>
          <div className="sm:ml-auto flex items-center gap-4">
            <span className="telemetry text-ink-muted text-[0.6rem] opacity-60">
              Dinner seatings Wed – Sun · 18:00 &amp; 20:30
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
