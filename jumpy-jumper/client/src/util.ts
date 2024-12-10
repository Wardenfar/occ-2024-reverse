import { FrameObject, Texture } from "pixi.js";

export function texture_set(prefix: string, count: number, time: number): FrameObject[] {
    const textures = [];
    for (let i = 0; i < count; i++) {
        const framekey = `${prefix}-${i}`;
        const texture = Texture.from(framekey);
        texture.source.scaleMode = 'nearest';
        textures.push({ texture, time });
    }
    return textures
}