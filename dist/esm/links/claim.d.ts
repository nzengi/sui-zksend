import { SuiClient } from '@mysten/sui/client';
import type { SuiObjectData, SuiTransactionBlockResponse } from '@mysten/sui/client';
import type { Keypair } from '@mysten/sui/cryptography';
import { Transaction } from '@mysten/sui/transactions';
import type { ZkSendLinkBuilderOptions } from './builder.js';
import type { LinkAssets } from './utils.js';
import type { ZkBagContractOptions } from './zk-bag.js';
export type ZkSendLinkOptions = {
    claimApi?: string;
    keypair?: Keypair;
    client?: SuiClient;
    network?: 'mainnet' | 'testnet';
    host?: string;
    path?: string;
    address?: string;
    isContractLink: boolean;
    contract?: ZkBagContractOptions | null;
} & ({
    address: string;
    keypair?: never;
} | {
    keypair: Keypair;
    address?: never;
});
export declare class ZkSendLink {
    #private;
    address: string;
    keypair?: Keypair;
    creatorAddress?: string;
    assets?: LinkAssets;
    claimed?: boolean;
    claimedBy?: string;
    bagObject?: SuiObjectData | null;
    constructor({ network, client, keypair, contract, address, host, path, claimApi, isContractLink, }: ZkSendLinkOptions);
    static fromUrl(url: string, options?: Omit<ZkSendLinkOptions, 'keypair' | 'address' | 'isContractLink'>): Promise<ZkSendLink>;
    static fromAddress(address: string, options: Omit<ZkSendLinkOptions, 'keypair' | 'address' | 'isContractLink'>): Promise<ZkSendLink>;
    loadClaimedStatus(): Promise<void>;
    loadAssets(options?: {
        transaction?: SuiTransactionBlockResponse;
        loadClaimedAssets?: boolean;
    }): Promise<void>;
    claimAssets(address: string, { reclaim, sign, }?: {
        reclaim?: false;
        sign?: never;
    } | {
        reclaim: true;
        sign: (transaction: Uint8Array) => Promise<string>;
    }): Promise<SuiTransactionBlockResponse>;
    createClaimTransaction(address: string, { reclaim, }?: {
        reclaim?: boolean;
    }): Transaction;
    createRegenerateTransaction(sender: string, options?: Omit<ZkSendLinkBuilderOptions, 'sender'>): Promise<{
        url: string;
        transaction: Transaction;
    }>;
}
