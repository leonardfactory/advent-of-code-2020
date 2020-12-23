use std::time::Instant;

mod part1;
mod part2;

const ROOT: &str = env!("CARGO_MANIFEST_DIR");

// Execution
fn main() {
    let file_path = vec![ROOT, "input/input.txt"].join("/");
    let time = Instant::now();

    // part1::run(&file_path);
    part2::run(&file_path);

    println!(
        "Elapsed: {:.3}ms",
        time.elapsed().as_micros() as f64 / 1_000.0
    );
}
