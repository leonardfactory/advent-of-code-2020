use day_23::part1;
use day_23::part2;
use std::time::Instant;

fn main() {
    let time = Instant::now();

    let labels = part1::run("583976241", 100);
    println!("Labels after 100moves: {}", labels);

    let labels = part2::run("583976241", 10_000_000);
    println!("Labels after 10 million moves: {}", labels);

    println!(
        "Elapsed: {:.3}ms",
        time.elapsed().as_micros() as f64 / 1_000.0
    );
}
