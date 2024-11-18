export type Tuple<T, MaxLength extends number = 10, Current extends T[] = []> = Current["length"] extends MaxLength
  ? Current
  : Current | Tuple<T, MaxLength, [T, ...Current]>;


export interface Wallet {
  address: string;
  balance: number;
}

export interface Contract {
  id: string;
  name: string;
  createdAt: string;
  status: "active" | "inactive";
}

export interface User {
  userEmail: string;
  walletAddr: Wallet[];
  contracts: Contract[];
}
