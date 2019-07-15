/*
 * Exercise: Pointers and Manual Memory Management
 *
 * Senior-level concepts: pointer arithmetic, heap vs stack,
 * malloc/free discipline, and common memory bugs.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char *name;
    int *grades;
    int count;
    int capacity;
} Student;

Student *student_new(const char *name, int initial_capacity) {
    Student *s = malloc(sizeof(Student));
    if (!s) return NULL;

    s->name = malloc(strlen(name) + 1);
    if (!s->name) {
        free(s);
        return NULL;
    }
    strcpy(s->name, name);

    s->grades = malloc(sizeof(int) * initial_capacity);
    if (!s->grades) {
        free(s->name);
        free(s);
        return NULL;
    }
    s->count = 0;
    s->capacity = initial_capacity;
    return s;
}

int student_add_grade(Student *s, int grade) {
    if (s->count >= s->capacity) {
        int new_cap = s->capacity * 2;
        int *grown = realloc(s->grades, sizeof(int) * new_cap);
        if (!grown) return -1;
        s->grades = grown;
        s->capacity = new_cap;
    }
    s->grades[s->count++] = grade;
    return 0;
}

double student_average(const Student *s) {
    if (s->count == 0) return 0.0;
    int sum = 0;
    for (int i = 0; i < s->count; i++) sum += s->grades[i];
    return (double)sum / s->count;
}

void student_free(Student *s) {
    if (!s) return;
    free(s->grades);  /* free inner allocations first */
    free(s->name);
    free(s);          /* then the struct itself */
}

int main(void) {
    /* Pointer to pointer: array of student pointers */
    Student *students[2];

    students[0] = student_new("Alice", 2);
    students[1] = student_new("Bob", 2);

    for (int i = 0; i < 5; i++) {
        if (student_add_grade(students[0], 80 + i) != 0) {
            fprintf(stderr, "allocation failure\n");
            return 1;
        }
    }
    student_add_grade(students[1], 70);
    student_add_grade(students[1], 90);

    for (int i = 0; i < 2; i++) {
        printf("%s average: %.1f\n",
               students[i]->name,
               student_average(students[i]));
    }

    /* Manual cleanup - prevents memory leaks */
    for (int i = 0; i < 2; i++) {
        student_free(students[i]);
    }

    return 0;
}
