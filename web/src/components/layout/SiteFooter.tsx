import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { BrandLogo } from "@/components/ui/brand-logo";
import { CtaButton } from "@/components/ui/cta-button";
import type { SiteConfig } from "@/types";

export function SiteFooter({ site }: { site: SiteConfig }) {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-night-gradient relative overflow-hidden text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-24 size-[520px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(30,150,212,.55) 0%, rgba(7,19,32,0) 68%)",
        }}
      />

      <div className="container-x relative py-16 md:py-20">
        <Reveal className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-12 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.24em] text-brand-glow uppercase">
              GET IN TOUCH
            </p>
            <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.6rem)] leading-tight font-bold text-white">
              全球成功，从这里开始
            </h2>
            <p className="mt-3 text-sm text-white/60">
              欢迎咨询任何跨境出海问题的解决方案。
            </p>
          </div>
          <CtaButton href={`mailto:${site.businessEmail}`} size="lg">
            联系我们
          </CtaButton>
        </Reveal>

        <div className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <BrandLogo logoText={site.logoText} logoSub={site.logoSub} variant="light" />
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              {site.name}
              <br />
              {site.nameEn}
            </p>
            <div className="mt-5 space-y-1.5 text-sm text-white/60">
              <p>
                商务合作：
                <a
                  href={`mailto:${site.businessEmail}`}
                  className="text-white transition-colors hover:text-brand-glow"
                >
                  {site.businessEmail}
                </a>
              </p>
              <p>
                客户咨询：
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="text-white transition-colors hover:text-brand-glow"
                >
                  {site.contactEmail}
                </a>
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-3 text-sm">
            <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-white/40 uppercase">
              网站导航
            </p>
            {site.footerLinks.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                {...(item.external || item.href.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : {})}
                className="w-fit text-white/70 transition-all duration-300 hover:translate-x-1 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="text-sm">
            <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-white/40 uppercase">
              联系我们
            </p>
            <p className="leading-relaxed text-white/70">{site.address}</p>
            <p className="mt-4 text-white/70">电话：{site.phone}</p>
            <div className="mt-5 flex gap-3">
              {["WeChat", "LinkedIn", "X"].map((name) => (
                <span
                  key={name}
                  className="grid size-9 place-items-center rounded-full border border-white/15 text-[11px] text-white/70 transition-colors duration-300 hover:border-brand/60 hover:text-white"
                >
                  {name === "WeChat" ? "微" : name === "LinkedIn" ? "in" : "X"}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.name} All Rights Reserved.
          </p>
          <p>{site.icp}</p>
        </div>
      </div>
    </footer>
  );
}
