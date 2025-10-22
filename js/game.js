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
var gBoard
var gTimerId

function onInit() {
  gGame.isOn = true
  gBoard = createBoard(gLevel.SIZE)
  console.table(gBoard)
  renderBoard(gBoard)
  coverAllCells()

  //-------------------------------to check
  //   gBoard[0][0].isMine = true
  //   renderCell({ i: 0, j: 0 }, MINE)
  //   gBoard[3][3].isMine = true
  //   renderCell({ i: 3, j: 3 }, MINE)
  //   createNumbers()
  //-------------------------------to check
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
  //reveal
  var index = getIndexFromClass(elCell)
  var currCell = gBoard[index.i][index.j]
  //modal
  gBoard[index.i][index.j].isRevealed = true
  //DOM
  if (currCell.isMine) renderCell(index, MINE)
  else {
    renderCell(index, currCell.minesAroundCount)
  }

  //checks
  var currCellInnerSpace = currCell.isMine ? MINE : currCell.minesAroundCount
  //------------------------------------------------
  if (gGame.revealedCount === 0) {
    gGame.revealedCount += 1
    createMinesAndNumbers(index)
  } //------------------------------------------------
  else if (currCellInnerSpace === MINE) {
    gLevel.LIVES -= 1
    if (gLevel.LIVES >= 0) unRevealMine(index)
    else gameOver()
  } //------------------------------------------------
  else if (currCellInnerSpace === 0) {
    //model+DOM
    revealAllNeighbors(index)
  } //------------------------------------------------
  else {
    gGame.revealedCount += 1
  }
  checkWin()
}

function onRightClickCell(event, elCell) {
  event.preventDefault() //disable the context menu
  if (!gGame.isOn) return
  var cellIndex = getIndexFromClass(elCell)
  const currCell = gBoard[cellIndex.i][cellIndex.j]
  if (currCell.isMarked) {
    //model
    gBoard[cellIndex.i][cellIndex.j].isMarked = false
    gGame.markedCount -= 1
    //DOM
    renderCell(cellIndex, COVER)
  } else {
    //model
    gBoard[cellIndex.i][cellIndex.j].isMarked = true
    gGame.markedCount += 1
    //DOM
    renderCell(cellIndex, FLAG)
    checkWin()
  }
}

function gameOver() {
  console.log('Game Over')
  clearInterval(gTimerId)
  revealAllMines()
  // resetGame()
}

function checkWin() {
  var cellNeedsToReveal = gLevel.SIZE ** 2 - gLevel.MINES
  if (gGame.revealedCount !== cellNeedsToReveal) return
  console.log('YOU WIN:')
  gGame.isOn = false
  revealAllMines()
}

function resetGame() {
  for (var key in gGame) {
    if (gGame[key] === true) gGame[key] = false
    else gGame[key] = 0
  }
  gLevel.LIVES = 3
  resetTimer()
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
  gLevel.SIZE = difficulty
  for (var i = 0; i < difficulties.length; i++) {
    if (difficulty === +difficulties[i].difficulty)
      gLevel.MINES = difficulties[i].mines
  }
  resetGame()
  onInit()
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

function resetTimer() {
  var elTimer = document.querySelector('.curr-time')
  elTimer.innerText = '00:00:00'
}
