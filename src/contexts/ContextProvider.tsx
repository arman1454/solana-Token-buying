import { WalletAdapterNetwork, WalletError } from  "@solana/wallet-adapter-base"; //when the user will not be connected to the wallet or switch the network in that case these error will show
import { ConnectionProvider, WalletProvider} from "@solana/wallet-adapter-react";

import { WalletModalProvider as ReactUIWalletModalProvider } from "@solana/wallet-adapter-react-ui"

import { PhantomWalletAdapter, 
  SolflareWalletAdapter, 
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter
  } from "@solana/wallet-adapter-wallets";

import { Cluster, clusterApiUrl } from "@solana/web3.js";

import {FC, ReactNode, useCallback, useMemo} from "react"; //whenever the user will change the state of the application we will use this to get that information

import {AutoConnectProvider,useAutoConnect} from "./AutoConnectProvider";
import {notify} from "../utils/notifications";

import {NetworkConfigurationProvider, useNetworkConfiguration} from './NetworkConfigurationProvider';

const WalletContextProvider: FC<{children:ReactNode}> = ({children})=>{
  const {autoConnect} = useAutoConnect();
  const {networkConfiguration} = useNetworkConfiguration(); 

  const network = networkConfiguration as WalletAdapterNetwork; //denoting which network the user has connected to

  const originalEndPoint = useMemo(()=>clusterApiUrl(network), [network]); //when the user will connect with main dev or test net. Just saving the RPC end point

  let endpoint;

  if(network == "mainnet-beta"){
    endpoint = "https://solana-mainnet.g.alchemy.com/v2/EeROtFDA4x3sRuhLMPSlPKtp4IHlyL4A";
  }else if(network == "devnet"){
    endpoint = originalEndPoint;
  }else{
    endpoint = originalEndPoint;
  }

  const wallets = useMemo(
    ()=>[
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolletWalletAdapter(),
      new SolletExtensionWalletAdapter(),
      new TorusWalletAdapter()
    ], [network]
  )
  
  const onError = useCallback((error:WalletError)=>{
    notify({
      type: "error",
      message: error.message?`${error.name}: ${error.message}` : error.name
    })

    console.error(error);
    
  },[])

  return(
    <ConnectionProvider endpoint = {endpoint}>
      <WalletProvider wallets = {wallets} onError={onError} autoConnect={autoConnect}>

        <ReactUIWalletModalProvider>{children}</ReactUIWalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )



}

export const ContextProvider:FC<{children:ReactNode}> = ({
  children,
})=>{
  return(
    <>
    <NetworkConfigurationProvider>
      <AutoConnectProvider>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </AutoConnectProvider>
    </NetworkConfigurationProvider>
    </>
  )
}






