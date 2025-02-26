
const INVISIBLE_COLOR = '#ffffff00';
const SELECTED_COLOR = 'blue';
const GRID_CELL_COLOR = '#8ac1d1';
const GRID_INVALID_COLOR = '#97bac4';
const PATH_COLOR = '#bcab90';
const EMPTYCHAR = '¤';
const WIDTH = 5;
const HEIGHT = 4;
let cellCount = WIDTH * HEIGHT;

//These are all direction combinations for the 15 different path tiles
//array of sets! should be!
const shallowPathsDirections = [[1, 5, 7], [3, 5, 7], [1, 3, 5], [1, 3, 7], [1, 3], [1, 5], [3, 7], [5, 7], [1, 7], [3, 5], [1, 3, 5, 7], [1], [3], [5], [7]];

const directionMap = new Map([
    [[1, 3, 5, 7], [true, true, true, true]],
    [[1, 3, 5], [true, true, true, false]],
    [[1, 3, 7], [true, true, false, true]],
    [[1, 3], [true, true, false, false]],
    [[1, 5, 7], [true, false, true, true]],
    [[1, 5], [true, false, true, false]],
    [[1, 7], [true, false, false, true]],
    [[1], [true, false, false, false]],
    [[3, 5, 7], [false, true, true, true]],
    [[3, 5], [false, true, true, false]],
    [[3, 7], [false, true, false, true]],
    [[3], [false, true, false, false]],
    [[5, 7], [false, false, true, true]],
    [[5], [false, false, true, false]],
    [[7], [false, false, false, true]]
]);


// class Game {
//     constructor() {
//         this.selectedBoardTile = null;
//         this.selectedHandPath = null;
//         this.myBoard = new Board(WIDTH)
//     }
// }

class Hand {
    constructor(capacity) {
        this.capacity = capacity;
        this.tiles = new Map();
        this.lastId = 0;
    }
    fillHand() {
        let handContainer = document.getElementsByClassName('hand-container')[0];
        if (handContainer == null) console.log('handContainer is null FIX');
        for (let i = 0; i < 5; i++) {
            let id = 'hand' + this.lastId;
            //generate a random path 
            let path = generateRandomPathTileObj();
            if (path.owned) console.log('path is owned! ERROR!')
            let p = path.createDOMElement(id);
            handContainer.appendChild(p);
            this.lastId++;
            this.tiles.set(id, path);
        }
        console.log('hand filled!')
    }
}
/**
 * Function for button.
 * @param {Hand} handObj 
 */
const fillHand = (handObj) => {
    let handContainer = document.getElementsByClassName('hand-container')[0];
    if (handContainer == null) console.log('handContainer is null FIX');
    for (let i = 0; i < 5; i++) {
        //generate a random path 
        let path = generateRandomPathTileObj();
        if (path.owned) console.log('path is owned! ERROR!')
        let id = 'hand' + handObj.lastId;
        let p = path.createDOMElement(id);
        handContainer.appendChild(p);
        handObj.lastId++;
        handObj.tiles.set(id, path);
    }
}


class Board {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.size = this.width * this.height;
        this.emptyTiles = new Map(); //id | Tile Obj
        this.myTiles = new Map();    //id | Path /Tile Obj
        this.myTurn = 0;
    }

    /**
     * Create board with empty tiles. 
     * @returns {HTMLDivElement} with grid of empty tiles.
     */
    createDOMElement() {
        let gridContainer = document.getElementsByClassName('grid-container')[0];
        if (gridContainer == null) console.log('grid container is null FIX');
        for (let i = 0; i < this.size; i++) {
            let boardTile = new Tile(false, i, true);
            let tileElement = boardTile.createDOMElement();
            //console.log("tileElement is? " + tileElement)
            gridContainer.appendChild(tileElement);
            this.emptyTiles.set(i, boardTile);
        }
        return gridContainer;
    }

    /**
     * Find the DOM element with this id
     * @param {Number} id 
     * @returns {HTMLDivElement} if found | None otherwise.
     */
    findBoardTile(id) {
        return document.getElementById(id);
    }
}

