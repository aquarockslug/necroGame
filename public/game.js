class Necro extends Phaser.Scene {

        plantTextures = [
                'red', 'green', 'blue',
                'red', 'green', 'blue',
        ]

        preload() {
                this.load.image('red', 'red.png')
                this.load.image('green', 'green.png')
                this.load.image('blue', 'blue.png')
                this.load.image('syringe', 'machine.png')
                this.load.image('needle', 'needle.png')
                this.load.image('room', 'room.png')
                this.load.image('fluid', 'fluid.png')
        }

        create() {
                const syringe = new Syringe({
                        scene: this,
                        x: config.width - config.width / 8,
                        y: config.height / 2,
                        texture: 'syringe',
                        plantTextures: this.plantTextures
                }).setScale(2)
                const garden = new Garden({
                        scene: this,
                        x: config.width / 2,
                        y: config.height / 2,
                        texture: 'room',
                        outputSyringe: syringe,
                        plantTextures: this.plantTextures
                })
                this.add.existing(syringe)
                this.add.existing(garden)
        }
}

class Syringe extends Phaser.GameObjects.Sprite {

        needle
        fluid = []
        fluidSprites = []
        maxSize = 5
        sections = [-30, 30, 90, 150, 210]

        constructor(config) {
                super(config.scene, config.x, config.y, config.texture)
                this.config = config
                this.needle = this.scene.add.image(this.x + 15, this.y + 50, 'needle')
        }

        fill(color) {
                if (this.fluid.length >= this.maxSize) {
                        this.fire()
                        return
                }
                this.fluid.push(color)
                this.addFluid()
        }

        addFluid() {
                const yPos = this.y - this.sections[this.fluid.length - 1]
                this.fluidSprites.push(this.scene.add.image(this.x + 15, yPos, 'fluid')
                        .setScale(2, 4).setDepth(100))
        }

        fire() {
                this.fluidSprites.forEach((s) => s.destroy(true))
                this.needle.y += 100
                const zombie = new Zombie({
                        scene: this.config.scene,
                        x: config.width / 2,
                        y: config.height - config.height / 8,
                        texture: '',
                        fluid: this.fluid
                })
        }
}

class Zombie extends Phaser.GameObjects.Sprite {
        constructor(config) {
                super(config.scene, config.x, config.y, config.texture)
                console.log(this.parseFluids(config.fluid))
        }

        parseFluids(fluid) {
                return fluid
        }
}

class Garden extends Phaser.GameObjects.Sprite {
        boxes = []
        plants = []

        constructor(config) {
                super(config.scene, config.x, config.y, config.texture)
                this.plantTextures = config.plantTextures
                this.outputSyringe = config.outputSyringe
                this.plants = this.createPlants()
        }

        createPlants() {
                this.createBoxes()
                let newPlants = []
                this.plants.forEach((plant) => newPlants.push(
                        this.scene.add.image(plant.x, plant.y, plant.texture).setDepth(100)
                ))
                newPlants.forEach((plant) => {
                        plant.setScale(0.1)
                        plant.setInteractive()
                        plant.on('pointerdown', () =>
                                this.outputSyringe.fill(plant.texture.key)
                        )
                })
                return newPlants
        }

        createBoxes(width = 3, height = 2) {
                let i = 0
                let pushRect = (x, y) => {
                        const boxPos = [this.x / 4 + x * 100, this.y / 4 + y * 100]
                        this.boxes[x][y] =
                                new Phaser.Geom.Rectangle(...boxPos, 100, 100);
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
        backgroundColor: '#405fa0',
        type: Phaser.AUTO,
        scene: Necro
};

const game = new Phaser.Game(config);
