use std::cmp;
use std::collections::HashSet;
use std::collections::VecDeque;
use std::fs;
use std::iter::FromIterator;

type Card = usize;

// Solve part 2
pub fn run(file_path: &str) {
    let (player1, player2) = parse(file_path);
    let mut combat = Combat::new(player1, player2);
    let (id, winner) = play(&mut combat);
    println!("Winner ID {} score is: {}", id, score(&winner))
}

fn parse(file_name: &str) -> (Deck, Deck) {
    let mut decks: Vec<Deck> = fs::read_to_string(file_name)
        .expect("Impossibile leggere il file")
        .split("\n\n")
        .map(|x| x.lines().collect())
        .map(Deck::parse)
        .take(2)
        .collect();

    (decks.remove(0), decks.remove(0))
}

// Mazzo di carte del giocatore
#[derive(Debug, Clone)]
struct Deck {
    cards: VecDeque<Card>,
}

impl Deck {
    fn parse(lines: Vec<&str>) -> Self {
        Self {
            cards: lines
                .iter()
                .skip(1)
                .map(|l| l.parse::<Card>().expect("u32"))
                .collect(),
        }
    }

    fn clone_take(&self, take: usize) -> Self {
        Self {
            cards: self.cards.iter().take(take).copied().collect(),
        }
    }
}

fn score(deck: &Deck) -> usize {
    deck.cards
        .iter()
        .rev()
        .enumerate()
        .fold(0, |sum, (i, card)| sum + card * (i + 1))
}

type Rounds = HashSet<(Vec<Card>, Vec<Card>)>; // Vec<(Vec<Card>, Vec<Card>)>;

#[derive(Debug, Clone)]
struct Combat {
    player1: Deck,
    player2: Deck,
    rounds: Rounds,
}

impl Combat {
    fn new(player1: Deck, player2: Deck) -> Self {
        Self {
            player1,
            player2,
            rounds: HashSet::new(),
        }
    }
}

enum Round {
    Continue,
    Win(usize),
}

fn play(combat: &mut Combat) -> (usize, &Deck) {
    let mut i = 0;
    loop {
        i += 1;
        let result = play_round(combat, i);
        match result {
            Round::Continue => {}
            Round::Win(player) => {
                return match player {
                    1 => (1, &combat.player1),
                    2 => (2, &combat.player2),
                    _ => panic!(),
                }
            }
        }
    }
}

fn play_round(combat: &mut Combat, _i: u32) -> Round {
    let Combat {
        player1,
        player2,
        rounds,
    } = combat;

    let card1 = player1.cards.pop_front().unwrap();
    let card2 = player2.cards.pop_front().unwrap();

    let latest_round = (
        Vec::from_iter(player1.cards.iter().copied()),
        Vec::from_iter(player2.cards.iter().copied()),
    );
    let is_fresh_round = rounds.insert(latest_round);

    // Avoid infinite loop
    if !is_fresh_round {
        return Round::Win(1);
    }

    let winner_id = match (card1, card2) {
        // Recursive play
        (c1, c2) if c1 <= player1.cards.len() && c2 <= player2.cards.len() => {
            // println!("\n--Nested Game! --");
            let mut round_combat = Combat::new(player1.clone_take(c1), player2.clone_take(c2));
            let (round_winner_id, _) = play(&mut round_combat);
            round_winner_id
        }
        // Normal play
        (c1, c2) if c1 > c2 => 1,
        (c1, c2) if c1 < c2 => 2,
        (c1, c2) => panic!("It's a draw! {} vs {}", c1, c2),
    };

    // println!(
    //     "\n-- Round {} --\nDeck 1: {:?}\nDeck 2: {:?}\n1 Plays: {}\n2 Plays: {}\nWinner {}",
    //     _i, player1.cards, player2.cards, card1, card2, winner_id
    // );

    let (winner, loser, w_card, l_card) = match winner_id {
        1 => (player1, player2, card1, card2),
        2 => (player2, player1, card2, card1),
        _ => panic!("Unknown loser"),
    };

    winner.cards.push_back(w_card);
    winner.cards.push_back(l_card);

    if loser.cards.is_empty() {
        Round::Win(winner_id)
    } else {
        Round::Continue
    }
}
