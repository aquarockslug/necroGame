class Necro extends Phaser.Scene {

        plantTextures = [
                'red', 'green', 'blue',
                'red', 'green', 'blue',
                'red', 'green', 'blue'
        ]

        preload() {
                this.load.image('red', 'red.png')
                this.load.image('green', 'green.png')
                this.load.image('blue', 'blue.png')
        }

        create() {
                const garden = new Garden({
                        scene: this,
                        x: config.width / 4,
                        y: config.height / 4,
                        plantTextures: this.plantTextures
                })
        }
}

class Garden extends Phaser.GameObjects.Sprite {
        boxes = []
        plants = []

        constructor(config) {
                super(config.scene, config.x, config.y, config.texture)
                this.plantTextures = config.plantTextures
                this.createBoxes()
                this.plants = this.createPlants()
                console.log(this.plants)
        }

        createPlants() {
                let newPlants = []
                this.plants.forEach((plant) => newPlants.push(
                        this.scene.add.image(plant.x, plant.y, plant.texture)
                ))
                newPlants.forEach((plant) => {
                        plant.setScale(0.1)
                        plant.setInteractive()
                        plant.on('pointerdown', () => {
                                // syringe.fill(plant.texture)
                                console.log(plant.texture.key)
                        })
                })
                return newPlants
        }

        createBoxes(width = 3, height = 3) {
                let i = 0
                let pushRect = (x, y) => {
                        const boxPos = [this.x + x * 100, this.y + y * 100, 100, 100]
                        this.boxes[x][y] = new Phaser.Geom.Rectangle(...boxPos);
                        this.plants.push({
                                x: this.boxes[x][y].centerX,
                                y: this.boxes[x][y].centerY,
                                texture: this.plantTextures[i]
                        })
                        i++
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