/**
 * Each handTile has an array of directions (from shallowPathsDirections)
 * Once a handTile --> placedTile, the directions --> neighbor ids
 * 
 * Board has: WIDTH*HEIGHT placedTiles at position marked by an index.
 * placedTile:
 *      id = 'b' + i.toString() //this to find the div easier
 *      position = i
 *      directions = new Set([])
 *      adjacents = [i-1, i+1, i-WIDTH, i+WIDTH] //just boundary rules
 *      isEmpty() return directions.size == 0
 *      fill(handTile) :
 *          directions = handTile.directions
 * 
 * handTile:
 *      id = ? //No id for hand tiles
 *      position = null
 *      directions = new Set([1, 3, 5]) //definied in initialization.
 *      adjacents = [-WIDTH, -1, 1] //from directions
 *      isPlaced() return position !== null 
 *          
 */


class Tile {
    constructor(owned = false, id, empty = true) {
        this.owned = owned;
        this.id = id; //div id
        this.empty = empty;
        this.south = false;
        this.north = false;
        this.east = false;
        this.west = false;
    }

    print() {
        let str = "[owned:" + this.owned + "\nid:" + this.id + "\nempty:" + this.empty + "\nnorth:" + this.north
        str += "\nwest:" + this.west + "\neast:" + this.east + "\nsouth:" + this.south + "]"
        console.log(str)
    }

    createDOMElement() {
        let tile = document.createElement('div');
        tile.className = 'grid-cell board-cell';
        tile.id = this.id;
        for (let i = 0; i < 9; i++) {
            let subCell = document.createElement('div');
            subCell.className = 'resource-unit';
            if (i == 4) {
                subCell.style.color = 'black';
                subCell.innerHTML = this.id;
            } else {
                subCell.style.color = 'white';
                subCell.innerHTML = EMPTYCHAR;
            }
            subCell.style.backgroundColor = GRID_CELL_COLOR;
            if (i == 0) subCell.style.borderTopLeftRadius = '5px'
            if (i == 2) subCell.style.borderTopRightRadius = '5px'
            if (i == 6) subCell.style.borderBottomLeftRadius = '5px'
            if (i == 8) subCell.style.borderBottomRightRadius = '5px'
            tile.appendChild(subCell);
        }
        tile.addEventListener('click', boardTileSelected);
        tile.style.borderRadius = '7px'
        //console.log(tile==null);
        return tile;
    }

    replacePossible(otherTile) {
        return ((this.north == otherTile.north) || (this.south == otherTile.south) ||
            (this.east == otherTile.east) || (this.west == otherTile.west))
    }

}

const replacePossible = (target, replace) => {
    if (target == undefined) return true;
    return ((target.north == replace.north) || (target.south == replace.south) ||
        (target.east == replace.east) || (target.west == replace.west))
}

/**
 * Tile with a path on it. 
 * Calculate resources on it after placing in hand.
 */
class Path extends Tile {
    /**
     * 
     * @param {boolean} owned : placed on board or left in hand
     * @param {List<boolean>} cardinals : [n,w,e,s]
     * @param {Array} directions: set of indices for the directions.
     */
    constructor(owned, cardinals, directions) {
        super(owned, null, false);
        this.owned = owned;
        this.directions = directions;
        //console.log('cardinals ' + cardinals)
        this.south = cardinals[3]; //true/false
        this.west = cardinals[1];
        this.east = cardinals[2];
        this.north = cardinals[0];
        this.neighbors = {};
        this.resources = { 'g': 0, 's': 0, 'w': 0, 't': 0, 'p': 0 };
    }

    /** Create a DOM element with the given path
     * @param {String} id - not required.
     * @returns {HTMLDivElement} element: this is a hand cell.
     */
    createDOMElement(id) {
        let container = document.createElement('div');
        container.className = 'grid-cell hand-cell';
        container.id = id;
        container.style.borderRadius = '7px'
        this.id = id; //
        this.owned = false;
        for (let i = 0; i < 9; i++) {
            let unit = document.createElement('div');
            unit.className = 'resource-unit';
            if ((this.directions.includes(i)) || (i == 4)) {
                unit.style.backgroundColor = PATH_COLOR;
                unit.innerHTML = '.';
                unit.style.borderRadius = '0px'
            } else {
                unit.innerHTML = EMPTYCHAR;
                if (i == 0) unit.style.borderTopLeftRadius = '5px'
                if (i == 2) unit.style.borderTopRightRadius = '5px'
                if (i == 6) unit.style.borderBottomLeftRadius = '5px'
                if (i == 8) unit.style.borderBottomRightRadius = '5px'
            }
            container.appendChild(unit);
        }
        if (this.owned) {
            container.addEventListener('click', boardTileSelected);
        } else {
            container.addEventListener('click', handTileSelected);
        }
        return container;
    }

