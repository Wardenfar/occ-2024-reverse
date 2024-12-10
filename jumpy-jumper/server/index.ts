import map1 from "./maps/map1.js"
import map2 from "./maps/map2.js"

import { chunk2center_block, GameMap, Pos, ZoomLevel, pos_key, type StarCount, type StartData } from "common";
import { createServer } from "http";
import { Server } from "socket.io";
import { build_map } from "./src/build_map";
import { distance } from "./src/util";
import express from "express"

const app = express();
app.use(express.static('../client/dist'))
const httpServer = createServer(app);
const io = new Server(httpServer, {});

const is_first_map = process.env.MAP == "1";
const flag = process.env.FLAG

io.on("connection", (socket) => {
    console.log("new client")

    console.log("building map ...")
    const game_map: GameMap = build_map(is_first_map ? map1 : map2)
    console.log("done")

    const start_pos: Pos = is_first_map ? { x: 12, y: 19 } : { x: 278, y: 111 };
    const total_stars = is_first_map ? 4 : 5;

    var collected_stars: Set<string> = new Set();

    let last_update = new Date();
    let player_pos = start_pos;
    let loaded_chunks: Set<string> = new Set();
    let dirty_chunks: Set<string> = new Set();
    let number_of_blocks_on_screen_w = 1;

    const updateLoadChunks = () => {
        game_map.chunks.forEach(c => {
            const d = distance(player_pos, chunk2center_block(c.pos))
            const key = pos_key(c.pos);
            const diag = Math.sqrt(16 * 16 + 16 * 16);
            const view_distance = Math.max(number_of_blocks_on_screen_w, diag) * 2

            const need_load = (d < view_distance && !loaded_chunks.has(key)) || (dirty_chunks.has(key) && loaded_chunks.has(key));
            const need_unload = (d >= view_distance || dirty_chunks.has(key)) && loaded_chunks.has(key);

            if (need_unload) {
                loaded_chunks.delete(key)
                console.log("unload chunk", socket.id)
                socket.emit("unload-chunk", c.pos)
            }

            if (need_load) {
                loaded_chunks.add(key)
                console.log("load chunk", socket.id)
                socket.emit("chunk", c)
            }
        })

        dirty_chunks.clear()
    }

    const updateStars = () => {
        let data: StarCount = {
            collected: collected_stars.size,
            total: total_stars
        }
        socket.emit("stars", data)
        if (data.collected == data.total) {
            socket.emit("flag", flag)
        }
    }

    socket.on("ready", () => {
        updateLoadChunks();
        updateStars();
        let start_data: StartData = {
            pos: start_pos
        }
        socket.emit("start", start_data)
    })

    socket.on("zoom", (data) => {
        let zoom = ZoomLevel.parse(data);
        number_of_blocks_on_screen_w = zoom;
    })

    socket.on("pos", (data) => {
        let new_pos = Pos.parse(data)

        let now = new Date();
        let elapsed_seconds = now.valueOf() - last_update.valueOf();
        last_update = now;

        let speed = distance(player_pos, new_pos) / elapsed_seconds;
        let falling = new_pos.y > player_pos.y;

        if (!falling && speed > 0.1) {
            console.log("too fast !")
            socket.emit('too_fast', player_pos)
            return
        }

        player_pos = new_pos

        for (let xoff = -1; xoff <= 1; xoff++) {
            for (let yoff = -1; yoff <= 1; yoff++) {
                let pos: Pos = {
                    x: new_pos.x + xoff,
                    y: new_pos.y + yoff
                }
                if (game_map.star_at(pos)) {
                    let key = pos_key(pos);
                    if (!collected_stars.has(key)) {
                        collected_stars.add(key);

                        // remove the star

                        let chunk_key = game_map.chunk_key(pos);
                        let block = game_map.block_at(pos);
                        if (block) {
                            block.star = false;
                            block.sprite = undefined;
                        }

                        dirty_chunks.add(chunk_key);

                        updateStars();
                        updateLoadChunks()
                    }
                }
            }
        }

        updateLoadChunks();
    });
});

httpServer.listen(3000);