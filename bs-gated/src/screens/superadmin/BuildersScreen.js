// import React, { useState } from 'react';
// import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
// import ScreenWrapper from '../../components/SAScreenWrapper';
// import AppHeader from '../../components/SAAppHeader';
// import SectionHeader from '../../components/SASectionHeader';
// import ListCard from '../../components/SAListCard';
// import InfoBanner from '../../components/SAInfoBanner';
// import COLORS from '../../theme/SAcolors';
// import { useAppContext } from './SocietyContext';

// export default function BuildersScreen({ navigation }) {
//   // const { builders } = useAppContext(); 

//   const {
//   builders,
//   projectRequests,
//   approveProjectRequest,
//   rejectProjectRequest,
// } = useAppContext();

//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalMessage, setModalMessage] = useState('');

//   const closeModal = () => {
//     setModalVisible(false);
//   };

//   return (
//     <ScreenWrapper>
//       <AppHeader
//         title="Builder Oversight"
//         subtitle="Approvals, projects, and collections"
//         showBack
//         onBack={() => navigation.goBack()}
//       />

//       <ScrollView showsVerticalScrollIndicator={false}>
//         <InfoBanner text="Builder is a separate role from Society Admin. Super Admin verifies documents, approves access, and monitors project-level KPIs." />

//         <SectionHeader title="Registered Builders" actionText={`${builders.length} builders`} />


// {builders.map((builder) => (
//   <ListCard
//     key={builder.id}
//     title={builder.name}
//     subtitle={`${builder.city} · ${builder.projects} active projects · RERA: ${builder.rera}`}
//     metaLeft={builder.id}
//     metaRight={builder.collections}
//     status={builder.status}
//     onPress={() => navigation.navigate('BuilderDetails', { builder })}
//   />
// ))}
//       </ScrollView>

//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={closeModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalMessage}>{modalMessage}</Text>
//             <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
//               <Text style={styles.modalButtonText}>Close</Text>
//             </TouchableOpacity>   
//           </View>
//         </View>
//       </Modal>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.4)',
//   },
//   modalContainer: {
//     width: 300,
//     padding: 20,
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalMessage: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.text,
//     marginBottom: 20,
//   },
//   modalButton: {
//     backgroundColor: COLORS.primaryNavy,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   modalButtonText: {
//     color: COLORS.white,
//     fontWeight: '800',
//   },
// });  























// import React, { useState } from 'react';
// import {
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Modal,
// } from 'react-native';
// import ScreenWrapper from '../../components/SAScreenWrapper';
// import AppHeader from '../../components/SAAppHeader';
// import SectionHeader from '../../components/SASectionHeader';
// import ListCard from '../../components/SAListCard';
// import InfoBanner from '../../components/SAInfoBanner';
// import COLORS from '../../theme/SAcolors';
// import { useAppContext } from './SocietyContext';

// export default function BuildersScreen({ navigation }) {
//   const {
//     builders,
//     projectRequests,
//     approveProjectRequest,
//     rejectProjectRequest,
//   } = useAppContext();

//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalMessage, setModalMessage] = useState('');

//   const closeModal = () => {
//     setModalVisible(false);
//     setModalMessage('');
//   };

//   const pendingRequests = (projectRequests || []).filter(
//     (item) => item.approvalStatus === 'Pending'
//   );

//   const handleApprove = (projectId, projectName) => {
//     approveProjectRequest(projectId, 'Project approved by Super Admin');
//     setModalMessage(`${projectName} approved successfully.`);
//     setModalVisible(true);
//   };

//   const handleReject = (projectId, projectName) => {
//     rejectProjectRequest(projectId, 'Project rejected by Super Admin');
//     setModalMessage(`${projectName} rejected successfully.`);
//     setModalVisible(true);
//   };

//   return (
//     <ScreenWrapper>
//       <AppHeader
//         title="Builder Oversight"
//         subtitle="Approvals, projects, and collections"
//         showBack
//         onBack={() => navigation.goBack()}
//       />

//       <ScrollView showsVerticalScrollIndicator={false}>
//         <InfoBanner text="Builder is a separate role from Society Admin. Super Admin verifies documents, approves access, and monitors project-level KPIs." />

//         <SectionHeader
//           title="Registered Builders"
//           actionText={`${builders.length} builders`}
//         />

//         {builders.map((builder) => (
//           <ListCard
//             key={builder.id}
//             title={builder.name}
//             subtitle={`${builder.city} · ${builder.projects} active projects · RERA: ${builder.rera}`}
//             metaLeft={builder.id}
//             metaRight={builder.collections}
//             status={builder.status}
//             onPress={() => navigation.navigate('BuilderDetails', { builder })}
//           />
//         ))}

