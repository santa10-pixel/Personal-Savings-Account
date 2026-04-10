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

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

using namespace std;

// ─────────────────────────────────────────────────────────────
// Custom Output Flusher (Bypasses Emscripten \n buffering)
// ─────────────────────────────────────────────────────────────
class WebOut {
    std::ostringstream oss;
public:
    template<typename T>
    WebOut& operator<<(const T& val) {
        oss << val;
        return *this;
    }
    // Handle manipulators like std::endl
    WebOut& operator<<(std::ostream& (*manip)(std::ostream&)) {
        if (manip == static_cast<std::ostream& (*)(std::ostream&)>(std::endl)) {
            oss << "\n";
        } else {
            manip(oss);
        }
        return *this;
    }
    ~WebOut() {
        std::string s = oss.str();
        if(s.empty()) return;
#ifdef __EMSCRIPTEN__
        EM_ASM({
            if (typeof window.cprint !== 'undefined') {
                window.cprint(UTF8ToString($0));
            } else {
                console.log(UTF8ToString($0));
            }
        }, s.c_str());
#else
        std::cout << s;
        std::cout.flush();
#endif
    }
};

// Intercept all cout calls
#define cout WebOut()

// ─────────────────────────────────────────────────────────────
//  ANSI colour helpers (terminal only; stripped for WASM build if needed, 
//  but our HTML shell PARSES ansi! So we KEEP them for WASM too!)
// ─────────────────────────────────────────────────────────────
const string RESET  = "\033[0m";
const string BOLD   = "\033[1m";
const string CYAN   = "\033[96m";
const string GREEN  = "\033[92m";
const string YELLOW = "\033[93m";
const string RED    = "\033[91m";
const string BLUE   = "\033[94m";
const string MAGENTA= "\033[95m";
const string DIM    = "\033[2m";

// ─────────────────────────────────────────────────────────────
// Futuristic ASYNC Input System (Replaces cin)
// ─────────────────────────────────────────────────────────────
string getWebInput() {
#ifdef __EMSCRIPTEN__
    while (true) {
        int hasInput = EM_ASM_INT({
            return (window.inputBuffer && window.inputBuffer.length > 0) ? 1 : 0;
        });
        if (hasInput == 1) {
            char* buf = (char*)EM_ASM_INT({
                var str = window.inputBuffer.shift();
                var len = lengthBytesUTF8(str) + 1;
                var ptr = _malloc(len);
                stringToUTF8(str, ptr, len);
                return ptr;
            });
            string res(buf);
            free(buf);
            return res;
        }
        emscripten_sleep(50); // Yield to JS Event Loop
    }
    return "";
#else
    string s;
    getline(std::cin, s);
    return s;
#endif
}

void getStringInput(string& out) {
    out = getWebInput();
    if(out.find_first_not_of(" \t\n\r\f\v") != string::npos) {
        out.erase(0, out.find_first_not_of(" \t\n\r\f\v"));
        out.erase(out.find_last_not_of(" \t\n\r\f\v") + 1);
    }
}

void getIntInput(int& out) {
    while (true) {
        string s = getWebInput();
        if(s.find_first_not_of(" \t\n\r\f\v") != string::npos) {
            s.erase(0, s.find_first_not_of(" \t\n\r\f\v"));
            s.erase(s.find_last_not_of(" \t\n\r\f\v") + 1);
        }
        if (s.empty()) { cout << RED << "  ✗ Please enter a valid number: " << RESET; continue; }
        bool valid = true;
        for (size_t i = 0; i < s.length(); ++i) {
            if (i == 0 && (s[i] == '-' || s[i] == '+')) continue;
            if (!isdigit(s[i])) { valid = false; break; }
        }
        if (valid) { out = atoi(s.c_str()); break; }
        cout << RED << "  ✗ Invalid number. Please try again: " << RESET;
    }
}

void getDoubleInput(double& out) {
    while (true) {
        string s = getWebInput();
        if(s.find_first_not_of(" \t\n\r\f\v") != string::npos) {
            s.erase(0, s.find_first_not_of(" \t\n\r\f\v"));
            s.erase(s.find_last_not_of(" \t\n\r\f\v") + 1);
        }
        if (s.empty()) { cout << RED << "  ✗ Please enter a valid amount: " << RESET; continue; }
        
        char* endptr = nullptr;
        out = strtod(s.c_str(), &endptr);
        if (endptr == s.c_str() || (*endptr != '\0' && !isspace((unsigned char)*endptr))) { 
            cout << RED << "  ✗ Invalid amount. Please try again: " << RESET;
        } else {
            break;
        }
    }
}

