import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useProjects } from "@/context/ProjectContext";
import { useColors } from "@/hooks/useColors";
import { Project } from "@/types";

export default function StudioScreen() {
  const colors = useColors();
  const { projects, currentProject, setCurrentProject, deleteProject } =
    useProjects();

  const openForge = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    router.push("/forge");
  };

  const renderProject = ({ item }: { item: Project }) => {
    const isActive = currentProject?.id === item.id;
    const totalPanels = item.pages.reduce((s, p) => s + p.panels.length, 0);
    const completed = item.pages.reduce(
      (s, p) => s + p.panels.filter((pp) => pp.status === "completed").length,
      0,
    );

    return (
      <Pressable
        onPress={() => {
          setCurrentProject(item);
          if (Platform.OS !== "web") {
            Haptics.selectionAsync().catch(() => {});
          }
          router.push("/(tabs)/comic");
        }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: isActive ? colors.primary : colors.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.genrePill,
              { backgroundColor: colors.primary + "22" },
            ]}
          >
            <Text style={[styles.genreText, { color: colors.primary }]}>
              {item.genre.toUpperCase()}
            </Text>
          </View>
          <Pressable
            onPress={() => deleteProject(item.id)}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Feather name="trash-2" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Text
          style={[styles.cardTitle, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.metaRow}>
            <Feather name="layers" size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {item.pages.length} {item.pages.length === 1 ? "page" : "pages"}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Feather name="image" size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {completed}/{totalPanels}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={projects}
        keyExtractor={(p) => p.id}
        renderItem={renderProject}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.heroLabel, { color: colors.primary }]}>
              FAIRYTAIL FORGE
            </Text>
            <Text style={[styles.hero, { color: colors.foreground }]}>
              Your comic studio
            </Text>
            <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
              Forge AI-powered comics from a single prompt.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather
              name="book"
              size={48}
              color={colors.mutedForeground}
              style={{ marginBottom: 16 }}
            />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No comics yet
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Tap the wand to forge your first story.
            </Text>
          </View>
        }
        scrollEnabled={projects.length > 0}
      />

      <Pressable
        onPress={openForge}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.primary,
            transform: [{ scale: pressed ? 0.95 : 1 }],
            shadowColor: colors.primary,
          },
        ]}
      >
        <Feather name="zap" size={26} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 120 },
  header: { marginBottom: 24 },
  heroLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 8,
  },
  hero: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    lineHeight: 38,
    marginBottom: 6,
  },
  heroSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  genrePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  genreText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 14,
  },
  cardFooter: { flexDirection: "row", gap: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 110,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
