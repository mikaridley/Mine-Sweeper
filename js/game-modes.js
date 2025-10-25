'use strict'

//timer-----------------------------------------
function startAndRenderTimer() {
  var startTime = Date.now()
  gTimer.id = setInterval(() => {
    var currTime = Date.now()
    gTimer.timer = currTime - startTime
    var elTimer = document.querySelector('.curr-time')
    elTimer.innerText = formatTimer(gTimer.timer)
  }, 31)
}

function formatTimer(time) {
  var miliSeconds = Math.floor((time % 1000) / 10)
  var seconds = Math.floor((time % 60000) / 1000)
  var minutes = Math.floor((time % 3600000) / 60000)
  if (miliSeconds < 10) {
    miliSeconds = '0' + miliSeconds
  }
  if (seconds < 10) {
    seconds = '0' + seconds
  }
  if (minutes < 10) {
    minutes = '0' + minutes
  }
  time = minutes + ':' + seconds + ':' + miliSeconds
  return time
}

function renderResetedTimer() {
  gTimer.id = null
  var elTimer = document.querySelector('.curr-time')
  elTimer.innerText = '00:00:00'
}

function saveBestScoreOnLocalStorage() {
  var name = 'bestScore' + gLevel.SIZE
  if (!gTimer[name]) gTimer[name] = '99:99:99'
  gTimer[name] = whichTimeIsFaster(formatTimer(gTimer.timer), gTimer[name])
  localStorage.setItem(`Best Score ${gLevel.SIZE}x${gLevel.SIZE}`, gTimer[name])
}

function renderBestScore() {
  var elBestScore = document.querySelector('.best-score span')
  if (!localStorage.getItem(`Best Score ${gLevel.SIZE}x${gLevel.SIZE}`))
    elBestScore.innerHTML = '00:00:00'
  else
    elBestScore.innerHTML = localStorage.getItem(
      `Best Score ${gLevel.SIZE}x${gLevel.SIZE}`
    )
}

function whichTimeIsFaster(currTimeStr, bestTimeStr) {
  var minCurrTime = Number(currTimeStr.substring(0, 2))
  var minBestTime = Number(bestTimeStr.substring(0, 2))
  var secCurrTime = Number(currTimeStr.substring(3, 5))
  var secBestTime = Number(bestTimeStr.substring(3, 5))
  var milCurrTime = Number(currTimeStr.substring(6, 8))
  var milBestTime = Number(bestTimeStr.substring(6, 8))
  var currTime = minCurrTime * 60 * 100 + secCurrTime * 100 + milCurrTime
  var bestTime = minBestTime * 60 * 100 + secBestTime * 100 + milBestTime
  return currTime < bestTime ? currTimeStr : bestTimeStr
}
//Hints--------------------------------------
function getHints(elCell) {
  if (!gModes.hints.state) return
  //model
  gModes.hints.amount -= 1
  //DOM
  renderModeHeader('hints')
  //no more hints
  if (gModes.hints.amount < 0) {
    renderHintsButtonToggle()
    return
  }
  hintsReveal(elCell)
  renderHintsButtonToggle()
}

function hintsReveal(elCell) {
  //get all neighbors and self
  var index = getIndexFromClass(elCell)
  var neighborsAndSelf = getAllNeighbors(index)
  neighborsAndSelf.push(index)
  //reveal all cells
  for (var i = 0; i < neighborsAndSelf.length; i++) {
    var currCellIndex = neighborsAndSelf[i]
    if (gBoard[currCellIndex.i][currCellIndex.j].isMine)
      renderCell(currCellIndex, MINE)
    else
      renderCell(
        currCellIndex,
        gBoard[currCellIndex.i][currCellIndex.j].minesAroundCount
      )
  }
  //unreveal all cells
  setTimeout(() => {
    for (var i = 0; i < neighborsAndSelf.length; i++) {
      currCellIndex = neighborsAndSelf[i]
      if (gBoard[currCellIndex.i][currCellIndex.j].isMarked)
        renderCell(currCellIndex, FLAG)
      else if (!gBoard[currCellIndex.i][currCellIndex.j].isRevealed)
        renderCell(currCellIndex, COVER)
    }
  }, 1000)
}
//Safe Cell--------------------------------------
function getSafeCell() {
  const freeSafeSpaces = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      if (!currCell.isMine && !currCell.isRevealed)
        freeSafeSpaces.push({ i, j })
    }
  }
  const randIndex = getRandomInt(0, freeSafeSpaces.length)
  if (freeSafeSpaces[randIndex]) animateSafeCell(freeSafeSpaces[randIndex])
}

