/** Represents a successful outcome, holding the value. */
export interface Ok<T> {
	readonly ok: true;
	readonly value: T;
	readonly error: undefined;
}

/** Represents a failed outcome, holding the error. */
export interface Err<E extends Error = Error> {
	readonly ok: false;
	readonly value: undefined;
	readonly error: E;
}

/**
 * A discriminated union type similar to Rust's Result<T, E>.
 * It is either a successful Ok<T> or a failed Err<E>.
 */
export type Result<T, E extends Error = Error> = Ok<T> | Err<E>;

/** Helper function to create a successful result. */
function ok<T>(value: T): Ok<T> {
	return { ok: true, value, error: undefined };
}

/** Helper function to create a failed result. */
function err<E extends Error>(error: E): Err<E> {
	return { ok: false, value: undefined, error };
}

/**
 * Wraps an asynchronous function call (a Promise) to prevent throwing exceptions.
 * Converts a successful Promise resolution into an Ok result,
 * and a rejected Promise into an Err result.
 *
 * @param promise The Promise to wrap.
 * @returns A Promise that resolves to a Result tuple [error, value].
 */
export async function tryAsyncFn<T, E extends Error = Error>(
	promise: Promise<T>,
): Promise<Result<T, E>> {
	try {
		const value = await promise;
		return ok(value);
	} catch (e) {
		// Ensure the caught object is an Error instance
		const error = e instanceof Error ? e : new Error(`Unknown error: ${e}`);
		// We must cast here because TypeScript cannot guarantee the caught type is E
		return err(error as E);
	}
}

/**
 * Wraps a synchronous function call to prevent throwing exceptions.
 * Converts a successful function call into an Ok result,
 * and a thrown exception into an Err result.
 *
 * @param fn The function to wrap.
 * @returns A Result tuple [error, value].
 */
export function trySyncFn<T, E extends Error = Error>(
	fn: () => T,
): Result<T, E> {
	try {
		return ok(fn());
	} catch (e) {
		const error = e instanceof Error ? e : new Error(`Unknown error: ${e}`);
		return err(error as E);
	}
}
