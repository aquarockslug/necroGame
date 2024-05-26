class Syringe extends Phaser.GameObjects.Sprite {

        needle
        fluid = [] // strings describing the fluid in the syringe
        fluidSprites = [] // sprites that fill the Syringe
        corpsePos = { // under the needle
                x: this.x + 20,
                y: this.y + 240
        }
        zombieScale = 0.8
        ready = true

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
                                this.corpsePos.x - 50, this.corpsePos.y, 'rat'
                        ).setScale(this.zombieScale)
                        this.corpse.angle = 180
                }
                this.corpse.visible = true
        }

        async fill(color) {
                const sections = [-30, 15, 60, 105, 150, 195]
                this.fluid.push(color)
                this.fluidSprites.push(this.scene.add.image(this.x + 15,
                        this.y - sections[this.fluid.length - 1],
                        'fluid').setScale(2, 3).setDepth(100))
                if (this.fluid.length >= sections.length) this.fire()
        }

        async fire() {
                this.ready = false
                this.needle.y += 100
                this.zombie = this.createZombie()
                await this.drainFluid()
                this.zombie.visible = true
                this.corpse.visible = false
                this.reset()
        }

        async drainFluid(speed = 100) {
                for (const sprite of this.fluidSprites.reverse()) {
                        await new Promise(r => setTimeout(r, speed))
                        sprite.destroy()
                }
                this.fluidSprites = []
        }

        createZombie(visible = false) {
                const zombie = new Zombie({
                        scene: this.config.scene,
                        x: this.corpsePos.x + 5,
                        y: this.corpsePos.y - 5,
                        texture: 'rat',
                        fluid: this.fluid,
                })
                zombie.visible = visible
                this.fluid = []
                this.scene.add.existing(zombie)
                return zombie
        }

        async reset() {
                this.needle.y -= 100
                await new Promise(r => setTimeout(r, 1000))
                if (this.zombie) this.zombie.display()
                await new Promise(r => setTimeout(r, 500))
                this.loadCorpse()
                this.ready = true
        }

        hasHealthy() {
                if (this.zombie)
                        if (this.zombie.healthy)
                                return true
                return false
        }
}

class Zombie extends Phaser.GameObjects.Sprite {
        constructor(config) {
                super(config.scene, config.x, config.y, config.texture)
                this.inputData = this.parseInputData(config.fluid)
                this.addEffects(this.inputData)
        }

        addEffects(data) {
                // yellow brightens, red darkens, blue glows, green flashes
                const colorFX = this.preFX.addColorMatrix()
                colorFX.brightness(1 + data['yellow'] * 0.2 - data['red'] * 0.2, true)
                this.setScale(0.8 + data['green'] * 0.05 - data['blue'] * 0.05)
                if (data['orange']) this.addGlowFX(10 * data['orange'])
        }

        addGlowFX(strength) {
                if (!strength) return
                this.preFX.setPadding(32);
                this.scene.tweens.add({
                        targets: this.preFX.addGlow('red'),
                        outerStrength: strength,
                        yoyo: true,
                        loop: -1,
                        ease: 'sine.inout'
                });
        }

        parseInputData(fluid) {
                const data = {}
                fluid.forEach((f) => {
                        if (f in data) data[f] += 1
                        else data[f] = 1
                })
                if (!data['yellow']) data['yellow'] = 0
                if (!data['blue']) data['blue'] = 0
                if (!data['red']) data['red'] = 0
                if (!data['green']) data['green'] = 0
                if (!data['orange']) data['orange'] = 0

                if (data['yellow'] == data['red'] &&
                        data['green'] == data['blue'] &&
                        data['orange'] == 0)
                        this.healthy = true

                return data
        }

        display() {
                this.setScale(this.scale / 4)
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
                        plant.on('pointerdown', () => this.outputSyringe.ready ?
                                this.outputSyringe.fill(plant.texture.key) : null
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
