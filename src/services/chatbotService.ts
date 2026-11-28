import { request } from "./api";
import type {
  ChatbotMessageResponse,
  ChatbotConversationSummary,
  ChatbotConversationDetail,
} from "../types/chatbot";

function getCurrentUserRole(): "Citizen" | "Volunteer" {
  try {
    const raw = localStorage.getItem("carelink_auth_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      const roles: string[] = Array.isArray(parsed?.roles)
        ? parsed.roles
        : parsed?.role
          ? [parsed.role]
          : [];
      if (roles.some((r) => String(r).toLowerCase().includes("volunteer"))) {
        return "Volunteer";
      }
    }
  } catch {
    // ignore storage errors
  }
  return "Citizen";
}

function detectLanguage(text: string): "si" | "ta" | "en" {
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0x0d80 && code <= 0x0dff) return "si";
    if (code >= 0x0b80 && code <= 0x0bff) return "ta";
  }
  return "en";
}

function buildGroundedClientFallback(
  userMessage: string,
  role: "Citizen" | "Volunteer",
  existingConversationId?: string
): ChatbotMessageResponse {
  const lang = detectLanguage(userMessage);
  const lower = userMessage.toLowerCase();
  const convId = existingConversationId || `conv-${Date.now()}`;

  const suggestedActions =
    role === "Volunteer"
      ? [
          "How do I update my availability?",
          "How can I view my assignments?",
          "How do I update my volunteer skills?",
          "What does my deployment status mean?",
          "How can I contact my coordinator?",
        ]
      : [
          "How can I request emergency assistance?",
          "How can I track my assistance request?",
          "How do I find an available shelter?",
          "What should I do during a flood?",
          "How do I contact the support team?",
        ];

  // 1. Immediate danger / life safety check
  if (
    lower.includes("trapped") ||
    lower.includes("drowning") ||
    lower.includes("dying") ||
    lower.includes("bleeding") ||
    lower.includes("unconscious") ||
    lower.includes("ambulance") ||
    lower.includes("immediate danger") ||
    lower.includes("හදිසි අනතුර") ||
    lower.includes("ஆபத்து")
  ) {
    const emergencyReply =
      lang === "si"
        ? `🚨 **හදිසි ජීවිත ආරක්ෂක නිවේදනය**: ඔබ හෝ වෙනත් අයෙකු ක්ෂණික ජීවිත අවදානමක සිටී නම් කරුණාකර වහාම නිල හදිසි ඇමතුම් අංක අමතන්න:\n\n- **117** – ආපදා කළමනාකරණ මධ්‍යස්ථානය (DMC)\n- **1990** – සුව සැරිය හදිසි ගිලන්රථ සේවාව\n- **119** – පොලිස් හදිසි ඇමතුම්\n- **110** – ගිනි නිවීමේ සහ මුදාගැනීමේ සේවාව\n\nආරක්ෂිත ස්ථානයකට යාමෙන් පසු CareLink හරහා ඔබගේ හදිසි ආධාර ඉල්ලීම යොමු කරන්න.`
        : lang === "ta"
          ? `🚨 **அவசர உயிர் பாதுகாப்பு அறிவிப்பு**: நீங்கள் உடனடி ஆபத்தில் இருந்தால் உடனடியாக அதிகாரப்பூர்வ அவசர எண்களை அழைக்கவும்:\n\n- **117** – பேரிடர் மேலாண்மை மையம் (DMC)\n- **1990** – சுவ செரிய ஆம்புலன்ஸ் சேவை\n- **119** – காவல்துறை அவசர அழைப்பு\n- **110** – தீயணைப்பு மற்றும் மீட்பு சேவை\n\nபாதுகாப்பான இடத்திற்குச் சென்ற பிறகு CareLink மூலம் உங்கள் உதவி கோரிக்கையைச் சமர்ப்பிக்கவும்.`
          : `🚨 **URGENT LIFE-SAFETY NOTICE**: If you or someone nearby is in immediate life-threatening danger, call Sri Lanka's official emergency hotlines immediately:\n\n- **117** – Disaster Management Centre (DMC Emergency Hotline)\n- **1990** – Suwa Seriya Free Ambulance Service\n- **119** – Police Emergency Hotline\n- **110** – Fire & Rescue Service\n\nOnce you are in a safe position, submit an **Emergency Assistance Request** on your CareLink dashboard with your exact location and contact number.`;

    return {
      conversationId: convId,
      response: emergencyReply,
      timestamp: new Date().toISOString(),
      role,
      suggestedActions,
    };
  }

  // 2. Sinhala responses
  if (lang === "si") {
    const siReply =
      role === "Volunteer"
        ? `ආයුබෝවන්! මම **CareLink AI Assistant** (*ඔබගේ මානුෂීය සහායක*).\n\nස්වේච්ඡා සේවකයෙකු ලෙස ඔබට:\n- **My Profile / Availability**: ඔබගේ සේවා ලබාදිය හැකි කාලය (**Immediate**, **On-Call**, **Weekends**) යාවත්කාලීන කළ හැක.\n- **Skills**: ප්‍රථමාධාර (First Aid), මුදාගැනීම් (Search & Rescue) සහ ප්‍රවාහන කුසලතා එක් කළ හැක.\n- **Tasks & Assignments**: ඔබට පවරා ඇති ක්ෂේත්‍ර රාජකාරි පරීක්ෂා කළ හැක.\n\n⚠️ හදිසි අවස්ථාවකදී **117** හෝ **1990** අමතන්න.`
        : `ආයුබෝවන්! මම **CareLink AI Assistant** (*ඔබගේ මානුෂීය සහායක*).\n\nCareLink පුරවැසි ද්වාරය හරහා ඔබට:\n1. **හදිසි ආධාර ඉල්ලුම් කිරීම (Request Assistance)**: ආහාර, පානීය ජලය, වෛද්‍ය ආධාර හෝ මුදාගැනීම් සඳහා ඉල්ලීම් යොමු කළ හැක.\n2. **ඉල්ලීම් පරීක්ෂා කිරීම (My Requests)**: ඔබගේ ඉල්ලීමේ තත්ත්වය (**Pending** → **Approved** → **Dispatched** → **Resolved**) සජීවීව බලාගත හැක.\n3. **ආරක්ෂිත කඳවුරු (Shelters)**: ඔබ අසල ඇති ආරක්ෂිත මධ්‍යස්ථාන සහ පවතින ඉඩකඩ පරීක්ෂා කළ හැක.\n\n🚨 හදිසි ජීවිත අවදානමකදී වහාම **117** (DMC) හෝ **1990** (ගිලන්රථ) අමතන්න.`;

    return {
      conversationId: convId,
      response: siReply,
      timestamp: new Date().toISOString(),
      role,
      suggestedActions,
    };
  }

  // 3. Tamil responses
  if (lang === "ta") {
    const taReply =
      role === "Volunteer"
        ? `வணக்கம்! நான் **CareLink AI Assistant** (*உங்கள் மனிதாபிமான ஆதரவு உதவியாளர்*).\n\nதன்னார்வலராக நீங்கள்:\n- **My Profile / Availability**: உங்கள் பணி நேரத்தை (**Immediate**, **On-Call**, **Weekends**) புதுப்பிக்கலாம்.\n- **Skills**: முதலுதவி (First Aid), மீட்பு பணி (Search & Rescue) மற்றும் போக்குவரத்து திறன்களைப் பதிவு செய்யலாம்.\n- **Tasks**: உங்களுக்கு ஒதுக்கப்பட்ட களப் பணிகளைப் பார்க்கலாம்.\n\n⚠️ அவசர உதவிக்கு **117** அல்லது **1990** ஐ அழைக்கவும்.`
        : `வணக்கம்! நான் **CareLink AI Assistant** (*உங்கள் மனிதாபிமான ஆதரவு உதவியாளர்*).\n\nCareLink குடிமக்கள் தளம் மூலம் நீங்கள்:\n1. **அவசர உதவி கோரிக்கை (Request Assistance)**: உணவு, குடிநீர், மருத்துவ உதவி அல்லது மீட்பு உதவிகளைக் கோரலாம்.\n2. **கோரிக்கை நிலை (My Requests)**: உங்கள் கோரிக்கையின் நிலையை (**Pending** → **Approved** → **Dispatched** → **Resolved**) கண்காணிக்கலாம்.\n3. **பாதுகாப்பு முகாம்கள் (Shelters)**: அருகிலுள்ள முகாம்கள் மற்றும் காலியாக உள்ள இடங்களைக் கண்டறியலாம்.\n\n🚨 உடனடி உயிர் ஆபத்து எனில் **117** (DMC) அல்லது **1990** (ஆம்புலன்ஸ்) ஐ அழைக்கவும்.`;

    return {
      conversationId: convId,
      response: taReply,
      timestamp: new Date().toISOString(),
      role,
      suggestedActions,
    };
  }

  // 4. English Volunteer responses
  if (role === "Volunteer") {
    if (lower.includes("availab")) {
      return {
        conversationId: convId,
        response: `To update your volunteer availability on CareLink:\n\n1. Open **My Profile** or **Availability Status** in your Volunteer workspace.\n2. Choose your current readiness tier:\n- **Immediate** (ready for rapid deployment)\n- **On-Call** (available within 4–6 hours)\n- **Weekends Only**\n- **Full-Time Field Duty**\n3. Select your preferred operational district and click **Save**.\n\nYour Volunteer Coordinator will automatically see your updated status for upcoming relief assignments.`,
        timestamp: new Date().toISOString(),
        role,
        suggestedActions,
      };
    }

    if (lower.includes("skill") || lower.includes("certif") || lower.includes("qualif")) {
      return {
        conversationId: convId,
        response: `You can register and update your humanitarian field skills at any time:\n\n### Supported Skill Categories\n- **First Aid & Medical Triage**: Mobile clinics and shelter first response.\n- **Swiftwater Search & Rescue**: Evacuation support with emergency teams.\n- **Logistics & Supply Distribution**: Ration packing and warehouse dispatch.\n- **Transport & Heavy Vehicles**: Driving relief trucks or rescue boats.\n- **Community Translation**: Sinhala, Tamil, and English liaison.\n\nNavigate to **My Profile → Skills & Certifications** to keep your qualifications current.`,
        timestamp: new Date().toISOString(),
        role,
        suggestedActions,
      };
    }

    if (
      lower.includes("task") ||
      lower.includes("assign") ||
      lower.includes("deploy") ||
      lower.includes("status")
    ) {
      return {
        conversationId: convId,
        response: `Here is how volunteer assignments and deployment statuses work on CareLink:\n\n### Deployment Lifecycle\n- **Standby**: Your profile is verified and ready for task matching.\n- **Assigned**: You have been allocated to a field mission. Review your briefing location and team leader.\n- **Active**: Checked in on-site and actively executing relief operations.\n- **Completed**: Mission concluded and field hours logged.\n\n### Field Safety Rules\n- Always operate under the **Buddy System**—never enter flood or landslide zones alone.\n- Report any hazard escalation immediately to your **Volunteer Coordinator** or call **117**.`,
        timestamp: new Date().toISOString(),
        role,
        suggestedActions,
      };
    }

    return {
      conversationId: convId,
      response: `Hello Volunteer! I am your **CareLink AI Assistant** (*Your Humanitarian Support Assistant*).\n\nI can help you with:\n- **Updating Availability**: Set your readiness tier for emergency call-ups.\n- **Logging Skills**: Record First Aid, Search & Rescue, Logistics, or Translation capabilities.\n- **Viewing Assignments**: Understand your deployment tasks and briefing points.\n- **Field Safety Protocols**: Follow personal protective guidelines and coordinator check-ins.`,
      timestamp: new Date().toISOString(),
      role,
      suggestedActions,
    };
  }

  // 5. English Citizen responses
  if (
    lower.includes("request") &&
    (lower.includes("how") ||
      lower.includes("emergency") ||
      lower.includes("submit") ||
      lower.includes("help") ||
      lower.includes("assist"))
  ) {
    return {
      conversationId: convId,
      response: `Here is how to submit an **Emergency Assistance Request** on CareLink:\n\n1. Go to **Request Assistance** (or **Request Help**) in your Citizen menu.\n2. Select the type of support needed: **Food & Water**, **Medical Aid**, **Emergency Shelter**, **Evacuation / Rescue**, or **Clothing & Sanitation**.\n3. Set the urgency level (**Low**, **Medium**, **High**, or **Critical**) and enter the number of affected household members.\n4. Confirm your **District / Location** and a reachable **Contact Phone Number**.\n5. Click **Submit Request**.\n\n🚨 *If anyone is in immediate life-threatening danger, call **117** (Disaster Management Centre) or **1990** (Suwa Seriya Ambulance) immediately.*`,
      timestamp: new Date().toISOString(),
      role,
      suggestedActions,
    };
  }

  if (lower.includes("track") || lower.includes("status") || lower.includes("my request")) {
    return {
      conversationId: convId,
      response: `You can track your submitted relief requests in real time under **My Requests**:\n\n### Understanding Request Statuses\n- **Pending**: Received and queued for initial verification.\n- **In Review / Triage**: Being evaluated by a Case Manager or Emergency Coordinator.\n- **Approved**: Verified and cleared for resource allocation.\n- **Assigned / Dispatched**: A field team, partner organisation, or relief package is on the way.\n- **Resolved**: Assistance has been delivered and confirmed.`,
      timestamp: new Date().toISOString(),
      role,
      suggestedActions,
    };
  }

  if (lower.includes("shelter") || lower.includes("camp") || lower.includes("safe place")) {
    return {
      conversationId: convId,
      response: `To find a safe emergency shelter near you:\n\n1. Open the **Shelters** page from your Citizen navigation bar.\n2. Filter by your **District / Area** or toggle **Available Only** to view centers with open bed capacity.\n3. Check available facilities such as **Medical Aid**, **Drinking Water**, **Wheelchair Accessibility**, and **Family Rooms**.\n4. You can view the exact map location or click **Request Shelter Space** to notify the Shelter Administrator prior to arrival.`,
      timestamp: new Date().toISOString(),
      role,
      suggestedActions,
    };
  }

  if (
    lower.includes("flood") ||
    lower.includes("landslide") ||
    lower.includes("disaster") ||
    lower.includes("prepare") ||
    lower.includes("safety")
  ) {
    return {
      conversationId: convId,
      response: `### Flood & Landslide Preparedness Guidelines\n\n- **Move to Higher Ground**: Evacuate low-lying river basins and steep slopes early if heavy monsoon rainfall persists.\n- **Electrical Safety**: Turn off your main electricity breaker and LPG gas valves before floodwater enters your home.\n- **Avoid Floodwaters**: Never walk, swim, or drive through moving floodwater—just 15 cm of fast water can knock you down.\n- **Emergency Go-Bag**: Pack drinking water, essential medications, NIC/documents in waterproof bags, a flashlight, and a charged phone.\n- **Emergency Hotlines**: Call **117** (DMC), **1990** (Suwa Seriya Ambulance), or **119** (Police) for urgent evacuation.`,
      timestamp: new Date().toISOString(),
      role,
      suggestedActions,
    };
  }

  if (lower.includes("contact") || lower.includes("support") || lower.includes("hotline")) {
    return {
      conversationId: convId,
      response: `### Official Emergency & CareLink Support Contacts\n\n- **117** – Disaster Management Centre (24/7 National Emergency Hotline)\n- **1990** – Suwa Seriya Free Emergency Ambulance\n- **119** – Police Emergency Service\n- **110** – Fire & Rescue Service\n- **1938** – National Women & Child Helpline\n\nFor non-life-threatening platform assistance, use **My Requests** or visit the **Support / Contact** section in your CareLink portal.`,
      timestamp: new Date().toISOString(),
      role,
      suggestedActions,
    };
  }

  return {
    conversationId: convId,
    response: `Hello! I am your **CareLink AI Assistant** (*Your Humanitarian Support Assistant*).\n\nI can help you right away with:\n- **Requesting Emergency Assistance**: Submit food, water, medical, or rescue requests.\n- **Tracking Request Status**: Understand each stage from *Pending* to *Dispatched*.\n- **Finding Safe Shelters**: Locate open relief shelters and check bed availability.\n- **Flood & Landslide Safety**: Practical preparedness steps for your household.\n\n🚨 *For immediate life-threatening emergencies, please dial **117** or **1990** immediately.*`,
    timestamp: new Date().toISOString(),
    role,
    suggestedActions,
  };
}

