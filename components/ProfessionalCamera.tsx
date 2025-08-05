"use client";

import { Ionicons } from "@expo/vector-icons";
import { type CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";

const { width, height } = Dimensions.get("window");

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  address?: string;
  postalCode?: string;
}

interface OverlayConfig {
  showTime: boolean;
  showDate: boolean;
  showGPS: boolean;
  showAccuracy: boolean;
  showAddress: boolean;
  showPostalCode: boolean;
  showTechInfo: boolean;
  showTextShadow: boolean;
}

type OverlayPosition = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

interface CameraDeviceInfo {
  type: CameraType;
  isAvailable: boolean;
  features?: {
    hasFlash?: boolean;
    hasZoom?: boolean;
    availableLenses?: string[];
    pictureSizes?: string[];
  };
}

interface LensInfo {
  name: string;
  label: string;
  zoomFactor: number;
  isAvailable: boolean;
}

// Mapear lentes do iPhone para labels conhecidos
const IPHONE_LENS_MAPPING: Record<string, LensInfo> = {
  "Back Wide Camera": {
    name: "Back Wide Camera",
    label: "1x",
    zoomFactor: 1.0,
    isAvailable: true, // Sempre disponível
  },
  "Back Ultra Wide Camera": {
    name: "Back Ultra Wide Camera",
    label: "0.5x",
    zoomFactor: 0.5,
    isAvailable: false,
  },
  "Back Telephoto Camera": {
    name: "Back Telephoto Camera",
    label: "2x",
    zoomFactor: 2.0,
    isAvailable: false,
  },
};

