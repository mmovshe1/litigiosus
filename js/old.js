const shallowPathsId = [[1, 5, 7], [3, 5, 7], [1, 3, 5], [1, 3, 7], [1, 3], [1, 5], [3, 7], [5, 7], [1, 7], [3, 5], [1, 3, 5, 7], [1], [3], [5], [7]];
const shallowPaths = [];
const centerId = 4;
const ids = [1, 3, 5, 7]
var nextPlaceableIds = new Set();
var placedIds = new Set();
var validIds = new Set();
var selectedHand = null;
var selectedBoardCellDiv = null;
const INVISIBLE_COLOR = '#ffffff00';
const SELECTED_COLOR = '#97a4c4';
const GRID_CELL_COLOR = '#8ac1d1';
const GRID_INVALID_COLOR = '#97bac4';
const PATH_COLOR = '#bcab90';
const WIDTH = 5;
const HEIGHT = 4;
let cellCount = WIDTH*HEIGHT;
var allEmptyCells = new Set();  //
var allPlacedCells = new Set();
var allHandCells = new Set();
var SELECTED_HAND_CELL = null;
var SELECTED_EMPTY_CELL = null;



class Cell {
  /**
   * Create a cell
   * @param {Set<Number>} directions : 1,3,4, 5,7 
   * @param {boolean} owned : placed or in hand
   */
  constructor(directions, owned) {
    this.directions = new Set(directions);
    this.owned = owned;
  }
  // /**
  //  * make copy from given cell.
  //  * @param {Cell} cell 
  //  */
  // constructor(cell) {
  //   this.directions = new Set(cell.directions)
  //   this.owned = cell.owned;
  //   this.id = cell.id;
  //   this.div = cell.div;
  //   this.neighborMath = cell.neighborMath
  //   this.neighborIDs = cell.neighborIDs
  // }
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
    return gridCell;
  }
  setId(id) {
    this.id = id;
  }
  /**
   * Get a list of ids of all neighbors. 
   * @param {Set<Number>} neighborIDs empty set 
   * @returns set of <= 4 ids.
   */
  getRealNeighbors(neighborIDs) {
    if(!this.id) return
    if(!neighborIDs) neighborIDs = new Set();
    let neighborMath = this.getNeighborMath(null);
    neighborMath.forEach(element => {
      let sum = this.id + element;
      if (sum % WIDTH == 0 || sum % WIDTH == 4 || sum < 0 || sum >= WIDTH(HEIGHT)) {
        //skip: special border cases.
      } else {
        neighborIDs.add(sum);
      }
    });
    this.neighborIDs = neighborIDs;
    return neighborIDs;
  }
  /**
   * What are the values to add to potential ID to find neighboring spots?
   * @param {Set<Number>} neighborMath 
   * @returns values to add to potential ID 
   */
  getNeighborMath(neighborMath) {
    if(!neighborMath) neighborMath = new Set();
    this.directions.forEach( dir => {
      switch(dir) {
        case 1: // NORTH
          neighborMath.add(-WIDTH); 
          break;
        case 3: //WEST
          neighborMath.add(-1);
          break;
        case 5: //EAST
          neighborMath.add(1); 
          break;
        case 7: //SOUTH
          neighborMath.add(WIDTH); 
          break;
        default: break; //CENTER
      }
    })
    this.neighborMath = this.neighborMath;
    return neighborMath;
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

  // IF A HAND TILE HAS BEEN SELECTED HAVE TO PLACE IT!
  if (selectedHand) {
    selectedBoardCellDiv = e.target;
    //FIND corresponding Cell Object to the Cell Div:
    var selectedEmptyCellObj = new Cell();
    let eca = Array.from(allEmptyCells);
    for(let i = 0; i < eca.length; i++) {
      if (parseInt(eca.at(i).id) === parseInt(e.target.id)) {
        selectedEmptyCellObj = eca.at(i)
        break;
      }
    }
    console.log('>> target empty cell obj: %o', selectedEmptyCellObj)
    //get selected hand object TODO
    console.log('>> swap %o and %o',selectedHand, selectedBoardCellDiv.id)
    //handle logic right here!
    //place tile anywhere!
    //swap & delete
    let board = selectedBoardCellDiv.parentNode;
    board.insertBefore(selectedHand,selectedBoardCellDiv);
    selectedHand.classList.add('placed');
    selectedHand.id = selectedBoardCellDiv.id;
    selectedHand.style.boxShadow = 'none';
    selectedHand.style.border = 'none';
    board.removeChild(selectedBoardCellDiv);
    //
    // extra:
        // placedIds.add(parseInt(selectedHand.id));
        // allPlacedCells.add()
        // //
        // id = parseInt(selectedHand.id);
        // //mark the next possible placements!
        // let oldIds = new Set(nextPlaceableIds);
        // nextPlaceableIds = getNextPlaceableIds(selectedHand,id, nextPlaceableIds);
        // // console.log('difference between sets: %o', oldIds.difference(nextPlaceableIds))
        // //now we have nextIds, color those:
        // updateBoard(id, board, nextPlaceableIds);
        // selectedHand = null;
  }
  // console.log('clicked: %o',e.target);  
}
/**
 * Select hand tile 
 * @param {Event} e click! 
 * @returns 
 */
