use std::char;

// Solve part 1
pub fn run(input: &str, moves: usize) -> String {
    let cups = parse(input);
    let cups = play(cups, moves);
    count_from_one(&cups)
}

pub type Cups = Vec<u32>;

pub fn count_from_one(cups: &Cups) -> String {
    let mut cups = cups.clone();
    let i_one = cups.iter().position(|&r| r == 1).unwrap();
    cups.rotate_left(i_one);
    cups.iter()
        .skip(1)
        .copied()
        .map(|c| char::from_digit(c, 10).expect("char"))
        .collect()
}

pub fn play(mut cups: Cups, moves: usize) -> Cups {
    let mut current = 0;
    let mut current_value: u32;
    let (min, max) = (
        cups.iter().copied().min().unwrap(),
        cups.iter().copied().max().unwrap(),
    );

    for i in 0..moves {
        // println!("cups={:?}", cups);
        current_value = cups[current];
        let picked = pick(&mut cups, current);
        let destination = find_next(&cups, &picked, min, max, current_value);
        let _destination_value = cups[destination];
        insert(&mut cups, destination + 1, current, current_value, &picked);

        // println!(
        //     "move[{}] dest={} ({}) picked={:?}\n",
        //     i + 1,
        //     destination,
        //     destination_value,
        //     picked
        // );

        current = (current + 1) % cups.len()
    }

    cups
}

fn find_next(cups: &[u32], picked: &[u32], min: u32, max: u32, current: u32) -> usize {
    let mut next = current;
    loop {
        next = if next - 1 < min { max } else { next - 1 };
        if !picked.contains(&next) {
            // println!(
            //     "current={}, next={}, min={}, max={}, picked={:?}, cups={:?}",
            //     current, next, min, max, picked, cups,
            // );
            return cups.iter().position(|&v| v == next).unwrap();
        }
    }
}

fn pick(cups: &mut Cups, current: usize) -> Vec<u32> {
    // let picked: [u32; 3] = Default::default();
    let picked: Vec<u32> = (1..4)
        .map(|i| (current + i) % cups.len())
        .map(|i| cups.get(i).unwrap())
        .copied()
        .collect();

    cups.retain(|&v| !picked.contains(&v));

    picked
}

fn insert(cups: &mut Cups, at: usize, current: usize, current_value: u32, picked: &[u32]) {
    cups.splice(at..at, picked.iter().copied());
    let new_current = cups.iter().position(|&v| v == current_value).unwrap();
    if new_current > current {
        cups.rotate_left(new_current - current);
    }
}

pub fn parse(content: &str) -> Cups {
    content.chars().map(|c| c.to_digit(10).unwrap()).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_correctly() {
        assert_eq!(parse("1342").as_slice(), [1, 3, 4, 2]);
    }

    #[test]
    fn run_test_cups() {
        assert_eq!(run("389125467", 100), "67384529")
    }
}
