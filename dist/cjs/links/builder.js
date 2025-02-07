// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ZkSendLinkBuilder_instances, _ZkSendLinkBuilder_host, _ZkSendLinkBuilder_path, _ZkSendLinkBuilder_client, _ZkSendLinkBuilder_redirect, _ZkSendLinkBuilder_coinsByType, _ZkSendLinkBuilder_contract, _ZkSendLinkBuilder_objectsToTransfer, _ZkSendLinkBuilder_createSendTransactionWithoutContract, _ZkSendLinkBuilder_estimateClaimGasFee, _ZkSendLinkBuilder_getCoinsByType;
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag, normalizeSuiAddress, SUI_TYPE_ARG, toBase64 } from '@mysten/sui/utils';
import { getContractIds, ZkBag } from './zk-bag.js';
const DEFAULT_ZK_SEND_LINK_OPTIONS = {
    host: 'https://getstashed.com',
    path: '/claim',
    network: 'mainnet',
};
const SUI_COIN_TYPE = normalizeStructTag(SUI_TYPE_ARG);
export class ZkSendLinkBuilder {
    constructor({ host = DEFAULT_ZK_SEND_LINK_OPTIONS.host, path = DEFAULT_ZK_SEND_LINK_OPTIONS.path, keypair = new Ed25519Keypair(), network = DEFAULT_ZK_SEND_LINK_OPTIONS.network, client = new SuiClient({ url: getFullnodeUrl(network) }), sender, redirect, contract = getContractIds(network), }) {
        _ZkSendLinkBuilder_instances.add(this);
        this.objectIds = new Set();
        this.objectRefs = [];
        this.balances = new Map();
        _ZkSendLinkBuilder_host.set(this, void 0);
        _ZkSendLinkBuilder_path.set(this, void 0);
        _ZkSendLinkBuilder_client.set(this, void 0);
        _ZkSendLinkBuilder_redirect.set(this, void 0);
        _ZkSendLinkBuilder_coinsByType.set(this, new Map());
        _ZkSendLinkBuilder_contract.set(this, void 0);
        __classPrivateFieldSet(this, _ZkSendLinkBuilder_host, host, "f");
        __classPrivateFieldSet(this, _ZkSendLinkBuilder_path, path, "f");
        __classPrivateFieldSet(this, _ZkSendLinkBuilder_redirect, redirect, "f");
        this.keypair = keypair;
        __classPrivateFieldSet(this, _ZkSendLinkBuilder_client, client, "f");
        this.sender = normalizeSuiAddress(sender);
        this.network = network;
        if (contract) {
            __classPrivateFieldSet(this, _ZkSendLinkBuilder_contract, new ZkBag(contract.packageId, contract), "f");
        }
    }
    addClaimableMist(amount) {
        this.addClaimableBalance(SUI_COIN_TYPE, amount);
    }
    addClaimableBalance(coinType, amount) {
        const normalizedType = normalizeStructTag(coinType);
        this.balances.set(normalizedType, (this.balances.get(normalizedType) ?? 0n) + amount);
    }
    addClaimableObject(id) {
        this.objectIds.add(id);
    }
    addClaimableObjectRef(ref, type) {
        this.objectRefs.push({ ref, type });
    }
    getLink() {
        const link = new URL(__classPrivateFieldGet(this, _ZkSendLinkBuilder_host, "f"));
        link.pathname = __classPrivateFieldGet(this, _ZkSendLinkBuilder_path, "f");
        link.hash = `${__classPrivateFieldGet(this, _ZkSendLinkBuilder_contract, "f") ? '$' : ''}${toBase64(decodeSuiPrivateKey(this.keypair.getSecretKey()).secretKey)}`;
        if (this.network !== 'mainnet') {
            link.searchParams.set('network', this.network);
        }
        if (__classPrivateFieldGet(this, _ZkSendLinkBuilder_redirect, "f")) {
            link.searchParams.set('redirect_url', __classPrivateFieldGet(this, _ZkSendLinkBuilder_redirect, "f").url);
            if (__classPrivateFieldGet(this, _ZkSendLinkBuilder_redirect, "f").name) {
                link.searchParams.set('name', __classPrivateFieldGet(this, _ZkSendLinkBuilder_redirect, "f").name);
            }
        }
        return link.toString();
    }
    async create({ signer, ...options }) {
        const tx = await this.createSendTransaction(options);
        const result = await __classPrivateFieldGet(this, _ZkSendLinkBuilder_client, "f").signAndExecuteTransaction({
            transaction: await tx.build({ client: __classPrivateFieldGet(this, _ZkSendLinkBuilder_client, "f") }),
            signer,
            options: {
                showEffects: true,
            },
        });
        if (result.effects?.status.status !== 'success') {
            throw new Error(`Transaction failed: ${result.effects?.status.error ?? 'Unknown error'}`);
        }
        if (options.waitForTransaction) {
            await __classPrivateFieldGet(this, _ZkSendLinkBuilder_client, "f").waitForTransaction({ digest: result.digest });
        }
        return result;
    }
    async createSendTransaction({ transaction = new Transaction(), calculateGas, } = {}) {
        if (!__classPrivateFieldGet(this, _ZkSendLinkBuilder_contract, "f")) {
            return __classPrivateFieldGet(this, _ZkSendLinkBuilder_instances, "m", _ZkSendLinkBuilder_createSendTransactionWithoutContract).call(this, { transaction, calculateGas });
        }
        transaction.setSenderIfNotSet(this.sender);
        return ZkSendLinkBuilder.createLinks({
            transaction,
            network: this.network,
            client: __classPrivateFieldGet(this, _ZkSendLinkBuilder_client, "f"),
            contract: __classPrivateFieldGet(this, _ZkSendLinkBuilder_contract, "f").ids,
            links: [this],
        });
    }
    async createSendToAddressTransaction({ transaction = new Transaction(), address, }) {
        const objectsToTransfer = (await __classPrivateFieldGet(this, _ZkSendLinkBuilder_instances, "m", _ZkSendLinkBuilder_objectsToTransfer).call(this, transaction)).map((obj) => obj.ref);
        transaction.setSenderIfNotSet(this.sender);
        transaction.transferObjects(objectsToTransfer, address);
        return transaction;
    }
    static async createLinks({ links, network = 'mainnet', client = new SuiClient({ url: getFullnodeUrl(network) }), transaction = new Transaction(), contract: contractIds = getContractIds(network), }) {
        const contract = new ZkBag(contractIds.packageId, contractIds);
        const store = transaction.object(contract.ids.bagStoreId);
        const coinsByType = new Map();
        const allIds = links.flatMap((link) => [...link.objectIds]);
        const sender = links[0].sender;
        transaction.setSenderIfNotSet(sender);
        await Promise.all([...new Set(links.flatMap((link) => [...link.balances.keys()]))].map(async (coinType) => {
            const coins = await client.getCoins({
                coinType,
                owner: sender,
            });
            coinsByType.set(coinType, coins.data.filter((coin) => !allIds.includes(coin.coinObjectId)));
        }));
        const objectRefs = new Map();
        const pageSize = 50;
        let offset = 0;
        while (offset < allIds.length) {
            let chunk = allIds.slice(offset, offset + pageSize);
            offset += pageSize;
            const objects = await client.multiGetObjects({
                ids: chunk,
                options: {
                    showType: true,
                },
            });
            for (const [i, res] of objects.entries()) {
                if (!res.data || res.error) {
                    throw new Error(`Failed to load object ${chunk[i]} (${res.error?.code})`);
                }
                objectRefs.set(chunk[i], {
                    ref: transaction.objectRef({
                        version: res.data.version,
                        digest: res.data.digest,
                        objectId: res.data.objectId,
                    }),
                    type: res.data.type,
                });
            }
        }
        const mergedCoins = new Map([
            [SUI_COIN_TYPE, transaction.gas],
        ]);
        for (const [coinType, coins] of coinsByType) {
            if (coinType === SUI_COIN_TYPE) {
                continue;
            }
            const [first, ...rest] = coins.map((coin) => transaction.objectRef({
                objectId: coin.coinObjectId,
                version: coin.version,
                digest: coin.digest,
            }));
            if (rest.length > 0) {
                transaction.mergeCoins(first, rest);
            }
            mergedCoins.set(coinType, transaction.object(first));
        }
        for (const link of links) {
            const receiver = link.keypair.toSuiAddress();
            transaction.add(contract.new({ arguments: [store, receiver] }));
            link.objectRefs.forEach(({ ref, type }) => {
                transaction.add(contract.add({
                    arguments: [store, receiver, ref],
                    typeArguments: [type],
                }));
            });
            link.objectIds.forEach((id) => {
                const object = objectRefs.get(id);
                if (!object) {
                    throw new Error(`Object ${id} not found`);
                }
                transaction.add(contract.add({
                    arguments: [store, receiver, object.ref],
                    typeArguments: [object.type],
                }));
            });
        }
        for (const [coinType, merged] of mergedCoins) {
            const linksWithCoin = links.filter((link) => link.balances.has(coinType));
            if (linksWithCoin.length === 0) {
                continue;
            }
            const balances = linksWithCoin.map((link) => link.balances.get(coinType));
            const splits = transaction.splitCoins(merged, balances);
            for (const [i, link] of linksWithCoin.entries()) {
                transaction.add(contract.add({
                    arguments: [store, link.keypair.toSuiAddress(), splits[i]],
                    typeArguments: [`0x2::coin::Coin<${coinType}>`],
                }));
            }
        }
        return transaction;
    }
}
_ZkSendLinkBuilder_host = new WeakMap(), _ZkSendLinkBuilder_path = new WeakMap(), _ZkSendLinkBuilder_client = new WeakMap(), _ZkSendLinkBuilder_redirect = new WeakMap(), _ZkSendLinkBuilder_coinsByType = new WeakMap(), _ZkSendLinkBuilder_contract = new WeakMap(), _ZkSendLinkBuilder_instances = new WeakSet(), _ZkSendLinkBuilder_objectsToTransfer = async function _ZkSendLinkBuilder_objectsToTransfer(tx) {
    const objectIDs = [...this.objectIds];
    const refsWithType = this.objectRefs.concat((objectIDs.length > 0
        ? await __classPrivateFieldGet(this, _ZkSendLinkBuilder_client, "f").multiGetObjects({
            ids: objectIDs,
            options: {
                showType: true,
            },
        })
        : []).map((res, i) => {
        if (!res.data || res.error) {
            throw new Error(`Failed to load object ${objectIDs[i]} (${res.error?.code})`);
        }
        return {
            ref: tx.objectRef({
                version: res.data.version,
                digest: res.data.digest,
                objectId: res.data.objectId,
            }),
            type: res.data.type,
        };
    }));
    for (const [coinType, amount] of this.balances) {
        if (coinType === SUI_COIN_TYPE) {
            const [sui] = tx.splitCoins(tx.gas, [amount]);
            refsWithType.push({
                ref: sui,
                type: `0x2::coin::Coin<${coinType}>`,
            });
        }
        else {
            const coins = (await __classPrivateFieldGet(this, _ZkSendLinkBuilder_instances, "m", _ZkSendLinkBuilder_getCoinsByType).call(this, coinType)).map((coin) => coin.coinObjectId);
            if (coins.length > 1) {
                tx.mergeCoins(coins[0], coins.slice(1));
            }
            const [split] = tx.splitCoins(coins[0], [amount]);
            refsWithType.push({
                ref: split,
                type: `0x2::coin::Coin<${coinType}>`,
            });
        }
    }
    return refsWithType;
}, _ZkSendLinkBuilder_createSendTransactionWithoutContract = async function _ZkSendLinkBuilder_createSendTransactionWithoutContract({ transaction: tx = new Transaction(), calculateGas, } = {}) {
    const gasEstimateFromDryRun = await __classPrivateFieldGet(this, _ZkSendLinkBuilder_instances, "m", _ZkSendLinkBuilder_estimateClaimGasFee).call(this);
    const baseGasAmount = calculateGas
        ? await calculateGas({
            balances: this.balances,
            objects: [...this.objectIds],
            gasEstimateFromDryRun,
        })
        : gasEstimateFromDryRun * 2n;
    // Ensure that rounded gas is not less than the calculated gas
    const gasWithBuffer = baseGasAmount + 1013n;
    // Ensure that gas amount ends in 987
    const roundedGasAmount = gasWithBuffer - (gasWithBuffer % 1000n) - 13n;
    const address = this.keypair.toSuiAddress();
    const objectsToTransfer = (await __classPrivateFieldGet(this, _ZkSendLinkBuilder_instances, "m", _ZkSendLinkBuilder_objectsToTransfer).call(this, tx)).map((obj) => obj.ref);
    const [gas] = tx.splitCoins(tx.gas, [roundedGasAmount]);
    objectsToTransfer.push(gas);
    tx.setSenderIfNotSet(this.sender);
    tx.transferObjects(objectsToTransfer, address);
    return tx;
}, _ZkSendLinkBuilder_estimateClaimGasFee = async function _ZkSendLinkBuilder_estimateClaimGasFee() {
    const tx = new Transaction();
    tx.setSender(this.sender);
    tx.setGasPayment([]);
    tx.transferObjects([tx.gas], this.keypair.toSuiAddress());
    const idsToTransfer = [...this.objectIds];
    for (const [coinType] of this.balances) {
        const coins = await __classPrivateFieldGet(this, _ZkSendLinkBuilder_instances, "m", _ZkSendLinkBuilder_getCoinsByType).call(this, coinType);
        if (!coins.length) {
            throw new Error(`Sending account does not contain any coins of type ${coinType}`);
        }
        idsToTransfer.push(coins[0].coinObjectId);
    }
    if (idsToTransfer.length > 0) {
        tx.transferObjects(idsToTransfer.map((id) => tx.object(id)), this.keypair.toSuiAddress());
    }
    const result = await __classPrivateFieldGet(this, _ZkSendLinkBuilder_client, "f").dryRunTransactionBlock({
        transactionBlock: await tx.build({ client: __classPrivateFieldGet(this, _ZkSendLinkBuilder_client, "f") }),
    });
    return (BigInt(result.effects.gasUsed.computationCost) +
        BigInt(result.effects.gasUsed.storageCost) -
        BigInt(result.effects.gasUsed.storageRebate));
}, _ZkSendLinkBuilder_getCoinsByType = async function _ZkSendLinkBuilder_getCoinsByType(coinType) {
    if (__classPrivateFieldGet(this, _ZkSendLinkBuilder_coinsByType, "f").has(coinType)) {
        return __classPrivateFieldGet(this, _ZkSendLinkBuilder_coinsByType, "f").get(coinType);
    }
    const coins = await __classPrivateFieldGet(this, _ZkSendLinkBuilder_client, "f").getCoins({
        coinType,
        owner: this.sender,
    });
    __classPrivateFieldGet(this, _ZkSendLinkBuilder_coinsByType, "f").set(coinType, coins.data);
    return coins.data;
};
