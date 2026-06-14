import type { PositionedNode } from "./data";

export function pathFor(source: PositionedNode, target: PositionedNode): string {
  const mid = (source.x + target.x) / 2;
  return `M ${source.x} ${source.y} C ${mid} ${source.y}, ${mid} ${target.y}, ${target.x} ${target.y}`;
}