    /**
     * 
     * @param {Board} boardObj myBoard 
     * @param {Tile} adjacentTile : adjacent tile Object
     * @param {Number} adjacentId : adjacent tile id
     * @returns 
     */
    updateAdjacentTileIfPossible(boardObj, adjacentTile, adjacentId) {
        //adjacentTile = boardObj.emptyTiles.get(adjacentId);
        if (!this.owned) {
            console.log('PATH not OWNED')
            return;
        }
        if ((this.id - boardObj.width == adjacentId) && this.north) {
            adjacentTile[south] = true;
        }
        if ((this.id + boardObj.width == adjacentId) && this.south) {
            adjacentTile[north] = true;
        }
        if ((this.id - 1 == adjacentId) && ((this.id % boardObj.width) != 0) && this.west) {
            adjacentTile[east] = true;
        }
        if ((this.id + 1 == adjacentId) && (((this.id + 1) % boardObj.width) != 0) && this.east) {
            adjacentTile[west] = true;
        }
        console.log(adjacentTile.print())
        return;
    }

    /**
     * Check if given path is adjacent to this one.
     * @param {Path} otherPath 
     * @returns {boolean} true if adjacent | false if not adjacent.
     */
    pathAdjacent(otherPath) {
        if ((this.south && otherPath.north)) {
            console.log('adj south')
            return true
        } else if ((this.east && otherPath.west)) {
            console.log('adj east')
            return true
        } else if ((this.west && otherPath.east)) {
            console.log('adj west')
            return true
        } else if ((this.north && otherPath.south)) {
            console.log('adj north')
            return true
        }
        // if ((this.south && otherPath.north) || (this.east && otherPath.west) ||
        //     (this.west && otherPath.east) || (this.north && otherPath.south)) {
        //     return true;
        // }
        console.log('path adjacent with ' + otherPath)
        return false;
    }


    spaceAdjacent(boardObj, newBoardId, id) {
        console.assert(boardObj != undefined)
        if (this.id == undefined) console.error('ERROR: ID NOT SET')
        this.id = newBoardId;
        //console.log('this.id is ' + this.id)
        //console.log('north is ' + (this.id - boardObj.width) + " vs " + id)
        //console.log('west is ' + (this.id - 1) + " vs " + id)
        //console.log('east is ' + (this.id + 1) + " vs " + id)
        //console.log('south is ' + (this.id + boardObj.width) + " vs " + id)
        if (((this.id - boardObj.width) == id) && this.north) return true;
        if (((this.id + boardObj.width) == id) && this.south) return true
        if (((this.id - 1) == id) && ((this.id % boardObj.width) != 0) && this.west) return true
        if (((this.id + 1) == id) && (((this.id + 1) % boardObj.width) != 0) && this.east) return true
        return false;
    }

    emptyTileAdjacent(boardObj, id, tileObj) {
        if (this.id == undefined) console.error('ERROR: ID NOT SET')
        if ((this.id - boardObj.width == id) && this.north) {
            tileObj.south = true;
            return true;
        }
        if ((this.id + boardObj.width == id) && this.south) {
            tileObj.north = true
            return true
        }
        if ((this.id - 1 == id) && ((this.id % boardObj.width) != 0) && this.west) {
            tileObj.east = true;
            return true
        }
        if ((this.id + 1 == id) && (((this.id + 1) % boardObj.width) != 0) && this.east) {
            tileObj.west = true
            return true
        }
        return false;
    }
}

/**
 * Generate a random path object with directions saved within.
 * @returns {Path} obj or null if error
 */
function generateRandomPathTileObj() {
    let randomValue = Math.floor(Math.random() * 100) % 15;
    //get random data from directionMap:
    let i = 0;
    for (const key of directionMap.keys()) {
        if (i == randomValue) {
            let value = directionMap.get(key);
            let path = new Path(false, value, key);
            return path;
        }
        i++;
    }
    return null;

}
/**
 * Generate Add More button for Hand 
 * @param {Hand} handObj for button functionality
 */
function setupAddMoreButton(handObj) {
    let body = document.body;
    let button = document.createElement('button');
    button.id = 'hand-add-button';
    button.innerHTML = 'Add More';
    button.addEventListener('click', function () {
        fillHand(handObj)
    });
    document.body.appendChild(button);
}


