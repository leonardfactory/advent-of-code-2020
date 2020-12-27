pub fn run(input: &str) -> u64 {
    let (card_public, door_public) = parse(input);
    let card_loop_size = find_loop_size(7, card_public);
    transform_subject(door_public, card_loop_size)
}

// parsing
pub fn parse(input: &str) -> (u64, u64) {
    let elements: Vec<_> = input
        .split('\n')
        .take(2)
        .map(|x| x.parse::<u64>().expect("u64"))
        .collect();
    (elements[0], elements[1])
}

// decryption
const XMAS_PRIME: u64 = 20201227;

fn transform_subject(subject: u64, loop_size: u64) -> u64 {
    (0..loop_size).fold(1, |value, _| (value * subject) % XMAS_PRIME)
}

fn find_loop_size(subject: u64, remainder: u64) -> u64 {
    let mut value = 1;
    let mut i = 0;
    loop {
        i += 1;
        value = (value * subject) % XMAS_PRIME;
        if value == remainder {
            return i;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_input() {
        assert_eq!(parse("5764801\n17807724"), (5764801, 17807724))
    }

    #[test]
    fn test_transform_subject() {
        assert_eq!(transform_subject(7, 8), 5764801);
        assert_eq!(transform_subject(7, 11), 17807724);
    }

    #[test]
    fn test_find_loop_size() {
        assert_eq!(find_loop_size(7, 5764801), 8);
    }

    #[test]
    fn run_test_keys() {
        let result = run("5764801\n17807724");
        assert_eq!(result, 14897079);
    }
}
