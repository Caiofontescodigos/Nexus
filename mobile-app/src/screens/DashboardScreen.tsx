import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { tasksApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, rate: 0 });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        try {
          const s = await tasksApi.stats();
          setStats(s);
        } catch { }
        setLoading(false);
      })();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: logout },
    ]);
  };

  const cards = [
    { label: "Total Tasks", value: stats.total, color: "#7c3aed" },
    { label: "Completed", value: stats.completed, color: "#22c55e" },
    { label: "Pending", value: stats.pending, color: "#eab308" },
    { label: "Rate", value: `${stats.rate}%`, color: "#7c3aed" },
  ];

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
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(" ")[0]}</Text>
          <Text style={styles.subtitle}>Your productivity overview</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {cards.map((card, i) => (
          <View key={i} style={[styles.card, { borderLeftColor: card.color }]}>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("Tasks")}>
        <Text style={styles.fabText}>View Tasks</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f13", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 50, marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: "700", color: "#fff" },
  subtitle: { fontSize: 14, color: "#888", marginTop: 4 },
  logoutBtn: { padding: 8 },
  logoutText: { color: "#ef4444", fontSize: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { backgroundColor: "#1c1c24", borderRadius: 16, padding: 20, width: "47%", borderLeftWidth: 4 },
  cardValue: { fontSize: 32, fontWeight: "700", color: "#fff" },
  cardLabel: { fontSize: 13, color: "#888", marginTop: 4 },
  fab: { backgroundColor: "#7c3aed", borderRadius: 16, padding: 18, alignItems: "center", marginTop: "auto", marginBottom: 20 },
  fabText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