let selectedHandPath = null;
let selectedBoardTile = null;

/**
 * 
 * @param {Tile} selectedDiv : board/hand tile
 * @param {boolean} board : flag for whether we deal with selectedBoardTile or selectedHandPath globals.
 * @returns 
 */
const selectedTileOutline = (selectedDiv, board) => {
    let previouslySelected = (board) ? selectedBoardTile : selectedHandPath;
    if (selectedDiv == previouslySelected) {
        console.log('330:DESELECT')
        selectedDiv.style.borderColor = INVISIBLE_COLOR
        if (board) {
            selectedBoardTile = null;
        } else {
            selectedHandPath = null;
        }
    } else if (previouslySelected == null) {
        console.log('334:SELECT')
        if (board) {
            selectedBoardTile = selectedDiv
            selectedBoardTile.style.borderColor = SELECTED_COLOR
        } else {
            selectedHandPath = selectedDiv
            selectedHandPath.style.borderColor = SELECTED_COLOR
        }
    } else {
        console.log('334:RESELECT')
        if (board) {
            selectedBoardTile.style.borderColor = INVISIBLE_COLOR
            selectedBoardTile = selectedDiv;
        } else {
            selectedHandPath.style.borderColor = INVISIBLE_COLOR
            selectedHandPath = selectedDiv;
        }
        selectedDiv.style.borderColor = SELECTED_COLOR
    }
    return
}

const deselect = (selectedDiv) => {
    console.log('368:DESELECT')
    selectedDiv.style.borderColor = INVISIBLE_COLOR
}

/**
 * Select board tile (`empty` one) to replace with something else.
 * @param {*} e click Event 
 * @returns 
 */
