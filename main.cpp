/*
 * ============================================================
 *   Mini Banking System – "Personal Savings Account"
 *   Classes : Transaction | Account | BankSystem
 * ============================================================
 */

#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <sstream>
#include <iomanip>
#include <ctime>
#include <algorithm>
#include <limits>

using namespace std;

// ─────────────────────────────────────────────────────────────
//  ANSI colour helpers (terminal only; stripped for WASM build)
// ─────────────────────────────────────────────────────────────
#ifndef __EMSCRIPTEN__
const string RESET  = "\033[0m";
const string BOLD   = "\033[1m";
const string CYAN   = "\033[96m";
const string GREEN  = "\033[92m";
const string YELLOW = "\033[93m";
const string RED    = "\033[91m";
const string BLUE   = "\033[94m";
const string MAGENTA= "\033[95m";
const string DIM    = "\033[2m";
#else
const string RESET  = "";
const string BOLD   = "";
const string CYAN   = "";
const string GREEN  = "";
const string YELLOW = "";
const string RED    = "";
const string BLUE   = "";
const string MAGENTA= "";
const string DIM    = "";
#endif

// ─────────────────────────────────────────────────────────────
//  Utility: current timestamp as string
// ─────────────────────────────────────────────────────────────
string currentTimestamp() {
    time_t now = time(nullptr);
    char buf[20];
    strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", localtime(&now));
    return string(buf);
}

// ─────────────────────────────────────────────────────────────
//  Class: Transaction
// ─────────────────────────────────────────────────────────────
class Transaction {
private:
    int    txnNo;
    string type;       // "DEPOSIT" | "WITHDRAW"
    double amount;
    double balAfter;
    string timestamp;

public:
    // Constructor used when creating a new transaction
    Transaction(int no, const string& t, double amt, double bal)
        : txnNo(no), type(t), amount(amt), balAfter(bal),
          timestamp(currentTimestamp()) {}

    // Constructor used when loading from file
    Transaction(int no, const string& t, double amt, double bal,
                const string& ts)
        : txnNo(no), type(t), amount(amt), balAfter(bal), timestamp(ts) {}

    // Getters
    int    getTxnNo()    const { return txnNo; }
    string getType()     const { return type; }
    double getAmount()   const { return amount; }
    double getBalAfter() const { return balAfter; }
    string getTimestamp()const { return timestamp; }

    // Serialise to pipe-delimited string for file storage
    string serialise() const {
        ostringstream oss;
        oss << txnNo << "|" << type << "|"
            << fixed << setprecision(2) << amount << "|"
            << balAfter << "|" << timestamp;
        return oss.str();
    }

    // Pretty print one transaction row
    void print() const {
        string col = (type == "DEPOSIT") ? GREEN : RED;
        cout << CYAN << "  #" << setw(4) << txnNo << RESET
             << "  " << col << setw(8) << type << RESET
             << "  " << YELLOW << setw(10) << fixed << setprecision(2)
             << amount << RESET
             << "  Bal: " << BLUE << setw(10) << balAfter << RESET
             << "  " << DIM << timestamp << RESET << "\n";
    }
};

// ─────────────────────────────────────────────────────────────
//  Class: Account
// ─────────────────────────────────────────────────────────────
class Account {
private:
    string accNo;
    string name;
    double balance;
    vector<Transaction> history;
    int    txnCounter;

public:
    // New account constructor
    Account(const string& no, const string& n, double initBalance = 0.0)
        : accNo(no), name(n), balance(initBalance), txnCounter(0) {}

    // Getters
    string getAccNo()  const { return accNo; }
    string getName()   const { return name; }
    double getBalance()const { return balance; }

    // Deposit
    bool deposit(double amount) {
        if (amount <= 0) {
            cout << RED << "  ✗ Invalid deposit amount.\n" << RESET;
            return false;
        }
        balance += amount;
        txnCounter++;
        history.emplace_back(txnCounter, "DEPOSIT", amount, balance);
        cout << GREEN << "  ✓ Deposited ₹" << fixed << setprecision(2)
             << amount << ". New balance: ₹" << balance << RESET << "\n";
        return true;
    }

