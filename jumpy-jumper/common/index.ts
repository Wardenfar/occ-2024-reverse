import { z } from "zod";

export const ZoomLevel = z.number();
export type ZoomLevel = z.infer<typeof ZoomLevel>;

export type StartData = {
    pos: Pos
}

export type StarCount = {
    collected: number,
    total: number
}

export const Pos = z.object({
    x: z.number(),
    y: z.number(),
});
export type Pos = z.infer<typeof Pos>;

export const Block = z.object({
    wall: z.boolean(),
    star: z.boolean(),
    spike: z.boolean(),
    sprite: z.number().optional(),
    rotation: z.number().optional()
});
export type Block = z.infer<typeof Block>;

export const Chunk = z.object({
    pos: Pos,
    blocks: z.array(Block)
});
export type Chunk = z.infer<typeof Chunk>;

export function pos_key(pos: Pos): string {
    return `${Math.floor(pos.x)}-${Math.floor(pos.y)}`
}

export function block2chunk(pos: Pos): Pos {
    return {
        x: pos.x >> 4,
        y: pos.y >> 4
    }
}

export function chunk2center_block(pos: Pos): Pos {
    return {
        x: (pos.x << 4) + 8,
        y: (pos.y << 4) + 8
    }
}

export class GameMap {
    public chunks: Map<string, Chunk>

    constructor() {
        this.chunks = new Map()
    }

    add_chunk(chunk: Chunk) {
        this.chunks.set(pos_key(chunk.pos), chunk);
    }

    remove_chunk(pos: Pos) {
        this.chunks.delete(pos_key(pos));
    }

    block_at(pos: Pos): Block | null {
        let chunk_key = this.chunk_key(pos)
        let chunk = this.chunks.get(chunk_key);
        if (chunk) {
            let in_chunk_x = pos.x & 0b1111
            let in_chunk_y = pos.y & 0b1111
            let block = chunk.blocks[in_chunk_y * 16 + in_chunk_x]
            return block
        } else {
            return null
        }
    }

    chunk_key(pos: Pos): string {
        return pos_key({
            x: Math.floor(pos.x) >> 4,
            y: Math.floor(pos.y) >> 4
        });
    }

    wall_at(pos: Pos): boolean {
        let block = this.block_at(pos)
        return block?.wall ?? false
    }

    star_at(pos: Pos): boolean {
        let block = this.block_at(pos)
        return block?.star ?? false
    }

    spike_at(pos: Pos): boolean {
        let block = this.block_at(pos)
        return block?.spike ?? false
    }
}