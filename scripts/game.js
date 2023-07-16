/********************Global Variable Declarations*********************/

let solvability  //Is the generated puzzle solvable ?
const challenge = []  //1 for subzero, 2 for level-2, 3 for mission:impossible
let themeChoice = 1  //1: Modern, 2:Classic, 3:Minimalist
let numRow = 4
let numCol = 4
let moves = 0
let playerTime
let rankCurr  //Most recent score of player //Of class: UserScore
let solArray  //solution array
let dataArray  //The shuffled array
let tiles
let blankTile
let uploadedImgSrc  //src of image uploaded by user, if any
let observer  //for tracking freezed tile moves in subzero challenge
const imgUrl = (x) => (challenge.includes(2) ? (x !== 5 ?  `url('assets/img-${x + 5}.jpg')` : `url('${uploadedImgSrc}')`) : `url('assets/img-${x}.jpg')`)

const arenaTable = document.querySelector('.arena__table')
const welcomePage = document.querySelector('.welcome')
const overlay = document.querySelector('.overlay')

/********************* Class Definitions ****************************   */

class timer {
  constructor() {
    this.msec = 0
    this.sec = 0
    this.mins = 0
    this.run = true  //true if timer is running
    this.totMsec = 0  //100Msec == 1sec, not 'milliseconds'
    this.time = ''  //Time in string format
  }
count(){
  if (this.run) {
    this.msec++
    this.totMsec++
    if (this.msec === 100) {
      this.sec++
      this.msec = 0
    }
    if (this.sec >= 60) {
      this.mins += Math.floor(this.sec/60)
      this.sec = this.sec % 60
    }
    this.time = `${('0'+this.mins).slice(-2)} : ${('0'+this.sec).slice(-2)} . ${this.msec}`
    document.querySelector('#time').textContent = this.time  //Updates the timer display
    document.querySelector('#moves').textContent = moves  //Updates the moves display
    setTimeout(this.count.bind(this), 10)  //Runs every 10milliseconds
  }
}
}

class userScore {
  constructor(timeInMsec, time, moves) {
    try {
      this.username = navigator.userAgentData.platform
    } catch (e) {  //Error if browser blocks access to '.platform' in insecure connections
      this.username = 'Captain Anonymous'
    }
    this.timeInMsec = timeInMsec
    this.time = time
    this.moves = moves
    this.size = `${numRow}*${numCol}`
    this.challenge = (challenge != []) ? '<= CHALLENGE =>' : ''
    let current = new Date();
    let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
    let cTime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
    this.date = cDate + ' ' + cTime; 
}
}

/************************Function Definitions**********************/

/**
 * Marks the checked options in the DOM by modifying their styles.
 * Texts: Gold(selected), Aquamarine(unselected)
 * Pics outline: Gold(selected), None(unselected)
 */
function markCheckedOptions() {
  welcomePage.querySelectorAll('label').forEach(()=>{
    addEventListener('click', () => {
      document.querySelectorAll('.checkable-text').forEach(el => {
        el.checked ? document.querySelector('.' + el.id + '-label').style.color = 'gold' : document.querySelector('.' + el.id + '-label').style.color = 'aquamarine'
    })
    document.querySelectorAll('.checkable-pic').forEach(el => {
        el.checked ? document.querySelector('.' + el.id + '-label').style.outline = 'solid 1px gold' : document.querySelector('.' + el.id + '-label').style.outline = 'none'
    })
  })})
}

/**
 * Sets up the game page by adding event listeners to various elements.
 *
 * @param {object} e - The event object.
 * @param {string} e.target.closest('.tile').dataset - The dataset of the closest tile element.
 * @return {undefined} This function does not return a value.
 */
function setGamePage () {
  arenaTable.addEventListener('click', (e) => playTiles(e.target.closest('.tile').dataset))
  document.addEventListener('keydown', (e) => keyPressHandler(e))
  document.querySelector('.pause').addEventListener('click', () => pauseOrResumeGame(playerTime))
  document.querySelector('.toggle-mode').addEventListener('click', toggleNumbers)
}

