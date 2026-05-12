




// import React, { createContext, useState, useContext } from "react";
// import { societyRequests, builders as initialBuilders } from "../../data/superAdminData";

// const SocietyContext = createContext(null);

// const DEFAULT_PROJECT_IMAGE =
//   "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80";

// const parseAmount = (value) => {
//   if (typeof value === "number") return value;
//   if (!value) return 0;

//   const text = String(value).replace(/₹|,/g, "").trim().toLowerCase();

//   if (text.includes("cr")) return Number(text.replace("cr", "")) * 10000000;
//   if (text.includes("l")) return Number(text.replace("l", "")) * 100000;

//   return Number(text.replace(/[^\d.]/g, "")) || 0;
// };

// const initialProjectRequests = [
//   {
//     id: "PRJ-001",
//     builderId: "BLD-001",
//     builderName: "BuilderPro Developers",
//     builderEmail: "builderpro@example.com",
//     projectName: "Skyline Grand",
//     name: "Skyline Grand",
//     location: "Financial District",
//     reraNumber: "RERA/HYD/2026/001",
//     completionDate: "31 Dec 2028",
//     towerCount: "6",
//     totalUnits: "238",
//     availableUnits: "120",
//     priceRange: "₹85L - ₹1.8Cr",
//     description: "Premium gated community with luxury towers.",
//     coverImage: DEFAULT_PROJECT_IMAGE,
//     approvalStatus: "Pending",
//     sharedToCustomers: false,
//     customerVisible: false,
//     requestedAt: new Date().toISOString(),
//     reviewedAt: null,
//     reviewMessage: "",
//     units: [],
//     complianceDocuments: [],
//   },
// ];

// const normalizeProjectPayload = (project, status = "Pending") => ({
//   ...project,
//   id: project.id || `PRJ-${Date.now()}`,
//   projectName: project.projectName || project.name || "Untitled Project",
//   name: project.name || project.projectName || "Untitled Project",
//   coverImage: project.coverImage || DEFAULT_PROJECT_IMAGE,
//   approvalStatus: project.approvalStatus || status,
//   sharedToCustomers: project.sharedToCustomers || false,
//   customerVisible: project.customerVisible || false,
//   requestedAt: project.requestedAt || new Date().toISOString(),
//   reviewedAt: project.reviewedAt || null,
//   reviewMessage: project.reviewMessage || "",
//   units: project.units || [],
//   complianceDocuments: project.complianceDocuments || [],
// });

// export const SocietyProvider = ({ children }) => {
//   const [societies, setSocieties] = useState(societyRequests);
//   const [builders, setBuilders] = useState(initialBuilders);
//   const [projectRequests, setProjectRequests] = useState(initialProjectRequests);
//   const [builderProjects, setBuilderProjects] = useState(
//     initialProjectRequests.map((project) => normalizeProjectPayload(project))
//   );

//   const [builderRequests, setBuilderRequests] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [visitRequests, setVisitRequests] = useState([]);
//   const [flatBookingRequests, setFlatBookingRequests] = useState([]);

//   const [whiteLabelConfig, setWhiteLabelConfig] = useState({
//     logo: null,
//     primaryDomain: "goldenrich.in",
//     emailDomain: "mail.goldenrich.in",
//   });

//   const addNotification = ({ title, message, builderId = null, type = "info" }) => {
//     setNotifications((prev) => [
//       {
//         id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
//         title,
//         message,
//         builderId,
//         type,
//         read: false,
//         time: new Date().toLocaleString(),
//         createdAt: new Date().toISOString(),
//       },
//       ...prev,
//     ]);
//   };

//   const addSociety = (newSociety) => setSocieties((prev) => [...prev, newSociety]);

//   const approveBuilder = (builderId) => {
//     setBuilders((prev) =>
//       prev.map((builder) =>
//         builder.id === builderId ? { ...builder, status: "Approved" } : builder
//       )
//     );
//   };

//   const rejectBuilder = (builderId) => {
//     setBuilders((prev) =>
//       prev.map((builder) =>
//         builder.id === builderId ? { ...builder, status: "Rejected" } : builder
//       )
//     );
//   };

//   const addBuilderRequest = (newBuilder) => {
//     const payload = {
//       id: `BLD-${Date.now()}`,
//       name: newBuilder.companyName?.trim() || "Unnamed Builder",
//       companyName: newBuilder.companyName?.trim() || "",
//       city: newBuilder.city?.trim() || "Hyderabad",
//       rera: newBuilder.reraNumber?.trim() || "",
//       reraNumber: newBuilder.reraNumber?.trim() || "",
//       gst: newBuilder.gst?.trim() || "",
//       email: newBuilder.email?.trim().toLowerCase() || "",
//       phone: newBuilder.phone?.trim() || "",
//       password: newBuilder.password || "",
//       documents: newBuilder.documents || {},
//       projects: 0,
//       collections: "₹0",
//       status: "Pending",
//       remark: "",
//       createdAt: new Date().toISOString(),
//       reviewedAt: null,
//     };

//     setBuilderRequests((prev) => [payload, ...prev]);
//   };

//   const approveBuilderRequest = (builderId) => {
//     const selectedBuilder = builderRequests.find((builder) => builder.id === builderId);
//     if (!selectedBuilder) return;

//     setBuilders((prev) => [
//       {
//         id: selectedBuilder.id,
//         name: selectedBuilder.name,
//         companyName: selectedBuilder.companyName,
//         city: selectedBuilder.city || "Hyderabad",
//         projects: 0,
//         rera: selectedBuilder.rera || selectedBuilder.reraNumber || "",
//         collections: "₹0",
//         status: "Approved",
//         email: selectedBuilder.email || "",
//         phone: selectedBuilder.phone || "",
//         password: selectedBuilder.password || "",
//         gst: selectedBuilder.gst || "",
//         documents: selectedBuilder.documents || {},
//       },
//       ...prev,
//     ]);

//     setBuilderRequests((prev) =>
//       prev.map((builder) =>
//         builder.id === builderId
//           ? {
//               ...builder,
//               status: "Approved",
//               reviewedAt: new Date().toISOString(),
//               remark: "",
//             }
//           : builder
//       )
//     );
//   };

//   const rejectBuilderRequest = (builderId, remark = "") => {
//     setBuilderRequests((prev) =>
//       prev.map((builder) =>
//         builder.id === builderId
//           ? {
//               ...builder,
//               status: "Rejected",
//               reviewedAt: new Date().toISOString(),
//               remark: remark?.trim() || "Rejected by Super Admin",
//             }
//           : builder
//       )
//     );
//   };

//   const getBuilderAccessStatus = ({ email, password }) => {
//     const normalizedEmail = email?.trim().toLowerCase();
//     const normalizedPassword = password || "";

//     const approvedBuilder = builders.find(
//       (builder) =>
//         builder.email?.trim().toLowerCase() === normalizedEmail &&
//         builder.password === normalizedPassword &&
//         builder.status === "Approved"
//     );

//     if (approvedBuilder) {
//       return { status: "Approved", builder: approvedBuilder, remark: "" };
//     }

//     const requestedBuilder = builderRequests.find(
//       (builder) =>
//         builder.email?.trim().toLowerCase() === normalizedEmail &&
//         builder.password === normalizedPassword
//     );

//     if (!requestedBuilder) {
//       return { status: "NotFound", builder: null, remark: "" };
//     }

//     return {
//       status: requestedBuilder.status || "Pending",
//       builder: requestedBuilder,
//       remark: requestedBuilder.remark || "",
//     };
//   };

//   const getDirectApprovedBuilder = () => {
//     const latestRequest = builderRequests[0];

//     if (!latestRequest) {
//       return { status: "NotFound", builder: null, remark: "" };
//     }

//     return {
//       status: latestRequest.status || "Pending",
//       builder: latestRequest,
//       remark: latestRequest.remark || "",
//     };
//   };

//   const addBuilderProject = (newProject) => {
//     const payload = normalizeProjectPayload(newProject, "Pending");

//     setBuilderProjects((prev) => {
//       const exists = prev.some((project) => project.id === payload.id);

//       return exists
//         ? prev.map((project) =>
//             project.id === payload.id ? { ...project, ...payload } : project
//           )
//         : [payload, ...prev];
//     });

//     setProjectRequests((prev) => {
//       const exists = prev.some((project) => project.id === payload.id);

//       return exists
//         ? prev.map((project) =>
//             project.id === payload.id ? { ...project, ...payload } : project
//           )
//         : [payload, ...prev];
//     });
//   };

//   const addProjectRequest = (newProject) => addBuilderProject(newProject);

//   const approveProjectRequest = (projectId, reviewMessage = "Approved by Super Admin") => {
//     const selectedProject =
//       projectRequests.find((project) => project.id === projectId) ||
//       builderProjects.find((project) => project.id === projectId);

//     if (!selectedProject) return;

//     const approvedProject = {
//       ...selectedProject,
//       approvalStatus: "Approved",
//       reviewedAt: new Date().toISOString(),
//       reviewMessage,
//       units: selectedProject.units || [],
//       complianceDocuments: selectedProject.complianceDocuments || [],
//     };

