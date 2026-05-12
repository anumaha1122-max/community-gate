// import React, { useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   Alert,
// } from 'react-native';
// import ScreenWrapper from '../../components/SAScreenWrapper';
// import AppHeader from '../../components/SAAppHeader';
// import COLORS from '../../theme/SAcolors';
// import { useAppContext } from './SocietyContext';

// export default function BuilderRequestDetails({ navigation, route }) {
//   const { builderRequestId } = route.params || {};
//   const {
//     builderRequests,
//     approveBuilderRequest,
//     rejectBuilderRequest,
//   } = useAppContext();

//   const [remark, setRemark] = useState('');

//   const builder = useMemo(
//     () => (builderRequests || []).find((item) => item.id === builderRequestId),
//     [builderRequests, builderRequestId]
//   );

//   const getFileName = (file) => {
//     if (!file) return 'Not uploaded';
//     return file?.name || file?.assets?.[0]?.name || 'Uploaded document';
//   };

//   const handleApprove = () => {
//     approveBuilderRequest(builder.id);
//     Alert.alert('Approved', 'Builder has been approved successfully.', [
//       { text: 'OK', onPress: () => navigation.goBack() },
//     ]);
//   };

//   const handleReject = () => {
//     if (!remark.trim()) {
//       Alert.alert('Remark required', 'Please enter a rejection remark.');
//       return;
//     }

//     rejectBuilderRequest(builder.id, remark);
//     Alert.alert('Rejected', 'Builder request has been rejected.', [
//       { text: 'OK', onPress: () => navigation.goBack() },
//     ]);
//   };

//   if (!builder) {
//     return (
//       <ScreenWrapper>
//         <AppHeader
//           title="Builder Request"
//           subtitle="Request not found"
//           showBack
//           onBack={() => navigation.goBack()}
//         />
//         <View style={styles.notFoundWrap}>
//           <Text style={styles.notFoundText}>Builder request not found.</Text>
//         </View>
//       </ScreenWrapper>
//     );
//   }

//   return (
//     <ScreenWrapper>
//       <AppHeader
//         title="Builder Request Details"
//         subtitle="Review documents and company information"
//         showBack
//         onBack={() => navigation.goBack()}
//       />

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Company Information</Text>

//           <DetailRow label="Company Name" value={builder.companyName || builder.name} />
//           <DetailRow label="Builder ID" value={builder.id} />
//           <DetailRow label="City" value={builder.city || 'Hyderabad'} />
//           <DetailRow label="RERA Number" value={builder.reraNumber || builder.rera} />
//           <DetailRow label="GST Number" value={builder.gst} />
//           <DetailRow label="Email" value={builder.email} />
//           <DetailRow label="Phone" value={builder.phone} />
//           <DetailRow label="Status" value={builder.status} />
//         </View>

//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Uploaded Documents</Text>

//           <DetailRow
//             label="Incorporation Certificate"
//             value={getFileName(builder.documents?.incorporation)}
//           />
//           <DetailRow
//             label="Bank Account Details"
//             value={getFileName(builder.documents?.bank)}
//           />
//           <DetailRow
//             label="RERA Approval Letter"
//             value={getFileName(builder.documents?.reraLetter)}
//           />
//           <DetailRow
//             label="Director ID Proof"
//             value={getFileName(builder.documents?.directorId)}
//           />
//         </View>

//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Rejection Remark</Text>
//           <TextInput
//             value={remark}
//             onChangeText={setRemark}
//             placeholder="Enter reason for rejection"
//             placeholderTextColor="#94A3B8"
//             multiline
//             style={styles.remarkInput}
//           />
//         </View>

//         <View style={styles.actionRow}>
//           <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
//             <Text style={styles.approveBtnText}>Approve</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
//             <Text style={styles.rejectBtnText}>Reject with Remark</Text>
//           </TouchableOpacity>
//         </View>