/**
 * Sets up the welcome page functionality.
 */
function setWelcomePage () {
  const howToPlayPage = document.querySelector('.how-to-play')
  document.querySelector('.welcome__proceed-start').addEventListener('click', startGame)  //Starts game on click
  document.querySelector('.welcome__proceed-howto').addEventListener('click', () => {
    //Hides the welcome page and opens up the how-to-play page
    hideElement(welcomePage)
    hideElement(howToPlayPage, false)
  })
  document.querySelector('.back-to-welcome').addEventListener('click', () => {
    //Back to welcome page
    hideElement(welcomePage, false)
    hideElement(howToPlayPage)
  })
  document.querySelector('.challenge-level2-label').addEventListener('click', () => {
    challenge.includes(2) ? challenge.pop(2) : challenge.push(2)  //Toggles challenge mode 2 in challenge array
    challengeLevel2()
  })
}

/**
 * Hides or unhides an element by adding or removing the 'hidden' class.
 *
 * @param {HTMLElement} el - The element to hide or unhide.
 * @param {boolean} [hidden=true] - Optional. If true, the element will be hidden. If false, the element will be unhidden.
 */
function hideElement(el, hidden = true) {
  hidden ? el.classList.add('hidden') : el.classList.remove('hidden')
}

/**
 * Shuffles an array randomly and checks if it is solvable.
 *
 * @param {Array} array - The array to be shuffled.
 * @param {boolean} solvable - (optional) Flag indicating whether the shuffled array should be solvable. Defaults to true.
 * @return {Array} The shuffled array.
 */
function shuffleArray(array, solvable = true) {
  const getInversions = (arr) => {
    let inversions = 0
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === 0) continue
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j] === 0) continue
        if (arr[i] > arr[j]) inversions++
      }
    }
    return inversions
  }
  //Checks if the array is solvable
  const isSolvable = (arr) => {
    const inversions = getInversions(arr)
    const emptyTileRowFromBelow =
      numRow - Math.floor(arr.indexOf(0) / numCol)
    return (
      (numCol % 2 && inversions % 2 === 0) ||
      (numCol % 2 === 0 &&
        ((emptyTileRowFromBelow % 2 === 0 && inversions % 2 === 1) ||
          (emptyTileRowFromBelow % 2 === 1 && inversions % 2 === 0)))
    )
  }
  
  let arrayCopy = array.slice()
  do {
    arrayCopy.sort(() => Math.random() - 0.5)
  } while (solvable && !isSolvable(arrayCopy))  //Randomises until the array is solvable, if solvable is true

  solvability = isSolvable(arrayCopy)
  return arrayCopy
}

/**
 * Generates an HTML Table representation of the arena table and updates the HTML.
 *
 * @param {number} numRow - the number of rows in the arena table
 * @param {number} numCol - the number of columns in the arena table
 * @param {Array} dataArray - an array containing the values for each cell in the arena table
 * @param {HTMLElement} arenaTable - the HTML element representing the arena table
 * @param {timer} playerTime - an instance of the timer class
 * @return {void}
 */
function setArena() {
  let outputString = ''
  for(let i = 0; i < numRow; i++){
    outputString += '<tr>'
    for(let j = 0; j < numCol; j++){
      if (dataArray[i * numCol + j] === 0){
        outputString += `<td class="blank" data-row = ${i} data-col = ${j} data-value = 0 ></td>`
      } else {
        outputString += `<td class="tile" data-row = ${i} data-col = ${j} data-value = ${dataArray[i * numCol + j]} ><span class="tile__number hidden">` + dataArray[i * numCol + j] + '</span></td>'
      }
    }
    outputString += '</tr>\n'
  }
  arenaTable.innerHTML = outputString
  playerTime = new timer()
  playerTime.count()
}

/**
 * Moves a tile on the specified axis by the given step.
 *
 * @param {Element} tile - The tile to be moved.
 * @param {number} step - The distance to move the tile by.
 * @param {string} axis - The axis on which to move the tile ('x' or 'y').
 * @param {boolean} [animate=true] - Whether to animate the tile movement (default is true).
 */