const handTileSelected = e => {
  //console.log('>>hand tile selected: %o', e.target)
  //must select the correct thing
  const isTile = e.target.className === 'grid-cell hand-cell'
  if (!isTile) return;
  
  // SELECTED HAND TILE IN FOCUS
  if (selectedHand) {
    //deselect previously selected tile:
    selectedHand.style.boxShadow = "none";
    selectedHand.style.borderColor = INVISIBLE_COLOR;
    if (selectedHand === e.target) {
      selectedHand = null;
      console.log('>>hand tile has been deselected')
      return;
    }
    console.log('>>hand tile has been reselected')
  }
  //NO PLACED TILES YET!
  if (allPlacedCells.size === 0) {
      selectedHand = e.target;
      selectedHand.style.border = '3px solid purple';
      selectedHand.style.boxShadow = "2px 2px 4px grey";
  } 
  //TILES HAVE BEEN PLACED so logic is in play here.
  else {
    selectedHand = e.target;
    selectedHand.style.boxShadow = "2px 2px 4px grey";
    //selecting should light up areas it can be placed. 
    // console.log('new hand: %o', selectedHand);
    nextPlaceableIds.forEach(id => {
      //find a valid list of ids:
      // id is destiantion spot on board
      // selected hand has the directions
      // hypothetical should contain placedIds
      
      var hypotheticalIds = new Set();
      hypotheticalIds = getNextPlaceableIds(selectedHand, id, hypotheticalIds, true);
      // if we think of putting the selected Hand in the {id} location, what are
      // the hypothetical adjacent cells? 

      // console.log('for %d the next spots are %o', id, hypotheticalIds);
      // valid Ids should not contain any placed Ids. You can not put a
      // path in a filled spot. 
      // If a hypothetical spot overlaps with a placed spot that connects!!
      // how do we check this connection exists??
      for (const value of placedIds) {
        if (hypotheticalIds.has(value)) {
          // console.log('>> adding #%d to valid',value)
          validIds.add(id);
        }
      }
    });
    // console.log('for this hand, the following are valid: %o', validIds)
    //highlight the valid ids:
    let gridCells = document.querySelectorAll('.grid-cell.board-cell');
    //// console.log('%o',gridCells);
    gridCells.forEach(element => {
      if (validIds.has(parseInt(element.id))) {
        //// console.log('valid cell found! at id: %d', element.id)
        highlight(element)
      } else {
        highlight(element,false)
      }
    });
  }
  // console.log('current spots to place: %o', validIds);
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
    gridContainer.appendChild(gridCell.create(hand=false,j));
    allEmptyCells.add(gridCell);
    // let gridCell = document.createElement('div');
    // gridCell.className = 'grid-cell board-cell';
    // gridCell.id = ''+j;
    // //let template = cloneRandomPath();
    // for (let i = 0; i < 9; i++) {
    //   let subCell = document.createElement('div');
    //   subCell.className = 'resource-unit';
    //   subCell.innerHTML = j;
    //   subCell.style.backgroundColor = GRID_CELL_COLOR;
    //   gridCell.appendChild(subCell);
    //   gridCell.addEventListener('click',   9ooleSelected);
    // }
    // gridContainer.appendChild(gridCell);
    // // console.log('added gridCell: %o',gridCell)

  }
  // console.log('all empty cells: size %d', allEmptyCells.size)
}
/**
 * Fill Hand Area
 */
function fillHandGrid() {
  const handContainer = document.querySelector('.hand-container.centered');
  // console.log(handContainer);
  for (let j = 0; j < 5; j++) {
    let randomIndex = getRandom0_15();
    let newPath = shallowPaths.at(randomIndex);
    // console.log('new path: %o',newPath)
    let gridCell = new Cell(shallowPathsId.at(getRandom0_15()),true);
    allHandCells.add(gridCell)
    let child = gridCell.create(hand=true, null);
    child.addEventListener('click', handTileSelected);
    handContainer.appendChild(child)
    // let gridCell = document.createElement('div');
    // gridCell.className = 'grid-cell hand-cell';
    // //// console.log('shallow paths: %o',shallowPaths);
    // //// console.log('shallow paths: %d',shallowPaths.length);
    // let randomIndex = getRandom0_15();
    // //// console.log('random index:  %d',randomIndex);
    // let newPath = shallowPaths.at(randomIndex);
    // //// console.log(typeof newPath);
    // for (let i = 0; i < 9; i++) {
    //   let subCell = document.createElement('div');
    //   subCell.innerHTML = newPath.at(i).toString();
    //   if (newPath[i] == 1) {
    //     subCell.style.backgroundColor = PATH_COLOR;
    //   }
    //   subCell.className = 'resource-unit';
    //   gridCell.appendChild(subCell);
    //   // gridCell.onclick = handlePlacePathTile(e);
    //   gridCell.addEventListener('click', handTileSelected);
    // }
    // handContainer.appendChild(gridCell);
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
  // console.log('count: %d', count);
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