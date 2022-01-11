NodeList.prototype.forEach = Array.prototype.forEach

var bal = 10;
var bet = 0;
var holdDraw = 0;
var playerHand, botHand;
playerHand = botHand = new Array(5);
const symbols = ['⭐', '🍎', '🥒', '🌻', '🍄', '☁️'];
Object.seal(symbols);


function newCard() {
    return symbols[Math.floor(Math.random()*symbols.length)];
} 

function newHand(hand) {
    [ ...Array(hand.length)].forEach((e, i) => hand[i] = newCard());
}

function addBet() {
    if (bet < 5 && bal > 0) {
        bal--
        bet++
        document.getElementById('bal').textContent = bal
        document.getElementById('bet display').textContent = '💰'.repeat(bet)
    }
}

function selectCard(e, i) {
    let cmp = 1 << i
    e.target.style.backgroundColor = holdDraw & cmp ? '' : 'black'
    holdDraw ^= cmp
    document.getElementById('next').textContent = holdDraw == 0 ? 'Hold' : 'Draw'
}

function gameplay() {
    addBet()
    newHand(playerHand)
    newHand(botHand)
    document.getElementById('hand bot').textContent = '🃏 🃏 🃏 🃏 🃏'
    document.getElementById('hand player').textContent = playerHand.join('')
}

function getHandPattern(hand) {
    let m = new Map()
    hand.forEach(card => {
        let occurance = m.get(card)
        if (occurance === undefined) m.set(card, 1)
        else m.set(card, occurance+1)
    })
    m = new Map([...m.entries()].sort((a, b) => b[1] - a[1]));
    
}

function proceed(event) {
    if (event.target.textContent == 'Draw') {
        for (let i = 0; i < playerHand.length; i++) {
            if (holdDraw & 1 << i) playerHand[i] = newCard()
        }
        document.getElementById('hand player').textContent = playerHand.join('')   
    }
    getHandPattern(playerHand)

    for (let button of document.getElementById('hold draw buttons').children) button.style.backgroundColor = ''
}

document.addEventListener("DOMContentLoaded", gameplay);