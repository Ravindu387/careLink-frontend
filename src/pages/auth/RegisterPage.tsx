import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Check,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  UserRound,
  Building2,
  HandHeart,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle2,
  FileText,
  Upload,
  Trash2,
  Search,
  Globe,
  UserCheck,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPathForRoles } from "../../constants/roles";
import type {
  RegisterDocumentUpload,
  RegisterResponse,
} from "../../types/auth";
import { CareLinkLogo } from "../../components/common/CareLinkLogo";

const backgroundImages = [
  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200",
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200",
  "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200",
];

type AccountType = "citizen" | "volunteer" | "organisation";

const ORGANISATION_TYPES = [
  "International NGO",
  "Local NGO",
  "Government Organisation",
  "UN Agency",
  "Charity / Non-profit Organisation",
  "Community-Based Organisation",
  "Religious / Faith-Based Organisation",
  "Private Humanitarian Organisation",
  "Other",
];

const PROVINCES = [
  "Western Province",
  "Central Province",
  "Southern Province",
  "Northern Province",
  "Eastern Province",
  "North Western Province",
  "North Central Province",
  "Uva Province",
  "Sabaragamuwa Province",
];

const DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
  "National / Island-wide",
];

const HUMANITARIAN_ASSISTANCE_AREAS = [
  "Food Distribution",
  "Emergency Medical Assistance",
  "Shelter and Accommodation",
  "Water and Sanitation",
  "Clothing and Essential Supplies",
  "Transportation and Logistics",
  "Search and Rescue",
  "Child Protection",
  "Disaster Recovery",
  "Education Support",
  "Other",
];

const EMERGENCY_AVAILABILITY_OPTIONS = [
  "Available for emergency response",
  "Limited availability",
  "Not currently available",
];

