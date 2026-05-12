// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import ScreenWrapper from '../../components/SAScreenWrapper';
// import AppHeader from '../../components/SAAppHeader';
// import COLORS from '../../theme/SAcolors';

// export default function NewAdminRequestScreen({ navigation }) {
//   return (
//     <ScreenWrapper>
//       <AppHeader
//         title="New Admin Request"
//         subtitle="Pending admin requests"
//         showBack
//         onBack={() => navigation.goBack()}
//       />

//       <View style={styles.container}>
//         <View style={styles.card}>
//           <Text style={styles.icon}>📭</Text>
//           <Text style={styles.title}>You have no request</Text>
//           <Text style={styles.subtitle}>
//             New admin requests will appear here.
//           </Text>

//           <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
//             <Text style={styles.buttonText}>Back</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     justifyContent: 'center',
//   },
//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: 18,
//     padding: 24,
//     alignItems: 'center',
//   },
//   icon: {
//     fontSize: 46,
//     marginBottom: 12,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: COLORS.text,
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: COLORS.subText || '#64748B',
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 18,
//   },
//   button: {
//     backgroundColor: COLORS.primaryNavy,
//     paddingHorizontal: 18,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   buttonText: {
//     color: COLORS.white,
//     fontWeight: '800',
//     fontSize: 14,
//   },
// });    
























// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   Alert,
// } from 'react-native';
// import ScreenWrapper from '../../components/SAScreenWrapper';
// import AppHeader from '../../components/SAAppHeader';
// import COLORS from '../../theme/SAcolors';
// import { useAppContext } from '../superadmin/SocietyContext';

// export default function NewAdminRequestScreen({ navigation }) {
//   const { adminRequests, approveAdminRequest, rejectAdminRequest } = useAppContext();

//   const pendingRequests = adminRequests || [];

//   const handleApprove = (item) => {
//     approveAdminRequest(item.id, 'Approved by Super Admin');
//     Alert.alert('Approved', `${item.name} is approved as admin.`);
//   };

//   const handleReject = (item) => {
//     rejectAdminRequest(item.id, 'Rejected by Super Admin');
//     Alert.alert('Rejected', `${item.name} admin request rejected.`);
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.requestCard}>
//       <Text style={styles.name}>{item.name}</Text>
//       <Text style={styles.info}>Society: {item.societyName || 'N/A'}</Text>
//       <Text style={styles.info}>Designation: {item.adminDesignation || 'N/A'}</Text>
//       <Text style={styles.info}>Email/Mobile: {item.emailOrMobile}</Text>
//       <Text style={styles.info}>Phone: {item.phone}</Text>

//       <View style={styles.statusBox}>
//         <Text style={styles.statusText}>Status: {item.approvalStatus}</Text>
//       </View>

//       {item.approvalStatus === 'Pending' && (
//         <View style={styles.actionRow}>
//           <TouchableOpacity
//             style={[styles.actionBtn, styles.approveBtn]}
//             onPress={() => handleApprove(item)}
//           >
//             <Text style={styles.actionText}>Approve</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionBtn, styles.rejectBtn]}
//             onPress={() => handleReject(item)}
//           >
//             <Text style={styles.actionText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );

//   return (
//     <ScreenWrapper>
//       <AppHeader
//         title="New Admin Request"
//         subtitle="Pending admin requests"
//         showBack
//         onBack={() => navigation.goBack()}
//       />

//       <FlatList
//         data={pendingRequests}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={styles.container}
//         ListEmptyComponent={
//           <View style={styles.card}>
//             <Text style={styles.icon}>📭</Text>
//             <Text style={styles.title}>You have no request</Text>
//             <Text style={styles.subtitle}>
//               New admin requests will appear here.
//             </Text>

//             <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
//               <Text style={styles.buttonText}>Back</Text>
//             </TouchableOpacity>
//           </View>
//         }
//       />
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     paddingBottom: 40,
//   },
//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: 18,
//     padding: 24,
//     alignItems: 'center',
//     marginTop: 80,
//   },
//   icon: {
//     fontSize: 46,
//     marginBottom: 12,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: COLORS.text,
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: COLORS.subText || '#64748B',
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 18,
//   },
//   button: {
//     backgroundColor: COLORS.primaryNavy,
//     paddingHorizontal: 18,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   buttonText: {
//     color: COLORS.white,
//     fontWeight: '800',
//     fontSize: 14,
//   },
//   requestCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   name: {
//     fontSize: 17,
//     fontWeight: '900',
//     color: COLORS.text,
//     marginBottom: 8,
//   },
//   info: {
//     fontSize: 13,
//     color: COLORS.subText || '#64748B',
//     marginBottom: 5,
//   },
//   statusBox: {
//     marginTop: 10,
//     backgroundColor: '#EFF6FF',
//     padding: 10,
//     borderRadius: 10,
//   },
//   statusText: {
//     color: COLORS.primaryNavy,
//     fontWeight: '800',
//   },
//   actionRow: {
//     flexDirection: 'row',
//     gap: 10,
//     marginTop: 14,
//   },
//   actionBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   approveBtn: {
//     backgroundColor: '#16A34A',
//   },
//   rejectBtn: {
//     backgroundColor: '#DC2626',
//   },
//   actionText: {
//     color: '#FFFFFF',
//     fontWeight: '900',
//   },
// }); 
















