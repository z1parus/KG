import { cn } from "@/ui/cn";

const categoryEmoji: Record<string, string> = {
  pizza: "🍕",
  burgers: "🍔",
  sides: "🍟",
  drinks: "🥤",
  desserts: "🍰",
};

export function DishImage({
  imageUrl,
  categoryId,
  alt,
  className,
}: {
  imageUrl?: string;
  categoryId: string;
  alt: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- удалённые фото подключим в Фазе 6 через next/image + remotePatterns
      <img
        src={imageUrl}
        alt={alt}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={cn(
        "flex h-full w-full items-center justify-center bg-muted text-4xl",
        className,
      )}
    >
      {categoryEmoji[categoryId] ?? "🍽️"}
    </div>
  );
}
