// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _StashedWallet_instances, _StashedWallet_events, _StashedWallet_accounts, _StashedWallet_origin, _StashedWallet_name, _StashedWallet_network, _StashedWallet_signTransactionBlock, _StashedWallet_signTransaction, _StashedWallet_signPersonalMessage, _StashedWallet_on, _StashedWallet_setAccount, _StashedWallet_connect, _StashedWallet_disconnect;
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';
import { getWallets, ReadonlyWalletAccount, SUI_MAINNET_CHAIN } from '@mysten/wallet-standard';
import mitt from 'mitt';
import { DEFAULT_STASHED_ORIGIN, StashedPopup } from './channel/index.js';
const STASHED_RECENT_ADDRESS_KEY = 'stashed:recentAddress';
export const STASHED_WALLET_NAME = 'Stashed';
export class StashedWallet {
    get name() {
        return STASHED_WALLET_NAME;
    }
    get icon() {
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjU0IiBoZWlnaHQ9IjU0IiB4PSIxIiB5PSIxIiBmaWxsPSIjNTE5REU5IiByeD0iMjciLz48cmVjdCB3aWR0aD0iNTQiIGhlaWdodD0iNTQiIHg9IjEiIHk9IjEiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiByeD0iMjciLz48cGF0aCBmaWxsPSIjMDAwIiBkPSJNMTguMzUzIDM1LjA2NGMuOTIxIDMuNDM4IDQuMzYzIDYuNTUxIDExLjQ4MyA0LjY0NCA2Ljc5NC0xLjgyMSAxMS4wNTItNy40MSA5Ljk0OC0xMS41My0uMzgxLTEuNDIzLTEuNTMtMi4zODctMy4zLTIuMjNsLTE1LjgzMiAxLjMyYy0uOTk3LjA3Ni0xLjQ1NC0uMDg4LTEuNzE4LS43MTYtLjI1Ni0uNTk5LS4xMS0xLjI0MSAxLjA5NC0xLjg1bDEyLjA0OC02LjE4M2MuOTI0LS40NyAxLjUzOS0uNjY2IDIuMTAxLS40NjguMzUyLjEyOC41ODQuNjM4LjM3MSAxLjI2N2wtLjc4MSAyLjMwNmMtLjk1OSAyLjgzIDEuMDk0IDMuNDg4IDIuMjUgMy4xNzggMS43NTEtLjQ2OSAyLjE2My0yLjEzNiAxLjU5OS00LjI0LTEuNDMtNS4zMzctNy4wOS02LjE3LTEyLjIyMy00Ljc5Ni01LjIyMiAxLjQtOS43NDggNS42My04LjM2NiAxMC43ODkuMzI1IDEuMjE1IDEuNDQ0IDIuMTg2IDIuNzQgMi4xNTdsMS45NzgtLjAwNWMuNDA3LS4wMS4yNi4wMjQgMS4wNDYtLjA0MS43ODQtLjA2NSAyLjg4LS4zMjMgMi44OC0uMzIzbDEwLjI4Ni0xLjE2NC4yNjUtLjAzOGMuNjAyLS4xMDMgMS4wNTYuMDUzIDEuNDQuNzE1LjU3Ni45OTEtLjMwMiAxLjczOC0xLjM1MiAyLjYzM2wtLjA4NS4wNzItOS4wNDEgNy43OTJjLTEuNTUgMS4zMzctMi42MzkuODM0LTMuMDItLjU4OWwtMS4zNS01LjA0Yy0uMzM0LTEuMjQ0LTEuNTUtMi4yMjEtMi45NzQtMS44NC0xLjc4LjQ3Ny0xLjkyNCAyLjU1LTEuNDg3IDQuMThaIi8+PC9zdmc+Cg==';
    }
    get version() {
        return '1.0.0';
    }
    get chains() {
        return [SUI_MAINNET_CHAIN];
    }
    get accounts() {
        return __classPrivateFieldGet(this, _StashedWallet_accounts, "f");
    }
    get features() {
        return {
            'standard:connect': {
                version: '1.0.0',
                connect: __classPrivateFieldGet(this, _StashedWallet_connect, "f"),
            },
            'standard:disconnect': {
                version: '1.0.0',
                disconnect: __classPrivateFieldGet(this, _StashedWallet_disconnect, "f"),
            },
            'standard:events': {
                version: '1.0.0',
                on: __classPrivateFieldGet(this, _StashedWallet_on, "f"),
            },
            'sui:signTransactionBlock': {
                version: '1.0.0',
                signTransactionBlock: __classPrivateFieldGet(this, _StashedWallet_signTransactionBlock, "f"),
            },
            'sui:signTransaction': {
                version: '2.0.0',
                signTransaction: __classPrivateFieldGet(this, _StashedWallet_signTransaction, "f"),
            },
            'sui:signPersonalMessage': {
                version: '1.0.0',
                signPersonalMessage: __classPrivateFieldGet(this, _StashedWallet_signPersonalMessage, "f"),
            },
        };
    }
    constructor({ name, network, address, origin = DEFAULT_STASHED_ORIGIN, }) {
        _StashedWallet_instances.add(this);
        _StashedWallet_events.set(this, void 0);
        _StashedWallet_accounts.set(this, void 0);
        _StashedWallet_origin.set(this, void 0);
        _StashedWallet_name.set(this, void 0);
        _StashedWallet_network.set(this, void 0);
        _StashedWallet_signTransactionBlock.set(this, async ({ transactionBlock, account }) => {
            transactionBlock.setSenderIfNotSet(account.address);
            const data = transactionBlock.serialize();
            const popup = new StashedPopup({
                name: __classPrivateFieldGet(this, _StashedWallet_name, "f"),
                origin: __classPrivateFieldGet(this, _StashedWallet_origin, "f"),
                network: __classPrivateFieldGet(this, _StashedWallet_network, "f"),
            });
            const response = await popup.send({
                type: 'sign-transaction-block',
                data,
                address: account.address,
            });
            return {
                transactionBlockBytes: response.bytes,
                signature: response.signature,
            };
        });
        _StashedWallet_signTransaction.set(this, async ({ transaction, account }) => {
            const popup = new StashedPopup({
                name: __classPrivateFieldGet(this, _StashedWallet_name, "f"),
                origin: __classPrivateFieldGet(this, _StashedWallet_origin, "f"),
                network: __classPrivateFieldGet(this, _StashedWallet_network, "f"),
            });
            const tx = Transaction.from(await transaction.toJSON());
            tx.setSenderIfNotSet(account.address);
            const data = tx.serialize();
            const response = await popup.send({
                type: 'sign-transaction-block',
                data,
                address: account.address,
            });
            return {
                bytes: response.bytes,
                signature: response.signature,
            };
        });
        _StashedWallet_signPersonalMessage.set(this, async ({ message, account }) => {
            const popup = new StashedPopup({
                name: __classPrivateFieldGet(this, _StashedWallet_name, "f"),
                origin: __classPrivateFieldGet(this, _StashedWallet_origin, "f"),
                network: __classPrivateFieldGet(this, _StashedWallet_network, "f"),
            });
            const bytes = toBase64(message);
            const response = await popup.send({
                type: 'sign-personal-message',
                bytes,
                address: account.address,
            });
            return {
                bytes,
                signature: response.signature,
            };
        });
        _StashedWallet_on.set(this, (event, listener) => {
            __classPrivateFieldGet(this, _StashedWallet_events, "f").on(event, listener);
            return () => __classPrivateFieldGet(this, _StashedWallet_events, "f").off(event, listener);
        });
        _StashedWallet_connect.set(this, async (input) => {
            if (input?.silent) {
                const address = localStorage.getItem(STASHED_RECENT_ADDRESS_KEY);
                if (address) {
                    __classPrivateFieldGet(this, _StashedWallet_instances, "m", _StashedWallet_setAccount).call(this, address);
                }
                return { accounts: this.accounts };
            }
            const popup = new StashedPopup({
                name: __classPrivateFieldGet(this, _StashedWallet_name, "f"),
                origin: __classPrivateFieldGet(this, _StashedWallet_origin, "f"),
                network: __classPrivateFieldGet(this, _StashedWallet_network, "f"),
            });
            const response = await popup.send({
                type: 'connect',
            });
            if (!('address' in response)) {
                throw new Error('Unexpected response');
            }
            __classPrivateFieldGet(this, _StashedWallet_instances, "m", _StashedWallet_setAccount).call(this, response.address);
            return { accounts: this.accounts };
        });
        _StashedWallet_disconnect.set(this, async () => {
            localStorage.removeItem(STASHED_RECENT_ADDRESS_KEY);
            __classPrivateFieldGet(this, _StashedWallet_instances, "m", _StashedWallet_setAccount).call(this);
        });
        __classPrivateFieldSet(this, _StashedWallet_accounts, [], "f");
        __classPrivateFieldSet(this, _StashedWallet_events, mitt(), "f");
        __classPrivateFieldSet(this, _StashedWallet_origin, origin, "f");
        __classPrivateFieldSet(this, _StashedWallet_name, name, "f");
        __classPrivateFieldSet(this, _StashedWallet_network, network, "f");
        if (address) {
            __classPrivateFieldGet(this, _StashedWallet_instances, "m", _StashedWallet_setAccount).call(this, address);
        }
    }
}
_StashedWallet_events = new WeakMap(), _StashedWallet_accounts = new WeakMap(), _StashedWallet_origin = new WeakMap(), _StashedWallet_name = new WeakMap(), _StashedWallet_network = new WeakMap(), _StashedWallet_signTransactionBlock = new WeakMap(), _StashedWallet_signTransaction = new WeakMap(), _StashedWallet_signPersonalMessage = new WeakMap(), _StashedWallet_on = new WeakMap(), _StashedWallet_connect = new WeakMap(), _StashedWallet_disconnect = new WeakMap(), _StashedWallet_instances = new WeakSet(), _StashedWallet_setAccount = function _StashedWallet_setAccount(address) {
    if (address) {
        __classPrivateFieldSet(this, _StashedWallet_accounts, [
            new ReadonlyWalletAccount({
                address,
                chains: [SUI_MAINNET_CHAIN],
                features: ['sui:signTransactionBlock', 'sui:signPersonalMessage'],
                // NOTE: Stashed doesn't support getting public keys, and zkLogin accounts don't have meaningful public keys anyway
                publicKey: new Uint8Array(),
            }),
        ], "f");
        localStorage.setItem(STASHED_RECENT_ADDRESS_KEY, address);
    }
    else {
        __classPrivateFieldSet(this, _StashedWallet_accounts, [], "f");
    }
    __classPrivateFieldGet(this, _StashedWallet_events, "f").emit('change', { accounts: this.accounts });
};
export function registerStashedWallet(name, { origin, network = 'mainnet', } = {}) {
    const wallets = getWallets();
    let addressFromRedirect = null;
    try {
        const params = new URLSearchParams(window.location.search);
        addressFromRedirect = params.get('stashed_address') || params.get('zksend_address');
    }
    catch {
        // Ignore errors
    }
    const wallet = new StashedWallet({
        name,
        network,
        origin,
        address: addressFromRedirect,
    });
    const unregister = wallets.register(wallet);
    return {
        wallet,
        unregister,
        addressFromRedirect,
    };
}
