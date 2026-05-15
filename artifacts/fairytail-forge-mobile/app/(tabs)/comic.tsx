import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useProjects } from "@/context/ProjectContext";
import { useColors } from "@/hooks/useColors";
import { apiUrl } from "@/lib/api";
import { Panel } from "@/types";

export default function ComicScreen() {
  const colors = useColors();
  const { currentProject, enqueuePanels, isGeneratingImages, queueLength } =
    useProjects();

  const allPanels = useMemo(() => {
    if (!currentProject) return [] as Panel[];
    return currentProject.pages.flatMap((p) => p.panels);
  }, [currentProject]);

  const pendingCount = allPanels.filter(
    (p) => p.status === "pending" || p.status === "failed",
  ).length;

  const queueAll = () => {
    const ids = allPanels
      .filter((p) => p.status === "pending" || p.status === "failed")
      .map((p) => p.id);
    if (ids.length > 0) enqueuePanels(ids);
  };

  if (!currentProject) {
    return (
      <View
        style={[
          styles.empty,
          { backgroundColor: colors.background },
        ]}
      >
        <Feather
          name="book-open"
          size={48}
          color={colors.mutedForeground}
          style={{ marginBottom: 16 }}
        />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          No comic loaded
        </Text>
        <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
          Pick a project from the Studio tab or forge a new one.
        </Text>
        <Pressable
          onPress={() => router.push("/forge")}
          style={({ pressed }) => [
            styles.ctaButton,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="zap" size={18} color="#fff" />
          <Text style={styles.ctaText}>New Story</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <View
          style={[styles.genrePill, { backgroundColor: colors.primary + "22" }]}
        >
          <Text style={[styles.genreText, { color: colors.primary }]}>
            {currentProject.genre.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {currentProject.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {allPanels.length} panels · {currentProject.pages.length} pages
        </Text>
      </View>

      {pendingCount > 0 && (
        <Pressable
          onPress={queueAll}
          disabled={isGeneratingImages}
          style={({ pressed }) => [
            styles.actionBar,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed || isGeneratingImages ? 0.7 : 1,
            },
          ]}
        >
          {isGeneratingImages ? (
            <>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.foreground }]}>
                Inking… {queueLength} left
              </Text>
            </>
          ) : (
            <>
              <Feather name="play-circle" size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.foreground }]}>
                Ink {pendingCount} {pendingCount === 1 ? "panel" : "panels"}
              </Text>
            </>
          )}
        </Pressable>
      )}

      {currentProject.pages.map((page) => (
        <View key={page.id} style={styles.pageBlock}>
          <Text
            style={[
              styles.pageLabel,
              { color: colors.mutedForeground },
            ]}
          >
            PAGE {page.pageNumber}
          </Text>
          {page.panels.map((panel) => (
            <PanelCard key={panel.id} panel={panel} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function PanelCard({ panel }: { panel: Panel }) {
  const colors = useColors();
  const { enqueuePanels, updatePanel } = useProjects();

  const generate = () => {
    updatePanel(panel.id, { status: "pending" });
    enqueuePanels([panel.id]);
  };

  const imageUri = panel.imagePath
    ? panel.imagePath.startsWith("http")
      ? panel.imagePath
      : apiUrl(panel.imagePath)
    : null;

  return (
    <View
      style={[
        styles.panelCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.panelImageWrap}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.panelImage}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.panelPlaceholder,
              { backgroundColor: colors.secondary },
            ]}
          >
            {panel.status === "generating" ? (
              <>
                <ActivityIndicator color={colors.primary} />
                <Text
                  style={[
                    styles.panelStatusText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Inking…
                </Text>
              </>
            ) : panel.status === "failed" ? (
              <>
                <Feather
                  name="alert-circle"
                  size={28}
                  color={colors.destructive}
                />
                <Text
                  style={[
                    styles.panelStatusText,
                    { color: colors.destructive },
                  ]}
                >
                  Failed
                </Text>
              </>
            ) : (
              <>
                <Feather
                  name="image"
                  size={28}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.panelStatusText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Awaiting ink
                </Text>
              </>
            )}
          </View>
        )}
        <View style={styles.panelNumberBadge}>
          <Text style={styles.panelNumberText}>#{panel.panelNumber}</Text>
        </View>
      </View>

      <View style={styles.panelBody}>
        {panel.narration ? (
          <View style={[styles.narrationBox, { borderColor: colors.border }]}>
            <Text style={[styles.narrationText, { color: colors.foreground }]}>
              {panel.narration}
            </Text>
          </View>
        ) : null}

        {panel.dialogue ? (
          <View style={styles.dialogueBox}>
            <Text style={styles.dialogueText}>{panel.dialogue}</Text>
          </View>
        ) : null}

        {panel.content && !panel.narration ? (
          <Text style={[styles.contentText, { color: colors.foreground }]}>
            {panel.content}
          </Text>
        ) : null}

        <Pressable
          onPress={generate}
          disabled={panel.status === "generating"}
          style={({ pressed }) => [
            styles.regenButton,
            {
              borderColor: colors.border,
              opacity:
                pressed || panel.status === "generating" ? 0.6 : 1,
            },
          ]}
        >
          <Feather name="refresh-cw" size={14} color={colors.mutedForeground} />
          <Text
            style={[styles.regenText, { color: colors.mutedForeground }]}
          >
            {panel.imagePath ? "Re-ink" : "Generate"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 120 },
  header: { marginBottom: 16 },
  genrePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  genreText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, fontFamily: "Inter_500Medium" },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 20,
  },
  actionText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  pageBlock: { marginBottom: 24 },
  pageLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 12,
  },
  panelCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
  },
  panelImageWrap: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
  },
  panelImage: { width: "100%", height: "100%" },
  panelPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  panelStatusText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  panelNumberBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(2, 6, 23, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  panelNumberText: {
    color: "#f8fafc",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  panelBody: { padding: 14, gap: 10 },
  narrationBox: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 4,
  },
  narrationText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 18,
  },
  dialogueBox: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 10,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  dialogueText: {
    color: "#020617",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  contentText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  regenButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
  },
  regenText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
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
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