    // Withdraw (no overdraft)
    bool withdraw(double amount) {
        if (amount <= 0) {
            cout << RED << "  ✗ Invalid withdrawal amount.\n" << RESET;
            return false;
        }
        if (amount > balance) {
            cout << RED << "  ✗ Insufficient funds! Balance: ₹"
                 << fixed << setprecision(2) << balance << RESET << "\n";
            return false;
        }
        balance -= amount;
        txnCounter++;
        history.emplace_back(txnCounter, "WITHDRAW", amount, balance);
        cout << YELLOW << "  ✓ Withdrawn ₹" << fixed << setprecision(2)
             << amount << ". Remaining balance: ₹" << balance << RESET << "\n";
        return true;
    }

    // Balance enquiry
    void enquireBalance() const {
        cout << CYAN << "  Account  : #" << accNo
             << "  (" << name << ")\n" << RESET
             << GREEN << "  Balance  : ₹" << fixed << setprecision(2)
             << balance << RESET << "\n";
    }

    // Show last 5 transactions
    void showLastTransactions(int n = 5) const {
        if (history.empty()) {
            cout << DIM << "  No transactions yet.\n" << RESET;
            return;
        }
        int start = max(0, (int)history.size() - n);
        cout << CYAN << "  Last " << n << " transactions for Acc #"
             << accNo << " (" << name << "):\n" << RESET;
        cout << DIM << "  " << string(70, '-') << RESET << "\n";
        for (int i = start; i < (int)history.size(); ++i)
            history[i].print();
        cout << DIM << "  " << string(70, '-') << RESET << "\n";
    }

    // ── File persistence helpers ──────────────────────────────

    // Serialise account header
    string serialiseHeader() const {
        ostringstream oss;
        oss << accNo << "|" << name << "|"
            << fixed << setprecision(2) << balance << "|" << txnCounter;
        return oss.str();
    }

    // Add a loaded transaction (used during file reload)
    void addTransaction(const Transaction& t) {
        history.push_back(t);
        txnCounter = max(txnCounter, t.getTxnNo());
    }

    const vector<Transaction>& getHistory() const { return history; }
};

// ─────────────────────────────────────────────────────────────
//  Class: BankSystem
// ─────────────────────────────────────────────────────────────
class BankSystem {
private:
    vector<Account> accounts;
    const string ACC_FILE = "accounts.dat";
    const string TXN_FILE = "transactions.dat";

    // Find account index by AccNo (-1 if not found)
    int findIndex(const string& accNo) const {
        for (int i = 0; i < (int)accounts.size(); ++i)
            if (accounts[i].getAccNo() == accNo) return i;
        return -1;
    }

    // Check if AccNo already exists
    bool exists(const string& accNo) const { return findIndex(accNo) != -1; }

    // ── File I/O ─────────────────────────────────────────────

    void saveAccounts() const {
        ofstream f(ACC_FILE);
        for (const auto& a : accounts)
            f << a.serialiseHeader() << "\n";
    }

    void saveTransactions() const {
        ofstream f(TXN_FILE);
        for (const auto& a : accounts) {
            for (const auto& t : a.getHistory())
                f << a.getAccNo() << "|" << t.serialise() << "\n";
        }
    }

    void save() const {
        saveAccounts();
        saveTransactions();
    }

