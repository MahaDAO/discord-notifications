import { BigNumberish, ethers, formatUnits } from "ethers";
// import { formatUnits } from "ethers/lib/utils";
import Numeral from "numeral";

export const toDisplayNumber = (value: number) => {
  const bn: BigNumberish = value.toString();
  const valToNum = ethers.formatEther(bn);
  const numeralVal = Numeral(valToNum).format("0.000");
  if (numeralVal == "0.000") return valToNum;
  return numeralVal;
};

export function getBalance(
  balance: BigNumberish | string,
  decimals = 18
): string {
  try {
    return formatUnits(balance, decimals);
  } catch (err) {
    return "0";
  }
}

export const getDisplayBalance = (
  balance: BigNumberish | string,
  decimals = 18,
  fractionDigits = 5
): string => {
  try {
    const formattedBalance: string = getBalance(balance, decimals);
    const decimalsPointIndex = formattedBalance.indexOf(".");
    if (decimalsPointIndex === -1) {
      return formattedBalance;
    }
    return (
      formattedBalance.slice(0, decimalsPointIndex) +
      "." +
      formattedBalance.slice(
        decimalsPointIndex + 1,
        decimalsPointIndex + 1 + fractionDigits
      )
    );
  } catch (error) {
    return "0";
  }
};
