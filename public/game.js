class Necro extends Phaser.Scene {
        preload() {
                this.load.image('flower', 'flower.png')
        }
        create() {
                const garden = new Garden({
                        scene: this,
                        x: config.width / 4,
                        y: config.height / 4,
                        texture: 'flower'
                })
        }
}

class Garden extends Phaser.GameObjects.Sprite {
        boxes = []
        spots = []
        plants = []

        constructor(config) {
                super(config.scene, config.x, config.y, config.texture)
                this.createBoxes()
                this.spots.forEach((spot) => this.plants.push(
                        this.scene.add.image(spot.x, spot.y, 'flower')))
                this.plants.forEach((plant) => plant.setScale(0.1))
        }

        createBoxes(width = 3, height = 3) {
                let pushRect = (x, y) => {
                        const boxPos = [this.x + x * 100, this.y + y * 100, 100, 100]
                        this.boxes[x][y] = new Phaser.Geom.Rectangle(...boxPos);
                        this.spots.push({
                                x: this.boxes[x][y].centerX,
                                y: this.boxes[x][y].centerY,
                        })
                }
                for (let x = 0; x < width; x++) {
                        this.boxes[x] = [];
                        for (let y = 0; y < height; y++)
                                pushRect(x, y)
                }
        }
}

const config = {
        width: 800,
        height: 600,
        backgroundColor: '#009A17',
        type: Phaser.AUTO,
        scene: Necro
};

const game = new Phaser.Game(config);