    void load() {
        ifstream af(ACC_FILE);
        if (!af) return;

        string line;
        while (getline(af, line)) {
            if (line.empty()) continue;
            istringstream ss(line);
            string tok;
            vector<string> parts;
            while (getline(ss, tok, '|')) parts.push_back(tok);
            if (parts.size() < 4) continue;
            string no  = parts[0];
            string nm  = parts[1];
            double bal = stod(parts[2]);
            Account a(no, nm, bal);
            accounts.push_back(a);
        }

        ifstream tf(TXN_FILE);
        if (!tf) return;

        while (getline(tf, line)) {
            if (line.empty()) continue;
            istringstream ss(line);
            string tok;
            vector<string> parts;
            while (getline(ss, tok, '|')) parts.push_back(tok);
            if (parts.size() < 6) continue;
            string accNo  = parts[0];
            int    txnNo  = stoi(parts[1]);
            string type   = parts[2];
            double amt    = stod(parts[3]);
            double bal    = stod(parts[4]);
            string ts     = parts[5];
            int idx = findIndex(accNo);
            if (idx >= 0) {
                accounts[idx].addTransaction(
                    Transaction(txnNo, type, amt, bal, ts));
            }
        }
    }

public:
    BankSystem() { load(); }

    // ── Operations ───────────────────────────────────────────

    void createAccount() {
        string accNo;
        string name;
        double initDep = 0;

        cout << CYAN << "\n  ┌─ Create New Account ─────────────────┐\n" << RESET;
        cout << "  Enter 16-Digit Account Number : ";
        cin  >> accNo;
        if (accNo.length() != 16 || !all_of(accNo.begin(), accNo.end(), ::isdigit)) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cout << RED << "  ✗ Account number must be exactly 16 digits.\n" << RESET;
            return;
        }
        if (exists(accNo)) {
            cout << RED << "  ✗ Account #" << accNo << " already exists.\n" << RESET;
            return;
        }
        cin.ignore();
        cout << "  Enter Account Holder Name : ";
        getline(cin, name);
        if (name.empty()) { cout << RED << "  ✗ Name cannot be empty.\n" << RESET; return; }

        cout << "  Opening Deposit (0 for none) : ₹";
        cin  >> initDep;
        if (cin.fail() || initDep < 0) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            initDep = 0;
        }

        accounts.emplace_back(accNo, name, initDep);
        save();
        cout << GREEN << "  ✓ Account #" << accNo << " created for "
             << name << " with balance ₹"
             << fixed << setprecision(2) << initDep << RESET << "\n";
    }

    void depositMenu() {
        string accNo; double amount;
        cout << CYAN << "\n  ┌─ Deposit ────────────────────────────┐\n" << RESET;
        cout << "  Enter Account Number : "; cin >> accNo;
        int idx = findIndex(accNo);
        if (idx < 0) { cout << RED << "  ✗ Account not found.\n" << RESET; return; }
        cout << "  Enter Amount         : ₹"; cin >> amount;
        if (accounts[idx].deposit(amount)) save();
    }

    void withdrawMenu() {
        string accNo; double amount;
        cout << CYAN << "\n  ┌─ Withdraw ───────────────────────────┐\n" << RESET;
        cout << "  Enter Account Number : "; cin >> accNo;
        int idx = findIndex(accNo);
        if (idx < 0) { cout << RED << "  ✗ Account not found.\n" << RESET; return; }
        cout << "  Enter Amount         : ₹"; cin >> amount;
        if (accounts[idx].withdraw(amount)) save();
    }

    void balanceEnquiry() {
        string accNo;
        cout << CYAN << "\n  ┌─ Balance Enquiry ────────────────────┐\n" << RESET;
        cout << "  Enter Account Number : "; cin >> accNo;
        int idx = findIndex(accNo);
        if (idx < 0) { cout << RED << "  ✗ Account not found.\n" << RESET; return; }
        accounts[idx].enquireBalance();
    }

    void viewTransactions() {
        string accNo;
        cout << CYAN << "\n  ┌─ Transaction History ────────────────┐\n" << RESET;
        cout << "  Enter Account Number : "; cin >> accNo;
        int idx = findIndex(accNo);
        if (idx < 0) { cout << RED << "  ✗ Account not found.\n" << RESET; return; }
        accounts[idx].showLastTransactions(5);
    }

    void reportTotalMoney() const {
        double total = 0;
        for (const auto& a : accounts) total += a.getBalance();
        cout << MAGENTA << "\n  Total money held across all accounts: ₹"
             << fixed << setprecision(2) << total << RESET << "\n";
        cout << BLUE   << "  Number of accounts: " << accounts.size() << RESET << "\n";
    }

    void reportLowBalance(double threshold = 500.0) const {
        cout << YELLOW << "\n  Accounts with balance < ₹"
             << fixed << setprecision(2) << threshold << ":\n" << RESET;
        bool found = false;
        for (const auto& a : accounts) {
            if (a.getBalance() < threshold) {
                cout << RED << "  Acc #" << a.getAccNo()
                     << " (" << a.getName() << ") — ₹"
                     << fixed << setprecision(2) << a.getBalance()
                     << RESET << "\n";
                found = true;
            }
        }
        if (!found) cout << GREEN << "  ✓ No accounts below threshold.\n" << RESET;
    }

    void listAllAccounts() const {
        if (accounts.empty()) {
            cout << DIM << "  No accounts found.\n" << RESET;
            return;
        }
        cout << CYAN << "\n  All Accounts:\n" << RESET;
        cout << DIM << "  " << string(50, '-') << RESET << "\n";
        for (const auto& a : accounts) {
            cout << BLUE << "  #" << setw(16) << a.getAccNo() << RESET
                 << "  " << setw(20) << left << a.getName() << right
                 << GREEN << "  ₹" << fixed << setprecision(2)
                 << a.getBalance() << RESET << "\n";
        }
        cout << DIM << "  " << string(50, '-') << RESET << "\n";
    }
};

