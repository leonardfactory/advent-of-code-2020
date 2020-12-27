use day_24::part1;
use std::path::PathBuf;
use std::time::Instant;

fn main() {
    let time = Instant::now();

    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push("input/input.txt");

    let black_count = part1::run(path.to_str().unwrap());
    println!("Blacks count is: {}", black_count);

    println!(
        "Elapsed: {:.3}ms",
        time.elapsed().as_micros() as f64 / 1_000.0
    );
}