//         <SectionHeader
//           title="Pending Project Requests"
//           actionText={`${pendingRequests.length} pending`}
//         />

//         {pendingRequests.length === 0 ? (
//           <View style={styles.emptyCard}>
//             <Text style={styles.emptyTitle}>No pending project requests</Text>
//             <Text style={styles.emptySub}>
//               Builder-created project requests will appear here.
//             </Text>
//           </View>
//         ) : (
//           pendingRequests.map((project) => (
//             <View key={project.id} style={styles.requestCard}>
//               <Text style={styles.requestTitle}>{project.projectName}</Text>

//               <Text style={styles.requestSub}>
//                 {project.builderName} · {project.city}, {project.state}
//               </Text>

//               <Text style={styles.requestSub}>RERA: {project.reraNumber}</Text>

//               <Text style={styles.requestSub}>
//                 {project.towerCount} Towers · {project.totalUnits} Units
//               </Text>

//               {!!project.location && (
//                 <Text style={styles.requestSub}>Location: {project.location}</Text>
//               )}

//               {!!project.projectType && (
//                 <Text style={styles.requestSub}>Type: {project.projectType}</Text>
//               )}

//               {!!project.possessionType && (
//                 <Text style={styles.requestSub}>
//                   Possession: {project.possessionType}
//                 </Text>
//               )}

//               <View style={styles.actionRow}>
//                 <TouchableOpacity
//                   style={styles.approveBtn}
//                   onPress={() => handleApprove(project.id, project.projectName)}
//                 >
//                   <Text style={styles.approveBtnText}>Approve</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.rejectBtn}
//                   onPress={() => handleReject(project.id, project.projectName)}
//                 >
//                   <Text style={styles.rejectBtnText}>Reject</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))
//         )}
//       </ScrollView>