//     setProjectRequests((prev) =>
//       prev.map((project) => (project.id === projectId ? approvedProject : project))
//     );

//     setBuilderProjects((prev) =>
//       prev.map((project) => (project.id === projectId ? approvedProject : project))
//     );
//   };

//   const rejectProjectRequest = (projectId, reviewMessage = "Rejected by Super Admin") => {
//     setProjectRequests((prev) =>
//       prev.map((project) =>
//         project.id === projectId
//           ? {
//               ...project,
//               approvalStatus: "Rejected",
//               reviewedAt: new Date().toISOString(),
//               reviewMessage,
//             }
//           : project
//       )
//     );

//     setBuilderProjects((prev) =>
//       prev.map((project) =>
//         project.id === projectId
//           ? {
//               ...project,
//               approvalStatus: "Rejected",
//               reviewedAt: new Date().toISOString(),
//               reviewMessage,
//               sharedToCustomers: false,
//               customerVisible: false,
//             }
//           : project
//       )
//     );
//   };

//   const addUnitToProject = (projectId, newUnit) => {
//     const unitPayload = {
//       id: newUnit.id || `UNIT-${Date.now()}`,
//       unitNo: newUnit.unitNo || newUnit.flatNo || newUnit.name || "",
//       flatNo: newUnit.flatNo || newUnit.unitNo || "",
//       type: newUnit.type || "Flat",
//       size: newUnit.size || newUnit.area || "",
//       area: newUnit.area || newUnit.size || "",
//       price: newUnit.price || "",
//       floor: newUnit.floor || "",
//       facing: newUnit.facing || "",
//       status: newUnit.status || "Available",
//       images: newUnit.images || [],
//       documents: newUnit.documents || [],
//       customerVisible: newUnit.customerVisible !== false,
//       ...newUnit,
//       createdAt: newUnit.createdAt || new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     setBuilderProjects((prev) =>
//       prev.map((project) =>
//         project.id === projectId
//           ? { ...project, units: [unitPayload, ...(project.units || [])] }
//           : project
//       )
//     );

//     setProjectRequests((prev) =>
//       prev.map((project) =>
//         project.id === projectId
//           ? { ...project, units: [unitPayload, ...(project.units || [])] }
//           : project
//       )
//     );
//   };

//   const updateUnitInProject = (projectId, unitId, updates) => {
//     const updateUnits = (units = []) =>
//       units.map((unit) =>
//         unit.id === unitId
//           ? { ...unit, ...updates, updatedAt: new Date().toISOString() }
//           : unit
//       );

//     setBuilderProjects((prev) =>
//       prev.map((project) =>
//         project.id === projectId ? { ...project, units: updateUnits(project.units) } : project
//       )
//     );

//     setProjectRequests((prev) =>
//       prev.map((project) =>
//         project.id === projectId ? { ...project, units: updateUnits(project.units) } : project
//       )
//     );
//   };

//   const deleteUnitFromProject = (projectId, unitId) => {
//     const removeUnit = (units = []) => units.filter((unit) => unit.id !== unitId);

//     setBuilderProjects((prev) =>
//       prev.map((project) =>
//         project.id === projectId ? { ...project, units: removeUnit(project.units) } : project
//       )
//     );

//     setProjectRequests((prev) =>
//       prev.map((project) =>
//         project.id === projectId ? { ...project, units: removeUnit(project.units) } : project
//       )
//     );
//   };

//   const shareProjectToCustomers = (projectId) => {
//     setBuilderProjects((prev) =>
//       prev.map((project) =>
//         project.id === projectId && project.approvalStatus === "Approved"
//           ? {
//               ...project,
//               sharedToCustomers: true,
//               customerVisible: true,
//               sharedAt: new Date().toISOString(),
//             }
//           : project
//       )
//     );

//     setProjectRequests((prev) =>
//       prev.map((project) =>
//         project.id === projectId && project.approvalStatus === "Approved"
//           ? {
//               ...project,
//               sharedToCustomers: true,
//               customerVisible: true,
//               sharedAt: new Date().toISOString(),
//             }
//           : project
//       )
//     );
//   };

//   const getCustomerVisibleProjects = () =>
//     builderProjects.filter(
//       (project) =>
//         project.approvalStatus === "Approved" &&
//         project.customerVisible === true &&
//         project.sharedToCustomers === true
//     );

//   const addVisitRequest = (newRequest) => {
//     const request = {
//       id: `VISIT-${Date.now()}`,
//       ...newRequest,
//       status: "Pending",
//       builderMessage: "",
//       createdAt: new Date().toISOString(),
//       approvedAt: null,
//       rejectedAt: null,
//     };

//     setVisitRequests((prev) => [request, ...prev]);
//   };

//   const approveVisitRequest = (
//     requestId,
//     builderMessage = "Your slot booking is approved by builder."
//   ) => {
//     setVisitRequests((prev) =>
//       prev.map((item) =>
//         item.id === requestId
//           ? {
//               ...item,
//               status: "Approved",
//               builderMessage,
//               approvedAt: new Date().toISOString(),
//             }
//           : item
//       )
//     );
//   };

//   const rejectVisitRequest = (
//     requestId,
//     builderMessage = "Your slot booking was rejected by builder."
//   ) => {
//     setVisitRequests((prev) =>
//       prev.map((item) =>
//         item.id === requestId
//           ? {
//               ...item,
//               status: "Rejected",
//               builderMessage,
//               rejectedAt: new Date().toISOString(),
//             }
//           : item
//       )
//     );
//   };

//   const addFlatBookingRequest = (newRequest) => {
//     const totalAmount = parseAmount(
//       newRequest.totalAmount || newRequest.price || newRequest.bookingAmount || 0
//     );

//     const request = {
//       id: `BOOK-${Date.now()}`,
//       ...newRequest,
//       totalAmount,
//       paidAmount: Number(newRequest.paidAmount || 0),
//       paymentPercentage: 0,
//       possessionEligible: false,
//       certificateUnlockedAt: null,
//       paymentHistory: [],
//       status: "Pending Approval",
//       paymentStatus: newRequest.paymentStatus || "Pending",
//       documentStatus: newRequest.documentStatus || "Pending",
//       builderMessage: "",
//       createdAt: new Date().toLocaleString(),
//       createdAtIso: new Date().toISOString(),
//       approvedAt: null,
//       rejectedAt: null,
//     };

//     setFlatBookingRequests((prev) => [request, ...prev]);
//   };

//   const approveFlatBookingRequest = (
//     requestId,
//     builderMessage = "Your flat booking is approved by builder."
//   ) => {
//     setFlatBookingRequests((prev) =>
//       prev.map((item) =>
//         item.id === requestId
//           ? {
//               ...item,
//               status: "Approved",
//               builderMessage,
//               approvedAt: new Date().toISOString(),
//             }
//           : item
//       )
//     );
//   };

//   const rejectFlatBookingRequest = (
//     requestId,
//     builderMessage = "Your flat booking was rejected by builder."
//   ) => {
//     setFlatBookingRequests((prev) =>
//       prev.map((item) =>
//         item.id === requestId
//           ? {
//               ...item,
//               status: "Rejected",
//               builderMessage,
//               rejectedAt: new Date().toISOString(),
//             }
//           : item
//       )
//     );
//   };

//   const verifyFlatBookingDocuments = (requestId) => {
//     setFlatBookingRequests((prev) =>
//       prev.map((item) =>
//         item.id === requestId ? { ...item, documentStatus: "Verified" } : item
//       )
//     );
//   };

//   const markFlatBookingPaymentReceived = (requestId) => {
//     setFlatBookingRequests((prev) =>
//       prev.map((item) =>
//         item.id === requestId ? { ...item, paymentStatus: "Received" } : item
//       )
//     );
//   };

//   const getBookingTotalAmount = (booking) => {
//     return parseAmount(booking?.totalAmount || booking?.price || booking?.bookingAmount || 0);
//   };

//   const getPaymentPercentage = (booking) => {
//     const total = getBookingTotalAmount(booking);
//     const paid = Number(booking?.paidAmount || 0);

//     if (!total) return 0;
//     return Math.min(100, Math.floor((paid / total) * 100));
//   };

//   const addCustomerPayment = (bookingId, amount) => {
//     setFlatBookingRequests((prev) =>
//       prev.map((booking) => {
//         if (booking.id !== bookingId) return booking;

//         const totalAmount = getBookingTotalAmount(booking);
//         const currentPaid = Number(booking.paidAmount || 0);
//         const paymentAmount = Number(amount || 0);
//         const newPaid = Math.min(totalAmount, currentPaid + paymentAmount);
//         const percentage = totalAmount ? Math.floor((newPaid / totalAmount) * 100) : 0;

