import nconf from "nconf";

import { WebSocketProvider } from "@ethersproject/providers";

const chainWss = nconf.get("RPC_WSS");
export const provider = new WebSocketProvider(chainWss);
