import { Camera } from './camera';
import { Player } from './player';
import './style.css'
import tileset from './tileset.json'

import { Application, Assets, Container, Matrix, Point, Sprite, Text } from 'pixi.js';
import { io } from "socket.io-client"
import { Chunk, GameMap, Pos, pos_key, StarCount, StartData } from 'common';
import { AsciiFilter } from 'pixi-filters';

async function main() {
    // DEV : const socket = io("http://localhost:3000");
    const socket = io();

    const app = new Application();

    async function setup() {
        await app.init({
            background: '#111',
            resizeTo: window,
        });

        document.body.appendChild(app.canvas);
    }

    async function preload() {
        const assets = [
            { alias: 'pink_idle', src: 'pink_idle.json' },
            { alias: 'pink_walk', src: 'pink_walk.json' },
            { alias: 'pink_jump', src: 'pink_jump.json' },
        ];

        tileset.tiles.forEach(t => {
            assets.push({
                alias: `tile_${t.id}`,
                src: `tileset/${t.image}`
            })
        })

        await Assets.load(assets);
    }

    await setup();
    await preload();

    const min_scale = 60
    const max_scale = 120
    const camera = new Camera(app, min_scale);
    const world = new Container();
    const game_map = new GameMap();

    var start = false;

    camera.addChild(world);
    app.stage.addChild(camera);

    let star_ui = new Sprite(Assets.get("tile_35"))
    star_ui.scale = 0.25
    star_ui.anchor = 0.5
    star_ui.x = app.screen.width - 20
    star_ui.y = 20
    app.stage.addChild(star_ui)

    let star_count = new Text()
    star_count.style.fill = '#fcba03'
    star_count.text = "0/0"
    star_count.anchor.x = 1
    star_count.anchor.y = 0.5
    star_count.x = app.screen.width - 50
    star_count.y = 20
    app.stage.addChild(star_count)

    const player = new Player(world, game_map);
    const keydown_set = new Set<string>();

    addEventListener('keydown', (ev) => {
        keydown_set.add(ev.key);
    })
    addEventListener('keyup', (ev) => {
        keydown_set.delete(ev.key);
    })

    addEventListener("wheel", (ev) => {
        let up = ev.deltaY < 0
        if (up) {
            camera.cam_scale = camera.cam_scale * 1.2
        } else {
            camera.cam_scale = camera.cam_scale * 0.8
        }

        if (camera.cam_scale < min_scale) {
            camera.cam_scale = min_scale
        }

        if (camera.cam_scale > max_scale) {
            camera.cam_scale = max_scale
        }

        socket.emit("zoom", app.screen.width / camera.cam_scale);

        camera.centerOn(player.position)
    });

    app.ticker.add((time) => {
        if (start) {
            player.update(time.deltaTime, keydown_set)
        }
        camera.centerOn(player.position)
    });

    let millis = 0;
    app.ticker.add(time => {
        millis += time.elapsedMS;

        if (millis > 100 && start) {
            millis = 0;

            let pos: Pos = {
                x: player.position.x,
                y: player.position.y
            }
            socket.emit("pos", pos)
        }
    })

    let loaded_chunks = new Map<string, Container>();

    socket.on("start", (data: StartData) => {
        player.position = new Point(data.pos.x, data.pos.y)
        camera.centerOn(player.position)
        start = true;
    })

    socket.on("too_fast", (data: Pos) => {
        console.log("too fast !")
        player.position = new Point(data.x, data.y)
    })

    socket.on("flag", (data: string) => {
        alert(data)
    })

    socket.on("chunk", (data) => {
        let chunk = data as Chunk;
        let chunk_obj = new Container();

        chunk_obj.x = chunk.pos.x << 4;
        chunk_obj.y = chunk.pos.y << 4;

        game_map.add_chunk(chunk);

        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                let block = chunk.blocks[y * 16 + x];

                if (block.sprite) {
                    const sprite = new Sprite(Assets.get(`tile_${block.sprite}`));

                    let matrix = Matrix.IDENTITY;
                    matrix.translate(-sprite.width / 2, -sprite.height / 2)
                    matrix.scale(1 / sprite.width, 1 / sprite.height)
                    matrix.rotate((block.rotation ?? 0) / 64 * Math.PI)
                    matrix.translate(0.5, 0.5)
                    matrix.translate(x, y)

                    sprite.setFromMatrix(matrix)

                    chunk_obj.addChild(sprite);
                }
            }
        }

        world.addChild(chunk_obj);
        loaded_chunks.set(pos_key(chunk.pos), chunk_obj);
    })

    socket.on("unload-chunk", (pos: Pos) => {
        let key = pos_key(pos);
        let chunk_obj = loaded_chunks.get(key);
        if (chunk_obj) {
            world.removeChild(chunk_obj)
        }
        loaded_chunks.delete(key)
        game_map.remove_chunk(pos);
    })

    socket.on("stars", (data: StarCount) => {
        star_count.text = `${data.collected}/${data.total}`
    })

    socket.emit("ready")
}

addEventListener('DOMContentLoaded', () => {
    main()
})