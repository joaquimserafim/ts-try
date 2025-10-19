import { describe, it, expect } from "vitest";

import { tryAsyncFn, trySyncFn } from "./index";

describe("tryAsyncFn", () => {
	it("should return an Ok result if the promise resolves", async () => {
		const result = await tryAsyncFn(Promise.resolve("success"));
		expect(result).toMatchObject({ ok: true, value: "success" });
	});

	it("should return an Err result if the promise rejects", async () => {
		const result = await tryAsyncFn(Promise.reject(new Error("error")));
		expect(result).toMatchObject({ ok: false, error: new Error("error") });
	});

	it("should return an Err when promise rejects with a non-Error object", async () => {
		const result = await tryAsyncFn(Promise.reject("error"));
		expect(result).toMatchObject({
			ok: false,
			error: new Error("Unknown error: error"),
		});
	});
});

describe("trySyncFn", () => {
	it("should return an Ok result if the function succeeds", () => {
		const result = trySyncFn(() => "success");
		expect(result).toMatchObject({ ok: true, value: "success" });
	});

	it("should return an Err result if the function throws", () => {
		const result = trySyncFn(() => {
			throw new Error("error");
		});
		expect(result).toMatchObject({ ok: false, error: new Error("error") });
	});

	it("should return an Err when function throws a non-Error object", () => {
		const result = trySyncFn(() => {
			throw "error";
		});
		expect(result).toMatchObject({
			ok: false,
			error: new Error("Unknown error: error"),
		});
	});
});
