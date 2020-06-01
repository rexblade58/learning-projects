// Exercise: Utility Types and Type Composition
//
// Senior-level concepts: Partial, Required, Readonly, Record,
// Exclude, Extract, ReturnType, Parameters, and decorators.

// --- Standard utility types ---
interface Task {
  id: number;
  title: string;
  completed: boolean;
  dueDate: Date;
}

// Partial: all fields optional (great for update payloads)
type TaskUpdate = Partial<Task>;

// Required: all fields mandatory
type FullTask = Required<Task>;

// Readonly: deep immutability at type level
type FrozenTask = Readonly<Task>;

// Record: map of keys to values
type TaskMap = Record<string, Task>;

// Exclude / Extract
type Status = 'pending' | 'active' | 'done' | 'archived';
type ActiveStatuses = Exclude<Status, 'archived'>;
type TerminalStates = Extract<Status, 'done' | 'archived'>;

// --- ReturnType / Parameters ---
function fetchTask(id: number, retries: number = 3): Promise<Task> {
  return Promise.resolve({
    id,
    title: 'Example',
    completed: false,
    dueDate: new Date(),
  });
}

type FetchTaskReturn = ReturnType<typeof fetchTask>; // Promise<Task>
type FetchTaskParams = Parameters<typeof fetchTask>; // [number, number?]

// --- Branded types for type safety ---
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function createUserId(raw: string): UserId {
  return raw as UserId;
}

function getOrder(orderId: OrderId): void {
  // Only accepts OrderId, prevents passing UserId by mistake
  console.log(`Fetching order ${orderId}`);
}

const uid = createUserId('user_123');
// getOrder(uid); // Type error - good!

// --- Type predicate guard ---
function isTask(value: unknown): value is Task {
  const v = value as Task;
  return typeof v === 'object' && v !== null && typeof v.id === 'number';
}

// --- Decorator pattern (metadata programming) ---
function logMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`[decorator] calling ${propertyKey} with`, args);
    return original.apply(this, args);
  };
}

class TaskService {
  @logMethod
  create(title: string): Task {
    return { id: Date.now(), title, completed: false, dueDate: new Date() };
  }
}

const service = new TaskService();
const task = service.create('Learn utility types');
console.log('Created task:', task.id);

// --- Extract keys from interfaces ---
type TaskKeys = keyof Task; // 'id' | 'title' | 'completed' | 'dueDate'

const validKey: TaskKeys = 'title';
console.log('Valid task key:', validKey);

export {};
