// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { literal, object, optional, pipe, string, url, uuid, variant } from 'valibot';
export const StashedRequestData = variant('type', [
    object({
        type: literal('connect'),
    }),
    object({
        type: literal('sign-transaction-block'),
        data: string('`data` is required'),
        address: string('`address` is required'),
    }),
    object({
        type: literal('sign-personal-message'),
        bytes: string('`bytes` is required'),
        address: string('`address` is required'),
    }),
]);
export const StashedRequest = object({
    id: pipe(string('`id` is required'), uuid()),
    origin: pipe(string(), url('`origin` must be a valid URL')),
    name: optional(string()),
    payload: StashedRequestData,
});
export const StashedResponseData = variant('type', [
    object({
        type: literal('connect'),
        address: string(),
    }),
    object({
        type: literal('sign-transaction-block'),
        bytes: string(),
        signature: string(),
    }),
    object({
        type: literal('sign-personal-message'),
        bytes: string(),
        signature: string(),
    }),
]);
export const StashedResponsePayload = variant('type', [
    object({
        type: literal('reject'),
    }),
    object({
        type: literal('resolve'),
        data: StashedResponseData,
    }),
]);
export const StashedResponse = object({
    id: pipe(string(), uuid()),
    source: literal('zksend-channel'),
    payload: StashedResponsePayload,
});
