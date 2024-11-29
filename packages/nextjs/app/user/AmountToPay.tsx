import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface AmountToPayProps {
    contractId: bigint;
  }

export const GreetingsCount: React.FC<AmountToPayProps> = ({ contractId }) => {

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");
  const { data: totalAmount } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getTotalAmountToBePaid",
    args: [contractId],
  });

  const handlePayRent = async (totalAmount: bigint) => {
    try {
        
        if (!totalAmount) {
          console.log("Total Amount to be paid is undefined");
          return;
        }
        
        await writeYourContractAsync({
          functionName: "payRent",
          args: [contractId],
          value: BigInt(totalAmount),
        });
      } catch (e) {
        console.error("Error paying rent:", e);
      }
  }

  console.log(`juajuajuajua: ${totalAmount}`)

  return (
    <div className="mt-4 flex gap-4">
        <strong>Renta a pagar:</strong>
        <p>{totalAmount ? totalAmount.toString() : 0}</p>
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            onClick={() => handlePayRent(totalAmount)}>
            Pagar Renta
        </button>
    </div>
  );
};

export default GreetingsCount;
