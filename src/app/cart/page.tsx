"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatINR } from "@/lib/catalog";

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity } = useCart();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10 md:py-16">
      <h1 className="font-serif text-5xl text-neutral-900">Your Cart</h1>
      <p className="mt-3 text-neutral-600">A quiet curation of your selected sleep essentials.</p>

      <div className="mt-10 grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <section className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white/70 p-8 text-neutral-600">
              Your ritual cart is empty.
            </div>
          ) : (
            items.map((item, index) => (
              <article
                key={`${item.slug}-${item.size}-${item.color}`}
                className="rounded-2xl border border-neutral-200 bg-white/80 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl text-neutral-900">{item.name}</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                      {item.fabric} • {item.size} • {item.color}
                    </p>
                  </div>
                  <p className="text-lg text-neutral-900">{formatINR(item.price)}</p>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <label htmlFor={`qty-${index}`} className="text-sm text-neutral-600">
                    Qty
                  </label>
                  <input
                    id={`qty-${index}`}
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) => updateQuantity(index, Number(event.target.value))}
                    className="w-20 rounded-lg border border-neutral-300 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="ml-auto text-sm text-neutral-500 underline underline-offset-4"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <aside className="h-fit rounded-2xl border border-neutral-200 bg-white/80 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Order Summary</p>
          <div className="mt-4 flex items-center justify-between text-neutral-700">
            <span>Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-neutral-700">
            <span>Shipping</span>
            <span>Complimentary</span>
          </div>
          <div className="mt-4 border-t border-neutral-200 pt-4 text-lg text-neutral-900">
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span>{formatINR(subtotal)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-6 inline-flex w-full justify-center rounded-full bg-neutral-900 px-5 py-3 text-sm tracking-[0.12em] text-neutral-100 transition-all duration-300 hover:scale-[1.01] hover:bg-neutral-800"
          >
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </main>
  );
}