//         return {
//           ...booking,
//           totalAmount,
//           paidAmount: newPaid,
//           paymentPercentage: percentage,
//           paymentStatus: percentage >= 100 ? "Completed" : "Partially Paid",
//           possessionEligible: percentage >= 80,
//           certificateUnlockedAt:
//             percentage >= 80 && !booking.certificateUnlockedAt
//               ? new Date().toISOString()
//               : booking.certificateUnlockedAt || null,
//           paymentHistory: [
//             ...(booking.paymentHistory || []),
//             {
//               id: `PAY-${Date.now()}`,
//               amount: paymentAmount,
//               paidAt: new Date().toISOString(),
//               status: "Success",
//             },
//           ],
//         };
//       })
//     );
//   };

//   const updateWhiteLabelConfig = (updates) => {
//     setWhiteLabelConfig((prev) => ({ ...prev, ...updates }));
//   };

//   return (
//     <SocietyContext.Provider
//       value={{
//         societies,
//         addSociety,

//         builders,
//         setBuilders,
//         approveBuilder,
//         rejectBuilder,

//         builderRequests,
//         addBuilderRequest,
//         approveBuilderRequest,
//         rejectBuilderRequest,
//         getBuilderAccessStatus,
//         getDirectApprovedBuilder,

//         projectRequests,
//         builderProjects,
//         setBuilderProjects,
//         addBuilderProject,
//         addProjectRequest,
//         approveProjectRequest,
//         rejectProjectRequest,
//         shareProjectToCustomers,
//         getCustomerVisibleProjects,

//         addUnitToProject,
//         updateUnitInProject,
//         deleteUnitFromProject,

//         visitRequests,
//         addVisitRequest,
//         approveVisitRequest,
//         rejectVisitRequest,

//         flatBookingRequests,
//         addFlatBookingRequest,
//         approveFlatBookingRequest,
//         rejectFlatBookingRequest,
//         verifyFlatBookingDocuments,
//         markFlatBookingPaymentReceived,

//         addCustomerPayment,
//         getPaymentPercentage,
//         getBookingTotalAmount,

//         notifications,
//         setNotifications,
//         addNotification,

//         whiteLabelConfig,
//         updateWhiteLabelConfig,
//       }}
//     >
//       {children}
//     </SocietyContext.Provider>
//   );
// };

// export const useAppContext = () => useContext(SocietyContext);


















































// import React, { createContext, useState, useContext } from "react";
// import { societyRequests, builders as initialBuilders } from "../../data/superAdminData";

// const SocietyContext = createContext(null);

// const DEFAULT_PROJECT_IMAGE =
//   "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80";

// const parseAmount = (value) => {
//   if (typeof value === "number") return value;
//   if (!value) return 0;
//   const text = String(value).replace(/₹|,/g, "").trim().toLowerCase();
//   if (text.includes("cr")) return Number(text.replace("cr", "")) * 10000000;
//   if (text.includes("l")) return Number(text.replace("l", "")) * 100000;
//   return Number(text.replace(/[^\d.]/g, "")) || 0;
// };

// const initialProjectRequests = [
//   {
//     id: "PRJ-001",
//     builderId: "BLD-001",
//     builderName: "BuilderPro Developers",
//     builderEmail: "builderpro@example.com",
//     projectName: "Skyline Grand",
//     name: "Skyline Grand",
//     location: "Financial District",
//     reraNumber: "RERA/HYD/2026/001",
//     completionDate: "31 Dec 2028",
//     towerCount: "6",
//     totalUnits: "238",
//     availableUnits: "120",
//     priceRange: "₹85L - ₹1.8Cr",
//     description: "Premium gated community with luxury towers.",
//     coverImage: DEFAULT_PROJECT_IMAGE,
//     approvalStatus: "Pending",
//     sharedToCustomers: false,
//     customerVisible: false,
//     requestedAt: new Date().toISOString(),
//     reviewedAt: null,
//     reviewMessage: "",
//     units: [],
//     complianceDocuments: [],
//   },
// ];

// const normalizeProjectPayload = (project, status = "Pending") => ({
//   ...project,
//   id: project.id || `PRJ-${Date.now()}`,
//   projectName: project.projectName || project.name || "Untitled Project",
//   name: project.name || project.projectName || "Untitled Project",
//   coverImage: project.coverImage || DEFAULT_PROJECT_IMAGE,
//   approvalStatus: project.approvalStatus || status,
//   sharedToCustomers: project.sharedToCustomers || false,
//   customerVisible: project.customerVisible || false,
//   requestedAt: project.requestedAt || new Date().toISOString(),
//   reviewedAt: project.reviewedAt || null,
//   reviewMessage: project.reviewMessage || "",
//   units: project.units || [],
//   complianceDocuments: project.complianceDocuments || [],
// });

// export const SocietyProvider = ({ children }) => {
//   const [societies, setSocieties] = useState(societyRequests);
//   const [builders, setBuilders] = useState(initialBuilders);
//   const [projectRequests, setProjectRequests] = useState(initialProjectRequests);
//   const [builderProjects, setBuilderProjects] = useState(
//     initialProjectRequests.map((project) => normalizeProjectPayload(project))
//   );
//   const [builderRequests, setBuilderRequests] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [visitRequests, setVisitRequests] = useState([]);
//   const [flatBookingRequests, setFlatBookingRequests] = useState([]);
//   const [whiteLabelConfig, setWhiteLabelConfig] = useState({
//     logo: null,
//     primaryDomain: "goldenrich.in",
//     emailDomain: "mail.goldenrich.in",
//   });

//   // ─── Core notification creator ────────────────────────────────────────────
//   const addNotification = ({
//     title,
//     message,
//     builderId = null,
//     type = "info",
//     category = "general",
//   }) => {
//     setNotifications((prev) => [
//       {
//         id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
//         title,
//         message,
//         builderId,
//         type,
//         category, // "registration" | "visit" | "booking" | "project" | "general"
//         read: false,
//         time: new Date().toLocaleString(),
//         createdAt: new Date().toISOString(),
//       },
//       ...prev,
//     ]);
//   };

//   // ─── Society ──────────────────────────────────────────────────────────────
//   const addSociety = (newSociety) => setSocieties((prev) => [...prev, newSociety]);

//   // ─── Builder approve / reject (legacy builders list) ─────────────────────
//   const approveBuilder = (builderId) => {
//     setBuilders((prev) =>
//       prev.map((b) => (b.id === builderId ? { ...b, status: "Approved" } : b))
//     );
//   };

//   const rejectBuilder = (builderId) => {
//     setBuilders((prev) =>
//       prev.map((b) => (b.id === builderId ? { ...b, status: "Rejected" } : b))
//     );
//   };

//   // ─── Builder Registration Request ─────────────────────────────────────────
//   const addBuilderRequest = (newBuilder) => {
//     const payload = {
//       id: `BLD-${Date.now()}`,
//       name: newBuilder.companyName?.trim() || "Unnamed Builder",
//       companyName: newBuilder.companyName?.trim() || "",
//       city: newBuilder.city?.trim() || "Hyderabad",
//       rera: newBuilder.reraNumber?.trim() || "",
//       reraNumber: newBuilder.reraNumber?.trim() || "",
//       gst: newBuilder.gst?.trim() || "",
//       email: newBuilder.email?.trim().toLowerCase() || "",
//       phone: newBuilder.phone?.trim() || "",
//       password: newBuilder.password || "",
//       documents: newBuilder.documents || {},
//       projects: 0,
//       collections: "₹0",
//       status: "Pending",
//       remark: "",
//       createdAt: new Date().toISOString(),
//       reviewedAt: null,
//     };

//     setBuilderRequests((prev) => [payload, ...prev]);

//     // 🔔 Notify Super Admin (builderId = null → super admin notification)
//     addNotification({
//       title: "New Builder Registration",
//       message: `${payload.companyName} has submitted a registration request and is awaiting your approval.`,
//       builderId: null,
//       type: "info",
//       category: "registration",
//     });
//   };

//   // ─── Builder Registration Approval ────────────────────────────────────────
//   const approveBuilderRequest = (builderId) => {
//     const selectedBuilder = builderRequests.find((b) => b.id === builderId);
//     if (!selectedBuilder) return;

//     setBuilders((prev) => [
//       {
//         id: selectedBuilder.id,
//         name: selectedBuilder.name,
//         companyName: selectedBuilder.companyName,
//         city: selectedBuilder.city || "Hyderabad",
//         projects: 0,
//         rera: selectedBuilder.rera || selectedBuilder.reraNumber || "",
//         collections: "₹0",
//         status: "Approved",
//         email: selectedBuilder.email || "",
//         phone: selectedBuilder.phone || "",
//         password: selectedBuilder.password || "",
//         gst: selectedBuilder.gst || "",
//         documents: selectedBuilder.documents || {},
//       },
//       ...prev,
//     ]);

//     setBuilderRequests((prev) =>
//       prev.map((b) =>
//         b.id === builderId
//           ? { ...b, status: "Approved", reviewedAt: new Date().toISOString(), remark: "" }
//           : b
//       )
//     );

