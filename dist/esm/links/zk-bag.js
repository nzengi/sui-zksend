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
var _ZkBag_package, _ZkBag_module;
export const TESTNET_CONTRACT_IDS = {
    packageId: '0x036fee67274d0d85c3532f58296abe0dee86b93864f1b2b9074be6adb388f138',
    bagStoreId: '0x5c63e71734c82c48a3cb9124c54001d1a09736cfb1668b3b30cd92a96dd4d0ce',
    bagStoreTableId: '0x4e1bc4085d64005e03eb4eab2510d527aeba9548cda431cb8f149ff37451f870',
};
export const MAINNET_CONTRACT_IDS = {
    packageId: '0x5bb7d0bb3240011336ca9015f553b2646302a4f05f821160344e9ec5a988f740',
    bagStoreId: '0x65b215a3f2a951c94313a89c43f0adbd2fd9ea78a0badf81e27d1c9868a8b6fe',
    bagStoreTableId: '0x616db54ca564660cd58e36a4548be68b289371ef2611485c62c374a60960084e',
};
export function getContractIds(network) {
    if (!network) {
        return MAINNET_CONTRACT_IDS;
    }
    return network === 'mainnet' ? MAINNET_CONTRACT_IDS : TESTNET_CONTRACT_IDS;
}
export class ZkBag {
    constructor(packageAddress, ids) {
        _ZkBag_package.set(this, void 0);
        _ZkBag_module.set(this, 'zk_bag');
        __classPrivateFieldSet(this, _ZkBag_package, packageAddress, "f");
        this.ids = ids;
    }
    new({ arguments: [store, receiver], }) {
        return (tx) => {
            tx.moveCall({
                target: `${__classPrivateFieldGet(this, _ZkBag_package, "f")}::${__classPrivateFieldGet(this, _ZkBag_module, "f")}::new`,
                arguments: [
                    tx.object(store),
                    typeof receiver === 'string' ? tx.pure.address(receiver) : receiver,
                ],
            });
        };
    }
    add({ arguments: [store, receiver, item], typeArguments, }) {
        return (tx) => tx.moveCall({
            target: `${__classPrivateFieldGet(this, _ZkBag_package, "f")}::${__classPrivateFieldGet(this, _ZkBag_module, "f")}::add`,
            arguments: [
                tx.object(store),
                typeof receiver === 'string' ? tx.pure.address(receiver) : receiver,
                tx.object(item),
            ],
            typeArguments: typeArguments,
        });
    }
    init_claim({ arguments: [store] }) {
        return (tx) => {
            const [bag, claimProof] = tx.moveCall({
                target: `${__classPrivateFieldGet(this, _ZkBag_package, "f")}::${__classPrivateFieldGet(this, _ZkBag_module, "f")}::init_claim`,
                arguments: [tx.object(store)],
            });
            return [bag, claimProof];
        };
    }
    reclaim({ arguments: [store, receiver], }) {
        return (tx) => {
            const [bag, claimProof] = tx.moveCall({
                target: `${__classPrivateFieldGet(this, _ZkBag_package, "f")}::${__classPrivateFieldGet(this, _ZkBag_module, "f")}::reclaim`,
                arguments: [
                    tx.object(store),
                    typeof receiver === 'string' ? tx.pure.address(receiver) : receiver,
                ],
            });
            return [bag, claimProof];
        };
    }
    claim({ arguments: [bag, claim, id], typeArguments, }) {
        return (tx) => tx.moveCall({
            target: `${__classPrivateFieldGet(this, _ZkBag_package, "f")}::${__classPrivateFieldGet(this, _ZkBag_module, "f")}::claim`,
            arguments: [tx.object(bag), tx.object(claim), typeof id === 'string' ? tx.object(id) : id],
            typeArguments,
        });
    }
    finalize({ arguments: [bag, claim], }) {
        return (tx) => {
            tx.moveCall({
                target: `${__classPrivateFieldGet(this, _ZkBag_package, "f")}::${__classPrivateFieldGet(this, _ZkBag_module, "f")}::finalize`,
                arguments: [tx.object(bag), tx.object(claim)],
            });
        };
    }
    update_receiver({ arguments: [bag, from, to], }) {
        return (tx) => {
            tx.moveCall({
                target: `${__classPrivateFieldGet(this, _ZkBag_package, "f")}::${__classPrivateFieldGet(this, _ZkBag_module, "f")}::update_receiver`,
                arguments: [
                    tx.object(bag),
                    typeof from === 'string' ? tx.pure.address(from) : from,
                    typeof to === 'string' ? tx.pure.address(to) : to,
                ],
            });
        };
    }
}
_ZkBag_package = new WeakMap(), _ZkBag_module = new WeakMap();
