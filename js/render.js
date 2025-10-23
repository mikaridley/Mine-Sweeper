'use strict'
//modal------------------------
function renderModal(state) {
  var msg =
    state === 'lose'
      ? 'SORRY...<br><span>YOU LOSE.</span><br>BETTER LUCK NEXT TIME'
      : 'CONGRATULATIONS!<br><span>YOU WIN!</span><br>GO TRY TO GET BETTER SCORE'
  var elModal = document.querySelector('.modal')
  elModal.innerHTML = msg
  elModal.hidden = false
  var elModalSpan = document.querySelector('.modal span')
  if (state === 'lose') elModalSpan.style.color = '#d53333'
  else elModalSpan.style.color = '#3066b8'
  setTimeout(() => {
    elModal.hidden = true
  }, 2000)
}
//alert------------------------
function renderAlert(msg) {
  var elModal = document.querySelector('.alert')
  elModal.innerHTML = msg
  elModal.hidden = false
  setTimeout(() => {
    elModal.hidden = true
  }, 2500)
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
  renderUnclickedDiffButtons()
  var elBtn = document.querySelector('.diff-4')
  elBtn.style.backgroundImage = EASY_BTN_CLICKED
}

function renderClickedMediumButton() {
  renderUnclickedDiffButtons()
  var elBtn = document.querySelector('.diff-8')
  elBtn.style.backgroundImage = MEDIUM_BTN_CLICKED
}

function renderClickedHardButton() {
  renderUnclickedDiffButtons()
  var elBtn = document.querySelector('.diff-12')
  elBtn.style.backgroundImage = HARD_BTN_CLICKED
}

function renderUnclickedDiffButtons() {
  var elBtn = document.querySelector('.diff-4')
  elBtn.style.backgroundImage = EASY_BTN
  elBtn = document.querySelector('.diff-8')
  elBtn.style.backgroundImage = MEDIUM_BTN
  elBtn = document.querySelector('.diff-12')
  elBtn.style.backgroundImage = HARD_BTN
}
//restart----------------------------------------
function renderRestartButton(state) {
  var elRestart = document.querySelector('.restart')
  elRestart.style.backgroundImage = `url('img/Restart Button - ${state}.png')`
}
//dark mode----------------------------------------
function renderDarkMoreBtn(elBtn) {
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
function renderModeHeader(classBtn) {
  //DOM header
  var elBtnHeader = document.querySelector(`h2.${classBtn} span`)
  elBtnHeader.innerText = +gModes[classBtn].amount
}
//hints-------------
function renderHintsButtonToggle() {
  if (!gGame.isOn) return
  var elBtn = document.querySelector('.hints')
  if (gModes.hints.amount === 0) {
    elBtn.innerHTML = HINTS_USED
    gModes.hints.state = false
    return
  }
  //model
  gModes.hints.state = !gModes.hints.state
  //DOM
  if (gModes.hints.state) elBtn.innerHTML = HINTS_ON
  else elBtn.innerHTML = HINTS_OFF
}
//safe cell-------------
function renderSafeButtonToggle() {
  if (!gGame.isOn) return
  if (gModes.safe.amount === 0) return
  //model
  gModes.safe.amount -= 1
  //DOM header
  renderModeHeader('safe')
  //no more hints
  var elBtn = document.querySelector('.safe')
  if (gModes.safe.amount === 0) {
    elBtn.innerHTML = SAFE_CELL_USED
  }
  getSafeCell()
}
//undo-------------
function renderUndoButtonToggle() {
  if (!gGame.isOn) return
  if (gModes.undo.amount === 0) return
  //model
  gModes.undo.amount -= 1
  //DOM header
  renderModeHeader('undo')
  //no more hints
  var elBtn = document.querySelector('.undo')
  if (gModes.undo.amount === 0) {
    elBtn.innerHTML = UNDO_USED
  }
  undoAMove()
}
//editor-------------
function renderEditorModeToggle() {
  var elEditor = document.querySelector('.editor-img')
  if (!gGame.isOn) return

  if (gModes.editor.isDone) {
    elEditor.innerHTML = ETIDOR_X
    return
  }
  if (!gModes.editor.isPossible) return
  gModes.editor.clicked = !gModes.editor.clicked
  if (gModes.editor.clicked) elEditor.innerHTML = ETIDOR_V
  else elEditor.innerHTML = ETIDOR_X
}
//mega hint-------------
function renderMegaButton() {
  if (!gGame.isOn) return
  if (gModes.mega.amount === 0) return
  //alert
  var msg = 'Choose 2 cells to uncover the area'
  renderAlert(msg)
  //modal
  gModes.mega.amount -= 1
  gModes.mega.state = true
  //DOM
  var elMega = document.querySelector('.mega')
  elMega.innerHTML = MEGA_USED
  renderModeHeader('mega')
}

// function renderClickedExtButton(elBtn) {
//   renderUnclickedModesButtons()
// }

// function renderUnclickedModesButtons() {
//   var elBtn = document.querySelector('.undo')
//   elBtn.style.backgroundImage = "url('../img/Undo Button - Used.png')"
//   elBtn = document.querySelector('.hints')
//   elBtn.style.backgroundImage = "url('../img/Safe Click Button - Used.png')"
//   elBtn = document.querySelector('.mega')
//   elBtn.style.backgroundImage = "url('../img/Mega Hint Button - Used.png')"
//   elBtn = document.querySelector('.ext')
//   elBtn.style.backgroundImage =
//     "url('../img/Exterminator Button - Used - Used.png')"
// }
