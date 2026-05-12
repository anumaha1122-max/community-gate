
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Platform,
  Alert,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

import BuilderBottomNav from "../BuilderBottomNav";
import { useAppContext } from "../../superadmin/SocietyContext";

const COLORS = {
  navy: "#1A7A7A",
  navy2: "#1A7A7A",
  white: "#FFFFFF",
  bg: "#E8F5F5",
  card: "#FFFFFF",
  text: "#111827",
  sub: "#6B7280",
  border: "#E5E7EB",
  purple: "#7C6CEB",
  purpleSoft: "#EEEAFE",
  purpleBorder: "#DDD6FE",
  blueSoft: "#E0F2FE",
  blueText: "#0369A1",
  greenSoft: "#DCFCE7",
  greenText: "#15803D",
  orangeSoft: "#FFEDD5",
  orangeText: "#C2410C",
  redSoft: "#FEE2E2",
  redText: "#B91C1C",
  chipBg: "#F8FAFC",
  gold: "#C9A84C",
};

const DEFAULT_UNIT_IMAGE =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";

const BHK_OPTIONS = ["1 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK"];
const FLOOR_OPTIONS = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
const FACING_OPTIONS = ["East", "West", "North", "South", "North-East", "South-East"];
const STATUS_OPTIONS = ["Available", "Hold", "Sold", "Booked"];
const UNIT_TYPE_OPTIONS = ["Apartment", "Penthouse", "Duplex", "Villa Unit", "Studio"];
const PDF_TYPE_OPTIONS = ["Project Brochure", "Unit Plan PDF", "Cost Sheet", "Legal PDF"];

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function Header({ navigation, projectName }) {
  return (
    <View style={styles.headerWrap}>
      <SafeAreaView>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.brandBox}>
              <MaterialCommunityIcons
                name="view-grid-plus-outline"
                size={20}
                color={COLORS.white}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.brandTitle}>Unit Inventory</Text>
              <Text style={styles.brandSub} numberOfLines={1}>
                {projectName ? `Project: ${projectName}` : "Project & Unit Management"}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  required = false,
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {required ? " *" : ""}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.sub}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.textArea]}
      />
    </View>
  );
}