void pauseForUser() {
    cout << "\n  " << DIM << "[ Press Enter to return to Menu ]" << RESET;
    string dummy;
    getStringInput(dummy);
}


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
    Transaction(int no, const string& t, double amt, double bal)
        : txnNo(no), type(t), amount(amt), balAfter(bal),
          timestamp(currentTimestamp()) {}

    Transaction(int no, const string& t, double amt, double bal,
                const string& ts)
        : txnNo(no), type(t), amount(amt), balAfter(bal), timestamp(ts) {}

    int    getTxnNo()    const { return txnNo; }
    string getType()     const { return type; }
    double getAmount()   const { return amount; }
    double getBalAfter() const { return balAfter; }
    string getTimestamp()const { return timestamp; }

    string serialise() const {
        ostringstream oss;
        oss << txnNo << "|" << type << "|"
            << fixed << setprecision(2) << amount << "|"
            << balAfter << "|" << timestamp;
        return oss.str();
    }

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
    string pin;
    string name;
    double balance;
    vector<Transaction> history;
    int    txnCounter;

public:
    Account(const string& no, const string& p, const string& n, double initBalance = 0.0)
        : accNo(no), pin(p), name(n), balance(initBalance), txnCounter(0) {}

    bool verifyPin(const string& p) const { return pin == p; }

    string getAccNo()  const { return accNo; }
    string getName()   const { return name; }
    double getBalance()const { return balance; }

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

    void enquireBalance() const {
        cout << CYAN << "  Account  : #" << accNo
             << "  (" << name << ")\n" << RESET
             << GREEN << "  Balance  : ₹" << fixed << setprecision(2)
             << balance << RESET << "\n";
    }

    void showLastTransactions(int n = 5) const {
        if (history.empty()) {
            cout << DIM << "  No transactions yet.\n" << RESET;
            return;
        }
        int start = max(0, (int)history.size() - n);
        cout << "\n  " << CYAN << "Last " << n << " transactions for Acc #"
             << accNo << " (" << name << "):\n" << RESET;
        cout << DIM << "  " << string(70, '-') << RESET << "\n";
        for (int i = start; i < (int)history.size(); ++i)
            history[i].print();
        cout << DIM << "  " << string(70, '-') << RESET << "\n";
    }

    string serialiseHeader() const {
        ostringstream oss;
        oss << accNo << "|" << pin << "|" << name << "|"
            << fixed << setprecision(2) << balance << "|" << txnCounter;
        return oss.str();
    }

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

    int findIndex(const string& accNo) const {
        for (int i = 0; i < (int)accounts.size(); ++i)
            if (accounts[i].getAccNo() == accNo) return i;
        return -1;
    }

    bool exists(const string& accNo) const { return findIndex(accNo) != -1; }

    void saveAccounts() const {
        ofstream f(ACC_FILE);
        for (const auto& a : accounts) f << a.serialiseHeader() << "\n";
    }

    void saveTransactions() const {
        ofstream f(TXN_FILE);
        for (const auto& a : accounts) {
            for (const auto& t : a.getHistory())
                f << a.getAccNo() << "|" << t.serialise() << "\n";
        }
    }

    void save() const { saveAccounts(); saveTransactions(); }

    void load() {
        ifstream af(ACC_FILE);
        if (!af) return;
        string line;
        while (getline(af, line)) {
            if (line.empty()) continue;
            istringstream ss(line);
            string tok; vector<string> parts;
            while (getline(ss, tok, '|')) parts.push_back(tok);
            if (parts.size() < 5) continue;
            Account a(parts[0], parts[1], parts[2], atof(parts[3].c_str()));
            accounts.push_back(a);
        }

        ifstream tf(TXN_FILE);
        if (!tf) return;
        while (getline(tf, line)) {
            if (line.empty()) continue;
            istringstream ss(line);
            string tok; vector<string> parts;
            while (getline(ss, tok, '|')) parts.push_back(tok);
            if (parts.size() < 6) continue;
            int idx = findIndex(parts[0]);
            if (idx >= 0) {
                accounts[idx].addTransaction( Transaction(atoi(parts[1].c_str()), parts[2], atof(parts[3].c_str()), atof(parts[4].c_str()), parts[5]) );
            }
        }
    }

