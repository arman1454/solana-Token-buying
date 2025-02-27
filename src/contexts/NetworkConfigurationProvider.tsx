import { useLocalStorage } from "@solana/wallet-adapter-react";
import {createContext, FC, ReactNode, useContext} from "react";

export interface NetworkConfigurationState{
    networkConfiguration:string;
    setNetworkConfiguration(networkConfiguration:string):void;
}

export const networkConfigurationContext = createContext<NetworkConfigurationState>(
    {} as NetworkConfigurationState
)

export function useNetworkConfiguration(): NetworkConfigurationState{
    return useContext(networkConfigurationContext);
}

export const NetworkConfigurationProvider: FC<{children:ReactNode}> = ({
    children
}) =>{
    const [networkConfiguration, setNetworkConfiguration] = useLocalStorage(
        "network",
        "devnet"
    )

    return (
        <networkConfigurationContext.Provider value = {{networkConfiguration, setNetworkConfiguration}}>
            {children}
        </networkConfigurationContext.Provider>
    )
}