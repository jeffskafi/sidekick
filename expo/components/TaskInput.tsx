import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createTask } from "../app/services/taskService";
import { NewTask } from "../app/db/schema";

interface TaskInputProps {
  onTaskAdded: () => Promise<void>;
}

export default function TaskInput({ onTaskAdded }: TaskInputProps) {
  const [description, setDescription] = useState("");

  const handleAddTask = async () => {
    if (description.trim()) {
      const newTask: NewTask = {
        userId: "user1", // Replace with actual user ID
        description: description.trim(),
        completed: false,
        status: "todo",
        priority: "none",
        dueDate: null,
        parentId: null, // Add this line to match the NewTask type
      };

      try {
        await createTask(newTask);
        setDescription("");
        onTaskAdded();
      } catch (error) {
        console.error("Failed to add task:", error);
      }
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Add a new task..."
        placeholderTextColor="#666"
        value={description}
        onChangeText={setDescription}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
        <Ionicons name="add" size={24} color="#121212" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#333",
    borderRadius: 25,
    paddingLeft: 20,
    height: 50,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginRight: 50,
  },
  addButton: {
    position: "absolute",
    right: 2,
    width: 46,
    height: 46,
    borderRadius: 30,
    backgroundColor: "#f4511e",
    justifyContent: "center",
    alignItems: "center",
  },
});