function moveTile(tile, step, axis, animate = true) {
  axis === 'x' ? tile.dataset.col = Number(tile.dataset.col) - step : tile.dataset.row = Number(tile.dataset.row) - step
  let [x, y] = getTranslateXY(tile.style.transform)
  animate ? tile.classList.add('zoom-animation') : null
  tile.style.transform = (axis === 'x') ? `translateX(${x - 100*step}%) translateY(${y}%)` : tile.style.transform = `translateX(${x}%) translateY(${y-100*step}%)`
  setTimeout(() => {
    tile.classList.remove('zoom-animation')
  }, 225);
}

/**
 * Extracts the X and Y values from a string representing a CSS transform in the format "translateX(x%) translateY(y%)".
 *
 * @param {string} s - The string representing the CSS transform.
 * @return {Array<number>} An array containing the X and Y values extracted from the string.
 */
function getTranslateXY(s) {
  const regex = /translateX\(([-\d.]+)%\) translateY\(([-\d.]+)%\)/
  const matches = s.match(regex)
  if (matches) {
    const x = parseInt(matches[1])
    const y = parseInt(matches[2])
    return ([x, y])
  }
}

/**
 * Retrieves the tile at the specified position.
 *
 * @param {number} x - The x-coordinate of the tile.
 * @param {number} y - The y-coordinate of the tile.
 * @return {Element} The tile element at the given position.
 */
function tileAtPos(x, y) {
  if (!(x >= 0 && x < numRow && y >= 0 && y < numCol)) {
    return
  }
  return document.querySelector(`[data-row="${x}"][data-col="${y}"]`)
}

/**
 * Play tiles based on the clicked tile position.
 * 
 * @param {object} clickedTilePos - The position of the clicked tile.
 */
function playTiles(clickedTilePos) {
  // Check if clickedTilePos is undefined or null
  if (!clickedTilePos) {
    return;
  }

  // Calculate the target move based on the clicked tile position and the blank tile position
  let targetMove = [
    1 * clickedTilePos.row - 1 * blankTile.dataset.row,
    1 * clickedTilePos.col - 1 * blankTile.dataset.col
  ];

  // Check if both targetMove elements are either truthy or falsy
  if (!targetMove[0] == !targetMove[1]) {
    return;
  } else if (targetMove[0]) {
    // Move the tiles vertically
    for (let i = Math.sign(targetMove[0]); Math.abs(i) <= Math.abs(targetMove[0]); i += Math.sign(targetMove[0])) {
      moveTile(tileAtPos(1 * blankTile.dataset.row + i, 1 * blankTile.dataset.col), Math.sign(targetMove[0]), 'y');
    }
    moveTile(blankTile, -targetMove[0], 'y', false);
  } else if (targetMove[1]) {
    // Move the tiles horizontally
    for (let i = Math.sign(targetMove[1]); Math.abs(i) <= Math.abs(targetMove[1]); i += Math.sign(targetMove[1])) {
      moveTile(tileAtPos(1 * blankTile.dataset.row, 1 * blankTile.dataset.col + i), Math.sign(targetMove[1]), 'x');
    }
    moveTile(blankTile, -targetMove[1], 'x', false);
  }

  // Increment the moves counter
  moves++;

  // Check if the move is a winning move
  if (isWinnerMove()) {
    displayWin();
  }
}

/**
 * Check if the current move is a winning move by comparing the current array state with that of solution array.
 *
 * @return {boolean} True if the current move is a winning move, otherwise false.
 */
function isWinnerMove() {
  for (let i = 0; i < numRow; i++) {
    for (let j = 0; j < numCol; j++) {
      if (tileAtPos(i, j).dataset.value != solArray[i * numCol + j]) {
        return false
      }
    }
  }
  return true
}

/**
 * Displays the win alert and updates the leaderboard.
 */
