import { Application, Container, Matrix, Point } from "pixi.js";

export class Camera extends Container {

    app: Application
    public cam_scale: number

    constructor(app: Application, cam_scale: number) {
        super()
        this.app = app;
        this.cam_scale = cam_scale;
    }

    centerOn(point: Point) {
        let matrix = Matrix.IDENTITY;
        matrix.translate(
            -point.x,
            -point.y
        )
        matrix.scale(this.cam_scale, this.cam_scale)
        matrix.translate(this.app.screen.width / 2, this.app.screen.height / 2)
        this.setFromMatrix(matrix)
    }
}