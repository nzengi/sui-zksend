// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
export function withResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, reject: reject, resolve: resolve };
}
