import { AnimatedSprite, Container, Point } from "pixi.js";
import { texture_set } from "./util";
import { GameMap } from "common";

const WALK_SPEED = 0.15;
const JUMP_FORCE = 0.4;
const GRAVITY = 0.025;

export class Player {
    container: Container

    idle_sprite: AnimatedSprite
    walk_sprite: AnimatedSprite
    jump_sprite: AnimatedSprite
    sprites: AnimatedSprite[]

    y_velocity: number

    game_map: GameMap

    public constructor(world: Container, game_map: GameMap) {
        this.game_map = game_map;
        this.y_velocity = 0;

        const idle_textures = texture_set("idle", 4, 200);
        const walk_textures = texture_set("walk", 6, 100);
        const jump_textures = texture_set("jump", 8, 100);

        this.container = new Container({
            isRenderGroup: false,
        })

        this.idle_sprite = new AnimatedSprite(idle_textures);
        this.idle_sprite.play()

        this.walk_sprite = new AnimatedSprite(walk_textures);
        this.walk_sprite.play()

        this.jump_sprite = new AnimatedSprite(jump_textures);

        this.sprites = [this.idle_sprite, this.walk_sprite, this.jump_sprite];
        this.sprites.forEach(s => {
            s.anchor = { x: 0.5, y: 1 }
        })

        this.container.x = 0;
        this.container.y = 0;

        this.container.addChild(this.idle_sprite);
        this.container.addChild(this.walk_sprite);
        this.container.addChild(this.jump_sprite)

        const width = 16;
        const height = 32;

        this.container.scale = Math.min(
            height / width,
            width / height
        ) / 10;

        world.addChild(this.container);
    }

    get position(): Point {
        return this.container.position
    }

    set position(pos: Point) {
        this.container.position = pos
    }

    public update(delta_time: number, keydown_set: Set<string>) {
        let moving = false;

        let block_x = Math.floor(this.container.x);
        let block_y = Math.floor(this.container.y);

        let wall_below = this.game_map.wall_at(new Point(block_x, block_y));
        let wall_above = this.game_map.wall_at(new Point(block_x, block_y - 1));
        let wall_left = this.game_map.wall_at(new Point(block_x - 1, block_y - 1));
        let wall_right = this.game_map.wall_at(new Point(block_x + 1, block_y - 1));

        let in_air = !wall_below

        if (!in_air && keydown_set.has("ArrowUp")) {
            keydown_set.delete("ArrowUp")
            this.y_velocity = -JUMP_FORCE
            in_air = true;
            this.jump_sprite.gotoAndStop(3);
        }

        if (wall_above) {
            this.container.y = Math.max(this.container.y, block_y + 1)
            if (this.y_velocity < 0) {
                this.y_velocity = 0;
            }
        }

        this.container.y += this.y_velocity * delta_time;
        this.y_velocity += GRAVITY;

        if (!in_air) {
            this.y_velocity = 0;
            this.container.y = block_y;
        }

        if (keydown_set.has("ArrowRight")) {
            this.container.x += WALK_SPEED * delta_time;

            if (wall_right) {
                this.container.x = Math.min(this.container.x, block_x + 0.6);
            }

            moving = true

            this.sprites.forEach(s => {
                s.updateTransform({
                    scaleX: 1
                })
            })
        }

        if (keydown_set.has("ArrowLeft")) {
            this.container.x -= WALK_SPEED * delta_time;

            if (wall_left) {
                this.container.x = Math.max(this.container.x, block_x + 0.4);
            }

            moving = true

            this.sprites.forEach(s => {
                s.updateTransform({
                    scaleX: -1
                })
            })
        }

        this.sprites.forEach(s => {
            s.visible = false;
        })

        if (in_air) {
            this.jump_sprite.visible = true;

            if (this.y_velocity < 0) {
                this.jump_sprite.gotoAndStop(4)
            } else {
                this.jump_sprite.gotoAndStop(6)
            }
        } else {
            if (moving) {
                this.walk_sprite.visible = true;
            } else {
                this.idle_sprite.visible = true;
            }
        }
    }
}
