'use strict'

const gLevel = {
  SIZE: 4,
  MINES: 2,
  LIVES: 3,
}

const gGame = {
  isOn: false,
  isStarted: false,
  revealedCount: 0,
  markedCount: 0,
  cellNeedsToReveal: 14,
}

const gModes = {
  hints: { isOn: false, amount: 3 },
  safe: { amount: 3 },
  undo: { amount: 2, lastMove: null },
  editor: {
    clicked: false,
    isPossible: true,
    isStarted: false,
    isDone: false,
    isEasyMode: true,
    minesCount: 0,
    mines: [],
  },
  mega: { isOn: false, amount: 1, cellAmountNeeded: 2, indexes: [] },
  exterminator: { amount: 1 },
}

const gTimer = {
  id: null,
  timer: 0,
  bestScore4: localStorage.getItem('Best Score 4x4'),
  bestScore8: localStorage.getItem('Best Score 8x8'),
  bestScore12: localStorage.getItem('Best Score 12x12'),
}

var gBoard

function onInit() {
  gGame.isOn = true
  gBoard = createBoard(gLevel.SIZE)
  console.table(gBoard)
  renderBoard(gBoard)
  //render start elements
  renderHearts()
  renderBestScore()
  renderFlagsLeft()
  clickCurrentDifficulty()
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

function renderBoard() {
  const elBoard = document.querySelector('.board')
  var strHTML = ''

  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += '<tr>\n'
    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      var cellClass = getClassName({ i: i, j: j })
      var value = currCell.isMine ? MINE : ''
      var onClicks =
        'oncontextmenu="onRightClickCell(event,this)" onclick="onClickCell(this)"'
      strHTML += `\t<td ${onClicks} class="cell ${cellClass}">${value}`
      strHTML += '</td>\n'
    }
    strHTML += '</tr>\n'
  }
  elBoard.innerHTML = strHTML
  coverAllCells()
}

function onClickCell(elCell) {
  if (!gGame.isOn) return
  var index = getIndexFromClass(elCell)
  var currCell = gBoard[index.i][index.j]
  //editor mode-----------------------------
  if (
    gModes.editor.clicked &&
    gGame.revealedCount === 0 &&
    !gModes.editor.isDone
  ) {
    gModes.editor.isStarted = true
  }
  if (gModes.editor.isStarted) {
    handleManualClicks(index)
    return
  }

  //game started - start timer
  if (!gTimer.id) startAndRenderTimer()
  if (currCell.isRevealed) return
  revealCell(index, currCell)

  //hints mode------------------------------
  if (gModes.hints.isOn) {
    getHints(elCell)
    return
  }
  //mega hint mode---------------------------
  if (gModes.mega.isOn && gModes.mega.cellAmountNeeded !== 0) {
    //collect the 2 clicked indexes
    gModes.mega.cellAmountNeeded -= 1
    gModes.mega.indexes.push(index)
    //make it yellow
    renderCell(index, YELLOW_CELL)
    //if we have the 2 clicked indexes
    if (gModes.mega.cellAmountNeeded === 0) revealMegaHint()
    return
  }

  //checks
  var currCellInnerSpace = currCell.isMine ? MINE : currCell.minesAroundCount
  //if its the first cell reveal - always will be 0
  if (gGame.revealedCount === 0) {
    gGame.isStarted = true
    gModes.editor.isPossible = false

    gGame.revealedCount += 1
    gBoard[index.i][index.j].isRevealed = true
    if (!gModes.editor.isDone) {
      createRandomMines(gLevel.MINES, index)
      createNumbers(index)
    }
  } else if (currCellInnerSpace === MINE) {
    gLevel.LIVES -= 1
    if (gLevel.LIVES >= 0) stepOnAMine(index)
    else gameOver()
  } else if (currCellInnerSpace === 0) {
    //model
    gGame.revealedCount += 1
    gBoard[index.i][index.j].isRevealed = true
    //expand all neighbors
    revealExpendedNeighbors(index)
  } else if (currCellInnerSpace > 0) {
    //model
    gGame.revealedCount += 1
    gBoard[index.i][index.j].isRevealed = true
    //for undo mode
    gModes.undo.lastMove = index
  }
  checkWin()
}

