const shallowPathsId = [[1, 5, 7], [3, 5, 7], [1, 3, 5], [1, 3, 7], [1, 3], [1, 5], [3, 7], [5, 7], [1, 7], [3, 5], [1, 3, 5, 7], [1], [3], [5], [7]];
const shallowPaths = [];
const centerId = 4;
const ids = [1, 3, 5, 7]
var nextPlaceableIds = new Set();
var placedIds = new Set();
var validIds = new Set();

const INVISIBLE_COLOR = '#ffffff00';
const SELECTED_COLOR = '#97a4c4';
const GRID_CELL_COLOR = '#8ac1d1';
const GRID_INVALID_COLOR = '#97bac4';
const PATH_COLOR = '#bcab90';
const WIDTH = 5;
const HEIGHT = 4;
let cellCount = WIDTH*HEIGHT;

var PlacedMap = new Map();    //keep track of placed tiles: 'div', obj
var FreeSpotsMap = new Map(); //keep track of "free" spots on board: div, obj
var HandMap = new Map();      //hand tiles
var ValidSpotSet = new Set(); //set of valid spot ids on board

const SELECTEDHAND = {
  div: null,
  cellObj: null
}
var SELECTEDOTHER = {
  div: null,
  cellObj: null
}


class Cell {
  /**
   * Create a cell
   * @param {Array<Number>} directions : 1,3,4, 5,7 
   * @param {boolean} owned : placed or in hand
   */
  constructor(directions, owned) {
    this.directions = directions;
    this.owned = owned;
    //if(this.directions != null) {this.calcNeighborMath();}
  }
  // /**
  //  * make copy from given cell.
  //  * @param {Cell} cell 
  //  */
  // constructor(cell) {
  //   this.directions = (cell.directions)
  //   this.owned = cell.owned;
  //   this.id = cell.id;
  //   this.div = cell.div;
  //   this.neighborMath = cell.neighborMath
  //   this.neighborIDs = cell.neighborIDs
  // }
  createHandTile() {
    let element = document.createElement('div');
    element.className = 'grid-cell hand-cell';
    this.id = null;
    for(let i = 0; i < 9; i++) {
      let unit = document.createElement('div');
      unit.className = 'resource-unit';
      if(this.directions.has(i) || i == 4) {
        unit.style.backgroundColor = PATH_COLOR;
        unit.innerHTML = 1;
      } else {
        unit.innerHTML = 0;
      }
      element.appendChild(unit);
    }
    element.addEventListener('click', boardTileSelected);
    // console.log('>>> created hand tile: %o', element);
    return element;
  }
  /**
   * create a HTML DOM div
   * @param {boolean} hand true if hand cell ; false if empty cell. 
   * @returns parentNode
   */
  create(hand,j=null) {
    let gridCell = document.createElement('div');
    if(this.owned) {
      gridCell.className = 'grid-cell hand-cell';
    } else {
      gridCell.className = 'grid-cell board-cell';
    }
    if (!hand) {
      gridCell.id = ''+j;
      this.id = j;
    }
    for (let i = 0; i < 9; i++) {
      let subCell = document.createElement('div');
      subCell.className = 'resource-unit';
      if(!hand){
        subCell.innerHTML = j;
        subCell.style.backgroundColor = GRID_CELL_COLOR;
      } else {
        if (this.directions.has(i) || i == 4) {
          subCell.style.backgroundColor = PATH_COLOR;
          subCell.innerHTML = 1;
        } else {
          subCell.innerHTML = 0;
        }
      }
      gridCell.appendChild(subCell);
      gridCell.addEventListener('click', boardTileSelected);
    }
    this.div = gridCell;
    //console.log('made div: %o', gridCell)
    return gridCell;
  }
  setId(id) {
    this.id = id;
  }
  /**
   * What are the values to add to potential ID to find neighboring spots?
   * @returns Set<Number> values to add to potential ID 
   */
  calcNeighborMath() {
    //console.log('>> calculate math')
    this.neighborMath = new Set();
    //console.log('>>> directions: %o', this.directions)
    if(this.directions == null) return;
    this.directions.forEach( dir => {
      //console.log('>>> direction: %d', dir)
      switch(dir) {
        case 1: // NORTH
          this.neighborMath.add(-WIDTH); 
          break;
        case 3: //WEST
          this.neighborMath.add(-1);
          break;
        case 5: //EAST
          this.neighborMath.add(1); 
          break;
        case 7: //SOUTH
          this.neighborMath.add(WIDTH); 
          break;
        default: break; //CENTER
      }
    })
  }

