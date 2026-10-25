import type { Document, Value } from "../interp/index";

export interface DiffEntry {
  readonly path: string;
  readonly kind: "added" | "removed" | "changed" | "unchanged";
  readonly oldValue: string | null;
  readonly newValue: string | null;
}

export interface DiffSummary {
  readonly added: number;
  readonly removed: number;
  readonly changed: number;
  readonly unchanged: number;
}

export interface DiffResult {
  readonly changes: readonly DiffEntry[];
  readonly summary: DiffSummary;
}

function valueToString(value: Value): string {
  switch (value.kind) {
    case "opaque":
      return `opaque(${value.bytes.length} bytes)`;
    case "uint":
      return String(value.value);
    case "ascii":
      return JSON.stringify(value.text);
    case "tlv":
      return `tlv(tag=${value.tag}, len=${value.value.length})`;
    case "struct":
      return `struct(${value.children.length} children)`;
    default:
      return `unknown`;
  }
}

function diffValues(
  oldVal: Value | null,
  newVal: Value | null,
  path: string,
  changes: DiffEntry[],
): void {
  if (oldVal === null && newVal === null) {
    return;
  }

  if (oldVal === null) {
    changes.push({
      path,
      kind: "added",
      oldValue: null,
      newValue: valueToString(newVal),
    });
    return;
  }

  if (newVal === null) {
    changes.push({
      path,
      kind: "removed",
      oldValue: valueToString(oldVal),
      newValue: null,
    });
    return;
  }

  const oldStr = valueToString(oldVal);
  const newStr = valueToString(newVal);

  if (oldStr !== newStr) {
    changes.push({
      path,
      kind: "changed",
      oldValue: oldStr,
      newValue: newStr,
    });
    return;
  }

  changes.push({
    path,
    kind: "unchanged",
    oldValue: oldStr,
    newValue: newStr,
  });
}

function diffNode(
  oldNode: Value | null,
  newNode: Value | null,
  path: string,
  changes: DiffEntry[],
): void {
  if (oldNode === null && newNode === null) {
    return;
  }

  diffValues(oldNode, newNode, path, changes);

  if (oldNode?.kind === "struct" && newNode?.kind === "struct") {
    const oldChildren = oldNode.children;
    const newChildren = newNode.children;
    const maxLen = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < maxLen; i++) {
      const oldChild = i < oldChildren.length ? oldChildren[i] : null;
      const newChild = i < newChildren.length ? newChildren[i] : null;
      diffNode(oldChild, newChild, `${path}[${i}]`, changes);
    }
  }
}

export function diffDocuments(
  oldDoc: Document | null,
  newDoc: Document | null,
): DiffResult {
  const changes: DiffEntry[] = [];

  diffNode(oldDoc?.root ?? null, newDoc?.root ?? null, "root", changes);

  let added = 0;
  let removed = 0;
  let changed = 0;
  let unchanged = 0;

  for (const change of changes) {
    switch (change.kind) {
      case "added":
        added++;
        break;
      case "removed":
        removed++;
        break;
      case "changed":
        changed++;
        break;
      case "unchanged":
        unchanged++;
        break;
    }
  }

  return {
    changes,
    summary: { added, removed, changed, unchanged },
  };
}

export function diff(
  oldDoc: Document | null,
  newDoc: Document | null,
): DiffResult {
  return diffDocuments(oldDoc, newDoc);
}
