import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
};

export default function Logo({ href = "/", className = "" }: LogoProps) {
  const content = (
    <span
      className={`font-extrabold tracking-[-0.05em] leading-none text-[#375d3f] ${className}`}
    >
      e-tungo
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
