compile:
	cargo run --example generate -- "OCC{th3_h4rd_w4Y_wAs_v3Ry_hard!}" > src/gen.rs
	rm -rf target
	# the chall can be solve without reversing it, so make it very (very) hard :)
	# full static & full opti & full strip
	RUSTFLAGS="-L/usr/lib/musl/lib -L/usr/lib/rustlib/x86_64-unknown-linux-musl/lib/self-contained/" cargo +nightly build -Zbuild-std=std,panic_abort --release --target x86_64-unknown-linux-musl
	strip target/x86_64-unknown-linux-musl/release/quantum_encryptor
	cp target/x86_64-unknown-linux-musl/release/quantum_encryptor quantum_encryptor


clean:
	cargo clean
	rm -f quantum_encryptor
