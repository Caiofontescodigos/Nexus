import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { tasksApi } from "../services/api";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function TasksScreen({ navigation }: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await tasksApi.list();
      setTasks(data);
    } catch { }
    setLoading(false);
  };

  const handleToggle = async (id: string) => {
    try {
      await tasksApi.toggleComplete(id);
      loadTasks();
    } catch { }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await tasksApi.delete(id); loadTasks(); } },
    ]);
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "#22c55e";
      case "in_progress": return "#7c3aed";
      default: return "#eab308";
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Tasks</Text>
        <Text style={styles.count}>{tasks.length} total</Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <TouchableOpacity onPress={() => handleToggle(item.id)} style={[styles.checkbox, item.status === "completed" && styles.checkboxChecked]}>
                {item.status === "completed" && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, item.status === "completed" && styles.completed]}>{item.title}</Text>
                <Text style={styles.taskDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.taskMeta}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + "20", borderColor: statusColor(item.status) }]}>
                    <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status.replace("_", " ")}</Text>
                  </View>
                  <Text style={styles.priority}>{item.priority}</Text>
                </View>
              </View>
            </View>
            <View style={styles.taskActions}>
              <TouchableOpacity onPress={() => navigation.navigate("TaskForm", { task: item })} style={styles.actionBtn}>
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.actionBtn, styles.deleteBtn]}>
                <Text style={[styles.actionText, { color: "#ef4444" }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("TaskForm", {})}>
        <Text style={styles.fabText}>+ New Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f13", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 50, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: "#fff" },
  count: { fontSize: 14, color: "#888" },
  list: { paddingBottom: 100 },
  taskCard: { backgroundColor: "#1c1c24", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#2c2c36" },
  taskHeader: { flexDirection: "row", gap: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: "#555", alignItems: "center", justifyContent: "center", marginTop: 2 },
  checkboxChecked: { backgroundColor: "#22c55e", borderColor: "#22c55e" },
  checkmark: { color: "#fff", fontSize: 14, fontWeight: "700" },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: "600", color: "#fff" },
  completed: { textDecorationLine: "line-through", color: "#666" },
  taskDesc: { fontSize: 13, color: "#888", marginTop: 4 },
  taskMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  priority: { fontSize: 12, color: "#666", textTransform: "capitalize" },
  taskActions: { flexDirection: "row", gap: 8, marginTop: 12, borderTopWidth: 1, borderTopColor: "#2c2c36", paddingTop: 12 },
  actionBtn: { padding: 8 },
  actionText: { color: "#a78bfa", fontSize: 14, fontWeight: "500" },
  deleteBtn: { marginLeft: "auto" },
  fab: { backgroundColor: "#7c3aed", borderRadius: 16, padding: 18, alignItems: "center", position: "absolute", bottom: 30, left: 20, right: 20 },
  fabText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
