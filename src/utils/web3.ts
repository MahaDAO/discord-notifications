import nconf from "nconf";

import { ethers } from "ethers";

const chainWss = nconf.get("RPC_WSS");
export const provider = new ethers.WebSocketProvider(chainWss);