//         {!!builder.remark && (
//           <View style={styles.card}>
//             <Text style={styles.sectionTitle}>Existing Remark</Text>
//             <Text style={styles.remarkText}>{builder.remark}</Text>
//           </View>
//         )}
//       </ScrollView>
//     </ScreenWrapper>
//   );
// }

// function DetailRow({ label, value }) {
//   return (
//     <View style={styles.detailRow}>
//       <Text style={styles.detailLabel}>{label}</Text>
//       <Text style={styles.detailValue}>{value || '-'}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   content: {
//     padding: 16,
//     paddingBottom: 30,
//   },
//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 14,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: COLORS.text,
//     marginBottom: 12,
//   },
//   detailRow: {
//     marginBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//     paddingBottom: 10,
//   },
//   detailLabel: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#64748B',
//     marginBottom: 4,
//   },
//   detailValue: {
//     fontSize: 14,
//     color: COLORS.text,
//     fontWeight: '600',
//   },
//   remarkInput: {
//     minHeight: 100,
//     borderWidth: 1,
//     borderColor: '#CBD5E1',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     textAlignVertical: 'top',
//     color: COLORS.text,
//   },
//   actionRow: {
//     flexDirection: 'row',
//     marginBottom: 14,
//   },
//   approveBtn: {
//     flex: 1,
//     backgroundColor: '#15803D',
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   approveBtnText: {
//     color: '#FFFFFF',
//     fontWeight: '800',
//   },
//   rejectBtn: {
//     flex: 1,
//     backgroundColor: '#B91C1C',
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   rejectBtnText: {
//     color: '#FFFFFF',
//     fontWeight: '800',
//   },
//   remarkText: {
//     color: COLORS.text,
//     fontSize: 14,
//     lineHeight: 22,
//   },
//   notFoundWrap: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   notFoundText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.text,
//   },
// });  


























// import React, { useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   Image,
//   Linking,
// } from 'react-native';
// import ScreenWrapper from '../../components/SAScreenWrapper';
// import AppHeader from '../../components/SAAppHeader';
// import COLORS from '../../theme/SAcolors';
// import { useAppContext } from './SocietyContext';

// export default function BuilderRequestDetails({ navigation, route }) {
//   const { builderRequestId } = route.params || {};
//   const {
//     builderRequests,
//     approveBuilderRequest,
//     rejectBuilderRequest,
//   } = useAppContext();

//   const [remark, setRemark] = useState('');

//   const builder = useMemo(
//     () => (builderRequests || []).find((item) => item.id === builderRequestId),
//     [builderRequests, builderRequestId]
//   );

//   const getFileObject = (file) => {
//     if (!file) return null;
//     if (file?.assets?.length) return file.assets[0];
//     return file;
//   };

//   const getFileName = (file) => {
//     const fileObj = getFileObject(file);
//     return fileObj?.name || 'Uploaded document';
//   };

//   const getFileUri = (file) => {
//     const fileObj = getFileObject(file);
//     return fileObj?.uri || null;
//   };

//   const getMimeType = (file) => {
//     const fileObj = getFileObject(file);
//     return fileObj?.mimeType || '';
//   };

//   const isImageFile = (file) => {
//     const mime = getMimeType(file);
//     const name = getFileName(file).toLowerCase();
//     return (
//       mime.startsWith('image/') ||
//       name.endsWith('.png') ||
//       name.endsWith('.jpg') ||
//       name.endsWith('.jpeg') ||
//       name.endsWith('.webp')
//     );
//   };

//   const openDocument = async (file) => {
//     const uri = getFileUri(file);

//     if (!uri) {
//       Alert.alert('Unavailable', 'Document URI is not available.');
//       return;
//     }

//     try {
//       const supported = await Linking.canOpenURL(uri);
//       if (supported) {
//         await Linking.openURL(uri);
//       } else {
//         Alert.alert('Cannot open', 'This document cannot be opened on this device.');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to open document.');
//     }
//   };

//   const handleApprove = () => {
//     if (!builder) return;

//     approveBuilderRequest(builder.id);
//     Alert.alert('Approved', 'Builder has been approved successfully.', [
//       { text: 'OK', onPress: () => navigation.goBack() },
//     ]);
//   };

//   const handleReject = () => {
//     if (!builder) return;

//     if (!remark.trim()) {
//       Alert.alert('Remark required', 'Please enter a rejection remark.');
//       return;
//     }

//     rejectBuilderRequest(builder.id, remark);
//     Alert.alert('Rejected', 'Builder request has been rejected.', [
//       { text: 'OK', onPress: () => navigation.goBack() },
//     ]);
//   };

//   if (!builder) {
//     return (
//       <ScreenWrapper>
//         <AppHeader
//           title="Builder Request"
//           subtitle="Request not found"
//           showBack
//           onBack={() => navigation.goBack()}
//         />
//         <View style={styles.notFoundWrap}>
//           <Text style={styles.notFoundText}>Builder request not found.</Text>
//         </View>
//       </ScreenWrapper>
//     );
//   }

//   return (
//     <ScreenWrapper>
//       <AppHeader
//         title="Builder Request Details"
//         subtitle="Review company details and uploaded documents"
//         showBack
//         onBack={() => navigation.goBack()}
//       />

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Company Information</Text>

//           <DetailRow label="Company Name" value={builder.companyName || builder.name} />
//           <DetailRow label="Builder ID" value={builder.id} />
//           <DetailRow label="City" value={builder.city || 'Hyderabad'} />
//           <DetailRow label="RERA Number" value={builder.reraNumber || builder.rera} />
//           <DetailRow label="GST Number" value={builder.gst} />
//           <DetailRow label="Email" value={builder.email} />
//           <DetailRow label="Phone" value={builder.phone} />
//           <DetailRow label="Status" value={builder.status} />
//         </View>

//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Uploaded Documents</Text>

//           <DocumentPreview
//             title="Incorporation Certificate"
//             file={builder.documents?.incorporation}
//             isImageFile={isImageFile}
//             getFileName={getFileName}
//             getFileUri={getFileUri}
//             openDocument={openDocument}
//           />

//           <DocumentPreview
//             title="Bank Account Details"
//             file={builder.documents?.bank}
//             isImageFile={isImageFile}
//             getFileName={getFileName}
//             getFileUri={getFileUri}
//             openDocument={openDocument}
//           />

//           <DocumentPreview
//             title="RERA Approval Letter"
//             file={builder.documents?.reraLetter}
//             isImageFile={isImageFile}
//             getFileName={getFileName}
//             getFileUri={getFileUri}
//             openDocument={openDocument}
//           />

//           <DocumentPreview
//             title="Director ID Proof"
//             file={builder.documents?.directorId}
//             isImageFile={isImageFile}
//             getFileName={getFileName}
//             getFileUri={getFileUri}
//             openDocument={openDocument}
//           />
//         </View>

//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Rejection Remark</Text>
//           <TextInput
//             value={remark}
//             onChangeText={setRemark}
//             placeholder="Enter reason for rejection"
//             placeholderTextColor="#94A3B8"
//             multiline
//             style={styles.remarkInput}
//           />
//         </View>

//         <View style={styles.actionRow}>
//           <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
//             <Text style={styles.approveBtnText}>Approve</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
//             <Text style={styles.rejectBtnText}>Reject with Remark</Text>
//           </TouchableOpacity>
//         </View>

//         {!!builder.remark && (
//           <View style={styles.card}>
//             <Text style={styles.sectionTitle}>Existing Remark</Text>
//             <Text style={styles.remarkText}>{builder.remark}</Text>
//           </View>
//         )}
//       </ScrollView>
//     </ScreenWrapper>
//   );
// }

// function DetailRow({ label, value }) {
//   return (
//     <View style={styles.detailRow}>
//       <Text style={styles.detailLabel}>{label}</Text>
//       <Text style={styles.detailValue}>{value || '-'}</Text>
//     </View>
//   );
// }

// function DocumentPreview({
//   title,
//   file,
//   isImageFile,
//   getFileName,
//   getFileUri,
//   openDocument,
// }) {
//   const uri = getFileUri(file);
//   const fileName = file ? getFileName(file) : 'Not uploaded';
//   const showImage = file && uri && isImageFile(file);

//   return (
//     <View style={styles.documentCard}>
//       <Text style={styles.documentTitle}>{title}</Text>

//       {!file ? (
//         <Text style={styles.missingText}>Not uploaded</Text>
//       ) : (
//         <>
//           <Text style={styles.fileName}>{fileName}</Text>

//           {showImage ? (
//             <Image source={{ uri }} style={styles.documentImage} resizeMode="cover" />
//           ) : (
//             <View style={styles.fileBox}>
//               <Text style={styles.fileBoxText}>Document ready for review</Text>
//             </View>
//           )}

//           <TouchableOpacity style={styles.openBtn} onPress={() => openDocument(file)}>
//             <Text style={styles.openBtnText}>Open Document</Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   content: {
//     padding: 16,
//     paddingBottom: 30,
//   },
//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 14,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: COLORS.text,
//     marginBottom: 12,
//   },
//   detailRow: {
//     marginBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//     paddingBottom: 10,
//   },
//   detailLabel: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#64748B',
//     marginBottom: 4,
//   },
//   detailValue: {
//     fontSize: 14,
//     color: COLORS.text,
//     fontWeight: '600',
//   },
//   documentCard: {
//     marginBottom: 16,
//     paddingBottom: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   documentTitle: {
//     fontSize: 14,
//     fontWeight: '800',
//     color: COLORS.text,
//     marginBottom: 6,
//   },
//   fileName: {
//     fontSize: 13,
//     color: '#475569',
//     marginBottom: 10,
//   },
//   missingText: {
//     fontSize: 13,
//     color: '#B91C1C',
//     fontWeight: '700',
//   },
//   documentImage: {
//     width: '100%',
//     height: 220,
//     borderRadius: 12,
//     backgroundColor: '#F1F5F9',
//     marginBottom: 10,
//   },
//   fileBox: {
//     height: 90,
//     borderRadius: 12,
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1,
//     borderColor: '#CBD5E1',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 10,
//   },
//   fileBoxText: {
//     color: '#475569',
//     fontWeight: '700',
//   },
//   openBtn: {
//     backgroundColor: COLORS.primaryNavy,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   openBtnText: {
//     color: COLORS.white,
//     fontWeight: '800',
//   },
//   remarkInput: {
//     minHeight: 100,
//     borderWidth: 1,
//     borderColor: '#CBD5E1',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     textAlignVertical: 'top',
//     color: COLORS.text,
//   },
//   actionRow: {
//     flexDirection: 'row',
//     marginBottom: 14,
//   },
//   approveBtn: {
//     flex: 1,
//     backgroundColor: '#15803D',
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   approveBtnText: {
//     color: '#FFFFFF',
//     fontWeight: '800',
//   },
//   rejectBtn: {
//     flex: 1,
//     backgroundColor: '#B91C1C',
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   rejectBtnText: {
//     color: '#FFFFFF',
//     fontWeight: '800',
//   },
//   remarkText: {
//     color: COLORS.text,
//     fontSize: 14,
//     lineHeight: 22,
//   },
//   notFoundWrap: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   notFoundText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.text,
//   },
// });  































// import React, { useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   Image,
//   Linking,
//   Platform,
// } from 'react-native';
// import * as FileSystem from 'expo-file-system';
// import * as IntentLauncher from 'expo-intent-launcher';
// import ScreenWrapper from '../../components/SAScreenWrapper';
// import AppHeader from '../../components/SAAppHeader';
// import COLORS from '../../theme/SAcolors';
// import { useAppContext } from './SocietyContext';

// export default function BuilderRequestDetails({ navigation, route }) {
//   const { builderRequestId } = route.params || {};
//   const {
//     builderRequests,
//     approveBuilderRequest,
//     rejectBuilderRequest,
//   } = useAppContext();

//   const [remark, setRemark] = useState('');

//   const builder = useMemo(
//     () => (builderRequests || []).find((item) => item.id === builderRequestId),
//     [builderRequests, builderRequestId]
//   );

//   const getFileObject = (file) => {
//     if (!file) return null;
//     if (file?.assets?.length) return file.assets[0];
//     return file;
//   };

//   const getFileName = (file) => {
//     const fileObj = getFileObject(file);
//     return fileObj?.name || 'Uploaded document';
//   };

//   const getFileUri = (file) => {
//     const fileObj = getFileObject(file);
//     return fileObj?.uri || null;
//   };

//   const getMimeType = (file) => {
//     const fileObj = getFileObject(file);
//     return fileObj?.mimeType || '';
//   };

//   const isImageFile = (file) => {
//     const mime = getMimeType(file);
//     const name = getFileName(file).toLowerCase();

//     return (
//       mime.startsWith('image/') ||
//       name.endsWith('.png') ||
//       name.endsWith('.jpg') ||
//       name.endsWith('.jpeg') ||
//       name.endsWith('.webp')
//     );
//   };

//   const openDocument = async (file) => {
//     const uri = getFileUri(file);
//     const mimeType = getMimeType(file) || '*/*';

//     if (!uri) {
//       Alert.alert('Unavailable', 'Document URI is not available.');
//       return;
//     }

//     try {
//       if (Platform.OS === 'android') {
//         const contentUri = await FileSystem.getContentUriAsync(uri);

//         await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
//           data: contentUri,
//           type: mimeType,
//           flags: 1,
//         });
//       } else {
//         await Linking.openURL(uri);
//       }
//     } catch (error) {
//       console.log('openDocument error:', error);
//       Alert.alert('Error', 'Failed to open document.');
//     }
//   };

//   const handleApprove = () => {
//     if (!builder) return;

//     approveBuilderRequest(builder.id);
//     Alert.alert('Approved', 'Builder has been approved successfully.', [
//       { text: 'OK', onPress: () => navigation.goBack() },
//     ]);
//   };

//   const handleReject = () => {
//     if (!builder) return;

//     if (!remark.trim()) {
//       Alert.alert('Remark required', 'Please enter a rejection remark.');
//       return;
//     }

//     rejectBuilderRequest(builder.id, remark);
//     Alert.alert('Rejected', 'Builder request has been rejected.', [
//       { text: 'OK', onPress: () => navigation.goBack() },
//     ]);
//   };

//   if (!builder) {
//     return (
//       <ScreenWrapper>
//         <AppHeader
//           title="Builder Request"
//           subtitle="Request not found"
//           showBack
//           onBack={() => navigation.goBack()}
//         />
//         <View style={styles.notFoundWrap}>
//           <Text style={styles.notFoundText}>Builder request not found.</Text>
//         </View>
//       </ScreenWrapper>
//     );
//   }

//   return (
//     <ScreenWrapper>
//       <AppHeader
//         title="Builder Request Details"
//         subtitle="Review company details and uploaded documents"
//         showBack
//         onBack={() => navigation.goBack()}
//       />

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Company Information</Text>

//           <DetailRow label="Company Name" value={builder.companyName || builder.name} />
//           <DetailRow label="Builder ID" value={builder.id} />
//           <DetailRow label="City" value={builder.city || 'Hyderabad'} />
//           <DetailRow label="RERA Number" value={builder.reraNumber || builder.rera} />
//           <DetailRow label="GST Number" value={builder.gst} />
//           <DetailRow label="Email" value={builder.email} />
//           <DetailRow label="Phone" value={builder.phone} />
//           <DetailRow label="Status" value={builder.status} />
//         </View>

//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Uploaded Documents</Text>

//           <DocumentPreview
//             title="Incorporation Certificate"
//             file={builder.documents?.incorporation}
//             isImageFile={isImageFile}
//             getFileName={getFileName}
//             getFileUri={getFileUri}
//             openDocument={openDocument}
//           />

//           <DocumentPreview
//             title="Bank Account Details"
//             file={builder.documents?.bank}
//             isImageFile={isImageFile}
//             getFileName={getFileName}
//             getFileUri={getFileUri}
//             openDocument={openDocument}
//           />

//           <DocumentPreview
//             title="RERA Approval Letter"
//             file={builder.documents?.reraLetter}
//             isImageFile={isImageFile}
//             getFileName={getFileName}
//             getFileUri={getFileUri}
//             openDocument={openDocument}
//           />

//           <DocumentPreview
//             title="Director ID Proof"
//             file={builder.documents?.directorId}
//             isImageFile={isImageFile}
//             getFileName={getFileName}
//             getFileUri={getFileUri}
//             openDocument={openDocument}
//           />
//         </View>

//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Rejection Remark</Text>
//           <TextInput
//             value={remark}
//             onChangeText={setRemark}
//             placeholder="Enter reason for rejection"
//             placeholderTextColor="#94A3B8"
//             multiline
//             style={styles.remarkInput}
//           />
//         </View>

//         <View style={styles.actionRow}>
//           <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
//             <Text style={styles.approveBtnText}>Approve</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
//             <Text style={styles.rejectBtnText}>Reject with Remark</Text>
//           </TouchableOpacity>
//         </View>

//         {!!builder.remark && (
//           <View style={styles.card}>
//             <Text style={styles.sectionTitle}>Existing Remark</Text>
//             <Text style={styles.remarkText}>{builder.remark}</Text>
//           </View>
//         )}
//       </ScrollView>
//     </ScreenWrapper>
//   );
// }

// function DetailRow({ label, value }) {
//   return (
//     <View style={styles.detailRow}>
//       <Text style={styles.detailLabel}>{label}</Text>
//       <Text style={styles.detailValue}>{value || '-'}</Text>
//     </View>
//   );
// }

// function DocumentPreview({
//   title,
//   file,
//   isImageFile,
//   getFileName,
//   getFileUri,
//   openDocument,
// }) {
//   const uri = getFileUri(file);
//   const fileName = file ? getFileName(file) : 'Not uploaded';
//   const showImage = file && uri && isImageFile(file);

//   return (
//     <View style={styles.documentCard}>
//       <Text style={styles.documentTitle}>{title}</Text>

//       {!file ? (
//         <Text style={styles.missingText}>Not uploaded</Text>
//       ) : (
//         <>
//           <Text style={styles.fileName}>{fileName}</Text>

//           {showImage ? (
//             <Image source={{ uri }} style={styles.documentImage} resizeMode="cover" />
//           ) : (
//             <View style={styles.fileBox}>
//               <Text style={styles.fileBoxText}>Document ready for review</Text>
//             </View>
//           )}

//           <TouchableOpacity style={styles.openBtn} onPress={() => openDocument(file)}>
//             <Text style={styles.openBtnText}>Open Document</Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   content: {
//     padding: 16,
//     paddingBottom: 30,
//   },
//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 14,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: COLORS.text,
//     marginBottom: 12,
//   },
//   detailRow: {
//     marginBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//     paddingBottom: 10,
//   },
//   detailLabel: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#64748B',
//     marginBottom: 4,
//   },
//   detailValue: {
//     fontSize: 14,
//     color: COLORS.text,
//     fontWeight: '600',
//   },
//   documentCard: {
//     marginBottom: 16,
//     paddingBottom: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   documentTitle: {
//     fontSize: 14,
//     fontWeight: '800',
//     color: COLORS.text,
//     marginBottom: 6,
//   },
//   fileName: {
//     fontSize: 13,
//     color: '#475569',
//     marginBottom: 10,
//   },
//   missingText: {
//     fontSize: 13,
//     color: '#B91C1C',
//     fontWeight: '700',
//   },
//   documentImage: {
//     width: '100%',
//     height: 220,
//     borderRadius: 12,
//     backgroundColor: '#F1F5F9',
//     marginBottom: 10,
//   },
//   fileBox: {
//     height: 90,
//     borderRadius: 12,
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1,
//     borderColor: '#CBD5E1',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 10,
//   },
//   fileBoxText: {
//     color: '#475569',
//     fontWeight: '700',
//   },
//   openBtn: {
//     backgroundColor: COLORS.primaryNavy,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   openBtnText: {
//     color: COLORS.white,
//     fontWeight: '800',
//   },
//   remarkInput: {
//     minHeight: 100,
//     borderWidth: 1,
//     borderColor: '#CBD5E1',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     textAlignVertical: 'top',
//     color: COLORS.text,
//   },
//   actionRow: {
//     flexDirection: 'row',
//     marginBottom: 14,
//   },
//   approveBtn: {
//     flex: 1,
//     backgroundColor: '#15803D',
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   approveBtnText: {
//     color: '#FFFFFF',
//     fontWeight: '800',
//   },
//   rejectBtn: {
//     flex: 1,
//     backgroundColor: '#B91C1C',
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   rejectBtnText: {
//     color: '#FFFFFF',
//     fontWeight: '800',
//   },
//   remarkText: {
//     color: COLORS.text,
//     fontSize: 14,
//     lineHeight: 22,
//   },
//   notFoundWrap: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   notFoundText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.text,
//   },
// });  



























import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Linking,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import COLORS from '../../theme/SAcolors';
import { useAppContext } from './SocietyContext';

export default function BuilderRequestDetails({ navigation, route }) {
  const { builderRequestId } = route.params || {};
  const {
    builderRequests,
    approveBuilderRequest,
    rejectBuilderRequest,
  } = useAppContext();

  const [remark, setRemark] = useState('');

  const builder = useMemo(
    () => (builderRequests || []).find((item) => item.id === builderRequestId),
    [builderRequests, builderRequestId]
  );

  const getFileObject = (file) => {
    if (!file) return null;
    if (file?.assets?.length) return file.assets[0];
    return file;
  };

  const getFileName = (file) => {
    const fileObj = getFileObject(file);
    return fileObj?.name || 'Uploaded document';
  };

  const getFileUri = (file) => {
    const fileObj = getFileObject(file);
    return fileObj?.uri || null;
  };

  const getMimeType = (file) => {
    const fileObj = getFileObject(file);
    return fileObj?.mimeType || '';
  };

  const isImageFile = (file) => {
    const mime = getMimeType(file);
    const name = getFileName(file).toLowerCase();

    return (
      mime.startsWith('image/') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.webp')
    );
  };

  const openDocument = async (file) => {
    const uri = getFileUri(file);
    const mimeType = getMimeType(file) || '*/*';

    if (!uri) {
      Alert.alert('Unavailable', 'Document URI is not available.');
      return;
    }

    try {
      if (Platform.OS === 'android') {
        if (uri.startsWith('content://')) {
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: uri,
            type: mimeType,
            flags: 1,
          });
          return;
        }

        const contentUri = await FileSystem.getContentUriAsync(uri);

        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          type: mimeType,
          flags: 1,
        });
      } else {
        await Linking.openURL(uri);
      }
    } catch (error) {
      console.log('openDocument error:', error);
      Alert.alert('Error', 'Failed to open document.');
    }
  };

  const handleApprove = () => {
    if (!builder) return;

    approveBuilderRequest(builder.id);
    Alert.alert('Approved', 'Builder has been approved successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleReject = () => {
    if (!builder) return;

    if (!remark.trim()) {
      Alert.alert('Remark required', 'Please enter a rejection remark.');
      return;
    }

    rejectBuilderRequest(builder.id, remark);
    Alert.alert('Rejected', 'Builder request has been rejected.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  if (!builder) {
    return (
      <ScreenWrapper>
        <AppHeader
          title="Builder Request"
          subtitle="Request not found"
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundText}>Builder request not found.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader
        title="Builder Request Details"
        subtitle="Review company details and uploaded documents"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Company Information</Text>

          <DetailRow label="Company Name" value={builder.companyName || builder.name} />
          <DetailRow label="Builder ID" value={builder.id} />
          <DetailRow label="City" value={builder.city || 'Hyderabad'} />
          <DetailRow label="RERA Number" value={builder.reraNumber || builder.rera} />
          <DetailRow label="GST Number" value={builder.gst} />
          <DetailRow label="Email" value={builder.email} />
          <DetailRow label="Phone" value={builder.phone} />
          <DetailRow label="Status" value={builder.status} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Uploaded Documents</Text>

          <DocumentPreview
            title="Incorporation Certificate"
            file={builder.documents?.incorporation}
            isImageFile={isImageFile}
            getFileName={getFileName}
            getFileUri={getFileUri}
            openDocument={openDocument}
          />

          <DocumentPreview
            title="Bank Account Details"
            file={builder.documents?.bank}
            isImageFile={isImageFile}
            getFileName={getFileName}
            getFileUri={getFileUri}
            openDocument={openDocument}
          />

          <DocumentPreview
            title="RERA Approval Letter"
            file={builder.documents?.reraLetter}
            isImageFile={isImageFile}
            getFileName={getFileName}
            getFileUri={getFileUri}
            openDocument={openDocument}
          />

          <DocumentPreview
            title="Director ID Proof"
            file={builder.documents?.directorId}
            isImageFile={isImageFile}
            getFileName={getFileName}
            getFileUri={getFileUri}
            openDocument={openDocument}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rejection Remark</Text>
          <TextInput
            value={remark}
            onChangeText={setRemark}
            placeholder="Enter reason for rejection"
            placeholderTextColor="#94A3B8"
            multiline
            style={styles.remarkInput}
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
            <Text style={styles.rejectBtnText}>Reject with Remark</Text>
          </TouchableOpacity>
        </View>

        {!!builder.remark && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Existing Remark</Text>
            <Text style={styles.remarkText}>{builder.remark}</Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );
}

function DocumentPreview({
  title,
  file,
  isImageFile,
  getFileName,
  getFileUri,
  openDocument,
}) {
  const uri = getFileUri(file);
  const fileName = file ? getFileName(file) : 'Not uploaded';
  const showImage = file && uri && isImageFile(file);

  return (
    <View style={styles.documentCard}>
      <Text style={styles.documentTitle}>{title}</Text>

      {!file ? (
        <Text style={styles.missingText}>Not uploaded</Text>
      ) : (
        <>
          <Text style={styles.fileName}>{fileName}</Text>

          {showImage ? (
            <Image source={{ uri }} style={styles.documentImage} resizeMode="cover" />
          ) : (
            <View style={styles.fileBox}>
              <Text style={styles.fileBoxText}>Document ready for review</Text>
            </View>
          )}

          <TouchableOpacity style={styles.openBtn} onPress={() => openDocument(file)}>
            <Text style={styles.openBtnText}>Open Document</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  detailRow: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  documentCard: {
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  fileName: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 10,
  },
  missingText: {
    fontSize: 13,
    color: '#B91C1C',
    fontWeight: '700',
  },
  documentImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginBottom: 10,
  },
  fileBox: {
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  fileBoxText: {
    color: '#475569',
    fontWeight: '700',
  },
  openBtn: {
    backgroundColor: COLORS.primaryNavy,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  openBtnText: {
    color: COLORS.white,
    fontWeight: '800',
  },
  remarkInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlignVertical: 'top',
    color: COLORS.text,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#15803D',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#B91C1C',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  remarkText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
  },
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});