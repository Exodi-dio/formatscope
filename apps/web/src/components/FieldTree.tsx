import { useCallback } from "react";

import type { Field, Schema } from "@formatscope/core";

interface FieldTreeProps {
  schema: Schema | null;
  onFieldSelect: (offset: number) => void;
  highlightedOffset: number | null;
}

export function FieldTree({
  schema,
  onFieldSelect,
  highlightedOffset,
}: FieldTreeProps) {
  const handleFieldClick = useCallback(
    (offset: number) => {
      onFieldSelect(offset);
    },
    [onFieldSelect],
  );

  if (!schema) {
    return (
      <div className="field-tree">
        <div className="field-tree-header">Field tree</div>
        <div className="field-tree-empty">No schema inferred yet.</div>
      </div>
    );
  }

  return (
    <div className="field-tree">
      <div className="field-tree-header">Field tree</div>
      <FieldNode
        field={schema.root}
        path="root"
        depth={0}
        onClick={handleFieldClick}
        highlightedOffset={highlightedOffset}
      />
    </div>
  );
}

interface FieldNodeProps {
  field: Field;
  path: string;
  depth: number;
  onClick: (offset: number) => void;
  highlightedOffset: number | null;
}

function FieldNode({
  field,
  path,
  depth,
  onClick,
  highlightedOffset,
}: FieldNodeProps) {
  const pad = "  ".repeat(depth);
  const isHighlighted =
    highlightedOffset !== null &&
    highlightedOffset >= field.offset &&
    highlightedOffset < field.offset + field.length;

  const hasChildren = field.kind === "struct" && field.fields.length > 0;

  return (
    <div
      className="field-node"
      style={{
        marginLeft: depth * 18,
        borderLeft: isHighlighted ? "2px solid #7dd3a7" : "transparent",
        paddingLeft: isHighlighted ? 0 : 2,
      }}
      onClick={() => onClick(field.offset)}
      title={`0x${field.offset.toString(16).padStart(4, "0")}–0x${(field.offset + field.length - 1).toString(16).padStart(4, "0")}`}
    >
      <span className="field-kind">{field.kind}</span>
      <span className="field-range">
        0x{field.offset.toString(16).padStart(4, "0")} +
        {field.length}
      </span>
      {hasChildren && (
        <span className="field-expand">▾</span>
      )}
    </div>
  );
}