// ─────────────────────────────────────────────────────────────
//  Menu helpers
// ─────────────────────────────────────────────────────────────
void printBanner() {
    cout << CYAN << BOLD;
    cout << "\n  ╔══════════════════════════════════════════════╗\n";
    cout <<       "  ║   💰  Personal Savings Account System     ║\n";
    cout <<       "  ╚══════════════════════════════════════════════╝\n";
    cout << RESET;
}

void printMainMenu() {
    cout << CYAN << "\n  ┌─── MAIN MENU ───────────────────────────┐\n" << RESET;
    cout << GREEN  << "  │  1." << RESET << " Create New Account\n";
    cout << GREEN  << "  │  2." << RESET << " Deposit\n";
    cout << GREEN  << "  │  3." << RESET << " Withdraw\n";
    cout << GREEN  << "  │  4." << RESET << " Balance Enquiry\n";
    cout << GREEN  << "  │  5." << RESET << " View Last 5 Transactions\n";
    cout << YELLOW << "  │  6." << RESET << " Report – Total Money\n";
    cout << YELLOW << "  │  7." << RESET << " Report – Low Balance Accounts\n";
    cout << BLUE   << "  │  8." << RESET << " List All Accounts\n";
    cout << RED    << "  │  0." << RESET << " Exit\n";
    cout << CYAN   << "  └─────────────────────────────────────────┘\n" << RESET;
    cout << BOLD   << "  Choice: " << RESET;
}

// ─────────────────────────────────────────────────────────────
//  main()
// ─────────────────────────────────────────────────────────────
int main() {
    BankSystem bank;
    int choice;

    printBanner();
    cout << DIM << "  Data auto-loaded from file (if available).\n" << RESET;

    do {
        printMainMenu();
        cin >> choice;

        if (cin.fail()) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cout << RED << "  ✗ Please enter a valid number.\n" << RESET;
            continue;
        }

        switch (choice) {
            case 1: bank.createAccount();    break;
            case 2: bank.depositMenu();       break;
            case 3: bank.withdrawMenu();      break;
            case 4: bank.balanceEnquiry();    break;
            case 5: bank.viewTransactions();  break;
            case 6: bank.reportTotalMoney();  break;
            case 7: bank.reportLowBalance();  break;
            case 8: bank.listAllAccounts();   break;
            case 0: cout << CYAN << "\n  Goodbye! Data saved.\n" << RESET; break;
            default: cout << RED << "  ✗ Invalid option. Try again.\n" << RESET;
        }
    } while (choice != 0);

    return 0;
}
