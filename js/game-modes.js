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

function resetTimer() {
  clearInterval(gTimer.id)
  gTimer.id = null
  gTimer.timer = 0
  gTimer.bestScore4 = null
  gTimer.bestScore8 = null
  gTimer.bestScore12 = null
  var elTimer = document.querySelector('.curr-time')
  elTimer.innerText = '00:00:00'
}

function saveBestScoreOnLocalStorage() {
  //current time = gTimer.timer, best time = gTimer[name]
  var name = 'bestScore' + gLevel.SIZE
  if (!gTimer[name]) gTimer[name] = '99:99:99'
  var currTime = gTimer.timer
  gTimer[name] = whichTimeIsFaster(formatTimer(currTime), gTimer[name])
  localStorage.setItem(`Best Score ${gLevel.SIZE}x${gLevel.SIZE}`, gTimer[name])
}

function getBestTimePerDifficulty() {
  var name = `Best Score ${gLevel.SIZE}x${gLevel.SIZE}`
  var bestTime = localStorage.getItem(name)
  return bestTime
}

function renderBestScore() {
  var elBestScore = document.querySelector('.best-score span')
  var bestTime = localStorage.getItem(
    `Best Score ${gLevel.SIZE}x${gLevel.SIZE}`
  )
  if (!bestTime) elBestScore.innerHTML = '00:00:00'
  else elBestScore.innerHTML = bestTime
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

//Undo--------------------------------------
function undoBtnToggle() {
  if (!gGame.isOn) return
  if (!gGame.isStarted) {
    var msg = 'Start to play first'
    renderAlert(msg, 1)
    return
  }
  if (!gModes.undo.lastMove) {
    var msg = 'There is no last move available'
    renderAlert(msg, 2)
    return
  }
  if (gModes.undo.amount === 0) return
  //model
  gModes.undo.amount -= 1
  //DOM header
  updateModeTextAmount('undo')
  //no more hints
  if (gModes.undo.amount === 0) {
    var elBtn = document.querySelector('.undo')
    elBtn.innerHTML = UNDO_USED
  }
  undoAMove()
}

function undoAMove() {
  var index = gModes.undo.lastMove
  //model
  gGame.revealedCount -= 1
  gBoard[index.i][index.j].isRevealed = false
  //DOM
  renderCell(index, COVER)
}

//Hints--------------------------------------
function hintBtnToggle() {
  if (!gGame.isOn) return
  if (!gGame.isStarted) {
    var msg = 'Start to play first'
    renderAlert(msg, 1)
    return
  }
  //toggle button
  gModes.hints.isOn = !gModes.hints.isOn
  var elBtn = document.querySelector('.hints')
  if (gModes.hints.amount === 0) {
    //model
    gModes.hints.isOn = false
    //DOM
    elBtn.innerHTML = HINTS_USED
    return
  }
  if (gModes.hints.isOn) elBtn.innerHTML = HINTS_ON
  else elBtn.innerHTML = HINTS_OFF
}

function getHints(elCell) {
  if (!gModes.hints.isOn) return
  //model
  gModes.hints.amount -= 1
  //DOM
  updateModeTextAmount('hints')
  //no more hints
  if (gModes.hints.amount < 0) {
    hintBtnToggle()
    return
  }
  hintsReveal(elCell)
  hintBtnToggle()
}

function hintsReveal(elCell) {
  //get all neighbors and self
  var index = getIndexFromClass(elCell)
  var neighborsAndSelf = getArrayOfNeighbors(index)
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
function useSafeCell() {
  if (!gGame.isOn) return
  if (!gGame.isStarted) {
    var msg = 'Start to play first'
    renderAlert(msg, 1)
    return
  }
  if (gModes.safe.amount === 0) return
  var elBtn = document.querySelector('.safe')
  var safeCell = getSafeCellIndex()
  if (safeCell) {
    //model
    gModes.safe.amount -= 1
    //DOM
    updateModeTextAmount('safe')
    renderCell(safeCell, YELLOW_CELL)
  } else {
    var msg = 'There are no safe cells left'
    renderAlert(msg, 2)
  }
  //no more hints
  if (gModes.safe.amount === 0) {
    elBtn.innerHTML = SAFE_CELL_USED
  }
}

function getSafeCellIndex() {
  const freeSafeSpaces = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      const currCell = gBoard[i][j]
      if (!currCell.isMine && !currCell.isRevealed)
        freeSafeSpaces.push({ i, j })
    }
  }
  const randIndex = getRandomInt(0, freeSafeSpaces.length)
  if (freeSafeSpaces[randIndex]) return freeSafeSpaces[randIndex]
  else {
    return false
  }
}

//Mega hint--------------------------------------
function useMegaHint() {
  if (!gGame.isOn) return
  if (!gGame.isStarted) {
    var msg = 'Start to play first'
    renderAlert(msg, 1)
    return
  }
  if (gModes.mega.amount === 0) return
  //modal
  gModes.mega.amount -= 1
  gModes.mega.isOn = true
  //DOM
  var elMega = document.querySelector('.mega')
  if (gModes.mega.isOn) elMega.innerHTML = MEGA_ON
}

