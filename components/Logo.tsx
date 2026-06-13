import Image from "next/image";

/** Credora brand mark. Sized via className (e.g. "h-8 w-8"). */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/credora-logo.png"
      alt="Credora"
      width={40}
      height={40}
      priority
      className={className}
    />
  );
}
