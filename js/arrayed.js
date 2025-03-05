//[1, 3, 5, 7]
const WIDTH = 5
const HEIGHT = 4
const TENTCOUNT = 5
const MAGICNINE = 9

const pathCount = [4, 3, 3, 2, 3, 2, 2, 1, 3, 2, 2, 1, 2, 1, 1]
const cardinals = [
    [true, true, true, true],
    [true, true, true, false],
    [true, true, false, true],
    [true, true, false, false],
    [true, false, true, true],
    [true, false, true, false],
    [true, false, false, true],
    [true, false, false, false],
    [false, true, true, true],
    [false, true, true, false],
    [false, true, false, true],
    [false, true, false, false],
    [false, false, true, true],
    [false, false, true, false],
    [false, false, false, true]
]

class Game {
    constructor() {
        this.board = new Board()
        this.hand = new Hand()
    }
}

class Board {
    constructor() {
        this.grid = new Tile[WIDTH * HEIGHT]
        this.tentativeSpot = new Tile[TENTCOUNT]
        this.turnCount = 0
    }


    fillTentativeTiles() {
        for (let i = 0; i < TENTCOUNT; i++) {
            this.tentativeSpot.push(this.generateRandomTile('h' + i))
        }
    }

    generateRandomTile(id) {
        let rand = Math.floor(Math.random() * 100) % 15
        let card = cardinals[rand]
        let pathCount = pathCount[rand] + 1
        let wood = Math.floor(Math.random() * 100) % (9 - pathCount)
        let stone = Math.floor(Math.random() * 100) % ((wood == 0) ? (9 - pathCount) : wood)
        let water = Math.floor(Math.random() * 100) % ((stone == 0) ? (9 - pathCount) : stone)
        let grain = Math.floor(Math.random() * 100) % ((water == 0) ? (9 - pathCount) : water)
        console.assert((wood + stone + water + grain + pathCount) == 9)
        return new Tile(id, card, [wood, stone, water, grain])
    }

    placeOnGrid(gridSpot, tentativeTile) {
        //get the Tile from grid:
        let clonedTile = new Tile(gridSpot, tentativeTile.cardinals, tentativeTile.resourceArray);
        console.assert(clonedTile.identification == gridSpot)
        this.grid[gridSpot] == clonedTile
        this.tentativeSpot.remove(tentativeTile)
        console.assert(!this.grid[gridSpot].isEmpty)
    }

    tileIsOnGrid(questionableTile) {
        return (this.grid.indexOf(questionableTile) != -1)
    }
}

class Tile {
    constructor(id, cardinals, resourceArray) {
        this.identification = id
        if (cardinals != null) {
            [this.n, this.w, this.e, this.s] = cardinals
        } else {
            this.n = false
            this.w = false
            this.e = false
            this.s = false
        }
        if (typeof (id) == Number) {
            this.adjacents = [id - WIDTH, id - 1, id + 1, id + WIDTH]
            if (id % WIDTH == 0) this.adjacents[1] = -1
            if (id % WIDTH == (WIDTH - 1)) this.adjacents[2] = -1
            if (id / WIDTH == 0) this.adjacents[0] = -1
            if (id / WIDTH == (HEIGHT - 1)) this.adjacents[3] = -1
        } else {
            this.adjacents = undefined
        }

        this.resources = new Map([['wood', resourceArray.get(0)], ['stone', resourceArray.get(1)],
        ['water', resourceArray.get(2)], ['grain', resourceArray.get(3)]])
    }

    draw() {
        let element = document.createElement('div')
        element.className = 'tile-object'
        for (let i = 0; i < MAGICNINE; i++) {
            let resource = document.createElement('div')
            resource.className = 'tile-resource'
            resource.innerHTML = EMPTYCHAR
            if ([1, 3, 4, 5, 7].includes(i)) {

            }
            if (i == 0) resource.style.borderTopLeftRadius = '5px'
            if (i == 2) resource.style.borderTopRightRadius = '5px'
            if (i == 4) resource.innerHTML = this.id
            if (i == 6) resource.style.borderBottomLeftRadius = '5px'
            if (i == 8) resource.style.borderBottomRightRadius = '5px'

        }
    }

    isEmpty() {
        //Is false if all directions are false
        return (!this.n && !this.w && !this.e && !this.s)
    }

    canPass(proposedSpot, tile) {
        //Given proposed grid position and a tile, can it be placed next to ours?
        if (!this.adjacents.indexOf(proposedSpot)) return false
        if ((this.n == tile.s) || (this.w == tile.e) || (this.e == tile.w) || (this.s == tile.n)) {
            return true
        }
        return false

    }
}