//     // 🔔 Notify the builder that their registration was approved
//     addNotification({
//       title: "✅ Registration Approved",
//       message: `Your builder registration for "${selectedBuilder.companyName}" has been approved by Super Admin. You can now access your dashboard.`,
//       builderId: builderId,
//       type: "success",
//       category: "registration",
//     });
//   };

//   // ─── Builder Registration Rejection ───────────────────────────────────────
//   const rejectBuilderRequest = (builderId, remark = "") => {
//     const selectedBuilder = builderRequests.find((b) => b.id === builderId);

//     setBuilderRequests((prev) =>
//       prev.map((b) =>
//         b.id === builderId
//           ? {
//               ...b,
//               status: "Rejected",
//               reviewedAt: new Date().toISOString(),
//               remark: remark?.trim() || "Rejected by Super Admin",
//             }
//           : b
//       )
//     );

//     // 🔔 Notify the builder that their registration was rejected
//     addNotification({
//       title: "❌ Registration Rejected",
//       message: `Your builder registration for "${selectedBuilder?.companyName || "your company"}" was rejected. Reason: ${remark?.trim() || "Rejected by Super Admin"}`,
//       builderId: builderId,
//       type: "danger",
//       category: "registration",
//     });
//   };

//   // ─── Builder Access ────────────────────────────────────────────────────────
//   const getBuilderAccessStatus = ({ email, password }) => {
//     const normalizedEmail = email?.trim().toLowerCase();
//     const approvedBuilder = builders.find(
//       (b) =>
//         b.email?.trim().toLowerCase() === normalizedEmail &&
//         b.password === password &&
//         b.status === "Approved"
//     );
//     if (approvedBuilder) return { status: "Approved", builder: approvedBuilder, remark: "" };

//     const requestedBuilder = builderRequests.find(
//       (b) =>
//         b.email?.trim().toLowerCase() === normalizedEmail && b.password === password
//     );
//     if (!requestedBuilder) return { status: "NotFound", builder: null, remark: "" };

//     return {
//       status: requestedBuilder.status || "Pending",
//       builder: requestedBuilder,
//       remark: requestedBuilder.remark || "",
//     };
//   };

//   const getDirectApprovedBuilder = () => {
//     const latestRequest = builderRequests[0];
//     if (!latestRequest) return { status: "NotFound", builder: null, remark: "" };
//     return {
//       status: latestRequest.status || "Pending",
//       builder: latestRequest,
//       remark: latestRequest.remark || "",
//     };
//   };

//   // ─── Projects ─────────────────────────────────────────────────────────────
//   const addBuilderProject = (newProject) => {
//     const payload = normalizeProjectPayload(newProject, "Pending");

//     setBuilderProjects((prev) => {
//       const exists = prev.some((p) => p.id === payload.id);
//       return exists
//         ? prev.map((p) => (p.id === payload.id ? { ...p, ...payload } : p))
//         : [payload, ...prev];
//     });

//     setProjectRequests((prev) => {
//       const exists = prev.some((p) => p.id === payload.id);
//       return exists
//         ? prev.map((p) => (p.id === payload.id ? { ...p, ...payload } : p))
//         : [payload, ...prev];
//     });

//     // 🔔 Notify Super Admin of new project submission
//     addNotification({
//       title: "New Project Submitted",
//       message: `Builder "${payload.builderName}" submitted project "${payload.projectName}" for approval.`,
//       builderId: null,
//       type: "info",
//       category: "project",
//     });
//   };

//   const addProjectRequest = (newProject) => addBuilderProject(newProject);

//   const approveProjectRequest = (projectId, reviewMessage = "Approved by Super Admin") => {
//     const selectedProject =
//       projectRequests.find((p) => p.id === projectId) ||
//       builderProjects.find((p) => p.id === projectId);

//     if (!selectedProject) return;

//     const approvedProject = {
//       ...selectedProject,
//       approvalStatus: "Approved",
//       reviewedAt: new Date().toISOString(),
//       reviewMessage,
//       units: selectedProject.units || [],
//       complianceDocuments: selectedProject.complianceDocuments || [],
//     };

//     setProjectRequests((prev) =>
//       prev.map((p) => (p.id === projectId ? approvedProject : p))
//     );
//     setBuilderProjects((prev) =>
//       prev.map((p) => (p.id === projectId ? approvedProject : p))
//     );

//     // 🔔 Notify the builder that project was approved
//     addNotification({
//       title: "✅ Project Approved",
//       message: `Your project "${selectedProject.projectName}" has been approved by Super Admin. You can now add units.`,
//       builderId: selectedProject.builderId || null,
//       type: "success",
//       category: "project",
//     });
//   };

//   const rejectProjectRequest = (projectId, reviewMessage = "Rejected by Super Admin") => {
//     const selectedProject =
//       projectRequests.find((p) => p.id === projectId) ||
//       builderProjects.find((p) => p.id === projectId);

//     setProjectRequests((prev) =>
//       prev.map((p) =>
//         p.id === projectId
//           ? { ...p, approvalStatus: "Rejected", reviewedAt: new Date().toISOString(), reviewMessage }
//           : p
//       )
//     );
//     setBuilderProjects((prev) =>
//       prev.map((p) =>
//         p.id === projectId
//           ? {
//               ...p,
//               approvalStatus: "Rejected",
//               reviewedAt: new Date().toISOString(),
//               reviewMessage,
//               sharedToCustomers: false,
//               customerVisible: false,
//             }
//           : p
//       )
//     );

//     // 🔔 Notify the builder that project was rejected
//     addNotification({
//       title: "❌ Project Rejected",
//       message: `Your project "${selectedProject?.projectName || "Unnamed"}" was rejected. Reason: ${reviewMessage}`,
//       builderId: selectedProject?.builderId || null,
//       type: "danger",
//       category: "project",
//     });
//   };

//   // ─── Units ────────────────────────────────────────────────────────────────
//   const addUnitToProject = (projectId, newUnit) => {
//     const unitPayload = {
//       id: newUnit.id || `UNIT-${Date.now()}`,
//       unitNo: newUnit.unitNo || newUnit.flatNo || newUnit.name || "",
//       flatNo: newUnit.flatNo || newUnit.unitNo || "",
//       type: newUnit.type || "Flat",
//       size: newUnit.size || newUnit.area || "",
//       area: newUnit.area || newUnit.size || "",
//       price: newUnit.price || "",
//       floor: newUnit.floor || "",
//       facing: newUnit.facing || "",
//       status: newUnit.status || "Available",
//       images: newUnit.images || [],
//       documents: newUnit.documents || [],
//       customerVisible: newUnit.customerVisible !== false,
//       ...newUnit,
//       createdAt: newUnit.createdAt || new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     setBuilderProjects((prev) =>
//       prev.map((p) =>
//         p.id === projectId ? { ...p, units: [unitPayload, ...(p.units || [])] } : p
//       )
//     );
//     setProjectRequests((prev) =>
//       prev.map((p) =>
//         p.id === projectId ? { ...p, units: [unitPayload, ...(p.units || [])] } : p
//       )
//     );
//   };

//   const updateUnitInProject = (projectId, unitId, updates) => {
//     const updateUnits = (units = []) =>
//       units.map((u) =>
//         u.id === unitId ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u
//       );
//     setBuilderProjects((prev) =>
//       prev.map((p) => (p.id === projectId ? { ...p, units: updateUnits(p.units) } : p))
//     );
//     setProjectRequests((prev) =>
//       prev.map((p) => (p.id === projectId ? { ...p, units: updateUnits(p.units) } : p))
//     );
//   };

//   const deleteUnitFromProject = (projectId, unitId) => {
//     const removeUnit = (units = []) => units.filter((u) => u.id !== unitId);
//     setBuilderProjects((prev) =>
//       prev.map((p) => (p.id === projectId ? { ...p, units: removeUnit(p.units) } : p))
//     );
//     setProjectRequests((prev) =>
//       prev.map((p) => (p.id === projectId ? { ...p, units: removeUnit(p.units) } : p))
//     );
//   };

//   // ─── Share to Customers ───────────────────────────────────────────────────
//   const shareProjectToCustomers = (projectId) => {
//     setBuilderProjects((prev) =>
//       prev.map((p) =>
//         p.id === projectId && p.approvalStatus === "Approved"
//           ? { ...p, sharedToCustomers: true, customerVisible: true, sharedAt: new Date().toISOString() }
//           : p
//       )
//     );
//     setProjectRequests((prev) =>
//       prev.map((p) =>
//         p.id === projectId && p.approvalStatus === "Approved"
//           ? { ...p, sharedToCustomers: true, customerVisible: true, sharedAt: new Date().toISOString() }
//           : p
//       )
//     );
//   };

//   const getCustomerVisibleProjects = () =>
//     builderProjects.filter(
//       (p) =>
//         p.approvalStatus === "Approved" &&
//         p.customerVisible === true &&
//         p.sharedToCustomers === true
//     );

