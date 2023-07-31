import nconf from "nconf";
import { ethers } from "ethers";
import moment from "moment";
import { toDisplayNumber } from "../utils/formatValues";
import Bluebird from "bluebird";
import * as discord from "../helper/discord";
import { getCollateralPrices } from "../utils/getCollateralPrices";
import { handleEmbedMessage } from "../helper/handleMessage";
const abiCoder = new ethers.AbiCoder();

const explorer = "https://etherscan.io";

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
  } else if (
    eventHash.toLowerCase() ===
    "0x4cf4410cc57040e44862ef0f45f3dd5a5e02db8eb8add648d4b0e236f1d07dca".toLowerCase()
  ) {
    return "CallScheduled";
  } else {
    return "";
  }
};

export const getMahalock = async (req: any, res: any) => {
  const webhookData = req.body;
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
      const m = moment(Date.now() + lockTime * 1000).format("DD MMM YYYY");

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
      discord.sendMessage(nconf.get("CHANNEL_MAHA_LOCKS"), embedMessage);
    }
  });
  res.send({ success: true });
};

export const getCallExecute = async (req: any, res: any) => {
  const webhookData = req.body;
  Bluebird.mapSeries(webhookData.event.data.block.logs, async (item: any) => {
    if (eventType(item.topics[0]) === "CallScheduled") {
      const hash = `<${explorer}/tx/${webhookData.event.data.block.hash}>`;
      const message =
        `A new transaction is scheduled\n\n` + `Transaction: ${hash}\n`;
      const embedMessage = await handleEmbedMessage(message || "");
      discord.sendMessage(nconf.get("CHANNEL_PROPOSAL"), embedMessage);
    }
  });
  res.send({ success: true });
};
