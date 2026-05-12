import React, { createContext, useContext, useMemo, useState } from "react";

const BuilderContext = createContext(null);

const makeId = (prefix) => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

const todayText = () => "Today";

const initialBuilderProfile = {
  builderName: "Hari Prasad",
  companyName: "Bliss Properties",
  email: "builder@blissproperties.com",
  phone: "+91 98765 43210",
  gstNumber: "36ABCDE1234F1Z5",
  reraNumber: "RERA/TS/2026/1122",
  officeAddress: "Financial District, Hyderabad",
  website: "www.blissproperties.com",
  logoText: "BP",
};

const initialProjects = [
  {
    id: "PROJ-1001",
    name: "Bliss Heights",
    companyName: "Bliss Properties",
    location: "Hyderabad",
    address: "Financial District, Hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500032",
    projectType: "Premium Apartments",
    rera: "RERA/TS/2026/1122",
    gstNumber: "36ABCDE1234F1Z5",
    launchDate: "01 Jan 2026",
    completionDate: "Dec 2026",
    possessionDate: "Dec 2026",
    towers: 2,
    floors: 4,
    totalUnits: 6,
    amenities: ["Clubhouse", "Gym", "Pool", "Children Play Area", "Security"],
    status: "Active",
    progress: 68,
    collections: 18600000,
    pendingAmount: 4200000,
    complianceStatus: "Pending",
    units: [
      {
        id: "UNIT-101",
        unitNo: "A-101",
        tower: "A",
        floor: "1",
        type: "2 BHK",
        area: "1240 sq.ft",
        facing: "East",
        price: 7200000,
        status: "Available",
        floorPlan: "A-101-floor-plan.pdf",
      },
      {
        id: "UNIT-102",
        unitNo: "A-102",
        tower: "A",
        floor: "1",
        type: "3 BHK",
        area: "1560 sq.ft",
        facing: "West",
        price: 8900000,
        status: "Booked",
        customerName: "Ananya Reddy",
        floorPlan: "A-102-floor-plan.pdf",
      },
      {
        id: "UNIT-201",
        unitNo: "A-201",
        tower: "A",
        floor: "2",
        type: "2 BHK",
        area: "1220 sq.ft",
        facing: "North",
        price: 7000000,
        status: "Sold",
        customerName: "Rohit Verma",
        floorPlan: "A-201-floor-plan.pdf",
      },
      {
        id: "UNIT-202",
        unitNo: "A-202",
        tower: "A",
        floor: "2",
        type: "3 BHK",
        area: "1585 sq.ft",
        facing: "East",
        price: 9200000,
        status: "Available",
        floorPlan: "A-202-floor-plan.pdf",
      },
      {
        id: "UNIT-301",
        unitNo: "B-301",
        tower: "B",
        floor: "3",
        type: "2.5 BHK",
        area: "1380 sq.ft",
        facing: "South",
        price: 8100000,
        status: "Booked",
        customerName: "Sneha Rao",
        floorPlan: "B-301-floor-plan.pdf",
      },
      {
        id: "UNIT-302",
        unitNo: "B-302",
        tower: "B",
        floor: "3",
        type: "3 BHK",
        area: "1620 sq.ft",
        facing: "East",
        price: 9500000,
        status: "Available",
        floorPlan: "B-302-floor-plan.pdf",
      },
    ],
    complianceDocuments: [
      {
        id: "DOC-1001",
        title: "RERA Certificate",
        type: "Legal",
        status: "Approved",
        fileName: "rera-certificate.pdf",
        uploadedOn: "10 Apr 2026",
      },
      {
        id: "DOC-1002",
        title: "Approved Layout Plan",
        type: "Approval",
        status: "Approved",
        fileName: "layout-plan.pdf",
        uploadedOn: "10 Apr 2026",
      },
      {
        id: "DOC-1003",
        title: "Fire NOC",
        type: "NOC",
        status: "Pending",
        fileName: "fire-noc.pdf",
        uploadedOn: "12 Apr 2026",
      },
      {
        id: "DOC-1004",
        title: "Environmental Clearance",
        type: "NOC",
        status: "Missing",
        fileName: "",
        uploadedOn: "",
      },
    ],
  },
];

