"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/images/hero-cafeteria.jpg",
    title: "Skip the cafeteria queue",
    subtitle: "Pre-order from your phone and pick up at a reserved time slot.",
  },
  {
    src: "https://images.pexels.com/photos/28674660/pexels-photo-28674660.jpeg?auto=compress&cs=tinysrgb&w=1600",
    title: "Campus biryani, ready on time",
    subtitle: "Pakistani favourites prepared for Bahria University Karachi.",
  },
  {
    src: "https://images.pexels.com/photos/7813574/pexels-photo-7813574.jpeg?auto=compress&cs=tinysrgb&w=1600",
    title: "Burgers, pizza & shakes",
    subtitle: "A full cafeteria menu with live availability and rush-hour slots.",
  },
  {
    src: "https://images.pexels.com/photos/5779364/pexels-photo-5779364.jpeg?auto=compress&cs=tinysrgb&w=1600",
    title: "Pay cash or university wallet",
    subtitle: "Collect a digital slip after checkout and track your order live.",
  },
];

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative h-[78vh] min-h-[520px] overflow-hidden rounded-b-[2.5rem]">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <img
            src={slide.src}
            alt={slide.title}
            className="animate-kenburns h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/55 to-cyan/20" />
        </div>
      ))}
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16 pt-28">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky">
          Bahria University · Karachi Campus
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl text-white md:text-6xl">
          {SLIDES[index].title}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ice">{SLIDES[index].subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/login" className="btn-primary">
            Student Login
          </a>
          <a href="/register" className="btn-ghost">
            Create student account
          </a>
        </div>
        <div className="mt-8 flex gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-10 bg-cyan" : "w-4 bg-white/40"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
