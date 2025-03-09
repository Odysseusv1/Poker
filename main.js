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
            result = 'It\'s a tie!';
        }

        this.messageElement.textContent = result;
        this.showButton.disabled = true;
        this.dealButton.disabled = false;
    }

    getHandRank(hand) {
        // Simple ranking system (1-10)
        // This is a simplified version - you could expand this to check for actual poker hands
        const values = hand.map(card => card.value);
        const suits = hand.map(card => card.suit);
        
        // Check for pairs
        const valueCounts = {};
        values.forEach(value => {
            valueCounts[value] = (valueCounts[value] || 0) + 1;
        });
        
        const pairs = Object.values(valueCounts).filter(count => count === 2).length;
        const threeOfAKind = Object.values(valueCounts).includes(3);
        const fourOfAKind = Object.values(valueCounts).includes(4);
        
        // Simple ranking
        if (fourOfAKind) return 8;
        if (threeOfAKind && pairs === 1) return 7;
        if (new Set(suits).size === 1) return 6;
        if (threeOfAKind) return 4;
        if (pairs === 2) return 3;
        if (pairs === 1) return 2;
        return 1;
    }
}

// Start the game
const game = new PokerGame();