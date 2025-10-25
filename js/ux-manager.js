'use strict'
//modal------------------------
function renderModal(state) {
  var currTime = gTimer.timer
  var loseMsg =
    'SORRY...<br><span class="result">YOU LOSE.</span><br>BETTER LUCK NEXT TIME'
  var winMsg = `CONGRATULATIONS!<br><span class="result">YOU WIN!</span><br>IT TOOK YOU
  <span class="the-time">${formatTimer(currTime)}</span>
    MINUTES.`
  var bestTime = getBestTimePerDifficulty()
  winMsg += `<br>YOUR BEST WAS
  <span class="the-best-time">${bestTime}</span>
    MINUTES.`

  var msg = state === 'lose' ? loseMsg : winMsg

  var elModalMsg = document.querySelector('.modal .msg')
  elModalMsg.innerHTML = msg

  var elModal = document.querySelector('.modal')
  elModal.hidden = false

  //styling
  var elModalSpan = document.querySelector('span.result')
  if (state === 'lose') elModalSpan.style.color = '#d53333'
  else {
    elModalSpan.style.color = '#3066b8'
    elModalSpan = document.querySelector('span.the-time')
    elModalSpan.style.fontSize = '3rem'
    elModalSpan.style.color = '#3cb830'
    elModalSpan = document.querySelector('span.the-best-time')
    elModalSpan.style.fontSize = '3rem'
    elModalSpan.style.color = '#d42a2a'
  }
  //nice fate screen behind
  var elBlackScreen = document.querySelector('.black-screen')
  elBlackScreen.hidden = false
}

function closeTheModal() {
  var elModal = document.querySelector('.modal')
  elModal.hidden = true
  var elBlackScreen = document.querySelector('.black-screen')
  elBlackScreen.hidden = true
}

function showRulesPage() {
  var elRulesPage = document.querySelector('.rules')
  elRulesPage.hidden = false
  var strHTML = ''
  elRulesPage = document.querySelector('.rules table')
  var text =
    'Minesweeper is a logic game where your goal is to clear the board and avoid hidden mines. Left-click reveals a cell, right-click places a flag to mark a suspected mine. Numbers on revealed cells indicate how many mines are in the surrounding cells, helping you deduce where mines are and plan your moves safely.'
  strHTML += '<tr>\n'
  strHTML += `\t<td>GAME RULES</td>\n`
  strHTML += `\t<td>${text}</td>\n`
  strHTML += '</tr>\n'

  text = 'You have 3 lives, you can click on 4 mines before losing.'
  strHTML += '<tr>\n'
  strHTML += `\t<td>${HEART}</td>\n`
  strHTML += `\t<td>${text}</td>\n`
  strHTML += '</tr>\n'

  text =
    'Mode in which the user first positions the mines (by clicking cells) and then plays.'
  strHTML += '<tr>\n'
  strHTML += `\t<td>${ETIDOR_X}</td>\n`
  strHTML += `\t<td>${text}</td>\n`
  strHTML += '</tr>\n'

  text = 'Undo your last number revealed.'
  strHTML += '<tr>\n'
  strHTML += `\t<td>${UNDO}</td>\n`
  strHTML += `\t<td>${text}</td>\n`
  strHTML += '</tr>\n'

  text =
    'Clicking on a cell reveals that cell and its neighboring cells for 1 second, helping you plan your next move.'
  strHTML += '<tr>\n'
  strHTML += `\t<td>${HINTS_OFF}</td>\n`
  strHTML += `\t<td>${text}</td>\n`
  strHTML += '</tr>\n'

  text =
    'A random safe cell is revealed on the board, providing a guaranteed safe option.'
  strHTML += '<tr>\n'
  strHTML += `\t<td>${SAFE_CELL}</td>\n`
  strHTML += `\t<td>${text}</td>\n`
  strHTML += '</tr>\n'

  text =
    'Reveal a chosen area of the board for 2 seconds, giving you insight into multiple cells at once.'
  strHTML += '<tr>\n'
  strHTML += `\t<td>${MEGA}</td>\n`
  strHTML += `\t<td>${text}</td>\n`
  strHTML += '</tr>\n'

  text =
    'Removes 3 random mines from the board, reducing the risk and making the game easier. Not available in Easy Mode.'
  strHTML += '<tr>\n'
  strHTML += `\t<td>${EXT}</td>\n`
  strHTML += `\t<td>${text}</td>\n`
  strHTML += '</tr>\n'
  elRulesPage.innerHTML = strHTML

  //nice fate screen behind
  var elBlackScreen = document.querySelector('.black-screen')
  elBlackScreen.hidden = false
}

