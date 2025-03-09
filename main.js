class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }
    get color() {
        return ['♥', '♦'].includes(this.suit) ? 'red' : 'black';
    }
    toString() {
        return `${this.value}${this.suit}`;
    }
}

class Deck {
    constructor() {
        this.cards = [];
        const suits = ['♠', '♥', '♣', '♦'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        for (const suit of suits) {
            for (const value of values) {
                this.cards.push(new Card(suit, value));
            }
        }
    }
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    deal(numCards) {
        return this.cards.splice(0, numCards);
    }
}

class PokerGame {
    constructor() {
        this.deck = new Deck();
        this.playerHand = [];
        this.computerHand = [];
        this.selectedCards = new Set();
        this.dealButton = document.getElementById('deal-button');
        this.drawButton = document.getElementById('draw-button');
        this.showButton = document.getElementById('show-button');
        this.messageElement = document.getElementById('message');
        this.dealButton.addEventListener('click', () => this.startNewGame());
        this.drawButton.addEventListener('click', () => this.drawPhase());
        this.showButton.addEventListener('click', () => this.showdown());
    }

    startNewGame() {
        this.deck = new Deck();
        this.deck.shuffle();
        this.playerHand = this.deck.deal(5);
        this.computerHand = this.deck.deal(5);
        this.selectedCards.clear();
        this.renderHands();
        this.dealButton.disabled = true;
        this.drawButton.disabled = false;
        this.showButton.disabled = true;
        this.messageElement.textContent = 'Select up to 3 cards to discard';
    }

    renderHands() {
        const playerContainer = document.querySelector('#player-hand .cards');
        const computerContainer = document.querySelector('#opponent-hand .cards');
        playerContainer.innerHTML = '';
        computerContainer.innerHTML = '';
        this.playerHand.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = `card ${card.color}`;
            cardElement.textContent = card.toString();
            cardElement.addEventListener('click', () => this.toggleCardSelection(index, cardElement));
            playerContainer.appendChild(cardElement);
        });
        this.computerHand.forEach(() => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card back';
            cardElement.textContent = '?';
            computerContainer.appendChild(cardElement);
        });
    }

    toggleCardSelection(index, element) {
        if (this.drawButton.disabled) return;
        if (this.selectedCards.has(index)) {
            this.selectedCards.delete(index);
            element.classList.remove('selected');
        } else if (this.selectedCards.size < 3) {
            this.selectedCards.add(index);
            element.classList.add('selected');
        }
    }

    drawPhase() {
        // Replace selected cards
        const newCards = this.deck.deal(this.selectedCards.size);
        Array.from(this.selectedCards).sort((a, b) => b - a).forEach((index, i) => {
            this.playerHand[index] = newCards[i];
        });
        // Computer AI: Replace worst cards
        const computerDiscard = this.getComputerDiscards();
        const computerNewCards = this.deck.deal(computerDiscard.length);
        computerDiscard.sort((a, b) => b - a).forEach((index, i) => {
            this.computerHand[index] = computerNewCards[i];
        });
        this.selectedCards.clear();
        this.renderHands();
        this.drawButton.disabled = true;
        this.showButton.disabled = false;
        this.messageElement.textContent = 'Click "Show Cards" to reveal hands';
    }

    getComputerDiscards() {
        // Simple AI: Randomly discard 1-3 cards
        const numToDiscard = Math.floor(Math.random() * 3) + 1;
        const indices = [];
        while (indices.length < numToDiscard) {
            const index = Math.floor(Math.random() * 5);
            if (!indices.includes(index)) indices.push(index);
        }
        return indices;
    }

    showdown() {
        const computerContainer = document.querySelector('#opponent-hand .cards');
        computerContainer.innerHTML = '';
        this.computerHand.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = `card ${card.color}`;
            cardElement.textContent = card.toString();
            computerContainer.appendChild(cardElement);
        });
        const playerRank = this.getHandRank(this.playerHand);
        const computerRank = this.getHandRank(this.computerHand);
        let result;
        if (playerRank > computerRank) {
            result = 'You win!';
        } else if (computerRank > playerRank) {
            result = 'Computer wins!';
        } else {
            result = "It's a tie!";
        }
        this.messageElement.textContent = result;
        this.showButton.disabled = true;
        this.dealButton.disabled = false;
    }

    getHandRank(hand) {
        const values = hand.map(card => card.value);
        const suits = hand.map(card => card.suit);
        const valueCounts = {};
        values.forEach(value => {
            valueCounts[value] = (valueCounts[value] || 0) + 1;
        });
        const counts = Object.values(valueCounts);
        const uniqueValues = Object.keys(valueCounts).map(v => {
            return ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'].indexOf(v);
        }).sort((a, b) => a - b);
        const isFlush = new Set(suits).size === 1;
        const isStraight = uniqueValues.length === 5 && (Math.max(...uniqueValues) - Math.min(...uniqueValues) === 4);
        const isFourOfAKind = counts.includes(4);
        const isFullHouse = counts.includes(3) && counts.includes(2);
        const isThreeOfAKind = counts.includes(3);
        const isTwoPair = counts.filter(count => count === 2).length === 2;
        const isOnePair = counts.includes(2);

        if (isFlush && isStraight) return 9; // Straight Flush
        if (isFourOfAKind) return 8; // Four of a Kind
        if (isFullHouse) return 7; // Full House
        if (isFlush) return 6; // Flush
        if (isStraight) return 5; // Straight
        if (isThreeOfAKind) return 4; // Three of a Kind
        if (isTwoPair) return 3; // Two Pair
        if (isOnePair) return 2; // One Pair
        return 1; // High Card
    }
}

// Start the game
const game = new PokerGame();
