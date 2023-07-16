/*************************************************   */

class timer {
  constructor() {
    this.msec = 0
    this.sec = 0
    this.mins = 0
    this.run = true
    this.totMsec = 0
    this.time = ''
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
    document.querySelector('#time').textContent = this.time
    document.querySelector('#moves').textContent = moves
    setTimeout(this.count.bind(this), 10)
  }
}
}

class userScore {
  constructor(timeInMsec, time, moves) {
    try {
      this.username = navigator.userAgentData.platform
    } catch (e) {
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
  } while (solvable && !isSolvable(arrayCopy))

  solvability = isSolvable(arrayCopy)
  return arrayCopy
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


function moveVertical (tile, step, animate = true) {
  tile.dataset.row = Number(tile.dataset.row) - step
  let [x, y] = getTranslateXY(tile.style.transform)
  if (animate) {
    tile.classList.add('zoom-animation')
  }
  tile.style.transform = `translateX(${x}%) translateY(${y-100*step}%)`
  setTimeout(() => {
    tile.classList.remove('zoom-animation')
  }, 250);
}

function moveHorizontal (tile, step, animate = true) {
  tile.dataset.col = Number(tile.dataset.col) - step
  let [x, y] = getTranslateXY(tile.style.transform)
  if (animate) {
    tile.classList.add('zoom-animation')
  }
  tile.style.transform = `translateX(${x - 100*step}%) translateY(${y}%)`
  setTimeout(() => {
    tile.classList.remove('zoom-animation')
  }, 200);
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
  if (!(x >= 0 && x < numRow && y >= 0 && y < numCol)) {
    return
  }
  return document.querySelector(`[data-row="${x}"][data-col="${y}"]`)
}

function playTiles(clickedTilePos) {
  if (!clickedTilePos) {
    return
  }
  let targetMove = Array(1 * clickedTilePos.row - 1 * blankTile.dataset.row, 1 * clickedTilePos.col - 1 * blankTile.dataset.col)
  if (!targetMove[0] == !targetMove[1]) {
    return
  } else if (targetMove[0]) {
    for (let i = Math.sign(targetMove[0]); Math.abs(i) <= Math.abs(targetMove[0]); i += Math.sign(targetMove[0])) {
      moveVertical(tileAtPos(1 * blankTile.dataset.row + i, 1 * blankTile.dataset.col), Math.sign(targetMove[0])) 
    }
    moveVertical(blankTile, -targetMove[0], false);
  } else if (targetMove[1]) {
    for (let i = Math.sign(targetMove[1]); Math.abs(i) <= Math.abs(targetMove[1]); i += Math.sign(targetMove[1])) {
      moveHorizontal(tileAtPos(1 * blankTile.dataset.row, 1 * blankTile.dataset.col + i), Math.sign(targetMove[1]))
    }
    moveHorizontal(blankTile, -targetMove[1], false)
  }
  moves++
  if (isWinnerMove()) {
    displayWin()
  }
}

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

function displayWin() {
  document.querySelector('.winner-alert').classList.remove('hidden')
  document.querySelector('.overlay').classList.remove('hidden')
  document.querySelector('.winner-alert__time').textContent = `${('0'+playerTime.mins).slice(-2)} : ${('0'+playerTime.sec).slice(-2)} . ${('0'+playerTime.msec).slice(-2)}`
  document.querySelector('.winner-alert__moves').textContent = moves
  playerTime.run = false
  rankCurr = new userScore(playerTime.totMsec, playerTime.time, moves)
  window.localStorage.setItem(`lbd-${window.localStorage.length}`, JSON.stringify(rankCurr))
  document.querySelector('.winner-alert__show-leaderboard').addEventListener('click', displayLeaderboard)
}

function keyPressHandler(e) {
  window.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
      e.preventDefault()
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

function pauseOrResumeGame(timer) {
  if (timer.run) {
    timer.run = false
    tiles.forEach(tile => tile.classList.add('hidden'))
    document.querySelector('.pause').textContent = 'RESUME'
  } else {
    timer.run = true
    timer.count()
    tiles.forEach(tile => tile.classList.remove('hidden'))
    document.querySelector('.pause').textContent = 'PAUSE'
  }
}

function toggleNumbers () {
  document.querySelectorAll('.tile__number').forEach(numEl => {
    if (numEl.classList.contains('hidden')) {
      numEl.classList.remove('hidden')
    } else {
      numEl.classList.add('hidden')
    }
  })
}

function constructLeaderboard() {
  let userList = []
  for (let i = 0; i < window.localStorage.length; i++) {
    if (window.localStorage.getItem(`lbd-${i}`)) {
      userList.push(JSON.parse(window.localStorage.getItem(`lbd-${i}`)))
    }
  }
  userList.sort((a, b) => (a.timeInMsec > b.timeInMsec) ? 1 :((a.timeInMsec < b.timeInMsec) ? -1 : ((a.moves > b.moves) ? 1 : ((a.moves < b.moves) ? -1 : 0 ))))
  return userList
}

function displayLeaderboard() {
  let Leaderboard = constructLeaderboard()
  document.querySelector('.leaderboard').classList.remove('hidden')
  document.querySelector('.winner-alert').classList.add('hidden')
  for (let i = 0; i < Math.min(3, Leaderboard.length); i++) {
    document.querySelector(`.leaderboard__rank${i+1}-name`).textContent = Leaderboard[i].username
    document.querySelector(`.leaderboard__rank${i+1}-time`).textContent = Leaderboard[i].time
    document.querySelector(`.leaderboard__rank${i+1}-moves`).textContent = Leaderboard[i].moves
    document.querySelector(`.leaderboard__rank${i+1}-date`).textContent = Leaderboard[i].date
    document.querySelector(`.leaderboard__rank${i+1}-size`).textContent = Leaderboard[i].size
    document.querySelector(`.leaderboard__rank${i+1}-cmode`).textContent = Leaderboard[i].challenge
  }
}

function loadImgToArena() {
  let x = 2
  let clickablePics = document.querySelectorAll('.checkable-pic')
  for (let i = 1; i <= clickablePics.length; i++) {
    if (clickablePics[i-1].checked) {
      x = i
      break
    }
  }
  x === 5 ? document.querySelectorAll('.tile__number').forEach(numEl => numEl.classList.remove('hidden')) : 0
  const tileArray = Array.from(document.querySelectorAll('.tile'))
  tileArray.forEach((tile) => {
    const tileRow = Math.floor((1*tile.dataset.value - 1)/ numCol)
    const tileCol = (1*tile.dataset.value -1) % numCol
    tile.style.backgroundImage = imgUrl(x)
    tile.style.backgroundPosition = `${tileCol * 100/(numCol-1)}% ${tileRow * 100/(numRow-1)}%`
  })
}

function startGame() {
  numRow = document.getElementById('boardsize-row').value
  numCol = document.getElementById('boardsize-col').value

  document.querySelectorAll('.challenge-option').forEach((el, i) => {
    el.checked ? challenge.push(i+1) : 0
  })

  document.querySelectorAll('.theme-option').forEach((el, i) => {
    el.checked ? (themeChoice = i + 1) : 0
  })

  solArray = Array.from({length: numRow * numCol - 1}, (_, k) => k + 1);  solArray.push(0)
  dataArray = shuffleArray(solArray, !challenge.includes(3))

  setArena()

  document.querySelectorAll('.tile').forEach(tile => tile.style.transform = 'translateX(0%) translateY(0%)')
  document.querySelectorAll('.blank').forEach(tile => tile.style.transform = 'translateX(0%) translateY(0%)')

  loadImgToArena()

  tiles = document.querySelectorAll('.tile')
  blankTile = document.querySelector('.blank')

  document.querySelector('.welcome').classList.add('hidden')
  document.querySelector('.overlay').classList.add('hidden')

  setTheme()
  executeChallenges()
}

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

function imposePenalty(timeInSec, move) {
  playerTime.totMsec += timeInSec * 100
  playerTime.sec += timeInSec
  moves += move
}

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

function challengeImpossible() {
  document.querySelector('.surrender').classList.remove('hidden')
  document.querySelector('.surrender').addEventListener('click', () => {
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
  if (challenge.includes(3)) {
    challengeImpossible()
  }
}

function setTheme() {
  if (themeChoice == 2) {
    document.body.style.fontFamily = "'Press Start 2P', cursive"
    document.body.style.backgroundColor = 'black'
    document.body.style.backgroundImage = 'none'
    document.body.style.color = 'white'
  } else if (themeChoice == 3) {
    document.body.style.fontFamily = "'Lato', sans-serif"
    document.body.style.backgroundImage = "url('assets/bg-3.jpg')"
  }
}

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


/********************Global Variable Declarations*********************/

let solvability
const challenge = []  //1 for subzero, 2 for level-2, 3 for mission:impossible
let themeChoice  //1: Modern, 2:Classic, 3:Minimalist
let numRow = 4
let numCol = 4
let moves = 0
let playerTime
let rankCurr
let solArray
let dataArray
let tiles
let blankTile
let uploadedImgSrc
let observer
const imgUrl = (x) => (challenge.includes(2) ? (x !== 5 ?  `url('assets/img-${x + 5}.jpg')` : `url('${uploadedImgSrc}')`) : `url('assets/img-${x}.jpg')`)

const arenaTable = document.querySelector('.arena__table')


/********************************Main Code****************************  */
loadUserImg()
document.querySelector('.welcome__proceed-start').addEventListener('click', startGame)
document.querySelector('.welcome__proceed-howto').addEventListener('click', () => {
  document.querySelector('.welcome').classList.add('hidden')
  document.querySelector('.how-to-play').classList.remove('hidden')
})
document.querySelector('.back-to-welcome').addEventListener('click', () => {
  document.querySelector('.welcome').classList.remove('hidden')
  document.querySelector('.how-to-play').classList.add('hidden')
})

document.querySelector('.challenge-level2-label').addEventListener('click', () => {
  if (challenge.includes(2)) {
    challenge.pop(2)
    challengeLevel2()
  } else {
    challenge.push(2)
    challengeLevel2()
  }
})

//////////////////////////  AT START  ////////////////////////////
document.querySelector('.welcome').querySelectorAll('label').forEach(()=>{addEventListener('click', () => {
  document.querySelectorAll('.checkable-text').forEach(el => {
    el.checked ? document.querySelector('.' + el.id + '-label').style.color = 'gold' : document.querySelector('.' + el.id + '-label').style.color = 'aquamarine'
  })
  document.querySelectorAll('.checkable-pic').forEach(el => {
    el.checked ? document.querySelector('.' + el.id + '-label').style.outline = 'solid 1px gold' : document.querySelector('.' + el.id + '-label').style.outline = 'none'
  })
})})
////////////////////////////////////////////////////////////////////

arenaTable.addEventListener('click', (e) => playTiles(e.target.closest('.tile').dataset))
document.addEventListener('keydown', (e) => keyPressHandler(e))
document.querySelector('.pause').addEventListener('click', () => pauseOrResumeGame(playerTime))
document.querySelector('.toggle-mode').addEventListener('click', toggleNumbers)

//////////////////////////  SET IMG    /////////////////////////////
