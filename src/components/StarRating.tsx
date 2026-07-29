export default function StarRating({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  const full = Math.round(rating);
  return (
    <span className={`inline-flex items-center gap-0.5 ${size}`}>
      <span className="text-sm-orange" aria-hidden>
        {"★".repeat(full)}
        <span className="text-zinc-300">{"★".repeat(5 - full)}</span>
      </span>
      <span className="ml-1 font-medium text-zinc-700">{rating.toFixed(1)}</span>
    </span>
  );
}
