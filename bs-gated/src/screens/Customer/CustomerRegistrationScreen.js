// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   StatusBar,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";

// export default function CustomerRegistrationScreen({ navigation }) {
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");

//   const handleRegister = () => {
//     if (!name.trim()) {
//       Alert.alert("Validation", "Please enter customer name");
//       return;
//     }

//     if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
//       Alert.alert("Validation", "Please enter valid phone number");
//       return;
//     }

//     Alert.alert(
//       "Registration Successful",
//       "Wait for builder approval.",
//       [
//         {
//           text: "OK",
//           onPress: () =>
//             navigation.replace("CustomerHomeScreen", {
//               customer: {
//                 name: name.trim(),
//                 phone: phone.trim(),
//                 approvalStatus: "Pending",
//               },
//             }),
//         },
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

//       <View style={styles.header}>
//         <View style={styles.iconBox}>
//           <Ionicons name="person-add-outline" size={32} color="#FFFFFF" />
//         </View>

//         <Text style={styles.title}>Customer Registration</Text>
//         <Text style={styles.subtitle}>
//           Register to view builder projects and book visit slots
//         </Text>
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.label}>Customer Name</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter full name"
//           placeholderTextColor="#94A3B8"
//           value={name}
//           onChangeText={setName}
//         />

//         <Text style={styles.label}>Phone Number</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter phone number"
//           placeholderTextColor="#94A3B8"
//           value={phone}
//           onChangeText={setPhone}
//           keyboardType="phone-pad"
//           maxLength={10}
//         />

//         <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
//           <Text style={styles.registerText}>Register</Text>
//         </TouchableOpacity>

//         <Text style={styles.note}>
//           After registration, builder approval is required before booking.
//         </Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F3F4F6",
//   },
//   header: {
//     backgroundColor: "#0F172A",
//     paddingHorizontal: 20,
//     paddingVertical: 34,
//     borderBottomLeftRadius: 28,
//     borderBottomRightRadius: 28,
//     alignItems: "center",
//   },
//   iconBox: {
//     width: 70,
//     height: 70,
//     borderRadius: 24,
//     backgroundColor: "#2563EB",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 14,
//   },
//   title: {
//     color: "#FFFFFF",
//     fontSize: 25,
//     fontWeight: "900",
//   },
//   subtitle: {
//     color: "#CBD5E1",
//     fontSize: 13,
//     textAlign: "center",
//     marginTop: 8,
//     lineHeight: 20,
//   },
//   card: {
//     backgroundColor: "#FFFFFF",
//     margin: 16,
//     borderRadius: 24,
//     padding: 20,
//     elevation: 4,
//   },
//   label: {
//     color: "#0F172A",
//     fontSize: 13,
//     fontWeight: "900",
//     marginBottom: 8,
//     marginTop: 10,
//   },
//   input: {
//     height: 54,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     backgroundColor: "#F8FAFC",
//     paddingHorizontal: 14,
//     color: "#0F172A",
//     fontSize: 14,
//   },
//   registerBtn: {
//     height: 54,
//     borderRadius: 16,
//     backgroundColor: "#0F172A",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 22,
//   },
//   registerText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "900",
//   },
//   note: {
//     color: "#64748B",
//     textAlign: "center",
//     fontSize: 12,
//     lineHeight: 18,
//     marginTop: 14,
//   },
// });   


































import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function CustomerRegistrationScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleRegister = () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Please enter customer name");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      Alert.alert("Validation", "Please enter valid 10 digit phone number");
      return;
    }

    navigation.replace("CustomerHomeScreen", {
      customer: {
        name: name.trim(),
        phone: cleanPhone,
        approvalStatus: "Approved",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' }}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.iconBox}>
          <Ionicons name="person-add-outline" size={32} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Customer Registration</Text>
        <Text style={styles.subtitle}>
          Register to view builder projects and book visit slots
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Customer Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter full name"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor="#94A3B8"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          After registration, you can directly access the customer home screen.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5F5",
  },
  header: {
    backgroundColor: "#0D6E6E",
    paddingHorizontal: 20,
    paddingVertical: 34,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: "center",
  },
  iconBox: {
    width: 70,
    height: 70,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },
  subtitle: {
    color: "#CBD5E1",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 24,
    padding: 20,
    elevation: 4,
  },
  label: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    color: "#0F172A",
    fontSize: 14,
  },
  registerBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#1A7A7A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },
  registerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  note: {
    color: "#64748B",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
});
