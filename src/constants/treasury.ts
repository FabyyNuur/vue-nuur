import type { TreasuryFormData, TreasuryTxType } from "../types/treasury";

export const TREASURY_TX_INCOME: TreasuryTxType = "INCOME";
export const TREASURY_TX_EXPENSE: TreasuryTxType = "EXPENSE";

export const DEFAULT_TREASURY_FORM: TreasuryFormData = {
  type: TREASURY_TX_INCOME,
  amount: 0,
  description: "",
  payment_method: "cash",
};

export const TREASURY_CSV_HEADERS = [
  "Date",
  "Type",
  "Catégorie",
  "Montant",
  "Description",
  "Mode de paiement",
] as const;

export const TREASURY_SUBMIT_ERROR_FALLBACK =
  "Erreur lors de l'enregistrement de la transaction";

export const TREASURY_CSV_FILENAME_PREFIX = "caisse-nuur-gym";
