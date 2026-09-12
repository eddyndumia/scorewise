import { apiGet } from './client';

export interface CashFlowPoint {
  label: string;
  totalIn: number;
  totalOut: number;
}

export async function getCashFlow(): Promise<CashFlowPoint[]> {
  const res = await apiGet<{ series: CashFlowPoint[] }>('/v1/cash-flow');
  return res.series;
}
