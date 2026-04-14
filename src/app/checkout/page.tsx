"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatINR } from "@/lib/catalog";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [placed, setPlaced] = useState(false);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10 md:py-16">
      <h1 className="font-serif text-5xl text-neutral-900">Checkout</h1>
      <p className="mt-3 text-neutral-600">A seamless finish to your sleep ritual selection.</p>

      <div className="mt-10 grid gap-8 md:grid-cols-[1.2fr_1fr]">
        <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white/80 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Contact</p>
            <input
              type="email"
              placeholder="Email"
              className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Shipping</p>
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              <input className="rounded-xl border border-neutral-300 px-3 py-2 text-sm" placeholder="First Name" />
              <input className="rounded-xl border border-neutral-300 px-3 py-2 text-sm" placeholder="Last Name" />
              <input className="rounded-xl border border-neutral-300 px-3 py-2 text-sm md:col-span-2" placeholder="Address" />
              <input className="rounded-xl border border-neutral-300 px-3 py-2 text-sm" placeholder="City" />
              <input className="rounded-xl border border-neutral-300 px-3 py-2 text-sm" placeholder="Postal Code" />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Payment</p>
            <input
              className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              placeholder="Card Number"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              clearCart();
              setPlaced(true);
            }}
            className="inline-flex rounded-full bg-neutral-900 px-6 py-3 text-sm tracking-[0.12em] text-neutral-100 transition-all duration-300 hover:scale-[1.01] hover:bg-neutral-800"
          >
            Place Order
          </button>
          <p className="h-5 text-sm text-neutral-600">{placed ? "Order placed with quiet gratitude." : ""}</p>
        </section>

        <aside className="h-fit rounded-2xl border border-neutral-200 bg-white/80 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Order Details</p>
          <ul className="mt-4 space-y-3 text-sm text-neutral-700">
            {items.length === 0 ? (
              <li>Your cart is currently empty.</li>
            ) : (
              items.map((item) => (
                <li key={`${item.slug}-${item.size}-${item.color}`} className="flex justify-between gap-3">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatINR(item.price * item.quantity)}</span>
                </li>
              ))
            )}
          </ul>
          <div className="mt-5 border-t border-neutral-200 pt-4 text-neutral-900">
            <div className="flex justify-between">
              <span>Total</span>
              <span>{formatINR(subtotal)}</span>
            </div>
          </div>
          <Link href="/collections" className="mt-5 inline-block text-sm text-neutral-500 underline underline-offset-4">
            Continue browsing collections
          </Link>
        </aside>
      </div>
    </main>
  );
}