const boardTileSelected = e => {
    //locate the div selected and flip its colors
    let selectedDiv = e.target;
    let selectedTileId = parseInt(selectedDiv.id)
    console.log('board tile id:' + selectedDiv.id)
    if (selectedHandPath == null) {
        console.log('SELECT HAND TILE FIRST')
        selectedBoardTile = null;
        return;
    }
    //cosmetics
    selectedTileOutline(selectedDiv, true);

    //locate the Tile Object associated with this Div:
    let selectedTileObj = myBoard.emptyTiles.get(selectedTileId)

    if (selectedTileObj == undefined) {
        //tile selected is OCCUPIED: VISUAL QUE
        selectedTileObj = myBoard.myTiles.get(selectedTileId)
        selectedDiv.classList.add('shake')
        selectedDiv.addEventListener("animationend", (event) => {
            selectedDiv.classList.remove('shake')
        });
        console.log('SPACE OCCUPIED: SKIP ACTION')
        deselect(selectedDiv);
        selectedTileObj = null;
        selectedBoardTile = null;
    } else {
        //tile selected is EMPTY:
        if (selectedHandPath == undefined) {
            console.error('chose hand path first!')
            //console.log('chose hand path first')
        }
        else if (selectedHandPath == null) {
            console.log('non-hand actions tbd')
            //select/deselect tile/non-hand actions
        } else {
            //selectedHandPath and the destination
            //place hand into Empty spot
            if (myBoard.myTurn == 0) {
                //regular place
                //console.log('REGULAR PLACING... .. .')
                placeHandTileOnBoard()
                myBoard.myTurn++;
            } else {
                //check if this is a valid spot.
                console.log('CHECKING SPOT... .. .')
                let selectedHandObj = myHand.tiles.get(selectedHandPath.id);
                //check adjacent spots for Path tile
                let adj = [selectedTileId - myBoard.width, selectedTileId - 1, selectedTileId + 1, selectedTileId + myBoard.width];
                //north, west, east, south
                for (let i = 0; i < 4; i++) {
                    let adjPath = myBoard.myTiles.get(adj[i])
                    console.log('CHECKING ADJ SPOT FOR PATH VALIDITY at ' + adj[i] + ' index')
                    if (adjPath != undefined) {
                        if (((i == 0) && adjPath.south && selectedHandObj.north) ||
                            ((i == 1) && adjPath.east && selectedHandObj.west) ||
                            ((i == 2) && adjPath.west && selectedHandObj.east) ||
                            ((i == 3) && adjPath.north && selectedHandObj.south)) {
                            console.log('VALID PLACEMENT')
                            placeHandTileOnBoard()
                            console.assert(selectedBoardTile == null && selectedHandPath == null)
                        }
                    }
                }

                // if (replacePossible(selectedTileObj, selectedHandObj)) {
                //     console.log('replace valid!')
                //     placeHandTileOnBoard()
                // }
                //console.log('space adjacent; PROCEED')

                //TODO
                myBoard.myTurn++;
            }
        }
    }
    /**
     * //get Tile obj from myBoard: SIMPLE AND EASY
    let selectedTileId = parseInt(e.target.id)
    let selectedTile = myBoard.emptyTiles.get(selectedTileId)

    if(selectedHandPath != null && selectedTile!= undefined) {
        if (myBoard.myTurn == 0) {
            puthandTileonBoard(selectedTile);
        } else {
            console.log('TODO:check if this placement is possible!') //this has to be in hand
            //get the 4 cardinals around the spot"
            let adjNodes = [
                document.getElementById(selectedTileId-1),
                document.getElementById(selectedTileId-myBoard.width),
                document.getElementById(selectedTileId+1),
                document.getElementById(selectedTileId+myBoard.width),
            ]
            let adjId = [selectedTileId-1,selectedTileId-myBoard.width,selectedTileId+1,selectedTileId+myBoard.width];
            adjNodes.forEach((div) => {
                if (replacePossible(div,selectedHandPath)) {
                    console.log('space adjacent; PROCEED')
                    //div.style.pointerEvents = 'auto'
                    //div.style.opacity = '1.0'
                }
            })
            //console.log('space adjacent; PROCEED')
        }  
    } else if(selectedTile == undefined) {
        selectedTile = myBoard.myTiles.get(parseInt(e.target.id))
    } else if(selectedHandPath != null) {
        console.log('SPACE TAKEN!')
        //deselect board tile:
        selectedBoardTile.style.borderColor = INVISIBLE_COLOR;
        selectedBoardTile = null;
    }

    //remove highlight 
    console.log('setting the highlights!')

    //find all adjacent spots 
    //for each non-empty tile 'value' at position id 'key', find the adjacent spots 
    myBoard.myTiles.forEach((value, key) => {
        let div = document.getElementById(key); //key is id
        div.style.pointerEvents = 'auto'
        div.style.opacity = '1.0'
        let possibleAdj = [key-myBoard.width,key+myBoard.width,key-1,key+1]
        //console.log(possibleAdj)
        possibleAdj.forEach((id) => {
            //TODO: check that things are saved into legitimate sopts
            let adj = document.getElementById(id);
            //console.log(adj)
            let emptySpot = myBoard.emptyTiles.get(id);
            if(adj != undefined && value.spaceAdjacent(myBoard, id,emptySpot) && adj.style.backgroundColor != 'orange') {
                adj.style.background = 'red'
            }
        })
    })
     */

}

const handTileSelected = e => {
    // not old hand tiles!
    if (e.target.id[0] != 'h') {
        boardTileSelected(e)
        return;
    }
    let selectedDiv = e.target;
    console.log('hand tile id:' + selectedDiv.id)
    console.assert(e.target.id[0] == 'h')
    selectedTileOutline(selectedDiv, false);

    console.log('HIGHLIGHT MODE')
    //go thru all avaliable spots in empty tiles, remove highlights from bad ones
    myBoard.emptyTiles.forEach((key, value) => {
        let emptySpot = document.getElementById(key)
        if (!replacePossible(emptySpot, selectedHandPath)) {
            emptySpot.style.pointerEvents = 'none'
            emptySpot.style.opacity = '0.5'
        }
    })
    return;
    //TODO
    //this part is never reached!
    /* 
    If there is a selectedBoardTile, there are two options:
        if (myBoard.myTurn == 0) replace the boardTile with the handTile(selectedDiv)
        else: check if its valid? should be covered in the other method


    If there is no selectedBoardTile, there are these options:
        if (myBoard.myTurn == 0) all board places are avaliable
        otherwise: highlight all valid spots for selectedDiv to go into ()
    */
    //NOTE: boardTiles selected after handtile!
}

/**
 * This is the new function. where placements are VALID
 */
