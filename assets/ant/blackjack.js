function printCards(cards) {
  let html = '<div>'
  for(let index in cards) 
  {
    let card = cards[index]
    html += '<div>' + card.getRank() + ' ' + card.getSuit() + '</div>'
  }
  html += '</div'
  return html
}
class Card {
  //contains a rank (A,K,Q,J,10-2)
  constructor(rank, suit) {
    this.state = {
      rank: rank,
      suit: suit,
      value: 0
    }

    //calculate value
    if(rank === 'A') {
      this.state.value = 11;
    } else if(rank === 'K') {
      this.state.value = 10;
    } else if(rank === 'Q') {
      this.state.value = 10;
    } else if(rank === 'J') {
      this.state.value = 10;
    } else {
      this.state.value = parseInt(rank, 0);
    }
  }
  //contains a suit (spades, clubs, diamonds, hearts)
  //contains a glyph (the symbol representing the suit)
  //contains a value [in blackjack] (11-1)
  getRank() {
    return this.state.rank
  }
  getValue() {
    return this.state.value
  }
  getSuit() {
    return this.state.suit
  }
}
class Deck {
  //contains 52 cards
  //contains the list of suits (including glyphs) and ranks
  constructor() {
    this.state = {
      cards: [],
      suits: [ 'Spades', 'Clubs', 'Diamonds', 'Hearts' ],
      ranks: [ 'A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2' ]
    }
  }
  
  //constructs the deck with 52 cards in the same order
  refresh() {
    this.state.cards = []

    //create the 52 cards
    for(let suitIndex in this.state.suits) 
    {
      let suit = this.state.suits[suitIndex]
      for(let rankIndex in this.state.ranks)
      {
        let rank = this.state.ranks[rankIndex]
        this.state.cards.push(new Card(rank, suit))
      }
    }
    console.log('deck refresh', this.state.cards)
  }

  //can shuffle the cards
  shuffle() {
    for(let current = this.state.cards.length - 1; current >= 0; --current) {
      let random = Math.floor(Math.random() * current)
      this.swap(current, random)
    }
  }
  //can deal a card
  deal() {
    let card = this.state.cards.shift()
    return card
  }

  //can swap two cards positions
  swap(first_index, second_index) {
    let temp = this.state.cards[first_index];
    this.state.cards[first_index] = this.state.cards[second_index];
    this.state.cards[second_index] = temp;
  }
  render() {
    console.log('deck render', this.state.cards)
    let html = printCards(this.state.cards)
    let header = '<div><h3>Deck:</h3></div>'
    $("#deck").html(header + html)
  }
}
class Player {
  //contains a hand (array of cards
  //contains a score (sum of all cards values, -1 means bust)
  constructor(deck) {
    this.deck = deck
    this.state = {
      hand: [],
      score: 0,
      finished: false,
      element: "player"
    }
  }
  //can be given a card
  receiveCard(card) {
    this.state.hand.push(card)
  }
  //hand can be reset
  resetHand() {
    this.state.hand = []
  }
  //can hit (ask for another card)
  hit() {
    let card = this.deck.deal()
    this.receiveCard(card)
    this.calculateScore()
  }
  //can stay (stop receiving cards)
  stay() {
    this.state.finished = true
  }
  //can calculate score
  calculateScore() {
    this.state.score = 0
    for(let index in this.state.hand) 
    {
      let card = this.state.hand[index]
      this.state.score += card.value
    }
    if(this.state.score > 21) {
      this.state.score = -1
      this.state.finished = true
    }
  }
  render() {
    console.log(this.state.element + ' render', this.state.hand)
    let hand = printCards(this.state.hand)
    let header = '<div><h3>' + this.state.element + ':</h3></div>'
    let html = '<div id="' + this.state.element + '-hand">' + header + hand + '</div>';
    $("#" + this.state.element).html(html)
  }
}
class Dealer extends Player {
  constructor(deck) {
    super(deck)
    this.state.element = "dealer"
  }
  //does everything a player does
  //can finish turn, making decisions whether to hit or stay
  finishTurn() {
    while(this.state.finished === false) {
      if(this.state.score >= 17) {
        this.stay()
      }
      else {
        this.hit()
      }
    }
  }
}
class Game {
  //contains a deck
  constructor() {
    this.state = {
      deck: new Deck(),
      player: {},
      dealer: {}
    }
    this.state.player = new Player(this.state.deck)
    this.state.dealer = new Dealer(this.state.deck)
  }
  startGame() {
    let player = this.state.player
    let dealer = this.state.dealer
    let deck = this.state.deck
    
    player.resetHand()
    dealer.resetHand()

    deck.refresh()
    deck.shuffle()

    this.dealCardTo(player)
    this.dealCardTo(dealer)
    this.dealCardTo(player)
    this.dealCardTo(dealer)

    this.displayBoard()
    this.enablePlayerControl()
  }
  displayBoard() {
    let html = '<div id="deck"></div><div id="player"></div><div id="dealer"></div><div id="result"></div>'
    $("#game").html(html)

    this.state.deck.render()
    this.state.player.render()
    this.state.dealer.render()
  }
  dealCardTo(player) {
    let card = this.state.deck.deal()
    player.receiveCard(card)
  }
  playerHit() {
    this.state.player.hit()
    this.checkForEndOfGame()
  }
  playerStay() {    
    this.state.player.stay()
    this.checkForEndOfGame()
  }
  checkForEndOfGame() {
    if(this.state.player.finished === true) {
      this.disablePlayerControl()
      this.determineWinner()
    }
  }
  determineWinner() {
    let player = this.state.player
    let dealer = this.state.dealer
 
    if(player.score != -1) {
      dealer.finishTurn()

      if(player.score > dealer.score) {
        this.displayPlayerWin()
      }
      else if(player.score === dealer.score) {
        this.displayPlayerDraw()
      }
      else {
        this.displayPlayerLose()
      }
    }
    else {
      this.displayPlayerLose()
    }
  }
  displayPlayerWin() {

  }
  displayPlayerLose() {

  }
  displayPlayerDraw() {

  }
  //contains one player
  //contains one dealer
  //gives a card to player
  //gives a card to dealer
  //gives a card to player
  //gives a card to dealer
  //gives control of the game to the player
  //player eventually 'stays' or 'goes bust'
  //dealer either finishes turn or wins
  //if dealer finished turn, determine winner


  enablePlayerControl() {
    //enable the player hit / stay buttons
  }
  disablePlayerControl() {

  }
}

(function () {
  var game = new Game()
  game.startGame()
  console.log('game started')
}());