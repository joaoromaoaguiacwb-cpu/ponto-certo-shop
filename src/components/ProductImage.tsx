import { useState } from "react";
import { CATEGORIES, type Product } from "@/data/products";

export function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  const [failed, setFailed] = useState(false);
  const emoji = CATEGORIES.find((c) => c.id === product.category)?.emoji ?? "🛒";
  if (failed)
    return (
      <div className={`grid place-items-center bg-fallback text-4xl ${className}`} aria-label={product.name}>
        {emoji}
      </div>
    );
  return (
    <img src={product.image} alt={product.name} loading="lazy" onError={() => setFailed(true)}
      className={`object-cover bg-muted ${className}`} />
  );
}
