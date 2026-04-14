"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { formatINR } from "@/lib/catalog";
import { useCart } from "@/components/cart-provider";

type ProductDetailProps = {
  product: Product;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const [size, setSize] = useState<"King" | "Queen">("King");
  const [color, setColor] = useState(product.colorVariants[0]);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const selectedPrice = useMemo(() => {
    return size === "King" ? product.startingPrice + 1200 : product.startingPrice;
  }, [product.startingPrice, size]);

  const firstGallery = product.galleryImages?.[0] ?? "";
  const secondGallery = product.galleryImages?.[1] ?? "";

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_1fr] md:gap-14 md:px-10 md:py-16">
      <div className="space-y-5">
        <div
          className="h-[52vh] min-h-[360px] rounded-3xl bg-[radial-gradient(circle_at_28%_32%,#f6efe5_0%,#decfbf_56%,#c8b59e_100%)] bg-cover bg-center"
          style={
            product.imageUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.08), rgba(0,0,0,0.04)), url(${product.imageUrl})`,
                }
              : undefined
          }
        />
        <div className="grid grid-cols-2 gap-4">
          <div
            className="h-36 rounded-2xl bg-[linear-gradient(130deg,#f3e9dc,#d5c3ad)] bg-cover bg-center"
            style={
              firstGallery
                ? {
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1), rgba(0,0,0,0.04)), url(${firstGallery})`,
                  }
                : undefined
            }
          />
          <div
            className="h-36 rounded-2xl bg-[linear-gradient(130deg,#e9ded1,#ccb89f)] bg-cover bg-center"
            style={
              secondGallery
                ? {
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1), rgba(0,0,0,0.04)), url(${secondGallery})`,
                  }
                : undefined
            }
          />
        </div>
      </div>

      <div className="space-y-7">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{product.fabric}</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight text-neutral-900 md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-650">{product.description}</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Fabric story</p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700">{product.feelOnSkin}</p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700">
            Feel on skin: fluid, breathable, and intentionally calm.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700">
            Included: 1 bedsheet + complimentary pillow covers.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Size</p>
          <div className="mt-3 flex gap-3">
            {product.sizes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSize(option)}
                className={`rounded-full border px-5 py-2 text-sm transition-all duration-300 ${
                  size === option
                    ? "border-neutral-900 bg-neutral-900 text-neutral-100"
                    : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Color</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.colorVariants.map((variant) => (
              <button
                key={variant}
                type="button"
                onClick={() => setColor(variant)}
                className={`rounded-full border px-4 py-2 text-xs tracking-wide transition-all duration-300 ${
                  color === variant
                    ? "border-neutral-900 bg-neutral-900 text-neutral-100"
                    : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                }`}
              >
                {variant}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-6">
          <p className="text-2xl font-medium text-neutral-900">{formatINR(selectedPrice)}</p>
          <p className="mt-1 text-sm text-neutral-500">Starting at {formatINR(product.startingPrice)}</p>
          <button
            type="button"
            onClick={() => {
              addItem({ product, size, color, price: selectedPrice });
              setAdded(true);
              window.setTimeout(() => setAdded(false), 1200);
            }}
            className="mt-5 inline-flex rounded-full bg-neutral-900 px-7 py-3 text-sm tracking-[0.12em] text-neutral-100 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.01] hover:bg-neutral-800"
          >
            Add to Cart
          </button>
          <p className="mt-3 h-5 text-sm text-neutral-600">{added ? "Added to your ritual." : ""}</p>
        </div>
      </div>
    </section>
  );
}
