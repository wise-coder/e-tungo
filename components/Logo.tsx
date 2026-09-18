import Link from "next/link";
import Image from "next/image";

type LogoProps = {
  href?: string;
  className?: string;
};

export default function Logo({ href = "/", className = "" }: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-1.5 leading-none ${className}`}>
      <Image src="/e-tungo-alltime-logo.png" alt="" width={48} height={48} priority className="h-[1.55em] w-[1.55em] object-contain" />
      <span className="font-extrabold tracking-[-0.05em] text-[#1b5a33]">e-tungo</span>
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
