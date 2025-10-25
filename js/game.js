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
  hints: { state: false, amount: 3 },
  safe: { amount: 3 },
  undo: { amount: 2, lastMove: null },
  editor: {
    clicked: false,
    isPossible: true,
    isStarted: false,
    isDone: false,
    minesCount: 0,
    mines: [],
  },
  mega: { state: false, amount: 1, cellAmountNeeded: 2, indexes: [] },
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
  coverAllCells()
  renderFlagsLeft()
  renderHearts()
  renderBestScore()
  diffBtnClickedPerDiff()
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
  )
    gModes.editor.isStarted = true
  if (gModes.editor.isStarted) {
    if (!isObjectinObjectArr(gModes.editor.mines, index)) {
      insertMine(index)
      gModes.editor.minesCount += 1
      //render flags
      var elFlg = document.querySelector('.flags-amount')
      elFlg.innerHTML = gLevel.MINES - gModes.editor.minesCount
    } else {
      gModes.editor.minesCount -= 1
      renderCell(index, COVER)
      gModes.editor.mines.pop()
      //render flags
      var elFlg = document.querySelector('.flags-amount')
      elFlg.innerHTML = gLevel.MINES - gModes.editor.minesCount
    }
    if (gModes.editor.minesCount === gLevel.MINES) {
      //let the mines stay on board for some sec
      setTimeout(() => {
        createNumbers(index)
        coverAllCells()
        renderFlagsLeft()
      }, 2500)
      gModes.editor.isStarted = false
      gModes.editor.isDone = true
      renderEditorModeToggle()
      //alert
      var msg = "You've finished putting all the mines"
      renderAlert(msg, 2.5)
    }
    gModes.editor.clicked = false
    return
  }
  //--------------------------------------

  //hints mode
  if (gModes.hints.state) {
    getHints(elCell)
    return
  }
  //mega hint mode
  if (gModes.mega.state && gModes.mega.cellAmountNeeded !== 0) {
    gModes.mega.cellAmountNeeded -= 1
    gModes.mega.indexes.push(index)
    animateMegaHint(index)
    if (gModes.mega.cellAmountNeeded === 0) getMegaHint()
    return
  }
  if (!gTimer.id) startAndRenderTimer()
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
  if (currCellInnerSpace === MINE) {
    gLevel.LIVES -= 1
    if (gLevel.LIVES >= 0) unRevealMine(index)
    else gameOver()
  } //------------------------------------------------
  else if (gGame.revealedCount === 0) {
    gGame.isStarted = true
    gModes.editor.isPossible = false
    //model game must
    gGame.revealedCount += 1
    gBoard[index.i][index.j].isRevealed = true
    if (!gModes.editor.isDone) {
      createRandomMines(gLevel.MINES, index)
      createNumbers(index)
    }
  } //------------------------------------------------
  else if (currCellInnerSpace === 0) {
    //model game must
    gGame.revealedCount += 1
    gBoard[index.i][index.j].isRevealed = true
    //expand all neighbors
    revealExpendedNeighbors(index)
  } //------------------------------------------------
  else if (currCellInnerSpace > 0) {
    //model game must
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

function checkWin() {
  var cellNeedsToReveal = gLevel.SIZE ** 2 - gLevel.MINES
  if (
    gGame.revealedCount === cellNeedsToReveal &&
    gGame.markedCount === gLevel.MINES
  ) {
    gGame.isOn = false
    gGame.isStarted = false
    console.log('YOU WIN:')
    //reveal mines
    revealAllMines('win')
    //clear time
    clearInterval(gTimer.id)
    //render restart win button
    renderRestartButton('Win')
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
  renderRestartButton('Lose')
  renderModal('lose')
}

function resetGame() {
  for (var key in gGame) {
    if (gGame[key] === true) gGame[key] = false
    else gGame[key] = 0
  }
  gLevel.LIVES = 3
  resetModes()
  //model stop timer
  clearInterval(gTimer.id)
  gTimer.timer = 0
  gTimer.bestScore4 = null
  gTimer.bestScore8 = null
  gTimer.bestScore12 = null
  //DOM stop timer
  renderResetedTimer()
  //DOM restart button
  renderRestartButton('Happy')
  //hide modal
  document.querySelector('.modal').hidden = true
  onInit()
}

function resetModes() {
  //model hints
  gModes.hints.amount = 3
  gModes.hints.state = false
  //DOM hints
  renderModeHeader('hints')
  var elBtn = document.querySelector('.hints')
  elBtn.innerHTML = HINTS_OFF

  //model safe
  gModes.safe.amount = 3
  //DOM safe
  renderModeHeader('safe')
  var elBtn = document.querySelector('.safe')
  elBtn.innerHTML = SAFE_CELL

  //model safe
  gModes.undo.amount = 2
  gModes.undo.lastMove = null
  //DOM safe
  renderModeHeader('undo')
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
  gModes.mega.state = false
  gModes.mega.cellAmountNeeded = 2
  gModes.mega.indexes = []
  //mega DOM
  var elMega = document.querySelector('.mega')
  elMega.innerHTML = MEGA
  renderModeHeader('mega')
  //exterminator model
  gModes.exterminator.amount = 1
  setMinePerDiff()
  //exterminator DOM
  var elMega = document.querySelector('.exterminator')
  elMega.innerHTML = EXT
  renderModeHeader('exterminator')
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
