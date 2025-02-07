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
var _StashedPopup_instances, _StashedPopup_popup, _StashedPopup_id, _StashedPopup_origin, _StashedPopup_name, _StashedPopup_network, _StashedPopup_promise, _StashedPopup_resolve, _StashedPopup_reject, _StashedPopup_interval, _StashedPopup_listener, _StashedPopup_cleanup, _StashedHost_request;
import { parse, safeParse } from 'valibot';
import { withResolvers } from '../../utils/withResolvers.js';
import { StashedRequest, StashedResponse } from './events.js';
export const DEFAULT_STASHED_ORIGIN = 'https://getstashed.com';
export { StashedRequest, StashedResponse };
export class StashedPopup {
    constructor({ name, network, origin = DEFAULT_STASHED_ORIGIN, }) {
        _StashedPopup_instances.add(this);
        _StashedPopup_popup.set(this, void 0);
        _StashedPopup_id.set(this, void 0);
        _StashedPopup_origin.set(this, void 0);
        _StashedPopup_name.set(this, void 0);
        _StashedPopup_network.set(this, void 0);
        _StashedPopup_promise.set(this, void 0);
        _StashedPopup_resolve.set(this, void 0);
        _StashedPopup_reject.set(this, void 0);
        _StashedPopup_interval.set(this, null);
        _StashedPopup_listener.set(this, (event) => {
            if (event.origin !== __classPrivateFieldGet(this, _StashedPopup_origin, "f")) {
                return;
            }
            const { success, output } = safeParse(StashedResponse, event.data);
            if (!success || output.id !== __classPrivateFieldGet(this, _StashedPopup_id, "f"))
                return;
            __classPrivateFieldGet(this, _StashedPopup_instances, "m", _StashedPopup_cleanup).call(this);
            if (output.payload.type === 'reject') {
                __classPrivateFieldGet(this, _StashedPopup_reject, "f").call(this, new Error('User rejected the request'));
            }
            else if (output.payload.type === 'resolve') {
                __classPrivateFieldGet(this, _StashedPopup_resolve, "f").call(this, output.payload.data);
            }
        });
        const popup = window.open('about:blank', '_blank');
        if (!popup) {
            throw new Error('Failed to open new window');
        }
        __classPrivateFieldSet(this, _StashedPopup_popup, popup, "f");
        __classPrivateFieldSet(this, _StashedPopup_id, crypto.randomUUID(), "f");
        __classPrivateFieldSet(this, _StashedPopup_origin, origin, "f");
        __classPrivateFieldSet(this, _StashedPopup_name, name, "f");
        __classPrivateFieldSet(this, _StashedPopup_network, network, "f");
        const { promise, resolve, reject } = withResolvers();
        __classPrivateFieldSet(this, _StashedPopup_promise, promise, "f");
        __classPrivateFieldSet(this, _StashedPopup_resolve, resolve, "f");
        __classPrivateFieldSet(this, _StashedPopup_reject, reject, "f");
        __classPrivateFieldSet(this, _StashedPopup_interval, setInterval(() => {
            try {
                if (__classPrivateFieldGet(this, _StashedPopup_popup, "f").closed) {
                    __classPrivateFieldGet(this, _StashedPopup_instances, "m", _StashedPopup_cleanup).call(this);
                    reject(new Error('User closed the Stashed window'));
                }
            }
            catch {
                // This can error during the login flow, but that's fine.
            }
        }, 1000), "f");
    }
    send({ type, ...data }) {
        window.addEventListener('message', __classPrivateFieldGet(this, _StashedPopup_listener, "f"));
        __classPrivateFieldGet(this, _StashedPopup_popup, "f").location.assign(`${__classPrivateFieldGet(this, _StashedPopup_origin, "f")}/dapp/${type}?${new URLSearchParams({
            id: __classPrivateFieldGet(this, _StashedPopup_id, "f"),
            origin: window.origin,
            network: __classPrivateFieldGet(this, _StashedPopup_network, "f"),
            name: __classPrivateFieldGet(this, _StashedPopup_name, "f"),
        })}${data ? `#${new URLSearchParams(data)}` : ''}`);
        return __classPrivateFieldGet(this, _StashedPopup_promise, "f");
    }
    close() {
        __classPrivateFieldGet(this, _StashedPopup_instances, "m", _StashedPopup_cleanup).call(this);
        __classPrivateFieldGet(this, _StashedPopup_popup, "f").close();
    }
}
_StashedPopup_popup = new WeakMap(), _StashedPopup_id = new WeakMap(), _StashedPopup_origin = new WeakMap(), _StashedPopup_name = new WeakMap(), _StashedPopup_network = new WeakMap(), _StashedPopup_promise = new WeakMap(), _StashedPopup_resolve = new WeakMap(), _StashedPopup_reject = new WeakMap(), _StashedPopup_interval = new WeakMap(), _StashedPopup_listener = new WeakMap(), _StashedPopup_instances = new WeakSet(), _StashedPopup_cleanup = function _StashedPopup_cleanup() {
    if (__classPrivateFieldGet(this, _StashedPopup_interval, "f")) {
        clearInterval(__classPrivateFieldGet(this, _StashedPopup_interval, "f"));
        __classPrivateFieldSet(this, _StashedPopup_interval, null, "f");
    }
    window.removeEventListener('message', __classPrivateFieldGet(this, _StashedPopup_listener, "f"));
};
export class StashedHost {
    constructor(request) {
        _StashedHost_request.set(this, void 0);
        if (typeof window === 'undefined' || !window.opener) {
            throw new Error('StashedHost can only be used in a window opened through `window.open`. `window.opener` is not available.');
        }
        __classPrivateFieldSet(this, _StashedHost_request, request, "f");
    }
    static fromUrl(url = window.location.href) {
        const parsed = new URL(url);
        const urlHashData = parsed.hash
            ? Object.fromEntries([...new URLSearchParams(parsed.hash.slice(1))])
            : {};
        const request = parse(StashedRequest, {
            id: parsed.searchParams.get('id'),
            origin: parsed.searchParams.get('origin'),
            name: parsed.searchParams.get('name'),
            payload: {
                type: parsed.pathname.split('/').pop(),
                ...urlHashData,
            },
        });
        return new StashedHost(request);
    }
    getRequestData() {
        return __classPrivateFieldGet(this, _StashedHost_request, "f");
    }
    sendMessage(payload) {
        window.opener.postMessage({
            id: __classPrivateFieldGet(this, _StashedHost_request, "f").id,
            source: 'zksend-channel',
            payload,
        }, __classPrivateFieldGet(this, _StashedHost_request, "f").origin);
    }
    close(payload) {
        if (payload) {
            this.sendMessage(payload);
        }
        window.close();
    }
}
_StashedHost_request = new WeakMap();
