// Exercise: Ownership, Borrowing, and Lifetimes
//
// Senior-level concepts: ownership rules, borrowing, lifetimes,
// and how they prevent memory bugs at compile time.

struct BankAccount {
    owner: String,
    balance: f64,
}

impl BankAccount {
    fn new(owner: &str, balance: f64) -> Self {
        Self {
            owner: owner.to_string(),
            balance,
        }
    }

    // Immutable borrow - safe for concurrent readers
    fn balance(&self) -> f64 {
        self.balance
    }

    // Mutable borrow - exclusive access
    fn deposit(&mut self, amount: f64) -> Result<f64, String> {
        if amount <= 0.0 {
            return Err("Deposit must be positive".into());
        }
        self.balance += amount;
        Ok(self.balance)
    }

    fn withdraw(&mut self, amount: f64) -> Result<f64, String> {
        if amount > self.balance {
            return Err(format!(
                "Insufficient funds: have {}, need {}",
                self.balance, amount
            ));
        }
        self.balance -= amount;
        Ok(self.balance)
    }
}

// Lifetime parameter: the returned reference lives as long as the input
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() >= y.len() { x } else { y }
}

fn main() {
    let mut account = BankAccount::new("Alice", 1000.0);

    // Borrow checker demo: immutable borrows can coexist
    let a = account.balance();
    let b = account.balance();
    println!("Balance: {a} + {b} = {}", a + b);

    // Mutable borrow - exclusive, must not overlap with immutable
    match account.deposit(500.0) {
        Ok(balance) => println!("After deposit: {balance}"),
        Err(e) => println!("Error: {e}"),
    }

    match account.withdraw(2000.0) {
        Ok(balance) => println!("After withdrawal: {balance}"),
        Err(e) => println!("Withdrawal failed: {e}"),
    }

    // Lifetimes
    let s1 = String::from("short");
    let s2 = String::from("longer string");
    println!("Longest: {}", longest(&s1, &s2));

    println!(
        "Final balance for {}: {}",
        account.owner,
        account.balance()
    );
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deposits_increase_balance() {
        let mut acc = BankAccount::new("Bob", 100.0);
        assert_eq!(acc.deposit(50.0), Ok(150.0));
    }

    #[test]
    fn rejects_negative_deposits() {
        let mut acc = BankAccount::new("Bob", 100.0);
        assert!(acc.deposit(-10.0).is_err());
    }

    #[test]
    fn rejects_overdraft() {
        let mut acc = BankAccount::new("Bob", 10.0);
        assert!(acc.withdraw(50.0).is_err());
    }
}
