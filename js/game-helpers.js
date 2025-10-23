'use strict'

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

function saveBestScoreOnLocalStorage() {
  if (!gBestScore) gBestScore = '00:00:00'
  gBestScore = whichTimeIsFaster(formatTimer(gGame.timer), gBestScore)
  console.log('gBestScore:', gBestScore)
  localStorage.setItem('Best Score', gBestScore)
  // const value = localStorage.getItem("Best Score")
  // localStorage.removeItem("Best Score")
}

function renderBestScore() {
  var elBestScore = document.querySelector('.best-score span')
  if (!localStorage.getItem('Best Score')) elBestScore.innerHTML = '00:00:00'
  else elBestScore.innerHTML = localStorage.getItem('Best Score')
}

function whichTimeIsFaster(currTime, bestTime) {
  var hoursCurrTime = Number(currTime.substring(0, 2))
  var hoursBestTime = Number(bestTime.substring(0, 2))
  var secCurrTime = Number(currTime.substring(3, 5))
  var secBestTime = Number(bestTime.substring(3, 5))
  var milCurrTime = Number(currTime.substring(6, 8))
  var milBestTime = Number(bestTime.substring(6, 8))
  if (hoursCurrTime < hoursBestTime) return currTime
  else if (secCurrTime < secBestTime) return currTime
  else if (milCurrTime < milBestTime) return currTime
  else return bestTime
}
