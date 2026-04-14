"use client";

import { ProductDetail } from "@/components/product-detail";
import { useSiteContent } from "@/components/site-content-provider";

type ProductPageProps = {
  params: { slug: string };
};

export default function ProductPage({ params }: ProductPageProps) {
  const { content } = useSiteContent();
  const product = content.products.find((item) => item.slug === params.slug);

  if (!product) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center px-6 py-16 text-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Not Found</p>
          <h1 className="mt-3 font-serif text-5xl text-neutral-900">This product no longer exists.</h1>
        </div>
      </main>
    );
  }

  return <ProductDetail product={product} />;
}
