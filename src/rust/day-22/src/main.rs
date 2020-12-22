use std::collections::VecDeque;
use std::fs;

const ROOT: &str = env!("CARGO_MANIFEST_DIR");

// Mazzo di carte del giocatore
#[derive(Debug, Clone)]
struct Deck {
    name: String,
    cards: VecDeque<u32>,
}

fn parse(file_name: &String) -> (Deck, Deck) {
    let mut decks: Vec<Deck> = fs::read_to_string(file_name)
        .expect("Impossibile leggere il file")
        .split("\n\n")
        .map(|x| x.lines().collect())
        .map(Deck::parse)
        .take(2)
        .collect();

    (decks.remove(0), decks.remove(0))
}

impl Deck {
    fn parse(lines: Vec<&str>) -> Self {
        Self {
            name: String::from(lines[0]),
            cards: lines
                .iter()
                .skip(1)
                .map(|l| l.parse::<u32>().expect("u32"))
                .collect(),
        }
    }

    fn score(&self) -> u32 {
        self.cards
            .iter()
            .rev()
            .enumerate()
            .fold(0, |sum, (i, card)| sum + card * ((i as u32) + 1))
    }
}

#[derive(Debug)]
struct Combat {
    player1: Deck,
    player2: Deck,
}

enum Round<'a> {
    Continue,
    Win(&'a Deck),
}

impl Combat {
    fn new(player1: Deck, player2: Deck) -> Self {
        Self { player1, player2 }
    }

    fn play(&mut self) -> Round {
        let card1 = self.player1.cards.pop_front().unwrap();
        let card2 = self.player2.cards.pop_front().unwrap();

        match (card1, card2) {
            (c1, c2) if c1 > c2 => {
                self.player1.cards.push_back(c1);
                self.player1.cards.push_back(c2);

                if self.player2.cards.len() == 0 {
                    return Round::Win(&self.player1);
                }
                Round::Continue
            }
            (c1, c2) if c1 < c2 => {
                self.player2.cards.push_back(c2);
                self.player2.cards.push_back(c1);

                if self.player1.cards.len() == 0 {
                    return Round::Win(&self.player2);
                }

                Round::Continue
            }
            (_, _) => panic!("It's a draw!"),
        }
    }
}

fn main() {
    let file_path = vec![ROOT, "input/input.txt"].join("/");
    let (player1, player2) = parse(&file_path);
    let mut combat = Combat::new(player1, player2);

    // rounds
    loop {
        match combat.play() {
            Round::Continue => {}
            Round::Win(player) => {
                println!(
                    "Player {} wins the match! Score is {}",
                    player.name,
                    player.score()
                );
                break;
            }
        }
    }

    println!("input is {:?}, path is {:?}", combat, file_path);
}