import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import COLORS from '../../theme/SAcolors';
import { useAppContext } from '../superadmin/SocietyContext';
import * as Sharing from 'expo-sharing';

export default function NewAdminRequestScreen({ navigation }) {
  const { adminRequests, approveAdminRequest, rejectAdminRequest } = useAppContext();

  const handleApprove = (item) => {
    approveAdminRequest(item.id, 'Approved by Super Admin');
    Alert.alert('Approved', `${item.name} is approved as admin.`);
  };

  const handleReject = (item) => {
    rejectAdminRequest(item.id, 'Rejected by Super Admin');
    Alert.alert('Rejected', `${item.name} admin request rejected.`);
  };

const openDocument = async (file) => {
  if (!file?.uri) {
    Alert.alert('Document Missing', 'This document file is not available.');
    return;
  }

  try {
    const canShare = await Sharing.isAvailableAsync();

    if (!canShare) {
      Alert.alert('Not Supported', 'Opening documents is not supported on this device.');
      return;
    }

    await Sharing.shareAsync(file.uri);
  } catch (error) {
    Alert.alert('Open Failed', 'Unable to open this document.');
  }
};

const renderDocument = (label, file) => (
  <TouchableOpacity
    style={styles.docRow}
    onPress={() => openDocument(file)}
    disabled={!file?.uri}
  >
    <Text style={styles.docLabel}>{label}</Text>
    <Text style={styles.docName}>
      {file?.name || 'Not uploaded'}
    </Text>
    <Text style={styles.openText}>
      {file?.uri ? 'Tap to open document' : 'File not available'}
    </Text>
  </TouchableOpacity>
);

  const renderItem = ({ item }) => (
    <View style={styles.requestCard}>
      <Text style={styles.name}>{item.name}</Text>

      <Text style={styles.info}>Society: {item.societyName || 'N/A'}</Text>
      <Text style={styles.info}>Designation: {item.adminDesignation || 'N/A'}</Text>
      <Text style={styles.info}>Email/Mobile: {item.emailOrMobile || 'N/A'}</Text>
      <Text style={styles.info}>Phone: {item.phone || 'N/A'}</Text>

      <View style={styles.statusBox}>
        <Text style={styles.statusText}>Status: {item.approvalStatus}</Text>
      </View>

      <View style={styles.docsBox}>
        <Text style={styles.docTitle}>Submitted Documents</Text>

        {renderDocument('Admin ID Proof', item.adminIdFile)}
        {renderDocument('Society Certificate', item.societyRegFile)}
        {renderDocument('Admin Address Proof', item.adminAddressProofFile)}
        {renderDocument('Supporting Document', item.supportingDocFile)}
      </View>

      {item.approvalStatus === 'Pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => handleApprove(item)}
          >
            <Text style={styles.actionText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleReject(item)}
          >
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScreenWrapper>
      <AppHeader
        title="New Admin Request"
        subtitle="Pending admin requests"
        showBack
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={adminRequests || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        ListEmptyComponent={
          <View style={styles.card}>
            <Text style={styles.icon}>📭</Text>
            <Text style={styles.title}>You have no request</Text>
            <Text style={styles.subtitle}>
              New admin requests will appear here.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginTop: 80,
  },
  icon: {
    fontSize: 46,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.subText || '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  button: {
    backgroundColor: COLORS.primaryNavy,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  name: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 8,
  },
  info: {
    fontSize: 13,
    color: COLORS.subText || '#64748B',
    marginBottom: 5,
  },
  statusBox: {
    marginTop: 10,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 10,
  },
  statusText: {
    color: COLORS.primaryNavy,
    fontWeight: '800',
  },
  docsBox: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 8,
  },
  docRow: {
    marginBottom: 8,
  },
  docLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },
  docName: {
    fontSize: 12,
    color: COLORS.subText || '#64748B',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: '#16A34A',
  },
  rejectBtn: {
    backgroundColor: '#DC2626',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '900',
  }, 

openText: {
  fontSize: 11,
  color: '#1E3A8A',
  marginTop: 6,
  fontWeight: '900',
  backgroundColor: '#DBEAFE',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  alignSelf: 'flex-start',
},
});


































