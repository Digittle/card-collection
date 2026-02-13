"use client";

import Link from "next/link";

interface CardCarouselProps {
  title: string;
  seeAllHref?: string;
  children: React.ReactNode;
}

export function CardCarousel({ title, seeAllHref, children }: CardCarouselProps) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between px-5 pb-3">
        <h3 className="text-[17px] font-bold text-white">{title}</h3>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-[13px] font-medium text-white/40 transition-colors active:text-white/60"
          >
            すべて見る &rsaquo;
          </Link>
        )}
      </div>
      <div className="scrollbar-hide flex gap-3 overflow-x-auto px-5 snap-x snap-mandatory">
        {children}
      </div>
    </section>
  );
}
