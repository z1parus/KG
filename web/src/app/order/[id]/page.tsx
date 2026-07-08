import { OrderSuccessView } from "@/features/order/OrderSuccessView";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderSuccessView id={id} />;
}
