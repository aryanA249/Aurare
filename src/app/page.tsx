"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { useSiteContent } from "@/components/site-content-provider";

export default function Home() {
  const { content } = useSiteContent();

  return (
    <main className="flex-1">
      <section className="mx-auto grid min-h-[84vh] w-full max-w-7xl items-end gap-8 px-6 pb-14 pt-10 md:grid-cols-[1.15fr_1fr] md:px-10 md:pb-16">
        <div className="space-y-5">
          <p className="fade-rise text-xs uppercase tracking-[0.24em] text-neutral-500">
            {content.brandName} House of Sleep
          </p>
          <h1 className="fade-rise fade-rise-delay-1 max-w-xl font-serif text-6xl leading-[0.95] text-neutral-900 md:text-8xl">
            {content.heroHeadline}
          </h1>
          <p className="fade-rise fade-rise-delay-2 max-w-lg text-base leading-relaxed text-neutral-700 md:text-lg">
            {content.heroSubtext}
          </p>
          <Link
            href="/collections"
            className="fade-rise fade-rise-delay-3 inline-flex rounded-full bg-neutral-900 px-7 py-3 text-sm tracking-[0.13em] text-neutral-100 transition-all duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.01] hover:bg-neutral-800"
          >
            {content.heroCta}
          </Link>
        </div>
        <div
          className="h-[62vh] min-h-[380px] rounded-[2.2rem] bg-[radial-gradient(circle_at_22%_28%,#f4ece0_0%,#ddcfbf_56%,#c3af99_100%)] bg-cover bg-center shadow-[0_40px_90px_-56px_rgba(55,36,20,0.58)]"
          style={
            content.heroImageUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.08), rgba(0,0,0,0.06)), url(${content.heroImageUrl})`,
                }
              : undefined
          }
        />
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-4">
          {content.valueProps.map((value, index) => (
            <article
              key={value}
              style={{ ["--delay" as string]: `${index * 90}ms` }}
              className="stagger-card rounded-2xl border border-neutral-200/80 bg-[var(--aurare-surface)]/70 p-5"
            >
              <p className="font-serif text-2xl leading-tight text-neutral-900">{value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <header className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Collections</p>
          <h2 className="mt-2 font-serif text-5xl text-neutral-900">Multi-Fabric Curation</h2>
        </header>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {content.collections.map((collection, index) => (
            <Link
              key={collection.slug}
              href="/collections"
              style={{ ["--delay" as string]: `${index * 100}ms` }}
              className="group stagger-card rounded-2xl border border-neutral-200/80 bg-white/80 p-5 transition-all duration-[560ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[0_34px_68px_-42px_rgba(55,34,20,0.48)]"
            >
              <div
                className="h-44 rounded-xl bg-[linear-gradient(130deg,#f0e7db,#d8c8b5)] bg-cover bg-center transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                style={
                  collection.imageUrl
                    ? {
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1), rgba(0,0,0,0.04)), url(${collection.imageUrl})`,
                      }
                    : undefined
                }
              />
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-500">{collection.fabric}</p>
              <h3 className="mt-2 font-serif text-3xl text-neutral-900">{collection.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-650">{collection.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <header className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Fabric Story</p>
          <h2 className="mt-2 font-serif text-5xl text-neutral-900">The Fabric of Conscious Luxury</h2>
        </header>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {content.fabricStories.map((story, index) => (
            <article
              key={story.name}
              style={{ ["--delay" as string]: `${index * 90}ms` }}
              className="stagger-card rounded-2xl border border-neutral-200/80 bg-[var(--aurare-surface)]/70 p-6"
            >
              <h3 className="font-serif text-3xl text-neutral-900">{story.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">{story.sensory}</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-650">{story.emotional}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-neutral-500">
                {story.sustainability}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <header className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Product Showcase</p>
          <h2 className="mt-2 font-serif text-5xl text-neutral-900">Bedsheet Sets</h2>
          <p className="mt-3 text-neutral-650">King and Queen sizes with complimentary pillow covers.</p>
        </header>
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {content.products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <header className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Comparison</p>
          <h2 className="mt-2 font-serif text-5xl text-neutral-900">Fabric Comparison</h2>
        </header>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-neutral-200 bg-white/80">
          <table className="min-w-full text-left text-sm text-neutral-700">
            <thead className="border-b border-neutral-200 text-xs uppercase tracking-[0.16em] text-neutral-500">
              <tr>
                <th className="px-4 py-3">Fabric Type</th>
                <th className="px-4 py-3">Softness</th>
                <th className="px-4 py-3">Breathability</th>
                <th className="px-4 py-3">Durability</th>
                <th className="px-4 py-3">Ideal Season</th>
                <th className="px-4 py-3">Feel</th>
              </tr>
            </thead>
            <tbody>
              {content.fabricComparison.map((row) => (
                <tr key={row.fabric} className="border-b border-neutral-100 last:border-none">
                  <td className="px-4 py-3 font-medium text-neutral-900">{row.fabric}</td>
                  <td className="px-4 py-3">{row.softness}</td>
                  <td className="px-4 py-3">{row.breathability}</td>
                  <td className="px-4 py-3">{row.durability}</td>
                  <td className="px-4 py-3">{row.season}</td>
                  <td className="px-4 py-3">{row.feel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-12 text-center md:py-16">
        <p className="font-serif text-5xl leading-tight text-neutral-900 md:text-6xl">
          {content.sensoryLine}
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-neutral-650">
          Every Aurare weave is composed to quiet the room, soften the senses, and invite a slower rhythm of rest.
        </p>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 pb-16 pt-6 text-center md:pb-20">
        <p className="font-serif text-4xl leading-tight text-neutral-900 md:text-5xl">
          {content.philosophy}
        </p>
        <Link
          href="/collections"
          className="mt-10 inline-flex rounded-full border border-neutral-500 px-8 py-3 text-sm tracking-[0.13em] text-neutral-800 transition-all duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.01] hover:bg-neutral-900 hover:text-neutral-100"
        >
          {content.finalCta}
        </Link>
      </section>
    </main>
  );
}
