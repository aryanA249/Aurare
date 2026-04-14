"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useSiteContent } from "@/components/site-content-provider";

const allSizes = ["All", "King", "Queen"];

export default function CollectionsPage() {
  const { content } = useSiteContent();
  const [fabric, setFabric] = useState("All");
  const [size, setSize] = useState("All");
  const [color, setColor] = useState("All");

  const allFabrics = ["All", ...Array.from(new Set(content.products.map((item) => item.fabric)))];
  const allColors = [
    "All",
    ...Array.from(new Set(content.products.flatMap((item) => item.colorVariants))),
  ];

  const filtered = useMemo(
    () =>
      content.products.filter((item) => {
        const byFabric = fabric === "All" || item.fabric === fabric;
        const bySize = size === "All" || item.sizes.includes(size as "King" | "Queen");
        const byColor = color === "All" || item.colorVariants.includes(color);
        return byFabric && bySize && byColor;
      }),
    [content.products, fabric, size, color],
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Editorial Catalog</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight text-neutral-900">Collections</h1>
        <p className="mt-4 text-neutral-600">
          Curated bedsheet sets defined by material story, sensory touch, and timeless calm.
        </p>
      </header>

      <section className="mt-10 grid gap-5 rounded-2xl border border-neutral-200 bg-white/70 p-5 md:grid-cols-3">
        <div>
          <label htmlFor="fabric" className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Fabric
          </label>
          <select
            id="fabric"
            value={fabric}
            onChange={(event) => setFabric(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700"
          >
            {allFabrics.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="size" className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Size
          </label>
          <select
            id="size"
            value={size}
            onChange={(event) => setSize(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700"
          >
            {allSizes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="color" className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Color
          </label>
          <select
            id="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700"
          >
            {allColors.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </section>
    </main>
  );
}
