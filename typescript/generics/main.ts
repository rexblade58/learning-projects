// Exercise: Advanced TypeScript Generics
//
// Senior-level concepts: generic constraints, conditional types,
// mapped types, and inference.

// --- Generic constraints ---
interface HasId {
  id: number;
}

function getById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

// --- Generic class with constraint ---
class Repository<T extends HasId> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  find(id: number): T | undefined {
    return getById(this.items, id);
  }

  remove(id: number): void {
    this.items = this.items.filter((i) => i.id !== id);
  }

  count(): number {
    return this.items.length;
  }
}

// --- Conditional types ---
type IsArray<T> = T extends unknown[] ? true : false;

type A = IsArray<string[]>; // true
type B = IsArray<string>; // false

// --- Mapped types: make all properties nullable ---
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

interface Config {
  host: string;
  port: number;
  tls: boolean;
}

type NullableConfig = Nullable<Config>;

// --- Pick and Omit from partial structures ---
type ConnectionInfo = Pick<Config, 'host' | 'port'>;
type WithoutTls = Omit<Config, 'tls'>;

// --- Function parameter inference ---
function createWrapper<T, R>(fn: (arg: T) => R) {
  return (arg: T): R => fn(arg);
}

const double = createWrapper((n: number) => n * 2);
// ^ double: (arg: number) => number

// --- Discriminated unions ---
type ApiResult<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function handleResult<T>(result: ApiResult<T>): string {
  if (result.status === 'success') {
    return `OK: ${JSON.stringify(result.data)}`;
  }
  return `ERR: ${result.error}`;
}

// --- Generic API client ---
interface User extends HasId {
  name: string;
  email: string;
}

const users = new Repository<User>();
users.add({ id: 1, name: 'Alice', email: 'alice@example.com' });
users.add({ id: 2, name: 'Bob', email: 'bob@example.com' });

const found = users.find(2);
console.log('Found:', found?.name);

const apiResult: ApiResult<User> = {
  status: 'success',
  data: { id: 3, name: 'Carol', email: 'carol@example.com' },
};
console.log(handleResult(apiResult));

export {};