  /**
   * Get a list of ids of all neighbors. 
   * @returns Set<Number> set of <= 4 ids.
   */
  getRealNeighbors() {
    this.neighborIDs = new Set();
    //console.log('>>> neighbor ids: %o', this.neighborIDs)
    if (!this.neighborMath) this.calcNeighborMath(null);
    //console.log('>>>>  math: %o', this.neighborMath)
    this.neighborMath.forEach(element => {
      let sum = this.id + element;
      if (sum % WIDTH == 0 || sum % WIDTH == 4 || sum < 0 || sum >= WIDTH*HEIGHT) {
        //skip: special border cases.
      } else {
        this.neighborIDs.add(sum);
      }
    });
    //console.log('>>> neighbor ids: %o', this.neighborIDs)
    return this.neighborIDs;
  }

  updateNeighbors() {
    console.log(this);
    this.neighborMath = this.calcNeighborMath();
    //console.assert(this.directions != null);
    // this.neighborIDs = this.getRealNeighbors();
    console.log('>>> add to get neighbors: %o', this.neighborMath)
  }
}

function highlight(element,flag=true) {
  if (!flag) {
    //remove highlight:
    element.style.opacity = '0.5';
    element.style.pointerEvents = 'none';
    return;
  } 
  //add highlight:
  element.style.opacity = '1.0';
  element.style.pointerEvents = 'auto';
}

/**
 * Update the board to highlight the possible next to be filled spots.
 * @param {Number} id : last placed tile location
 * @param {div} board : board div 
 * @param {Array<Number>} nextPlaceableIds : all spots that can be filled
 */
function updateBoard(id, board, nextPlaceableIds) {
  // console.log('updating board highlights!')
  if(board === null) {
    // console.log('ERROR! board null!')
    return;
  }
  let boardChildren = board.childNodes;
  boardChildren.forEach(child => {
    //// console.log('child name: %o',child.className)
    if (child.className == 'grid-cell board-cell') {
      let childId = parseInt(child.id);
      if (nextPlaceableIds.has(childId)) {
        highlight(child)
      } else if (childId != id) {
        highlight(child,false)
      }
    }
  });
}

/**
 * Get path directions from the 'placed' path tile.
 * @returns an array list of 1/3/4/5/7 for N,W,C,E,S
 * depreciated?
 */
function getPathDirections(selectedHand) {
  var directions = []
  let resources = selectedHand.childNodes;
  for(let x = 1; x < 8; x++) {
    if(parseInt(resources[x].innerHTML) == 1) {
      directions.push(x);
    }
  }
  return directions;
}
/**
 * Get additional id's of adjacent tiles to formed path.
 * @param {Number} id - current new path tile ID.
 * @param {Array<Number>} currentIds - current array of ids
 * @returns nextPlaceableIds updated.
 */
function getNextPlaceableIds(selectedHand,id,currentIds,flag=false) {
  let original = new Set(currentIds);
  if(flag == true) // console.log('hypothetical');
  var directions = getPathDirections(selectedHand)
  // console.log('directions: %o',directions)
  directions.forEach(dir => {
    //// console.log(dir)
    //// console.log('%d %d %d %d', id-5, id-1, id+1, id+5);
    //for each direction, compute next ids:
    switch(dir) {
      case 1: 
        if(id < WIDTH ) break;
        currentIds.add(id-WIDTH); 
        break;
      case 3: 
        if(id % WIDTH == 0) break;
        currentIds.add(id-1);
        break;
      case 5: 
        if(id % WIDTH == (WIDTH-1)) { break;}
        currentIds.add(id+1); 
        break;
      case 7: 
        if(id >= WIDTH*(HEIGHT-1)) break;
        currentIds.add(id+WIDTH); 
        break;
      default: break;
    }
  })
  // // console.log('updated ids: %o', currentIds);
  // // console.log('any changes? %o', currentIds.difference(original))
  return currentIds;
}

