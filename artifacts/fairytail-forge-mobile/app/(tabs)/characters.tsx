import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useProjects } from "@/context/ProjectContext";
import { useColors } from "@/hooks/useColors";
import { Character } from "@/types";

export default function CharactersScreen() {
  const colors = useColors();
  const { currentProject } = useProjects();

  if (!currentProject) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Feather
          name="users"
          size={48}
          color={colors.mutedForeground}
          style={{ marginBottom: 16 }}
        />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          No project selected
        </Text>
        <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
          Open a comic to see its cast.
        </Text>
      </View>
    );
  }

  const characters = currentProject.characters;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={[styles.heroLabel, { color: colors.primary }]}>
        CAST OF
      </Text>
      <Text style={[styles.title, { color: colors.foreground }]}>
        {currentProject.title}
      </Text>

      {characters.length === 0 ? (
        <View style={styles.emptyInline}>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            No characters in this story.
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: 20 }}>
          {characters.map((c) => (
            <CharacterCard key={c.id} character={c} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function CharacterCard({ character }: { character: Character }) {
  const colors = useColors();
  const initials = character.name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.cardHead}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.primary + "22", borderColor: colors.primary },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {initials || "?"}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>
          {character.name}
        </Text>
      </View>

      {character.description ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            BIO
          </Text>
          <Text style={[styles.bodyText, { color: colors.foreground }]}>
            {character.description}
          </Text>
        </View>
      ) : null}

      {character.appearance ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            APPEARANCE
          </Text>
          <Text style={[styles.bodyText, { color: colors.foreground }]}>
            {character.appearance}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 120 },
  heroLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  name: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  section: { marginTop: 8 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyInline: { paddingVertical: 40, alignItems: "center" },
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
});
