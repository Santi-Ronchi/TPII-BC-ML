import { TransactionHash } from "./TransactionHash";
import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useUser } from "../../user/UserContext";
import { TransactionWithFunction } from "~~/utils/scaffold-eth";
import { TransactionsTableProps } from "~~/utils/scaffold-eth";
import { useSearchParams } from "next/navigation";

export const TransactionsTable = ({ blocks, transactionReceipts }: TransactionsTableProps) => {
  const { targetNetwork } = useTargetNetwork();
//  const { propertyID: userPropertyID } = useUser(); 
  const searchParams = useSearchParams();
  const contractId = searchParams.get("propertyId");
  const contractIdString: string = contractId ?? "0";

  console.log("propertyid: ",contractIdString);

  const functionNameMapping: { [key: string]: string } = {
    payRent: "Pago mensual de renta",
    withdraw: "Retiro de fondos",
    acceptContract: "Depósito inicial",
  };

  return (
    <div className="flex justify-center px-4 md:px-0">
      <div className="overflow-x-auto w-full shadow-2xl rounded-xl">
        <table className="table text-xl bg-base-100 table-zebra w-full md:table-md table-sm">
          <thead>
            <tr className="rounded-xl text-sm text-base-content">
              <th className="bg-primary">Transacción</th>
              <th className="bg-primary">Movimiento</th>
              <th className="bg-primary">Bloque</th>
              <th className="bg-primary">Fecha y hora</th>
              <th className="bg-primary">Desde</th>
              <th className="bg-primary">Contrato</th>
              <th className="bg-primary text-end">Monto ({targetNetwork.nativeCurrency.symbol})</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map(block =>
              (block.transactions as TransactionWithFunction[])
                .filter(tx => {
                  if (!tx.functionName || !tx.functionArgs) return false;
                  const allowedFunctions = ["payRent", "withdraw", "acceptContract"];
                  const propertyID = tx.functionArgs[0]?.toString(); // propertyID
                  return (
                    allowedFunctions.includes(tx.functionName) &&
                    propertyID === contractIdString 
                  );
                })
                .map(tx => {
                  const receipt = transactionReceipts[tx.hash];
                  const timeMined = new Date(Number(block.timestamp) * 1000).toLocaleString();
                  const functionDisplayName = functionNameMapping[tx.functionName] || tx.functionName;
                  return (
                    <tr key={tx.hash} className="hover text-sm">
                      <td className="w-1/12 md:py-4">
                        <TransactionHash hash={tx.hash} />
                      </td>
                      <td className="w-2/12 md:py-4">
                        <span className="mr-1">{functionDisplayName}</span>
                        {tx.functionArgs?.[0] !== undefined && (
                          <span className="badge badge-primary font-bold text-xs">
                            propertyID: {tx.functionArgs[0].toString()}
                          </span>
                        )}
                      </td>
                      <td className="w-1/12 md:py-4">{block.number?.toString()}</td>
                      <td className="w-2/1 md:py-4">{timeMined}</td>
                      <td className="w-2/12 md:py-4">
                        <Address address={tx.from} size="sm" />
                      </td>
                      <td className="w-2/12 md:py-4">
                        {!receipt?.contractAddress ? (
                          tx.to && <Address address={tx.to} size="sm" />
                        ) : (
                          <div className="relative">
                            <Address address={receipt.contractAddress} size="sm" />
                            <small className="absolute top-4 left-4">(Contract Creation)</small>
                          </div>
                        )}
                      </td>
                      <td className="text-right md:py-4">
                        {formatEther(tx.value)} {targetNetwork.nativeCurrency.symbol}
                      </td>
                    </tr>
                  );
                }),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
