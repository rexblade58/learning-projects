// Exercise: RAII and Smart Pointers
//
// Senior-level concepts: RAII (Resource Acquisition Is Initialization),
// unique_ptr, shared_ptr, move semantics, and rule of five.

#include <iostream>
#include <memory>
#include <string>
#include <vector>

// A resource that must be cleaned up
class DatabaseConnection {
  public:
    DatabaseConnection(const std::string& host) : host_(host) {
        std::cout << "  [connect] " << host_ << std::endl;
    }
    ~DatabaseConnection() {
        std::cout << "  [disconnect] " << host_ << std::endl;
    }
    void query(const std::string& sql) const {
        std::cout << "  [query] " << sql << std::endl;
    }

  private:
    std::string host_;
};

// RAII wrapper: constructor acquires, destructor releases
class ConnectionPool {
  public:
    explicit ConnectionPool(int size) {
        for (int i = 0; i < size; ++i) {
            pool_.push_back(std::make_unique<DatabaseConnection>("db-" + std::to_string(i)));
        }
    }

    // Not copyable - connections are exclusive
    ConnectionPool(const ConnectionPool&) = delete;
    ConnectionPool& operator=(const ConnectionPool&) = delete;

    // Movable
    ConnectionPool(ConnectionPool&&) = default;
    ConnectionPool& operator=(ConnectionPool&&) = default;

    DatabaseConnection* acquire() { return pool_.empty() ? nullptr : pool_.front().get(); }

  private:
    std::vector<std::unique_ptr<DatabaseConnection>> pool_;
};

// Rule of Five example with manual resource ownership
class Buffer {
  public:
    explicit Buffer(size_t size) : size_(size), data_(new int[size]) {}

    // Destructor
    ~Buffer() { delete[] data_; }

    // Copy constructor (deep copy)
    Buffer(const Buffer& other) : size_(other.size_), data_(new int[other.size_]) {
        std::copy(other.data_, other.data_ + size_, data_);
        std::cout << "  [buffer] copy constructed" << std::endl;
    }

    // Copy assignment
    Buffer& operator=(const Buffer& other) {
        if (this != &other) {
            delete[] data_;
            size_ = other.size_;
            data_ = new int[size_];
            std::copy(other.data_, other.data_ + size_, data_);
        }
        return *this;
    }

    // Move constructor
    Buffer(Buffer&& other) noexcept : size_(other.size_), data_(other.data_) {
        other.data_ = nullptr;
        other.size_ = 0;
        std::cout << "  [buffer] moved" << std::endl;
    }

    // Move assignment
    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            delete[] data_;
            data_ = other.data_;
            size_ = other.size_;
            other.data_ = nullptr;
            other.size_ = 0;
        }
        return *this;
    }

    void fill(int value) {
        for (size_t i = 0; i < size_; ++i) data_[i] = value;
    }

    int at(size_t i) const { return data_[i]; }

  private:
    size_t size_;
    int* data_;
};

int main() {
    std::cout << "--- RAII: connections auto-close when scope ends ---" << std::endl;
    {
        auto conn = std::make_unique<DatabaseConnection>("primary");
        conn->query("SELECT * FROM users");
    }  // unique_ptr destroys the connection here

    std::cout << "\n--- shared_ptr: reference-counted ownership ---" << std::endl;
    {
        auto shared = std::make_shared<DatabaseConnection>("shared-db");
        auto second_ref = shared;  // refcount 2
        std::cout << "  refs: " << shared.use_count() << std::endl;
    }  // both owners gone -> disconnect

    std::cout << "\n--- Move semantics ---" << std::endl;
    Buffer b1(5);
    b1.fill(42);
    Buffer b2 = std::move(b1);  // move - no deep copy
    std::cout << "  b2[0] = " << b2.at(0) << std::endl;

    return 0;
}