function displayWin() {
  hideElement(document.querySelector('.winner-alert'), false)
  hideElement(overlay, false)
  document.querySelector('.winner-alert__time').textContent = `${('0'+playerTime.mins).slice(-2)} : ${('0'+playerTime.sec).slice(-2)} . ${('0'+playerTime.msec).slice(-2)}`
  document.querySelector('.winner-alert__moves').textContent = moves
  playerTime.run = false
  rankCurr = new userScore(playerTime.totMsec, playerTime.time, moves)
  window.localStorage.setItem(`lbd-${window.localStorage.length}`, JSON.stringify(rankCurr))  //Storing scores under the code index lbd-i
  document.querySelector('.winner-alert__show-leaderboard').addEventListener('click', displayLeaderboard)
}

/**
 * Handles the key press event and performs the corresponding action based on the key pressed.
 *
 * @param {KeyboardEvent} e - The key press event object.
 * @return {void} This function does not return a value.
 */
function keyPressHandler(e) {
  window.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
      e.preventDefault()  //Prevent the browser from scrolling
    }
  })
  if (['ArrowDown','S', 's'].includes(e.key)) {
    playTiles(tileAtPos(1 * blankTile.dataset.row + 1, 1 * blankTile.dataset.col).dataset)
  } else if (['ArrowUp','W', 'w'].includes(e.key)) {
    playTiles(tileAtPos(1 * blankTile.dataset.row - 1, 1 * blankTile.dataset.col).dataset)
  } else if (['ArrowLeft','A', 'a'].includes(e.key)) {
    playTiles(tileAtPos(1 * blankTile.dataset.row, 1 * blankTile.dataset.col - 1).dataset)
  } else if (['ArrowRight','D', 'd'].includes(e.key)) {
    playTiles(tileAtPos(1 * blankTile.dataset.row, 1 * blankTile.dataset.col + 1).dataset)
  }
}

/**
 * Pauses or resumes the game based on the current state of the timer.
 *
 * @param {object} timer - The timer object that controls the game's timing.
 * @return {void} This function does not return a value.
 */
function pauseOrResumeGame(timer) {
  if (timer.run) {
    timer.run = false
    hideAllTiles()
    setPauseButtonText('RESUME')
  } else {
    timer.run = true
    timer.count()
    showAllTiles()
    setPauseButtonText('PAUSE')
  }
}

function hideAllTiles() {
  tiles.forEach(tile => hideElement(tile))
}

function showAllTiles() {
  tiles.forEach(tile => hideElement(tile, false))
}

function setPauseButtonText(text) {
  document.querySelector('.pause').textContent = text
}

/**
 * Toggles the visibility of all number elements visually on the tiles.
 *
 * @param {Element} numberElement - the number element to toggle visibility for
 * @return {void} This function does not return a value
 */
function toggleNumbers() {
  document.querySelectorAll('.tile__number').forEach(numberElement => {
    numberElement.classList.toggle('hidden')
  })
}

/**
 * Constructs a leaderboard by retrieving stored items from local storage 
 * and sorting them based on timeInMsec and moves.
 *
 * @return {Array} The leaderboard array sorted by timeInMsec and moves.
 */
function constructLeaderboard() {
  const leaderboard = []
  
  for (let i = 0; i < window.localStorage.length; i++) {
    const itemKey = `lbd-${i}`
    const storedItem = window.localStorage.getItem(itemKey)
    
    if (storedItem) {  // Check if the item exists
      leaderboard.push(JSON.parse(storedItem))
    }
  }
  
  leaderboard.sort((a, b) => {
    if (a.timeInMsec !== b.timeInMsec) {
      return a.timeInMsec - b.timeInMsec
    }
    
    return a.moves - b.moves
  })
  
  return leaderboard
}

/**
 * Displays the leaderboard on the screen.
 *
 * @return {undefined} This function does not return anything.
 */
