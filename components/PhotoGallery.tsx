"use client";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 30) / 3;

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<MediaLibrary.Asset | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [photoInfo, setPhotoInfo] = useState<MediaLibrary.AssetInfo | null>(
    null
  );

  // Recarregar fotos quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [])
  );

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      console.log("📱 Carregando fotos da galeria...");

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Permissão para acessar a galeria é necessária."
        );
        setLoading(false);
        return;
      }

      console.log("✅ Permissão da galeria concedida");

      // Primeiro, tentar buscar pelo álbum PhotoCheck
      let albumPhotos: MediaLibrary.Asset[] = [];

      try {
        const album = await MediaLibrary.getAlbumAsync("PhotoCheck");
        console.log(
          "📁 Álbum PhotoCheck:",
          album ? "encontrado" : "não encontrado"
        );

        if (album) {
          const albumAssets = await MediaLibrary.getAssetsAsync({
            album: album,
            mediaType: "photo",
            sortBy: "creationTime",
            first: 100,
          });
          albumPhotos = albumAssets.assets;
          console.log(
            `📸 ${albumPhotos.length} fotos encontradas no álbum PhotoCheck`
          );
        }
      } catch (albumError) {
        console.log("⚠️ Erro ao buscar álbum PhotoCheck:", albumError);
      }

      // Se não encontrou fotos no álbum, buscar fotos recentes que possam ser do PhotoCheck
      if (albumPhotos.length === 0) {
        console.log("🔍 Buscando fotos recentes...");
        const recentAssets = await MediaLibrary.getAssetsAsync({
          mediaType: "photo",
          sortBy: "creationTime",
          first: 50,
        });

        // Filtrar fotos que possam ser do PhotoCheck (últimas 24 horas)
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        albumPhotos = recentAssets.assets.filter(
          (asset) => asset.creationTime > oneDayAgo
        );

        console.log(`📸 ${albumPhotos.length} fotos recentes encontradas`);
      }

      setPhotos(albumPhotos);
    } catch (error) {
      console.error("❌ Erro ao carregar fotos:", error);
      Alert.alert("Erro", "Não foi possível carregar as fotos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPhotos();
  }, []);

  const openPhotoDetails = async (photo: MediaLibrary.Asset) => {
    try {
      console.log("🔍 Carregando detalhes da foto:", photo.id);
      const info = await MediaLibrary.getAssetInfoAsync(photo);
      setPhotoInfo(info);
      setSelectedPhoto(photo);
      setModalVisible(true);
    } catch (error) {
      console.error("❌ Erro ao carregar informações da foto:", error);
      Alert.alert("Erro", "Não foi possível carregar as informações da foto.");
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const sharePhoto = async (photo: MediaLibrary.Asset) => {
    try {
      if (photo.uri) {
        await Share.share({
          url: photo.uri,
          title: "Foto do PhotoCheck",
        });
      }
    } catch (error) {
      console.error("❌ Erro ao compartilhar:", error);
      Alert.alert("Erro", "Não foi possível compartilhar a foto.");
    }
  };

  const deletePhoto = async (photo: MediaLibrary.Asset) => {
    Alert.alert(
      "Excluir Foto",
      "Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await MediaLibrary.deleteAssetsAsync([photo]);
              setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
              setModalVisible(false);
              Alert.alert("Sucesso", "Foto excluída com sucesso.");
            } catch (error) {
              console.error("❌ Erro ao excluir foto:", error);
              Alert.alert("Erro", "Não foi possível excluir a foto.");
            }
          },
        },
      ]
    );
  };

  const renderPhoto = ({ item }: { item: MediaLibrary.Asset }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => openPhotoDetails(item)}
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.photoThumbnail}
        contentFit="cover"
        placeholder={require("../assets/images/icon.png")}
        transition={200}
      />
      <View style={styles.photoOverlay}>
        <Text style={styles.photoDate}>{formatDate(item.creationTime)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-outline" size={60} color="#666" />
        <Text style={styles.loadingText}>Carregando fotos...</Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-outline" size={80} color="#666" />
        <Text style={styles.emptyText}>Nenhuma foto encontrada</Text>
        <Text style={styles.emptySubtext}>
          Capture fotos usando a câmera para vê-las aqui
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadPhotos}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
          <Text style={styles.refreshButtonText}>Atualizar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Galeria PhotoCheck</Text>
          <Text style={styles.photoCount}>{photos.length} fotos</Text>
        </View>
        <TouchableOpacity style={styles.refreshIconButton} onPress={loadPhotos}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
      />

      {/* Modal de detalhes da foto */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detalhes da Foto</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => selectedPhoto && sharePhoto(selectedPhoto)}
              >
                <Ionicons name="share-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => selectedPhoto && deletePhoto(selectedPhoto)}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {selectedPhoto && (
              <>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: selectedPhoto.uri }}
                    style={styles.fullImage}
                    contentFit="contain"
                  />
                </View>

                <View style={styles.infoContainer}>
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>
                      📸 Informações da Foto
                    </Text>

                    <View style={styles.infoRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#666"
                      />
                      <Text style={styles.infoLabel}>Data de Captura:</Text>
                      <Text style={styles.infoValue}>
                        {formatDate(selectedPhoto.creationTime)}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="resize-outline" size={20} color="#666" />
                      <Text style={styles.infoLabel}>Dimensões:</Text>
                      <Text style={styles.infoValue}>
                        {selectedPhoto.width} × {selectedPhoto.height}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="time-outline" size={20} color="#666" />
                      <Text style={styles.infoLabel}>Duração:</Text>
                      <Text style={styles.infoValue}>
                        {selectedPhoto.duration
                          ? `${selectedPhoto.duration}s`
                          : "Foto"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>📱 PhotoCheck</Text>
                    <Text style={styles.forensicNote}>
                      Esta foto foi capturada com o PhotoCheck, um sistema de
                      documentação forense que preserva metadados de
                      localização, data e hora para fins de perícia e laudo
                      técnico.
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  photoCount: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  refreshIconButton: {
    padding: 8,
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  refreshButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  gridContainer: {
    padding: 5,
  },
  photoItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 5,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  photoThumbnail: {
    width: "100%",
    height: "100%",
  },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 4,
  },
  photoDate: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalContent: {
    paddingBottom: 32,
  },
  fullImage: {
    width: "100%",
    height: 350,
    backgroundColor: "#f0f0f0",
    resizeMode: "cover",
  },
  infoContainer: {
    gap: 12,
    paddingHorizontal: 16,
  },
  infoSection: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
    marginRight: 8,
    minWidth: 100,
  },
  infoValue: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  infoValueSmall: {
    fontSize: 11,
    color: "#666",
    flex: 1,
  },
  forensicNote: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    fontStyle: "italic",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
});
