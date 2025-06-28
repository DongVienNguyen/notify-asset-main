export interface AssetTransactionPayload {
  staff_code: string;
  transaction_date: string;
  parts_day: string;
  room: string;
  transaction_type: string;
  asset_year: number;
  asset_code: number;
  note?: string;
}

export interface Transaction extends AssetTransactionPayload {
  id: string;
  created_at?: string;
}