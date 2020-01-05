// Exercise: Templates and Metaprogramming
//
// Senior-level concepts: variadic templates, SFINAE, constexpr,
// and compile-time computation.

#include <iostream>
#include <string>
#include <type_traits>

// --- Variadic templates: type-safe printf-like logging ---
template <typename... Args>
void log(const std::string& msg, Args... args) {
    std::cout << "[log] " << msg << " | ";
    (std::cout << ... << args) << std::endl;  // fold expression (C++17)
}

// --- Compile-time factorial via constexpr ---
constexpr long long factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

// --- Template specialization with SFINAE ---
template <typename T>
struct Stringify {
    static std::string convert(const T& v) {
        return std::to_string(v);
    }
};

template <>
struct Stringify<bool> {
    static std::string convert(const bool& v) {
        return v ? "true" : "false";
    }
};

// --- Constexpr type traits: enable_if for numeric types ---
template <typename T>
typename std::enable_if<std::is_arithmetic<T>::value, T>::type
half(T value) {
    return value / 2;
}

// --- Generic container wrapper ---
template <typename T, typename Container = std::vector<T>>
class Stack {
  public:
    void push(const T& v) { data_.push_back(v); }
    T pop() {
        T v = data_.back();
        data_.pop_back();
        return v;
    }
    bool empty() const { return data_.empty(); }
    size_t size() const { return data_.size(); }

  private:
    Container data_;
};

int main() {
    log("int", 1, 2, 3);
    log("mixed", 42, " hello ", 3.14);

    // Compile-time constant - no runtime cost
    constexpr auto fact_10 = factorial(10);
    static_assert(fact_10 == 3628800, "compile-time verification");
    std::cout << "factorial(10) = " << fact_10 << std::endl;

    std::cout << "stringify(5): " << Stringify<int>::convert(5) << std::endl;
    std::cout << "stringify(true): " << Stringify<bool>::convert(true) << std::endl;

    std::cout << "half(10): " << half(10) << std::endl;
    std::cout << "half(7.5): " << half(7.5) << std::endl;

    Stack<std::string> stack;
    stack.push("first");
    stack.push("second");
    while (!stack.empty()) {
        std::cout << "pop: " << stack.pop() << std::endl;
    }

    return 0;
}
