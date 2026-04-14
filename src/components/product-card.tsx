"use client";

import Link from "next/link";
import { formatINR, type Product } from "@/lib/catalog";
import { useCart } from "@/components/cart-provider";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/80 p-5 transition-all duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_60px_-38px_rgba(63,44,26,0.45)]">
      <Link href={`/product/${product.slug}`} className="block">
        <div
          className="relative mb-5 h-60 overflow-hidden rounded-xl bg-[radial-gradient(circle_at_25%_25%,#f3ece1_0%,#d9cebf_58%,#c7b7a2_100%)] bg-cover bg-center"
          style={
            product.imageUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.14), rgba(0,0,0,0.05)), url(${product.imageUrl})`,
                }
              : undefined
          }
        >
          <div className="absolute inset-0 scale-100 bg-[linear-gradient(170deg,rgba(255,255,255,0.35),rgba(0,0,0,0.03))] transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]" />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{product.fabric}</p>
        <h3 className="mt-2 font-serif text-2xl text-neutral-900">{product.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">{product.description}</p>
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm tracking-wide text-neutral-700">From {formatINR(product.startingPrice)}</p>
        <button
          type="button"
          onClick={() =>
            addItem({
              product,
              size: "Queen",
              color: product.colorVariants[0],
            })
          }
          className="rounded-full border border-neutral-400 px-4 py-2 text-xs tracking-[0.14em] text-neutral-800 transition-all duration-300 hover:scale-[1.01] hover:bg-neutral-900 hover:text-neutral-100"
        >
          Add
        </button>
      </div>
      <p className="mt-3 text-xs text-neutral-500">Bedsheet + complimentary pillow covers</p>
    </article>
  );
}
