use crate::part1::*;
use std::fs;

// Solve part 2
pub fn run(file_path: &str, days: usize) -> usize {
    let content = fs::read_to_string(file_path).expect("file");
    let instructions = parse(&content);
    let mut hexmap = HexMap::new();
    for instruction in instructions {
        change_tile(&mut hexmap, &instruction);
    }

    // art exibit
    for i in 0..days {
        run_day(&mut hexmap);
        println!("Count is {} at day {}", hexmap.blacks_count(), i + 1);
    }

    hexmap.blacks_count()
}

trait HexMapNavigation {
    fn get_tile(&self, coords: &HexCoord) -> Tile;
    fn blacks_count(&self) -> usize;
}

impl HexMapNavigation for HexMap {
    fn get_tile(&self, coords: &HexCoord) -> Tile {
        *self.get(&coords).or(Some(&Tile::White)).unwrap()
    }

    fn blacks_count(&self) -> usize {
        self.iter()
            .filter(|&(_, tile)| *tile == Tile::Black)
            .count()
    }
}

pub fn run_day(map: &mut HexMap) {
    let precomputed = map
        .iter()
        .filter(|&(_, tile)| *tile == Tile::Black)
        .flat_map(|(coord, _)| nearby_tiles(map, *coord))
        .collect::<Vec<_>>();

    for (coord, _, tile) in precomputed {
        map.insert(coord, tile);
    }

    let changed: Vec<(HexCoord, Tile)> = map
        .iter()
        .filter_map(|(&coord, &tile)| {
            let blacks_around = nearby_tiles(&map, coord)
                .iter()
                .filter(|(_, _, tile)| *tile == Tile::Black)
                .count();

            match tile {
                Tile::Black if blacks_around == 0 || blacks_around > 2 => {
                    Some((coord, Tile::White))
                }
                Tile::White if blacks_around == 2 => Some((coord, Tile::Black)),
                _ => None,
            }
        })
        .collect();

    for (coord, tile) in changed {
        // println!("Changes ({:?}) to {:?}", coord, tile);
        map.insert(coord, tile);
    }
}

const NEARBY_COORDS: [HexCoord; 6] = [(1, 0), (1, -1), (0, 1), (-1, 0), (0, -1), (-1, 1)];

fn nearby_tiles(map: &HexMap, (x, y): HexCoord) -> Vec<(HexCoord, Tile, Tile)> {
    let source = map.get_tile(&(x, y));
    NEARBY_COORDS
        .iter()
        .map(|(dx, dy)| (x + dx, y + dy))
        .map(|coords| (coords, source, map.get_tile(&coords)))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn run_test_file() {
        let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        path.push("input/test.txt");
        assert_eq!(run(path.to_str().unwrap(), 100), 2208)
    }
}
