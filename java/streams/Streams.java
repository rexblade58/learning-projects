// Exercise: Java Streams and Functional Programming
//
// Senior-level concepts: stream pipelines, collectors, grouping,
// and method references.

import java.util.*;
import java.util.stream.*;

public class Streams {
    record Employee(String name, String dept, double salary) {}

    public static void main(String[] args) {
        List<Employee> employees = List.of(
                new Employee("Alice", "Engineering", 95000),
                new Employee("Bob", "Engineering", 88000),
                new Employee("Carol", "Design", 75000),
                new Employee("Dave", "Marketing", 70000),
                new Employee("Eve", "Engineering", 120000),
                new Employee("Frank", "Design", 82000));

        // --- Filtering and mapping ---
        System.out.println("Engineers earning 90k+ (sorted):");
        employees.stream()
                .filter(e -> e.dept().equals("Engineering"))
                .filter(e -> e.salary() >= 90000)
                .sorted(Comparator.comparing(Employee::salary).reversed())
                .map(Employee::name)
                .forEach(name -> System.out.println("  " + name));

        // --- Grouping by department ---
        System.out.println("\nGrouped by department:");
        Map<String, List<Employee>> byDept = employees.stream()
                .collect(Collectors.groupingBy(Employee::dept));
        byDept.forEach((dept, list) ->
                System.out.println("  " + dept + ": " + list.size() + " employees"));

        // --- Aggregation: department averages ---
        System.out.println("\nAverage salary by department:");
        Map<String, Double> avgByDept = employees.stream()
                .collect(Collectors.groupingBy(Employee::dept,
                        Collectors.averagingDouble(Employee::salary)));
        avgByDept.forEach((dept, avg) ->
                System.out.printf("  %s: $%.0f%n", dept, avg));

        // --- Reduction ---
        double totalPayroll = employees.stream()
                .mapToDouble(Employee::salary)
                .sum();
        System.out.printf("\nTotal payroll: $%.0f%n", totalPayroll);

        // --- Parallel stream performance demo ---
        long sequential = IntStream.rangeClosed(1, 10_000_000).sum();
        long parallel = IntStream.rangeClosed(1, 10_000_000).parallel().sum();
        System.out.println("Sequential: " + sequential + " | Parallel: " + parallel);

        // --- Collectors.toMap with merge ---
        Map<String, Double> maxByDept = employees.stream()
                .collect(Collectors.toMap(
                        Employee::dept,
                        Employee::salary,
                        Math::max));
        System.out.println("\nMax salary per dept: " + maxByDept);
    }
}