const initialVisits = [
  {
    id: "VISIT-1001",
    guestName: "Karthik",
    phone: "+91 91111 22222",
    email: "karthik@email.com",
    projectId: "PROJ-1001",
    projectName: "Bliss Heights",
    unitNo: "A-101",
    interestedUnitType: "2 BHK",
    date: "Today",
    slot: "11:00 AM",
    mode: "Site Visit",
    source: "Website",
    status: "Confirmed",
    executive: "Ajay",
    notes: "Interested in east-facing unit.",
  },
  {
    id: "VISIT-1002",
    guestName: "Priya",
    phone: "+91 92222 33333",
    email: "priya@email.com",
    projectId: "PROJ-1001",
    projectName: "Bliss Heights",
    unitNo: "A-202",
    interestedUnitType: "3 BHK",
    date: "Tomorrow",
    slot: "01:30 PM",
    mode: "Virtual Visit",
    source: "Instagram",
    status: "Pending",
    executive: "Meena",
    notes: "Wants virtual walkthrough before site visit.",
  },
];

const initialBookings = [
  {
    id: "BOOK-1001",
    guestName: "Ananya Reddy",
    phone: "+91 99887 76655",
    email: "ananya@email.com",
    projectId: "PROJ-1001",
    projectName: "Bliss Heights",
    unitId: "UNIT-102",
    unitNo: "A-102",
    unitType: "3 BHK",
    totalAmount: 8900000,
    bookingAmount: 100000,
    paymentStatus: "Received",
    documentStatus: "Pending",
    stage: "Builder Approval Pending",
    status: "Pending Approval",
    createdAt: "Today",
    documents: [
      { id: "KYC-1", title: "Aadhaar", status: "Verified" },
      { id: "KYC-2", title: "PAN", status: "Verified" },
      { id: "KYC-3", title: "Income Proof", status: "Pending" },
      { id: "KYC-4", title: "Address Proof", status: "Pending" },
    ],
    timeline: [
      "Guest submitted booking request",
      "Booking amount received",
      "Waiting for builder approval",
    ],
  },
  {
    id: "BOOK-1002",
    guestName: "Sneha Rao",
    phone: "+91 94444 33322",
    email: "sneha@email.com",
    projectId: "PROJ-1001",
    projectName: "Bliss Heights",
    unitId: "UNIT-301",
    unitNo: "B-301",
    unitType: "2.5 BHK",
    totalAmount: 8100000,
    bookingAmount: 100000,
    paymentStatus: "Received",
    documentStatus: "Verified",
    stage: "Confirmed",
    status: "Approved",
    createdAt: "Yesterday",
    documents: [
      { id: "KYC-5", title: "Aadhaar", status: "Verified" },
      { id: "KYC-6", title: "PAN", status: "Verified" },
      { id: "KYC-7", title: "Income Proof", status: "Verified" },
      { id: "KYC-8", title: "Address Proof", status: "Verified" },
    ],
    timeline: [
      "Guest submitted booking request",
      "Documents verified",
      "Payment received",
      "Booking confirmed",
    ],
  },
];

const initialPayments = [
  {
    id: "PAY-1001",
    customerName: "Ananya Reddy",
    phone: "+91 99887 76655",
    projectId: "PROJ-1001",
    projectName: "Bliss Heights",
    unitNo: "A-102",
    totalAmount: 8900000,
    paidAmount: 100000,
    pendingAmount: 8800000,
    overdueAmount: 0,
    nextMilestone: "Agreement",
    dueDate: "30 Apr 2026",
    status: "Pending",
    receipts: [
      {
        id: "RCT-1001",
        amount: 100000,
        mode: "UPI",
        date: "Today",
      },
    ],
  },
  {
    id: "PAY-1002",
    customerName: "Sneha Rao",
    phone: "+91 94444 33322",
    projectId: "PROJ-1001",
    projectName: "Bliss Heights",
    unitNo: "B-301",
    totalAmount: 8100000,
    paidAmount: 2500000,
    pendingAmount: 5600000,
    overdueAmount: 0,
    nextMilestone: "Slab Completion",
    dueDate: "15 May 2026",
    status: "Active",
    receipts: [
      {
        id: "RCT-1002",
        amount: 100000,
        mode: "NEFT",
        date: "Yesterday",
      },
      {
        id: "RCT-1003",
        amount: 2400000,
        mode: "Bank Transfer",
        date: "Today",
      },
    ],
  },
];

