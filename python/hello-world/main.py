name = input("What is your name? ")
age = int(input("How old are you? "))

print(f"Hello, {name}!")
print(f"In 5 years, you will be {age + 5} years old.")

if age >= 18:
    print("You are an adult.")
else:
    print("You are still a minor.")
