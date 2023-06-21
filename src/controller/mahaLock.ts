import nconf from "nconf";
import { ethers } from "ethers";
import moment from "moment";
import { toDisplayNumber } from "../utils/formatValues";
import Bluebird from "bluebird";
import * as discord from "../helper/discord";
import { getCollateralPrices } from "../utils/getCollateralPrices";
import { handleEmbedMessage } from "../helper/handleMessage";
const abiCoder = new ethers.AbiCoder();

export const getMahalock = async (req: any, res: any) => {
  const webhookData = req.body;
  //   console.log(webhookData.event.data.block);

  const explorer = "https://etherscan.io";
  const contract = nconf.get("CONTRACT_LOCKER");
  const opensea = `https://opensea.io/assets/ethereum/${contract}`;
  const prices = await getCollateralPrices();

  let msg = "";

  Bluebird.mapSeries(webhookData.event.data.block.logs, async (item: any) => {
    if (eventType(item.topics[0]) === "Deposit") {
      const dataAbi = ["uint256", "uint256", "uint256", "uint256"];
      const result = await abiCoder.decode(dataAbi, item.data);

      const who = item.transaction.from.address;
      const tokenId = Number(result[0]);
      const value = Number(toDisplayNumber(result[1]));
      const depositType = Number(result[2]);
      const lockTime: number = Number(result[3]);
      const noOfTotalDots = Math.ceil(value / 50);
      const m = moment(lockTime * 1000).format("DD MMM YYYY");

      const price = prices.MAHA
        ? `*($${(value * prices.MAHA).toFixed(2)})*`
        : "";

      if (depositType == 1) {
        msg =
          `**NFT #${tokenId}** minted with **${value} MAHA** ${price} tokens locked` +
          ` till *${m}*`;
      } else if (depositType == 2) {
        msg =
          `**${value} MAHA** ${price} tokens was added into NFT #${tokenId}` +
          ` by **${who}**`;
      } else if (depositType == 3) {
        msg = `The lock period of **NFT #${tokenId}** is extended to *${m}* by **${who}**.`;
      }
      const discordMessage = craftMessage(
        msg,
        item.transaction.hash,
        tokenId,
        noOfTotalDots,
        explorer,
        opensea,
        eventType(item.topics[0]) == "Deposit" ? "green" : "red"
      );
      const embedMessage = await handleEmbedMessage(discordMessage || "");
      discord.sendMessage(nconf.get("TEST_CHANNEL_ID"), embedMessage);
    }
  });
  res.send({ success: true });
};

const craftMessage = (
  msg: string,
  txHash: string,
  tokenId: number,
  noOfTotalDots: number,
  explorer: string,
  opensea: string,
  dotType?: "green" | "red"
) => {
  let dots = "";

  const max = Math.min(noOfTotalDots, 100);
  if (dotType) {
    for (let i = 0; i < max; i++) {
      if (dotType == "green") dots += "🚀";
      else dots += "🔴";
    }

    dots += "";
  }

  const hash = `<${explorer}/tx/${txHash}>`;
  const openseaLink = `<${opensea}/${tokenId}>`;

  return (
    `${msg}\n\n` +
    `${dots}\n\n` +
    `Transaction: ${hash}\n` +
    `OpenSea: ${openseaLink}`
  );
};

const eventType = (eventHash: string) => {
  if (
    eventHash.toLowerCase() ===
    "0xff04ccafc360e16b67d682d17bd9503c4c6b9a131f6be6325762dc9ffc7de624".toLowerCase()
  ) {
    return "Deposit";
  } else if (
    eventHash.toLowerCase() ===
    "0x27157fa484da42f9840cfcb25cad5ed17300f578a34b8d4ceac3ba9d582b37cb".toLowerCase()
  ) {
    return "Withdraw";
  } else {
    return "";
  }
};