//   // ─── Visit Requests ───────────────────────────────────────────────────────
//   const addVisitRequest = (newRequest) => {
//     const request = {
//       id: `VISIT-${Date.now()}`,
//       ...newRequest,
//       status: "Pending",
//       builderMessage: "",
//       createdAt: new Date().toISOString(),
//       approvedAt: null,
//       rejectedAt: null,
//     };

//     setVisitRequests((prev) => [request, ...prev]);

//     // 🔔 Notify the builder about new slot visit request
//     addNotification({
//       title: "📅 New Slot Visit Request",
//       message: `${newRequest.customerName || "A customer"} requested a site visit for Unit ${newRequest.unitNumber || ""} in "${newRequest.projectName || "your project"}" on ${newRequest.visitDate || ""} at ${newRequest.visitTime || ""}.`,
//       builderId: newRequest.builderId || null,
//       type: "info",
//       category: "visit",
//     });
//   };

//   const approveVisitRequest = (
//     requestId,
//     builderMessage = "Your slot booking is approved by builder."
//   ) => {
//     const selectedVisit = visitRequests.find((v) => v.id === requestId);

//     setVisitRequests((prev) =>
//       prev.map((item) =>
//         item.id === requestId
//           ? { ...item, status: "Approved", builderMessage, approvedAt: new Date().toISOString() }
//           : item
//       )
//     );

//     // 🔔 Notify the customer (stored as a general notification — customerId based if needed)
//     addNotification({
//       title: "✅ Visit Request Approved",
//       message: `Slot visit for Unit ${selectedVisit?.unitNumber || ""} in "${selectedVisit?.projectName || ""}" has been approved. ${builderMessage}`,
//       builderId: selectedVisit?.builderId || null,
//       type: "success",
//       category: "visit",
//     });
//   };

//   const rejectVisitRequest = (
//     requestId,
//     builderMessage = "Your slot booking was rejected by builder."
//   ) => {
//     const selectedVisit = visitRequests.find((v) => v.id === requestId);

//     setVisitRequests((prev) =>
//       prev.map((item) =>
//         item.id === requestId
//           ? { ...item, status: "Rejected", builderMessage, rejectedAt: new Date().toISOString() }
//           : item
//       )
//     );

//     // 🔔 Notify
//     addNotification({
//       title: "❌ Visit Request Rejected",
//       message: `Slot visit for Unit ${selectedVisit?.unitNumber || ""} in "${selectedVisit?.projectName || ""}" was rejected. ${builderMessage}`,
//       builderId: selectedVisit?.builderId || null,
//       type: "danger",
//       category: "visit",
//     });
//   };

//   // ─── Flat Booking Requests ────────────────────────────────────────────────
//   const addFlatBookingRequest = (newRequest) => {
//     const totalAmount = parseAmount(
//       newRequest.totalAmount || newRequest.price || newRequest.bookingAmount || 0
//     );

//     const request = {
//       id: `BOOK-${Date.now()}`,
//       ...newRequest,
//       totalAmount,
//       paidAmount: Number(newRequest.paidAmount || 0),
//       paymentPercentage: 0,
//       possessionEligible: false,
//       certificateUnlockedAt: null,
//       paymentHistory: [],
//       status: "Pending Approval",
//       paymentStatus: newRequest.paymentStatus || "Pending",
//       documentStatus: newRequest.documentStatus || "Pending",
//       builderMessage: "",
//       createdAt: new Date().toLocaleString(),
//       createdAtIso: new Date().toISOString(),
//       approvedAt: null,
//       rejectedAt: null,
//     };

//     setFlatBookingRequests((prev) => [request, ...prev]);

//     // 🔔 Notify the builder about new flat booking
//     addNotification({
//       title: "🏠 New Flat Booking Request",
//       message: `${newRequest.customerName || newRequest.guestName || "A customer"} submitted a booking request for Unit ${newRequest.unitNo || newRequest.unitNumber || ""} in "${newRequest.projectName || "your project"}".`,
//       builderId: newRequest.builderId || null,
//       type: "warning",
//       category: "booking",
//     });
//   };

//   const approveFlatBookingRequest = (
//     requestId,
//     builderMessage = "Your flat booking is approved by builder."
//   ) => {
//     const selectedBooking = flatBookingRequests.find((b) => b.id === requestId);

//     setFlatBookingRequests((prev) =>
//       prev.map((item) =>
//         item.id === requestId
//           ? { ...item, status: "Approved", builderMessage, approvedAt: new Date().toISOString() }
//           : item
//       )
//     );

//     // 🔔 Notify
//     addNotification({
//       title: "✅ Flat Booking Approved",
//       message: `Booking for Unit ${selectedBooking?.unitNo || selectedBooking?.unitNumber || ""} in "${selectedBooking?.projectName || ""}" has been approved. ${builderMessage}`,
//       builderId: selectedBooking?.builderId || null,
//       type: "success",
//       category: "booking",
//     });
//   };

//   const rejectFlatBookingRequest = (
//     requestId,
//     builderMessage = "Your flat booking was rejected by builder."
//   ) => {
//     const selectedBooking = flatBookingRequests.find((b) => b.id === requestId);

//     setFlatBookingRequests((prev) =>
//       prev.map((item) =>
//         item.id === requestId
//           ? { ...item, status: "Rejected", builderMessage, rejectedAt: new Date().toISOString() }
//           : item
//       )
//     );

//     // 🔔 Notify
//     addNotification({
//       title: "❌ Flat Booking Rejected",
//       message: `Booking for Unit ${selectedBooking?.unitNo || selectedBooking?.unitNumber || ""} in "${selectedBooking?.projectName || ""}" was rejected. ${builderMessage}`,
//       builderId: selectedBooking?.builderId || null,
//       type: "danger",
//       category: "booking",
//     });
//   };

//   const verifyFlatBookingDocuments = (requestId) => {
//     setFlatBookingRequests((prev) =>
//       prev.map((item) =>
//         item.id === requestId ? { ...item, documentStatus: "Verified" } : item
//       )
//     );
//   };

//   const markFlatBookingPaymentReceived = (requestId) => {
//     setFlatBookingRequests((prev) =>
//       prev.map((item) =>
//         item.id === requestId ? { ...item, paymentStatus: "Received" } : item
//       )
//     );
//   };

//   // ─── Payment ──────────────────────────────────────────────────────────────
//   const getBookingTotalAmount = (booking) =>
//     parseAmount(booking?.totalAmount || booking?.price || booking?.bookingAmount || 0);

//   const getPaymentPercentage = (booking) => {
//     const total = getBookingTotalAmount(booking);
//     const paid = Number(booking?.paidAmount || 0);
//     if (!total) return 0;
//     return Math.min(100, Math.floor((paid / total) * 100));
//   };

//   const addCustomerPayment = (bookingId, amount) => {
//     setFlatBookingRequests((prev) =>
//       prev.map((booking) => {
//         if (booking.id !== bookingId) return booking;

//         const totalAmount = getBookingTotalAmount(booking);
//         const currentPaid = Number(booking.paidAmount || 0);
//         const paymentAmount = Number(amount || 0);
//         const newPaid = Math.min(totalAmount, currentPaid + paymentAmount);
//         const percentage = totalAmount ? Math.floor((newPaid / totalAmount) * 100) : 0;

//         return {
//           ...booking,
//           totalAmount,
//           paidAmount: newPaid,
//           paymentPercentage: percentage,
//           paymentStatus: percentage >= 100 ? "Completed" : "Partially Paid",
//           possessionEligible: percentage >= 80,
//           certificateUnlockedAt:
//             percentage >= 80 && !booking.certificateUnlockedAt
//               ? new Date().toISOString()
//               : booking.certificateUnlockedAt || null,
//           paymentHistory: [
//             ...(booking.paymentHistory || []),
//             {
//               id: `PAY-${Date.now()}`,
//               amount: paymentAmount,
//               paidAt: new Date().toISOString(),
//               status: "Success",
//             },
//           ],
//         };
//       })
//     );
//   };

//   // ─── White Label ──────────────────────────────────────────────────────────
//   const updateWhiteLabelConfig = (updates) => {
//     setWhiteLabelConfig((prev) => ({ ...prev, ...updates }));
//   };

//   return (
//     <SocietyContext.Provider
//       value={{
//         societies,
//         addSociety,

//         builders,
//         setBuilders,
//         approveBuilder,
//         rejectBuilder,

//         builderRequests,
//         addBuilderRequest,
//         approveBuilderRequest,
//         rejectBuilderRequest,
//         getBuilderAccessStatus,
//         getDirectApprovedBuilder,

//         projectRequests,
//         builderProjects,
//         setBuilderProjects,
//         addBuilderProject,
//         addProjectRequest,
//         approveProjectRequest,
//         rejectProjectRequest,
//         shareProjectToCustomers,
//         getCustomerVisibleProjects,

//         addUnitToProject,
//         updateUnitInProject,
//         deleteUnitFromProject,

//         visitRequests,
//         addVisitRequest,
//         approveVisitRequest,
//         rejectVisitRequest,

