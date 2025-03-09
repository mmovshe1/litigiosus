//[1, 3, 5, 7]
const WIDTH = 5
const HEIGHT = 5
const TENTCOUNT = 5
const MAGICNINE = 9
const EMPTYCHAR = '‎'

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

const ResourceType = {
    UNDEFINED: -1,
    PATH: 0,
    WOOD: 1,
    WATER: 2,
    GRAIN: 3,
    STONE: 4,
};

const Colors = {
    PATH: "#AFBEB7",
    WOOD: "#A6662E",
    WATER: "#73B7FF",
    GRAIN: "#D49C3F",
    STONE: "#7B93AB",
};


class Game {
    constructor() {
        this.board = new Board()
        // this.hand = new Hand()
    }

    setup() {
        this.board.fillGrid()
        this.board.fillTentativeTiles()
        this.board.draw()
    }
}

class Board {
    constructor() {
        this.grid = new Array() // of Tile
        this.tentativeSpot = new Set() //of Tile
        this.turnCount = 0
    }

    draw() {
        this.drawGrid()
        this.drawTentative()
    }

    drawGrid() {
        let container = document.getElementsByClassName("grid-container")[0]
        console.log(container)
        console.assert(container != undefined)
        this.grid.forEach(space => {
            container.appendChild(space.draw())
        })
    }

    drawTentative() {
        let container = document.getElementsByClassName("path-container")[0]
        console.log(container)
        console.assert(container != undefined)
        this.tentativeSpot.forEach(path => {
            container.appendChild(path.draw())
        })
    }


    fillGrid() {
        for (let i = 0; i < WIDTH * HEIGHT; i++) {
            let tile = new Tile(i, null, Array.from({ length: 9 }, () => ResourceType.UNDEFINED))
            // console.log(tile.toString())
            this.grid.push(tile)
        }
    }


    fillTentativeTiles() {
        for (let i = 0; i < TENTCOUNT; i++) {
            let tile = this.generateRandomTile('h' + i)
            this.tentativeSpot.add(tile)
        }
    }

    findTentativeTileById(id) {
        this.tentativeSpot.forEach((item) => {
            if (item.identification == id) {
                return item
            }
        })
        return undefined;
    }

    /** Create a Random tile
     * @param {*} id tile id
     * @returns {Tile} object
     */
    generateRandomTile(id) {
        let rand = Math.floor(Math.random() * 100) % 15
        let card = cardinals[rand]
        let pathcount = pathCount[rand] + 1
        let wood = Math.floor(Math.random() * 100) % (9 - pathcount)
        let stone = Math.floor(Math.random() * 100) % ((wood == 0) ? (9 - pathcount) : wood)
        let water = Math.floor(Math.random() * 100) % ((stone == 0) ? (9 - pathcount) : stone)
        let grain = 9 - wood - stone - water - pathcount + 1
        console.assert((wood + stone + water + grain + pathcount - 1) == 9)
        let temp = Array.from({ length: wood }, () => ResourceType.WOOD)
        temp = temp.concat(Array.from({ length: stone }, () => ResourceType.STONE))
        temp = temp.concat(Array.from({ length: water }, () => ResourceType.WATER))
        temp = temp.concat(Array.from({ length: grain }, () => ResourceType.GRAIN))
        if (card[0]) temp.splice(1, 0, ResourceType.PATH)
        if (card[1]) temp.splice(3, 0, ResourceType.PATH)
        if (card[2]) temp.splice(5, 0, ResourceType.PATH)
        if (card[3]) temp.splice(7, 0, ResourceType.PATH)
        temp.splice(4, 1, ResourceType.PATH)
        temp = temp.slice(0, 9)
        console.assert(temp.length == 9)
        return new Tile(id, card, temp)
    }

    placeOnGrid(gridSpot, tentativeTile) {
        //get the Tile from grid:
        let clonedTile = new Tile(gridSpot, tentativeTile.cardinals, tentativeTile.resourceMatrix);
        console.assert(clonedTile.identification == gridSpot)
        this.grid[gridSpot] == clonedTile
        this.tentativeSpot.remove(tentativeTile)
        console.assert(!this.grid[gridSpot].isEmpty)
    }

    tileIsOnGrid(questionableTile) {
        return (this.grid.indexOf(questionableTile) != -1)
    }

}
/**
 * this.identification: id number
 * this.n ---
 * this.w   cardinal directions
 * this.e   true/ false
 * this.s ---
 * this.adjacents = [Num, Num, Num, Num] ids of adjacent tiles.
 */
class Tile {
    constructor(id, cardinals, resourceMatrix) {
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
        this.resourceMatrix = resourceMatrix
        //this.tileClicked = this.tileClicked.bind(this)
        this.active = false
    }

    // tileClicked = e => {
    //     console.log('TILE CLICKED!')
    //     console.log(e.target.id)

    //     if (e.target.id[0] === 'h') {
    //         console.log('path tile selected!')
    //     } else {
    //         console.log('grid tile selected!')
    //     }
    //     return
    // }

    toString() {
        let str = ''
        str += (this.w) ? '╸' : ''
        str += (this.n) ? '╹' : ''
        str += (this.s) ? '╻' : ''
        str += (this.e) ? '╺' : ''
        if (str === '') str += 'EMPTY'
        str += '\n'
        str += this.resourceMatrix.slice(0, 3) + '\n' + this.resourceMatrix.slice(3, 6) + '\n' + this.resourceMatrix.slice(6, 9) + '\n'
        // if (this.resources != undefined) str += JSON.stringify(Object.fromEntries(this.resources)) + '\n'
        console.assert(this.identification != str)
        return str
    }

    draw() {
        let element = document.createElement('div')
        element.className = 'grid-cell'
        element.id = this.identification
        this.resourceMatrix.forEach((res) => {
            let resource = document.createElement('div')
            resource.className = 'resource-unit'
            resource.innerHTML = '.'
            if (res === ResourceType.PATH) {
                resource.style.backgroundColor = Colors.PATH
                resource.innerHTML = EMPTYCHAR
            }
            if (res === ResourceType.WOOD) resource.style.backgroundColor = Colors.WOOD
            if (res === ResourceType.WATER) resource.style.backgroundColor = Colors.WATER
            if (res === ResourceType.GRAIN) resource.style.backgroundColor = Colors.GRAIN
            if (res === ResourceType.STONE) resource.style.backgroundColor = Colors.STONE
            if (res === ResourceType.UNDEFINED) resource.innerHTML = '*'
            element.appendChild(resource)
        })
        // element.addEventListener("click", this.tileClicked)
        element.addEventListener("click", tileClicked)
        return element;
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

let activeSpot = null
let activeTile = null

const tileClicked = e => {
    console.log('TILE CLICKED!')
    console.log(e.target.id)

    e.target.style.border = '3px solid blue'

    if (e.target.id[0] === 'h') {
        console.log('path tile selected!')
        activeTile = [e.target, game.board.findTentativeTileById(e.target.id)]
        console.log(activeTile[0], activeTile[1])
    } else {
        console.log('grid tile selected!')
        let id = parseInt(e.target.id)
        activeSpot = [e.target, game.board.grid.at(id)]
        console.log(activeSpot)
    }
    return
}

let game = new Game()
game.setup()