/**
 * Select board tile (`empty` one) to replace with something else.
 * @param {*} e click Event 
 * @returns 
 */
const boardTileSelected = e => {
  //check if correct target
  const isTile = e.target.className === 'grid-cell board-cell'
  if (!isTile) return;

  if(SELECTEDHAND == null) return;
  console.assert(SELECTEDHAND != null);

  SELECTEDOTHER.div = e.target
  SELECTEDOTHER.cellObj = FreeSpotsMap.get(e.target);
  console.assert(SELECTEDOTHER != null);

  if(PlacedMap.size == 0) {
    //place SELECTEDHAND at SELECTEDOTHER:
    let parentNode = SELECTEDOTHER.div.parentNode;
    // console.log('>>> replace %o with %o', SELECTEDOTHER.div, SELECTEDHAND.div)

    //var RESULT = new Array([SELECTEDHAND.div, SELECTEDOTHER.cellObj]);
    console.assert(SELECTEDHAND.div != null)
    console.assert(SELECTEDOTHER.cellObj != null)
    SELECTEDHAND.div.style.boxShadow = 'none';
    SELECTEDHAND.div.style.border = 'none';
    SELECTEDHAND.div.id = SELECTEDOTHER.div.id;
    SELECTEDOTHER.cellObj.directions = SELECTEDHAND.cellObj.directions.slice(0)
    SELECTEDOTHER.cellObj.owned = true;
    SELECTEDOTHER.cellObj.updateNeighbors();
    console.log('RESULT: %o %o', SELECTEDHAND.div, SELECTEDOTHER.cellObj)

    //console.log('RESULT: %o', RESULT.cellObj)

    parentNode.insertBefore(SELECTEDHAND.div,SELECTEDOTHER.div);
    parentNode.removeChild(SELECTEDOTHER.div);
    HandMap.delete(SELECTEDHAND.div);
    FreeSpotsMap.delete(SELECTEDOTHER.div);
    PlacedMap.set(SELECTEDHAND.div,SELECTEDOTHER.cellObj);
    ValidSpotSet.delete(parseInt(SELECTEDHAND.div.id));
    // RESULT.cellObj.setId(RESULT.div.id);
    // RESULT.cellObj.updateNeighbors();
  }
  //remove highlight from other free spots:
  let freeKeys = Array.from(FreeSpotsMap.keys())
  freeKeys.forEach(div => {
    div.style.opacity = '0.5'
    div.style.border = 'none'
  })
  //Update ValidSpotSet
  console.log('>>> RESULT.cellObj %o', SELECTEDOTHER.cellObj)
  console.log('>>> REAL NEIGHBORS %o', SELECTEDOTHER.cellObj.getRealNeighbors())
  // console.log('>>> RESULT.cellObj %o', RESULT.cellObj)
  // console.log('>>> RESULT.cellObj %o', RESULT.cellObj)
  
  SELECTEDOTHER.cellObj.getRealNeighbors().forEach(id => ValidSpotSet.add(id));
  //highlight all valid spots:
  ValidSpotSet.forEach(validId => {
    element = document.getElementById(validId.toString());
    element.style.border = '3px solid white';
    element.style.opacity = '1.0';
  })
}
/**
 * Select hand tile 
 * @param {Event} e click! 
 * @returns 
 */
