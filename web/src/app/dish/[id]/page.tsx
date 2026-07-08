import { DishView } from "@/features/menu/components/DishView";

export default async function DishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DishView id={id} />;
}