const placeHandTileOnBoard = () => {
    console.assert(selectedBoardTile != null && selectedHandPath != null)
    console.assert(selectedBoardTile.id[0] != 'h')
    let boardId = parseInt(selectedBoardTile.id);
    let handTileObj = myHand.tiles.get(selectedHandPath.id)
    let emptyTileObj = myBoard.emptyTiles.get(boardId)
    console.assert(handTileObj != undefined && emptyTileObj != undefined)

    //inner map alterations:
    handTileObj.owned = true
    myBoard.myTiles.set(boardId, handTileObj);
    let updatedBoardTile = myBoard.myTiles.get(boardId)
    myBoard.emptyTiles.delete(boardId)
    myHand.tiles.delete(selectedHandPath.id)

    console.assert(myBoard.myTiles.get(boardId) != undefined)
    console.assert(myBoard.emptyTiles.get(boardId) == undefined)

    //visual changes:
    let board = document.getElementsByClassName('grid-container')[0];
    board.replaceChild(selectedHandPath, selectedBoardTile)
    let newChild = board.getElementsByClassName('grid-cell hand-cell')[0];
    console.assert(newChild != undefined)
    newChild.className = 'grid-cell board-cell'
    console.assert(newChild.className = 'grid-cell board-cell')
    newChild.id = selectedBoardTile.id;
    newChild.style.borderColor = INVISIBLE_COLOR;
    newChild.style.backgroundColor = 'orange'
    console.log('newChild')
    updatedBoardTile.print()
    // console.log('DEBGUG')
    // updatedBoardTile.print() //prints correctly
    let adj = [boardId - 1, boardId - myBoard.width, boardId + 1, boardId + myBoard.width]
    adj.forEach((id) => {
        let adjacentTileElement = document.getElementById(id);
        if (adjacentTileElement != undefined) {
            if (updatedBoardTile.spaceAdjacent(myBoard, boardId, id)) {
                console.log(id + ' ADJACENT to ' + boardId)
                adjacentTileElement.style.pointerEvents = 'auto'
                adjacentTileElement.style.opacity = '1.0'
            } else {
                console.log('NOT ADJACENT')
                adjacentTileElement.style.pointerEvents = 'none'
                adjacentTileElement.style.opacity = '0.25'
            }
        }
    })
    selectedBoardTile = null;
    selectedHandPath = null;
}

const puthandTileonBoard = (boardTileObj) => {
    console.assert(selectedBoardTile != null && selectedHandPath != null)

    //because 

    //get hand obj:
    handTileObj = myHand.tiles.get(selectedHandPath.id)
    console.assert(boardTileObj != null && handTileObj != null)
    //swap obj between maps (deleting from hand)
    let bid = parseInt(boardTileObj.id)
    const hid = handTileObj.id;
    handTileObj.id = boardTileObj.id;
    myBoard.myTiles.set(bid, handTileObj);
    myBoard.emptyTiles.delete(bid);
    myHand.tiles.delete((hid))
    console.assert(myHand.tiles.get((hid)) == undefined)
    //console.log(myBoard.myTiles.get(parseInt(boardTileObj.id)))
    //update adjacent objs:
    let adj = [bid - 1, bid - myBoard.width, bid + 1, bid + myBoard.width]
    adj.forEach((id) => {
        let emptyTile = myBoard.emptyTiles.get(id)
        if (emptyTile != undefined) {
            if (handTileObj.spaceAdjacent(myBoard, id)) {
                //this adj space is valid!
                let div = document.getElementById(id);
                div.style.pointerEvents = 'auto'
                div.style.opacity = '1.0'
            }
        }
    })

    //visual changes:
    let board = document.getElementsByClassName('grid-container')[0];
    board.replaceChild(selectedHandPath, selectedBoardTile)
    let newChild = board.getElementsByClassName('grid-cell hand-cell')[0];
    console.assert(newChild != undefined)
    newChild.className = 'grid-cell board-cell'
    console.assert(newChild.className = 'grid-cell board-cell')
    newChild.id = selectedBoardTile.id;
    newChild.style.borderColor = INVISIBLE_COLOR;
    newChild.style.backgroundColor = 'orange'
    console.log(newChild)
    //update values
    selectedBoardTile = null;
    selectedHandPath = null;
    console.assert(selectedBoardTile == null && selectedHandPath == null)
}
/**THE CODE THAT RUNS THE WHOLE GAME */

let myBoard = new Board(WIDTH, HEIGHT);
myBoard.createDOMElement();
let myHand = new Hand(5);
// myHand.createDOMElement();
// myHand.fillHand();
setupAddMoreButton(myHand);