const initialConstructionUpdates = [
  {
    id: "CONS-1001",
    projectId: "PROJ-1001",
    projectName: "Bliss Heights",
    title: "Tower A reached 12th floor",
    type: "Progress",
    progress: 68,
    tower: "A",
    date: "Today",
    note: "Slab casting completed for Tower A floor 12.",
  },
  {
    id: "CONS-1002",
    projectId: "PROJ-1001",
    projectName: "Bliss Heights",
    title: "Tower B finishing work started",
    type: "Update",
    progress: 54,
    tower: "B",
    date: "Yesterday",
    note: "Electrical and plumbing work started.",
  },
];

const initialPossessionRequests = [
  {
    id: "POS-1001",
    customerName: "Sneha Rao",
    phone: "+91 94444 33322",
    projectId: "PROJ-1001",
    projectName: "Bliss Heights",
    unitNo: "B-301",
    paymentPercent: 82,
    stage: "Eligible",
    reviewed: false,
    letterIssued: false,
    permissionGranted: false,
    inspectionScheduled: false,
    inspectionDate: "",
    inspectionTime: "",
    finalReady: false,
    remarks: "Customer crossed payment threshold.",
    timeline: [
      "Payment threshold crossed",
      "Soft possession eligibility triggered",
    ],
  },
];

const initialNotifications = [
  {
    id: "NOT-1001",
    title: "New booking request",
    message: "Ananya Reddy requested booking for unit A-102.",
    type: "Booking",
    read: false,
    route: "BuilderUnitBooking",
    createdAt: "Just now",
  },
  {
    id: "NOT-1002",
    title: "Site visit scheduled",
    message: "Karthik scheduled a site visit for unit A-101.",
    type: "Visit",
    read: false,
    route: "BuilderAppointmentBooking",
    createdAt: "15 min ago",
  },
  {
    id: "NOT-1003",
    title: "Payment follow-up",
    message: "Payment milestone pending for Sneha Rao.",
    type: "Payment",
    read: true,
    route: "BuilderPaymentSchedule",
    createdAt: "Today",
  },
];

