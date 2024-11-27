export type Tuple<T, MaxLength extends number = 10, Current extends T[] = []> = Current["length"] extends MaxLength
  ? Current
  : Current | Tuple<T, MaxLength, [T, ...Current]>;


export interface User {
  userEmail: string;
  walletAddr: string[];
}

export interface Contract{
	amount: number;
	daysToPay: number;
	duration: number;
	interest: number;
	lesseAddress: string;
	ownerAddress: string;
	state: String;
	id: string;
}

export interface dataServicios {
	AYSA: string;
	EDESUR: string;
}