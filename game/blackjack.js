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
    //console.log('deck refresh', this.state.cards)
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
    //console.log('deck render', this.state.cards)
    let html = printCards(this.state.cards)
    let header = '<div><h3>Deck:</h3></div>'
    $("#deck").html(header + html).addClass('float-box')
  }
}
class Player {
  //contains a hand (array of cards
  //contains a score (sum of all cards values, -1 means bust)
  constructor(game) {
    this.game = game
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
    this.calculateScore()
  }
  //hand can be reset
  resetHand() {
    this.state.hand = []
  }
  //can hit (ask for another card)
  hit() {
    console.log(this.game)
    this.game.dealCardTo(this)
    this.render()
  }
  //can stay (stop receiving cards)
  stay() {
    this.state.finished = true
  }
  getScore() { 
    return this.state.score 
  }

  //can calculate score
  calculateScore() {
    this.state.score = 0
    for(let index in this.state.hand) 
    {
      let card = this.state.hand[index]
      this.state.score += +card.state.value
    }
    if(this.state.score > 21) {
      this.state.score = -1
      this.state.finished = true
    }
  }
  render() {
    //console.log(this.state.element + ' render', this.state.hand)
    let hand = printCards(this.state.hand)
    let header = '<div><h3>' + this.state.element + ':</h3></div>'
    let html = '<div id="' + this.state.element + '-hand">' + header + hand + '</div>' +
               '<div id="' + this.state.element + '-results">' + this.state.score.toString() + '</div>'
    $('#' + this.state.element).html(html).addClass('float-box')
  }
}
class Dealer extends Player {
  constructor(game) {
    super(game)
    this.state.element = 'dealer'
  }
  //does everything a player does
  //can finish turn, making decisions whether to hit or stay
  finishTurn() {
    console.log('finishing dealer turn')
    while(this.state.finished === false) {
      if(this.state.score < this.game.state.player.getScore())
      {
        console.log('player is winning, hit')
        this.hit()
      }
      else
      {
        console.log('dealer is winning, stay')
        this.stay()
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
    this.state.player = new Player(this)
    this.state.dealer = new Dealer(this)
    this.playerHitHandler = this.playerHit.bind(this)
    this.playerStayHandler = this.playerStay.bind(this)
    this.replayGameHandler = this.startGame.bind(this)
  }
  startGame() {
    console.log('starting game')

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

    console.log(this.state.player, this.state.dealer)

    this.displayBoard()
    this.enablePlayerControl()
  }
  displayBoard() {
    let html = '<div id="commands"></div><div id="deck"></div><div id="player"></div><div id="dealer"></div>' +
               '<div id="winner"></div>'
    $('#game').html(html)

    let hit = '<button id="hit-button" type="button" disabled>Hit</button>'
    let stay = '<button id="stay-button" type="button" disabled>Stay</button>'
    let replay = '<button id="replay-button" type="button" disabled>Replay</button>'
    $('#commands').html('<div>' + hit + stay + replay + '</div>')

    let results = '<div id="player-results"></div><div id="dealer-results"></div>'
    $('#results').html(results)

    this.state.deck.render()
    this.state.player.render()
    this.state.dealer.render()
  }
  dealCardTo(player) {
    let card = this.state.deck.deal()
    player.receiveCard(card)
  }
  playerHit() {
    console.log('player hit')
    this.state.player.hit()
    this.checkForEndOfGame()
  }
  playerStay() {
    console.log('player stay')
    this.state.player.stay()
    this.checkForEndOfGame()
  }
  checkForEndOfGame() {
    console.log('checking end of game, player', this.state.player)
    if(this.state.player.state.finished === true) {
      console.log('player is finished')
      this.disablePlayerControl()
      this.determineWinner()
    }
  }
  determineWinner() {
    console.log('determining winner')

    let player = this.state.player
    let dealer = this.state.dealer
 
    if(player.score != -1) {
      dealer.finishTurn()
      let playerScore = player.getScore()
      let dealerScore = dealer.getScore()
      console.log('dealer turn finished')
      console.log('player score', playerScore)
      console.log('dealer score', dealerScore)
      
      if(playerScore > dealerScore) {
        this.displayResults('player wins')
      }
      else if(playerScore === dealerScore) {
        this.displayResults('draw')
      }
      else {
        this.displayResults('player loses')
      }
    }
    else {
      this.displayResults('player loses')
    }
  }
  displayResults(result) {
    console.log(result)
    let header = '<div><h3>Result:</h3></div>'
    $('#winner').html(header + '<div>' + result + '</div>').addClass('float-box')
  }

  enablePlayerControl() {
    console.log('enabling player control')
    //enable the player hit / stay buttons
    let hit = $('#hit-button')
    let stay = $('#stay-button')
    let replay = $('#replay-button')

    hit.removeAttr('disabled')
    stay.removeAttr('disabled')
    replay.removeAttr('disabled')

    hit.click(this.playerHitHandler)
    stay.click(this.playerStayHandler)
    replay.click(this.replayGameHandler)
  }
  disablePlayerControl() {
    console.log('disabling player control')
    if($('#hit-button').is('disabled') === false)
    {
      $('#hit-button').attr('disabled', 'disabled')
    }
    if($('#stay-button').is('disabled') === false)
    {
      $('#stay-button').attr('disabled', 'disabled')
    }
  }
}

(function () {
  var game = new Game()
  game.startGame()
}());