export function BuilderProvider({ children }) {
  const [builderProfile, setBuilderProfile] = useState(initialBuilderProfile);
  const [projects, setProjects] = useState(initialProjects);
  const [visits, setVisits] = useState(initialVisits);
  const [bookings, setBookings] = useState(initialBookings);
  const [payments, setPayments] = useState(initialPayments);
  const [constructionUpdates, setConstructionUpdates] = useState(
    initialConstructionUpdates
  );
  const [possessionRequests, setPossessionRequests] = useState(
    initialPossessionRequests
  );
  const [notifications, setNotifications] = useState(initialNotifications);

  const addNotification = (item) => {
    const newItem = {
      id: makeId("NOT"),
      read: false,
      createdAt: "Just now",
      ...item,
    };

    setNotifications((prev) => [newItem, ...prev]);
    return newItem;
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const updateBuilderProfile = (updates) => {
    setBuilderProfile((prev) => ({
      ...prev,
      ...updates,
    }));

    addNotification({
      title: "Profile updated",
      message: "Builder profile details updated successfully.",
      type: "Profile",
      route: "BuilderProfile",
    });
  };

  const createProject = (project) => {
    const newProject = {
      id: makeId("PROJ"),
      name: project?.name || "New Project",
      companyName: project?.companyName || builderProfile.companyName,
      location: project?.location || "",
      address: project?.address || "",
      city: project?.city || "",
      state: project?.state || "",
      pincode: project?.pincode || "",
      projectType: project?.projectType || "Apartments",
      rera: project?.rera || "",
      gstNumber: project?.gstNumber || "",
      launchDate: project?.launchDate || "",
      completionDate: project?.completionDate || "",
      possessionDate: project?.possessionDate || "",
      towers: Number(project?.towers || 0),
      floors: Number(project?.floors || 0),
      totalUnits: Number(project?.totalUnits || 0),
      amenities: Array.isArray(project?.amenities) ? project.amenities : [],
      status: "Active",
      progress: 0,
      collections: 0,
      pendingAmount: 0,
      complianceStatus: "Pending",
      units: [],
      complianceDocuments: [],
    };

    setProjects((prev) => [newProject, ...prev]);

    addNotification({
      title: "Project created",
      message: `${newProject.name} created successfully.`,
      type: "Project",
      route: "BuilderProjectSetup",
    });

    return newProject;
  };

  const updateProject = (projectId, updates) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              ...updates,
            }
          : project
      )
    );

    addNotification({
      title: "Project updated",
      message: "Project details updated successfully.",
      type: "Project",
      route: "BuilderProjectSetup",
    });
  };

  const addUnit = (projectId, unit) => {
    const newUnit = {
      id: makeId("UNIT"),
      unitNo: unit?.unitNo || "",
      tower: unit?.tower || "",
      floor: unit?.floor || "",
      type: unit?.type || "2 BHK",
      area: unit?.area || "",
      facing: unit?.facing || "",
      price: Number(unit?.price || 0),
      status: unit?.status || "Available",
      customerName: unit?.customerName || "",
      floorPlan: unit?.floorPlan || "",
    };

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const updatedUnits = [...(project.units || []), newUnit];

        return {
          ...project,
          units: updatedUnits,
          totalUnits: updatedUnits.length,
        };
      })
    );

    addNotification({
      title: "Unit added",
      message: `${newUnit.unitNo || "New unit"} added successfully.`,
      type: "Unit",
      route: "BuilderUnitInventory",
    });

    return newUnit;
  };

  const updateUnit = (projectId, unitId, updates) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        return {
          ...project,
          units: (project.units || []).map((unit) =>
            unit.id === unitId
              ? {
                  ...unit,
                  ...updates,
                }
              : unit
          ),
        };
      })
    );

    addNotification({
      title: "Unit updated",
      message: "Unit details updated successfully.",
      type: "Unit",
      route: "BuilderUnitInventory",
    });
  };

  const updateUnitStatus = (
    projectId,
    unitId,
    status,
    customerName = ""
  ) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        return {
          ...project,
          units: (project.units || []).map((unit) =>
            unit.id === unitId
              ? {
                  ...unit,
                  status,
                  customerName:
                    status === "Available"
                      ? ""
                      : customerName || unit.customerName || "",
                }
              : unit
          ),
        };
      })
    );

    addNotification({
      title: "Unit status updated",
      message: `Unit status changed to ${status}.`,
      type: "Unit",
      route: "BuilderAvailabilityChart",
    });
  };

  const addComplianceDocument = (projectId, document) => {
    const newDocument = {
      id: makeId("DOC"),
      title: document?.title || "Document",
      type: document?.type || "General",
      status: document?.status || "Pending",
      fileName: document?.fileName || "",
      uploadedOn: todayText(),
    };

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        return {
          ...project,
          complianceDocuments: [
            ...(project.complianceDocuments || []),
            newDocument,
          ],
        };
      })
    );

    addNotification({
      title: "Compliance document added",
      message: `${newDocument.title} uploaded successfully.`,
      type: "Compliance",
      route: "BuilderComplianceTracking",
    });

    return newDocument;
  };

  const updateComplianceDocument = (projectId, documentId, updates) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        return {
          ...project,
          complianceDocuments: (project.complianceDocuments || []).map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  ...updates,
                }
              : doc
          ),
        };
      })
    );

    addNotification({
      title: "Compliance updated",
      message: "Document status updated successfully.",
      type: "Compliance",
      route: "BuilderComplianceTracking",
    });
  };

  const addVisit = (visit) => {
    const project = projects.find((item) => item.id === visit?.projectId);

    const newVisit = {
      id: makeId("VISIT"),
      guestName: visit?.guestName || "",
      phone: visit?.phone || "",
      email: visit?.email || "",
      projectId: visit?.projectId || project?.id || projects[0]?.id,
      projectName: visit?.projectName || project?.name || projects[0]?.name,
      unitNo: visit?.unitNo || "",
      interestedUnitType: visit?.interestedUnitType || "",
      date: visit?.date || todayText(),
      slot: visit?.slot || "",
      mode: visit?.mode || "Site Visit",
      source: visit?.source || "Direct",
      status: visit?.status || "Pending",
      executive: visit?.executive || "",
      notes: visit?.notes || "",
    };

    setVisits((prev) => [newVisit, ...prev]);

    addNotification({
      title: "New guest visit",
      message: `${newVisit.guestName || "Guest"} requested ${newVisit.mode}.`,
      type: "Visit",
      route: "BuilderAppointmentBooking",
    });

    return newVisit;
  };

  const updateVisitStatus = (visitId, status) => {
    setVisits((prev) =>
      prev.map((visit) =>
        visit.id === visitId
          ? {
              ...visit,
              status,
            }
          : visit
      )
    );

    addNotification({
      title: "Visit updated",
      message: `Visit marked as ${status}.`,
      type: "Visit",
      route: "BuilderAppointmentBooking",
    });
  };

  const convertVisitToBooking = (visitId, unitId = "") => {
    const visit = visits.find((item) => item.id === visitId);
    if (!visit) return null;

    const project = projects.find((item) => item.id === visit.projectId);
    const unit =
      project?.units?.find((item) => item.id === unitId) ||
      project?.units?.find((item) => item.unitNo === visit.unitNo) ||
      null;

    const booking = addBooking({
      guestName: visit.guestName,
      phone: visit.phone,
      email: visit.email,
      projectId: visit.projectId,
      projectName: visit.projectName,
      unitId: unit?.id || unitId,
      unitNo: unit?.unitNo || visit.unitNo,
      unitType: unit?.type || visit.interestedUnitType,
      totalAmount: unit?.price || 0,
      bookingAmount: 0,
    });

    updateVisitStatus(visitId, "Converted");

    return booking;
  };

  const addBooking = (booking) => {
    const project = projects.find((item) => item.id === booking?.projectId);
    const unit =
      project?.units?.find((item) => item.id === booking?.unitId) ||
      project?.units?.find((item) => item.unitNo === booking?.unitNo);

    const newBooking = {
      id: makeId("BOOK"),
      guestName: booking?.guestName || "",
      phone: booking?.phone || "",
      email: booking?.email || "",
      projectId: booking?.projectId || project?.id || projects[0]?.id,
      projectName: booking?.projectName || project?.name || projects[0]?.name,
      unitId: booking?.unitId || unit?.id || "",
      unitNo: booking?.unitNo || unit?.unitNo || "",
      unitType: booking?.unitType || unit?.type || "",
      totalAmount: Number(booking?.totalAmount || unit?.price || 0),
      bookingAmount: Number(booking?.bookingAmount || 0),
      paymentStatus: booking?.paymentStatus || "Pending",
      documentStatus: booking?.documentStatus || "Pending",
      stage: "New Request",
      status: "Pending Approval",
      createdAt: todayText(),
      documents: booking?.documents || [
        { id: makeId("KYC"), title: "Aadhaar", status: "Pending" },
        { id: makeId("KYC"), title: "PAN", status: "Pending" },
        { id: makeId("KYC"), title: "Income Proof", status: "Pending" },
        { id: makeId("KYC"), title: "Address Proof", status: "Pending" },
      ],
      timeline: ["Guest submitted booking request"],
    };

    setBookings((prev) => [newBooking, ...prev]);

    if (newBooking.projectId && newBooking.unitId) {
      updateUnitStatus(
        newBooking.projectId,
        newBooking.unitId,
        "On Hold",
        newBooking.guestName
      );
    }

    addNotification({
      title: "New booking request",
      message: `${newBooking.guestName || "Guest"} requested booking for ${
        newBooking.unitNo || "a unit"
      }.`,
      type: "Booking",
      route: "BuilderUnitBooking",
    });

    return newBooking;
  };

  const updateBooking = (bookingId, updates) => {
    let changedBooking = null;

    setBookings((prev) =>
      prev.map((booking) => {
        if (booking.id !== bookingId) return booking;

        const nextTimeline = updates?.timeline
          ? updates.timeline
          : [
              ...(booking.timeline || []),
              updates?.stage ||
                updates?.status ||
                updates?.documentStatus ||
                "Booking updated",
            ];

        changedBooking = {
          ...booking,
          ...updates,
          timeline: nextTimeline,
        };

        return changedBooking;
      })
    );

    if (changedBooking) {
      addNotification({
        title: "Booking updated",
        message: `${changedBooking.unitNo} booking updated.`,
        type: "Booking",
        route: "BuilderUnitBooking",
      });
    }
  };

  const verifyBookingDocuments = (bookingId) => {
    updateBooking(bookingId, {
      documentStatus: "Verified",
      stage: "Documents Verified",
    });
  };

  const markBookingPaymentReceived = (bookingId, amount = 100000) => {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return;

    updateBooking(bookingId, {
      paymentStatus: "Received",
      bookingAmount: Number(amount || booking.bookingAmount || 0),
      stage: "Payment Received",
    });
  };

  const approveBooking = (bookingId) => {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((item) =>
        item.id === bookingId
          ? {
              ...item,
              stage: "Confirmed",
              status: "Approved",
              documentStatus: "Verified",
              paymentStatus: "Received",
              timeline: [
                ...(item.timeline || []),
                "Builder approved booking",
                "Booking confirmed",
              ],
            }
          : item
      )
    );

    updateUnitStatus(
      booking.projectId,
      booking.unitId,
      "Booked",
      booking.guestName
    );

    const paymentExists = payments.some(
      (item) =>
        item.projectId === booking.projectId && item.unitNo === booking.unitNo
    );

    if (!paymentExists) {
      const paidAmount = Number(booking.bookingAmount || 0);
      const totalAmount = Number(booking.totalAmount || 0);

      setPayments((prev) => [
        {
          id: makeId("PAY"),
          customerName: booking.guestName,
          phone: booking.phone,
          projectId: booking.projectId,
          projectName: booking.projectName,
          unitNo: booking.unitNo,
          totalAmount,
          paidAmount,
          pendingAmount: Math.max(0, totalAmount - paidAmount),
          overdueAmount: 0,
          nextMilestone: "Agreement",
          dueDate: "30 Apr 2026",
          status: "Active",
          receipts: paidAmount
            ? [
                {
                  id: makeId("RCT"),
                  amount: paidAmount,
                  mode: "Booking Amount",
                  date: todayText(),
                },
              ]
            : [],
        },
        ...prev,
      ]);
    }

    addNotification({
      title: "Booking approved",
      message: `${booking.guestName} booking approved for ${booking.unitNo}.`,
      type: "Booking",
      route: "BuilderUnitBooking",
    });
  };

  const rejectBooking = (bookingId) => {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((item) =>
        item.id === bookingId
          ? {
              ...item,
              stage: "Rejected",
              status: "Rejected",
              timeline: [...(item.timeline || []), "Booking rejected"],
            }
          : item
      )
    );

    if (booking.projectId && booking.unitId) {
      updateUnitStatus(booking.projectId, booking.unitId, "Available", "");
    }

    addNotification({
      title: "Booking rejected",
      message: `${booking.unitNo} booking rejected.`,
      type: "Booking",
      route: "BuilderUnitBooking",
    });
  };

  const recordPayment = (paymentId, amount, mode = "UPI") => {
    const value = Number(amount || 0);

    if (!value || value <= 0) {
      return;
    }

    let completedPayment = null;

    setPayments((prev) =>
      prev.map((payment) => {
        if (payment.id !== paymentId) return payment;

        const paidAmount = Number(payment.paidAmount || 0) + value;
        const pendingAmount = Math.max(
          0,
          Number(payment.totalAmount || 0) - paidAmount
        );
        const paymentPercent = payment.totalAmount
          ? Math.round((paidAmount / payment.totalAmount) * 100)
          : 0;

        completedPayment = {
          ...payment,
          paidAmount,
          pendingAmount,
          overdueAmount: pendingAmount === 0 ? 0 : payment.overdueAmount,
          status: pendingAmount === 0 ? "Completed" : "Active",
          receipts: [
            ...(payment.receipts || []),
            {
              id: makeId("RCT"),
              amount: value,
              mode,
              date: todayText(),
            },
          ],
        };

        if (paymentPercent >= 80) {
          const exists = possessionRequests.some(
            (item) =>
              item.projectId === payment.projectId &&
              item.unitNo === payment.unitNo
          );

          if (!exists) {
            setPossessionRequests((old) => [
              {
                id: makeId("POS"),
                customerName: payment.customerName,
                phone: payment.phone,
                projectId: payment.projectId,
                projectName: payment.projectName,
                unitNo: payment.unitNo,
                paymentPercent,
                stage: "Eligible",
                reviewed: false,
                letterIssued: false,
                permissionGranted: false,
                inspectionScheduled: false,
                inspectionDate: "",
                inspectionTime: "",
                finalReady: false,
                remarks: "Customer crossed payment threshold.",
                timeline: [
                  "Payment threshold crossed",
                  "Soft possession eligibility triggered",
                ],
              },
              ...old,
            ]);
          }
        }

        return completedPayment;
      })
    );

    addNotification({
      title: "Payment recorded",
      message: `Payment of ₹${value.toLocaleString("en-IN")} recorded.`,
      type: "Payment",
      route: "BuilderPaymentSchedule",
    });

    return completedPayment;
  };

  const clearOverdue = (paymentId) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === paymentId
          ? {
              ...payment,
              overdueAmount: 0,
            }
          : payment
      )
    );

    addNotification({
      title: "Overdue cleared",
      message: "Payment overdue status cleared.",
      type: "Payment",
      route: "BuilderPaymentSchedule",
    });
  };

  const addConstructionUpdate = (payload) => {
    const project = projects.find((item) => item.id === payload?.projectId);

    const newUpdate = {
      id: makeId("CONS"),
      projectId: payload?.projectId || project?.id || projects[0]?.id,
      projectName: payload?.projectName || project?.name || projects[0]?.name,
      title: payload?.title || "Construction update",
      type: payload?.type || "Progress",
      progress: Number(payload?.progress || 0),
      tower: payload?.tower || "",
      date: todayText(),
      note: payload?.note || "",
    };

    setConstructionUpdates((prev) => [newUpdate, ...prev]);

    setProjects((prev) =>
      prev.map((projectItem) =>
        projectItem.id === newUpdate.projectId
          ? {
              ...projectItem,
              progress: newUpdate.progress || projectItem.progress,
            }
          : projectItem
      )
    );

    addNotification({
      title: "Construction updated",
      message: newUpdate.title,
      type: "Construction",
      route: "BuilderConstructionTracking",
    });

    return newUpdate;
  };

  const updatePossession = (possessionId, updates) => {
    setPossessionRequests((prev) =>
      prev.map((item) =>
        item.id === possessionId
          ? {
              ...item,
              ...updates,
              timeline: [
                ...(item.timeline || []),
                updates?.stage || "Possession updated",
              ],
            }
          : item
      )
    );

    addNotification({
      title: "Possession updated",
      message: updates?.stage || "Soft possession status updated.",
      type: "Possession",
      route: "BuilderSoftPossession",
    });
  };

  const reviewPossession = (possessionId) => {
    updatePossession(possessionId, {
      reviewed: true,
      stage: "Reviewed",
      remarks: "Builder reviewed possession eligibility.",
    });
  };

  const issuePossessionLetter = (possessionId) => {
    updatePossession(possessionId, {
      letterIssued: true,
      stage: "Letter Issued",
      remarks: "Soft possession letter issued to customer.",
    });
  };

  const grantInteriorPermission = (possessionId) => {
    updatePossession(possessionId, {
      permissionGranted: true,
      stage: "Interior Permission Granted",
      remarks: "Interior work permission granted.",
    });
  };

  const schedulePossessionInspection = (
    possessionId,
    inspectionDate,
    inspectionTime
  ) => {
    updatePossession(possessionId, {
      inspectionScheduled: true,
      inspectionDate,
      inspectionTime,
      stage: "Inspection Scheduled",
      remarks: `Inspection scheduled on ${inspectionDate} at ${inspectionTime}.`,
    });
  };

  const markFinalPossessionReady = (possessionId) => {
    updatePossession(possessionId, {
      finalReady: true,
      stage: "Final Ready",
      remarks: "Unit is ready for final possession.",
    });
  };

  const getProjectById = (projectId) => {
    return projects.find((project) => project.id === projectId) || projects[0];
  };

  const getUnitsByProject = (projectId) => {
    const project = getProjectById(projectId);
    return project?.units || [];
  };

  const dashboardStats = useMemo(() => {
    const allUnits = projects.flatMap((project) => project.units || []);

    const totalCollected = payments.reduce(
      (sum, item) => sum + Number(item.paidAmount || 0),
      0
    );

    const totalPending = payments.reduce(
      (sum, item) => sum + Number(item.pendingAmount || 0),
      0
    );

    return {
      totalProjects: projects.length,
      totalUnits: allUnits.length,
      availableUnits: allUnits.filter((unit) => unit.status === "Available")
        .length,
      holdUnits: allUnits.filter((unit) => unit.status === "On Hold").length,
      bookedUnits: allUnits.filter((unit) => unit.status === "Booked").length,
      soldUnits: allUnits.filter((unit) => unit.status === "Sold").length,
      totalVisits: visits.length,
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(
        (booking) => booking.status === "Pending Approval"
      ).length,
      approvedBookings: bookings.filter(
        (booking) => booking.status === "Approved"
      ).length,
      totalCollected,
      totalPending,
      unreadNotifications: notifications.filter((item) => !item.read).length,
      possessionRequests: possessionRequests.length,
    };
  }, [
    projects,
    payments,
    visits,
    bookings,
    notifications,
    possessionRequests,
  ]);

  const value = useMemo(
    () => ({
      builderProfile,
      projects,
      visits,
      bookings,
      payments,
      constructionUpdates,
      possessionRequests,
      notifications,
      dashboardStats,

      setProjects,
      setVisits,
      setBookings,
      setPayments,
      setConstructionUpdates,
      setPossessionRequests,

      updateBuilderProfile,

      createProject,
      updateProject,

      addUnit,
      updateUnit,
      updateUnitStatus,

      addComplianceDocument,
      updateComplianceDocument,

      addVisit,
      updateVisitStatus,
      convertVisitToBooking,

      addBooking,
      updateBooking,
      verifyBookingDocuments,
      markBookingPaymentReceived,
      approveBooking,
      rejectBooking,

      recordPayment,
      clearOverdue,

      addConstructionUpdate,

      updatePossession,
      reviewPossession,
      issuePossessionLetter,
      grantInteriorPermission,
      schedulePossessionInspection,
      markFinalPossessionReady,

      addNotification,
      markNotificationRead,
      markAllNotificationsRead,

      getProjectById,
      getUnitsByProject,
    }),
    [
      builderProfile,
      projects,
      visits,
      bookings,
      payments,
      constructionUpdates,
      possessionRequests,
      notifications,
      dashboardStats,
    ]
  );

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);

  if (!context) {
    throw new Error("useBuilder must be used inside BuilderProvider");
  }

  return context;
}