function onRightClickCell(event, elCell) {
  event.preventDefault() //disable the context menu
  if (!gGame.isOn) return
  if (!gGame.isStarted) return
  if (gModes.editor.clicked) return
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
    if (gGame.markedCount >= gLevel.MINES) {
      var msg = 'You already put all the flags'
      renderAlert(msg, 1.5)
      return
    }
    //model
    gBoard[cellIndex.i][cellIndex.j].isMarked = true
    gGame.markedCount += 1
    //DOM
    renderCell(cellIndex, FLAG)
    checkWin()
  }
  renderFlagsLeft()
}

function checkWin() {
  var cellNeedsToReveal = gLevel.SIZE ** 2 - gLevel.MINES
  if (
    gGame.revealedCount === cellNeedsToReveal &&
    gGame.markedCount === gLevel.MINES
  ) {
    gGame.isOn = false
    gGame.isStarted = false
    console.log('YOU WIN:')
    clearInterval(gTimer.id)
    //reveal mines
    revealAllMines('win')
    //render restart win button
    renderRestartBtnPerState('Win')
    //check best score
    saveBestScoreOnLocalStorage()
    renderBestScore()
    renderModal('win')
  }
}

function gameOver() {
  gGame.isOn = false
  gGame.isStarted = false
  console.log('Game Over')
  clearInterval(gTimer.id)
  //render red mines
  revealAllMines('lose')
  //render love restart button
  renderRestartBtnPerState('Lose')
  renderModal('lose')
}

function resetGame() {
  for (var key in gGame) {
    if (gGame[key] === true) gGame[key] = false
    else gGame[key] = 0
  }
  gLevel.LIVES = 3
  resetModes()
  renderRestartBtnPerState('Happy')
  document.querySelector('.modal').hidden = true
  onInit()
}

function resetModes() {
  //timer
  resetTimer()
  //model hints
  gModes.hints.amount = 3
  gModes.hints.isOn = false
  //DOM hints
  updateModeTextAmount('hints')
  var elBtn = document.querySelector('.hints')
  elBtn.innerHTML = HINTS_OFF

  //model safe
  gModes.safe.amount = 3
  //DOM safe
  updateModeTextAmount('safe')
  var elBtn = document.querySelector('.safe')
  elBtn.innerHTML = SAFE_CELL

  //model safe
  gModes.undo.amount = 2
  gModes.undo.lastMove = null
  //DOM safe
  updateModeTextAmount('undo')
  var elBtn = document.querySelector('.undo')
  elBtn.innerHTML = UNDO
  //editor mode model
  gModes.editor.isPossible = true
  gModes.editor.minesCount = 0
  gModes.editor.isDone = false
  gModes.editor.isStarted = false
  gModes.editor.clicked = false
  gModes.editor.mines = []
  //editor mode DOM
  var elEditor = document.querySelector('.editor-img')
  elEditor.innerHTML = ETIDOR_X

  //mega model
  gModes.mega.amount = 1
  gModes.mega.isOn = false
  gModes.mega.cellAmountNeeded = 2
  gModes.mega.indexes = []
  //mega DOM
  var elMega = document.querySelector('.mega')
  elMega.innerHTML = MEGA
  updateModeTextAmount('mega')
  //exterminator model
  gModes.exterminator.amount = 1
  setMinePerDifficulty()
  //exterminator DOM
  var elMega = document.querySelector('.exterminator')
  elMega.innerHTML = EXT
  updateModeTextAmount('exterminator')
  // gGame.cellNeedsToReveal = gLevel.SIZE ** 2 - gLevel.MINES
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
