#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env, String};

#[test]
fn test_initialize_and_metadata() {
    let env = Env::default();
    let contract_id = env.register(VibeToken, ());
    let client = VibeTokenClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let name = String::from_str(&env, "VIBE Token");
    let symbol = String::from_str(&env, "VIBE");

    client.initialize(&admin, &7, &name, &symbol);

    assert_eq!(client.decimals(), 7);
    assert_eq!(client.name(), name);
    assert_eq!(client.symbol(), symbol);
}

#[test]
fn test_daily_claim_workflow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(VibeToken, ());
    let client = VibeTokenClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let name = String::from_str(&env, "VIBE Token");
    let symbol = String::from_str(&env, "VIBE");

    client.initialize(&admin, &7, &name, &symbol);

    // Initial state
    assert_eq!(client.balance(&user), 0);
    assert_eq!(client.can_claim(&user), true);

    // First claim at timestamp 1000
    env.ledger().set_timestamp(1000);
    let claimed = client.claim_daily(&user);
    assert_eq!(claimed, 100_0000000);
    assert_eq!(client.balance(&user), 100_0000000);
    assert_eq!(client.get_last_claim(&user), 1000);
    assert_eq!(client.can_claim(&user), false);

    // Attempting same day claim fails
    env.ledger().set_timestamp(5000);
    let result = client.try_claim_daily(&user);
    assert!(result.is_err());

    // Advance 1 day + 1 second (1000 + 86401)
    env.ledger().set_timestamp(1000 + 86401);
    assert_eq!(client.can_claim(&user), true);

    let second_claim = client.claim_daily(&user);
    assert_eq!(second_claim, 100_0000000);
    assert_eq!(client.balance(&user), 200_0000000);
    assert_eq!(client.get_last_claim(&user), 1000 + 86401);
}

#[test]
fn test_burn_and_transfer() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(VibeToken, ());
    let client = VibeTokenClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    client.initialize(
        &admin,
        &7,
        &String::from_str(&env, "VIBE"),
        &String::from_str(&env, "VIBE"),
    );

    // Admin mints 500 VIBE to user1
    client.mint(&admin, &user1, &500_0000000);
    assert_eq!(client.balance(&user1), 500_0000000);

    // User1 burns 150 VIBE (e.g. for Jukebox voting)
    client.burn(&user1, &150_0000000);
    assert_eq!(client.balance(&user1), 350_0000000);

    // Burning more than available fails
    let fail_burn = client.try_burn(&user1, &400_0000000);
    assert!(fail_burn.is_err());

    // User1 transfers 50 VIBE to user2
    client.transfer(&user1, &user2, &50_0000000);
    assert_eq!(client.balance(&user1), 300_0000000);
    assert_eq!(client.balance(&user2), 50_0000000);
}
