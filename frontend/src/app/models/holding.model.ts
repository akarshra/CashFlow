export interface Holding {
  id?: number;
  symbol: string;
  assetType: 'STOCK' | 'CRYPTO';
  quantity: number;
  avgPrice?: number;
  currency?: string;
  currentPrice?: number;
  valueUsd?: number;
}
