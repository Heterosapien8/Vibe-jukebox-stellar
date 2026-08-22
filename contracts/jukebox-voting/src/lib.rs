#![no_std]
use soroban_sdk::{
    contract, contractclient, contracterror, contractimpl, contracttype, symbol_short, vec,
    Address, Env, String, Vec,
};

const DAY_IN_SECONDS: u64 = 86_400;

#[contractclient(name = "VibeTokenClient")]
pub trait VibeTokenInterface {
    fn burn(env: Env, from: Address, amount: i128);
    fn balance(env: Env, user: Address) -> i128;
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum JukeboxError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    SongNotFound = 4,
    SongAlreadyExists = 5,
    InvalidVoteAmount = 6,
    ZeroVotes = 7,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Song {
    pub id: u32,
    pub title: String,
    pub artist: String,
    pub genre: String,
    pub preview_url: String,
    pub votes: i128,
    pub total_plays: u32,
    pub added_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TokenContract,
    Song(u32),
    SongIds,
    CurrentDay,
    DayHasVotes,
    TotalJukeboxVotes,
}

#[contract]
pub struct JukeboxVoting;

#[contractimpl]
impl JukeboxVoting {
    /// Initialize the Jukebox Voting Contract with admin and VIBE token address
    pub fn initialize(env: Env, admin: Address, vibe_token: Address) -> Result<(), JukeboxError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(JukeboxError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TokenContract, &vibe_token);
        
        let empty_ids: Vec<u32> = vec![&env];
        env.storage().instance().set(&DataKey::SongIds, &empty_ids);

        let initial_day = env.ledger().timestamp() / DAY_IN_SECONDS;
        env.storage().instance().set(&DataKey::CurrentDay, &initial_day);
        env.storage().instance().set(&DataKey::DayHasVotes, &false);
        env.storage().instance().set(&DataKey::TotalJukeboxVotes, &0i128);

        env.storage().instance().extend_ttl(100_000, 300_000);
        Ok(())
    }

    /// Admin adds a new song to the Jukebox catalog
    pub fn add_song(
        env: Env,
        admin: Address,
        id: u32,
        title: String,
        artist: String,
        genre: String,
        preview_url: String,
    ) -> Result<(), JukeboxError> {
        admin.require_auth();

        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(JukeboxError::NotInitialized)?;

        if admin != stored_admin {
            return Err(JukeboxError::Unauthorized);
        }

        let song_key = DataKey::Song(id);
        if env.storage().persistent().has(&song_key) {
            return Err(JukeboxError::SongAlreadyExists);
        }

        let song = Song {
            id,
            title,
            artist,
            genre,
            preview_url,
            votes: 0,
            total_plays: 0,
            added_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&song_key, &song);

        let mut ids: Vec<u32> = env
            .storage()
            .instance()
            .get(&DataKey::SongIds)
            .unwrap_or(vec![&env]);
        ids.push_back(id);
        env.storage().instance().set(&DataKey::SongIds, &ids);

        env.events().publish((symbol_short!("song_add"), id), song.id);

        Ok(())
    }

    /// Vote for a song by burning variable VIBE tokens via inter-contract call
    pub fn vote(
        env: Env,
        voter: Address,
        song_id: u32,
        vibe_amount: i128,
    ) -> Result<i128, JukeboxError> {
        voter.require_auth();

        if vibe_amount <= 0 {
            return Err(JukeboxError::InvalidVoteAmount);
        }

        let song_key = DataKey::Song(song_id);
        let mut song: Song = env
            .storage()
            .persistent()
            .get(&song_key)
            .ok_or(JukeboxError::SongNotFound)?;

        // Check for daily soft-reset rollover
        Self::check_and_apply_soft_reset(&env);

        // Inter-contract call: Burn VIBE tokens from voter
        let token_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .ok_or(JukeboxError::NotInitialized)?;

        let token_client = VibeTokenClient::new(&env, &token_address);
        token_client.burn(&voter, &vibe_amount);

        // Update song votes
        song.votes += vibe_amount;
        env.storage().persistent().set(&song_key, &song);

        // Mark day as having votes
        env.storage().instance().set(&DataKey::DayHasVotes, &true);

        // Increment total jukebox votes
        let total_votes: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalJukeboxVotes)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalJukeboxVotes, &(total_votes + vibe_amount));

        // Emit real-time VoteCast event
        env.events().publish(
            (symbol_short!("votecast"), voter, song_id),
            (vibe_amount, song.votes),
        );

        Ok(song.votes)
    }

    /// Daily soft-reset logic: Clears votes if rolling into a new day and previous day had active votes.
    /// If day had 0 votes, standings remain untouched.
    pub fn soft_reset(env: Env) -> bool {
        Self::check_and_apply_soft_reset(&env)
    }

    fn check_and_apply_soft_reset(env: &Env) -> bool {
        let current_day = env.ledger().timestamp() / DAY_IN_SECONDS;
        let stored_day: u64 = env
            .storage()
            .instance()
            .get(&DataKey::CurrentDay)
            .unwrap_or(0);
        let day_had_votes: bool = env
            .storage()
            .instance()
            .get(&DataKey::DayHasVotes)
            .unwrap_or(false);

        if current_day > stored_day {
            if day_had_votes {
                // Soft reset: reset votes for all songs
                let song_ids: Vec<u32> = env
                    .storage()
                    .instance()
                    .get(&DataKey::SongIds)
                    .unwrap_or(vec![env]);

                for id in song_ids.iter() {
                    let song_key = DataKey::Song(id);
                    if let Some(mut song) = env.storage().persistent().get::<DataKey, Song>(&song_key) {
                        song.votes = 0;
                        env.storage().persistent().set(&song_key, &song);
                    }
                }

                env.events().publish(
                    (symbol_short!("reset"), stored_day),
                    current_day,
                );
            }

            env.storage().instance().set(&DataKey::CurrentDay, &current_day);
            env.storage().instance().set(&DataKey::DayHasVotes, &false);
            true
        } else {
            false
        }
    }

    /// Query a single song by ID
    pub fn get_song(env: Env, id: u32) -> Result<Song, JukeboxError> {
        let song_key = DataKey::Song(id);
        env.storage()
            .persistent()
            .get(&song_key)
            .ok_or(JukeboxError::SongNotFound)
    }

    /// Get all songs in the Jukebox
    pub fn get_all_songs(env: Env) -> Vec<Song> {
        let song_ids: Vec<u32> = env
            .storage()
            .instance()
            .get(&DataKey::SongIds)
            .unwrap_or(vec![&env]);

        let mut songs: Vec<Song> = vec![&env];
        for id in song_ids.iter() {
            let song_key = DataKey::Song(id);
            if let Some(song) = env.storage().persistent().get::<DataKey, Song>(&song_key) {
                songs.push_back(song);
            }
        }
        songs
    }

    /// Get total cumulative votes cast in the jukebox
    pub fn get_total_votes(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalJukeboxVotes)
            .unwrap_or(0)
    }

    /// Get token address
    pub fn get_token(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap()
    }
}

#[cfg(test)]
mod test;
