#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env, String};
use vibe_token::{VibeToken, VibeTokenClient};

#[test]
fn test_jukebox_flow_and_inter_contract_voting() {
    let env = Env::default();
    env.mock_all_auths();

    // 1. Deploy VibeToken contract
    let token_id = env.register(VibeToken, ());
    let token_client = VibeTokenClient::new(&env, &token_id);

    let admin = Address::generate(&env);
    let voter = Address::generate(&env);

    token_client.initialize(
        &admin,
        &7,
        &String::from_str(&env, "VIBE Token"),
        &String::from_str(&env, "VIBE"),
    );

    // 2. Deploy JukeboxVoting contract
    let jukebox_id = env.register(JukeboxVoting, ());
    let jukebox_client = JukeboxVotingClient::new(&env, &jukebox_id);

    jukebox_client.initialize(&admin, &token_id);

    // 3. Admin adds songs
    jukebox_client.add_song(
        &admin,
        &1,
        &String::from_str(&env, "Cyber Horizon"),
        &String::from_str(&env, "Stellar Beats"),
        &String::from_str(&env, "Synthwave"),
        &String::from_str(&env, "https://example.com/song1.mp3"),
    );

    jukebox_client.add_song(
        &admin,
        &2,
        &String::from_str(&env, "Soroban Dreams"),
        &String::from_str(&env, "Smart Contract Collective"),
        &String::from_str(&env, "Electronic"),
        &String::from_str(&env, "https://example.com/song2.mp3"),
    );

    let all_songs = jukebox_client.get_all_songs();
    assert_eq!(all_songs.len(), 2);

    // 4. Voter claims daily 100 VIBE tokens
    env.ledger().set_timestamp(10_000);
    token_client.claim_daily(&voter);
    assert_eq!(token_client.balance(&voter), 100_0000000);

    // 5. Voter casts 40 VIBE on Song 1 and 20 VIBE on Song 2
    let updated_song1_votes = jukebox_client.vote(&voter, &1, &40_0000000);
    assert_eq!(updated_song1_votes, 40_0000000);

    let updated_song2_votes = jukebox_client.vote(&voter, &2, &20_0000000);
    assert_eq!(updated_song2_votes, 20_0000000);

    // 6. Verify voter balance after burning (100 - 40 - 20 = 40)
    assert_eq!(token_client.balance(&voter), 40_0000000);

    // 7. Verify total jukebox votes
    assert_eq!(jukebox_client.get_total_votes(), 60_0000000);

    let song1 = jukebox_client.get_song(&1);
    assert_eq!(song1.votes, 40_0000000);

    let song2 = jukebox_client.get_song(&2);
    assert_eq!(song2.votes, 20_0000000);
}

#[test]
fn test_daily_soft_reset() {
    let env = Env::default();
    env.mock_all_auths();

    let token_id = env.register(VibeToken, ());
    let token_client = VibeTokenClient::new(&env, &token_id);

    let admin = Address::generate(&env);
    let voter = Address::generate(&env);

    token_client.initialize(
        &admin,
        &7,
        &String::from_str(&env, "VIBE"),
        &String::from_str(&env, "VIBE"),
    );

    let jukebox_id = env.register(JukeboxVoting, ());
    let jukebox_client = JukeboxVotingClient::new(&env, &jukebox_id);

    // Day 0: start at timestamp 10,000
    env.ledger().set_timestamp(10_000);
    jukebox_client.initialize(&admin, &token_id);

    jukebox_client.add_song(
        &admin,
        &1,
        &String::from_str(&env, "Test Song"),
        &String::from_str(&env, "Artist"),
        &String::from_str(&env, "Pop"),
        &String::from_str(&env, "https://example.com/test.mp3"),
    );

    token_client.claim_daily(&voter);
    jukebox_client.vote(&voter, &1, &50_0000000);

    assert_eq!(jukebox_client.get_song(&1).votes, 50_0000000);

    // Advance ledger to Day 1 (100,000 seconds)
    env.ledger().set_timestamp(100_000);

    // Trigger soft reset check
    let reset_applied = jukebox_client.soft_reset();
    assert_eq!(reset_applied, true);

    // Song still exists, but votes reset to 0
    assert_eq!(jukebox_client.get_song(&1).votes, 0);

    // Advancing further without any votes in Day 1 does NOT clear again unnecessarily
    env.ledger().set_timestamp(200_000);
    let reset_again = jukebox_client.soft_reset();
    assert_eq!(reset_again, true); // day rolled over
}
