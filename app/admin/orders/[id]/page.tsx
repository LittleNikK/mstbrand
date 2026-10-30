import React from 'react';
import { notFound } from 'next/navigation';
import { getOrderByNumber } from '@/lib/services/order.service';
import OrderDetailClient from '@/components/admin/OrderDetailClient';

export const dynamic = 'force-dynamic';

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderByNumber(id);

  if (!order) {
    notFound();
  }

  return <OrderDetailClient order={order} />;
}
