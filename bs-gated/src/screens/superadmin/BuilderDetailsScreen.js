// import React, { useState } from 'react';
// import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
// import ScreenWrapper from '../../components/SAScreenWrapper';
// import AppHeader from '../../components/SAAppHeader';
// import SectionHeader from '../../components/SASectionHeader';
// import COLORS from '../../theme/SAcolors';
// import SPACING from '../../theme/spacing';
// import { useAppContext } from './SocietyContext';

// function getStatusStyle(status) {
//   switch (status) {
//     case 'Approved':
//       return { bg: '#E9F8EE', color: COLORS.success };
//     case 'Rejected':
//       return { bg: '#FFE9E9', color: COLORS.danger };
//     case 'Pending':
//     default:
//       return { bg: '#FFF4E6', color: COLORS.warning };
//   }
// }

// export default function BuilderDetailsScreen({ navigation, route }) {
//   const { approveBuilder, rejectBuilder } = useAppContext();
//   const builder = route.params?.builder;
//   const [status, setStatus] = useState(builder?.status || 'Pending');
//   const [approvalReason, setApprovalReason] = useState('');
//   const [rejectionReason, setRejectionReason] = useState('');
//   const [requestDocsReason, setRequestDocsReason] = useState('');
//   const [lastActionNote, setLastActionNote] = useState('');

//   const documents = builder?.documents || [];

//   if (!builder) return null;

//   const statusStyle = getStatusStyle(status);

//   const handleApprove = () => {
//     if (!approvalReason.trim()) {
//       alert('Please enter approval reason');
//       return;
//     }

//     approveBuilder(builder.id);
//     setStatus('Approved');
//     setLastActionNote(`Approved reason: ${approvalReason}`);
//     alert(`Builder approved successfully.\nReason: ${approvalReason}`);
//     navigation.goBack();
//   };

//   const handleReject = () => {
//     if (!rejectionReason.trim()) {
//       alert('Please enter rejection reason');
//       return;
//     }

//     rejectBuilder(builder.id);
//     setStatus('Rejected');
//     setLastActionNote(`Rejected reason: ${rejectionReason}`);
//     alert(`Builder rejected successfully.\nReason: ${rejectionReason}`);
//     navigation.goBack();
//   };

//   const handleRequestDocs = () => {
//     if (!requestDocsReason.trim()) {
//       alert('Please enter reason for requesting more documents');
//       return;
//     }

//     setLastActionNote(`More documents requested: ${requestDocsReason}`);
//     alert(`More documents requested.\nReason: ${requestDocsReason}`);
//     setRequestDocsReason('');
//   };

//   return (
//     <ScreenWrapper>
//       <AppHeader
//         title={builder.name}
//         subtitle={`RERA: ${builder.rera}`}
//         showBack
//         onBack={() => navigation.goBack()}
//       />

//       <ScrollView showsVerticalScrollIndicator={false}>
//         <View style={styles.card}>
//           <Text style={styles.label}>City</Text>
//           <Text style={styles.value}>{builder.city}</Text>

//           <Text style={styles.label}>Active Projects</Text>
//           <Text style={styles.value}>{builder.projects}</Text>

//           <Text style={styles.label}>Collections</Text>
//           <Text style={styles.value}>{builder.collections}</Text>

//           <Text style={styles.label}>Status</Text>
//           <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
//             <Text style={[styles.statusText, { color: statusStyle.color }]}>{status}</Text>
//           </View>

//           {lastActionNote ? (
//             <>
//               <Text style={styles.label}>Latest Action Note</Text>
//               <Text style={styles.noteText}>{lastActionNote}</Text>
//             </>
//           ) : null}
//         </View>

//         <SectionHeader title="Documents" />
//         <View style={styles.card}>
//           {documents.length > 0 ? (
//             documents.map((doc, index) => (
//               <Text key={index} style={styles.docText}>{`\u2022 ${doc}`}</Text>
//             ))
//           ) : (
//             <Text style={styles.value}>No documents available</Text>
//           )}
//         </View>

//         <SectionHeader title="Approve Builder" />
//         <View style={styles.card}>
//           <Text style={styles.reasonLabel}>Approval Reason</Text>
//           <TextInput
//             style={[styles.inputField, styles.reasonInput]}
//             placeholder="Enter reason for approval"
//             value={approvalReason}
//             onChangeText={setApprovalReason}
//             multiline
//             placeholderTextColor={COLORS.subText}
//           />
//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
//             onPress={handleApprove}
//           >
//             <Text style={styles.actionBtnText}>Approve</Text>
//           </TouchableOpacity>
//         </View>

