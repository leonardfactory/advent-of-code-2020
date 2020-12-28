use std::collections::HashMap;

use crate::part1::*;

type Cups = Vec<u32>;

const LEN: usize = 1_000_000;

// Solve part 2
pub fn run(input: &str, moves: usize) -> u64 {
    let mut data: Cups = parse(input);
    let max = data.iter().copied().max().unwrap() + 1;
    data.extend((max..=LEN as u32).collect::<Cups>());

    let mut sequence: HashMap<u32, u32> = HashMap::new();
    for (i, &cup) in data.iter().enumerate() {
        sequence.insert(cup, data[(i + 1) % LEN]);
    }

    play(&mut sequence, data[0], moves);
    clockwise_near_one(&sequence)
}

// // [1  2  3  4  5  6  7  8  9  10 11 12 13 14]  1 -> 2 -> 3 -> 4 -> 5
// 1 -> 5     14 -> 2   4 -> 1
// // [1  5  6  7  8  9  10 11 12 13 14 2  3  4]
// // [1  5  9  13  4  6  7  8  10 11 12 14 2  3]

pub fn play(sequence: &mut HashMap<u32, u32>, first: u32, moves: usize) {
    let mut current: u32 = first;
    let (min, max) = (1, LEN as u32);

    let wrap_ring = |cup: u32| if cup < min { max } else { cup };

    for i in 0..moves {
        if i % 500_000 == 0 {
            println!("500k moves and counting...");
        }
        // println!("cups={:?}", cups);
        let next_1 = *sequence.get(&current).unwrap();
        let next_2 = *sequence.get(&next_1).unwrap();
        let next_3 = *sequence.get(&next_2).unwrap();

        let next_4 = *sequence.get(&next_3).unwrap();

        let nexts = [next_1, next_2, next_3];
        let mut destination = wrap_ring(current - 1);

        while nexts.contains(&destination) {
            destination = wrap_ring(destination - 1);
        }

        let destination_next = *sequence.get(&destination).unwrap();

        sequence.insert(current, next_4);
        sequence.insert(destination, next_1);
        sequence.insert(next_3, destination_next);

        current = next_4;
    }
}

fn clockwise_near_one(cups: &HashMap<u32, u32>) -> u64 {
    let next_1 = *cups.get(&1).unwrap() as u64;
    let next_2 = *cups.get(&(next_1 as u32)).unwrap() as u64;

    next_1 * next_2
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn run_million_cups_test() {
        assert_eq!(run("389125467", 10_000_000), 149245887792)
    }
}
