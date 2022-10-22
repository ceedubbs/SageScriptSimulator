import { JsonRpcProvider } from "@ethersproject/providers";
import axios, { AxiosResponse } from "axios";
import * as dotenv from "dotenv";
import { Signer } from "ethers";
import { TenderlyFork } from "@type/index";

dotenv.config();

export type EthersOnTenderlyFork = {
  id: number;
  provider: JsonRpcProvider;
  blockNumber: number;
  /**
   * map from address to given address' balance
   */
  accounts: { [key: string]: string };
  signers: Signer[];
  removeFork: () => Promise<AxiosResponse<any, any>>;
};

export const anAxiosOnTenderly = () =>
  axios.create({
    baseURL: "https://api.tenderly.co/api/v1",
    headers: {
      "X-Access-Key": process.env.TENDERLY_ACCESS_KEY || "",
      "Content-Type": "application/json",
    },
  });

export async function forkForTest(fork: TenderlyFork): Promise<EthersOnTenderlyFork> {
  const projectUrl = `account/${process.env.TENDERLY_USER}/project/${process.env.TENDERLY_PROJECT}`;
  const axiosOnTenderly = anAxiosOnTenderly();

  const forkResponse = await axiosOnTenderly.post(`${projectUrl}/fork`, fork);
  const forkId = forkResponse.data.root_transaction.fork_id;

  const provider = new JsonRpcProvider(`https://rpc.tenderly.co/fork/${forkId}`);

  const bn = (forkResponse.data.root_transaction.receipt.blockNumber as string).replace("0x", "");
  const blockNumber: number = Number.parseInt(bn, 16);

  console.info("Forked with fork id at block number", forkId, blockNumber);

  const accounts = forkResponse.data.simulation_fork.accounts;
  const signers = Object.keys(accounts).map((address) => provider.getSigner(address));

  return {
    provider,
    accounts,
    signers,
    blockNumber,
    id: forkId,
    removeFork: async () => {
      console.log("Removing test fork", forkId);
      return await axiosOnTenderly.delete(`${projectUrl}/fork/${forkId}`);
    },
  };
}

export const tenderlyProjectUrl = () =>
  `account/${process.env.TENDERLY_USER}/project/${process.env.TENDERLY_PROJECT}`;

export const tenderlyProjectOperation = (...path: any[]) =>
  [`account/${process.env.TENDERLY_USER}/project/${process.env.TENDERLY_PROJECT}`, ...path]
    .join("/")
    .replace("//", "");
