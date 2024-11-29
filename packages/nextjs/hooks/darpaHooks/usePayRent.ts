import { useScaffoldReadContract, useScaffoldWriteContract } from "../scaffold-eth";


export function usePayRent() {

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");

  const fetchTotalAmount = (contractId: bigint) => {
    const { data: totalAmount } = useScaffoldReadContract({
      contractName: "YourContract",
      functionName: "getTotalAmountToBePaid",
      args: [contractId],
    });

    return totalAmount;
  };

  const payRent = async (contractId: bigint) => {
    try {
      const totalAmount = await fetchTotalAmount(contractId);

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
  };

  return { payRent };
}