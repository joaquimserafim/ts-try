# ts-try

A tiny, dependency‑free set of **Result** types and helpers for TypeScript that let you return values instead of throwing exceptions—**Rust‑style**. It ships two helpers: `trySyncFn` and `tryAsyncFn`.

[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-ready-yellow.svg)](https://pnpm.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Biome Lint](https://github.com/joaquimserafim/ts-try/actions/workflows/lint.yml/badge.svg)](https://github.com/joaquimserafim/ts-try/actions/workflows/lint.yml)

---

## Table of Contents

- [Install](#install)
- [Quick Start](#quick-start)
- [Why](#why)
- [API](#api)
    - [Types](#types)
    - [Functions](#functions)
- [Usage Examples](#usage-examples)
    - [Synchronous](#synchronous)
    - [Asynchronous](#asynchronous)
    - [Narrowing & Exhaustiveness](#narrowing--exhaustiveness)
    - [Custom Error Types](#custom-error-types)
- [Comparison: Result vs `[err, value]` tuple](#comparison-result-vs-err-value-tuple)
- [Tips](#tips)
- [Contributing](#contributing)
- [License](#license)

---

## Install

```bash
pnpm add @joaquimserafim/ts-try
# or
npm i @joaquimserafim/ts-try
```

> **Requirements**: TypeScript 5+, Node 18+ (or any environment that can run the compiled JS).

---

## Quick Start

```ts
import { trySyncFn, tryAsyncFn } from "@joaquimserafim/ts-try";

// Sync
const parsed = trySyncFn(() => JSON.parse('{"ok": true}'));
if (parsed.ok) {
	// parsed.value: any
} else {
	// parsed.error: Error
}

// Async
const response = await tryAsyncFn(fetch("/api"));
if (!response.ok) {
	console.error(response.error.message);
} else {
	const json = await response.value.json();
	console.log(json);
}
```

---

## Why

- **No try/catch** at call sites → easier to read/control flow.
- **Type‑safe branching** using the discriminant `ok`.
- **Zero dependencies** & dead‑simple runtime.
- Easily compose sync/async flows without exceptions bubbling unexpectedly.

Before (exceptions):

```ts
try {
	const data = JSON.parse(userInput);
	const res = await fetch("/api", {
		method: "POST",
		body: JSON.stringify(data),
	});
	console.log(await res.json());
} catch (e) {
	console.error("Something went wrong");
}
```

After (explicit results):

```ts
const parseR = trySyncFn(() => JSON.parse(userInput));
if (!parseR.ok) return console.error("Invalid JSON:", parseR.error.message);

const fetchR = await tryAsyncFn(
	fetch("/api", { method: "POST", body: JSON.stringify(parseR.value) })
);
if (!fetchR.ok) return console.error("Network error:", fetchR.error.message);

const jsonR = await tryAsyncFn(fetchR.value.json());
if (!jsonR.ok) return console.error("Bad response:", jsonR.error.message);

console.log(jsonR.value);
```

---

## API

### Types

```ts
export interface Ok<T> {
	readonly ok: true;
	readonly value: T;
	readonly error: undefined;
}

export interface Err<E extends Error = Error> {
	readonly ok: false;
	readonly value: undefined;
	readonly error: E;
}

export type Result<T, E extends Error = Error> = Ok<T> | Err<E>;
```

### Functions

```ts
function trySyncFn<T, E extends Error = Error>(fn: () => T): Result<T, E>;

function tryAsyncFn<T, E extends Error = Error>(
	promise: Promise<T>
): Promise<Result<T, E>>;
```

> Both helpers **coerce non‑Error throws** into an `Error` instance with message `Unknown error: <value>` to keep `error` consistently typed.

---

## Usage Examples

### Synchronous

```ts
import { trySyncFn } from "@joaquimserafim/ts-try";

const r = trySyncFn(() => mightThrow());
if (r.ok) {
	// r.value has the return type of mightThrow()
} else {
	// r.error is an Error (or a subtype if you picked E)
}
```

### Asynchronous

```ts
import { tryAsyncFn } from "@joaquimserafim/ts-try";

const r = await tryAsyncFn(fetch("/data"));
if (!r.ok) {
	console.error(r.error);
} else {
	const data = await r.value.json();
}
```

### Narrowing & Exhaustiveness

Because `Result` is a **discriminated union** on `ok`, TypeScript narrows precisely:

```ts
function handle<T>(r: Result<T>) {
	if (r.ok) {
		// r.value: T
	} else {
		// r.error: Error
	}
}
```

### Custom Error Types

You can specialize the error type to a narrower subtype:

```ts
class NetworkError extends Error {
	code = "NETWORK" as const;
}

const r = await tryAsyncFn<string, NetworkError>(
	new Promise<string>((_resolve, reject) => reject(new NetworkError("down")))
);

if (!r.ok) {
	// r.error is NetworkError
}
```

---

## Comparison: Result vs `[err, value]` tuple

| Aspect        | `Result<T, E>`                                       | `[err, value]`                                 |
| ------------- | ---------------------------------------------------- | ---------------------------------------------- |
| Type‑safety   | Discriminated union forces handling; great narrowing | Easy to ignore first element; weaker narrowing |
| Readability   | `if (r.ok)` mirrors Rust/Elm patterns                | Index‑based, easy to mix up                    |
| Extensibility | Can brand, add helpers later without breaking shape  | Fixed positional contract                      |

> This library intentionally uses the `Result` pattern (not tuples) to encourage explicit, typed branching.

---

## Tips

- In tests, you can assert with partial matching:
    ```ts
    expect(result).toMatchObject({ ok: true });
    expect(result).toMatchObject({ ok: false, error: expect.any(Error) });
    ```
- When composing multiple results, prefer returning early on the error branch to keep control flow simple.
- If you truly need exceptions (e.g., framework requires), you can still convert back: `if (!r.ok) throw r.error;`.

---

## Contributing

- Use `pnpm`.
- Run tests: `pnpm test` (or `pnpm vitest`).
- Lint/build as configured in the repository.

---

## License

MIT © Joaquim Serafim
