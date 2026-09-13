import Link from "next/link";

export function Logo({
  size = 56,
  withText = false,
  lightText = false,
}: {
  size?: number;
  withText?: boolean;
  lightText?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_8px_24px_rgba(3,4,94,0.18)] ring-2 ring-white"
        style={{ width: size, height: size, padding: Math.max(4, size * 0.08) }}
      >
        <img
          src="/images/bu-logo.png"
          alt="Bahria University"
          className="h-full w-full object-contain object-center"
        />
      </span>
      {withText ? (
        <div className="leading-tight">
          <p
            className={`text-[11px] font-bold uppercase tracking-[0.18em] ${
              lightText ? "text-sky" : "text-ocean"
            }`}
          >
            Bahria University
          </p>
          <p className={`font-display text-lg font-bold ${lightText ? "text-white" : "text-navy"}`}>
            Cafeteria
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function BrandLink({
  href = "/",
  size = 52,
  lightText = true,
}: {
  href?: string;
  size?: number;
  lightText?: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-3">
      <Logo size={size} withText lightText={lightText} />
    </Link>
  );
}