function closeRules() {
  var elRulesPage = document.querySelector('.rules')
  elRulesPage.hidden = true
  var elBlackScreen = document.querySelector('.black-screen')
  elBlackScreen.hidden = true
}

//alert------------------------
function renderAlert(msg, sec) {
  gGame.isOn = false
  var elModal = document.querySelector('.alert')
  elModal.innerHTML = msg
  elModal.hidden = false
  setTimeout(() => {
    elModal.hidden = true
    gGame.isOn = true
  }, sec * 1000)
}

//hearts----------------------------------------
function renderHearts() {
  var strHtml = ''
  var elHearts = document.querySelector('.hearts')
  for (var j = 0; j < gLevel.LIVES; j++) {
    strHtml += `<div class="heart">${HEART}</div>`
  }
  for (var i = 0; i < 3 - gLevel.LIVES; i++) {
    strHtml += `<div class="heart">${EMPTY_HEART}</div>`
  }

  elHearts.innerHTML = strHtml
}

//difficulty----------------------------------------
function renderClickedEasyButton() {
  unclickAllDifficultiesBtns()
  var elBtn = document.querySelector('.diff-4')
  elBtn.style.backgroundImage = EASY_BTN_CLICKED
  elBtn.style.color = 'white'
  //disabled at exterminator mode
  gModes.editor.isEasyMode = true
  var elBtn = document.querySelector('.exterminator')
  elBtn.innerHTML = EXT_USED
  var elBtnHeader = document.querySelector('h2.exterminator span')
  elBtnHeader.innerText = 0
}

function renderClickedMediumButton() {
  unclickAllDifficultiesBtns()
  var elBtn = document.querySelector('.diff-8')
  elBtn.style.backgroundImage = MEDIUM_BTN_CLICKED
  elBtn.style.color = 'white'
  gModes.editor.isEasyMode = false
}

function renderClickedHardButton() {
  unclickAllDifficultiesBtns()
  var elBtn = document.querySelector('.diff-12')
  elBtn.style.backgroundImage = HARD_BTN_CLICKED
  elBtn.style.color = 'white'
  gModes.editor.isEasyMode = false
}

function unclickAllDifficultiesBtns() {
  var elBtn = document.querySelector('.diff-4')
  elBtn.style.backgroundImage = EASY_BTN
  elBtn.style.color = '#bdb8bd'
  elBtn = document.querySelector('.diff-8')
  elBtn.style.backgroundImage = MEDIUM_BTN
  elBtn.style.color = '#bdb8bd'
  elBtn = document.querySelector('.diff-12')
  elBtn.style.backgroundImage = HARD_BTN
  elBtn.style.color = '#bdb8bd'
}

function clickCurrentDifficulty() {
  if (gLevel.SIZE === 4) renderClickedEasyButton()
  if (gLevel.SIZE === 8) renderClickedMediumButton()
  if (gLevel.SIZE === 12) renderClickedHardButton()
}

//restart----------------------------------------
function renderRestartBtnPerState(state) {
  var elRestart = document.querySelector('.restart')
  elRestart.style.backgroundImage = `url('img/Restart Button - ${state}.png')`
}

//dark mode----------------------------------------
function darkModeBtnToggle(elBtn) {
  var dashIndex = elBtn.innerHTML.indexOf('-') + 2
  var state = elBtn.innerHTML.substring(dashIndex)
  var elSecondHeader = document.querySelector('.second-header')
  var h2 = document.querySelectorAll('h2')
  if (state[0] === 'L') {
    elBtn.innerHTML = DARK_MODE
    document.documentElement.style.setProperty('--body-color', '#363636')
    elSecondHeader.style.backgroundColor = '#232323'
    for (var i = 0; i < h2.length; i++) {
      h2[i].style.color = 'white'
    }
  } else {
    elBtn.innerHTML = LIGHT_MODE
    document.documentElement.style.setProperty('--body-color', '#b8b8ba')
    elSecondHeader.style.backgroundColor = '#acacae'
    for (var i = 0; i < h2.length; i++) {
      h2[i].style.color = 'black'
    }
  }
}

//flags----------------------------------------
function renderFlagsLeft() {
  var elFlg = document.querySelector('.flags-amount')
  elFlg.innerHTML = gLevel.MINES - gGame.markedCount
}

//modes-----------------------------------------------------------------------
function updateModeTextAmount(classBtn) {
  var elBtnHeader = document.querySelector(`h2.${classBtn} span`)
  elBtnHeader.innerText = +gModes[classBtn].amount
}
