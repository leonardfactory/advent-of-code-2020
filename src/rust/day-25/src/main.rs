use day_25::part1;
use std::time::Instant;

fn main() {
    let time = Instant::now();
    let input = "12578151\n5051300";

    let encryption_key = part1::run(input);
    println!("Encryption key: {}", encryption_key);

    println!(
        "Elapsed: {:.3}ms",
        time.elapsed().as_micros() as f64 / 1_000.0
    );
}
