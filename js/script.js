let cellCount = 20;
const shallowPathsId = [[1, 5, 7], [3, 5, 7], [1, 3, 5], [1, 3, 7], [1, 3], [1, 5], [3, 7], [5, 7], [1, 7], [3, 5], [1, 3, 5, 7], [1], [3], [5], [7]];
const shallowPaths = [];
const centerId = 4;
const ids = [1, 3, 5, 7]
initializeShallowPaths();
console.log(shallowPaths)
initializeGrid()
initializeHandGrid()
/** Fill grid-container with cell */
function initializeGrid() {
  const gridContainer = document.querySelector('.grid-container.centered');
  console.log(gridContainer);
  for (let j = 0; j < cellCount; j++) {
    let gridCell = document.createElement('div');
    gridCell.className = 'grid-cell';
    //let template = cloneRandomPath();
    for (let i = 0; i < 9; i++) {
      let subCell = document.createElement('div');
      subCell.className = 'resource-unit';
      subCell.innerHTML = '0';
      //subCell.innerHTML = template[i];
      //if (template[i] == 1) subCell.style.backgroundColor = '#bcab90';
      gridCell.appendChild(subCell);
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
    let newPath = shallowPaths[getRandom0_15()];
    for (let i = 0; i < 9; i++) {
      let subCell = document.createElement('div');
      subCell.className = 'resource-unit';
      subCell.innerHTML = newPath[i];
      if (newPath[i] == 1) {
        subCell.style.backgroundColor = '#bcab90';
      }
      gridCell.appendChild(subCell);
    }
    gridCell.addEventListener('click', function (event) {
      // alert('clicked path!');
      if (event.target.classList.contains('hand-container, grid-cell')) {
        alert('Dynamic div clicked!');
      }
    });
    handContainer.appendChild(gridCell);
  }
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
  let random = new Date().getTime() % 16;
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
  let random = new Date().getTime() % 16;
  console.log(random);
  print(shallowPaths);
  return shallowPaths[random];
}

function getRandom0_15() {
  return random = new Date().getTime() % 16;
}

function getFiveRandomValues() {
  r1 = new Date().getTime % 16;
  r2 = new Date().getTime % 16;
  r3 = new Date().getTime % 16;
  r4 = new Date().getTime % 16;
  r5 = new Date().getTime % 16;
  return [r1, r2, r3, r4, r5];
}
console.log(getFiveRandomValues())