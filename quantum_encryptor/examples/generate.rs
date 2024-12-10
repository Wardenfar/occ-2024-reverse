use std::env::args;

use aes::{
    cipher::{BlockDecrypt, KeyInit},
    Aes256, Block,
};
use rand::{rngs::OsRng, Rng};

const TOTAL_STEPS: usize = 30;
const STEPS: usize = 25;

fn main() {
    let flag = args().skip(1).next().expect("expect a FLAG argument");
    let flag = flag.as_bytes().to_vec();
    assert!(flag.len() == 32);
    let flag: [u8; 32] = flag.try_into().unwrap();

    let mut aes_keys = Vec::new();
    let mut xor_keys = Vec::new();

    //let mut rng = StdRng::seed_from_u64(1);
    let mut rng = OsRng::default();

    for _ in 0..TOTAL_STEPS {
        aes_keys.push(random_key(&mut rng));
        xor_keys.push(random_key(&mut rng));
    }

    let mut state = flag;
    for idx in (0..STEPS).rev() {
        reverse_step(&mut state, &aes_keys[idx], &xor_keys[idx]);
    }

    print_keys("AES_KEYS", &aes_keys);
    print_keys("XOR_KEYS", &xor_keys);
    println!("const START_KEY: [u8; 32] = {state:?};");
}

fn reverse_step(state: &mut [u8; 32], aes_key: &[u8; 32], xor: &[u8; 32]) {
    for (s, x) in state.iter_mut().zip(xor.iter()) {
        *s ^= x;
    }
    let cipher = Aes256::new(aes_key.into());
    cipher.decrypt_block(Block::from_mut_slice(&mut state[0..16]));
    cipher.decrypt_block(Block::from_mut_slice(&mut state[16..32]));
}

fn print_keys(name: &str, keys: &[[u8; 32]]) {
    println!("const {name}: [[u8;32];{}] = [", keys.len());
    for key in keys {
        print!("[");
        for k in key {
            print!("{k},")
        }
        println!("],")
    }
    println!("];")
}

fn random_key(rng: &mut impl Rng) -> [u8; 32] {
    let mut k = [0; 32];
    rng.fill_bytes(&mut k);
    k
}