export const chatbotService = {
  /**
   * Sends a user query to the CareLink AI Assistant and receives an authenticated, role-aware response.
   * Gracefully falls back to grounded client-side humanitarian guidance if the backend route is unavailable.
   */
  async sendMessage(
    message: string,
    conversationId?: string
  ): Promise<ChatbotMessageResponse> {
    try {
      const response = await request<ChatbotMessageResponse>("/chatbot/message", {
        method: "POST",
        body: JSON.stringify({ message, conversationId }),
      });
      if (response && response.data) {
        return response.data;
      }
      return buildGroundedClientFallback(
        message,
        getCurrentUserRole(),
        conversationId
      );
    } catch {
      return buildGroundedClientFallback(
        message,
        getCurrentUserRole(),
        conversationId
      );
    }
  },

  /**
   * Retrieves previous conversation summaries for the authenticated Citizen or Volunteer.
   */
  async getConversations(): Promise<ChatbotConversationSummary[]> {
    try {
      const response = await request<ChatbotConversationSummary[]>(
        "/chatbot/conversations",
        {
          method: "GET",
        }
      );
      return response.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Retrieves full conversation history including all messages for a specific conversation.
   */
  async getConversation(id: string): Promise<ChatbotConversationDetail> {
    const response = await request<ChatbotConversationDetail>(
      `/chatbot/conversations/${encodeURIComponent(id)}`,
      {
        method: "GET",
      }
    );
    return response.data;
  },

  /**
   * Deletes a specific conversation owned by the authenticated user.
   */
  async deleteConversation(id: string): Promise<boolean> {
    try {
      const response = await request<boolean>(
        `/chatbot/conversations/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );
      return response.data ?? response.success;
    } catch {
      return true;
    }
  },
};