function revealMegaHint() {
  //the timeout give the chosen yellow cell animation
  setTimeout(() => {
    var cellsIndexes = checkWhichSquareDirection()
    for (var i = cellsIndexes.firstI; i <= cellsIndexes.secondI; i++) {
      for (var j = cellsIndexes.firstJ; j <= cellsIndexes.secondJ; j++) {
        if (gBoard[i][j].isMine) renderCell({ i, j }, MINE)
        else renderCell({ i, j }, gBoard[i][j].minesAroundCount)
      }
    }
    //unreveal
    setTimeout(() => {
      for (var i = cellsIndexes.firstI; i <= cellsIndexes.secondI; i++) {
        for (var j = cellsIndexes.firstJ; j <= cellsIndexes.secondJ; j++) {
          if (gBoard[i][j].isMarked) renderCell({ i, j }, FLAG)
          else if (!gBoard[i][j].isRevealed) renderCell({ i, j }, COVER)
        }
      }
    }, 1500)
  }, 300)
  //animate the mega button used to end after the reveal
  setTimeout(() => {
    var elMega = document.querySelector('.mega')
    elMega.innerHTML = MEGA_USED
    updateModeTextAmount('mega')
  }, 1800)
}

function checkWhichSquareDirection() {
  var firstCell = gModes.mega.indexes[0]
  var secondCell = gModes.mega.indexes[1]
  //main diagonal top-bottom
  if (firstCell.i <= secondCell.i && firstCell.j <= secondCell.j)
    return {
      firstI: firstCell.i,
      secondI: secondCell.i,
      firstJ: firstCell.j,
      secondJ: secondCell.j,
    }
  //main diagonal bottom-top
  if (firstCell.i >= secondCell.i && firstCell.j >= secondCell.j)
    return {
      firstI: secondCell.i,
      secondI: firstCell.i,
      firstJ: secondCell.j,
      secondJ: firstCell.j,
    }
  //secondery diagonal top-bottom
  if (firstCell.i <= secondCell.i && firstCell.j >= secondCell.j)
    return {
      firstI: firstCell.i,
      secondI: secondCell.i,
      firstJ: secondCell.j,
      secondJ: firstCell.j,
    }
  //secondery diagonal bottom-top
  if (firstCell.i >= secondCell.i && firstCell.j <= secondCell.j)
    return {
      firstI: secondCell.i,
      secondI: firstCell.i,
      firstJ: firstCell.j,
      secondJ: secondCell.j,
    }
}

//exterminator-----------------------------------
function useExterminator() {
  if (!gGame.isOn) return
  if (gModes.editor.isEasyMode) return
  if (!gGame.isStarted) {
    var msg = 'Start to play first'
    renderAlert(msg, 1)
    return
  }
  if (gModes.exterminator.amount === 0) return
  //model
  gModes.exterminator.amount -= 1
  //DOM header
  updateModeTextAmount('exterminator')
  //no more hints
  var elBtn = document.querySelector('.exterminator')
  elBtn.innerHTML = EXT_USED
  removeMines()
}

function removeMines() {
  var msg = 'Boom💥'
  renderAlert(msg, 1)
  var minesToRemove = 3
  var mines = getAllMines()
  for (var j = 0; j < minesToRemove; j++) {
    var randomInt = getRandomInt(0, mines.length)
    gBoard[mines[randomInt].i][mines[randomInt].j].isMine = false
    mines.splice(randomInt, 1)
  }
  //update the model after the removal of the mines
  gLevel.MINES = gLevel.MINES - minesToRemove
  gGame.cellNeedsToReveal = gLevel.SIZE ** 2 - gLevel.MINES
  //DOM
  createNumbersforExterminator()
  renderFlagsLeft()
}

//Editor Mode--------------------------------------
function editorModeToggle() {
  var elEditor = document.querySelector('.editor-img')
  if (gModes.editor.clicked) {
    //model
    gModes.editor.clicked = !gModes.editor.clicked
    //DOM
    elEditor.innerHTML = ETIDOR_X
    resetGame()
    return
  }
  if (gModes.editor.isDone || !gModes.editor.isPossible) {
    elEditor.innerHTML = ETIDOR_X
    var msg = 'Cannot be used after the game has started'
    renderAlert(msg, 2)
    return
  }
  //model
  gModes.editor.clicked = !gModes.editor.clicked
  //DOM
  if (gModes.editor.clicked) elEditor.innerHTML = ETIDOR_V
  else elEditor.innerHTML = ETIDOR_X
}

function insertAMine(index) {
  gModes.editor.mines.push(index)
  gBoard[index.i][index.j].isMine = true
  renderCell(index, MINE)
}

function handleManualClicks(currCellIndex) {
  if (!isObjectinObjectArray(gModes.editor.mines, currCellIndex)) {
    insertAMine(currCellIndex)
    gModes.editor.minesCount += 1
    //render flags to count  down the flags
    var elFlg = document.querySelector('.flags-amount')
    elFlg.innerHTML = gLevel.MINES - gModes.editor.minesCount
  } else {
    //if you click on a mine that you inserted, it will cancel it
    gModes.editor.minesCount -= 1
    renderCell(currCellIndex, COVER)
    gModes.editor.mines.pop()
    //render flags
    var elFlg = document.querySelector('.flags-amount')
    elFlg.innerHTML = gLevel.MINES - gModes.editor.minesCount
  }
  if (gModes.editor.minesCount === gLevel.MINES) {
    //let the mines stay on board for some sec
    setTimeout(() => {
      createNumbers(currCellIndex)
      coverAllCells()
      renderFlagsLeft()
    }, 2500)
    gModes.editor.isStarted = false
    gModes.editor.isDone = true
    editorModeToggle()
    //alert
    var msg = "You've finished putting all the mines"
    renderAlert(msg, 2.5)
  }
  gModes.editor.clicked = false
}
