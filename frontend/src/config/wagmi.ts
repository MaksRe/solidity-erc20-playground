import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { sepolia } from "wagmi/chains";
import { defineChain } from "viem";

export const anvil = defineChain({
  id: 31337,
  name: "Anvil",
  network: "anvil",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"]
    }
  }
});

export const chains = [anvil, sepolia] as const;

export const config = createConfig({
  chains,
  connectors: [injected()],
  transports: {
    [anvil.id]: http(anvil.rpcUrls.default.http[0]),
    [sepolia.id]: http()
  }
});