function displayLeaderboard() {
  let leaderboard = constructLeaderboard()
  hideElement(document.querySelector('.leaderboard'), false)
  hideElement(document.querySelector('.winner-alert'))
  for (let i = 0; i < Math.min(3, leaderboard.length); i++) {
    document.querySelector(`.leaderboard__rank${i+1}-name`).textContent = leaderboard[i].username
    document.querySelector(`.leaderboard__rank${i+1}-time`).textContent = leaderboard[i].time
    document.querySelector(`.leaderboard__rank${i+1}-moves`).textContent = leaderboard[i].moves
    document.querySelector(`.leaderboard__rank${i+1}-date`).textContent = leaderboard[i].date
    document.querySelector(`.leaderboard__rank${i+1}-size`).textContent = leaderboard[i].size
    document.querySelector(`.leaderboard__rank${i+1}-cmode`).textContent = leaderboard[i].challenge
  }
}

/**
 * Loads an image to the arena based on user selection.
 *
 * @return {undefined} This function does not return a value.
 */
function loadImgToArena() {
  let x = 2
  let clickablePics = document.querySelectorAll('.checkable-pic')
  for (let i = 1; i <= clickablePics.length; i++) {
    if (clickablePics[i-1].checked) {
      //Getting the selected image
      x = i
      break
    }
  }
  x === 5 ? document.querySelectorAll('.tile__number').forEach(numEl => hideElement(numEl, false)) : 0
  const tileArray = Array.from(document.querySelectorAll('.tile'))
  tileArray.forEach((tile) => {
    const tileRow = Math.floor((1*tile.dataset.value - 1)/ numCol)
    const tileCol = (1*tile.dataset.value -1) % numCol
    tile.style.backgroundImage = imgUrl(x)
    tile.style.backgroundPosition = `${tileCol * 100/(numCol-1)}% ${tileRow * 100/(numRow-1)}%`
  })
}

/**
 * Starts the game by setting up the board, initializing variables, and executing challenge functions.
 */
function startGame() {
  numRow = document.getElementById('boardsize-row').value
  numCol = document.getElementById('boardsize-col').value

  document.querySelectorAll('.challenge-option').forEach((el, index) => {
    el.checked ? challenge.push(index + 1) : 0
  })

  document.querySelectorAll('.theme-option').forEach((el, index) => {
    el.checked ? (themeChoice = index + 1) : 0
  })

  solArray = Array.from({length: numRow * numCol - 1}, (_, k) => k + 1);  solArray.push(0)
  dataArray = shuffleArray(solArray, !challenge.includes(3))

  setArena()

  tiles = document.querySelectorAll('.tile')
  blankTile = document.querySelector('.blank')

  tiles.forEach(tile => tile.style.transform = 'translateX(0%) translateY(0%)')
  blankTile.style.transform = 'translateX(0%) translateY(0%)'

  loadImgToArena()

  hideElement(welcomePage)
  hideElement(overlay)

  setTheme()
  executeChallenges()
}

/**
 * Freezes a random selection of tiles on the page for a period of time.
 *
 * @return {void} This function does not return a value.
 */
function freezeRandomTiles() {
  const tiles = Array.from(document.querySelectorAll('.tile'))
  const frozenTiles = []

  // Generate random indices
  while (frozenTiles.length < Math.floor(numRow*numCol/5)) {
    const randomIndex = Math.floor(Math.random() * tiles.length)
    if (!frozenTiles.includes(randomIndex)) {
      frozenTiles.push(randomIndex)
    }
  }

  // Apply freeze style to the selected tiles
  frozenTiles.forEach(index => {
    tiles[index].classList.add('frozen')
      observer.observe(tiles[index], { attributes: true })
  })

  // Remove freeze after 10 seconds
  setTimeout(() => {
    frozenTiles.forEach(index => {
      tiles[index].classList.remove('frozen')
    })
    // Stop observing the tiles for attribute changes
    observer.disconnect()
  }, 10000)

}

/**
 * Debits the player's time and moves based on the given time and move values.
 *
 * @param {number} timeInSec - The amount of time in seconds to be added to the player's total time.
 * @param {number} move - The number of moves to be added to the player's total moves.
 */
