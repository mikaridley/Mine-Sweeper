'use strict'

const gLevel = {
  SIZE: 4,
  MINES: 2,
  LIVES: 3,
}

const gGame = {
  isOn: false,
  revealedCount: 0,
  markedCount: 0,
  timer: 0,
}

const gModes = {
  hints: { state: false, amount: 3 },
}

var gBoard
var gTimerId
var gBestScore = localStorage.getItem('Best Score')

function onInit() {
  gGame.isOn = true
  gBoard = createBoard(gLevel.SIZE)
  console.table(gBoard)
  renderBoard(gBoard)
  coverAllCells()
  renderFlagsLeft()
  renderHearts()
  renderClickedEasyButton()
  renderBestScore()
}

function createCell() {
  var cell = {
    minesAroundCount: 0,
    isRevealed: false,
    isMine: false,
    isMarked: false,
  }
  return cell
}

function createBoard(size) {
  const board = []

  for (var i = 0; i < size; i++) {
    const row = []

    for (var j = 0; j < size; j++) {
      row.push(createCell())
    }
    board.push(row)
  }
  return board
}

function onClickCell(elCell) {
  if (!gGame.isOn) return
  if (!gTimerId) startAndRenderTimer()
  if (gModes.hints.state) {
    getHints(elCell)
    return
  }
  var index = getIndexFromClass(elCell)
  var currCell = gBoard[index.i][index.j]
  //if the cell is already revealed
  if (currCell.isRevealed) return
  //if a marked cell was clicked
  if (currCell.isMarked) {
    gBoard[index.i][index.j].isMarked = false
    gGame.markedCount -= 1
    renderFlagsLeft()
  }
  //reveal if its a mine or a number
  if (currCell.isMine) {
    renderCell(index, MINE)
  } else {
    renderCell(index, currCell.minesAroundCount)
  }

  //checks
  var currCellInnerSpace = currCell.isMine ? MINE : currCell.minesAroundCount
  //------------------------------------------------
  if (gGame.revealedCount === 0) {
    //model game must
    gGame.revealedCount += 1
    gBoard[index.i][index.j].isRevealed = true
    createMinesAndNumbers(index)
  } //------------------------------------------------
  else if (currCellInnerSpace === MINE) {
    gLevel.LIVES -= 1
    if (gLevel.LIVES >= 0) unRevealMine(index)
    else gameOver()
  } //------------------------------------------------
  else if (currCellInnerSpace === 0) {
    //model game must
    gGame.revealedCount += 1
    gBoard[index.i][index.j].isRevealed = true
    revealAllNeighbors(index)
  } //------------------------------------------------
  else if (currCellInnerSpace > 0) {
    //model game must
    gGame.revealedCount += 1
    gBoard[index.i][index.j].isRevealed = true
  }
  checkWin()
}

function onRightClickCell(event, elCell) {
  event.preventDefault() //disable the context menu
  if (!gGame.isOn) return
  var cellIndex = getIndexFromClass(elCell)
  const currCell = gBoard[cellIndex.i][cellIndex.j]
  if (currCell.isRevealed) return
  if (currCell.isMarked) {
    //model
    gBoard[cellIndex.i][cellIndex.j].isMarked = false
    gGame.markedCount -= 1

    //DOM
    renderCell(cellIndex, COVER)
  } else {
    //dont let it pass down the mines amount
    if (gGame.markedCount >= gLevel.MINES) return
    //model
    gBoard[cellIndex.i][cellIndex.j].isMarked = true
    gGame.markedCount += 1
    //DOM
    renderCell(cellIndex, FLAG)
    checkWin()
  }
  renderFlagsLeft()
}

function gameOver() {
  gGame.isOn = false
  console.log('Game Over')
  clearInterval(gTimerId)
  //render red mines
  revealAllMines('lose')
  //render love restart button
  renderRestartButton('Lose')
}

function checkWin() {
  var cellNeedsToReveal = gLevel.SIZE ** 2 - gLevel.MINES
  if (
    gGame.revealedCount === cellNeedsToReveal &&
    gGame.markedCount === gLevel.MINES
  ) {
    gGame.isOn = false
    console.log('YOU WIN:')
    //reveal mines
    revealAllMines('win')
    //clear time
    clearInterval(gTimerId)
    //render restart win button
    renderRestartButton('Win')
    //check best score
    saveBestScoreOnLocalStorage()
    renderBestScore()
  }
}

function resetGame() {
  for (var key in gGame) {
    if (gGame[key] === true) gGame[key] = false
    else gGame[key] = 0
  }
  console.log('gGame:', gGame)
  gLevel.LIVES = 3
  //model hints
  gModes.hints.amount = 3
  gModes.hints.state = false
  //DOM hints
  renderModeHeader('hints')
  var elBtn = document.querySelector('.hints')
  elBtn.innerHTML = HINTS_OFF
  //model stop timer
  clearInterval(gTimerId)
  gGame.timer = 0
  //DOM stop timer
  renderResetedTimer()
  //DOM restart button
  renderRestartButton('Happy')
  onInit()
}

function changeDifficulty(elButton) {
  var difficulties = [
    { difficulty: 4, mines: 2 },
    { difficulty: 8, mines: 14 },
    { difficulty: 12, mines: 32 },
  ]

  var dashIndex = elButton.className.indexOf('-')
  var difficulty = elButton.className
  difficulty = difficulty.substring(dashIndex + 1)
  gLevel.SIZE = +difficulty
  for (var i = 0; i < difficulties.length; i++) {
    if (+difficulty === difficulties[i].difficulty)
      gLevel.MINES = difficulties[i].mines
  }
  resetGame()
  onInit()
  //render clicked buttons
  if (+difficulty === 4) renderClickedEasyButton(elButton)
  if (+difficulty === 8) renderClickedMediumButton(elButton)
  if (+difficulty === 12) renderClickedHardButton(elButton)
}

function coverAllCells() {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      renderCell({ i, j }, COVER)
    }
  }
}

function startAndRenderTimer() {
  gTimerId = setInterval(() => {
    gGame.timer += 1
    var elTimer = document.querySelector('.curr-time')
    elTimer.innerText = formatTimer(gGame.timer)
  }, 31)
}

function formatTimer(time) {
  const totalMs = time * 10

  let miliSeconds = Math.floor((totalMs % 1000) / 10)
  let seconds = Math.floor((totalMs % 60000) / 1000)
  let minutes = Math.floor((totalMs % 3600000) / 60000)

  if (miliSeconds < 10) miliSeconds = '0' + miliSeconds
  if (seconds < 10) seconds = '0' + seconds
  if (minutes < 10) minutes = '0' + minutes

  return `${minutes}:${seconds}:${miliSeconds}`
}
