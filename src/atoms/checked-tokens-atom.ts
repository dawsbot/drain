import { atom } from 'jotai';
import { TransferPending } from '../types/transfer-success';

export const checkedTokensAtom = atom<
  Record<string, { isChecked: boolean; pendingTxn?: TransferPending }>
>({});
