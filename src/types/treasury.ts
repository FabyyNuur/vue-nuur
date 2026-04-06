export type TreasuryTxType = "INCOME" | "EXPENSE";

export interface TreasuryTransaction {
  id?: number;
  type: TreasuryTxType | string;
  amount: number;
  description: string;
  payment_method?: string;
  created_at: string;
  [key: string]: unknown;
}

export interface TreasuryFormData {
  type: TreasuryTxType;
  amount: number;
  description: string;
  payment_method: string;
}
