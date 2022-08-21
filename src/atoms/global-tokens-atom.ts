import { atom } from 'jotai';
import { Tokens } from '../fetch-tokens';

export const globalTokensAtom = atom<Tokens>([]);