const handTileSelected = e => {
  console.log('>>hand tile selected: %o', e.target)
  //must select the correct thing
  const isTile = e.target.className === 'grid-cell hand-cell'
  if (!isTile) return;

  if(SELECTEDHAND == null) {
    console.log('>> FIRST SELECTION')
    SELECTEDHAND.div = e.target;
    SELECTEDHAND.cellObj = HandMap.get(e.target);
    SELECTEDHAND.div.style.borderColor = 'blue';
  } else if (SELECTEDHAND.div === e.target) {
    //deselect
    SELECTEDHAND.div.style.borderColor = INVISIBLE_COLOR;
    //SELECTEDHAND = null;
    return;
  } else {
    //reselect
    if(SELECTEDHAND.div) SELECTEDHAND.div.style.borderColor = INVISIBLE_COLOR;
    SELECTEDHAND.div = e.target;
    SELECTEDHAND.cellObj = HandMap.get(e.target);
    SELECTEDHAND.div.style.borderColor = 'blue';
  }
  console.assert(SELECTEDHAND != null);
  console.assert(SELECTEDHAND.cellObj != null);


  if (PlacedMap.size != 0) {
    //get possible spots from ValidSpotSet & remove highlights from else.
    SELECTEDHAND.cellObj.calcNeighborMath()
    console.assert(SELECTEDHAND.cellObj.neighborMath != null)
    let neighbordIDS = Array.from(SELECTEDHAND.cellObj.neighborMath)
    console.assert(neighbordIDS != null)
    var localValidSpots = new Set();
    ValidSpotSet.forEach(validId => {
      neighbordIDS.forEach(n => {
        localValidSpots.add(parseInt(validId) + parseInt(n));
      })
      //for each id, see where the neighbors will end up.
      console.log('localValidSpots: %o', localValidSpots)
    })

  }
}

initializeShallowPaths();
//// console.log(shallowPaths)
fillGrid();
fillHandGrid();

/**
 * Create Board and fill it with empty spots.
 */
function fillGrid() {
  const gridContainer = document.querySelector('.grid-container.centered');
  // // console.log(gridContainer);
  for (let j = 0; j < cellCount; j++) {
    let gridCell = new Cell(null, false);
    var localDiv = gridCell.create(hand=false,j);
    gridContainer.appendChild(localDiv);
    FreeSpotsMap.set(localDiv, gridCell);
  }
  console.log('all empty cells:  %o', FreeSpotsMap)
}
/**
 * Fill Hand Area
 */
function fillHandGrid() {
  const handContainer = document.querySelector('.hand-container.centered');
  // console.log(handContainer);
  for (let j = 0; j < 5; j++) {
    let randomValue = getRandom0_15();
    let newPath = shallowPaths.at(randomValue);
    console.log('<<< new path: %o', newPath)
    //CREATE DIV:
    let element = document.createElement('div');
    element.className = 'grid-cell hand-cell';
    for(var i = 0; i < 9; i++) {
      var unit = document.createElement('div');
      unit.className = 'resource-unit';
      if(newPath[i] == 1) {
        unit.style.backgroundColor = PATH_COLOR;
        unit.innerHTML = 1;
      } else {
        unit.innerHTML = 0;
      }
      element.appendChild(unit);
    }
    element.addEventListener('click', handTileSelected);
    handContainer.appendChild(element);
    // console.log('>>> created hand tile: %o', element);

    let direction = shallowPathsId[randomValue];
    console.log('>>> directions from newPath: %o', direction);
    //to convert 
    let handCell = new Cell(direction, false);
    handCell.directions = direction;
    handCell.div = element;
    HandMap.set(element, handCell);
  }
}

/** 
 * Initialize shallow path matrices
 */
function initializeShallowPaths() {
  let count = 1;
  shallowPathsId.forEach(shallowPathIdentifier => {
    const path = [0, 0, 0, 0, 1, 0, 0, 0, 0];
    shallowPathIdentifier.forEach(value => {
      path[value] = 1;
    });
    shallowPaths.push(path);
    count += 1;
  });
  console.log('initialized shallow paths: %o', shallowPaths);
}

function cloneRandomPath(newPath) {
  let random = Math.random() * 16;
  //let random = new Date().getMilliseconds() % 16;
  // console.log("random value: %d", random);
  newPath = [0, 0, 0, 0, 1, 0, 0, 0, 0];
  for (let i = 0; i < 9; i++) {
    if (shallowPaths.at[random] == 1) {
      newPath[i] = 1;
    }
  }
  // console.log(typeof (newPath));
  return newPath;
}

function getRandomPath() {
  let random = getRandom0_15();
  //let random = new Date().getMilliseconds() % 16;
  // console.log(random);
  print(shallowPaths);
  return shallowPaths[random];
}

function getRandom0_15() {
  let random = Math.floor(Math.random() * 100) % 15;
  // console.log(random);
  return random;
  //return random = new Date().getMilliseconds() % 15;
}