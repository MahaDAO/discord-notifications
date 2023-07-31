import nconf from "nconf";
import moment from "moment";
import { ethers } from "ethers";

import MAHAX from "../abi/MAHAX.json";
import * as discord from "../helper/discord";
import { toDisplayNumber } from "../utils/formatValues";
import { getCollateralPrices } from "../utils/getCollateralPrices";
import { IEvent } from "../utils/interfaces";
import { handleEmbedMessage } from "../helper/handleMessage";
import { provider } from "../utils/web3";

const craftMessageFromEvent = async (
  data: IEvent,
  explorer: string,
  opensea: string
) => {
  let msg = "";

  const prices = await getCollateralPrices();

  if (data.fragment.name == "Transfer") {
    // emit Transfer(_from, _to, _tokenId);
    const from = data.args[0];
    const to = data.args[1];
    const tokenId = data.args[2];

    console.log("transfer", from, to, tokenId);
  } else if (data.fragment.name == "Deposit") {
    //   emit Deposit(
    //     from,
    //     _tokenId,
    //     _value,
    //     _locked.end,
    //     depositType,
    //     block.timestamp
    // );
    const who = data.args[0];
    const tokenId = Number(data.args[1]);
    const value = Number(toDisplayNumber(data.args[2]));
    const locktime: number = Number(data.args[3]);
    const depositType = Number(data.args[4]);

    const noOfTotalDots = Math.ceil(value / 50);

    const m = moment(Date.now() + locktime * 1000).format("DD MMM YYYY");

    const price = prices.MAHA ? `*($${(value * prices.MAHA).toFixed(2)})*` : "";

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
    } else return;

    return craftMessage(
      msg,
      data.log.transactionHash,
      tokenId,
      noOfTotalDots,
      explorer,
      opensea,
      data.fragment.name == "Deposit" ? "green" : "red"
    );
  } else if (data.fragment.name == "Withdraw") {
    const who = data.args[0];
    const url = `${explorer}/address/${who}`;
    msg = `A NFT is has been withdrawn by [${who}](${url})`;
  } else return;
  return;
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

export default () => {
  console.log("listening for maha lock events");

  const explorer = "https://etherscan.io";
  const contract = nconf.get("CONTRACT_LOCKER");
  const opensea = `https://opensea.io/assets/ethereum/${contract}`;

  const Locker = new ethers.Contract(contract, MAHAX, provider);

  Locker.on("Deposit", async (...args) => {
    const msg = await craftMessageFromEvent(args[6], explorer, opensea);
    const embedMessage = await handleEmbedMessage(msg || "");
    discord.sendMessage(nconf.get("CHANNEL_MAHA_LOCKS"), embedMessage);
  });

  // contract.on("Withdraw", (...args) => {
  //   console.log(args);
  //   discord.sendMessage(nconf.get("CHANNEL_MAHA_LOCKS"), "test");
  // });
};
