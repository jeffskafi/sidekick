import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Task } from "../app/db/schema";
import { updateTask } from "../app/services/taskService";

interface TaskItemProps {
  item: Task;
  onTaskUpdated: () => Promise<void>;
}

export default function TaskItem({ item, onTaskUpdated }: TaskItemProps) {
  const handleToggleComplete = async () => {
    try {
      await updateTask(item.id, { completed: !item.completed });
      onTaskUpdated();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  return (
    <View style={styles.taskItem}>
      <TouchableOpacity style={styles.checkbox} onPress={handleToggleComplete}>
        {item.completed && <Ionicons name="checkmark" size={20} color="#f4511e" />}
      </TouchableOpacity>
      <Text style={[styles.taskTitle, item.completed && styles.completedTask]}>
        {item.description}
      </Text>
      <TouchableOpacity>
        <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f4511e",
    marginRight: 10,
  },
  taskTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
});