//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={closeModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalMessage}>{modalMessage}</Text>
//             <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
//               <Text style={styles.modalButtonText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   emptyCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 10,
//     marginBottom: 12,
//   },
//   emptyTitle: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: COLORS.text,
//   },
//   emptySub: {
//     marginTop: 4,
//     fontSize: 13,
//     color: '#6B7280',
//     lineHeight: 20,
//   },
//   requestCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 10,
//     marginBottom: 12,
//   },
//   requestTitle: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: COLORS.text,
//   },
//   requestSub: {
//     marginTop: 4,
//     fontSize: 13,
//     color: '#6B7280',
//     lineHeight: 20,
//   },
//   actionRow: {
//     flexDirection: 'row',
//     marginTop: 14,
//   },
//   approveBtn: {
//     backgroundColor: '#15803D',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginRight: 10,
//   },
//   approveBtnText: {
//     color: '#FFFFFF',
//     fontWeight: '800',
//   },
//   rejectBtn: {
//     backgroundColor: '#B91C1C',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//   },
//   rejectBtnText: {
//     color: '#FFFFFF',
//     fontWeight: '800',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.4)',
//   },
//   modalContainer: {
//     width: 300,
//     padding: 20,
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalMessage: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.text,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   modalButton: {
//     backgroundColor: COLORS.primaryNavy,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   modalButtonText: {
//     color: COLORS.white,
//     fontWeight: '800',
//   },
// });   


























 


// import React, { useState } from 'react';
// import {
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Modal,
// } from 'react-native';
// import ScreenWrapper from '../../components/SAScreenWrapper';
// import AppHeader from '../../components/SAAppHeader';
// import SectionHeader from '../../components/SASectionHeader';
// import ListCard from '../../components/SAListCard';
// import InfoBanner from '../../components/SAInfoBanner';
// import COLORS from '../../theme/SAcolors';
// import { useAppContext } from './SocietyContext';

// export default function BuildersScreen({ navigation }) {
//   const {
//     builders,
//     builderRequests,
//     projectRequests,
//   } = useAppContext();

//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalMessage, setModalMessage] = useState('');

//   const closeModal = () => {
//     setModalVisible(false);
//     setModalMessage('');
//   };

//   const pendingBuilders = (builderRequests || []).filter(
//     (item) => item.status === 'Pending'
//   );

//   const pendingProjects = (projectRequests || []).filter(
//     (item) => item.approvalStatus === 'Pending'
//   );

//   return (
//     <ScreenWrapper>
//       <AppHeader
//         title="Builder Oversight"
//         subtitle="Approvals, projects, and collections"
//         showBack
//         onBack={() => navigation.goBack()}
//       />

//       <ScrollView showsVerticalScrollIndicator={false}>
//         <InfoBanner text="Builder is a separate role from Society Admin. Super Admin verifies documents, approves access, and monitors project-level KPIs." />

//         <SectionHeader
//           title="New Builder Requests"
//           actionText={`${pendingBuilders.length} pending`}
//         />

//         {pendingBuilders.length === 0 ? (
//           <View style={styles.emptyCard}>
//             <Text style={styles.emptyTitle}>No new builder requests</Text>
//             <Text style={styles.emptySub}>
//               Newly submitted builder registrations will appear here.
//             </Text>
//           </View>
//         ) : (
//           pendingBuilders.map((builder) => (
//             <TouchableOpacity
//               key={builder.id}
//               activeOpacity={0.9}
//               style={styles.requestCard}
//               onPress={() =>
//                 navigation.navigate('BuilderRequestDetails', {
//                   builderRequestId: builder.id,
//                 })
//               }
//             >
//               <Text style={styles.requestTitle}>{builder.name}</Text>
//               <Text style={styles.requestSub}>RERA: {builder.rera}</Text>
//               <Text style={styles.requestSub}>GST: {builder.gst}</Text>
//               <Text style={styles.requestSub}>Email: {builder.email}</Text>
//               <Text style={styles.tapHint}>Tap to review documents and details</Text>
//             </TouchableOpacity>
//           ))
//         )}

//         <SectionHeader
//           title="Registered Builders"
//           actionText={`${builders.length} builders`}
//         />

//         {builders.map((builder) => (
//           <ListCard
//             key={builder.id}
//             title={builder.name}
//             subtitle={`${builder.city} · ${builder.projects} active projects · RERA: ${builder.rera}`}
//             metaLeft={builder.id}
//             metaRight={builder.collections}
//             status={builder.status}
//             onPress={() => navigation.navigate('BuilderDetails', { builder })}
//           />
//         ))}

//         <SectionHeader
//           title="Pending Project Requests"
//           actionText={`${pendingProjects.length} pending`}
//         />

//         {pendingProjects.length === 0 ? (
//           <View style={styles.emptyCard}>
//             <Text style={styles.emptyTitle}>No pending project requests</Text>
//             <Text style={styles.emptySub}>
//               Builder-created project requests will appear here.
//             </Text>
//           </View>
//         ) : (
//           pendingProjects.map((project) => (
//             <View key={project.id} style={styles.requestCard}>
//               <Text style={styles.requestTitle}>{project.projectName}</Text>
//               <Text style={styles.requestSub}>
//                 {project.builderName} · {project.city}, {project.state}
//               </Text>
//               <Text style={styles.requestSub}>RERA: {project.reraNumber}</Text>
//               <Text style={styles.requestSub}>
//                 {project.towerCount} Towers · {project.totalUnits} Units
//               </Text>
//             </View>
//           ))
//         )}
//       </ScrollView>

//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={closeModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalMessage}>{modalMessage}</Text>
//             <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
//               <Text style={styles.modalButtonText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   emptyCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 10,
//     marginBottom: 12,
//   },
//   emptyTitle: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: COLORS.text,
//   },
//   emptySub: {
//     marginTop: 4,
//     fontSize: 13,
//     color: '#6B7280',
//     lineHeight: 20,
//   },
//   requestCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 10,
//     marginBottom: 12,
//   },
//   requestTitle: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: COLORS.text,
//   },
//   requestSub: {
//     marginTop: 4,
//     fontSize: 13,
//     color: '#6B7280',
//     lineHeight: 20,
//   },
//   tapHint: {
//     marginTop: 10,
//     fontSize: 12,
//     fontWeight: '700',
//     color: COLORS.primaryNavy,
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.4)',
//   },
//   modalContainer: {
//     width: 300,
//     padding: 20,
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalMessage: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.text,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   modalButton: {
//     backgroundColor: COLORS.primaryNavy,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   modalButtonText: {
//     color: COLORS.white,
//     fontWeight: '800',
//   },
// });   


































// import React, { useState } from 'react';
// import {
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Modal,
// } from 'react-native';
// import ScreenWrapper from '../../components/SAScreenWrapper';
// import AppHeader from '../../components/SAAppHeader';
// import SectionHeader from '../../components/SASectionHeader';
// import ListCard from '../../components/SAListCard';
// import InfoBanner from '../../components/SAInfoBanner';
// import COLORS from '../../theme/SAcolors';
// import { useAppContext } from './SocietyContext';

// export default function BuildersScreen({ navigation }) {
//   const {
//     builders,
//     builderRequests,
//     projectRequests,
//   } = useAppContext();

//   const [requestModalVisible, setRequestModalVisible] = useState(false);

//   const pendingBuilders = (builderRequests || []).filter(
//     (item) => item.status === 'Pending'
//   );

//   const pendingProjects = (projectRequests || []).filter(
//     (item) => item.approvalStatus === 'Pending'
//   );

//   const approvedBuilders = (builders || []).filter(
//     (item) => item.status === 'Approved' || item.status === 'Active'
//   );

//   const closeRequestModal = () => {
//     setRequestModalVisible(false);
//   };

//   return (
//     <ScreenWrapper>
//       <AppHeader
//         title="Builder Oversight"
//         subtitle="Approvals, projects, and collections"
//         showBack
//         onBack={() => navigation.goBack()}
//       />

//       <ScrollView showsVerticalScrollIndicator={false}>
//         <InfoBanner text="Builder is a separate role from Society Admin. Super Admin verifies documents, approves access, monitors project-level KPIs, and reviews new society/project requests." />

//         <View style={styles.topActionRow}>
//           <TouchableOpacity
//             style={styles.requestButton}
//             onPress={() => setRequestModalVisible(true)}
//           >
//             <Text style={styles.requestButtonText}>Requests</Text>
//             <View style={styles.requestBadge}>
//               <Text style={styles.requestBadgeText}>{pendingBuilders.length}</Text>
//             </View>
//           </TouchableOpacity>
//         </View>

//         <SectionHeader
//           title="Registered Builders"
//           actionText={`${approvedBuilders.length} builders`}
//         />

//         {approvedBuilders.length === 0 ? (
//           <View style={styles.emptyCard}>
//             <Text style={styles.emptyTitle}>No registered builders</Text>
//             <Text style={styles.emptySub}>
//               Approved builders will appear here.
//             </Text>
//           </View>
//         ) : (
//           approvedBuilders.map((builder) => (
//             <ListCard
//               key={builder.id}
//               title={builder.name}
//               subtitle={`${builder.city} · ${builder.projects} active projects · RERA: ${builder.rera}`}
//               metaLeft={builder.id}
//               metaRight={builder.collections}
//               status={builder.status}
//               onPress={() => navigation.navigate('BuilderDetails', { builder })}
//             />
//           ))
//         )}

//         <SectionHeader
//           title="Builder Requests to Build New Society"
//           actionText={`${pendingProjects.length} pending`}
//         />

//         {pendingProjects.length === 0 ? (
//           <View style={styles.emptyCard}>
//             <Text style={styles.emptyTitle}>No builder society requests</Text>
//             <Text style={styles.emptySub}>
//               Approved builder requests for new projects or societies will appear here.
//             </Text>
//           </View>
//         ) : (
//           pendingProjects.map((project) => (
//             <View key={project.id} style={styles.requestCard}>
//               <Text style={styles.requestTitle}>{project.projectName}</Text>

//               <Text style={styles.requestSub}>
//                 {project.builderName} · {project.city}, {project.state}
//               </Text>

//               <Text style={styles.requestSub}>RERA: {project.reraNumber}</Text>

//               <Text style={styles.requestSub}>
//                 {project.towerCount} Towers · {project.totalUnits} Units
//               </Text>

//               {!!project.location && (
//                 <Text style={styles.requestSub}>Location: {project.location}</Text>
//               )}

//               {!!project.projectType && (
//                 <Text style={styles.requestSub}>Type: {project.projectType}</Text>
//               )}

//               {!!project.possessionType && (
//                 <Text style={styles.requestSub}>
//                   Possession: {project.possessionType}
//                 </Text>
//               )}
//             </View>
//           ))
//         )}
//       </ScrollView>

//       <Modal
//         visible={requestModalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={closeRequestModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeaderRow}>
//               <Text style={styles.modalTitle}>New Builder Registration Requests</Text>
//               <TouchableOpacity onPress={closeRequestModal} style={styles.closeBtn}>
//                 <Text style={styles.closeBtnText}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.modalScrollContent}
//             >
//               {pendingBuilders.length === 0 ? (
//                 <View style={styles.emptyCardModal}>
//                   <Text style={styles.emptyTitle}>No pending builder requests</Text>
//                   <Text style={styles.emptySub}>
//                     New builder registration requests will appear here.
//                   </Text>
//                 </View>
//               ) : (
//                 pendingBuilders.map((builder) => (
//                   <TouchableOpacity
//                     key={builder.id}
//                     activeOpacity={0.9}
//                     style={styles.modalRequestCard}
//                     onPress={() => {
//                       closeRequestModal();
//                       navigation.navigate('BuilderRequestDetails', {
//                         builderRequestId: builder.id,
//                       });
//                     }}
//                   >
//                     <Text style={styles.requestTitle}>{builder.name}</Text>
//                     <Text style={styles.requestSub}>RERA: {builder.rera}</Text>
//                     <Text style={styles.requestSub}>GST: {builder.gst}</Text>
//                     <Text style={styles.requestSub}>Email: {builder.email}</Text>
//                     <Text style={styles.tapHint}>Tap to review documents and details</Text>
//                   </TouchableOpacity>
//                 ))
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   topActionRow: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginBottom: 12,
//   },
//   requestButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primaryNavy,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//   },
//   requestButtonText: {
//     color: COLORS.white,
//     fontSize: 14,
//     fontWeight: '800',
//   },
//   requestBadge: {
//     marginLeft: 8,
//     minWidth: 22,
//     height: 22,
//     borderRadius: 11,
//     backgroundColor: '#DC2626',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 6,
//   },
//   requestBadgeText: {
//     color: '#FFFFFF',
//     fontSize: 11,
//     fontWeight: '800',
//   },
//   emptyCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 10,
//     marginBottom: 12,
//   },
//   emptyCardModal: {
//     backgroundColor: '#F8FAFC',
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 8,
//   },
//   emptyTitle: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: COLORS.text,
//   },
//   emptySub: {
//     marginTop: 4,
//     fontSize: 13,
//     color: '#6B7280',
//     lineHeight: 20,
//   },
//   requestCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 10,
//     marginBottom: 12,
//   },
//   modalRequestCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   requestTitle: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: COLORS.text,
//   },
//   requestSub: {
//     marginTop: 4,
//     fontSize: 13,
//     color: '#6B7280',
//     lineHeight: 20,
//   },
//   tapHint: {
//     marginTop: 10,
//     fontSize: 12,
//     fontWeight: '700',
//     color: COLORS.primaryNavy,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.35)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: COLORS.white,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: '75%',
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 20,
//   },
//   modalHeaderRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   modalTitle: {
//     flex: 1,
//     fontSize: 17,
//     fontWeight: '800',
//     color: COLORS.text,
//     paddingRight: 10,
//   },
//   closeBtn: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: '#F1F5F9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   closeBtnText: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: COLORS.text,
//   },
//   modalScrollContent: {
//     paddingBottom: 10,
//   },
// });   





























// import React, { useState } from 'react';
// import {
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Modal,
// } from 'react-native';
// import ScreenWrapper from '../../components/SAScreenWrapper';
// import AppHeader from '../../components/SAAppHeader';
// import SectionHeader from '../../components/SASectionHeader';
// import ListCard from '../../components/SAListCard';
// import InfoBanner from '../../components/SAInfoBanner';
// import COLORS from '../../theme/SAcolors';
// import { useAppContext } from './SocietyContext';

// export default function BuildersScreen({ navigation }) {
//   const {
//     builders,
//     builderRequests,
//     projectRequests,
//   } = useAppContext();

//   const [requestModalVisible, setRequestModalVisible] = useState(false);
//   const [buildersListModalVisible, setBuildersListModalVisible] = useState(false);

//   const pendingBuilders = (builderRequests || []).filter(
//     (item) => item.status === 'Pending'
//   );

//   const pendingProjects = (projectRequests || []).filter(
//     (item) => item.approvalStatus === 'Pending'
//   );

//   const approvedBuilders = (builders || []).filter(
//     (item) => item.status === 'Approved' || item.status === 'Active'
//   );

//   const closeRequestModal = () => {
//     setRequestModalVisible(false);
//   };

//   const closeBuildersListModal = () => {
//     setBuildersListModalVisible(false);
//   };

//   return (
//     <ScreenWrapper>
//       <AppHeader
//         title="Builder Oversight"
//         subtitle="Approvals, projects, and collections"
//         showBack
//         onBack={() => navigation.goBack()}
//       />

//       <ScrollView showsVerticalScrollIndicator={false}>
//         <InfoBanner text="Builder is a separate role from Society Admin. Super Admin verifies documents, approves access, monitors project-level KPIs, and reviews new society/project requests." />

//         <View style={styles.topButtonsRow}>
//           <TouchableOpacity
//             style={styles.topActionBtn}
//             onPress={() => setRequestModalVisible(true)}
//           >
//             <Text style={styles.topActionBtnText}>Requests</Text>
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>{pendingBuilders.length}</Text>
//             </View>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.topActionBtn}
//             onPress={() => setBuildersListModalVisible(true)}
//           >
//             <Text style={styles.topActionBtnText}>Builders List</Text>
//             <View style={styles.badgeSecondary}>
//               <Text style={styles.badgeSecondaryText}>{approvedBuilders.length}</Text>
//             </View>
//           </TouchableOpacity>
//         </View>

//         <SectionHeader
//           title="New Society Requests."
//           actionText={`${pendingProjects.length} pending`}
//         />

//         {pendingProjects.length === 0 ? (
//           <View style={styles.emptyCard}>
//             <Text style={styles.emptyTitle}>No new society requests</Text>
//             <Text style={styles.emptySub}>
//               New project or society creation requests from registered builders will appear here.
//             </Text>
//           </View>
//         ) : (
//           pendingProjects.map((project) => (
//             <TouchableOpacity
//               key={project.id}
//               activeOpacity={0.9}
//               style={styles.requestCard}
//               onPress={() =>
//                 navigation.navigate('ProjectRequestDetails', {
//                   projectRequestId: project.id,
//                 })
//               }
//             >
//               <Text style={styles.requestTitle}>{project.projectName}</Text>

//               <Text style={styles.requestSub}>
//                 {project.builderName} · {project.city}, {project.state}
//               </Text>

//               <Text style={styles.requestSub}>RERA: {project.reraNumber}</Text>

//               <Text style={styles.requestSub}>
//                 {project.towerCount} Towers · {project.totalUnits} Units
//               </Text>

//               {!!project.location && (
//                 <Text style={styles.requestSub}>Location: {project.location}</Text>
//               )}

//               {!!project.projectType && (
//                 <Text style={styles.requestSub}>Type: {project.projectType}</Text>
//               )}

//               {!!project.possessionType && (
//                 <Text style={styles.requestSub}>
//                   Possession: {project.possessionType}
//                 </Text>
//               )}

//               <Text style={styles.tapHint}>
//                 Tap to approve or reject with remark
//               </Text>
//             </TouchableOpacity>
//           ))
//         )}
//       </ScrollView>

//       <Modal
//         visible={requestModalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={closeRequestModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeaderRow}>
//               <Text style={styles.modalTitle}>New Builder Registration Requests</Text>
//               <TouchableOpacity onPress={closeRequestModal} style={styles.closeBtn}>
//                 <Text style={styles.closeBtnText}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.modalScrollContent}
//             >
//               {pendingBuilders.length === 0 ? (
//                 <View style={styles.emptyCardModal}>
//                   <Text style={styles.emptyTitle}>No pending builder requests</Text>
//                   <Text style={styles.emptySub}>
//                     New builder registration requests will appear here.
//                   </Text>
//                 </View>
//               ) : (
//                 pendingBuilders.map((builder) => (
//                   <TouchableOpacity
//                     key={builder.id}
//                     activeOpacity={0.9}
//                     style={styles.modalCard}
//                     onPress={() => {
//                       closeRequestModal();
//                       navigation.navigate('BuilderRequestDetails', {
//                         builderRequestId: builder.id,
//                       });
//                     }}
//                   >
//                     <Text style={styles.requestTitle}>{builder.name}</Text>
//                     <Text style={styles.requestSub}>RERA: {builder.rera}</Text>
//                     <Text style={styles.requestSub}>GST: {builder.gst}</Text>
//                     <Text style={styles.requestSub}>Email: {builder.email}</Text>
//                     <Text style={styles.tapHint}>Tap to review full details and documents</Text>
//                   </TouchableOpacity>
//                 ))
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={buildersListModalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={closeBuildersListModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeaderRow}>
//               <Text style={styles.modalTitle}>Registered Builders</Text>
//               <TouchableOpacity onPress={closeBuildersListModal} style={styles.closeBtn}>
//                 <Text style={styles.closeBtnText}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.modalScrollContent}
//             >
//               {approvedBuilders.length === 0 ? (
//                 <View style={styles.emptyCardModal}>
//                   <Text style={styles.emptyTitle}>No registered builders</Text>
//                   <Text style={styles.emptySub}>
//                     Approved builders will appear here.
//                   </Text>
//                 </View>
//               ) : (
//                 approvedBuilders.map((builder) => (
//                   <TouchableOpacity
//                     key={builder.id}
//                     activeOpacity={0.9}
//                     style={styles.modalCard}
//                     onPress={() => {
//                       closeBuildersListModal();
//                       navigation.navigate('BuilderDetails', { builder });
//                     }}
//                   >
//                     <Text style={styles.requestTitle}>{builder.name}</Text>
//                     <Text style={styles.requestSub}>
//                       {builder.city} · {builder.projects} active projects
//                     </Text>
//                     <Text style={styles.requestSub}>RERA: {builder.rera}</Text>
//                     <Text style={styles.requestSub}>Collections: {builder.collections}</Text>
//                     <Text style={styles.tapHint}>Tap to view builder details</Text>
//                   </TouchableOpacity>
//                 ))
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   topButtonsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 14,
//     gap: 12,
//   },
//   topActionBtn: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primaryNavy,
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//     borderRadius: 12,
//     marginLeft: 20,
//     marginRight: 20,
//     marginTop: 20,
//   },
//   topActionBtnText: {
//     color: COLORS.white,
//     fontSize: 14,
//     fontWeight: '800',
//   },
//   badge: {
//     marginLeft: 8,
//     minWidth: 22,
//     height: 22,
//     borderRadius: 11,
//     backgroundColor: '#DC2626',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 6,
//   },
//   badgeText: {
//     color: '#FFFFFF',
//     fontSize: 11,
//     fontWeight: '800',
//   },
//   badgeSecondary: {
//     marginLeft: 8,
//     minWidth: 22,
//     height: 22,
//     borderRadius: 11,
//     backgroundColor: '#C9A84C',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 6,
//   },
//   badgeSecondaryText: {
//     color: '#0F172A',
//     fontSize: 11,
//     fontWeight: '800',
//   },
//   emptyCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 10,
//     marginBottom: 12,
//   },
//   emptyCardModal: {
//     backgroundColor: '#F8FAFC',
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 8,
//   },
//   emptyTitle: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: COLORS.text,
//   },
//   emptySub: {
//     marginTop: 4,
//     fontSize: 13,
//     color: '#6B7280',
//     lineHeight: 20,
//   },
//   requestCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 10,
//     marginBottom: 12,
   
//   },
//   modalCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   requestTitle: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: COLORS.text,
//   },
//   requestSub: {
//     marginTop: 4,
//     fontSize: 13,
//     color: '#6B7280',
//     lineHeight: 20,
//   },
//   tapHint: {
//     marginTop: 10,
//     fontSize: 12,
//     fontWeight: '700',
//     color: COLORS.primaryNavy,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.35)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: COLORS.white,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: '75%',
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 20,
//   },
//   modalHeaderRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   modalTitle: {
//     flex: 1,
//     fontSize: 17,
//     fontWeight: '800',
//     color: COLORS.text,
//     paddingRight: 10,
//   },
//   closeBtn: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: '#F1F5F9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   closeBtnText: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: COLORS.text,
//   },
//   modalScrollContent: {
//     paddingBottom: 10,
//   },
// });   























import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';

import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import SectionHeader from '../../components/SASectionHeader';
import InfoBanner from '../../components/SAInfoBanner';
import COLORS from '../../theme/SAcolors';
import { useAppContext } from './SocietyContext';

export default function BuildersScreen({ navigation }) {
  const { builders, builderRequests, projectRequests, builderProjects } =
    useAppContext();

  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [buildersListModalVisible, setBuildersListModalVisible] = useState(false);

  const pendingBuilders = (builderRequests || []).filter(
    item => item.status === 'Pending'
  );

  const pendingProjects = (projectRequests || []).filter(
    item => item.approvalStatus === 'Pending'
  );

  const approvedProjects = (builderProjects || []).filter(
    item => item.approvalStatus === 'Approved'
  );

  const approvedBuilders = (builders || []).filter(
    item => item.status === 'Approved' || item.status === 'Active'
  );

  return (
    <ScreenWrapper>
      <AppHeader
        title="Builder Oversight"
        subtitle="Builder approvals, project approvals, and customer sharing"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <InfoBanner text="Super Admin verifies builder registrations and approves new builder projects. After project approval, builder can share the project to customers." />

        <View style={styles.topButtonsRow}>
          <TouchableOpacity
            style={styles.topActionBtn}
            onPress={() => setRequestModalVisible(true)}
          >
            <Text style={styles.topActionBtnText}>Builder Requests</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingBuilders.length}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topActionBtn}
            onPress={() => setBuildersListModalVisible(true)}
          >
            <Text style={styles.topActionBtnText}>Builders List</Text>
            <View style={styles.badgeSecondary}>
              <Text style={styles.badgeSecondaryText}>
                {approvedBuilders.length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pendingProjects.length}</Text>
            <Text style={styles.statLabel}>Pending Projects</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{approvedProjects.length}</Text>
            <Text style={styles.statLabel}>Approved Projects</Text>
          </View>
        </View>

        <SectionHeader
          title="New Project Approval Requests"
          actionText={`${pendingProjects.length} pending`}
        />

        {pendingProjects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No pending project requests</Text>
            <Text style={styles.emptySub}>
              New projects created by builders will appear here for approval.
            </Text>
          </View>
        ) : (
          pendingProjects.map(project => (
            <TouchableOpacity
              key={project.id}
              activeOpacity={0.9}
              style={styles.requestCard}
              onPress={() =>
                navigation.navigate('ProjectRequestDetails', {
                  projectRequestId: project.id,
                })
              }
            >
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestTitle}>{project.projectName}</Text>
                  <Text style={styles.requestSub}>
                    {project.builderName || 'Builder'} ·{' '}
                    {project.city || 'Hyderabad'}
                    {project.state ? `, ${project.state}` : ''}
                  </Text>
                </View>

                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>Pending</Text>
                </View>
              </View>

              <Text style={styles.requestSub}>RERA: {project.reraNumber}</Text>

              <Text style={styles.requestSub}>
                {project.towerCount || 0} Towers ·{' '}
                {project.totalUnits || project.availableUnits || 0} Flats
              </Text>

              {!!project.location && (
                <Text style={styles.requestSub}>
                  Location: {project.location}
                </Text>
              )}

              {!!project.priceRange && (
                <Text style={styles.requestPrice}>{project.priceRange}</Text>
              )}

              {!!project.possessionType && (
                <Text style={styles.requestSub}>
                  Possession: {project.possessionType}
                </Text>
              )}

              <Text style={styles.tapHint}>Tap to approve or reject project</Text>
            </TouchableOpacity>
          ))
        )}

        <SectionHeader
          title="Approved Builder Projects"
          actionText={`${approvedProjects.length} approved`}
        />

        {approvedProjects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No approved projects yet</Text>
            <Text style={styles.emptySub}>
              Approved projects will appear here. Builder can then share them to
              customers from builder side.
            </Text>
          </View>
        ) : (
          approvedProjects.map(project => (
            <View key={project.id} style={styles.approvedCard}>
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestTitle}>{project.projectName}</Text>
                  <Text style={styles.requestSub}>
                    {project.builderName || 'Builder'} · {project.location}
                  </Text>
                </View>

                <View style={styles.approvedBadge}>
                  <Text style={styles.approvedBadgeText}>Approved</Text>
                </View>
              </View>

              <Text style={styles.requestSub}>
                {project.towerCount || 0} Towers ·{' '}
                {project.totalUnits || 0} Flats ·{' '}
                {project.availableUnits || 0} Available
              </Text>

              <Text style={styles.requestPrice}>{project.priceRange}</Text>

              {project.sharedToCustomers ? (
                <Text style={styles.sharedText}>Visible to Customers</Text>
              ) : (
                <Text style={styles.notSharedText}>Not shared yet</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={requestModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                New Builder Registration Requests
              </Text>

              <TouchableOpacity
                onPress={() => setRequestModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {pendingBuilders.length === 0 ? (
                <View style={styles.emptyCardModal}>
                  <Text style={styles.emptyTitle}>
                    No pending builder requests
                  </Text>
                  <Text style={styles.emptySub}>
                    New builder registrations will appear here.
                  </Text>
                </View>
              ) : (
                pendingBuilders.map(builder => (
                  <TouchableOpacity
                    key={builder.id}
                    activeOpacity={0.9}
                    style={styles.modalCard}
                    onPress={() => {
                      setRequestModalVisible(false);
                      navigation.navigate('BuilderRequestDetails', {
                        builderRequestId: builder.id,
                      });
                    }}
                  >
                    <Text style={styles.requestTitle}>{builder.name}</Text>
                    <Text style={styles.requestSub}>RERA: {builder.rera}</Text>
                    <Text style={styles.requestSub}>GST: {builder.gst}</Text>
                    <Text style={styles.requestSub}>Email: {builder.email}</Text>
                    <Text style={styles.tapHint}>
                      Tap to review full details and documents
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={buildersListModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBuildersListModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Registered Builders</Text>

              <TouchableOpacity
                onPress={() => setBuildersListModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {approvedBuilders.length === 0 ? (
                <View style={styles.emptyCardModal}>
                  <Text style={styles.emptyTitle}>No registered builders</Text>
                  <Text style={styles.emptySub}>
                    Approved builders will appear here.
                  </Text>
                </View>
              ) : (
                approvedBuilders.map(builder => (
                  <TouchableOpacity
                    key={builder.id}
                    activeOpacity={0.9}
                    style={styles.modalCard}
                    onPress={() => {
                      setBuildersListModalVisible(false);
                      navigation.navigate('BuilderDetails', { builder });
                    }}
                  >
                    <Text style={styles.requestTitle}>{builder.name}</Text>
                    <Text style={styles.requestSub}>
                      {builder.city} · {builder.projects || 0} active projects
                    </Text>
                    <Text style={styles.requestSub}>RERA: {builder.rera}</Text>
                    <Text style={styles.requestSub}>
                      Collections: {builder.collections || '₹0'}
                    </Text>
                    <Text style={styles.tapHint}>
                      Tap to view builder details
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 14,
    gap: 12,
    paddingHorizontal: 4,
  },
  topActionBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryNavy,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  topActionBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  badge: {
    marginLeft: 8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeSecondary: {
    marginLeft: 8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeSecondaryText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    color: COLORS.primaryNavy,
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyCardModal: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  emptySub: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },

  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  approvedCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  requestSub: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  requestPrice: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '900',
    color: '#15803D',
  },
  tapHint: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryNavy,
  },

  pendingBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pendingBadgeText: {
    color: '#C2410C',
    fontSize: 11,
    fontWeight: '900',
  },
  approvedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  approvedBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '900',
  },
  sharedText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 10,
  },
  notSharedText: {
    color: '#C2410C',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    paddingRight: 10,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalScrollContent: {
    paddingBottom: 10,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});