export default function ProfessionalCamera() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<"off" | "on" | "auto">("off");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, setMediaLibraryPermission] =
    useState<MediaLibrary.PermissionResponse | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isOverlayReady, setIsOverlayReady] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState<any>(null);
  const [currentLocationForOverlay, setCurrentLocationForOverlay] =
    useState<LocationData | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig>({
    showTime: true,
    showDate: true,
    showGPS: true,
    showPostalCode: true,
    showAccuracy: true,
    showAddress: true,
    showTechInfo: true,
    showTextShadow: true,
  });
  const [overlayPosition, setOverlayPosition] =
    useState<OverlayPosition>("topLeft");
  const [availableCameras, setAvailableCameras] = useState<CameraDeviceInfo[]>(
    []
  );
  const [cameraFeatures, setCameraFeatures] = useState<any>(null);
  const [availableLenses, setAvailableLenses] = useState<LensInfo[]>([]);
  const [selectedLens, setSelectedLens] = useState<string>("Back Wide Camera");
  const [isLensBasedZoom, setIsLensBasedZoom] = useState<boolean>(false);

  const cameraRef = useRef<CameraView>(null);
  const overlayRef = useRef<View>(null);

  useEffect(() => {
    const requestPermissions = async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }

      const mediaPerm = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryPermission(mediaPerm);
    };

    const getCurrentLocationLocal = async () => {
      if (locationLoading) return;

      setLocationLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permissão negada",
            "Permissão de localização é necessária para adicionar coordenadas GPS às fotos."
          );
          setLocationLoading(false);
          return;
        }

        const locationData = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        });

        console.log("✅ Localização obtida >>>>:", locationData);

        // Obter endereço reverso
        try {
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: locationData.coords.latitude,
            longitude: locationData.coords.longitude,
          });

          console.log("🔍 Endereço reverso obtido:", reverseGeocode);

          // Montagem do endereço: prioriza o nome da rua extraído do campo 'name' (padrão brasileiro)
          const addressParts = [];

          // Extrair o nome da rua do campo 'name' que pode conter: "QL 12, LT 27, Rua 31"
          if (reverseGeocode[0]?.name) {
            const fullName = reverseGeocode[0].name;

            // Tentar extrair o nome da rua - procurar por "Rua", "Av", "Avenida", etc.
            const streetPatterns = [
              /(?:^|,\s*)(Rua\s+[^,]+)/i,
              /(?:^|,\s*)(Avenida\s+[^,]+)/i,
              /(?:^|,\s*)(Av\.\s+[^,]+)/i,
              /(?:^|,\s*)(Alameda\s+[^,]+)/i,
              /(?:^|,\s*)(Travessa\s+[^,]+)/i,
              /(?:^|,\s*)(Estrada\s+[^,]+)/i,
            ];

            let streetName = null;
            for (const pattern of streetPatterns) {
              const match = fullName.match(pattern);
              if (match) {
                streetName = match[1].trim();
                break;
              }
            }

            if (streetName) {
              addressParts.push(streetName);
            } else {
              // Se não encontrou padrão de rua, usar o nome completo
              addressParts.push(fullName);
            }
          } else {
            // Fallback: monte a partir dos componentes básicos
            if (reverseGeocode[0]?.street) {
              let streetPart = reverseGeocode[0].street;
              if (reverseGeocode[0]?.streetNumber) {
                streetPart += `, ${reverseGeocode[0].streetNumber}`;
              }
              addressParts.push(streetPart);
            }
          }

          // Adicionar distrito se disponível e não duplicado
          if (
            reverseGeocode[0]?.district &&
            !addressParts.some((part) =>
              part
                .toLowerCase()
                .includes(reverseGeocode[0].district!.toLowerCase())
            )
          ) {
            addressParts.push(reverseGeocode[0].district);
          }

          // Adicionar cidade
          if (reverseGeocode[0]?.city)
            addressParts.push(reverseGeocode[0].city);

          // Adicionar região/estado
          if (reverseGeocode[0]?.region)
            addressParts.push(reverseGeocode[0].region);

          const address =
            addressParts.length > 0
              ? addressParts.join(", ")
              : "Endereço não disponível";

          setLocation({
            latitude: locationData.coords.latitude,
            longitude: locationData.coords.longitude,
            accuracy: locationData.coords.accuracy,
            address: address,
            postalCode: reverseGeocode[0]?.postalCode || "",
          });

          console.log("✅ Endereço obtido:", address);
        } catch (geocodeError) {
          console.log(
            "⚠️ Erro no geocoding, usando apenas coordenadas:",
            geocodeError
          );
          setLocation({
            latitude: locationData.coords.latitude,
            longitude: locationData.coords.longitude,
            accuracy: locationData.coords.accuracy,
            address: "Endereço não disponível",
          });
        }
      } catch (error) {
        console.error("❌ Erro ao obter localização:", error);
        Alert.alert("Erro", "Não foi possível obter a localização atual.");
      } finally {
        setLocationLoading(false);
      }
    };

    const initializeCamera = async () => {
      await requestPermissions();
      await getCurrentLocationLocal();
      await getCameraDeviceInfo();
    };
    initializeCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestCameraPermission, cameraPermission?.granted]);

  const getCameraDeviceInfo = async () => {
    try {
      console.log("🔍 Obtendo informações das câmeras disponíveis...");

      const cameras: CameraDeviceInfo[] = [];

      // Verificar câmera traseira
      const backCameraInfo: CameraDeviceInfo = {
        type: "back",
        isAvailable: true,
        features: {},
      };

      // Verificar câmera frontal
      const frontCameraInfo: CameraDeviceInfo = {
        type: "front",
        isAvailable: true,
        features: {},
      };

      // Se o cameraRef estiver disponível, obter recursos avançados
      if (cameraRef.current) {
        try {
          // Obter recursos suportados
          const supportedFeatures =
            await cameraRef.current.getSupportedFeatures();
          setCameraFeatures(supportedFeatures);

          // Obter tamanhos de foto disponíveis
          const pictureSizes =
            await cameraRef.current.getAvailablePictureSizesAsync();
          backCameraInfo.features!.pictureSizes = pictureSizes;
          frontCameraInfo.features!.pictureSizes = pictureSizes;

          console.log("✅ Recursos da câmera:", supportedFeatures);
          console.log("✅ Tamanhos de foto disponíveis:", pictureSizes);

          // Para iOS, tentar obter lentes disponíveis
          if (Platform.OS === "ios") {
            try {
              const deviceLenses =
                await cameraRef.current.getAvailableLensesAsync();
              console.log("Lentes disponíveis:", deviceLenses);
              backCameraInfo.features!.availableLenses = deviceLenses;
              console.log("✅ Lentes disponíveis (iOS):", deviceLenses);
              console.log(
                "📊 Total de lentes detectadas:",
                deviceLenses.length
              );
              console.log(
                "📊 Detalhes das lentes:",
                deviceLenses.map((lens, index) => ({
                  indice: index,
                  nome: lens,
                  tipo: typeof lens,
                  valido:
                    lens && typeof lens === "string" && lens.trim() !== "",
                }))
              );

              // Filtrar lentes válidas antes do processamento
              const validLenses = deviceLenses.filter(
                (lensName) =>
                  lensName &&
                  typeof lensName === "string" &&
                  lensName.trim() !== ""
              );

              console.log("✅ Lentes válidas após filtro:", validLenses);

              // Processar lentes disponíveis para zoom baseado em lentes
              const processedLenses = validLenses
                .map((lensName) => {
                  console.log(`🔍 Processando lente: "${lensName}"`);

                  // Usar APENAS as lentes que estão no mapeamento conhecido
                  if (IPHONE_LENS_MAPPING[lensName]) {
                    const lensInfo = { ...IPHONE_LENS_MAPPING[lensName] };
                    lensInfo.isAvailable = true;
                    console.log(`✅ Lente mapeada:`, lensInfo);
                    return lensInfo;
                  }

                  // Se não estiver no mapeamento, ignorar (não criar genérica)
                  console.log(
                    `⚠️ Lente não reconhecida, ignorando: ${lensName}`
                  );
                  return null;
                })
                .filter(
                  (lens): lens is LensInfo =>
                    lens !== null && lens !== undefined
                );

              setAvailableLenses(processedLenses);
              setIsLensBasedZoom(processedLenses.length > 1);

              // Garantir que sempre temos a lente Wide (1x) disponível
              if (
                processedLenses.length === 0 ||
                !processedLenses.some((lens) => lens.label === "1x")
              ) {
                console.log(
                  "⚠️ Lente Wide (1x) não detectada, adicionando manualmente"
                );
                const wideLens = { ...IPHONE_LENS_MAPPING["Back Wide Camera"] };
                wideLens.isAvailable = true;
                processedLenses.push(wideLens);
                setAvailableLenses(processedLenses);
                setIsLensBasedZoom(processedLenses.length > 1);
              }

              // Definir lente inicial se temos lentes disponíveis
              if (processedLenses.length > 0) {
                // Usar especificamente a "Back Wide Camera" como padrão
                const defaultLens =
                  processedLenses.find(
                    (lens) => lens.name === "Back Wide Camera"
                  ) ||
                  processedLenses.find((lens) => lens.label === "1x") ||
                  processedLenses[0];

                setSelectedLens(defaultLens.name);
                console.log(
                  `🎯 Lente inicial selecionada: ${defaultLens.name} (${defaultLens.label})`
                );
              }

              console.log("✅ Lentes processadas:", processedLenses);
              console.log("🔍 Mapeamento de lentes:");

              if (processedLenses.length > 0) {
                console.log(
                  `📱 Total de ${processedLenses.length} lentes disponíveis:`
                );
                processedLenses.forEach((lens, index) => {
                  console.log(
                    `  ${index + 1}. ${lens.label} - ${lens.name} (${
                      lens.zoomFactor
                    }x)`
                  );
                });
              } else {
                console.log("  ⚠️ Nenhuma lente válida foi processada");
              }

              console.log(
                "📷 Zoom baseado em lentes:",
                processedLenses.length > 1 ? "ATIVADO" : "DESATIVADO"
              );
              console.log(
                "📊 Resumo:",
                `${validLenses.length} lentes válidas de ${deviceLenses.length} detectadas`
              );
            } catch (lensError) {
              console.log("⚠️ Lentes não disponíveis ou erro:", lensError);
              // Fallback para zoom tradicional
              setIsLensBasedZoom(false);
            }
          } else {
            // Android - usar zoom tradicional
            setIsLensBasedZoom(false);
          }
        } catch (featureError) {
          console.log("⚠️ Erro ao obter recursos da câmera:", featureError);
        }
      }

      cameras.push(backCameraInfo, frontCameraInfo);
      setAvailableCameras(cameras);

      console.log("✅ Informações das câmeras obtidas:", cameras);
    } catch (error) {
      console.error("❌ Erro ao obter informações das câmeras:", error);
    }
  };

  const getCurrentLocation = async () => {
    if (locationLoading) return;

    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Permissão de localização é necessária para adicionar coordenadas GPS às fotos."
        );
        setLocationLoading(false);
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      });

      console.log("✅ Localização obtida >>>>:", locationData);

      // Obter endereço reverso
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
        });

        console.log("🔍 Endereço reverso obtido:", reverseGeocode);

        // Montagem do endereço: prioriza o nome da rua extraído do campo 'name' (padrão brasileiro)
        const addressParts = [];

        // Extrair o nome da rua do campo 'name' que pode conter: "QL 12, LT 27, Rua 31"
        if (reverseGeocode[0]?.name) {
          const fullName = reverseGeocode[0].name;

          // Tentar extrair o nome da rua - procurar por "Rua", "Av", "Avenida", etc.
          const streetPatterns = [
            /(?:^|,\s*)(Rua\s+[^,]+)/i,
            /(?:^|,\s*)(Avenida\s+[^,]+)/i,
            /(?:^|,\s*)(Av\.\s+[^,]+)/i,
            /(?:^|,\s*)(Alameda\s+[^,]+)/i,
            /(?:^|,\s*)(Travessa\s+[^,]+)/i,
            /(?:^|,\s*)(Estrada\s+[^,]+)/i,
          ];

          let streetName = null;
          for (const pattern of streetPatterns) {
            const match = fullName.match(pattern);
            if (match) {
              streetName = match[1].trim();
              break;
            }
          }

          if (streetName) {
            addressParts.push(streetName);
          } else {
            // Se não encontrou padrão de rua, usar o nome completo
            addressParts.push(fullName);
          }
        } else {
          // Fallback: monte a partir dos componentes básicos
          if (reverseGeocode[0]?.street) {
            let streetPart = reverseGeocode[0].street;
            if (reverseGeocode[0]?.streetNumber) {
              streetPart += `, ${reverseGeocode[0].streetNumber}`;
            }
            addressParts.push(streetPart);
          }
        }

        // Adicionar distrito se disponível e não duplicado
        if (
          reverseGeocode[0]?.district &&
          !addressParts.some((part) =>
            part
              .toLowerCase()
              .includes(reverseGeocode[0].district!.toLowerCase())
          )
        ) {
          addressParts.push(reverseGeocode[0].district);
        }

        // Adicionar cidade
        if (reverseGeocode[0]?.city) addressParts.push(reverseGeocode[0].city);

        // Adicionar região/estado
        if (reverseGeocode[0]?.region)
          addressParts.push(reverseGeocode[0].region);

        const address =
          addressParts.length > 0
            ? addressParts.join(", ")
            : "Endereço não disponível";

        setLocation({
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          accuracy: locationData.coords.accuracy,
          address: address,
        });

        console.log("✅ Endereço obtido:", address);
      } catch (geocodeError) {
        console.log(
          "⚠️ Erro no geocoding, usando apenas coordenadas:",
          geocodeError
        );
        setLocation({
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          accuracy: locationData.coords.accuracy,
          address: "Endereço não disponível",
        });
      }
    } catch (error) {
      console.error("❌ Erro ao obter localização:", error);
      Alert.alert("Erro", "Não foi possível obter a localização atual.");
    } finally {
      setLocationLoading(false);
    }
  };

  const formatDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const time = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dayOfWeek = now.toLocaleDateString("pt-BR", { weekday: "short" });
    return { date, time, dayOfWeek, timestamp: now };
  };

  const generatePhotoCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createOverlayPhoto = async (originalPhotoUri: string) => {
    try {
      setCapturedPhoto(originalPhotoUri);
      setIsOverlayReady(false);

      console.log("📏 Preparando captura do overlay...");

      // Dar tempo para a imagem base carregar
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsOverlayReady(true);

      // Dar tempo para o overlay renderizar
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!overlayRef.current) {
        console.error("❌ Referência do overlay não encontrada");
        return null;
      }

      console.log("📸 Capturando overlay...");

      // Captura com dimensões da tela para evitar problemas
      const overlayUri = await captureRef(overlayRef.current, {
        format: "jpg",
        quality: 0.8,
        result: "tmpfile",
      });

      console.log("✅ Overlay capturado com sucesso:", overlayUri);

      // Limpar estados após a captura
      setCapturedPhoto(null);
      setIsOverlayReady(false);
      setCurrentDateTime(null);
      setCurrentLocationForOverlay(null);

      return overlayUri;
    } catch (error) {
      console.error("❌ Erro ao criar foto com overlay:", error);
      setCapturedPhoto(null);
      setIsOverlayReady(false);
      setCurrentDateTime(null);
      setCurrentLocationForOverlay(null);
      return null;
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);

    try {
      const dateTime = formatDateTime();
      const photoCode = generatePhotoCode();

      // Definir os dados que serão usados no overlay ANTES de criar o overlay
      setCurrentDateTime(dateTime);
      setCurrentLocationForOverlay(location); // Captura o estado atual da localização

      console.log("📸 Iniciando captura da foto...");
      console.log("📍 Localização no momento da captura:", location);

      const cameraPhoto = await cameraRef.current.takePictureAsync({
        quality: 1.0,
        base64: false,
        exif: true,
        skipProcessing: false,
      });

      console.log("✅ Foto da câmera capturada:", cameraPhoto.uri);

      const overlayPhoto = await createOverlayPhoto(cameraPhoto.uri);

      if (overlayPhoto) {
        console.log("✅ Foto com overlay criada:", overlayPhoto);
      } else {
        console.log("⚠️ Falha ao criar overlay, salvando apenas foto original");
      }

      await savePhotosToLibrary(cameraPhoto, overlayPhoto, dateTime, photoCode);

      Alert.alert(
        "📸 Fotos Capturadas!",
        `✅ ${overlayPhoto ? "2 versões" : "1 versão"} salva${
          overlayPhoto ? "s" : ""
        }:\n${
          overlayPhoto
            ? "• Foto original (alta qualidade)\n• Foto com overlay forense\n"
            : "• Foto original\n"
        }\n📅 Data: ${dateTime.date}\n🕐 Hora: ${
          dateTime.time
        }\n📋 Código: ${photoCode}${
          location
            ? `\n📍 GPS: ${location.latitude.toFixed(
                6
              )}, ${location.longitude.toFixed(
                6
              )}\n🎯 Precisão: ±${location.accuracy?.toFixed(0)}m`
            : "\n⚠️ Localização não disponível"
        }${location?.address ? `\n🏠 ${location.address}` : ""}`,
        [{ text: "✅ OK", style: "default" }]
      );
    } catch (error) {
      console.error("Erro ao tirar foto:", error);
      Alert.alert(
        "❌ Erro",
        "Não foi possível tirar a foto. Verifique as permissões e tente novamente."
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const savePhotosToLibrary = async (
    originalPhoto: any,
    overlayPhoto: string | null,
    dateTime: any,
    photoCode: string
  ) => {
    try {
      if (mediaLibraryPermission?.status !== "granted") {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission.status !== "granted") {
          Alert.alert(
            "Permissão necessária",
            "É necessário permitir acesso à galeria para salvar as fotos."
          );
          return;
        }
      }

      console.log("💾 Salvando fotos na galeria...");

      let album = await MediaLibrary.getAlbumAsync("PhotoCheck");
      if (!album) {
        console.log("📁 Criando álbum PhotoCheck...");
        const firstAsset = await MediaLibrary.createAssetAsync(
          originalPhoto.uri
        );
        album = await MediaLibrary.createAlbumAsync(
          "PhotoCheck",
          firstAsset,
          false
        );
        console.log("✅ Álbum PhotoCheck criado");
      } else {
        const originalAsset = await MediaLibrary.createAssetAsync(
          originalPhoto.uri
        );
        await MediaLibrary.addAssetsToAlbumAsync([originalAsset], album, false);
        console.log("✅ Foto original salva no álbum");
      }

      if (overlayPhoto) {
        const overlayAsset = await MediaLibrary.createAssetAsync(overlayPhoto);
        await MediaLibrary.addAssetsToAlbumAsync([overlayAsset], album, false);
        console.log("✅ Foto com overlay salva no álbum");
      }

      console.log("🎉 Todas as fotos foram salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar fotos:", error);
      Alert.alert("Erro", "Não foi possível salvar as fotos na galeria.");
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current: CameraType) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((current) => {
      const newFlash =
        current === "off" ? "on" : current === "on" ? "auto" : "off";
      console.log("💡 Flash alterado para:", newFlash);
      return newFlash;
    });
  };

  const cycleLens = () => {
    try {
      if (isLensBasedZoom && availableLenses.length > 0) {
        // Filtrar apenas as lentes principais (0.5x, 1x, 2x)
        const mainLenses = availableLenses.filter((lens) =>
          ["0.5x", "1x", "2x"].includes(lens.label)
        );

        if (mainLenses.length > 0) {
          // Encontrar a lente atual e ir para a próxima
          const currentLensIndex = mainLenses.findIndex(
            (lens) => lens.name === selectedLens
          );
          const nextIndex = (currentLensIndex + 1) % mainLenses.length;
          const newLens = mainLenses[nextIndex];

          console.log(
            "🔍 Alternando lente de",
            selectedLens,
            "para",
            newLens.name
          );
          setSelectedLens(newLens.name);
        }
      }
    } catch (error) {
      console.error("❌ Erro ao alternar lente:", error);
    }
  };

  const getCurrentZoomLabel = () => {
    if (isLensBasedZoom && availableLenses.length > 0) {
      const currentLens = availableLenses.find(
        (lens) => lens.name === selectedLens
      );
      return currentLens?.label || "1x";
    } else {
      return "1x"; // Sem zoom, sempre 1x
    }
  };

  const getFlashColor = () => {
    switch (flash) {
      case "on":
        return "#FFD700";
      case "auto":
        return "#FFA500";
      default:
        return "#fff";
    }
  };

  const updateOverlayConfig = (key: keyof OverlayConfig, value: boolean) => {
    setOverlayConfig((prev) => ({ ...prev, [key]: value }));
  };

  const showCameraInfo = () => {
    const info = availableCameras
      .map((camera) => {
        const featuresText = camera.features
          ? Object.entries(camera.features)
              .filter(([_, value]) => value !== undefined)
              .map(([key, value]) => {
                if (Array.isArray(value)) {
                  return `${key}: ${value.length} item(s)`;
                }
                return `${key}: ${value}`;
              })
              .join("\n")
          : "Nenhum recurso detectado";

        return `📱 Câmera ${
          camera.type === "back" ? "Traseira" : "Frontal"
        }:\n${featuresText}`;
      })
      .join("\n\n");

    const lensInfo =
      isLensBasedZoom && availableLenses.length > 0
        ? `\n\n🔍 Lentes Disponíveis (${
            availableLenses.length
          }):\n${availableLenses
            .map((lens) => `• ${lens.label} (${lens.name})`)
            .join("\n")}\n\n📌 Lente Atual: ${getCurrentZoomLabel()}`
        : "\n\n🔍 Apenas câmera principal disponível";

    const featuresInfo = cameraFeatures
      ? `\n\n🔧 Recursos do dispositivo:\n${Object.entries(cameraFeatures)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n")}`
      : "";

    Alert.alert(
      "📸 Informações das Câmeras",
      `${info}${lensInfo}${featuresInfo}`,
      [{ text: "OK", style: "default" }]
    );
  };

  const getTextAlignment = () => {
    return overlayPosition === "topRight" || overlayPosition === "bottomRight"
      ? "right"
      : "left";
  };

  const getTextShadowStyle = () => {
    return overlayConfig.showTextShadow
      ? {
          textShadowColor: "rgba(0, 0, 0, 0.9)",
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 4,
        }
      : {};
  };

  const getOverlayPositionStyle = () => {
    switch (overlayPosition) {
      case "topLeft":
        return {
          position: "absolute" as const,
          top: Platform.OS === "ios" ? 20 : 20,
          left: 20,
        };
      case "topRight":
        return {
          position: "absolute" as const,
          top: Platform.OS === "ios" ? 20 : 20,
          right: 12,
          alignItems: "flex-end" as const,
        };
      case "bottomLeft":
        return {
          position: "absolute" as const,
          bottom: Platform.OS === "ios" ? 20 : 20,
          left: 12,
        };
      case "bottomRight":
        return {
          position: "absolute" as const,
          bottom: Platform.OS === "ios" ? 20 : 20,
          right: 12,
          alignItems: "flex-end" as const,
        };
      default:
        return {
          position: "absolute" as const,
          top: Platform.OS === "ios" ? 20 : 20,
          left: 12,
        };
    }
  };

  if (!cameraPermission) {
    return <View />;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Precisamos da sua permissão para mostrar a câmera
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestCameraPermission}
        >
          <Text style={styles.text}>Permitir Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { date, time, dayOfWeek } = formatDateTime();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView
        style={styles.camera} // Estilo da câmera
        facing={facing} // "back" | "front"
        flash={flash} // "off" | "on" | "auto"
        selectedLens={isLensBasedZoom ? selectedLens : undefined} // Usar lente selecionada se zoom baseado em lentes
        ref={cameraRef}
        ratio="16:9"
      >
        {/* Overlay de informações forenses (igual ao do resultado) */}
        <View style={[styles.overlayContainer, getOverlayPositionStyle()]}>
          {overlayConfig.showTime && (
            <Text style={[styles.timeOverlay, getTextShadowStyle()]}>
              {time}
            </Text>
          )}

          {overlayConfig.showDate && (
            <View style={styles.dateOverlayContainer}>
              <Text style={[styles.dateOverlay, getTextShadowStyle()]}>
                {date}
              </Text>
              <Text style={[styles.dayOverlay, getTextShadowStyle()]}>
                {dayOfWeek}
              </Text>
            </View>
          )}

          {overlayConfig.showAddress && location && location.address && (
            <Text
              style={[
                styles.addressOverlay,
                { textAlign: getTextAlignment() as any },
                getTextShadowStyle(),
              ]}
              numberOfLines={2}
            >
              {location.address}
            </Text>
          )}

          {overlayConfig.showPostalCode && location && location.postalCode && (
            <Text
              style={[
                styles.postalCodeOverlay,
                { textAlign: getTextAlignment() as any },
                getTextShadowStyle(),
              ]}
              numberOfLines={2}
            >
              {location.postalCode}
            </Text>
          )}

          {/* Informações de GPS */}
          {location &&
          (overlayConfig.showGPS ||
            overlayConfig.showAccuracy ||
            overlayConfig.showAddress) ? (
            <View style={styles.locationOverlayContainer}>
              {overlayConfig.showGPS && (
                <Text
                  style={[
                    styles.gpsOverlay,
                    { textAlign: getTextAlignment() as any },
                    getTextShadowStyle(),
                  ]}
                >
                  {location.latitude.toFixed(6)},{" "}
                  {location.longitude.toFixed(6)}
                </Text>
              )}
              {overlayConfig.showAccuracy && location.accuracy && (
                <Text
                  style={[
                    styles.accuracyOverlay,
                    { textAlign: getTextAlignment() as any },
                    getTextShadowStyle(),
                  ]}
                >
                  Precisão: ±{location.accuracy.toFixed(0)}m
                </Text>
              )}

              {overlayConfig.showTechInfo && (
                <View style={styles.techOverlayContainer}>
                  <Text
                    style={[
                      styles.techOverlay,
                      { textAlign: getTextAlignment() as any },
                      getTextShadowStyle(),
                    ]}
                  >
                    PhotoCheck
                  </Text>
                </View>
              )}
            </View>
          ) : (
            overlayConfig.showGPS && (
              <Text style={[styles.noGpsOverlay, getTextShadowStyle()]}>
                📍 {locationLoading ? "Localizando..." : "GPS não disponível"}
              </Text>
            )
          )}
        </View>

        {/* Controles da câmera */}
        <View style={styles.controls}>
          {/* Controles superiores */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setShowConfigModal(true)}
            >
              <Ionicons name="settings-outline" size={24} color="#fff" />
              <Text style={styles.controlButtonText}>CONFIG</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                flash !== "off" && styles.controlButtonActive,
              ]}
              onPress={toggleFlash}
            >
              <Ionicons name="flash" size={24} color="#fff" />
              <Text
                style={[styles.controlButtonText, { color: getFlashColor() }]}
              >
                {flash.toUpperCase()}
              </Text>
            </TouchableOpacity>

            {/* Botão único para alternar entre lentes */}
            {isLensBasedZoom && availableLenses.length > 1 && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={cycleLens}
              >
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.controlButtonText}>
                  {getCurrentZoomLabel()}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.controlButton,
                locationLoading && styles.controlButtonActive,
              ]}
              onPress={getCurrentLocation}
              disabled={locationLoading}
            >
              <Ionicons
                name={locationLoading ? "location-outline" : "location"}
                size={24}
                color={location ? "#4CAF50" : "#fff"}
              />
              <Text
                style={[
                  styles.controlButtonText,
                  { color: location ? "#4CAF50" : "#fff" },
                ]}
              >
                {locationLoading ? "..." : "GPS"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Controles inferiores */}
          <View style={styles.bottomControls}>
            <View style={styles.captureArea}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={toggleCameraFacing}
              >
                <Ionicons name="camera-reverse" size={28} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.captureButton,
                  isCapturing && styles.captureButtonDisabled,
                ]}
                onPress={takePicture}
                disabled={isCapturing}
              >
                <View style={styles.captureButtonInner}>
                  {isCapturing && <Text style={styles.capturingText}>...</Text>}
                </View>
              </TouchableOpacity>

              <View style={styles.placeholder} />
            </View>
          </View>
        </View>
      </CameraView>
      {/* View offscreen para captura do overlay com TODAS as informações */}
      {capturedPhoto && (
        <View
          ref={overlayRef}
          style={styles.offscreenOverlay}
          collapsable={false}
          pointerEvents="none"
        >
          {/* Foto de fundo */}
          <Image
            source={{ uri: capturedPhoto }}
            style={styles.backgroundImage}
            resizeMode="cover"
            onLoad={() => console.log("🖼️ Imagem carregada no overlay")}
            onError={(error) =>
              console.error("❌ Erro ao carregar imagem:", error)
            }
          />

          {/* Overlay com TODAS as informações da tela da câmera */}
          {isOverlayReady && currentDateTime && (
            <View style={[styles.overlayContainer, getOverlayPositionStyle()]}>
              {overlayConfig.showTime && (
                <Text style={[styles.timeOverlay, getTextShadowStyle()]}>
                  {currentDateTime.time}
                </Text>
              )}

              {overlayConfig.showDate && (
                <View style={styles.dateOverlayContainer}>
                  <Text style={[styles.dateOverlay, getTextShadowStyle()]}>
                    {currentDateTime.date}
                  </Text>
                  <Text style={[styles.dayOverlay, getTextShadowStyle()]}>
                    {currentDateTime.dayOfWeek}
                  </Text>
                </View>
              )}

              {overlayConfig.showAddress &&
                currentLocationForOverlay &&
                currentLocationForOverlay.address && (
                  <Text
                    style={[
                      styles.addressOverlay,
                      { textAlign: getTextAlignment() as any },
                      getTextShadowStyle(),
                    ]}
                    numberOfLines={2}
                  >
                    {currentLocationForOverlay.address}
                  </Text>
                )}

              {/* Informações de GPS */}
              {currentLocationForOverlay &&
              (overlayConfig.showGPS ||
                overlayConfig.showAccuracy ||
                overlayConfig.showAddress) ? (
                <View style={styles.locationOverlayContainer}>
                  {overlayConfig.showGPS && (
                    <Text
                      style={[
                        styles.gpsOverlay,
                        { textAlign: getTextAlignment() as any },
                        getTextShadowStyle(),
                      ]}
                    >
                      {currentLocationForOverlay.latitude.toFixed(6)},{" "}
                      {currentLocationForOverlay.longitude.toFixed(6)}
                    </Text>
                  )}
                  {overlayConfig.showAccuracy &&
                    currentLocationForOverlay.accuracy && (
                      <Text
                        style={[
                          styles.accuracyOverlay,
                          { textAlign: getTextAlignment() as any },
                          getTextShadowStyle(),
                        ]}
                      >
                        Precisão: ±
                        {currentLocationForOverlay.accuracy.toFixed(0)}m
                      </Text>
                    )}

                  {overlayConfig.showTechInfo && (
                    <View style={styles.techOverlayContainer}>
                      <Text
                        style={[
                          styles.techOverlay,
                          { textAlign: getTextAlignment() as any },
                          getTextShadowStyle(),
                        ]}
                      >
                        PhotoCheck v1.0
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                overlayConfig.showGPS && (
                  <Text style={[styles.noGpsOverlay, getTextShadowStyle()]}>
                    📍 GPS não disponível
                  </Text>
                )
              )}
            </View>
          )}
        </View>
      )}
      {/* Modal de Configurações */}
      <Modal
        visible={showConfigModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowConfigModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>⚙️ Configurações do Overlay</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowConfigModal(false)}
            >
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.sectionTitle}>📱 Informações a Exibir</Text>
            <Text style={styles.sectionSubtitle}>
              Escolha quais dados aparecerão no overlay das fotos
            </Text>

            <View style={styles.configSection}>
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configLabel}>🕐 Hora</Text>
                  <Text style={styles.configDescription}>
                    Exibe o horário exato da captura
                  </Text>
                </View>
                <Switch
                  value={overlayConfig.showTime}
                  onValueChange={(value) =>
                    updateOverlayConfig("showTime", value)
                  }
                  trackColor={{ false: "#767577", true: "#4CAF50" }}
                  thumbColor={overlayConfig.showTime ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configLabel}>📅 Data</Text>
                  <Text style={styles.configDescription}>
                    Exibe a data e dia da semana
                  </Text>
                </View>
                <Switch
                  value={overlayConfig.showDate}
                  onValueChange={(value) =>
                    updateOverlayConfig("showDate", value)
                  }
                  trackColor={{ false: "#767577", true: "#4CAF50" }}
                  thumbColor={overlayConfig.showDate ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configLabel}>📍 Coordenadas GPS</Text>
                  <Text style={styles.configDescription}>
                    Latitude e longitude exatas
                  </Text>
                </View>
                <Switch
                  value={overlayConfig.showGPS}
                  onValueChange={(value) =>
                    updateOverlayConfig("showGPS", value)
                  }
                  trackColor={{ false: "#767577", true: "#4CAF50" }}
                  thumbColor={overlayConfig.showGPS ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configLabel}>🎯 Precisão GPS</Text>
                  <Text style={styles.configDescription}>
                    Margem de erro da localização
                  </Text>
                </View>
                <Switch
                  value={overlayConfig.showAccuracy}
                  onValueChange={(value) =>
                    updateOverlayConfig("showAccuracy", value)
                  }
                  trackColor={{ false: "#767577", true: "#4CAF50" }}
                  thumbColor={overlayConfig.showAccuracy ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configLabel}>🏠 Endereço</Text>
                  <Text style={styles.configDescription}>
                    Nome da rua e localização
                  </Text>
                </View>
                <Switch
                  value={overlayConfig.showAddress}
                  onValueChange={(value) =>
                    updateOverlayConfig("showAddress", value)
                  }
                  trackColor={{ false: "#767577", true: "#4CAF50" }}
                  thumbColor={overlayConfig.showAddress ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configLabel}>🏠 CEP</Text>
                  <Text style={styles.configDescription}>Código Postal</Text>
                </View>
                <Switch
                  value={overlayConfig.showPostalCode}
                  onValueChange={(value) =>
                    updateOverlayConfig("showPostalCode", value)
                  }
                  trackColor={{ false: "#767577", true: "#4CAF50" }}
                  thumbColor={overlayConfig.showPostalCode ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={[styles.configRow, { borderBottomWidth: 0 }]}>
                <View style={styles.configInfo}>
                  <Text style={styles.configLabel}>📱 Info Técnicas</Text>
                  <Text style={styles.configDescription}>
                    App, zoom e código da foto
                  </Text>
                </View>
                <Switch
                  value={overlayConfig.showTechInfo}
                  onValueChange={(value) =>
                    updateOverlayConfig("showTechInfo", value)
                  }
                  trackColor={{ false: "#767577", true: "#4CAF50" }}
                  thumbColor={overlayConfig.showTechInfo ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={[styles.configRow, { borderBottomWidth: 0 }]}>
                <View style={styles.configInfo}>
                  <Text style={styles.configLabel}>🌑 Sombra do Texto</Text>
                  <Text style={styles.configDescription}>
                    Adiciona sombra atrás das letras para melhor legibilidade
                  </Text>
                </View>
                <Switch
                  value={overlayConfig.showTextShadow}
                  onValueChange={(value) =>
                    updateOverlayConfig("showTextShadow", value)
                  }
                  trackColor={{ false: "#767577", true: "#4CAF50" }}
                  thumbColor={overlayConfig.showTextShadow ? "#fff" : "#f4f3f4"}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>📍 Posição do Overlay</Text>
            <Text style={styles.sectionSubtitle}>
              Escolha em qual canto da tela as informações aparecerão
            </Text>

            <View style={styles.positionGrid}>
              <TouchableOpacity
                style={[
                  styles.positionOption,
                  overlayPosition === "topLeft" && styles.positionOptionActive,
                ]}
                onPress={() => setOverlayPosition("topLeft")}
              >
                <View style={styles.positionPreview}>
                  <View style={[styles.positionDot, styles.positionTopLeft]} />
                </View>
                <Text style={styles.positionLabel}>Superior Esquerdo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.positionOption,
                  overlayPosition === "topRight" && styles.positionOptionActive,
                ]}
                onPress={() => setOverlayPosition("topRight")}
              >
                <View style={styles.positionPreview}>
                  <View style={[styles.positionDot, styles.positionTopRight]} />
                </View>
                <Text style={styles.positionLabel}>Superior Direito</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.positionOption,
                  overlayPosition === "bottomLeft" &&
                    styles.positionOptionActive,
                ]}
                onPress={() => setOverlayPosition("bottomLeft")}
              >
                <View style={styles.positionPreview}>
                  <View
                    style={[styles.positionDot, styles.positionBottomLeft]}
                  />
                </View>
                <Text style={styles.positionLabel}>Inferior Esquerdo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.positionOption,
                  overlayPosition === "bottomRight" &&
                    styles.positionOptionActive,
                ]}
                onPress={() => setOverlayPosition("bottomRight")}
              >
                <View style={styles.positionPreview}>
                  <View
                    style={[styles.positionDot, styles.positionBottomRight]}
                  />
                </View>
                <Text style={styles.positionLabel}>Inferior Direito</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center", // Centraliza a câmera verticalmente
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "#fff",
  },
  camera: {
    width: "100%",
    aspectRatio: 9 / 16, // Proporção 16:9 em modo retrato
  },
  button: {
    alignItems: "center",
    backgroundColor: "#2196F3",
    padding: 10,
    margin: 20,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  // Overlay da câmera (posição dinâmica)
  overlayContainer: {},
  timeOverlay: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "300",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
    marginLeft: -2,
  },
  dateOverlayContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  dateOverlay: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "400",
    marginRight: 8,
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
  },
  dayOverlay: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
    marginBottom: 2,
  },
  postalCodeOverlay: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
    marginBottom: 2,
    textAlign: "left",
  },
  locationOverlayContainer: {
    marginBottom: 0,
  },
  gpsOverlay: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
  },
  accuracyOverlay: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
    marginBottom: 2,
  },
  addressOverlay: {
    color: "#fff",
    fontWeight: "400",
    lineHeight: 14,
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
    marginBottom: 2,
    textAlign: "left",
  },
  noGpsOverlay: {
    color: "#FF6B6B",
    fontSize: 12,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
    marginBottom: 2,
  },
  techOverlayContainer: {
    color: "#fff",
    fontSize: 14,
    marginTop: 0,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
  },
  techOverlay: {
    color: "#fff",
    fontSize: 14,
    marginTop: 0,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
  },
  controls: {
    flex: 1,
    justifyContent: "space-between",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    gap: 12,
  },
  controlButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 60,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  controlButtonActive: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderColor: "rgba(255, 215, 0, 0.5)",
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 2,
  },
  bottomControls: {
    paddingBottom: Platform.OS === "ios" ? 40 : 40,
  },
  captureArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  flipButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  captureButton: {
    backgroundColor: "#fff",
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureButtonInner: {
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  capturingText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  placeholder: {
    width: 60,
    height: 60,
  },
  // Estilos para overlay offscreen
  offscreenOverlay: {
    position: "absolute",
    top: -5000,
    left: 0,
    width: width,
    height: height,
    backgroundColor: "#000",
  },
  offscreenContent: {
    position: "relative",
    // Permitir que o conteúdo se adapte às dimensões da imagem
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  // Estilos do Modal de Configurações
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  configSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  configRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  configInfo: {
    flex: 1,
    marginRight: 16,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  configDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  previewSection: {
    marginBottom: 40,
  },
  previewBox: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 12,
    padding: 16,
    minHeight: 150,
    position: "relative",
  },
  previewTime: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "300",
    marginBottom: 4,
  },
  previewDate: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
  },
  previewGPS: {
    color: "#fff",
    fontSize: 11,
    marginBottom: 2,
  },
  previewAccuracy: {
    color: "#fff",
    fontSize: 11,
    marginBottom: 2,
  },
  previewAddress: {
    color: "#fff",
    fontSize: 11,
    marginBottom: 8,
  },
  previewTech: {
    color: "#CCCCCC",
    fontSize: 9,
  },
  previewEmpty: {
    color: "#999",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  // Estilos para seleção de posição
  positionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
  },
  positionOption: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  positionOptionActive: {
    backgroundColor: "#e3f2fd",
    borderColor: "#4CAF50",
  },
  positionPreview: {
    width: 60,
    height: 40,
    backgroundColor: "#ddd",
    borderRadius: 4,
    marginBottom: 8,
    position: "relative",
  },
  positionDot: {
    width: 8,
    height: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 4,
    position: "absolute",
  },
  positionTopLeft: {
    top: 4,
    left: 4,
  },
  positionTopRight: {
    top: 4,
    right: 4,
  },
  positionBottomLeft: {
    bottom: 4,
    left: 4,
  },
  positionBottomRight: {
    bottom: 4,
    right: 4,
  },
  positionLabel: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  // Estilos para seletor de lentes
  lensSelector: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  lensSelectorTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  lensButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  lensButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    minWidth: 80,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  lensButtonActive: {
    backgroundColor: "rgba(76, 175, 80, 0.3)",
    borderColor: "#4CAF50",
  },
  lensButtonLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  lensButtonName: {
    color: "#ccc",
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
  },
});
