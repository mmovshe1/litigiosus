let cellCount = 20;
const shallowPathsId = [[1, 5, 7], [3, 5, 7], [1, 3, 5], [1, 3, 7], [1, 3], [1, 5], [3, 7], [5, 7], [1, 7], [3, 5], [1, 3, 5, 7], [1], [3], [5], [7]];
const shallowPaths = [];
const centerId = 4;
const ids = [1, 3, 5, 7]
let selectedDiv = null;
let selectedHand = false;
initializeShallowPaths();
console.log(shallowPaths)
initializeGrid();
initializeHandGrid();
//handEvents();
/** Fill grid-container with cell */
function initializeGrid() {
  const gridContainer = document.querySelector('.grid-container.centered');
  // console.log(gridContainer);
  for (let j = 0; j < cellCount; j++) {
    let gridCell = document.createElement('div');
    gridCell.className = 'grid-cell';
    //let template = cloneRandomPath();
    for (let i = 0; i < 9; i++) {
      let subCell = document.createElement('div');
      subCell.className = 'resource-unit';
      subCell.innerHTML = '0';
      subCell.style.backgroundColor = '#8ac1d1';
      //subCell.innerHTML = template[i];
      //if (template[i] == 1) subCell.style.backgroundColor = '#bcab90';
      gridCell.appendChild(subCell);
      gridCell.addEventListener('click', handlePlacePathTile());
    }
    gridContainer.appendChild(gridCell);

  }
}
function initializeHandGrid() {
  const handContainer = document.querySelector('.hand-container.centered');
  console.log(handContainer);
  for (let j = 0; j < 5; j++) {
    let gridCell = document.createElement('div');
    gridCell.className = 'grid-cell';
    let newPath = shallowPaths.at(getRandom0_15());
    for (let i = 0; i < 9; i++) {
      let subCell = document.createElement('div');
      subCell.className = 'resource-unit';
      subCell.innerHTML = newPath[i].toString();
      if (newPath[i] == 1) {
        subCell.style.backgroundColor = '#bcab90';
      }
      gridCell.appendChild(subCell);
      gridCell.addEventListener('click', handlePlacePathTile(e));
    }
    handContainer.appendChild(gridCell);
  }
}
function handleHandButton(event) {
  let handContainer = document.querySelector('.hand-container.centered');
  console.log('handpaths: %d', handContainer.childNodes.length)
  console.log(handContainer.childNodes)
  if (handContainer.childNodes.length == 3) {
    //has just the button:
    initializeHandGrid();
    handEvents();
  }
}

function handlePlacePathTile(event) {
  console.log(event);
  if (!selectedHand || !selectedDiv) selectedDiv = event.target;
  //hand paths:
  let handPaths = document.querySelectorAll('.hand-containter.centered > .grid-cell');
  let gridPaths = document.querySelectorAll('.grid-containter.centered > .grid-cell');
  handPaths.forEach(path => {
    if (path == selectedDiv) {
      selectedHand = true;
      path.style.border = '1px solid blue';
    } else {
      path.style.border = '1px solid grey';
    }
  })
  if (!selectedHand && selectedDiv) {
    //if selected just grid path -> escape.
    return;
  }
  //if hand selected, and clicking path:
  gridPaths.forEach(cell => {
    if (cell == selectedDiv) {
      //replace
      console.log('replace %o', cell)
      gridContainer.insertBefore(selectedDiv, cell);
      gridContainer.removeChild(cell);
      selectedDiv = null;
      selectedHand = false;
    }
  })
}

function handEvents() {
  let handCells = document.querySelectorAll('.hand-container.centered > .grid-cell');
  console.log(handCells);
  let selectedHandPath = null;
  handCells.forEach(pathTile => {
    let clickCount = 0;
    pathTile.addEventListener('click', function () {
      selectedHandPath = this;
      console.log('selectedHandPath: %o', selectedHandPath)
      if (clickCount % 2 == 0) {
        pathTile.style.border = '1px solid red';
      } else {
        pathTile.style.border = '1px solid lightgrey';
      }
      clickCount++;
    });
  });
  let gridContainer = document.querySelector('.grid-container.centered');
  let gridCells = document.querySelectorAll('.grid-container.centered > .grid-cell');
  gridCells.forEach(pathTile => {
    pathTile.addEventListener('click', function () {
      //replace this one with selectedHandPath
      console.log('selectedHandPath: %o', selectedHandPath)
      console.log('replace %o', this)
      gridContainer.insertBefore(selectedHandPath, this);
      gridContainer.removeChild(this);
    });
  });
}

/** Initialize shallow path matrices
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
  console.log('count: %d', count);
}
function cloneRandomPath(newPath) {
  let random = Math.random() * 16;
  //let random = new Date().getMilliseconds() % 16;
  console.log("random value: %d", random);
  newPath = [0, 0, 0, 0, 1, 0, 0, 0, 0];
  for (let i = 0; i < 9; i++) {
    if (shallowPaths.at[random] == 1) {
      newPath[i] = 1;
    }
  }
  console.log(typeof (newPath));
  return newPath;
}

function getRandomPath() {
  let random = getRandom0_15();
  //let random = new Date().getMilliseconds() % 16;
  console.log(random);
  print(shallowPaths);
  return shallowPaths[random];
}

function getRandom0_15() {
  let random = Math.floor(Math.random() * 100) % 16;
  console.log(random);
  return random;
  //return random = new Date().getMilliseconds() % 16;
}