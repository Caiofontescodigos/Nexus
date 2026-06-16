import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { tasksApi } from "../services/api";

export default function TaskFormScreen({ navigation, route }: any) {
  const existingTask = route.params?.task;
  const [title, setTitle] = useState(existingTask?.title || "");
  const [description, setDescription] = useState(existingTask?.description || "");
  const [status, setStatus] = useState(existingTask?.status || "pending");
  const [priority, setPriority] = useState(existingTask?.priority || "medium");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      if (existingTask) {
        await tasksApi.update(existingTask.id, { title, description, status, priority });
      } else {
        await tasksApi.create({ title, description, priority });
      }
      navigation.goBack();
    } catch { }
    setLoading(false);
  };

  const statuses = ["pending", "in_progress", "completed"];
  const priorities = ["low", "medium", "high"];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{existingTask ? "Edit Task" : "New Task"}</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Task title" placeholderTextColor="#666" />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="Add details..." placeholderTextColor="#666" multiline numberOfLines={4} />

        <Text style={styles.label}>Status</Text>
        <View style={styles.optionsRow}>
          {statuses.map((s) => (
            <TouchableOpacity key={s} style={[styles.option, status === s && styles.optionActive]} onPress={() => setStatus(s)}>
              <Text style={[styles.optionText, status === s && styles.optionTextActive]}>{s.replace("_", " ")}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Priority</Text>
        <View style={styles.optionsRow}>
          {priorities.map((p) => (
            <TouchableOpacity key={p} style={[styles.option, priority === p && styles.optionActive]} onPress={() => setPriority(p)}>
              <Text style={[styles.optionText, priority === p && styles.optionTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{existingTask ? "Save changes" : "Create task"}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f13" },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "500", color: "#aaa", marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: "#1c1c24", borderRadius: 12, padding: 16, fontSize: 16, color: "#fff", borderWidth: 1, borderColor: "#2c2c36" },
  textarea: { minHeight: 100, textAlignVertical: "top" },
  optionsRow: { flexDirection: "row", gap: 8 },
  option: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#1c1c24", alignItems: "center", borderWidth: 1, borderColor: "#2c2c36" },
  optionActive: { borderColor: "#7c3aed", backgroundColor: "#7c3aed20" },
  optionText: { color: "#888", fontSize: 13, fontWeight: "500", textTransform: "capitalize" },
  optionTextActive: { color: "#a78bfa" },
  button: { backgroundColor: "#7c3aed", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 32 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
