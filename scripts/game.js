/*************************************************   */
const ABS = Math.abs

/************************Function Definitions**********************/

/**
 * Shuffles the elements of an array in place.
 *
 * @param {Array} array - The array to be shuffled.
 * @return {Array} array - The shuffled array.
 */
function shuffleArray(array) {
    array.sort(() => Math.random() - 0.5)
    return array
}

function shuffleArraySolvable(array) {
  array.sort(() => Math.random() - 0.5)
  //
    let numInversions = 0
    for (let i = 0; i < array.length-1; i++) {
      if (array[i]==0 || array[i+1]==0)
        continue
      else{
        if (array[i]>array[i+1])
          numInversions++
      }
    }
    //
    let emptyTileRowFromBelow = numRow - Math.floor(array.indexOf(0)/numCol)
    const isSolvable = numCol%2 ? !numInversions%2 : emptyTileRowFromBelow%2 ? !numInversions%2 : numInversions%2
    //swapToMakeSolvabe
    if (!isSolvable)
      (array.indexOf(0) === 0 || array.indexOf(0) === 1) ? [array[array.length-1], array[array.length-2]] = [array[array.length-2], array[array.length-1]] : [array[0], array[1]] = [array[1], array[0]]
    return array
  }

/**
* Generates an HTML string representing the arena table based on the given data array.
*
* @param {number} numRow - the number of rows in the arena
* @param {number} numCol - the number of columns in the arena
* @param {Array} dataArray - the data array representing the arena
* @param {HTMLElement} arenaTable - the HTML element where the arena table will be displayed
* @return {void} 
*/
function setArena() {
  let outputString = ''
  for(let i = 0; i < numRow; i++){
    outputString += '<tr>'
    for(let j = 0; j < numCol; j++){
      if (dataArray[i * numCol + j] === 0){
        outputString += `<td class="blank" data-row = ${i} data-col = ${j} ></td>`
      } else {
        outputString += `<td class="tile" data-row = ${i} data-col = ${j} >` + dataArray[i * numCol + j] + '</td>'
      }
    }
    outputString += '</tr>\n'
  }
  arenaTable.innerHTML = outputString
}


function moveUp (tile, step = 1) {
  tile.dataset.row = Number(tile.dataset.row) - step
  let [x, y] = getTranslateXY(tile.style.transform)
  tile.style.transform = `translateX(${x}%) translateY(${y-101*step}%)`
}

function moveDown (tile, step = 1) {
  tile.dataset.row = Number(tile.dataset.row) + step
  let [x, y] = getTranslateXY(tile.style.transform)
  tile.style.transform = `translateX(${x}%) translateY(${y + 101 * step}%)`
}

function moveLeft (tile, step = 1) {
  tile.dataset.col = Number(tile.dataset.col) - step
  let [x, y] = getTranslateXY(tile.style.transform)
  tile.style.transform = `translateX(${x - 101*step}%) translateY(${y}%)`
}

function moveRight (tile, step = 1) {
  tile.dataset.col = Number(tile.dataset.col) + step
  let [x, y] = getTranslateXY(tile.style.transform)
  tile.style.transform = `translateX(${x + step*101}%) translateY(${y}%)`
}
   

function getTranslateXY(s) {
  const regex = /translateX\(([-\d.]+)%\) translateY\(([-\d.]+)%\)/
  const matches = s.match(regex)
  if (matches) {
    const x = parseInt(matches[1])
    const y = parseInt(matches[2])
    return ([x, y])
  }
}

function tileAtPos(x, y) {
  return document.querySelector(`[data-row="${x}"][data-col="${y}"]`)
}

function playTiles(clickedTilePos) {
  console.log("clickedTilePos:", clickedTilePos);
  let targetMove = Array(1 * clickedTilePos.row - 1 * blankTile.dataset.row, 1 * clickedTilePos.col - 1 * blankTile.dataset.col);
  console.log("targetMove:", targetMove);
  if (targetMove[0] && targetMove[1]) {
    console.log("Returning early");
    return;
  } else if (targetMove[0]) {
    for (let i = 1; i <= ABS(targetMove[0]); i++) {
      console.log("Moving up/down:", i);
      (targetMove[0] > 0 ? moveUp : moveDown)(tileAtPos(1 * blankTile.dataset.row + i*(targetMove[0] > 0 ? 1 : -1), 1 * blankTile.dataset.col), 1);
    }
    console.log("Moving up/down...:", ABS(targetMove[0]));
    (targetMove[0] < 0 ? moveUp : moveDown)(blankTile, ABS(targetMove[0]));
  } else if (targetMove[1]) {
    for (let i = 1; i <= ABS(targetMove[1]); i++) {
      console.log("Moving left/right:", i);
      (targetMove[1] > 0 ? moveLeft : moveRight)(tileAtPos(1 * blankTile.dataset.row, 1 * blankTile.dataset.col + i*(targetMove[1] > 0 ? 1 : -1)), 1);
    }
    console.log("Moving left/right:", ABS(targetMove[1]));
    (targetMove[1] < 0 ? moveLeft : moveRight)(blankTile, ABS(targetMove[1]));
  }
}


/********************Variable Declarations*********************/

const solvable = true
const numRow = 4 //DEBUG
const numCol = 4 //DEBUG
const dataArray = (solvable?shuffleArraySolvable:shuffleArray)(Array.from({length: numRow * numCol}, (_, i) => i))

const arenaTable = document.querySelector('.arena__table')



/********************************Main Code****************************  */
  
  setArena()
  document.querySelectorAll('.tile').forEach(tile => tile.style.transform = 'translateX(0%) translateY(0%)')
  document.querySelectorAll('.blank').forEach(tile => tile.style.transform = 'translateX(0%) translateY(0%)')

  const blankTile = document.querySelector('.blank')

  arenaTable.addEventListener('click', (e) => playTiles(e.target.dataset))