function imposePenalty(timeInSec, move) {
  playerTime.totMsec += timeInSec * 100
  playerTime.sec += timeInSec
  moves += move
}

/**
 * If the challenge includes level 2:
 *   - Sets the minimum board size to 5x5.
 *   - Sets the default board size to 5x5.
 *   - Changes the images displayed.
 *   - Enables image upload.
 * If the challenge does not include level 2:
 *   - Sets the minimum board size to 2x2.
 *   - Sets the default board size to 4x4.
 *   - Changes the images displayed.
 *   - Disables image upload.
 */
function challengeLevel2() {
  if (challenge.includes(2)) {
    //Setting min board size to 5*5
    document.getElementById('boardsize-row').min = 5
    document.getElementById('boardsize-row').value = 5
    document.getElementById('boardsize-col').min = 5
    document.getElementById('boardsize-col').value = 5
    //Changing images
    for (let i = 1; i < 5; i++) {
      document.querySelector(`.pic${i}-label`).src = `assets/img-${i + 5}.jpg`
    }
    //Enabling img upload
    document.querySelector('#imageUploader').htmlFor = 'uploadedImg-pic'
    document.querySelector(`.pic5-label`).src = 'assets/img-10-c.jpg'

  } else {
    //Setting min board size to 5*5
    document.getElementById('boardsize-row').min = 2
    document.getElementById('boardsize-row').value = 4
    document.getElementById('boardsize-col').min = 2
    document.getElementById('boardsize-col').value = 4
    //Changing images
    for (let i = 1; i < 5; i++) {
      document.querySelector(`.pic${i}-label`).src = `assets/img-${i}.jpg`
    }
    //Disabling img upload
    document.querySelector('#imageUploader').htmlFor = 'pic-5'
    document.querySelector(`.pic5-label`).src = 'assets/img-5-c.jpg'
  }

}

/**
 * On pressing the surrender button, if the puzzle was unsolvable, alert is displayed, else it's treated as winner-move.
 *
 * @param {None} No parameters are required.
 * @return {None} The function does not return any value.
 */
function challengeImpossible() {
  const surrenderButton = document.querySelector('.surrender')
  hideElement(surrenderButton, false)
  surrenderButton.addEventListener('click', () => {
    if (solvability) {
      if(!alert('Puzzle was solvable! :-(')) {
        window.location.reload()
      }
    } else {
      displayWin()
    }
  })
}

function executeChallenges() {
  
  //For challenge mode 1
  if (challenge.includes(1)) {
    observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        // Check if the mutation is for the dataset.row or dataset.col attribute
        if (
          mutation.attributeName === 'data-row' ||
          mutation.attributeName === 'data-col'
        ) {
          imposePenalty(10, 2)
        }
      })
    })
    setInterval(freezeRandomTiles, 15000)
  }
  
  //For challenge mode 3
  if (challenge.includes(3)) {
    challengeImpossible()
  }
}

/**
 * Sets the theme based on the value of themeChoice.
 *
 * @param {number} themeChoice - The value indicating the chosen theme.
 */
function setTheme() {
  const bodyStyle = document.body.style
  if (themeChoice == 2) {
    bodyStyle.fontFamily = "'Press Start 2P', cursive"
    bodyStyle.backgroundColor = 'black'
    bodyStyle.backgroundImage = 'none'
    bodyStyle.color = 'white'
  } else if (themeChoice == 3) {
    bodyStyle.fontFamily = "'Lato', sans-serif"
    bodyStyle.backgroundImage = "url('assets/bg-3.jpg')"
  }
}

/**
 * Loads the user uploaded image.
 */
function loadUserImg() {
  window.addEventListener('load', function() {
    document.querySelector('input[type="file"]').addEventListener('change', function() {
        //Checking on img upload
        document.querySelector('#pic5').checked = true
        if (this.files && this.files[0]) {
            uploadedImgSrc = URL.createObjectURL(this.files[0])
        }
    })
  })
}

/********************************Main Code****************************  */

loadUserImg()
setWelcomePage()
markCheckedOptions()
setGamePage()