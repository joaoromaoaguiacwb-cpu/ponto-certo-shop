import { useEffect, useState } from "react";
import { CATEGORIES, type Product } from "@/data/products";

// Ordem: foto principal -> foto do plano B -> emoji da categoria
export function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  const [step, setStep] = useState(0);
  const emoji = CATEGORIES.find((c) => c.id === product.category)?.emoji ?? "🛒";
  const sources = [product.image, product.fallback].filter(Boolean);
  const src = sources[step];

  useEffect(() => {
    setStep(0);
  }, [product.image, product.fallback]);

  if (!src)
    return (
      <div className={`grid place-items-center bg-fallback text-4xl ${className}`} aria-label={product.name}>
        {emoji}
      </div>
    );

  return (
    <img
      key={src}
      src={src}
      alt={product.name}
      loading="lazy"
      onError={() => setStep((s) => s + 1)}
      className={`object-cover bg-muted ${className}`}
    />
  );
}
