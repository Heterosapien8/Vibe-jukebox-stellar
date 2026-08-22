#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, String,
};

const DAY_IN_SECONDS: u64 = 86_400;
const DAILY_CLAIM_AMOUNT: i128 = 100_0000000; // 100 VIBE with 7 decimals

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum TokenError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    InsufficientBalance = 4,
    AlreadyClaimedToday = 5,
    InvalidAmount = 6,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Decimals,
    Name,
    Symbol,
    Balance(Address),
    LastClaim(Address),
}

#[contract]
pub struct VibeToken;

#[contractimpl]
impl VibeToken {
    /// Initialize the VIBE token contract
    pub fn initialize(
        env: Env,
        admin: Address,
        decimals: u32,
        name: String,
        symbol: String,
    ) -> Result<(), TokenError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(TokenError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Decimals, &decimals);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);

        // Extend instance TTL for longevity
        env.storage().instance().extend_ttl(100_000, 300_000);
        Ok(())
    }

    /// Claim 100 free VIBE testnet tokens once every 24 hours
    pub fn claim_daily(env: Env, user: Address) -> Result<i128, TokenError> {
        user.require_auth();

        let current_time = env.ledger().timestamp();
        let last_claim_key = DataKey::LastClaim(user.clone());

        if let Some(last_claim) = env.storage().persistent().get::<DataKey, u64>(&last_claim_key) {
            if current_time < last_claim + DAY_IN_SECONDS {
                return Err(TokenError::AlreadyClaimedToday);
            }
        }

        // Record new claim time
        env.storage()
            .persistent()
            .set(&last_claim_key, &current_time);

        // Add 100 VIBE to user balance
        let bal_key = DataKey::Balance(user.clone());
        let current_balance: i128 = env
            .storage()
            .persistent()
            .get(&bal_key)
            .unwrap_or(0);

        let new_balance = current_balance + DAILY_CLAIM_AMOUNT;
        env.storage().persistent().set(&bal_key, &new_balance);

        // Emit claim event
        env.events().publish(
            (symbol_short!("claim"), user),
            DAILY_CLAIM_AMOUNT,
        );

        Ok(DAILY_CLAIM_AMOUNT)
    }

    /// Get current VIBE token balance of an address
    pub fn balance(env: Env, user: Address) -> i128 {
        let bal_key = DataKey::Balance(user);
        env.storage().persistent().get(&bal_key).unwrap_or(0)
    }

    /// Check timestamp of last daily claim for countdown in UI
    pub fn get_last_claim(env: Env, user: Address) -> u64 {
        let last_claim_key = DataKey::LastClaim(user);
        env.storage().persistent().get(&last_claim_key).unwrap_or(0)
    }

    /// Check if user is currently eligible to claim daily VIBE
    pub fn can_claim(env: Env, user: Address) -> bool {
        let last_claim_key = DataKey::LastClaim(user);
        if let Some(last_claim) = env.storage().persistent().get::<DataKey, u64>(&last_claim_key) {
            env.ledger().timestamp() >= last_claim + DAY_IN_SECONDS
        } else {
            true
        }
    }

    /// Burn tokens from user account (used during Jukebox song voting)
    pub fn burn(env: Env, from: Address, amount: i128) -> Result<(), TokenError> {
        from.require_auth();

        if amount <= 0 {
            return Err(TokenError::InvalidAmount);
        }

        let bal_key = DataKey::Balance(from.clone());
        let current_balance: i128 = env
            .storage()
            .persistent()
            .get(&bal_key)
            .unwrap_or(0);

        if current_balance < amount {
            return Err(TokenError::InsufficientBalance);
        }

        let new_balance = current_balance - amount;
        env.storage().persistent().set(&bal_key, &new_balance);

        // Emit burn event
        env.events().publish(
            (symbol_short!("burn"), from),
            amount,
        );

        Ok(())
    }

    /// Mint tokens (Admin only)
    pub fn mint(env: Env, admin: Address, to: Address, amount: i128) -> Result<(), TokenError> {
        admin.require_auth();

        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(TokenError::NotInitialized)?;

        if admin != stored_admin {
            return Err(TokenError::Unauthorized);
        }

        if amount <= 0 {
            return Err(TokenError::InvalidAmount);
        }

        let bal_key = DataKey::Balance(to.clone());
        let current_balance: i128 = env
            .storage()
            .persistent()
            .get(&bal_key)
            .unwrap_or(0);

        let new_balance = current_balance + amount;
        env.storage().persistent().set(&bal_key, &new_balance);

        env.events().publish(
            (symbol_short!("mint"), to),
            amount,
        );

        Ok(())
    }

    /// Transfer tokens between accounts
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) -> Result<(), TokenError> {
        from.require_auth();

        if amount <= 0 {
            return Err(TokenError::InvalidAmount);
        }

        let from_key = DataKey::Balance(from.clone());
        let from_balance: i128 = env
            .storage()
            .persistent()
            .get(&from_key)
            .unwrap_or(0);

        if from_balance < amount {
            return Err(TokenError::InsufficientBalance);
        }

        let to_key = DataKey::Balance(to.clone());
        let to_balance: i128 = env
            .storage()
            .persistent()
            .get(&to_key)
            .unwrap_or(0);

        env.storage().persistent().set(&from_key, &(from_balance - amount));
        env.storage().persistent().set(&to_key, &(to_balance + amount));

        env.events().publish(
            (symbol_short!("transfer"), from, to),
            amount,
        );

        Ok(())
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Decimals).unwrap_or(7)
    }

    pub fn name(env: Env) -> String {
        env.storage().instance().get(&DataKey::Name).unwrap()
    }

    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&DataKey::Symbol).unwrap()
    }
}

#[cfg(test)]
mod test;
