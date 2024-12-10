import { Block, GameMap, pos_key } from "common"

export type Map = {
    layers: Layer[]
}

export type Layer = {
    width: number,
    height: number,
    data: number[]
}

export function build_map(map: Map): GameMap {
    const game_map = new GameMap();

    const layer = map.layers[0];
    for (let x = 0; x < layer.width; x++) {
        for (let y = 0; y < layer.width; y++) {

            let chunk_pos = { x: x >> 4, y: y >> 4 }
            let chunk_key = pos_key(chunk_pos)
            let in_chunk = { x: x & 0b1111, y: y & 0b1111 };

            let chunk = game_map.chunks.get(chunk_key);
            if (!chunk) {
                let blocks = []
                for (let i = 0; i < 16 * 16; i++) {
                    blocks.push({
                        spike: false,
                        star: false,
                        wall: false,
                    })
                }

                chunk = {
                    pos: chunk_pos,
                    blocks,
                }

                game_map.chunks.set(chunk_key, chunk)
            }

            const data = layer.data[y * layer.width + x];
            let id = data & 0xff;
            const rotation = data >> 24;

            if (id == 0) {
                continue
            }

            id -= 1;

            let block = chunk.blocks[in_chunk.y * 16 + in_chunk.x];
            block.sprite = id;
            block.rotation = rotation;

            if (id == 35) {
                block.star = true;
            } else if (id == 27) {
                block.spike = true;
            } else {
                block.wall = true;
            }
        }
    }

    console.log("chunks = " + game_map.chunks.size);

    return game_map
} 