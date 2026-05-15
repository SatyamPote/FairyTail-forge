import { Feather } from "@expo/vector-icons";
import { fetch as expoFetch } from "expo/fetch";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useProjects } from "@/context/ProjectContext";
import { useColors } from "@/hooks/useColors";
import { apiUrl, uid } from "@/lib/api";
import { Genre } from "@/types";

const GENRES: { id: Genre; label: string }[] = [
  { id: "sci-fi", label: "Sci-Fi" },
  { id: "cyberpunk", label: "Cyberpunk" },
  { id: "fantasy", label: "Fantasy" },
  { id: "comedy", label: "Comedy" },
  { id: "horror", label: "Horror" },
  { id: "slice of life", label: "Slice" },
];

const PANEL_OPTIONS = [4, 6, 8];

export default function ForgeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addProject, enqueuePanels } = useProjects();

  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState<Genre>("sci-fi");
  const [panels, setPanels] = useState(4);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("phi3:latest");
  const [loadingModels, setLoadingModels] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [liveLog, setLiveLog] = useState("");

  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const res = await fetch(apiUrl("/api/models"));
      const data = (await res.json()) as { models?: { name: string }[] };
      const names = (data.models || []).map((m) => m.name);
      setModels(names);
      if (names.length > 0 && !names.includes(selectedModel)) {
        setSelectedModel(names[0]);
      }
    } catch {
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
    setGenerating(true);
    setLiveLog("");

    let fullResponse = "";
    try {
      const res = await expoFetch(apiUrl("/api/story"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre,
          numPanels: panels,
          prompt,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const errBody = (await res
          .json()
          .catch(() => ({}))) as { error?: string };
        throw new Error(errBody.error || `Server error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader available");
      const decoder = new TextDecoder();
      let buffer = "";

      const processLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        try {
          const json = JSON.parse(trimmed) as { response?: string };
          if (json.response) {
            fullResponse += json.response;
            setLiveLog((prev) => prev + json.response);
          }
        } catch {
          // partial JSON, skip
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          if (buffer.length > 0) {
            for (const line of buffer.split("\n")) processLine(line);
            buffer = "";
          }
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) processLine(line);
      }

      const story = JSON.parse(fullResponse) as {
        title?: string;
        characters?: { name: string; description: string; appearance: string }[];
        panels?: {
          panelNumber?: number;
          content?: string;
          narration?: string;
          dialogue?: string;
          imagePrompt?: string;
          prompt?: string;
          image_prompt?: string;
        }[];
      };

      const panelList = (story.panels || []).map((p, i) => ({
        id: uid(),
        panelNumber: p.panelNumber ?? i + 1,
        prompt: p.imagePrompt || p.prompt || p.image_prompt || "A comic panel",
        content: p.content,
        narration: p.narration,
        dialogue: p.dialogue,
        status: "pending" as const,
      }));

      const pages = [];
      for (let i = 0; i < panelList.length; i += 4) {
        pages.push({
          id: uid(),
          pageNumber: Math.floor(i / 4) + 1,
          panels: panelList.slice(i, i + 4),
        });
      }

      const newProject = {
        id: uid(),
        title: story.title || "Untitled Comic",
        genre,
        theme: "studio-dark" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        characters: (story.characters || []).map((c) => ({
          ...c,
          id: uid(),
        })),
        pages,
      };

      addProject(newProject);
      enqueuePanels(panelList.map((p) => p.id));
      router.back();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      Alert.alert(
        "Couldn't forge story",
        msg.includes("Ollama")
          ? "Make sure Ollama is running on the host machine."
          : msg,
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.headerIcon,
              { backgroundColor: colors.primary },
            ]}
          >
            <Feather name="zap" size={18} color="#fff" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              New Story
            </Text>
            <View style={styles.styleBadgeRow}>
              <Feather name="edit-3" size={11} color={colors.mutedForeground} />
              <Text
                style={[styles.headerSub, { color: colors.mutedForeground }]}
              >
                Manga · B&W line art
              </Text>
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Feather name="x" size={24} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Section
          icon="type"
          label="What's the story about?"
          colors={colors}
        >
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="A lonely robot finds a flower in a wasteland…"
            placeholderTextColor={colors.mutedForeground}
            multiline
            style={[
              styles.textarea,
              {
                backgroundColor: colors.secondary,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
          />
        </Section>

        <Section icon="cpu" label="AI Model" colors={colors}>
          <View style={styles.chipGrid}>
            {loadingModels ? (
              <ActivityIndicator color={colors.primary} />
            ) : models.length === 0 ? (
              <View
                style={[
                  styles.warningBox,
                  {
                    backgroundColor: colors.destructive + "1A",
                    borderColor: colors.destructive + "55",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.warningText,
                    { color: colors.destructive },
                  ]}
                >
                  No Ollama models detected. Run 'ollama serve' on your host.
                </Text>
              </View>
            ) : (
              models.map((m) => {
                const active = selectedModel === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setSelectedModel(m)}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: active
                          ? colors.primary + "22"
                          : colors.secondary,
                        borderColor: active ? colors.primary : colors.border,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: active
                            ? colors.primary
                            : colors.mutedForeground,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {m}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </View>
        </Section>

        <Section icon="grid" label="Genre" colors={colors}>
          <View style={styles.chipGrid}>
            {GENRES.map((g) => {
              const active = genre === g.id;
              return (
                <Pressable
                  key={g.id}
                  onPress={() => setGenre(g.id)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: active
                        ? colors.primary
                        : colors.secondary,
                      borderColor: active ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: active ? "#fff" : colors.foreground,
                      },
                    ]}
                  >
                    {g.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section icon="layout" label="Panel Count" colors={colors}>
          <View style={styles.row}>
            {PANEL_OPTIONS.map((n) => {
              const active = panels === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setPanels(n)}
                  style={({ pressed }) => [
                    styles.panelButton,
                    {
                      backgroundColor: active
                        ? colors.primary
                        : colors.secondary,
                      borderColor: active ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.panelButtonText,
                      { color: active ? "#fff" : colors.foreground },
                    ]}
                  >
                    {n}
                  </Text>
                  <Text
                    style={[
                      styles.panelButtonSub,
                      {
                        color: active
                          ? "rgba(255,255,255,0.8)"
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    panels
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {generating && (
          <View
            style={[
              styles.feed,
              {
                backgroundColor: "#000",
                borderColor: colors.primary + "55",
              },
            ]}
          >
            <View style={styles.feedHead}>
              <View
                style={[
                  styles.feedDot,
                  { backgroundColor: colors.primary },
                ]}
              />
              <Text style={[styles.feedLabel, { color: colors.primary }]}>
                AI BRAIN FEED
              </Text>
            </View>
            <Text
              style={[styles.feedText, { color: colors.mutedForeground }]}
            >
              {liveLog || "Initializing neural link…"}
            </Text>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <Pressable
          onPress={handleGenerate}
          disabled={generating || !prompt.trim()}
          style={({ pressed }) => [
            styles.generateButton,
            {
              backgroundColor: !prompt.trim()
                ? colors.muted
                : colors.primary,
              opacity: pressed && prompt.trim() ? 0.85 : 1,
            },
          ]}
        >
          {generating ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={styles.generateText}>Writing Script…</Text>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.generateText,
                  {
                    color: !prompt.trim()
                      ? colors.mutedForeground
                      : "#fff",
                  },
                ]}
              >
                Forge Story
              </Text>
              <Feather
                name="chevron-right"
                size={20}
                color={!prompt.trim() ? colors.mutedForeground : "#fff"}
              />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function Section({
  icon,
  label,
  colors,
  children,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  colors: ReturnType<typeof useColors>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Feather name={icon} size={14} color={colors.primary} />
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          {label.toUpperCase()}
        </Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  styleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  scroll: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 22 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
  },
  textarea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlignVertical: "top",
  },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 90,
    alignItems: "center",
  },
  chipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  row: { flexDirection: "row", gap: 10 },
  panelButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
  },
  panelButtonText: { fontSize: 22, fontFamily: "Inter_700Bold" },
  panelButtonSub: { fontSize: 11, fontFamily: "Inter_500Medium" },
  warningBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  warningText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  feed: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  feedHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  feedDot: { width: 8, height: 8, borderRadius: 4 },
  feedLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  feedText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
    minHeight: 80,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  generateText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
