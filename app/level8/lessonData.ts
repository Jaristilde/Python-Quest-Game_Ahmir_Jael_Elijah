export interface LessonData {
    id: number;
    title: string;
    subtitle: string;
    emoji: string;
    concept: string;
    xpReward: number;
    successMessage: string;
    description: string;
    lessonType: 'learn' | 'practice' | 'project' | 'quiz';
    hasSupercharge?: boolean;
}

export const LEVEL8_LESSONS: LessonData[] = [
    {
        id: 1,
        title: "Meet the Class",
        subtitle: "Your First Blueprint",
        emoji: "🏗️",
        concept: "class Pet:",
        xpReward: 10,
        successMessage: "You created your first class blueprint!",
        description: "Learn what classes are - blueprints for creating objects!",
        lessonType: 'learn'
    },
    {
        id: 2,
        title: "Birth of a Pet",
        subtitle: "Creating Objects",
        emoji: "🐣",
        concept: "my_pet = Pet()",
        xpReward: 10,
        successMessage: "You brought a pet to life!",
        description: "Create objects (instances) from your class blueprint.",
        lessonType: 'learn'
    },
    {
        id: 3,
        title: "The Magic __init__",
        subtitle: "Constructor Method",
        emoji: "✨",
        concept: "def __init__(self):",
        xpReward: 12,
        successMessage: "You mastered the initialization spell!",
        description: "Learn how __init__ sets up your object when it's created.",
        lessonType: 'learn'
    },
    {
        id: 4,
        title: "Pet Personality",
        subtitle: "Instance Attributes",
        emoji: "🎭",
        concept: "self.name = name",
        xpReward: 12,
        successMessage: "Your pets now have unique personalities!",
        description: "Give each pet its own name, age, and traits with attributes.",
        lessonType: 'learn'
    },
    {
        id: 5,
        title: "Teach Your Pet Tricks",
        subtitle: "Methods",
        emoji: "🎪",
        concept: "def speak(self):",
        xpReward: 12,
        successMessage: "Your pet learned new tricks!",
        description: "Add methods - actions your pet can perform!",
        lessonType: 'learn'
    },
    {
        id: 6,
        title: "Pet Training Camp",
        subtitle: "Practice + Supercharge",
        emoji: "🏕️",
        concept: "Classes & Methods Practice",
        xpReward: 15,
        successMessage: "Training complete! Your skills are growing!",
        description: "Practice creating classes, attributes, and methods.",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 7,
        title: "Pet Simulator Part 1",
        subtitle: "Build Your Pet!",
        emoji: "🐕",
        concept: "Virtual Pet Class",
        xpReward: 20,
        successMessage: "Your virtual pet is alive!",
        description: "Create a Pet class with hunger, happiness, and energy!",
        lessonType: 'project'
    },
    {
        id: 8,
        title: "Shared Secrets",
        subtitle: "Class Attributes",
        emoji: "🤝",
        concept: "species = 'Unknown'",
        xpReward: 12,
        successMessage: "You learned about shared class data!",
        description: "Learn the difference between class and instance attributes.",
        lessonType: 'learn'
    },
    {
        id: 9,
        title: "Pet Family Tree",
        subtitle: "Inheritance",
        emoji: "🌳",
        concept: "class Dog(Pet):",
        xpReward: 15,
        successMessage: "You created a family of pet classes!",
        description: "Create child classes that inherit from parent classes.",
        lessonType: 'learn'
    },
    {
        id: 10,
        title: "Advanced Pet Academy",
        subtitle: "Practice + Supercharge",
        emoji: "🎓",
        concept: "Inheritance Practice",
        xpReward: 15,
        successMessage: "You're becoming a class master!",
        description: "Practice inheritance and method overriding.",
        lessonType: 'practice',
        hasSupercharge: true
    },
    {
        id: 11,
        title: "Pet Simulator Part 2",
        subtitle: "Complete Your Simulator!",
        emoji: "🐾",
        concept: "Full Pet System",
        xpReward: 25,
        successMessage: "Your Pet Simulator is complete!",
        description: "Add Dog, Cat, and Bird classes with unique behaviors!",
        lessonType: 'project'
    },
    {
        id: 12,
        title: "Class Master Quiz",
        subtitle: "Final Challenge",
        emoji: "🏆",
        concept: "OOP Mastery Test",
        xpReward: 20,
        successMessage: "You are now a Class Master!",
        description: "Prove your Object-Oriented Programming knowledge!",
        lessonType: 'quiz'
    }
];