//         flatBookingRequests,
//         addFlatBookingRequest,
//         approveFlatBookingRequest,
//         rejectFlatBookingRequest,
//         verifyFlatBookingDocuments,
//         markFlatBookingPaymentReceived,

//         addCustomerPayment,
//         getPaymentPercentage,
//         getBookingTotalAmount,

//         notifications,
//         setNotifications,
//         addNotification,

//         whiteLabelConfig,
//         updateWhiteLabelConfig,
//       }}
//     >
//       {children}
//     </SocietyContext.Provider>
//   );
// };

// export const useAppContext = () => useContext(SocietyContext);  


































import React, { createContext, useState, useContext } from "react";
import { societyRequests, builders as initialBuilders } from "../../data/superAdminData";

const SocietyContext = createContext(null);

const DEFAULT_PROJECT_IMAGE =
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80";

const parseAmount = (value) => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const text = String(value).replace(/₹|,/g, "").trim().toLowerCase();
  if (text.includes("cr")) return Number(text.replace("cr", "")) * 10000000;
  if (text.includes("l")) return Number(text.replace("l", "")) * 100000;
  return Number(text.replace(/[^\d.]/g, "")) || 0;
};

const initialProjectRequests = [
  {
    id: "PRJ-001",
    builderId: "BLD-001",
    builderName: "BuilderPro Developers",
    builderEmail: "builderpro@example.com",
    projectName: "Skyline Grand",
    name: "Skyline Grand",
    location: "Financial District",
    reraNumber: "RERA/HYD/2026/001",
    completionDate: "31 Dec 2028",
    towerCount: "6",
    totalUnits: "238",
    availableUnits: "120",
    priceRange: "₹85L - ₹1.8Cr",
    description: "Premium gated community with luxury towers.",
    coverImage: DEFAULT_PROJECT_IMAGE,
    approvalStatus: "Pending",
    sharedToCustomers: false,
    customerVisible: false,
    requestedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewMessage: "",
    units: [],
    complianceDocuments: [],
  },
];

const normalizeProjectPayload = (project, status = "Pending") => ({
  ...project,
  id: project.id || `PRJ-${Date.now()}`,
  projectName: project.projectName || project.name || "Untitled Project",
  name: project.name || project.projectName || "Untitled Project",
  coverImage: project.coverImage || DEFAULT_PROJECT_IMAGE,
  approvalStatus: project.approvalStatus || status,
  sharedToCustomers: project.sharedToCustomers || false,
  customerVisible: project.customerVisible || false,
  requestedAt: project.requestedAt || new Date().toISOString(),
  reviewedAt: project.reviewedAt || null,
  reviewMessage: project.reviewMessage || "",
  units: project.units || [],
  complianceDocuments: project.complianceDocuments || [],
});