type DocumentSlotCategory =
  | "RegistrationCertificate"
  | "OrganisationProfile"
  | "AuthorisationLetter"
  | "SupportingDocument";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registrationResult, setRegistrationResult] =
    useState<RegisterResponse | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((previous) => (previous + 1) % backgroundImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const [accountType, setAccountType] = useState<AccountType>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const role = params.get("role")?.toLowerCase();
      if (role === "volunteer") return "volunteer";
      if (
        role === "organisation" ||
        role === "organization" ||
        role === "partner"
      )
        return "organisation";
    }
    return "citizen";
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [operationAreaSearch, setOperationAreaSearch] = useState("");
  const [useRepEmailForLogin, setUseRepEmailForLogin] = useState(false);

  const [formData, setFormData] = useState({
    // Citizen / Volunteer / Representative personal fields
    firstName: "",
    lastName: "",
    email: "", // Login Email (CareLink Username)
    phone: "", // Contact Phone Number
    address: "",
    password: "",
    confirmPassword: "",

    // A. Partner Organisation Basic Information
    organisationName: "",
    organisationType: "Local NGO",
    otherOrganisationType: "",
    registrationCountry: "Sri Lanka",
    registrationNumber: "",
    yearEstablished: "",
    website: "",
    organisationEmail: "",
    organisationPhone: "",
    secondaryContactPhone: "",
    organisationAddress: "",
    district: "Colombo",
    province: "Western Province",
    organisationDescription: "",

    // B. Humanitarian Operational Information
    areasOfOperation: ["Colombo"] as string[],
    areasOfAssistance: ["Food Distribution"] as string[],
    otherAreaOfAssistance: "",
    operationalCapacity: "",
    emergencyResponseAvailability: "Available for emergency response",
    additionalResources: "",

    // C. Authorised Representative Information
    representativeDesignation: "",
    representativeEmail: "",
    representativeAlternativePhone: "",

    // D. Step 3 Confirmations
    confirmAuthorisedRepresentative: false,
    confirmAccurateInformation: false,
    agreeTermsAndPrivacy: false,

    // Volunteer fields
    skills: "First Aid, Shelter Support",
    availability: "Immediate",
    preferredLocation: "Greater Riverton",
  });

  const [uploadedDocuments, setUploadedDocuments] = useState<
    RegisterDocumentUpload[]
  >([]);

  const accountTypes = [
    {
      id: "citizen" as AccountType,
      title: "Affected Citizen",
      description: "Request and track support · Active immediately",
      icon: UserRound,
      badge: "Instant Access",
    },
    {
      id: "volunteer" as AccountType,
      title: "Volunteer",
      description: "Offer skills during responses · Active immediately",
      icon: HandHeart,
      badge: "Instant Access",
    },
    {
      id: "organisation" as AccountType,
      title: "Partner Organisation",
      description: "Coordinate verified operations – Requires Admin approval.",
      icon: Building2,
      badge: "Admin Review Required",
    },
  ];

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((previous) => {
      const next = {
        ...previous,
        [field]: value,
      };
      if (
        field === "representativeEmail" &&
        useRepEmailForLogin &&
        typeof value === "string"
      ) {
        next.email = value;
      }
      return next;
    });
  };

  const toggleArrayItem = (
    field: "areasOfOperation" | "areasOfAssistance",
    item: string
  ) => {
    setFormData((prev) => {
      const exists = prev[field].includes(item);
      const updated = exists
        ? prev[field].filter((x) => x !== item)
        : [...prev[field], item];
      return { ...prev, [field]: updated };
    });
  };

  const handleFileUpload = async (
    category: DocumentSlotCategory,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setError(null);

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExts = ["pdf", "jpg", "jpeg", "png"];
    const allowedMimes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedExts.includes(ext) && !allowedMimes.includes(file.type)) {
      setError(
        `Invalid file format for "${file.name}". Only PDF, JPG, JPEG, and PNG documents are accepted.`
      );
      e.target.value = "";
      return;
    }

    if (file.size === 0) {
      setError(`The selected file "${file.name}" is empty.`);
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        `File "${file.name}" exceeds the 10 MB maximum file size limit.`
      );
      e.target.value = "";
      return;
    }

    setUploadingSlot(category);
    try {
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
      });

      const canonicalType =
        ext === "pdf"
          ? "application/pdf"
          : ext === "png"
          ? "image/png"
          : "image/jpeg";

      const newDoc: RegisterDocumentUpload = {
        category,
        fileName: file.name,
        contentType: file.type || canonicalType,
        fileSizeBytes: file.size,
        base64Content,
      };

      setUploadedDocuments((prev) => {
        if (category === "SupportingDocument") {
          return [...prev, newDoc];
        }
        const filtered = prev.filter((d) => d.category !== category);
        return [...filtered, newDoc];
      });
    } catch {
      setError(`Could not read "${file.name}". Please try selecting it again.`);
    } finally {
      setUploadingSlot(null);
      e.target.value = "";
    }
  };

  const removeDocument = (category: DocumentSlotCategory, fileName?: string) => {
    setUploadedDocuments((prev) =>
      prev.filter((d) =>
        category === "SupportingDocument" && fileName
          ? !(d.category === category && d.fileName === fileName)
          : d.category !== category
      )
    );
  };

  const validateStep2 = (): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (accountType === "organisation") {
      // A. Organisation Basic Information
      if (!formData.organisationName.trim()) {
        return "Organisation Name is required.";
      }
      if (!formData.organisationType.trim()) {
        return "Organisation Type is required.";
      }
      if (
        formData.organisationType === "Other" &&
        !formData.otherOrganisationType.trim()
      ) {
        return "Please specify your Organisation Type when 'Other' is selected.";
      }
      if (!formData.registrationCountry.trim()) {
        return "Registration Country is required.";
      }
      if (!formData.organisationEmail.trim()) {
        return "Official Organisation Email is required.";
      }
      if (!emailRegex.test(formData.organisationEmail.trim())) {
        return "Please enter a valid Official Organisation Email address.";
      }
      if (!formData.organisationPhone.trim()) {
        return "Official Contact Number is required.";
      }
      if (!formData.organisationAddress.trim()) {
        return "Organisation Address is required.";
      }
      if (!formData.district.trim()) {
        return "District is required.";
      }
      if (!formData.province.trim()) {
        return "Province is required.";
      }
      if (!formData.organisationDescription.trim()) {
        return "Operational Scope / Description is required.";
      }
      if (formData.yearEstablished.trim()) {
        const yr = Number(formData.yearEstablished.trim());
        const currentYear = new Date().getFullYear();
        if (Number.isNaN(yr) || yr < 1800 || yr > currentYear) {
          return `Year Established must be a valid year between 1800 and ${currentYear}.`;
        }
      }

      // B. Humanitarian Operational Information
      if (formData.areasOfOperation.length === 0) {
        return "Please select at least one Main Area of Operation.";
      }
      if (formData.areasOfAssistance.length === 0) {
        return "Please select at least one Main Area of Assistance.";
      }
      if (
        formData.areasOfAssistance.includes("Other") &&
        !formData.otherAreaOfAssistance.trim()
      ) {
        return "Please specify your other area of humanitarian assistance.";
      }
      if (!formData.operationalCapacity.trim()) {
        return "Operational Capacity / Description is required.";
      }
      if (!formData.emergencyResponseAvailability.trim()) {
        return "Emergency Response Availability is required.";
      }

      // C. Authorised Representative Information
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        return "Authorised Representative First Name and Last Name are required.";
      }
      if (!formData.representativeDesignation.trim()) {
        return "Authorised Representative Position / Designation is required.";
      }
      if (!formData.representativeEmail.trim()) {
        return "Authorised Representative Contact Email is required.";
      }
      if (!emailRegex.test(formData.representativeEmail.trim())) {
        return "Please enter a valid Authorised Representative Contact Email.";
      }
      if (!formData.phone.trim()) {
        return "Authorised Representative Contact Phone Number is required.";
      }

      // D. Account Login Information
      const loginEmail = useRepEmailForLogin
        ? formData.representativeEmail.trim()
        : formData.email.trim();
      if (!loginEmail) {
        return "Account Login Email is required.";
      }
      if (!emailRegex.test(loginEmail)) {
        return "Please enter a valid Account Login Email address.";
      }
      if (!formData.password || formData.password.length < 6) {
        return "Password must contain at least 6 characters.";
      }
      if (formData.password !== formData.confirmPassword) {
        return "Passwords do not match.";
      }

      return null;
    }

    // Citizen & Volunteer validation
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return "Please complete all required fields.";
    }

    if (!emailRegex.test(formData.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    if (formData.password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (accountType === "volunteer" && !formData.skills.trim()) {
      return "Please enter at least one volunteer skill.";
    }

    return null;
  };

  const validateStep3 = (): string | null => {
    if (accountType === "organisation") {
      const hasRegCert = uploadedDocuments.some(
        (d) => d.category === "RegistrationCertificate"
      );
      if (!hasRegCert) {
        return "Please upload the required Organisation Registration Certificate or NGO Registration Certificate.";
      }
      if (!formData.confirmAuthorisedRepresentative) {
        return "Please confirm that you are authorised to register this organisation.";
      }
      if (!formData.confirmAccurateInformation) {
        return "Please confirm that the information provided is accurate.";
      }
      if (!formData.agreeTermsAndPrivacy) {
        return "Please agree to the CareLink Terms and Conditions and Privacy Policy.";
      }
    }
    return null;
  };

  const handleContinue = async () => {
    if (isLoading) return;
    setError(null);

    if (step === 2) {
      const validationError = validateStep2();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (step < 3) {
      setStep((previous) => previous + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const step3Error = validateStep3();
    if (step3Error) {
      setError(step3Error);
      return;
    }

    setIsLoading(true);
    setError(null);

    const roleMap: Record<AccountType, string> = {
      citizen: "Citizen",
      volunteer: "Volunteer",
      organisation: "PartnerOfficer",
    };

    const loginEmail =
      accountType === "organisation" && useRepEmailForLogin
        ? formData.representativeEmail.trim()
        : formData.email.trim();

    try {
      const regResult = await register({
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: loginEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phone.trim(),
        address:
          accountType === "organisation"
            ? formData.organisationAddress.trim()
            : formData.address.trim() || undefined,
        role: roleMap[accountType],

        // Partner Organisation fields
        organizationName:
          accountType === "organisation"
            ? formData.organisationName.trim()
            : undefined,
        organizationType:
          accountType === "organisation"
            ? formData.organisationType
            : undefined,
        otherOrganizationType:
          accountType === "organisation" &&
          formData.organisationType === "Other"
            ? formData.otherOrganisationType.trim()
            : undefined,
        registrationCountry:
          accountType === "organisation"
            ? formData.registrationCountry.trim()
            : undefined,
        registrationNumber:
          accountType === "organisation"
            ? formData.registrationNumber.trim() || undefined
            : undefined,
        yearEstablished:
          accountType === "organisation" && formData.yearEstablished.trim()
            ? Number(formData.yearEstablished.trim())
            : undefined,
        website:
          accountType === "organisation"
            ? formData.website.trim() || undefined
            : undefined,
        organizationEmail:
          accountType === "organisation"
            ? formData.organisationEmail.trim()
            : undefined,
        organizationPhone:
          accountType === "organisation"
            ? formData.organisationPhone.trim()
            : undefined,
        secondaryContactPhone:
          accountType === "organisation"
            ? formData.secondaryContactPhone.trim() || undefined
            : undefined,
        organizationAddress:
          accountType === "organisation"
            ? formData.organisationAddress.trim()
            : undefined,
        district:
          accountType === "organisation" ? formData.district.trim() : undefined,
        province:
          accountType === "organisation" ? formData.province.trim() : undefined,
        organizationDescription:
          accountType === "organisation"
            ? formData.organisationDescription.trim()
            : undefined,
        areasOfOperation:
          accountType === "organisation"
            ? formData.areasOfOperation
            : undefined,
        areasOfAssistance:
          accountType === "organisation"
            ? formData.areasOfAssistance
            : undefined,
        otherAreaOfAssistance:
          accountType === "organisation" &&
          formData.areasOfAssistance.includes("Other")
            ? formData.otherAreaOfAssistance.trim()
            : undefined,
        operationalCapacity:
          accountType === "organisation"
            ? formData.operationalCapacity.trim()
            : undefined,
        emergencyResponseAvailability:
          accountType === "organisation"
            ? formData.emergencyResponseAvailability
            : undefined,
        additionalResources:
          accountType === "organisation"
            ? formData.additionalResources.trim() || undefined
            : undefined,
        representativeFirstName:
          accountType === "organisation"
            ? formData.firstName.trim()
            : undefined,
        representativeLastName:
          accountType === "organisation" ? formData.lastName.trim() : undefined,
        representativeDesignation:
          accountType === "organisation"
            ? formData.representativeDesignation.trim()
            : undefined,
        representativeEmail:
          accountType === "organisation"
            ? formData.representativeEmail.trim()
            : undefined,
        representativePhone:
          accountType === "organisation" ? formData.phone.trim() : undefined,
        representativeAlternativePhone:
          accountType === "organisation"
            ? formData.representativeAlternativePhone.trim() || undefined
            : undefined,
        documents:
          accountType === "organisation" ? uploadedDocuments : undefined,
        confirmAuthorisedRepresentative:
          accountType === "organisation"
            ? formData.confirmAuthorisedRepresentative
            : undefined,
        confirmAccurateInformation:
          accountType === "organisation"
            ? formData.confirmAccurateInformation
            : undefined,
        agreeTermsAndPrivacy:
          accountType === "organisation"
            ? formData.agreeTermsAndPrivacy
            : undefined,

        // Volunteer fields
        skills:
          accountType === "volunteer" ? formData.skills.trim() : undefined,
        availability:
          accountType === "volunteer" ? formData.availability : undefined,
        preferredLocation:
          accountType === "volunteer"
            ? formData.preferredLocation.trim() || undefined
            : undefined,
      });

      setRegistrationResult(regResult);
    } catch (err: any) {
      setError(
        err.message || "Registration failed. Please check your information."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep((previous) => previous - 1);
    }
  };

  const handleProceedAfterRegistration = () => {
    if (!registrationResult) {
      navigate("/login");
      return;
    }

    if (registrationResult.requiresAdminApproval) {
      navigate("/login");
      return;
    }

    const targetDashboard = getDashboardPathForRoles(
      registrationResult.user?.roles
    );
    navigate(targetDashboard || "/citizen/dashboard", { replace: true });
  };

  const filteredDistrictsForMultiSelect = DISTRICTS.filter((d) =>
    d.toLowerCase().includes(operationAreaSearch.trim().toLowerCase())
  );

  const getDocumentBySlot = (category: DocumentSlotCategory) =>
    uploadedDocuments.find((d) => d.category === category);

  const supportingDocuments = uploadedDocuments.filter(
    (d) => d.category === "SupportingDocument"
  );

  const inputClass =
    "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm sm:text-[15px] text-[#123B5C] outline-none transition placeholder:text-slate-400 focus:border-[#2784B5] focus:ring-2 focus:ring-blue-100";

  const textareaClass =
    "w-full rounded-lg border border-slate-300 bg-white p-3 text-sm sm:text-[15px] text-[#123B5C] outline-none transition placeholder:text-slate-400 focus:border-[#2784B5] focus:ring-2 focus:ring-blue-100";

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* LEFT BRANDING PANEL */}
      <section className="relative flex min-h-[420px] w-full flex-col justify-between overflow-hidden bg-[#123B5C] px-8 py-8 text-white lg:sticky lg:top-0 lg:h-screen lg:w-[40%] lg:px-14">
        {backgroundImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              currentImage === index ? "opacity-30" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}

        <div className="absolute inset-0 bg-[#123B5C]/80" />

        <div className="pointer-events-none absolute -bottom-48 -right-48 h-[520px] w-[520px] rounded-full border-[65px] border-white/[0.025]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[390px] w-[390px] rounded-full border-[65px] border-white/[0.035]" />

        <a href="/" className="relative z-10 flex items-center gap-3">
          <CareLinkLogo size="header" showText tagline="Connecting Help. Saving Lives." />
        </a>

        <div className="relative z-10 my-12 max-w-lg lg:my-0">
          <span className="inline-block rounded-md bg-white px-3 py-1.5 text-xs font-bold tracking-wide text-[#123B5C]">
            HUMANITARIAN OPERATIONS
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            One secure place to coordinate every response.
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
            Trusted workflows for citizens, volunteers, and verified partner
            organisations. Internal response staff are provisioned by
            administrators.
          </p>

          <div className="mt-7 space-y-4">
            {[
              "Immediate activation for Citizens & Volunteers",
              "Administrator verification for Partner Organisations",
              "Email address serves as your secure platform username",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Check size={17} className="shrink-0 text-[#42B99A]" />
                <span className="text-sm font-medium text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[13px] text-slate-400">
          CareLink Humanitarian Platform · Secure Role-Based Governance
        </p>
      </section>

      {/* RIGHT REGISTRATION PANEL */}
      <section className="relative flex min-h-screen w-full items-center justify-center bg-[#EFF6F7] px-5 py-16 lg:w-[60%] lg:px-10">
        <a
          href="/"
          className="absolute left-7 top-7 flex items-center gap-2 text-[13px] font-medium text-slate-600 transition hover:text-[#123B5C]"
        >
          <ArrowLeft size={14} />
          Back to website
        </a>

        <div
          className={`w-full ${
            accountType === "organisation" && step >= 2
              ? "max-w-[780px]"
              : "max-w-[620px]"
          }`}
        >
          <div className="mb-8 flex items-center justify-center gap-3.5">
            <CareLinkLogo
              size="sidebar"
              showText
              titleClassName="text-[#123B5C]"
              subtitleClassName="text-slate-500"
              tagline="Connecting Help. Saving Lives."
            />
          </div>

          {registrationResult ? (
            <div className="rounded-xl border border-[#42B99A]/30 bg-white p-8 text-center shadow-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6F7] text-[#123B5C]">
                {registrationResult.requiresAdminApproval ? (
                  <Clock size={32} className="text-amber-600" />
                ) : (
                  <CheckCircle2 size={32} className="text-[#208D70]" />
                )}
              </div>

              <h3 className="mt-4 text-xl font-bold text-[#123B5C]">
                {registrationResult.requiresAdminApproval
                  ? "Partner Registration Pending Approval"
                  : "Account Created & Active"}
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                {registrationResult.message}
              </p>

              <div className="mt-4 space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left text-xs text-slate-700">
                {registrationResult.organizationName && (
                  <p>
                    <strong>Organisation:</strong>{" "}
                    {registrationResult.organizationName}
                  </p>
                )}
                <p>
                  <strong>Username / Login Email:</strong>{" "}
                  {registrationResult.email}
                </p>
                <p>
                  <strong>Account Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      registrationResult.requiresAdminApproval
                        ? "text-amber-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {registrationResult.accountStatus}
                  </span>
                </p>
                {registrationResult.verificationRequestId && (
                  <p>
                    <strong>Verification Reference:</strong>{" "}
                    {registrationResult.verificationRequestId}
                  </p>
                )}
                <p>
                  <strong>Email Notification:</strong>{" "}
                  {registrationResult.emailSent
                    ? `Sent to ${registrationResult.email}`
                    : "Queued (pending SMTP delivery)"}
                </p>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleProceedAfterRegistration}
                  className="w-full rounded-lg bg-[#123B5C] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1D5F8A] sm:w-auto"
                >
                  {registrationResult.requiresAdminApproval
                    ? "Return to Sign In"
                    : "Continue to Workspace"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Indicator */}
              <div className="mb-7">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold tracking-[0.14em] text-[#2784B5]">
                    CREATE AN ACCOUNT · STEP {step} OF 3
                  </p>
                  <p className="text-[13px] font-medium text-slate-500">
                    {step === 1
                      ? "1. Account Type Selection"
                      : step === 2
                      ? accountType === "organisation"
                        ? "2. Partner Organisation Profile"
                        : "2. Account Information"
                      : accountType === "organisation"
                      ? "3. Verification Documents & Submission"
                      : "3. Review & Confirm"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((number) => (
                    <div
                      key={number}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        step >= number ? "bg-[#123B5C]" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1 – Account Type Selection */}
              {step === 1 && (
                <div>
                  <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold tracking-tight text-[#123B5C]">
                    How will you use the platform?
                  </h1>

                  <p className="mt-3 text-[15px] leading-6 text-slate-600">
                    Choose the public registration role that describes you.
                    Internal roles (Admin, Coordinator, Resource Manager,
                    Shelter Admin) are provisioned exclusively by system
                    administrators.
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-3">
                    {accountTypes.map((type) => {
                      const Icon = type.icon;
                      const selected = accountType === type.id;

                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setAccountType(type.id)}
                          className={`flex min-h-[78px] items-center gap-3 rounded-lg border bg-white px-4 py-3 text-left transition-all duration-200 ${
                            selected
                              ? "border-2 border-[#123B5C] bg-[#F0F6F8]"
                              : "border-[#75C9B4] hover:border-[#123B5C]"
                          }`}
                        >
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? "border-[#123B5C]"
                                : "border-slate-400"
                            }`}
                          >
                            {selected && (
                              <div className="h-2 w-2 rounded-full bg-[#123B5C]" />
                            )}
                          </div>

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6F7] text-[#123B5C]">
                            <Icon size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-base font-semibold text-[#123B5C]">
                                {type.title}
                              </h3>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  type.id === "organisation"
                                    ? "border border-amber-200 bg-amber-50 text-amber-700"
                                    : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                {type.badge}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-600">
                              {type.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2 – Partner Organisation vs Citizen/Volunteer Information */}
              {step === 2 && accountType === "organisation" && (
                <div>
                  <h1 className="text-2xl font-medium tracking-tight text-[#123B5C] md:text-3xl">
                    Partner Organisation Information
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Provide official organisation credentials, humanitarian
                    operational capacity, and authorised representative details
                    for administrator verification.
                  </p>

                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="mt-6 space-y-6"
                  >
                    {/* SECTION A: ORGANISATION BASIC INFORMATION */}
                    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6F7] text-[#123B5C]">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#123B5C]">
                            A. Organisation Basic Information
                          </h2>
                          <p className="text-[13px] text-slate-500">
                            Official legal identity, registration details, and
                            headquarters location.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Organisation Name{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            required
                            value={formData.organisationName}
                            onChange={(e) =>
                              updateField("organisationName", e.target.value)
                            }
                            placeholder="Enter official organisation name"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Organisation Type{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.organisationType}
                            onChange={(e) =>
                              updateField("organisationType", e.target.value)
                            }
                            className={inputClass}
                          >
                            {ORGANISATION_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {formData.organisationType === "Other" && (
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Specify Organisation Type{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            required
                            value={formData.otherOrganisationType}
                            onChange={(e) =>
                              updateField(
                                "otherOrganisationType",
                                e.target.value
                              )
                            }
                            placeholder="Describe your organisation classification"
                            className={inputClass}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Registration Country{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            required
                            value={formData.registrationCountry}
                            onChange={(e) =>
                              updateField("registrationCountry", e.target.value)
                            }
                            placeholder="e.g. Sri Lanka"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Registration / NGO Number{" "}
                            <span className="text-[13px] font-normal text-slate-400">
                              (Optional)
                            </span>
                          </label>
                          <input
                            value={formData.registrationNumber}
                            onChange={(e) =>
                              updateField("registrationNumber", e.target.value)
                            }
                            placeholder="e.g. NGO-2026-104"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Year Established{" "}
                            <span className="text-[13px] font-normal text-slate-400">
                              (Optional)
                            </span>
                          </label>
                          <input
                            type="number"
                            min={1800}
                            max={new Date().getFullYear()}
                            value={formData.yearEstablished}
                            onChange={(e) =>
                              updateField("yearEstablished", e.target.value)
                            }
                            placeholder="e.g. 2015"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Official Organisation Email{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.organisationEmail}
                            onChange={(e) =>
                              updateField("organisationEmail", e.target.value)
                            }
                            placeholder="info@organisation.org"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Organisation Website{" "}
                            <span className="text-[13px] font-normal text-slate-400">
                              (Optional)
                            </span>
                          </label>
                          <input
                            type="url"
                            value={formData.website}
                            onChange={(e) =>
                              updateField("website", e.target.value)
                            }
                            placeholder="https://www.organisation.org"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Official Contact Number{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.organisationPhone}
                            onChange={(e) =>
                              updateField("organisationPhone", e.target.value)
                            }
                            placeholder="+94 11 234 5678"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Secondary Contact Number{" "}
                            <span className="text-[13px] font-normal text-slate-400">
                              (Optional)
                            </span>
                          </label>
                          <input
                            type="tel"
                            value={formData.secondaryContactPhone}
                            onChange={(e) =>
                              updateField(
                                "secondaryContactPhone",
                                e.target.value
                              )
                            }
                            placeholder="+94 11 234 5679"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                          Organisation Address{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          value={formData.organisationAddress}
                          onChange={(e) =>
                            updateField("organisationAddress", e.target.value)
                          }
                          placeholder="Street address, building, city"
                          className={inputClass}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            District <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.district}
                            onChange={(e) =>
                              updateField("district", e.target.value)
                            }
                            className={inputClass}
                          >
                            {DISTRICTS.filter(
                              (d) => d !== "National / Island-wide"
                            ).map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Province <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.province}
                            onChange={(e) =>
                              updateField("province", e.target.value)
                            }
                            className={inputClass}
                          >
                            {PROVINCES.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                          Operational Scope / Description{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={formData.organisationDescription}
                          onChange={(e) =>
                            updateField(
                              "organisationDescription",
                              e.target.value
                            )
                          }
                          placeholder="Describe your organisation's mission, geographic mandate, and humanitarian focus..."
                          className={textareaClass}
                        />
                      </div>
                    </div>

                    {/* SECTION B: HUMANITARIAN OPERATIONAL INFORMATION */}
                    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6F7] text-[#123B5C]">
                          <Globe size={16} />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#123B5C]">
                            B. Humanitarian Operational Information
                          </h2>
                          <p className="text-[13px] text-slate-500">
                            Emergency services, geographic coverage, and field
                            deployment readiness.
                          </p>
                        </div>
                      </div>

                      {/* 1. Main Areas of Operation (Searchable Multi-select) */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="block text-sm font-semibold text-[#173B56]">
                            1. Main Areas of Operation (Districts / Regions){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <span className="text-sm font-medium text-[#2784B5]">
                            {formData.areasOfOperation.length} selected
                          </span>
                        </div>
                        <div className="rounded-lg border border-slate-300 bg-slate-50/50 p-3">
                          <div className="mb-2 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
                            <Search size={13} className="text-slate-400" />
                            <input
                              value={operationAreaSearch}
                              onChange={(e) =>
                                setOperationAreaSearch(e.target.value)
                              }
                              placeholder="Search districts or regions..."
                              className="w-full bg-transparent text-sm sm:text-[15px] text-[#123B5C] outline-none placeholder:text-slate-400"
                            />
                          </div>
                          <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto pt-1">
                            {filteredDistrictsForMultiSelect.map((area) => {
                              const selected =
                                formData.areasOfOperation.includes(area);
                              return (
                                <button
                                  key={area}
                                  type="button"
                                  onClick={() =>
                                    toggleArrayItem("areasOfOperation", area)
                                  }
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                                    selected
                                      ? "bg-[#123B5C] text-white"
                                      : "border border-slate-200 bg-white text-slate-700 hover:border-[#123B5C]"
                                  }`}
                                >
                                  {selected ? `✓ ${area}` : area}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* 2. Main Areas of Assistance */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="block text-sm font-semibold text-[#173B56]">
                            2. Main Areas of Assistance{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <span className="text-sm font-medium text-[#2784B5]">
                            {formData.areasOfAssistance.length} selected
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {HUMANITARIAN_ASSISTANCE_AREAS.map((service) => {
                            const checked =
                              formData.areasOfAssistance.includes(service);
                            return (
                              <label
                                key={service}
                                className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition ${
                                  checked
                                    ? "border-[#123B5C] bg-[#EFF6F7] font-semibold text-[#123B5C]"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    toggleArrayItem(
                                      "areasOfAssistance",
                                      service
                                    )
                                  }
                                  className="h-3.5 w-3.5 accent-[#123B5C]"
                                />
                                <span>{service}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {formData.areasOfAssistance.includes("Other") && (
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Specify Other Area of Assistance{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            required
                            value={formData.otherAreaOfAssistance}
                            onChange={(e) =>
                              updateField(
                                "otherAreaOfAssistance",
                                e.target.value
                              )
                            }
                            placeholder="Describe additional humanitarian assistance services"
                            className={inputClass}
                          />
                        </div>
                      )}

                      {/* 3. Operational Capacity / Description */}
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                          3. Operational Capacity / Description{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={formData.operationalCapacity}
                          onChange={(e) =>
                            updateField("operationalCapacity", e.target.value)
                          }
                          placeholder="Describe your organisation's humanitarian capabilities, response teams, and regional reach..."
                          className={textareaClass}
                        />
                      </div>

                      {/* 4. Emergency Response Availability */}
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                          4. Emergency Response Availability{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.emergencyResponseAvailability}
                          onChange={(e) =>
                            updateField(
                              "emergencyResponseAvailability",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        >
                          {EMERGENCY_AVAILABILITY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 5. Additional Resources / Capabilities */}
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                          5. Additional Resources / Capabilities{" "}
                          <span className="text-[13px] font-normal text-slate-400">
                            (Optional)
                          </span>
                        </label>
                        <textarea
                          rows={2}
                          value={formData.additionalResources}
                          onChange={(e) =>
                            updateField("additionalResources", e.target.value)
                          }
                          placeholder="Optional description of available vehicles, equipment, facilities, trained staff, or specialized assets..."
                          className={textareaClass}
                        />
                      </div>
                    </div>

                    {/* SECTION C: AUTHORISED REPRESENTATIVE INFORMATION */}
                    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6F7] text-[#123B5C]">
                          <UserCheck size={16} />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#123B5C]">
                            C. Authorised Representative Information
                          </h2>
                          <p className="text-[13px] text-slate-500">
                            Primary point of contact for CareLink communications
                            and Administrator verification.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            required
                            value={formData.firstName}
                            onChange={(e) =>
                              updateField("firstName", e.target.value)
                            }
                            placeholder="Representative first name"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            required
                            value={formData.lastName}
                            onChange={(e) =>
                              updateField("lastName", e.target.value)
                            }
                            placeholder="Representative last name"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Position / Designation{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            required
                            value={formData.representativeDesignation}
                            onChange={(e) =>
                              updateField(
                                "representativeDesignation",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Country Director, Operations Lead"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Contact Email{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.representativeEmail}
                            onChange={(e) =>
                              updateField("representativeEmail", e.target.value)
                            }
                            placeholder="representative@organisation.org"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Contact Phone Number{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) =>
                              updateField("phone", e.target.value)
                            }
                            placeholder="+94 77 123 4567"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Alternative Contact Number{" "}
                            <span className="text-[13px] font-normal text-slate-400">
                              (Optional)
                            </span>
                          </label>
                          <input
                            type="tel"
                            value={formData.representativeAlternativePhone}
                            onChange={(e) =>
                              updateField(
                                "representativeAlternativePhone",
                                e.target.value
                              )
                            }
                            placeholder="+94 71 234 5678"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION D: ACCOUNT LOGIN INFORMATION */}
                    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6F7] text-[#123B5C]">
                          <Lock size={16} />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#123B5C]">
                            D. Account Login Information
                          </h2>
                          <p className="text-[13px] text-slate-500">
                            The Login Email serves as your CareLink username.
                          </p>
                        </div>
                      </div>

                      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={useRepEmailForLogin}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setUseRepEmailForLogin(checked);
                            if (checked && formData.representativeEmail) {
                              setFormData((prev) => ({
                                ...prev,
                                email: prev.representativeEmail,
                              }));
                            }
                          }}
                          className="h-3.5 w-3.5 accent-[#123B5C]"
                        />
                        <span>
                          Use authorised representative&apos;s contact email as
                          CareLink Login Email
                        </span>
                      </label>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                          Login Email (CareLink Username){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          disabled={useRepEmailForLogin}
                          value={
                            useRepEmailForLogin
                              ? formData.representativeEmail
                              : formData.email
                          }
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="login@organisation.org"
                          className={`${inputClass} ${
                            useRepEmailForLogin ? "bg-slate-100" : ""
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={formData.password}
                              onChange={(e) =>
                                updateField("password", e.target.value)
                              }
                              placeholder="Minimum 6 characters"
                              className={`${inputClass} pr-10`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                              aria-label="Toggle password visibility"
                            >
                              {showPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[#173B56]">
                            Confirm Password{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              value={formData.confirmPassword}
                              onChange={(e) =>
                                updateField("confirmPassword", e.target.value)
                              }
                              placeholder="Confirm password"
                              className={`${inputClass} pr-10`}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                              aria-label="Toggle confirm password visibility"
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 2 – Citizen & Volunteer Form (Preserved) */}
              {step === 2 && accountType !== "organisation" && (
                <div>
                  <h1 className="text-2xl font-medium tracking-tight text-[#123B5C] md:text-3xl">
                    Create your account
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Your email address will serve as your CareLink username.
                  </p>

                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="mt-6 space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#173B56]">
                          First name *
                        </label>
                        <input
                          required
                          value={formData.firstName}
                          onChange={(e) =>
                            updateField("firstName", e.target.value)
                          }
                          placeholder="First name"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#173B56]">
                          Last name *
                        </label>
                        <input
                          required
                          value={formData.lastName}
                          onChange={(e) =>
                            updateField("lastName", e.target.value)
                          }
                          placeholder="Last name"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#173B56]">
                        Email address (Username) *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="Enter your email address"
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#173B56]">
                          Phone number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          placeholder="Enter your phone number"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#173B56]">
                          Address
                        </label>
                        <input
                          value={formData.address}
                          onChange={(e) =>
                            updateField("address", e.target.value)
                          }
                          placeholder="Enter your address"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {accountType === "volunteer" && (
                      <div className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                          Volunteer Profile, Skills &amp; Availability
                        </p>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#173B56]">
                            Skills &amp; Certifications *
                          </label>
                          <input
                            required
                            value={formData.skills}
                            onChange={(e) =>
                              updateField("skills", e.target.value)
                            }
                            placeholder="e.g. First Aid, Search & Rescue, Logistics, Driving"
                            className={inputClass}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-[#173B56]">
                              Availability *
                            </label>
                            <select
                              value={formData.availability}
                              onChange={(e) =>
                                updateField("availability", e.target.value)
                              }
                              className={inputClass}
                            >
                              <option value="Immediate">
                                Immediate / On-Call
                              </option>
                              <option value="Full-Time">Full-Time</option>
                              <option value="Weekends">Weekends</option>
                              <option value="Evenings">Evenings</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-[#173B56]">
                              Preferred Operational Area
                            </label>
                            <input
                              value={formData.preferredLocation}
                              onChange={(e) =>
                                updateField("preferredLocation", e.target.value)
                              }
                              placeholder="e.g. Greater Riverton, North Ward"
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#173B56]">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={(e) =>
                              updateField("password", e.target.value)
                            }
                            placeholder="Minimum 6 characters"
                            className={`${inputClass} pr-10`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                            aria-label="Toggle password visibility"
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#173B56]">
                          Confirm password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              updateField("confirmPassword", e.target.value)
                            }
                            placeholder="Confirm password"
                            className={`${inputClass} pr-10`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                            aria-label="Toggle confirm password visibility"
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 3 – Partner Organisation Verification Documents & Confirmations */}
              {step === 3 && accountType === "organisation" && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-2xl font-medium tracking-tight text-[#123B5C] md:text-3xl">
                      Organisation Verification Documents
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Upload official registration evidence and review your
                      submission. Uploaded files are stored securely and are
                      accessible only to authorised CareLink administrators.
                    </p>
                  </div>

                  {/* Document Upload Cards */}
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#123B5C]">
                        Verification Documents (PDF, JPG, JPEG, PNG · Max 10 MB)
                      </h2>
                      <span className="rounded-full bg-[#EFF6F7] px-2.5 py-0.5 text-xs font-semibold text-[#123B5C]">
                        {uploadedDocuments.length} uploaded
                      </span>
                    </div>

                    {(
                      [
                        {
                          category:
                            "RegistrationCertificate" as DocumentSlotCategory,
                          title:
                            "Organisation Registration Certificate or NGO Registration Certificate",
                          required: true,
                          description:
                            "Official registration certificate issued by the NGO Secretariat, Divisional/District Secretariat, or statutory body.",
                        },
                        {
                          category:
                            "OrganisationProfile" as DocumentSlotCategory,
                          title: "Organisation Profile / Constitution",
                          required: false,
                          description:
                            "Charter, constitution, or official humanitarian profile document.",
                        },
                        {
                          category:
                            "AuthorisationLetter" as DocumentSlotCategory,
                          title: "Authorisation Letter for the Representative",
                          required: false,
                          description:
                            "Signed letter authorising the representative to register and manage the organisation on CareLink.",
                        },
                      ] as const
                    ).map((slot) => {
                      const existingDoc = getDocumentBySlot(slot.category);
                      const isUploading = uploadingSlot === slot.category;

                      return (
                        <div
                          key={slot.category}
                          className={`rounded-lg border p-3.5 transition ${
                            existingDoc
                              ? "border-emerald-200 bg-emerald-50/30"
                              : slot.required
                              ? "border-amber-200 bg-amber-50/20"
                              : "border-slate-200 bg-slate-50/40"
                          }`}
                        >
                          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <FileText
                                  size={15}
                                  className="shrink-0 text-[#123B5C]"
                                />
                                <p className="text-sm font-semibold text-[#123B5C]">
                                  {slot.title}{" "}
                                  {slot.required ? (
                                    <span className="text-red-500">*</span>
                                  ) : (
                                    <span className="text-[13px] font-normal text-slate-400">
                                      (Optional)
                                    </span>
                                  )}
                                </p>
                              </div>
                              <p className="mt-1 text-[13px] text-slate-500">
                                {slot.description}
                              </p>

                              {existingDoc && (
                                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-emerald-200 bg-white px-2.5 py-1.5 text-sm text-[#123B5C]">
                                  <CheckCircle2
                                    size={13}
                                    className="text-emerald-600"
                                  />
                                  <span className="font-semibold">
                                    {existingDoc.fileName}
                                  </span>
                                  <span className="text-[13px] text-slate-400">
                                    ({formatFileSize(existingDoc.fileSizeBytes)}
                                    )
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#123B5C] bg-white px-3 py-1.5 text-sm font-semibold text-[#123B5C] transition hover:bg-[#EFF6F7]">
                                <Upload size={13} />
                                <span>
                                  {isUploading
                                    ? "Reading..."
                                    : existingDoc
                                    ? "Replace file"
                                    : "Upload file"}
                                </span>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) =>
                                    handleFileUpload(slot.category, e)
                                  }
                                  className="hidden"
                                />
                              </label>

                              {existingDoc && (
                                <button
                                  type="button"
                                  onClick={() => removeDocument(slot.category)}
                                  className="rounded-lg border border-red-200 bg-white p-1.5 text-red-600 hover:bg-red-50"
                                  title="Remove file"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Additional Supporting Documents */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-3.5">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-sm font-semibold text-[#123B5C]">
                            Other Supporting Verification Documents{" "}
                            <span className="text-[13px] font-normal text-slate-400">
                              (Optional)
                            </span>
                          </p>
                          <p className="mt-1 text-[13px] text-slate-500">
                            Tax exemption certificate, operational MOUs, or
                            endorsement letters.
                          </p>
                        </div>

                        <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-[#123B5C] hover:bg-slate-50">
                          <Upload size={13} />
                          <span>Add document</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleFileUpload("SupportingDocument", e)
                            }
                            className="hidden"
                          />
                        </label>
                      </div>

                      {supportingDocuments.length > 0 && (
                        <div className="mt-2.5 space-y-1.5">
                          {supportingDocuments.map((doc) => (
                            <div
                              key={doc.fileName}
                              className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-[#123B5C]"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <CheckCircle2
                                  size={13}
                                  className="shrink-0 text-emerald-600"
                                />
                                <span className="truncate font-medium">
                                  {doc.fileName}
                                </span>
                                <span className="text-[13px] text-slate-400">
                                  ({formatFileSize(doc.fileSizeBytes)})
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  removeDocument(
                                    "SupportingDocument",
                                    doc.fileName
                                  )
                                }
                                className="ml-2 text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Application Review Summary */}
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#123B5C]">
                      Application Summary
                    </h2>
                    <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Organisation
                        </p>
                        <p className="mt-1 font-semibold text-[#123B5C]">
                          {formData.organisationName} (
                          {formData.organisationType === "Other"
                            ? formData.otherOrganisationType
                            : formData.organisationType}
                          )
                        </p>
                        <p className="mt-0.5 text-sm text-slate-600">
                          {formData.district}, {formData.province} ·{" "}
                          {formData.registrationCountry}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Authorised Representative
                        </p>
                        <p className="mt-1 font-semibold text-[#123B5C]">
                          {formData.firstName} {formData.lastName} ·{" "}
                          {formData.representativeDesignation}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-600">
                          Login Username:{" "}
                          {useRepEmailForLogin
                            ? formData.representativeEmail
                            : formData.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Required Confirmations */}
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#123B5C]">
                      Declarations &amp; Confirmations
                    </h2>

                    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.confirmAuthorisedRepresentative}
                        onChange={(e) =>
                          updateField(
                            "confirmAuthorisedRepresentative",
                            e.target.checked
                          )
                        }
                        className="mt-0.5 h-4 w-4 accent-[#123B5C]"
                      />
                      <span>
                        I confirm that I am authorised to register this
                        organisation. <span className="text-red-500">*</span>
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.confirmAccurateInformation}
                        onChange={(e) =>
                          updateField(
                            "confirmAccurateInformation",
                            e.target.checked
                          )
                        }
                        className="mt-0.5 h-4 w-4 accent-[#123B5C]"
                      />
                      <span>
                        I confirm that the information provided is accurate.{" "}
                        <span className="text-red-500">*</span>
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.agreeTermsAndPrivacy}
                        onChange={(e) =>
                          updateField("agreeTermsAndPrivacy", e.target.checked)
                        }
                        className="mt-0.5 h-4 w-4 accent-[#123B5C]"
                      />
                      <span>
                        I agree to the CareLink Terms and Conditions and Privacy
                        Policy. <span className="text-red-500">*</span>
                      </span>
                    </label>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/70 p-4">
                    <ShieldCheck
                      size={19}
                      className="shrink-0 text-amber-700"
                    />
                    <p className="text-sm leading-5 text-amber-900">
                      Partner Organisation accounts start in{" "}
                      <strong>PendingApproval</strong> status and require
                      Administrator verification before operational access is
                      granted.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3 – Citizen & Volunteer Review (Preserved) */}
              {step === 3 && accountType !== "organisation" && (
                <div>
                  <h1 className="text-2xl font-medium tracking-tight text-[#123B5C] md:text-3xl">
                    Review your details
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Check your information before completing registration.
                  </p>

                  <div className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Account type
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#123B5C]">
                        {
                          accountTypes.find((type) => type.id === accountType)
                            ?.title
                        }
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Full name
                      </p>
                      <p className="mt-1 text-sm text-[#123B5C]">
                        {formData.firstName} {formData.lastName}
                      </p>
                    </div>

                    {accountType === "volunteer" && (
                      <div className="border-t border-slate-100 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Volunteer Skills &amp; Availability
                        </p>
                        <p className="mt-1 text-sm text-[#123B5C]">
                          {formData.skills} · {formData.availability}
                        </p>
                      </div>
                    )}

                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Email address (Username)
                      </p>
                      <p className="mt-1 text-sm text-[#123B5C]">
                        {formData.email}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Phone number
                      </p>
                      <p className="mt-1 text-sm text-[#123B5C]">
                        {formData.phone}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-lg bg-white p-4">
                    <ShieldCheck
                      size={19}
                      className="shrink-0 text-[#2784B5]"
                    />
                    <p className="text-sm leading-5 text-slate-600">
                      Your account will become active immediately after
                      registration, and a confirmation email will be sent to
                      your inbox.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-7 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1 || isLoading}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    step === 1
                      ? "invisible"
                      : "border border-slate-300 bg-white text-[#123B5C] hover:bg-slate-100"
                  }`}
                >
                  <ArrowLeft size={14} />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={isLoading || uploadingSlot !== null}
                  className="flex items-center gap-2 rounded-lg bg-[#123B5C] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1D5F8A] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading && step === 3 ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>
                        {accountType === "organisation"
                          ? "Submitting Application..."
                          : "Creating Account..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {step === 3
                          ? accountType === "organisation"
                            ? "Submit Partner Registration"
                            : "Create Account"
                          : "Continue"}
                      </span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Already registered?{" "}
            <a
              href="/login"
              className="font-semibold text-[#2784B5] hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