function animateSafeCell(freeCell) {
  //nice animation
  gGame.isOn = false
  renderCell(freeCell, YELLOW_CELL)
  setTimeout(() => {
    renderCell(freeCell, COVER)
  }, 300)
  setTimeout(() => {
    renderCell(freeCell, YELLOW_CELL)
  }, 600)
  setTimeout(() => {
    renderCell(freeCell, COVER)
    gGame.isOn = true
  }, 900)
}
//Undo--------------------------------------
function undoAMove() {
  var index = gModes.undo.lastMove
  gGame.revealedCount -= 1
  gBoard[index.i][index.j].isRevealed = false
  renderCell(index, COVER)
}
//Editor Mode--------------------------------------
function insertMine(index) {
  gModes.editor.mines.push(index)
  gBoard[index.i][index.j].isMine = true
  renderCell(index, MINE)
}
//Mega hint--------------------------------------
function getMegaHint() {
  if (CheckMegaIndexes() === false) {
    return
  }
  //the timeout give the chosen yellow cell animation
  setTimeout(() => {
    var firstCell = gModes.mega.indexes[0]
    var secondCell = gModes.mega.indexes[1]
    for (var i = firstCell.i; i <= secondCell.i; i++) {
      for (var j = firstCell.j; j <= secondCell.j; j++) {
        if (gBoard[i][j].isMine) renderCell({ i, j }, MINE)
        else renderCell({ i, j }, gBoard[i][j].minesAroundCount)
      }
    }
    //unreveal
    setTimeout(() => {
      for (var i = firstCell.i; i <= secondCell.i; i++) {
        for (var j = firstCell.j; j <= secondCell.j; j++) {
          if (gBoard[i][j].isMarked) renderCell({ i, j }, FLAG)
          else if (!gBoard[i][j].isRevealed) renderCell({ i, j }, COVER)
        }
      }
    }, 1500)
  }, 300)
  //animate the mega button used while doing the act
  setTimeout(() => {
    var elMega = document.querySelector('.mega')
    elMega.innerHTML = MEGA_USED
    renderModeHeader('mega')
  }, 1800)
}

function animateMegaHint(index) {
  renderCell(index, YELLOW_CELL)
}

function CheckMegaIndexes() {
  var firstCell = gModes.mega.indexes[0]
  var secondCell = gModes.mega.indexes[1]
  if (firstCell.i > secondCell.i || firstCell.j > secondCell.j) {
    var msg = 'Choose cells from top left to bottom right'
    renderAlert(msg, 2)
    renderCell(firstCell, COVER)
    renderCell(secondCell, COVER)
    //reser the mega model
    gModes.mega.amount = 1
    gModes.mega.state = false
    gModes.mega.cellAmountNeeded = 2
    gModes.mega.indexes = []
    var elMega = document.querySelector('.mega')
    elMega.innerHTML = MEGA
    return false
  }
}
//exterminator-----------------------------------
function getExterminator() {
  var msg = 'Boom💥'
  renderAlert(msg, 1)
  var minesToExter = 3
  var mines = getAllMines()
  for (var j = 0; j < minesToExter; j++) {
    var randomInt = getRandomInt(0, mines.length)
    gBoard[mines[randomInt].i][mines[randomInt].j].isMine = false
    mines.splice(randomInt, 1)
  }
  gLevel.MINES = gLevel.MINES - minesToExter
  gGame.cellNeedsToReveal = gLevel.SIZE ** 2 - gLevel.MINES
  createNumbersforExter()
  renderFlagsLeft()
}