//         <SectionHeader title="Reject Builder" />
//         <View style={styles.card}>
//           <Text style={styles.reasonLabel}>Rejection Reason</Text>
//           <TextInput
//             style={[styles.inputField, styles.reasonInput]}
//             placeholder="Enter reason for rejection"
//             value={rejectionReason}
//             onChangeText={setRejectionReason}
//             multiline
//             placeholderTextColor={COLORS.subText}
//           />
//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: COLORS.danger }]}
//             onPress={handleReject}
//           >
//             <Text style={styles.actionBtnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>

//         <SectionHeader title="Request More Documents" />
//         <View style={styles.card}>
//           <Text style={styles.reasonLabel}>Reason</Text>
//           <TextInput
//             style={[styles.inputField, styles.reasonInput]}
//             placeholder="Enter reason for requesting more documents"
//             value={requestDocsReason}
//             onChangeText={setRequestDocsReason}
//             multiline
//             placeholderTextColor={COLORS.subText}
//           />
//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: COLORS.primaryNavy }]}
//             onPress={handleRequestDocs}
//           >
//             <Text style={styles.actionBtnText}>Request More Docs</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     marginHorizontal: SPACING.lg,
//     backgroundColor: COLORS.white,
//     borderRadius: SPACING.radiusMd,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: SPACING.md,
//     marginBottom: SPACING.md,
//   },
//   label: {
//     fontSize: 12,
//     color: COLORS.subText,
//     fontWeight: '700',
//     marginTop: 8,
//   },
//   value: {
//     fontSize: 16,
//     color: COLORS.text,
//     fontWeight: '800',
//     marginTop: 4,
//   },
//   docText: {
//     fontSize: 15,
//     color: COLORS.text,
//     fontWeight: '700',
//     marginBottom: 8,
//   },
//   inputField: {
//     marginBottom: 10,
//     padding: 12,
//     borderColor: COLORS.border,
//     borderWidth: 1,
//     borderRadius: 8,
//     fontSize: 14,
//     color: COLORS.text,
//     backgroundColor: COLORS.white,
//   },
//   reasonInput: {
//     minHeight: 90,
//     textAlignVertical: 'top',
//   },
//   reasonLabel: {
//     fontSize: 13,
//     color: COLORS.subText,
//     fontWeight: '700',
//     marginBottom: 8,
//   },
//   actionBtn: {
//     paddingVertical: 12,
//     marginTop: 4,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   actionBtnText: {
//     color: COLORS.white,
//     fontWeight: '800',
//     fontSize: 14,
//   },
//   statusBadge: {
//     marginTop: 8,
//     alignSelf: 'flex-start',
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 999,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '800',
//   },
//   noteText: {
//     marginTop: 6,
//     fontSize: 14,
//     color: COLORS.primaryNavy,
//     fontWeight: '600',
//     lineHeight: 20,
//   },
// });  
























import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import SectionHeader from '../../components/SASectionHeader';
import COLORS from '../../theme/SAcolors';
import SPACING from '../../theme/spacing';

export default function BuilderDetailsScreen({ navigation, route }) {
  const builder = route.params?.builder;

  if (!builder) return null;

  return (
    <ScreenWrapper>
      <AppHeader
        title={builder.name}
        subtitle={`RERA: ${builder.rera}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}> 

          <Text style={styles.label}>Name</Text>
<Text style={styles.value}>{builder.name}</Text>
          <Text style={styles.label}>Builder ID</Text>
          <Text style={styles.value}>{builder.id}</Text>

          <Text style={styles.label}>City</Text>
          <Text style={styles.value}>{builder.city}</Text>

          <Text style={styles.label}>Active Projects</Text>
          <Text style={styles.value}>{builder.projects}</Text>

          <Text style={styles.label}>Collections</Text>
          <Text style={styles.value}>{builder.collections}</Text>

          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{builder.status}</Text>
        </View>

        <SectionHeader title="Builder Summary" />

        <View style={styles.card}>
          <Text style={styles.summaryText}>
            This builder is approved and can create new project or society requests.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: SPACING.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 12,
    color: COLORS.subText,
    fontWeight: '700',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '800',
    marginTop: 4,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
});