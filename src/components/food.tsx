"use client";

import { formatPkr } from "@/lib/utils";
import type { MenuItem } from "@/db/schema";

export function FoodCard({
  item,
  onAdd,
  busy,
}: {
  item: MenuItem;
  onAdd?: (item: MenuItem) => void;
  busy?: boolean;
}) {
  const unavailable = !item.available || item.stockCount <= 0;
  return (
    <article className="card-hover overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="relative h-44 overflow-hidden">
        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-navy/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ice">
          {item.category}
        </span>
        {unavailable ? (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase text-white">
            Out of Stock
          </span>
        ) : item.popular ? (
          <span className="absolute right-3 top-3 rounded-full bg-cyan px-3 py-1 text-[11px] font-bold uppercase text-navy">
            Popular
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl text-navy">{item.name}</h3>
          <p className="font-bold text-ocean">{formatPkr(item.pricePkr)}</p>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-ocean/80">{item.description}</p>
        {onAdd ? (
          <button
            type="button"
            disabled={unavailable || busy}
            onClick={() => onAdd(item)}
            className="btn-primary mt-4 w-full"
          >
            {unavailable ? "Out of Stock" : busy ? "Adding…" : "Add to Cart"}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function CategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="scrollbar-thin flex gap-2 overflow-auto pb-1">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
            value === cat ? "bg-navy text-white" : "bg-white text-ocean"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export function CartItemRow({
  name,
  imageUrl,
  price,
  quantity,
  available,
  onInc,
  onDec,
  onRemove,
}: {
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  available: boolean;
  onInc: () => void;
  onDec: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-4 rounded-3xl bg-white p-4 shadow-sm">
      <img src={imageUrl} alt={name} className="h-20 w-20 rounded-2xl object-cover" />
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-navy">{name}</p>
            <p className="text-sm text-ocean">{formatPkr(price)}</p>
            {!available ? (
              <p className="text-xs font-bold text-red-600">This item is currently unavailable.</p>
            ) : null}
          </div>
          <button type="button" className="text-sm font-semibold text-red-600" onClick={onRemove}>
            Remove
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-full bg-ice">
            <button type="button" className="px-3 py-1 font-bold" onClick={onDec}>
              −
            </button>
            <span className="px-2 font-bold">{quantity}</span>
            <button type="button" className="px-3 py-1 font-bold" onClick={onInc}>
              +
            </button>
          </div>
          <p className="font-bold text-navy">{formatPkr(price * quantity)}</p>
        </div>
      </div>
    </div>
  );
}