public:
    BankSystem() { load(); }

    void createAccount() {
        string accNo, pin1, pin2, name;
        double initDep = 0;

        cout << CYAN << "\n  ┌─ Create New Account ─────────────────┐\n" << RESET;
        cout << "  Enter 16-Digit Account Number : ";
        getStringInput(accNo);
        if (accNo.length() != 16 || !all_of(accNo.begin(), accNo.end(), ::isdigit)) {
            cout << RED << "  ✗ Account number must be exactly 16 digits.\n" << RESET;
            return;
        }
        if (exists(accNo)) { cout << RED << "  ✗ Account #" << accNo << " already exists.\n" << RESET; return; }
        
        cout << "  Enter 4-Digit Secret PIN      : "; getStringInput(pin1);
        if (pin1.length() != 4 || !all_of(pin1.begin(), pin1.end(), ::isdigit)) {
            cout << RED << "  ✗ PIN must be exactly 4 digits.\n" << RESET; return;
        }
        cout << "  Confirm 4-Digit Secret PIN    : "; getStringInput(pin2);
        if (pin1 != pin2) { cout << RED << "  ✗ PINs do not match!\n" << RESET; return; }

        cout << "  Enter Account Holder Name     : ";
        getStringInput(name);
        if (name.empty()) { cout << RED << "  ✗ Name cannot be empty.\n" << RESET; return; }

        cout << "  Opening Deposit (0 for none)  : ₹";
        getDoubleInput(initDep);

        accounts.emplace_back(accNo, pin1, name, initDep);
        save();
        cout << GREEN << "  ✓ Account #" << accNo << " created for "
             << name << " with balance ₹"
             << fixed << setprecision(2) << initDep << RESET << "\n";
    }

    bool authenticateAccount(int idx) const {
        string enteredPin;
        cout << "  Enter Secret PIN     : "; getStringInput(enteredPin);
        if (accounts[idx].verifyPin(enteredPin)) return true;
        cout << RED << "  ✗ Incorrect PIN. Access denied.\n" << RESET;
        return false;
    }

    void depositMenu() {
        string accNo; double amount;
        cout << CYAN << "\n  ┌─ Deposit ────────────────────────────┐\n" << RESET;
        cout << "  Enter Account Number : "; getStringInput(accNo);
        int idx = findIndex(accNo);
        if (idx < 0) { cout << RED << "  ✗ Account not found.\n" << RESET; return; }
        if (!authenticateAccount(idx)) return;
        
        cout << "  Enter Amount         : ₹"; getDoubleInput(amount);
        if (accounts[idx].deposit(amount)) save();
    }

    void withdrawMenu() {
        string accNo; double amount;
        cout << CYAN << "\n  ┌─ Withdraw ───────────────────────────┐\n" << RESET;
        cout << "  Enter Account Number : "; getStringInput(accNo);
        int idx = findIndex(accNo);
        if (idx < 0) { cout << RED << "  ✗ Account not found.\n" << RESET; return; }
        if (!authenticateAccount(idx)) return;
        
        cout << "  Enter Amount         : ₹"; getDoubleInput(amount);
        if (accounts[idx].withdraw(amount)) save();
    }

    void balanceEnquiry() {
        string accNo;
        cout << CYAN << "\n  ┌─ Balance Enquiry ────────────────────┐\n" << RESET;
        cout << "  Enter Account Number : "; getStringInput(accNo);
        int idx = findIndex(accNo);
        if (idx < 0) { cout << RED << "  ✗ Account not found.\n" << RESET; return; }
        if (!authenticateAccount(idx)) return;
        
        cout << "\n";
        accounts[idx].enquireBalance();
    }

    void viewTransactions() {
        string accNo;
        cout << CYAN << "\n  ┌─ Transaction History ────────────────┐\n" << RESET;
        cout << "  Enter Account Number : "; getStringInput(accNo);
        int idx = findIndex(accNo);
        if (idx < 0) { cout << RED << "  ✗ Account not found.\n" << RESET; return; }
        if (!authenticateAccount(idx)) return;
        
        accounts[idx].showLastTransactions(5);
    }

    void reportTotalMoney() const {
        double total = 0;
        for (const auto& a : accounts) total += a.getBalance();
        cout << MAGENTA << "\n  ┌─ System Audit ───────────────────────┐\n" << RESET;
        cout << MAGENTA << "  │ " << RESET << "Total money across all accounts: " << GREEN << "₹"
             << fixed << setprecision(2) << total << RESET << "\n";
        cout << MAGENTA << "  │ " << RESET << "Account Count: " << BLUE << accounts.size() << RESET << "\n";
    }

    void reportLowBalance(double threshold = 500.0) const {
        cout << YELLOW << "\n  ┌─ Risk Analysis: Low Balance ( < ₹" 
             << fixed << setprecision(2) << threshold << " ) \n" << RESET;
        bool found = false;
        for (const auto& a : accounts) {
            if (a.getBalance() < threshold) {
                cout << RED << "  │ Acc #" << a.getAccNo()
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
        cout << CYAN << "\n  ┌─ Master Registry ────────────────────┐\n" << RESET;
        for (const auto& a : accounts) {
            cout << BLUE << "  │ #" << setw(16) << a.getAccNo() << RESET
                 << "  " << setw(18) << left << a.getName() << right
                 << GREEN << "  ₹" << fixed << setprecision(2)
                 << a.getBalance() << RESET << "\n";
        }
    }
};

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

int main() {
    BankSystem bank;
    int choice;

    printBanner();
    cout << DIM << "  Secure Data Core dynamically verifying...\n" << RESET;

    do {
        printMainMenu();
        getIntInput(choice);

        switch (choice) {
            case 1: bank.createAccount();    pauseForUser(); break;
            case 2: bank.depositMenu();       pauseForUser(); break;
            case 3: bank.withdrawMenu();      pauseForUser(); break;
            case 4: bank.balanceEnquiry();    pauseForUser(); break;
            case 5: bank.viewTransactions();  pauseForUser(); break;
            case 6: bank.reportTotalMoney();  pauseForUser(); break;
            case 7: bank.reportLowBalance();  pauseForUser(); break;
            case 8: bank.listAllAccounts();   pauseForUser(); break;
            case 0: cout << CYAN << "\n  Goodbye! Secure channel closed.\n" << RESET; break;
            default: cout << RED << "  ✗ Invalid option. Try again.\n" << RESET; pauseForUser();
        }
    } while (choice != 0);

    return 0;
}
