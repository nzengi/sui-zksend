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
var _ZkSendLink_instances, _ZkSendLink_client, _ZkSendLink_contract, _ZkSendLink_network, _ZkSendLink_host, _ZkSendLink_path, _ZkSendLink_claimApi, _ZkSendLink_gasCoin, _ZkSendLink_hasSui, _ZkSendLink_ownedObjects, _ZkSendLink_loadBagObject, _ZkSendLink_loadBag, _ZkSendLink_loadClaimedAssets, _ZkSendLink_createSponsoredTransaction, _ZkSendLink_executeSponsoredTransaction, _ZkSendLink_fetch, _ZkSendLink_listNonContractClaimableAssets, _ZkSendLink_createNonContractClaimTransaction, _ZkSendLink_loadOwnedObjects;
import { bcs } from '@mysten/sui/bcs';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { fromBase64, normalizeStructTag, normalizeSuiAddress, normalizeSuiObjectId, parseStructTag, SUI_TYPE_ARG, toBase64, } from '@mysten/sui/utils';
import { ZkSendLinkBuilder } from './builder.js';
import { getAssetsFromTransaction, isOwner, ownedAfterChange } from './utils.js';
import { getContractIds, ZkBag } from './zk-bag.js';
const DEFAULT_ZK_SEND_LINK_OPTIONS = {
    host: 'https://getstashed.com',
    path: '/claim',
    network: 'mainnet',
};
const SUI_COIN_TYPE = normalizeStructTag(SUI_TYPE_ARG);
const SUI_COIN_OBJECT_TYPE = normalizeStructTag('0x2::coin::Coin<0x2::sui::SUI>');
export class ZkSendLink {
    constructor({ network = DEFAULT_ZK_SEND_LINK_OPTIONS.network, client = new SuiClient({ url: getFullnodeUrl(network) }), keypair, contract = getContractIds(network), address, host = DEFAULT_ZK_SEND_LINK_OPTIONS.host, path = DEFAULT_ZK_SEND_LINK_OPTIONS.path, claimApi = `${host}/api`, isContractLink, }) {
        _ZkSendLink_instances.add(this);
        _ZkSendLink_client.set(this, void 0);
        _ZkSendLink_contract.set(this, void 0);
        _ZkSendLink_network.set(this, void 0);
        _ZkSendLink_host.set(this, void 0);
        _ZkSendLink_path.set(this, void 0);
        _ZkSendLink_claimApi.set(this, void 0);
        // State for non-contract based links
        _ZkSendLink_gasCoin.set(this, void 0);
        _ZkSendLink_hasSui.set(this, false);
        _ZkSendLink_ownedObjects.set(this, []);
        if (!keypair && !address) {
            throw new Error('Either keypair or address must be provided');
        }
        __classPrivateFieldSet(this, _ZkSendLink_client, client, "f");
        this.keypair = keypair;
        this.address = address ?? keypair.toSuiAddress();
        __classPrivateFieldSet(this, _ZkSendLink_claimApi, claimApi, "f");
        __classPrivateFieldSet(this, _ZkSendLink_network, network, "f");
        __classPrivateFieldSet(this, _ZkSendLink_host, host, "f");
        __classPrivateFieldSet(this, _ZkSendLink_path, path, "f");
        if (isContractLink) {
            if (!contract) {
                throw new Error('Contract options are required for contract based links');
            }
            __classPrivateFieldSet(this, _ZkSendLink_contract, new ZkBag(contract.packageId, contract), "f");
        }
    }
    static async fromUrl(url, options = {}) {
        const parsed = new URL(url);
        const isContractLink = parsed.hash.startsWith('#$');
        const parsedNetwork = parsed.searchParams.get('network') === 'testnet' ? 'testnet' : 'mainnet';
        const network = options.network ?? parsedNetwork;
        let link;
        if (isContractLink) {
            const keypair = Ed25519Keypair.fromSecretKey(fromBase64(parsed.hash.slice(2)));
            link = new ZkSendLink({
                ...options,
                keypair,
                network,
                host: `${parsed.protocol}//${parsed.host}`,
                path: parsed.pathname,
                isContractLink: true,
            });
        }
        else {
            const keypair = Ed25519Keypair.fromSecretKey(fromBase64(isContractLink ? parsed.hash.slice(2) : parsed.hash.slice(1)));
            link = new ZkSendLink({
                ...options,
                keypair,
                network,
                host: `${parsed.protocol}//${parsed.host}`,
                path: parsed.pathname,
                isContractLink: false,
            });
        }
        await link.loadAssets();
        return link;
    }
    static async fromAddress(address, options) {
        const link = new ZkSendLink({
            ...options,
            address,
            isContractLink: true,
        });
        await link.loadAssets();
        return link;
    }
    async loadClaimedStatus() {
        await __classPrivateFieldGet(this, _ZkSendLink_instances, "m", _ZkSendLink_loadBag).call(this, { loadAssets: false });
    }
    async loadAssets(options = {}) {
        if (__classPrivateFieldGet(this, _ZkSendLink_contract, "f")) {
            await __classPrivateFieldGet(this, _ZkSendLink_instances, "m", _ZkSendLink_loadBag).call(this, options);
        }
        else {
            await __classPrivateFieldGet(this, _ZkSendLink_instances, "m", _ZkSendLink_loadOwnedObjects).call(this, options);
        }
    }
    async claimAssets(address, { reclaim, sign, } = {}) {
        if (!this.keypair && !sign) {
            throw new Error('Cannot claim assets without links keypair');
        }
        if (this.claimed) {
            throw new Error('Assets have already been claimed');
        }
        if (!this.assets) {
            throw new Error('Link assets could not be loaded.  Link has not been indexed or has already been claimed');
        }
        if (!__classPrivateFieldGet(this, _ZkSendLink_contract, "f")) {
            const bytes = await this.createClaimTransaction(address).build({
                client: __classPrivateFieldGet(this, _ZkSendLink_client, "f"),
            });
            const signature = sign
                ? await sign(bytes)
                : (await this.keypair.signTransaction(bytes)).signature;
            return __classPrivateFieldGet(this, _ZkSendLink_client, "f").executeTransactionBlock({
                transactionBlock: bytes,
                signature,
            });
        }
        if (!this.assets) {
            await __classPrivateFieldGet(this, _ZkSendLink_instances, "m", _ZkSendLink_loadBag).call(this);
        }
        const tx = this.createClaimTransaction(address, { reclaim });
        const sponsored = await __classPrivateFieldGet(this, _ZkSendLink_instances, "m", _ZkSendLink_createSponsoredTransaction).call(this, tx, address, reclaim ? address : this.keypair.toSuiAddress());
        const bytes = fromBase64(sponsored.bytes);
        const signature = sign
            ? await sign(bytes)
            : (await this.keypair.signTransaction(bytes)).signature;
        const { digest } = await __classPrivateFieldGet(this, _ZkSendLink_instances, "m", _ZkSendLink_executeSponsoredTransaction).call(this, sponsored, signature);
        const result = await __classPrivateFieldGet(this, _ZkSendLink_client, "f").waitForTransaction({
            digest,
            options: { showEffects: true },
        });
        if (result.effects?.status.status !== 'success') {
            throw new Error(`Claim transaction failed: ${result.effects?.status.error ?? 'Unknown error'}`);
        }
        return result;
    }
    createClaimTransaction(address, { reclaim, } = {}) {
        if (!__classPrivateFieldGet(this, _ZkSendLink_contract, "f")) {
            return __classPrivateFieldGet(this, _ZkSendLink_instances, "m", _ZkSendLink_createNonContractClaimTransaction).call(this, address);
        }
        if (!this.keypair && !reclaim) {
            throw new Error('Cannot claim assets without the links keypair');
        }
        const tx = new Transaction();
        const sender = reclaim ? address : this.keypair.toSuiAddress();
        tx.setSender(sender);
        const store = tx.object(__classPrivateFieldGet(this, _ZkSendLink_contract, "f").ids.bagStoreId);
        const command = reclaim
            ? __classPrivateFieldGet(this, _ZkSendLink_contract, "f").reclaim({ arguments: [store, this.address] })
            : __classPrivateFieldGet(this, _ZkSendLink_contract, "f").init_claim({ arguments: [store] });
        const [bag, proof] = tx.add(command);
        const objectsToTransfer = [];
        const objects = [...(this.assets?.coins ?? []), ...(this.assets?.nfts ?? [])];
        for (const object of objects) {
            objectsToTransfer.push(__classPrivateFieldGet(this, _ZkSendLink_contract, "f").claim({
                arguments: [
                    bag,
                    proof,
                    tx.receivingRef({
                        objectId: object.objectId,
                        version: object.version,
                        digest: object.digest,
                    }),
                ],
                typeArguments: [object.type],
            }));
        }
        if (objectsToTransfer.length > 0) {
            tx.transferObjects(objectsToTransfer, address);
        }
        tx.add(__classPrivateFieldGet(this, _ZkSendLink_contract, "f").finalize({ arguments: [bag, proof] }));
        return tx;
    }
    async createRegenerateTransaction(sender, options = {}) {
        if (!this.assets) {
            await __classPrivateFieldGet(this, _ZkSendLink_instances, "m", _ZkSendLink_loadBag).call(this);
        }
        if (this.claimed) {
            throw new Error('Assets have already been claimed');
        }
        if (!__classPrivateFieldGet(this, _ZkSendLink_contract, "f")) {
            throw new Error('Regenerating non-contract based links is not supported');
        }
        const tx = new Transaction();
        tx.setSender(sender);
        const store = tx.object(__classPrivateFieldGet(this, _ZkSendLink_contract, "f").ids.bagStoreId);
        const newLinkKp = Ed25519Keypair.generate();
        const newLink = new ZkSendLinkBuilder({
            ...options,
            sender,
            client: __classPrivateFieldGet(this, _ZkSendLink_client, "f"),
            contract: __classPrivateFieldGet(this, _ZkSendLink_contract, "f").ids,
            host: __classPrivateFieldGet(this, _ZkSendLink_host, "f"),
            path: __classPrivateFieldGet(this, _ZkSendLink_path, "f"),
            keypair: newLinkKp,
        });
        const to = tx.pure.address(newLinkKp.toSuiAddress());
        tx.add(__classPrivateFieldGet(this, _ZkSendLink_contract, "f").update_receiver({ arguments: [store, this.address, to] }));
        return {
            url: newLink.getLink(),
            transaction: tx,
        };
    }
}
_ZkSendLink_client = new WeakMap(), _ZkSendLink_contract = new WeakMap(), _ZkSendLink_network = new WeakMap(), _ZkSendLink_host = new WeakMap(), _ZkSendLink_path = new WeakMap(), _ZkSendLink_claimApi = new WeakMap(), _ZkSendLink_gasCoin = new WeakMap(), _ZkSendLink_hasSui = new WeakMap(), _ZkSendLink_ownedObjects = new WeakMap(), _ZkSendLink_instances = new WeakSet(), _ZkSendLink_loadBagObject = async function _ZkSendLink_loadBagObject() {
    if (!__classPrivateFieldGet(this, _ZkSendLink_contract, "f")) {
        throw new Error('Cannot load bag object for non-contract based links');
    }
    const bagField = await __classPrivateFieldGet(this, _ZkSendLink_client, "f").getDynamicFieldObject({
        parentId: __classPrivateFieldGet(this, _ZkSendLink_contract, "f").ids.bagStoreTableId,
        name: {
            type: 'address',
            value: this.address,
        },
    });
    this.bagObject = bagField.data;
    if (this.bagObject) {
        this.claimed = false;
    }
}, _ZkSendLink_loadBag = async function _ZkSendLink_loadBag({ transaction, loadAssets = true, loadClaimedAssets = loadAssets, } = {}) {
    if (!__classPrivateFieldGet(this, _ZkSendLink_contract, "f")) {
        return;
    }
    if (!this.bagObject || !this.claimed) {
        await __classPrivateFieldGet(this, _ZkSendLink_instances, "m", _ZkSendLink_loadBagObject).call(this);
    }
    if (!loadAssets) {
        return;
    }
    if (!this.bagObject) {
        if (loadClaimedAssets) {
            await __classPrivateFieldGet(this, _ZkSendLink_instances, "m", _ZkSendLink_loadClaimedAssets).call(this);
        }
        return;
    }
    const bagId = this.bagObject.content.fields.value.fields?.id?.id;
    if (bagId && transaction?.balanceChanges && transaction.objectChanges) {
        this.assets = getAssetsFromTransaction({
            transaction,
            address: bagId,
            isSent: false,
        });
        return;
    }
    const itemIds = this.bagObject?.content?.fields?.value?.fields
        ?.item_ids.fields.contents;
    this.creatorAddress = this.bagObject?.content?.fields?.value?.fields?.owner;
    if (!itemIds) {
        throw new Error('Invalid bag field');
    }
    const objectsResponse = await __classPrivateFieldGet(this, _ZkSendLink_client, "f").multiGetObjects({
        ids: itemIds,
        options: {
            showType: true,
            showContent: true,
        },
    });
    this.assets = {
        balances: [],
        nfts: [],
        coins: [],
    };
    const balances = new Map();
    objectsResponse.forEach((object, i) => {
        if (!object.data || !object.data.type) {
            throw new Error(`Failed to load claimable object ${itemIds[i]}`);
        }
        const type = parseStructTag(normalizeStructTag(object.data.type));
        if (type.address === normalizeSuiAddress('0x2') &&
            type.module === 'coin' &&
            type.name === 'Coin') {
            this.assets.coins.push({
                objectId: object.data.objectId,
                type: object.data.type,
                version: object.data.version,
                digest: object.data.digest,
            });
            if (object.data.content?.dataType === 'moveObject') {
                const amount = BigInt(object.data.content.fields.balance);
                const coinType = normalizeStructTag(parseStructTag(object.data.content.type).typeParams[0]);
                if (!balances.has(coinType)) {
                    balances.set(coinType, { coinType, amount });
                }
                else {
                    balances.get(coinType).amount += amount;
                }
            }
        }
        else {
            this.assets.nfts.push({
                objectId: object.data.objectId,
                type: object.data.type,
                version: object.data.version,
                digest: object.data.digest,
            });
        }
    });
    this.assets.balances = [...balances.values()];
}, _ZkSendLink_loadClaimedAssets = async function _ZkSendLink_loadClaimedAssets() {
    const result = await __classPrivateFieldGet(this, _ZkSendLink_client, "f").queryTransactionBlocks({
        limit: 1,
        filter: {
            FromAddress: this.address,
        },
        options: {
            showObjectChanges: true,
            showBalanceChanges: true,
            showInput: true,
        },
    });
    if (!result?.data[0]) {
        return;
    }
    const [tx] = result.data;
    if (tx.transaction?.data.transaction.kind !== 'ProgrammableTransaction') {
        return;
    }
    const transfer = tx.transaction.data.transaction.transactions.findLast((tx) => 'TransferObjects' in tx);
    if (!transfer) {
        return;
    }
    const receiverArg = transfer.TransferObjects[1];
    if (!(typeof receiverArg === 'object' && 'Input' in receiverArg)) {
        return;
    }
    const input = tx.transaction.data.transaction.inputs[receiverArg.Input];
    if (input.type !== 'pure') {
        return;
    }
    const receiver = typeof input.value === 'string'
        ? input.value
        : bcs.Address.parse(new Uint8Array(input.value.Pure));
    this.claimed = true;
    this.claimedBy = receiver;
    this.assets = getAssetsFromTransaction({
        transaction: tx,
        address: receiver,
        isSent: false,
    });
}, _ZkSendLink_createSponsoredTransaction = async function _ZkSendLink_createSponsoredTransaction(tx, claimer, sender) {
    return __classPrivateFieldGet(this, _ZkSendLink_instances, "m", _ZkSendLink_fetch).call(this, 'transaction-blocks/sponsor', {
        method: 'POST',
        body: JSON.stringify({
            network: __classPrivateFieldGet(this, _ZkSendLink_network, "f"),
            sender,
            claimer,
            transactionBlockKindBytes: toBase64(await tx.build({
                onlyTransactionKind: true,
                client: __classPrivateFieldGet(this, _ZkSendLink_client, "f"),
            })),
        }),
    });
}, _ZkSendLink_executeSponsoredTransaction = async function _ZkSendLink_executeSponsoredTransaction(input, signature) {
    return __classPrivateFieldGet(this, _ZkSendLink_instances, "m", _ZkSendLink_fetch).call(this, `transaction-blocks/sponsor/${input.digest}`, {
        method: 'POST',
        body: JSON.stringify({
            signature,
        }),
    });
}, _ZkSendLink_fetch = async function _ZkSendLink_fetch(path, init) {
    const res = await fetch(`${__classPrivateFieldGet(this, _ZkSendLink_claimApi, "f")}/v1/${path}`, {
        ...init,
        headers: {
            ...init.headers,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        console.error(path, await res.text());
        throw new Error(`Request to claim API failed with status code ${res.status}`);
    }
    const { data } = await res.json();
    return data;
}, _ZkSendLink_listNonContractClaimableAssets = async function _ZkSendLink_listNonContractClaimableAssets() {
    const balances = [];
    const nfts = [];
    const coins = [];
    if (__classPrivateFieldGet(this, _ZkSendLink_ownedObjects, "f").length === 0 && !__classPrivateFieldGet(this, _ZkSendLink_hasSui, "f")) {
        return {
            balances,
            nfts,
            coins,
        };
    }
    const address = new Ed25519Keypair().toSuiAddress();
    const normalizedAddress = normalizeSuiAddress(address);
    const tx = this.createClaimTransaction(normalizedAddress);
    if (__classPrivateFieldGet(this, _ZkSendLink_gasCoin, "f") || !__classPrivateFieldGet(this, _ZkSendLink_hasSui, "f")) {
        tx.setGasPayment([]);
    }
    const dryRun = await __classPrivateFieldGet(this, _ZkSendLink_client, "f").dryRunTransactionBlock({
        transactionBlock: await tx.build({ client: __classPrivateFieldGet(this, _ZkSendLink_client, "f") }),
    });
    dryRun.balanceChanges.forEach((balanceChange) => {
        if (BigInt(balanceChange.amount) > 0n && isOwner(balanceChange.owner, normalizedAddress)) {
            balances.push({
                coinType: normalizeStructTag(balanceChange.coinType),
                amount: BigInt(balanceChange.amount),
            });
        }
    });
    dryRun.objectChanges.forEach((objectChange) => {
        if ('objectType' in objectChange) {
            const type = parseStructTag(objectChange.objectType);
            if (type.address === normalizeSuiAddress('0x2') &&
                type.module === 'coin' &&
                type.name === 'Coin') {
                if (ownedAfterChange(objectChange, normalizedAddress)) {
                    coins.push(objectChange);
                }
                return;
            }
        }
        if (ownedAfterChange(objectChange, normalizedAddress)) {
            nfts.push(objectChange);
        }
    });
    return {
        balances,
        nfts,
        coins,
    };
}, _ZkSendLink_createNonContractClaimTransaction = function _ZkSendLink_createNonContractClaimTransaction(address) {
    if (!this.keypair) {
        throw new Error('Cannot claim assets without the links keypair');
    }
    const tx = new Transaction();
    tx.setSender(this.keypair.toSuiAddress());
    const objectsToTransfer = __classPrivateFieldGet(this, _ZkSendLink_ownedObjects, "f")
        .filter((object) => {
        if (__classPrivateFieldGet(this, _ZkSendLink_gasCoin, "f")) {
            if (object.objectId === __classPrivateFieldGet(this, _ZkSendLink_gasCoin, "f").coinObjectId) {
                return false;
            }
        }
        else if (object.type === SUI_COIN_OBJECT_TYPE) {
            return false;
        }
        return true;
    })
        .map((object) => tx.object(object.objectId));
    if (__classPrivateFieldGet(this, _ZkSendLink_gasCoin, "f") && this.creatorAddress) {
        tx.transferObjects([tx.gas], this.creatorAddress);
    }
    else {
        objectsToTransfer.push(tx.gas);
    }
    if (objectsToTransfer.length > 0) {
        tx.transferObjects(objectsToTransfer, address);
    }
    return tx;
}, _ZkSendLink_loadOwnedObjects = async function _ZkSendLink_loadOwnedObjects({ loadClaimedAssets = true, } = {}) {
    this.assets = {
        nfts: [],
        balances: [],
        coins: [],
    };
    let nextCursor;
    do {
        const ownedObjects = await __classPrivateFieldGet(this, _ZkSendLink_client, "f").getOwnedObjects({
            cursor: nextCursor,
            owner: this.address,
            options: {
                showType: true,
                showContent: true,
            },
        });
        // RPC response returns cursor even if there are no more pages
        nextCursor = ownedObjects.hasNextPage ? ownedObjects.nextCursor : null;
        for (const object of ownedObjects.data) {
            if (object.data) {
                __classPrivateFieldGet(this, _ZkSendLink_ownedObjects, "f").push({
                    objectId: normalizeSuiObjectId(object.data.objectId),
                    version: object.data.version,
                    digest: object.data.digest,
                    type: normalizeStructTag(object.data.type),
                });
            }
        }
    } while (nextCursor);
    const coins = await __classPrivateFieldGet(this, _ZkSendLink_client, "f").getCoins({
        coinType: SUI_COIN_TYPE,
        owner: this.address,
    });
    __classPrivateFieldSet(this, _ZkSendLink_hasSui, coins.data.length > 0, "f");
    __classPrivateFieldSet(this, _ZkSendLink_gasCoin, coins.data.find((coin) => BigInt(coin.balance) % 1000n === 987n), "f");
    const result = await __classPrivateFieldGet(this, _ZkSendLink_client, "f").queryTransactionBlocks({
        limit: 1,
        order: 'ascending',
        filter: {
            ToAddress: this.address,
        },
        options: {
            showInput: true,
            showBalanceChanges: true,
            showObjectChanges: true,
        },
    });
    this.creatorAddress = result.data[0]?.transaction?.data.sender;
    if (__classPrivateFieldGet(this, _ZkSendLink_hasSui, "f") || __classPrivateFieldGet(this, _ZkSendLink_ownedObjects, "f").length > 0) {
        this.claimed = false;
        this.assets = await __classPrivateFieldGet(this, _ZkSendLink_instances, "m", _ZkSendLink_listNonContractClaimableAssets).call(this);
    }
    else if (result.data[0] && loadClaimedAssets) {
        this.claimed = true;
        await __classPrivateFieldGet(this, _ZkSendLink_instances, "m", _ZkSendLink_loadClaimedAssets).call(this);
    }
};
