import type { Pos } from "common";

export function distance(a: Pos, b: Pos): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}
