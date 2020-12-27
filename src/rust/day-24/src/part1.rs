use std::collections::HashMap;
use std::fs;
use std::str::FromStr;

// Solve part 1
pub fn run(file_path: &str) -> usize {
    let content = fs::read_to_string(file_path).expect("file");
    let instructions = parse(&content);
    let mut hexmap = HexMap::new();
    for instruction in instructions {
        change_tile(&mut hexmap, &instruction);
    }
    hexmap
        .iter()
        .filter(|&(_, tile)| *tile == Tile::Black)
        .count()
}

// register map
pub fn instruction_coords(instructions: &[Instruction]) -> HexCoord {
    instructions
        .iter()
        .map(|i| match i {
            Instruction::East => (1, 0),
            Instruction::NorthEast => (1, -1),
            Instruction::SouthEast => (0, 1),
            Instruction::West => (-1, 0),
            Instruction::NorthWest => (0, -1),
            Instruction::SouthWest => (-1, 1),
        })
        .fold((0, 0), |(x, y), (dx, dy)| (x + dx, y + dy))
}

pub fn change_tile(map: &mut HexMap, instructions: &[Instruction]) {
    let (x, y) = instruction_coords(instructions);
    let tile = map.entry((x, y)).or_insert(Tile::White);
    *tile = tile.switch();
}

#[derive(PartialEq, Clone, Copy, Debug)]
pub enum Tile {
    Black,
    White,
}

impl Tile {
    fn switch(&self) -> Self {
        match self {
            Tile::Black => Self::White,
            Tile::White => Self::Black,
        }
    }
}

pub type HexCoord = (i32, i32);
pub type HexMap = HashMap<HexCoord, Tile>;

// parse instructions
pub fn parse(content: &str) -> Vec<Vec<Instruction>> {
    content.lines().map(parse_instruction).collect()
}

fn parse_instruction(instruction: &str) -> Vec<Instruction> {
    // let tokens: Vec<Instruction> = Vec::new();
    let tokens = instruction
        .split("")
        .into_iter()
        .fold((vec![], String::from("")), |(mut tokens, current), char| {
            let mut next = current + char;
            if let Ok(instruction) = Instruction::from_str(&next) {
                next = String::from("");
                tokens.push(instruction)
            }

            (tokens, next)
        })
        .0;

    tokens
}

pub enum Instruction {
    East,      // +1, 0
    NorthEast, // +1, -1
    SouthEast, // 0, +1
    West,      // -1, 0
    NorthWest, // 0, -1
    SouthWest, // -1, +1
}

#[derive(Debug)]
pub enum ParseInstructionError {
    Unrecognized,
}

impl FromStr for Instruction {
    type Err = ParseInstructionError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "w" => Ok(Instruction::West),
            "nw" => Ok(Instruction::NorthWest),
            "sw" => Ok(Instruction::SouthWest),
            "e" => Ok(Instruction::East),
            "ne" => Ok(Instruction::NorthEast),
            "se" => Ok(Instruction::SouthEast),
            _ => Err(ParseInstructionError::Unrecognized),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn run_test_file() {
        let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        path.push("input/test.txt");
        assert_eq!(run(path.to_str().unwrap()), 10)
    }
}
