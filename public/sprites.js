class Syringe extends Phaser.GameObjects.Sprite {

        needle
        fluid = [] // strings describing the fluid in the syringe
        fluidSprites = [] // sprites that fill the Syringe
        corpsePos = { // under the needle
                x: this.x + 15,
                y: this.y + 240
        }
        zombieScale = 0.6

        constructor(config) {
                super(config.scene, config.x, config.y, config.texture)
                this.config = config
                this.needle = this.scene.add.image(
                        this.corpsePos.x, this.y + 50, 'needle')
                this.loadCorpse()
        }

        loadCorpse() {
                if (!this.corpse) {
                        this.corpse = this.scene.add.image(
                                this.corpsePos.x - 25, this.corpsePos.y, 'rat'
                        ).setScale(this.zombieScale)
                        this.corpse.angle = 180
                }
                this.corpse.visible = true
        }

        async fill(color) {
                const sections = [-30, 30, 90, 150, 210]
                this.fluid.push(color)
                this.fluidSprites.push(this.scene.add.image(this.x + 15,
                        this.y - sections[this.fluid.length - 1],
                        'fluid').setScale(2, 4).setDepth(100))
                if (this.fluid.length >= sections.length) this.fire()
        }

        async fire() {
                this.needle.y += 100
                this.zombie = this.createZombie()
                await this.drainFluid()
                this.zombie.visible = true
                this.corpse.visible = false
                await new Promise(r => setTimeout(r, 500))
                this.reset()
        }

        async drainFluid() {
                for (const sprite of this.fluidSprites.reverse()) {
                        await new Promise(r => setTimeout(r, 250))
                        sprite.destroy()
                }
                this.fluidSprites = []
        }

        createZombie(visible = false) {
                const zombie = new Zombie({
                        scene: this.config.scene,
                        x: this.corpsePos.x,
                        y: this.corpsePos.y,
                        texture: 'rat',
                        fluid: this.fluid,
                }).setScale(this.zombieScale)
                zombie.visible = visible
                this.fluid = []
                this.scene.add.existing(zombie)
                return zombie
        }

        reset() {
                if (this.zombie) this.zombie.display()
                this.needle.y -= 100
                this.loadCorpse()
        }
}

class Zombie extends Phaser.GameObjects.Sprite {
        constructor(config) {
                super(config.scene, config.x, config.y, config.texture)
                this.inputData = this.parseInput(config.fluid)
                this.addEffects(this.inputData)
        }

        addEffects(data) {
                console.log(data)
                const colorFX = this.preFX.addColorMatrix()
                if (data['yellow']) colorFX.brightness(1 - data['yellow'] * 0.2, true)
                if (data['blue']) colorFX.contrast(data['blue'], true)
                if (data['red']) this.addGlowFX(10 * data['red'])
        }

        addGlowFX(strength) {
                this.preFX.setPadding(32);
                this.scene.tweens.add({
                        targets: this.preFX.addGlow(),
                        outerStrength: strength,
                        yoyo: true,
                        loop: -1,
                        ease: 'sine.inout'
                });
        }

        parseInput(fluid) {
                const fluidData = {}
                fluid.forEach((f) => {
                        if (f in fluidData) fluidData[f] += 1
                        else fluidData[f] = 1
                })
                return fluidData
        }

        display() {
                this.setScale(0.25)
                this.setRandomPosition(50, 400, 325, 175)
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
                        plant.setScale(0.075)
                        plant.setInteractive()
                        const fx = plant.preFX.addColorMatrix()
                        plant.on('pointerover', () => fx.brightness(1.5))
                        plant.on('pointerout', () => fx.brightness(1))
                        plant.on('pointerdown', () =>
                                this.outputSyringe.fill(plant.texture.key)
                        )
                })
                return newPlants
        }

        createBoxes(width = 3, height = 2, i = 0) {
                let pushRectCenter = (x, y) => {
                        this.boxes[x][y] = new Phaser.Geom.Rectangle(
                                this.x / 4 + 37 + x * 100,
                                this.y / 4 - 20 + y * 100,
                                100, 100);
                        this.plants.push({
                                x: this.boxes[x][y].centerX,
                                y: this.boxes[x][y].centerY,
                                texture: this.plantTextures[i++]
                        })
                }
                for (let x = 0; x < width; x++) {
                        this.boxes[x] = [];
                        for (let y = 0; y < height; y++)
                                pushRectCenter(x, y)
                }
        }
}