function SelectField({
  label,
  value,
  options,
  onSelect,
  placeholder,
  required = false,
  openKey,
  activeOpenKey,
  setActiveOpenKey,
}) {
  const isOpen = activeOpenKey === openKey;

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {required ? " *" : ""}
      </Text>

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.selectBox}
        onPress={() => setActiveOpenKey(isOpen ? null : openKey)}
      >
        <Text style={[styles.selectText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={COLORS.sub}
        />
      </TouchableOpacity>

      {isOpen ? (
        <View style={styles.dropdownMenu}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
            {options.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(item);
                  setActiveOpenKey(null);
                }}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
                {value === item ? (
                  <Ionicons name="checkmark" size={18} color={COLORS.purple} />
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function DateField({ label, value, placeholder, onPress }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity activeOpacity={0.9} style={styles.selectBox} onPress={onPress}>
        <Text style={[styles.selectText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={COLORS.sub} />
      </TouchableOpacity>
    </View>
  );
}

function StatCard({ title, value, valueColor }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

export default function UnitInventory({ navigation, route }) {
  const {
    builderProjects = [],
    addUnitToProject,
    updateUnitInProject,
    deleteUnitFromProject,
  } = useAppContext();

  const passedProject = route?.params?.project || null;

  const approvedProjects = useMemo(() => {
    const approved = builderProjects.filter(
      (p) => p.approvalStatus === "Approved"
    );

    if (
      passedProject?.approvalStatus === "Approved" &&
      !approved.some((p) => p.id === passedProject.id)
    ) {
      return [passedProject, ...approved];
    }

    return approved;
  }, [builderProjects, passedProject]);

  const [selectedProjectId, setSelectedProjectId] = useState(
    passedProject?.id || approvedProjects[0]?.id || null
  );

  const selectedProject = useMemo(() => {
    return (
      approvedProjects.find((p) => p.id === selectedProjectId) ||
      approvedProjects[0] ||
      null
    );
  }, [approvedProjects, selectedProjectId]);

  const units = selectedProject?.units || [];

  const [tower, setTower] = useState("Tower A");
  const [unitNumber, setUnitNumber] = useState("");
  const [unitType, setUnitType] = useState("Apartment");
  const [bhkType, setBhkType] = useState("3 BHK");
  const [floor, setFloor] = useState("1");
  const [facing, setFacing] = useState("East");
  const [superBuiltupArea, setSuperBuiltupArea] = useState("");
  const [carpetArea, setCarpetArea] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Available");
  const [holdUntil, setHoldUntil] = useState(null);
  const [floorPlanName, setFloorPlanName] = useState("");
  const [floorPlanUri, setFloorPlanUri] = useState("");
  const [floorPlanMimeType, setFloorPlanMimeType] = useState("");
  const [pdfType, setPdfType] = useState("Unit Plan PDF");
  const [pdfName, setPdfName] = useState("");
  const [pdfUri, setPdfUri] = useState("");
  const [pdfMimeType, setPdfMimeType] = useState("");
  const [description, setDescription] = useState("");
  const [unitImage, setUnitImage] = useState(DEFAULT_UNIT_IMAGE);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const filteredUnits = useMemo(() => {
    const q = search.toLowerCase();

    return units.filter((item) => {
      const no = item.unitNumber || item.unitNo || item.flatNo || "";
      const bhk = item.bhkType || item.type || "";
      const unitStatus = item.status || "";
      const unitTower = item.tower || "";

      return (
        no.toLowerCase().includes(q) ||
        bhk.toLowerCase().includes(q) ||
        unitStatus.toLowerCase().includes(q) ||
        unitTower.toLowerCase().includes(q)
      );
    });
  }, [units, search]);

  const totalUnits = units.length;
  const availableUnits = units.filter((u) => u.status === "Available").length;
  const holdUnits = units.filter((u) => u.status === "Hold").length;

  const towerOptions = useMemo(() => {
    const count = parseInt(selectedProject?.towerCount || "1", 10);
    const labels = ["A", "B", "C", "D", "E", "F", "G", "H"];
    return Array.from({ length: Math.min(count, 8) }, (_, i) => `Tower ${labels[i]}`);
  }, [selectedProject]);

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  const pickUnitImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showMessage("Photo permission is needed.", "error");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setUnitImage(result.assets[0].uri);
        showMessage("Unit image selected.", "success");
      }
    } catch {
      showMessage("Unable to pick image.", "error");
    }
  };

  const pickFloorPlanFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset) {
        showMessage("No floor plan selected.", "error");
        return;
      }

      setFloorPlanName(asset.name || "floor-plan.pdf");
      setFloorPlanUri(asset.uri || "");
      setFloorPlanMimeType(asset.mimeType || "application/pdf");
      showMessage("Floor plan uploaded.", "success");
    } catch {
      showMessage("Unable to upload floor plan.", "error");
    }
  };

  const pickUnitPdfFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset) {
        showMessage("No PDF file selected.", "error");
        return;
      }

      setPdfName(asset.name || "unit-document.pdf");
      setPdfUri(asset.uri || "");
      setPdfMimeType(asset.mimeType || "application/pdf");
      showMessage("Unit PDF uploaded.", "success");
    } catch {
      showMessage("Unable to upload unit PDF.", "error");
    }
  };

  const openFile = async (uri) => {
    if (!uri) {
      Alert.alert("File not available", "No file path stored.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(uri);

      if (supported) {
        await Linking.openURL(uri);
      } else {
        Alert.alert("Cannot open file", "This file cannot be opened on this device.");
      }
    } catch {
      Alert.alert("Error", "Unable to open the selected file.");
    }
  };

  const resetForm = () => {
    setTower(towerOptions[0] || "Tower A");
    setUnitNumber("");
    setUnitType("Apartment");
    setBhkType("3 BHK");
    setFloor("1");
    setFacing("East");
    setSuperBuiltupArea("");
    setCarpetArea("");
    setPrice("");
    setStatus("Available");
    setHoldUntil(null);
    setFloorPlanName("");
    setFloorPlanUri("");
    setFloorPlanMimeType("");
    setPdfType("Unit Plan PDF");
    setPdfName("");
    setPdfUri("");
    setPdfMimeType("");
    setDescription("");
    setUnitImage(DEFAULT_UNIT_IMAGE);
    setEditingId(null);
    setActiveDropdown(null);
  };

  const saveUnit = () => {
    if (!selectedProject) {
      showMessage("No approved project selected.", "error");
      return;
    }

    if (!unitNumber.trim() || !bhkType || !floor || !price.trim()) {
      showMessage("Please fill all required unit details.", "error");
      return;
    }

    const payload = {
      id: editingId || `UNIT-${Date.now()}`,
      projectId: selectedProject.id,
      projectName: selectedProject.name || selectedProject.projectName,
      tower,
      unitNumber: unitNumber.trim(),
      unitNo: unitNumber.trim(),
      flatNo: unitNumber.trim(),
      name: unitNumber.trim(),
      unitType,
      type: bhkType,
      bhkType,
      floor,
      facing,
      superBuiltupArea: superBuiltupArea.trim(),
      carpetArea: carpetArea.trim(),
      size: superBuiltupArea.trim() || carpetArea.trim(),
      area: superBuiltupArea.trim() || carpetArea.trim(),
      price: price.trim(),
      status,
      holdUntil: holdUntil ? formatDate(holdUntil) : "",
      floorPlanName,
      floorPlanUri,
      floorPlanMimeType,
      pdfType,
      pdfName,
      pdfUri,
      pdfMimeType,
      description: description.trim(),
      unitImage,
      images: unitImage ? [unitImage] : [],
      customerVisible: true,
      createdAt: editingId
        ? units.find((u) => u.id === editingId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      updateUnitInProject(selectedProject.id, editingId, payload);
      showMessage("✅ Unit updated successfully.", "success");
    } else {
      addUnitToProject(selectedProject.id, payload);
      showMessage("✅ Unit created and linked to project setup.", "success");
    }

    resetForm();
  };

  const editUnit = (item) => {
    setTower(item.tower || "Tower A");
    setUnitNumber(item.unitNumber || item.unitNo || item.flatNo || "");
    setUnitType(item.unitType || "Apartment");
    setBhkType(item.bhkType || item.type || "3 BHK");
    setFloor(item.floor || "1");
    setFacing(item.facing || "East");
    setSuperBuiltupArea(item.superBuiltupArea || "");
    setCarpetArea(item.carpetArea || "");
    setPrice(item.price || "");
    setStatus(item.status || "Available");
    setHoldUntil(item.holdUntil ? new Date(item.holdUntil) : null);
    setFloorPlanName(item.floorPlanName || "");
    setFloorPlanUri(item.floorPlanUri || "");
    setFloorPlanMimeType(item.floorPlanMimeType || "");
    setPdfType(item.pdfType || "Unit Plan PDF");
    setPdfName(item.pdfName || "");
    setPdfUri(item.pdfUri || "");
    setPdfMimeType(item.pdfMimeType || "");
    setDescription(item.description || "");
    setUnitImage(item.unitImage || DEFAULT_UNIT_IMAGE);
    setEditingId(item.id);
    showMessage("Editing unit — make changes and save.", "info");
  };

  const deleteUnit = (id) => {
    Alert.alert("Delete Unit", "Are you sure you want to remove this unit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (!selectedProject) return;

          deleteUnitFromProject(selectedProject.id, id);

          if (editingId === id) resetForm();

          showMessage("Unit removed.", "info");
        },
      },
    ]);
  };

  const renderStatusPill = (value) => {
    let bg = COLORS.greenSoft;
    let color = COLORS.greenText;

    if (value === "Hold") {
      bg = COLORS.orangeSoft;
      color = COLORS.orangeText;
    } else if (value === "Sold" || value === "Booked") {
      bg = COLORS.redSoft;
      color = COLORS.redText;
    }

    return (
      <View style={[styles.statusPill, { backgroundColor: bg }]}>
        <Text style={[styles.statusPillText, { color }]}>{value}</Text>
      </View>
    );
  };

  const msgBg =
    messageType === "success"
      ? "#ECFDF5"
      : messageType === "error"
      ? "#FEF2F2"
      : COLORS.purpleSoft;

  const msgBorder =
    messageType === "success"
      ? "#A7F3D0"
      : messageType === "error"
      ? "#FECACA"
      : COLORS.purpleBorder;

  const msgColor =
    messageType === "success"
      ? COLORS.greenText
      : messageType === "error"
      ? COLORS.redText
      : COLORS.purple;

  const msgIcon =
    messageType === "success"
      ? "checkmark-circle-outline"
      : messageType === "error"
      ? "alert-circle-outline"
      : "information-circle-outline";

  if (approvedProjects.length === 0) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} projectName={null} />

        <View style={styles.noProjectWrap}>
          <View style={styles.noProjectCard}>
            <MaterialCommunityIcons name="lock-outline" size={48} color={COLORS.sub} />
            <Text style={styles.noProjectTitle}>No Approved Projects</Text>
            <Text style={styles.noProjectSub}>
              Unit inventory is only available for projects approved by Super Admin.
            </Text>

            <TouchableOpacity
              style={styles.noProjectBtn}
              onPress={() => navigation.navigate("BuilderProjectCreation")}
            >
              <Ionicons name="add-circle-outline" size={18} color={COLORS.white} />
              <Text style={styles.noProjectBtnText}>Go to Project Creation</Text>
            </TouchableOpacity>
          </View>
        </View>

        <BuilderBottomNav navigation={navigation} activeRoute="BuilderUnitInventory" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        navigation={navigation}
        projectName={selectedProject?.name || selectedProject?.projectName}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {approvedProjects.length > 1 && (
          <View style={styles.projectSelectorWrap}>
            <Text style={styles.selectorLabel}>Select Project</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.projectSelectorRow}
            >
              {approvedProjects.map((p) => {
                const active = p.id === selectedProject?.id;

                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.projectPill, active && styles.projectPillActive]}
                    onPress={() => {
                      setSelectedProjectId(p.id);
                      resetForm();
                    }}
                  >
                    <View style={[styles.projectDot, active && styles.projectDotActive]} />
                    <Text
                      style={[styles.projectPillText, active && styles.projectPillTextActive]}
                    >
                      {p.name || p.projectName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.approvedStrip}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.greenText} />
          <Text style={styles.approvedStripText}>
            <Text style={{ fontWeight: "900" }}>
              {selectedProject?.name || selectedProject?.projectName}
            </Text>{" "}
            is approved — units added here will show in Project Setup.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard title="Units" value={String(totalUnits)} />
          <StatCard
            title="Available"
            value={String(availableUnits)}
            valueColor={COLORS.greenText}
          />
          <StatCard title="On Hold" value={String(holdUnits)} valueColor={COLORS.purple} />
        </View>

        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{editingId ? "Edit Unit" : "Add New Unit"}</Text>
            <Text style={styles.sectionSub}>
              Units are linked to{" "}
              <Text style={{ fontWeight: "900", color: COLORS.text }}>
                {selectedProject?.name || selectedProject?.projectName}
              </Text>
              .
            </Text>
          </View>

          {message ? (
            <View
              style={[
                styles.messageBox,
                { backgroundColor: msgBg, borderColor: msgBorder },
              ]}
            >
              <Ionicons name={msgIcon} size={18} color={msgColor} />
              <Text style={[styles.messageText, { color: msgColor }]}>{message}</Text>
              <TouchableOpacity onPress={() => setMessage("")}>
                <Ionicons name="close" size={16} color={msgColor} />
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.imageCard}>
            <Image source={{ uri: unitImage || DEFAULT_UNIT_IMAGE }} style={styles.coverImage} />

            <View style={styles.imageOverlayTop}>
              <View style={styles.selectedIconBadge}>
                <MaterialCommunityIcons
                  name="home-city-outline"
                  size={22}
                  color={COLORS.white}
                />
              </View>
              {renderStatusPill(status)}
            </View>

            <View style={styles.customerVisibleBadge}>
              <Ionicons name="eye-outline" size={13} color={COLORS.greenText} />
              <Text style={styles.customerVisibleText}>Customer Visible</Text>
            </View>

            <TouchableOpacity style={styles.uploadImageBtn} onPress={pickUnitImage}>
              <Ionicons name="cloud-upload-outline" size={18} color={COLORS.white} />
              <Text style={styles.uploadImageBtnText}>Upload Image</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <SelectField
                label="Tower"
                value={tower}
                options={towerOptions.length ? towerOptions : ["Tower A", "Tower B"]}
                onSelect={setTower}
                placeholder="Select tower"
                required
                openKey="tower"
                activeOpenKey={activeDropdown}
                setActiveOpenKey={setActiveDropdown}
              />
            </View>

            <View style={styles.half}>
              <InputField
                label="Unit Number"
                value={unitNumber}
                onChangeText={setUnitNumber}
                placeholder="e.g. A-1201"
                required
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <SelectField
                label="Unit Type"
                value={unitType}
                options={UNIT_TYPE_OPTIONS}
                onSelect={setUnitType}
                placeholder="Select type"
                openKey="unitType"
                activeOpenKey={activeDropdown}
                setActiveOpenKey={setActiveDropdown}
              />
            </View>

            <View style={styles.half}>
              <SelectField
                label="BHK Type"
                value={bhkType}
                options={BHK_OPTIONS}
                onSelect={setBhkType}
                placeholder="Select BHK"
                required
                openKey="bhk"
                activeOpenKey={activeDropdown}
                setActiveOpenKey={setActiveDropdown}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <SelectField
                label="Floor"
                value={floor}
                options={FLOOR_OPTIONS}
                onSelect={setFloor}
                placeholder="Select floor"
                required
                openKey="floor"
                activeOpenKey={activeDropdown}
                setActiveOpenKey={setActiveDropdown}
              />
            </View>

            <View style={styles.half}>
              <SelectField
                label="Facing"
                value={facing}
                options={FACING_OPTIONS}
                onSelect={setFacing}
                placeholder="Select facing"
                openKey="facing"
                activeOpenKey={activeDropdown}
                setActiveOpenKey={setActiveDropdown}
              />
            </View>
          </View>

          <SelectField
            label="Unit Status"
            value={status}
            options={STATUS_OPTIONS}
            onSelect={setStatus}
            placeholder="Select status"
            openKey="status"
            activeOpenKey={activeDropdown}
            setActiveOpenKey={setActiveDropdown}
          />

          {status === "Hold" ? (
            <DateField
              label="Hold Until"
              value={formatDate(holdUntil)}
              placeholder="Select hold date"
              onPress={() => {
                setActiveDropdown(null);
                setShowDatePicker(true);
              }}
            />
          ) : null}

          <View style={styles.row}>
            <View style={styles.half}>
              <InputField
                label="Super Built-up Area"
                value={superBuiltupArea}
                onChangeText={setSuperBuiltupArea}
                placeholder="e.g. 1850 sq.ft"
              />
            </View>

            <View style={styles.half}>
              <InputField
                label="Carpet Area"
                value={carpetArea}
                onChangeText={setCarpetArea}
                placeholder="e.g. 1420 sq.ft"
              />
            </View>
          </View>

          <InputField
            label="Price Per Unit"
            value={price}
            onChangeText={setPrice}
            placeholder="e.g. ₹1.45 Cr"
            required
          />

          <View style={styles.uploadCard}>
            <View style={styles.uploadHeaderRow}>
              <Text style={styles.uploadTitle}>Floor Plan PDF</Text>
              <TouchableOpacity style={styles.smallUploadBtn} onPress={pickFloorPlanFile}>
                <Ionicons name="document-attach-outline" size={16} color={COLORS.white} />
                <Text style={styles.smallUploadBtnText}>Upload</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.uploadMeta}>{floorPlanName || "No floor plan selected"}</Text>

            {!!floorPlanUri && (
              <TouchableOpacity
                style={styles.previewFileBtn}
                onPress={() => openFile(floorPlanUri)}
              >
                <Ionicons name="eye-outline" size={16} color={COLORS.blueText} />
                <Text style={styles.previewFileBtnText}>View Floor Plan</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <SelectField
                label="PDF Type"
                value={pdfType}
                options={PDF_TYPE_OPTIONS}
                onSelect={setPdfType}
                placeholder="Select PDF type"
                openKey="pdfType"
                activeOpenKey={activeDropdown}
                setActiveOpenKey={setActiveDropdown}
              />
            </View>

            <View style={styles.half}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Unit PDF</Text>
                <TouchableOpacity style={styles.selectBox} onPress={pickUnitPdfFile}>
                  <Text style={[styles.selectText, !pdfName && styles.placeholderText]}>
                    {pdfName || "Upload PDF"}
                  </Text>
                  <Ionicons name="cloud-upload-outline" size={18} color={COLORS.sub} />
                </TouchableOpacity>

                {!!pdfUri && (
                  <TouchableOpacity
                    style={styles.previewFileBtn}
                    onPress={() => openFile(pdfUri)}
                  >
                    <Ionicons name="eye-outline" size={16} color={COLORS.blueText} />
                    <Text style={styles.previewFileBtnText}>View PDF</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <InputField
            label="Unit Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter unit highlights and notes"
            multiline
          />

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.primaryBtn} onPress={saveUnit}>
              <Ionicons name="save-outline" size={18} color={COLORS.white} />
              <Text style={styles.primaryBtnText}>
                {editingId ? "Update Unit" : "Save Unit"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={resetForm}>
              <Feather name="rotate-ccw" size={17} color={COLORS.text} />
              <Text style={styles.secondaryBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Created Units
              {totalUnits > 0 && <Text style={{ color: COLORS.purple }}> ({totalUnits})</Text>}
            </Text>
            <Text style={styles.sectionSub}>
              These units are saved inside the selected project.
            </Text>
          </View>

          <View style={styles.searchBox}>
            <Feather name="search" size={18} color={COLORS.sub} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search unit, BHK, status, tower..."
              placeholderTextColor={COLORS.sub}
              style={styles.searchInput}
            />
          </View>

          {filteredUnits.map((item) => (
            <View key={item.id} style={styles.unitCard}>
              <Image
                source={{ uri: item.unitImage || DEFAULT_UNIT_IMAGE }}
                style={styles.unitThumb}
              />

              <View style={styles.unitCustomerTag}>
                <Ionicons name="eye-outline" size={12} color={COLORS.greenText} />
                <Text style={styles.unitCustomerTagText}>Customer Visible</Text>
              </View>

              <View style={styles.unitBody}>
                <View style={styles.unitHeaderRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <View style={styles.unitTitleRow}>
                      <MaterialCommunityIcons
                        name="home-city-outline"
                        size={20}
                        color={COLORS.purple}
                      />
                      <Text style={styles.unitTitle}>
                        {item.unitNumber || item.unitNo || item.flatNo}
                      </Text>
                    </View>

                    <Text style={styles.unitMeta}>{item.projectName}</Text>
                    <Text style={styles.unitMeta}>
                      {item.tower} • Floor {item.floor} • {item.facing} Facing
                    </Text>
                    <Text style={styles.unitMeta}>
                      {item.bhkType || item.type} • {item.unitType}
                    </Text>
                  </View>

                  {renderStatusPill(item.status)}
                </View>

                <View style={styles.badgeRow}>
                  {!!item.superBuiltupArea && (
                    <View style={styles.infoBadge}>
                      <Text style={styles.infoBadgeText}>SBA: {item.superBuiltupArea}</Text>
                    </View>
                  )}

                  {!!item.carpetArea && (
                    <View style={styles.infoBadge}>
                      <Text style={styles.infoBadgeText}>Carpet: {item.carpetArea}</Text>
                    </View>
                  )}

                  {!!item.price && (
                    <View style={[styles.infoBadge, styles.priceBadge]}>
                      <Text
                        style={[
                          styles.infoBadgeText,
                          { color: COLORS.greenText, fontWeight: "900" },
                        ]}
                      >
                        {item.price}
                      </Text>
                    </View>
                  )}
                </View>

                {!!item.description && (
                  <Text style={styles.unitDescription}>{item.description}</Text>
                )}

                <View style={styles.cardActionRow}>
                  <TouchableOpacity style={styles.cardActionBtn} onPress={() => editUnit(item)}>
                    <Feather name="edit-2" size={16} color={COLORS.purple} />
                    <Text style={styles.cardActionBtnText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cardActionBtn}
                    onPress={() => deleteUnit(item.id)}
                  >
                    <Feather name="trash-2" size={16} color={COLORS.redText} />
                    <Text style={[styles.cardActionBtnText, { color: COLORS.redText }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {filteredUnits.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={30} color={COLORS.sub} />
              <Text style={styles.emptyTitle}>No units yet</Text>
              <Text style={styles.emptySub}>
                Add your first unit above. It will show in Project Setup.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {showDatePicker ? (
        <DateTimePicker
          value={holdUntil || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selectedDate) => {
            if (Platform.OS !== "ios") setShowDatePicker(false);
            if (selectedDate) setHoldUntil(selectedDate);
          }}
        />
      ) : null}

      <BuilderBottomNav navigation={navigation} activeRoute="BuilderUnitInventory" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  headerWrap: {
    backgroundColor: COLORS.navy,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 18,
  },
  headerTop: {
    marginTop: 30,
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  brandBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.navy2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  brandTitle: { color: COLORS.white, fontSize: 20, fontWeight: "800" },
  brandSub: { color: "rgba(255,255,255,0.72)", fontSize: 12, marginTop: 2 },

  content: { padding: 16, paddingBottom: 100 },

  noProjectWrap: { flex: 1, justifyContent: "center", padding: 20 },
  noProjectCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  noProjectTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  noProjectSub: {
    color: COLORS.sub,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  noProjectBtn: {
    height: 50,
    backgroundColor: COLORS.navy,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 6,
  },
  noProjectBtnText: { color: COLORS.white, fontWeight: "900", fontSize: 14 },

  projectSelectorWrap: { marginBottom: 12 },
  selectorLabel: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  projectSelectorRow: { gap: 8, paddingBottom: 4 },
  projectPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  projectPillActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  projectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  projectDotActive: { backgroundColor: COLORS.gold },
  projectPillText: { color: COLORS.text, fontSize: 13, fontWeight: "800" },
  projectPillTextActive: { color: COLORS.white },

  approvedStrip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.greenSoft,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  approvedStripText: {
    color: COLORS.greenText,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    lineHeight: 18,
  },

  statsRow: { flexDirection: "row", marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  statValue: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  statTitle: { marginTop: 6, fontSize: 12, color: COLORS.sub, fontWeight: "600" },

  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
    zIndex: 5,
  },
  listCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  sectionHeader: { marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  sectionSub: { color: COLORS.sub, fontSize: 13, marginTop: 4, lineHeight: 20 },

  messageBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
  },
  messageText: { fontWeight: "700", flex: 1, lineHeight: 18 },

  imageCard: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  coverImage: { width: "100%", height: 200 },
  imageOverlayTop: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  customerVisibleBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: COLORS.greenSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  customerVisibleText: { color: COLORS.greenText, fontSize: 11, fontWeight: "800" },
  uploadImageBtn: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  uploadImageBtnText: {
    color: COLORS.white,
    fontWeight: "800",
    marginLeft: 6,
  },

  inputGroup: { marginBottom: 14, zIndex: 20 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 14,
  },

  row: { flexDirection: "row", gap: 12, zIndex: 30 },
  half: { flex: 1, zIndex: 30 },

  selectBox: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { color: COLORS.text, fontSize: 14, flex: 1, marginRight: 8 },
  placeholderText: { color: COLORS.sub },
  dropdownMenu: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    overflow: "hidden",
    elevation: 3,
  },
  dropdownItem: {
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownItemText: {
    color: COLORS.text,
    fontSize: 14,
    flex: 1,
    paddingRight: 8,
  },

  uploadCard: {
    backgroundColor: COLORS.chipBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  uploadHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploadTitle: { fontSize: 15, fontWeight: "800", color: COLORS.text },
  uploadMeta: { marginTop: 8, color: COLORS.sub, fontSize: 13 },
  smallUploadBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  smallUploadBtnText: {
    color: COLORS.white,
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 12,
  },
  previewFileBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blueSoft,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  previewFileBtnText: {
    color: COLORS.blueText,
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 12,
  },

  actionRow: { flexDirection: "row", marginTop: 6 },
  primaryBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.purple,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    gap: 8,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: "800" },
  secondaryBtn: {
    width: 110,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secondaryBtnText: { color: COLORS.text, fontWeight: "700" },

  searchBox: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  searchInput: { flex: 1, color: COLORS.text, marginLeft: 8 },

  unitCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 14,
    position: "relative",
  },
  unitThumb: { width: "100%", height: 180 },
  unitCustomerTag: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: COLORS.greenSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  unitCustomerTagText: {
    color: COLORS.greenText,
    fontSize: 10,
    fontWeight: "800",
  },
  unitBody: { padding: 14 },
  unitHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  unitTitleRow: { flexDirection: "row", alignItems: "center" },
  unitTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  unitMeta: { color: COLORS.sub, fontSize: 13, marginTop: 5 },

  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusPillText: { fontSize: 12, fontWeight: "800" },

  badgeRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  infoBadge: {
    backgroundColor: COLORS.chipBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  priceBadge: { backgroundColor: COLORS.greenSoft, borderColor: "#A7F3D0" },
  infoBadgeText: { color: COLORS.sub, fontWeight: "700", fontSize: 12 },

  unitDescription: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },

  cardActionRow: { flexDirection: "row", marginTop: 12 },
  cardActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
  },
  cardActionBtnText: {
    color: COLORS.purple,
    fontWeight: "700",
    marginLeft: 6,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  emptySub: {
    fontSize: 13,
    color: COLORS.sub,
    textAlign: "center",
    lineHeight: 20,
  },
});