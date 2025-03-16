/**
 * script.js
 */


const rules    = document.getElementById("rules")
const controls = document.getElementById("controls")
const play     = document.getElementById("play")
const show     = document.getElementById("show")
const turn     = document.getElementById("turn")
const over     = document.getElementById("over")
const buttons  = document.getElementById("buttons")
const find     = document.querySelector("label:has(#find)")
const board    = document.getElementById("board")
const value    = document.getElementById("value")
const coins    = Array.from(board.querySelectorAll("img.coin"))

const heads    = "images/heads.png"
const tails    = "images/tails.png"
const bars     = "images/bars.webp"
const exit     = "images/exit.webp"
const faces    = [ heads, tails ]
let state      = document.querySelector(':checked').id;
let hidden     = -1

const overTexts = [
  "Send the prisoner back behind bars! Click to play again.",
  "The prisoner is pardoned! Click to play again."
]


// Look up code for which coin to flip to mod the
// current display by a given value
const LUT = {
   0:  3,
   1:  7,
   2: 11,
   3: 15,
   4:  2,
   5:  6,
   6: 10,
   7: 14,
   8:  1,
   9:  5,
  10:  9,
  11: 13,
  12:  0,
  13:  4,
  14:  8,
  15: 12
}


coins.forEach( coin => (
  coin.src = faces[ (Math.random() < 0.5) + 0 ]
))


controls.addEventListener("click", treatControl)
buttons.addEventListener("change", setState)
board.addEventListener("click", treatCoinClick)
board.addEventListener("transitionend", nextState)


function startGame() {
}


function treatControl({ target }) {
  const button = target.id

  switch (button) {
    case "play":
      rules.classList.add("hide")
      show.classList.remove("selected")
      play.classList.add("selected")
    break;

    case "hide":
      rules.classList.remove("hide")
      play.classList.remove("selected")
      show.classList.add("selected")
    break;

    case "over":
      return playAgain()
  }
}


function setState({ target }) {
  state = target.id

  switch (state) {
    case "find":
      return flipCoin()
  }
}


const isHeads = img => (img.src.indexOf(heads) > 0)



function flipCoin() {
  const hex = getHex()
  const mod = hex ^ hidden
  const flip = LUT[mod]
  turnCoin(coins[flip])

  turn.parentElement.setAttribute("disabled", true)
  hide.parentElement.setAttribute("disabled", true)
}


function getHex() {
  const headCoins = coins.map(isHeads)

  const c1c2 = headCoins.filter(( _, index ) => (
    (index % 4) < 2)
  ).reduce(( even, heads ) => even + (heads + 0))
    % 2

  const c1c3 = headCoins.filter(( _, index ) => (
    (index + 1) % 2
  )).reduce(( even, heads ) => even + (heads + 0))
    % 2

  const r4r3 = headCoins.filter(( _, index ) => index > 7)
    .reduce(( even, heads ) => even + (heads + 0))
    % 2

  // Choose 4567 CDEF
  const r4r2 = headCoins.filter(( _, index ) => (
    Math.floor(index / 4) % 2)
  ).reduce(( even, heads ) => even + (heads + 0))
    % 2

  const hex = c1c2 * 8 + c1c3 * 4 + r4r3 * 2 + r4r2
  value.textContent = hex
  return hex
}


function treatCoinClick({ target }) {
  if (target.tagName !== "IMG") { return }

  switch (state) {
    case "turn":
      return turnCoin(target)

    case "hide":
      return placeToken(target)

    case "find":
      return liftCoin(target)
  }
}


function turnCoin(target) {
  target.src = faces[isHeads(target) + 0]
  getHex()
}


function nextState({ target }) {
  switch (state) {
    case "hiding":
      return showToken(target)
    case "fading":
      return hideToken(target)
    case "hidden":
      return replaceCoin(target)
  }
}


function placeToken(target) {
  state = "hiding"
  hidden = coins.indexOf(target)

  // Temporarily remove the coin
  target.classList.add("remove")
}


function showToken(target) {
  state = "fading"

  const fate = target.previousElementSibling
  fate.src = exit
  fate.alt = "exit"
  fate.classList.add("exit")

  // setTimeout(() =>  fate.classList.add("vanish"), 1)
}


function hideToken(target) {
  state = "hidden"
  
  target.classList.add("vanish")

  // setTimeout(() =>  fate.classList.add("vanish"), 1)
}


function replaceCoin(target) {
  const sibling = target.nextElementSibling
  state = "hide"
  sibling.classList.remove("remove")
  sibling.classList.add("replace")

  find.removeAttribute("disabled")
}


function liftCoin(target) {
  target.classList.remove("replace")
  target.classList.add("remove")

  const fate = target.previousElementSibling || target
  fate.classList.remove("vanish")
  fate.classList.add("chosen")
  state = "game-over"

  const index = coins.indexOf(target)
  const text = overTexts[(index === hidden) + 0]
  over.innerText = text
  over.classList.add(state)

  find.setAttribute("disabled", true)
}


function playAgain() {
  // Hide the game-over button
  over.classList.remove("game-over")

  // Activate the Turn radio label
  state = "turn"
  turn.checked = true

  // Re-enable turn and hide
  turn.parentElement.removeAttribute("disabled")
  hide.parentElement.removeAttribute("disabled")

  // Reset exit
  const exit = document.querySelector(".exit")
  exit.src = bars
  exit.alt = "bars"
  exit.classList.remove("exit")

  // Reset chosen fate
  document.querySelector(".chosen").classList.remove("chosen")
  
  coins.forEach(coin => coin.classList.remove("remove"))
}

// getHex()