export type Tuple<T, MaxLength extends number = 10, Current extends T[] = []> = Current["length"] extends MaxLength
  ? Current
  : Current | Tuple<T, MaxLength, [T, ...Current]>;


export interface User {
  userEmail: string;
  walletAddr: string[];
}

export interface Contract{
	amount: Number;
	daysToPay: Number;
	duration: Number;
	interest: Number;
	lesseAddress: String;
	ownerAddress: String;
	state: String;
	id: String;
}