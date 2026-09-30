import type { Variant } from "../types/product.ts";

export type VariantChoice = {
  color: string | null;
  size: string | null;
};

export function choiceFromVariant(variant: Variant | null): VariantChoice {
  return {
    color: variant?.color ?? null,
    size: variant?.size ?? null,
  };
}

export function optionValues(variants: Variant[], key: "color" | "size"): string[] {
  const values: string[] = [];

  for (const variant of variants) {
    const value = variant[key];
    if (value && !values.includes(value)) {
      values.push(value);
    }
  }

  return values;
}

export function matchVariant(variants: Variant[], choice: VariantChoice): Variant | null {
  return (
    variants.find((variant) => {
      const colorMatches = choice.color === null || variant.color === choice.color;
      const sizeMatches = choice.size === null || variant.size === choice.size;
      return colorMatches && sizeMatches;
    }) ?? null
  );
}

export function chooseVariantOption(
  variants: Variant[],
  choice: VariantChoice,
  key: "color" | "size",
  value: string,
): VariantChoice {
  const next: VariantChoice = { ...choice, [key]: value };
  if (matchVariant(variants, next)) {
    return next;
  }

  const other = key === "color" ? "size" : "color";
  const compatible = variants.find((variant) => variant[key] === value);
  if (!compatible) {
    return next;
  }

  return { ...next, [other]: compatible[other] };
}
