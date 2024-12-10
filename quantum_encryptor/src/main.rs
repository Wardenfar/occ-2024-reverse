use std::{
    arch::asm,
    hint::black_box,
    io::{stdin, stdout, Write},
    thread::sleep,
    time::Duration,
};

use aes::{
    cipher::{BlockEncrypt, KeyInit},
    Aes256, Block,
};
use rand::{rngs::OsRng, seq::SliceRandom};

macro_rules! print_and_flush {
    ($($tt:tt),* $(,)?) => {
        print!($($tt),*);
        stdout().flush().unwrap();
    };
}

fn main() {
    println!("---------------------------");
    println!("[!!] Quantum Encryptor [!!]");
    println!("---------------------------");
    println!("");
    println!("The key is automatically fetched with very complex quantum intrication.");
    println!("");
    println!("© Encripteria");
    println!("");
    println!("Enter the message you want to encrypt :");
    print_and_flush!("> ");

    let mut input = String::new();
    stdin().read_line(&mut input).unwrap();
    let mut input = input.into_bytes();

    if input.len() < 16 {
        println!("Your message is too small, don't be afraid, this is super secure !!");
        println!("Encrypt as much data as you want ^^");
        return;
    }

    print_and_flush!("Intrication in progress ");
    wait_and_shuffle(&mut input);
    println!();

    print_and_flush!("Encrypting in progress ");

    let mut result: Vec<u8> = Vec::new();

    let mut state = START_KEY;
    for (aes, xor) in AES_KEYS.iter().zip(XOR_KEYS.iter()) {
        sleep(Duration::from_millis(100));
        print_and_flush!(".");

        step(&mut state, aes, xor);
        state = black_box(state); // prevent the compiler from removing the entire loop ^^

        let cipher = Aes256::new_from_slice(&state).unwrap();
        cipher.encrypt_block(Block::from_mut_slice(&mut input[0..16]));

        result.extend(&input[0..16]);

        // tracing memory is hard and not supported by most of tools out of the box
        // to be not hard in limited time => force storing values in registers
        unsafe {
            let p1 = u64::from_be_bytes(state[0..8].try_into().unwrap());
            let p2 = u64::from_be_bytes(state[8..16].try_into().unwrap());
            let p3 = u64::from_be_bytes(state[16..24].try_into().unwrap());
            let p4 = u64::from_be_bytes(state[24..32].try_into().unwrap());

            asm!(
                "mov r10, {0}",
                "mov r11, {1}",
                "mov r12, {2}",
                "mov r13, {3}",

                in(reg) p1,
                in(reg) p2,
                in(reg) p3,
                in(reg) p4,

                // clobber registers
                out("r10") _,
                out("r11") _,
                out("r12") _,
                out("r13") _,
            );
        }
    }

    wait_and_shuffle(&mut input);
    println!();

    println!("Encrypting result : {}", hex::encode(result));
}

fn step(state: &mut [u8; 32], aes_key: &[u8; 32], xor: &[u8; 32]) {
    let cipher = Aes256::new(aes_key.into());
    cipher.encrypt_block(Block::from_mut_slice(&mut state[0..16]));
    cipher.encrypt_block(Block::from_mut_slice(&mut state[16..32]));
    for (s, x) in state.iter_mut().zip(xor.iter()) {
        *s ^= x;
    }
}

include!("gen.rs");

fn wait_and_shuffle(bytes: &mut [u8]) {
    let mut rng = OsRng::default();
    for _ in 0..10 {
        bytes.shuffle(&mut rng);
        sleep(Duration::from_millis(500));
        print_and_flush!(".");
    }
}