export const SocietyProvider = ({ children }) => {
  const [societies, setSocieties] = useState(societyRequests);
  const [builders, setBuilders] = useState(initialBuilders);
  const [projectRequests, setProjectRequests] = useState(initialProjectRequests);
  const [builderProjects, setBuilderProjects] = useState(
    initialProjectRequests.map((project) => normalizeProjectPayload(project))
  );
  const [builderRequests, setBuilderRequests] = useState([]);

  // ─── NEW: Admin Requests ──────────────────────────────────────────────────
  const [adminRequests, setAdminRequests] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [visitRequests, setVisitRequests] = useState([]);
  const [flatBookingRequests, setFlatBookingRequests] = useState([]);
  const [whiteLabelConfig, setWhiteLabelConfig] = useState({
    logo: null,
    primaryDomain: "goldenrich.in",
    emailDomain: "mail.goldenrich.in",
  });

  // ─── Core notification creator ────────────────────────────────────────────
  const addNotification = ({
    title,
    message,
    builderId = null,
    type = "info",
    category = "general",
    targetRole = null,
    screen = null,
    screenParams = null,
  }) => {
    setNotifications((prev) => [
      {
        id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title,
        message,
        builderId,
        type,
        category,
        targetRole,   // "superadmin" | "admin" | "resident" | etc.
        screen,       // screen to navigate to on tap
        screenParams, // params to pass when navigating
        read: false,
        time: new Date().toLocaleString(),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // ─── Society ──────────────────────────────────────────────────────────────
  const addSociety = (newSociety) => setSocieties((prev) => [...prev, newSociety]);

  // ─── Builder approve / reject (legacy builders list) ─────────────────────
  const approveBuilder = (builderId) => {
    setBuilders((prev) =>
      prev.map((b) => (b.id === builderId ? { ...b, status: "Approved" } : b))
    );
  };

  const rejectBuilder = (builderId) => {
    setBuilders((prev) =>
      prev.map((b) => (b.id === builderId ? { ...b, status: "Rejected" } : b))
    );
  };

  // ─── Builder Registration Request ─────────────────────────────────────────
  const addBuilderRequest = (newBuilder) => {
    const payload = {
      id: `BLD-${Date.now()}`,
      name: newBuilder.companyName?.trim() || "Unnamed Builder",
      companyName: newBuilder.companyName?.trim() || "",
      city: newBuilder.city?.trim() || "Hyderabad",
      rera: newBuilder.reraNumber?.trim() || "",
      reraNumber: newBuilder.reraNumber?.trim() || "",
      gst: newBuilder.gst?.trim() || "",
      email: newBuilder.email?.trim().toLowerCase() || "",
      phone: newBuilder.phone?.trim() || "",
      password: newBuilder.password || "",
      documents: newBuilder.documents || {},
      projects: 0,
      collections: "₹0",
      status: "Pending",
      remark: "",
      createdAt: new Date().toISOString(),
      reviewedAt: null,
    };

    setBuilderRequests((prev) => [payload, ...prev]);

    addNotification({
      title: "New Builder Registration",
      message: `${payload.companyName} has submitted a registration request and is awaiting your approval.`,
      builderId: null,
      type: "info",
      category: "registration",
      targetRole: "superadmin",
      screen: "Builders",
    });
  };

  // ─── Builder Registration Approval ────────────────────────────────────────
  const approveBuilderRequest = (builderId) => {
    const selectedBuilder = builderRequests.find((b) => b.id === builderId);
    if (!selectedBuilder) return;

    setBuilders((prev) => [
      {
        id: selectedBuilder.id,
        name: selectedBuilder.name,
        companyName: selectedBuilder.companyName,
        city: selectedBuilder.city || "Hyderabad",
        projects: 0,
        rera: selectedBuilder.rera || selectedBuilder.reraNumber || "",
        collections: "₹0",
        status: "Approved",
        email: selectedBuilder.email || "",
        phone: selectedBuilder.phone || "",
        password: selectedBuilder.password || "",
        gst: selectedBuilder.gst || "",
        documents: selectedBuilder.documents || {},
      },
      ...prev,
    ]);

    setBuilderRequests((prev) =>
      prev.map((b) =>
        b.id === builderId
          ? { ...b, status: "Approved", reviewedAt: new Date().toISOString(), remark: "" }
          : b
      )
    );

    addNotification({
      title: "✅ Registration Approved",
      message: `Your builder registration for "${selectedBuilder.companyName}" has been approved by Super Admin.`,
      builderId: builderId,
      type: "success",
      category: "registration",
    });
  };

  // ─── Builder Registration Rejection ───────────────────────────────────────
  const rejectBuilderRequest = (builderId, remark = "") => {
    const selectedBuilder = builderRequests.find((b) => b.id === builderId);

    setBuilderRequests((prev) =>
      prev.map((b) =>
        b.id === builderId
          ? {
              ...b,
              status: "Rejected",
              reviewedAt: new Date().toISOString(),
              remark: remark?.trim() || "Rejected by Super Admin",
            }
          : b
      )
    );

    addNotification({
      title: "❌ Registration Rejected",
      message: `Your builder registration for "${selectedBuilder?.companyName || "your company"}" was rejected. Reason: ${remark?.trim() || "Rejected by Super Admin"}`,
      builderId: builderId,
      type: "danger",
      category: "registration",
    });
  };

  // ─── Builder Access ────────────────────────────────────────────────────────
  const getBuilderAccessStatus = ({ email, password }) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const approvedBuilder = builders.find(
      (b) =>
        b.email?.trim().toLowerCase() === normalizedEmail &&
        b.password === password &&
        b.status === "Approved"
    );
    if (approvedBuilder) return { status: "Approved", builder: approvedBuilder, remark: "" };

    const requestedBuilder = builderRequests.find(
      (b) =>
        b.email?.trim().toLowerCase() === normalizedEmail && b.password === password
    );
    if (!requestedBuilder) return { status: "NotFound", builder: null, remark: "" };

    return {
      status: requestedBuilder.status || "Pending",
      builder: requestedBuilder,
      remark: requestedBuilder.remark || "",
    };
  };

  const getDirectApprovedBuilder = () => {
    const latestRequest = builderRequests[0];
    if (!latestRequest) return { status: "NotFound", builder: null, remark: "" };
    return {
      status: latestRequest.status || "Pending",
      builder: latestRequest,
      remark: latestRequest.remark || "",
    };
  };

  // ─── NEW: Admin Registration Request ─────────────────────────────────────
  const addAdminRequest = (newAdmin) => {
    const payload = {
      id: `ADM-${Date.now()}`,
      name: newAdmin.name?.trim() || "Unnamed Admin",
      emailOrMobile: newAdmin.emailOrMobile?.trim().toLowerCase() || "",
      phone: newAdmin.phone?.trim() || "",
      password: newAdmin.password || "",
      societyName: newAdmin.societyName?.trim() || "",
      adminDesignation: newAdmin.adminDesignation?.trim() || "",
      adminIdFile: newAdmin.adminIdFile || null,
      societyRegFile: newAdmin.societyRegFile || null,
      adminAddressProofFile: newAdmin.adminAddressProofFile || null,
      supportingDocFile: newAdmin.supportingDocFile || null,
      approvalStatus: "Pending",
      remark: "",
      role: "admin",
      createdAt: new Date().toISOString(),
      reviewedAt: null,
    };

    setAdminRequests((prev) => [payload, ...prev]);

    // 🔔 Notify Super Admin about new admin request
    addNotification({
      title: "🏢 New Admin Request",
      message: `${payload.name} submitted an admin registration request for "${payload.societyName}". Tap to review.`,
      builderId: null,
      type: "info",
      category: "admin_registration",
      targetRole: "superadmin",
      screen: "NewAdminRequest", // SuperAdmin navigator screen name
      screenParams: null,
    });

    return payload;
  };

  // ─── NEW: Approve Admin Request ───────────────────────────────────────────
  const approveAdminRequest = (adminId, remark = "") => {
    setAdminRequests((prev) =>
      prev.map((a) =>
        a.id === adminId
          ? {
              ...a,
              approvalStatus: "Approved",
              remark: remark || "Approved by Super Admin",
              reviewedAt: new Date().toISOString(),
            }
          : a
      )
    );

    const selectedAdmin = adminRequests.find((a) => a.id === adminId);

    addNotification({
      title: "✅ Admin Request Approved",
      message: `Admin registration for "${selectedAdmin?.name || "Admin"}" (${selectedAdmin?.societyName || ""}) has been approved.`,
      builderId: null,
      type: "success",
      category: "admin_registration",
      targetRole: "admin",
    });
  };

  // ─── NEW: Reject Admin Request ────────────────────────────────────────────
  const rejectAdminRequest = (adminId, remark = "") => {
    setAdminRequests((prev) =>
      prev.map((a) =>
        a.id === adminId
          ? {
              ...a,
              approvalStatus: "Rejected",
              remark: remark?.trim() || "Rejected by Super Admin",
              reviewedAt: new Date().toISOString(),
            }
          : a
      )
    );

    const selectedAdmin = adminRequests.find((a) => a.id === adminId);

    addNotification({
      title: "❌ Admin Request Rejected",
      message: `Admin registration for "${selectedAdmin?.name || "Admin"}" was rejected. Reason: ${remark?.trim() || "Rejected by Super Admin"}`,
      builderId: null,
      type: "danger",
      category: "admin_registration",
      targetRole: "admin",
    });
  };

  // ─── NEW: Get Admin Login Status ──────────────────────────────────────────
  const getAdminAccessStatus = ({ emailOrMobile, password }) => {
    const normalized = emailOrMobile?.trim().toLowerCase();
    const found = adminRequests.find(
      (a) =>
        a.emailOrMobile?.trim().toLowerCase() === normalized &&
        a.password === password
    );
    if (!found) return { status: "NotFound", admin: null, remark: "" };
    return {
      status: found.approvalStatus || "Pending",
      admin: found,
      remark: found.remark || "",
    };
  };

  // ─── Projects ─────────────────────────────────────────────────────────────
  const addBuilderProject = (newProject) => {
    const payload = normalizeProjectPayload(newProject, "Pending");

    setBuilderProjects((prev) => {
      const exists = prev.some((p) => p.id === payload.id);
      return exists
        ? prev.map((p) => (p.id === payload.id ? { ...p, ...payload } : p))
        : [payload, ...prev];
    });

    setProjectRequests((prev) => {
      const exists = prev.some((p) => p.id === payload.id);
      return exists
        ? prev.map((p) => (p.id === payload.id ? { ...p, ...payload } : p))
        : [payload, ...prev];
    });

    addNotification({
      title: "New Project Submitted",
      message: `Builder "${payload.builderName}" submitted project "${payload.projectName}" for approval.`,
      builderId: null,
      type: "info",
      category: "project",
      targetRole: "superadmin",
      screen: "Builders",
    });
  };

  const addProjectRequest = (newProject) => addBuilderProject(newProject);

  const approveProjectRequest = (projectId, reviewMessage = "Approved by Super Admin") => {
    const selectedProject =
      projectRequests.find((p) => p.id === projectId) ||
      builderProjects.find((p) => p.id === projectId);

    if (!selectedProject) return;

    const approvedProject = {
      ...selectedProject,
      approvalStatus: "Approved",
      reviewedAt: new Date().toISOString(),
      reviewMessage,
      units: selectedProject.units || [],
      complianceDocuments: selectedProject.complianceDocuments || [],
    };

    setProjectRequests((prev) =>
      prev.map((p) => (p.id === projectId ? approvedProject : p))
    );
    setBuilderProjects((prev) =>
      prev.map((p) => (p.id === projectId ? approvedProject : p))
    );

    addNotification({
      title: "✅ Project Approved",
      message: `Your project "${selectedProject.projectName}" has been approved by Super Admin.`,
      builderId: selectedProject.builderId || null,
      type: "success",
      category: "project",
    });
  };

  const rejectProjectRequest = (projectId, reviewMessage = "Rejected by Super Admin") => {
    const selectedProject =
      projectRequests.find((p) => p.id === projectId) ||
      builderProjects.find((p) => p.id === projectId);

    setProjectRequests((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, approvalStatus: "Rejected", reviewedAt: new Date().toISOString(), reviewMessage }
          : p
      )
    );
    setBuilderProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              approvalStatus: "Rejected",
              reviewedAt: new Date().toISOString(),
              reviewMessage,
              sharedToCustomers: false,
              customerVisible: false,
            }
          : p
      )
    );

    addNotification({
      title: "❌ Project Rejected",
      message: `Your project "${selectedProject?.projectName || "Unnamed"}" was rejected. Reason: ${reviewMessage}`,
      builderId: selectedProject?.builderId || null,
      type: "danger",
      category: "project",
    });
  };

  // ─── Units ────────────────────────────────────────────────────────────────
  const addUnitToProject = (projectId, newUnit) => {
    const unitPayload = {
      id: newUnit.id || `UNIT-${Date.now()}`,
      unitNo: newUnit.unitNo || newUnit.flatNo || newUnit.name || "",
      flatNo: newUnit.flatNo || newUnit.unitNo || "",
      type: newUnit.type || "Flat",
      size: newUnit.size || newUnit.area || "",
      area: newUnit.area || newUnit.size || "",
      price: newUnit.price || "",
      floor: newUnit.floor || "",
      facing: newUnit.facing || "",
      status: newUnit.status || "Available",
      images: newUnit.images || [],
      documents: newUnit.documents || [],
      customerVisible: newUnit.customerVisible !== false,
      ...newUnit,
      createdAt: newUnit.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBuilderProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, units: [unitPayload, ...(p.units || [])] } : p
      )
    );
    setProjectRequests((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, units: [unitPayload, ...(p.units || [])] } : p
      )
    );
  };

  const updateUnitInProject = (projectId, unitId, updates) => {
    const updateUnits = (units = []) =>
      units.map((u) =>
        u.id === unitId ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u
      );
    setBuilderProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, units: updateUnits(p.units) } : p))
    );
    setProjectRequests((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, units: updateUnits(p.units) } : p))
    );
  };

  const deleteUnitFromProject = (projectId, unitId) => {
    const removeUnit = (units = []) => units.filter((u) => u.id !== unitId);
    setBuilderProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, units: removeUnit(p.units) } : p))
    );
    setProjectRequests((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, units: removeUnit(p.units) } : p))
    );
  };

  // ─── Share to Customers ───────────────────────────────────────────────────
  const shareProjectToCustomers = (projectId) => {
    setBuilderProjects((prev) =>
      prev.map((p) =>
        p.id === projectId && p.approvalStatus === "Approved"
          ? { ...p, sharedToCustomers: true, customerVisible: true, sharedAt: new Date().toISOString() }
          : p
      )
    );
    setProjectRequests((prev) =>
      prev.map((p) =>
        p.id === projectId && p.approvalStatus === "Approved"
          ? { ...p, sharedToCustomers: true, customerVisible: true, sharedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const getCustomerVisibleProjects = () =>
    builderProjects.filter(
      (p) =>
        p.approvalStatus === "Approved" &&
        p.customerVisible === true &&
        p.sharedToCustomers === true
    );

  // ─── Visit Requests ───────────────────────────────────────────────────────
  const addVisitRequest = (newRequest) => {
    const request = {
      id: `VISIT-${Date.now()}`,
      ...newRequest,
      status: "Pending",
      builderMessage: "",
      createdAt: new Date().toISOString(),
      approvedAt: null,
      rejectedAt: null,
    };

    setVisitRequests((prev) => [request, ...prev]);

    addNotification({
      title: "📅 New Slot Visit Request",
      message: `${newRequest.customerName || "A customer"} requested a site visit for Unit ${newRequest.unitNumber || ""} in "${newRequest.projectName || "your project"}" on ${newRequest.visitDate || ""} at ${newRequest.visitTime || ""}.`,
      builderId: newRequest.builderId || null,
      type: "info",
      category: "visit",
    });
  };

  const approveVisitRequest = (requestId, builderMessage = "Your slot booking is approved.") => {
    const selectedVisit = visitRequests.find((v) => v.id === requestId);

    setVisitRequests((prev) =>
      prev.map((item) =>
        item.id === requestId
          ? { ...item, status: "Approved", builderMessage, approvedAt: new Date().toISOString() }
          : item
      )
    );

    addNotification({
      title: "✅ Visit Request Approved",
      message: `Slot visit for Unit ${selectedVisit?.unitNumber || ""} in "${selectedVisit?.projectName || ""}" has been approved. ${builderMessage}`,
      builderId: selectedVisit?.builderId || null,
      type: "success",
      category: "visit",
    });
  };

  const rejectVisitRequest = (requestId, builderMessage = "Your slot booking was rejected.") => {
    const selectedVisit = visitRequests.find((v) => v.id === requestId);

    setVisitRequests((prev) =>
      prev.map((item) =>
        item.id === requestId
          ? { ...item, status: "Rejected", builderMessage, rejectedAt: new Date().toISOString() }
          : item
      )
    );

    addNotification({
      title: "❌ Visit Request Rejected",
      message: `Slot visit for Unit ${selectedVisit?.unitNumber || ""} in "${selectedVisit?.projectName || ""}" was rejected. ${builderMessage}`,
      builderId: selectedVisit?.builderId || null,
      type: "danger",
      category: "visit",
    });
  };

  // ─── Flat Booking Requests ────────────────────────────────────────────────
  const addFlatBookingRequest = (newRequest) => {
    const totalAmount = parseAmount(
      newRequest.totalAmount || newRequest.price || newRequest.bookingAmount || 0
    );

    const request = {
      id: `BOOK-${Date.now()}`,
      ...newRequest,
      totalAmount,
      paidAmount: Number(newRequest.paidAmount || 0),
      paymentPercentage: 0,
      possessionEligible: false,
      certificateUnlockedAt: null,
      paymentHistory: [],
      status: "Pending Approval",
      paymentStatus: newRequest.paymentStatus || "Pending",
      documentStatus: newRequest.documentStatus || "Pending",
      builderMessage: "",
      createdAt: new Date().toLocaleString(),
      createdAtIso: new Date().toISOString(),
      approvedAt: null,
      rejectedAt: null,
    };

    setFlatBookingRequests((prev) => [request, ...prev]);

    addNotification({
      title: "🏠 New Flat Booking Request",
      message: `${newRequest.customerName || newRequest.guestName || "A customer"} submitted a booking request for Unit ${newRequest.unitNo || newRequest.unitNumber || ""} in "${newRequest.projectName || "your project"}".`,
      builderId: newRequest.builderId || null,
      type: "warning",
      category: "booking",
    });
  };

  const approveFlatBookingRequest = (requestId, builderMessage = "Your flat booking is approved.") => {
    const selectedBooking = flatBookingRequests.find((b) => b.id === requestId);

    setFlatBookingRequests((prev) =>
      prev.map((item) =>
        item.id === requestId
          ? { ...item, status: "Approved", builderMessage, approvedAt: new Date().toISOString() }
          : item
      )
    );

    addNotification({
      title: "✅ Flat Booking Approved",
      message: `Booking for Unit ${selectedBooking?.unitNo || ""} in "${selectedBooking?.projectName || ""}" has been approved.`,
      builderId: selectedBooking?.builderId || null,
      type: "success",
      category: "booking",
    });
  };

  const rejectFlatBookingRequest = (requestId, builderMessage = "Your flat booking was rejected.") => {
    const selectedBooking = flatBookingRequests.find((b) => b.id === requestId);

    setFlatBookingRequests((prev) =>
      prev.map((item) =>
        item.id === requestId
          ? { ...item, status: "Rejected", builderMessage, rejectedAt: new Date().toISOString() }
          : item
      )
    );

    addNotification({
      title: "❌ Flat Booking Rejected",
      message: `Booking for Unit ${selectedBooking?.unitNo || ""} in "${selectedBooking?.projectName || ""}" was rejected.`,
      builderId: selectedBooking?.builderId || null,
      type: "danger",
      category: "booking",
    });
  };

  const verifyFlatBookingDocuments = (requestId) => {
    setFlatBookingRequests((prev) =>
      prev.map((item) =>
        item.id === requestId ? { ...item, documentStatus: "Verified" } : item
      )
    );
  };

  const markFlatBookingPaymentReceived = (requestId) => {
    setFlatBookingRequests((prev) =>
      prev.map((item) =>
        item.id === requestId ? { ...item, paymentStatus: "Received" } : item
      )
    );
  };

  // ─── Payment ──────────────────────────────────────────────────────────────
  const getBookingTotalAmount = (booking) =>
    parseAmount(booking?.totalAmount || booking?.price || booking?.bookingAmount || 0);

  const getPaymentPercentage = (booking) => {
    const total = getBookingTotalAmount(booking);
    const paid = Number(booking?.paidAmount || 0);
    if (!total) return 0;
    return Math.min(100, Math.floor((paid / total) * 100));
  };

  const addCustomerPayment = (bookingId, amount) => {
    setFlatBookingRequests((prev) =>
      prev.map((booking) => {
        if (booking.id !== bookingId) return booking;

        const totalAmount = getBookingTotalAmount(booking);
        const currentPaid = Number(booking.paidAmount || 0);
        const paymentAmount = Number(amount || 0);
        const newPaid = Math.min(totalAmount, currentPaid + paymentAmount);
        const percentage = totalAmount ? Math.floor((newPaid / totalAmount) * 100) : 0;

        return {
          ...booking,
          totalAmount,
          paidAmount: newPaid,
          paymentPercentage: percentage,
          paymentStatus: percentage >= 100 ? "Completed" : "Partially Paid",
          possessionEligible: percentage >= 80,
          certificateUnlockedAt:
            percentage >= 80 && !booking.certificateUnlockedAt
              ? new Date().toISOString()
              : booking.certificateUnlockedAt || null,
          paymentHistory: [
            ...(booking.paymentHistory || []),
            {
              id: `PAY-${Date.now()}`,
              amount: paymentAmount,
              paidAt: new Date().toISOString(),
              status: "Success",
            },
          ],
        };
      })
    );
  };

  // ─── White Label ──────────────────────────────────────────────────────────
  const updateWhiteLabelConfig = (updates) => {
    setWhiteLabelConfig((prev) => ({ ...prev, ...updates }));
  };

  return (
    <SocietyContext.Provider
      value={{
        societies,
        addSociety,

        builders,
        setBuilders,
        approveBuilder,
        rejectBuilder,

        builderRequests,
        addBuilderRequest,
        approveBuilderRequest,
        rejectBuilderRequest,
        getBuilderAccessStatus,
        getDirectApprovedBuilder,

        // ── Admin Requests ──
        adminRequests,
        addAdminRequest,
        approveAdminRequest,
        rejectAdminRequest,
        getAdminAccessStatus,

        projectRequests,
        builderProjects,
        setBuilderProjects,
        addBuilderProject,
        addProjectRequest,
        approveProjectRequest,
        rejectProjectRequest,
        shareProjectToCustomers,
        getCustomerVisibleProjects,

        addUnitToProject,
        updateUnitInProject,
        deleteUnitFromProject,

        visitRequests,
        addVisitRequest,
        approveVisitRequest,
        rejectVisitRequest,

        flatBookingRequests,
        addFlatBookingRequest,
        approveFlatBookingRequest,
        rejectFlatBookingRequest,
        verifyFlatBookingDocuments,
        markFlatBookingPaymentReceived,

        addCustomerPayment,
        getPaymentPercentage,
        getBookingTotalAmount,

        notifications,
        setNotifications,
        addNotification,
        getUnreadNotificationCount: (builderId) => {
          const notifs = notifications || [];
          if (!builderId) return notifs.filter((n) => !n?.read).length;
          return notifs.filter(
            (n) => !n?.read && (!n?.builderId || n?.builderId === builderId)
          ).length;
        },

        whiteLabelConfig,
        updateWhiteLabelConfig,
      }}
    >
      {children}
    </SocietyContext.Provider>
  );
};

export const useAppContext = () => useContext(SocietyContext);