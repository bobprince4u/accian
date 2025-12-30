import { useState } from "react";
import { Phone, Mail, Clock, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    phone: "",
    countryCode: "+44",
    serviceInterest: "",
    projectBudget: "",
    projectTimeline: "",
    message: "",
    howHeard: "",
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [rateLimitError, setRateLimitError] = useState("");

  // Comprehensive country codes with validation rules (70+ countries)
  const countryCodes = [
    {
      code: "+1",
      country: "United States",
      flag: "🇺🇸",
      minLength: 10,
      maxLength: 10,
    },
    { code: "+1", country: "Canada", flag: "🇨🇦", minLength: 10, maxLength: 10 },
    { code: "+7", country: "Russia", flag: "🇷🇺", minLength: 10, maxLength: 10 },
    { code: "+20", country: "Egypt", flag: "🇪🇬", minLength: 10, maxLength: 10 },
    {
      code: "+27",
      country: "South Africa",
      flag: "🇿🇦",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+30",
      country: "Greece",
      flag: "🇬🇷",
      minLength: 10,
      maxLength: 10,
    },
    {
      code: "+31",
      country: "Netherlands",
      flag: "🇳🇱",
      minLength: 9,
      maxLength: 9,
    },
    { code: "+32", country: "Belgium", flag: "🇧🇪", minLength: 9, maxLength: 9 },
    { code: "+33", country: "France", flag: "🇫🇷", minLength: 9, maxLength: 9 },
    { code: "+34", country: "Spain", flag: "🇪🇸", minLength: 9, maxLength: 9 },
    { code: "+36", country: "Hungary", flag: "🇭🇺", minLength: 9, maxLength: 9 },
    { code: "+39", country: "Italy", flag: "🇮🇹", minLength: 9, maxLength: 10 },
    { code: "+40", country: "Romania", flag: "🇷🇴", minLength: 9, maxLength: 9 },
    {
      code: "+41",
      country: "Switzerland",
      flag: "🇨🇭",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+43",
      country: "Austria",
      flag: "🇦🇹",
      minLength: 10,
      maxLength: 11,
    },
    {
      code: "+44",
      country: "United Kingdom",
      flag: "🇬🇧",
      minLength: 10,
      maxLength: 10,
    },
    { code: "+45", country: "Denmark", flag: "🇩🇰", minLength: 8, maxLength: 8 },
    { code: "+46", country: "Sweden", flag: "🇸🇪", minLength: 9, maxLength: 9 },
    { code: "+47", country: "Norway", flag: "🇳🇴", minLength: 8, maxLength: 8 },
    { code: "+48", country: "Poland", flag: "🇵🇱", minLength: 9, maxLength: 9 },
    {
      code: "+49",
      country: "Germany",
      flag: "🇩🇪",
      minLength: 10,
      maxLength: 11,
    },
    { code: "+51", country: "Peru", flag: "🇵🇪", minLength: 9, maxLength: 9 },
    {
      code: "+52",
      country: "Mexico",
      flag: "🇲🇽",
      minLength: 10,
      maxLength: 10,
    },
    { code: "+53", country: "Cuba", flag: "🇨🇺", minLength: 8, maxLength: 8 },
    {
      code: "+54",
      country: "Argentina",
      flag: "🇦🇷",
      minLength: 10,
      maxLength: 10,
    },
    {
      code: "+55",
      country: "Brazil",
      flag: "🇧🇷",
      minLength: 11,
      maxLength: 11,
    },
    { code: "+56", country: "Chile", flag: "🇨🇱", minLength: 9, maxLength: 9 },
    {
      code: "+57",
      country: "Colombia",
      flag: "🇨🇴",
      minLength: 10,
      maxLength: 10,
    },
    {
      code: "+58",
      country: "Venezuela",
      flag: "🇻🇪",
      minLength: 10,
      maxLength: 10,
    },
    {
      code: "+60",
      country: "Malaysia",
      flag: "🇲🇾",
      minLength: 9,
      maxLength: 10,
    },
    {
      code: "+61",
      country: "Australia",
      flag: "🇦🇺",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+62",
      country: "Indonesia",
      flag: "🇮🇩",
      minLength: 10,
      maxLength: 11,
    },
    {
      code: "+63",
      country: "Philippines",
      flag: "🇵🇭",
      minLength: 10,
      maxLength: 10,
    },
    {
      code: "+64",
      country: "New Zealand",
      flag: "🇳🇿",
      minLength: 9,
      maxLength: 10,
    },
    {
      code: "+65",
      country: "Singapore",
      flag: "🇸🇬",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+66",
      country: "Thailand",
      flag: "🇹🇭",
      minLength: 9,
      maxLength: 9,
    },
    { code: "+81", country: "Japan", flag: "🇯🇵", minLength: 10, maxLength: 10 },
    {
      code: "+82",
      country: "South Korea",
      flag: "🇰🇷",
      minLength: 9,
      maxLength: 10,
    },
    {
      code: "+84",
      country: "Vietnam",
      flag: "🇻🇳",
      minLength: 9,
      maxLength: 10,
    },
    { code: "+86", country: "China", flag: "🇨🇳", minLength: 11, maxLength: 11 },
    {
      code: "+90",
      country: "Turkey",
      flag: "🇹🇷",
      minLength: 10,
      maxLength: 10,
    },
    { code: "+91", country: "India", flag: "🇮🇳", minLength: 10, maxLength: 10 },
    {
      code: "+92",
      country: "Pakistan",
      flag: "🇵🇰",
      minLength: 10,
      maxLength: 10,
    },
    {
      code: "+93",
      country: "Afghanistan",
      flag: "🇦🇫",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+94",
      country: "Sri Lanka",
      flag: "🇱🇰",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+95",
      country: "Myanmar",
      flag: "🇲🇲",
      minLength: 9,
      maxLength: 10,
    },
    { code: "+98", country: "Iran", flag: "🇮🇷", minLength: 10, maxLength: 10 },
    {
      code: "+212",
      country: "Morocco",
      flag: "🇲🇦",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+213",
      country: "Algeria",
      flag: "🇩🇿",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+216",
      country: "Tunisia",
      flag: "🇹🇳",
      minLength: 8,
      maxLength: 8,
    },
    { code: "+218", country: "Libya", flag: "🇱🇾", minLength: 9, maxLength: 10 },
    { code: "+220", country: "Gambia", flag: "🇬🇲", minLength: 7, maxLength: 7 },
    {
      code: "+221",
      country: "Senegal",
      flag: "🇸🇳",
      minLength: 9,
      maxLength: 9,
    },
    { code: "+223", country: "Mali", flag: "🇲🇱", minLength: 8, maxLength: 8 },
    { code: "+224", country: "Guinea", flag: "🇬🇳", minLength: 9, maxLength: 9 },
    {
      code: "+225",
      country: "Ivory Coast",
      flag: "🇨🇮",
      minLength: 10,
      maxLength: 10,
    },
    {
      code: "+226",
      country: "Burkina Faso",
      flag: "🇧🇫",
      minLength: 8,
      maxLength: 8,
    },
    { code: "+227", country: "Niger", flag: "🇳🇪", minLength: 8, maxLength: 8 },
    { code: "+228", country: "Togo", flag: "🇹🇬", minLength: 8, maxLength: 8 },
    { code: "+229", country: "Benin", flag: "🇧🇯", minLength: 8, maxLength: 8 },
    {
      code: "+230",
      country: "Mauritius",
      flag: "🇲🇺",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+231",
      country: "Liberia",
      flag: "🇱🇷",
      minLength: 7,
      maxLength: 8,
    },
    {
      code: "+232",
      country: "Sierra Leone",
      flag: "🇸🇱",
      minLength: 8,
      maxLength: 8,
    },
    { code: "+233", country: "Ghana", flag: "🇬🇭", minLength: 9, maxLength: 9 },
    {
      code: "+234",
      country: "Nigeria",
      flag: "🇳🇬",
      minLength: 10,
      maxLength: 10,
    },
    { code: "+235", country: "Chad", flag: "🇹🇩", minLength: 8, maxLength: 8 },
    {
      code: "+236",
      country: "Central African Republic",
      flag: "🇨🇫",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+237",
      country: "Cameroon",
      flag: "🇨🇲",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+238",
      country: "Cape Verde",
      flag: "🇨🇻",
      minLength: 7,
      maxLength: 7,
    },
    {
      code: "+239",
      country: "São Tomé and Príncipe",
      flag: "🇸🇹",
      minLength: 7,
      maxLength: 7,
    },
    {
      code: "+240",
      country: "Equatorial Guinea",
      flag: "🇬🇶",
      minLength: 9,
      maxLength: 9,
    },
    { code: "+241", country: "Gabon", flag: "🇬🇦", minLength: 7, maxLength: 8 },
    {
      code: "+242",
      country: "Republic of the Congo",
      flag: "🇨🇬",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+243",
      country: "DR Congo",
      flag: "🇨🇩",
      minLength: 9,
      maxLength: 9,
    },
    { code: "+244", country: "Angola", flag: "🇦🇴", minLength: 9, maxLength: 9 },
    {
      code: "+245",
      country: "Guinea-Bissau",
      flag: "🇬🇼",
      minLength: 7,
      maxLength: 7,
    },
    {
      code: "+248",
      country: "Seychelles",
      flag: "🇸🇨",
      minLength: 7,
      maxLength: 7,
    },
    { code: "+249", country: "Sudan", flag: "🇸🇩", minLength: 9, maxLength: 9 },
    { code: "+250", country: "Rwanda", flag: "🇷🇼", minLength: 9, maxLength: 9 },
    {
      code: "+251",
      country: "Ethiopia",
      flag: "🇪🇹",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+252",
      country: "Somalia",
      flag: "🇸🇴",
      minLength: 8,
      maxLength: 9,
    },
    {
      code: "+253",
      country: "Djibouti",
      flag: "🇩🇯",
      minLength: 8,
      maxLength: 8,
    },
    { code: "+254", country: "Kenya", flag: "🇰🇪", minLength: 9, maxLength: 9 },
    {
      code: "+255",
      country: "Tanzania",
      flag: "🇹🇿",
      minLength: 9,
      maxLength: 9,
    },
    { code: "+256", country: "Uganda", flag: "🇺🇬", minLength: 9, maxLength: 9 },
    {
      code: "+257",
      country: "Burundi",
      flag: "🇧🇮",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+258",
      country: "Mozambique",
      flag: "🇲🇿",
      minLength: 9,
      maxLength: 9,
    },
    { code: "+260", country: "Zambia", flag: "🇿🇲", minLength: 9, maxLength: 9 },
    {
      code: "+261",
      country: "Madagascar",
      flag: "🇲🇬",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+262",
      country: "Réunion",
      flag: "🇷🇪",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+263",
      country: "Zimbabwe",
      flag: "🇿🇼",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+264",
      country: "Namibia",
      flag: "🇳🇦",
      minLength: 9,
      maxLength: 10,
    },
    { code: "+265", country: "Malawi", flag: "🇲🇼", minLength: 9, maxLength: 9 },
    {
      code: "+266",
      country: "Lesotho",
      flag: "🇱🇸",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+267",
      country: "Botswana",
      flag: "🇧🇼",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+268",
      country: "Eswatini",
      flag: "🇸🇿",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+269",
      country: "Comoros",
      flag: "🇰🇲",
      minLength: 7,
      maxLength: 7,
    },
    {
      code: "+351",
      country: "Portugal",
      flag: "🇵🇹",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+352",
      country: "Luxembourg",
      flag: "🇱🇺",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+353",
      country: "Ireland",
      flag: "🇮🇪",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+354",
      country: "Iceland",
      flag: "🇮🇸",
      minLength: 7,
      maxLength: 7,
    },
    {
      code: "+355",
      country: "Albania",
      flag: "🇦🇱",
      minLength: 9,
      maxLength: 9,
    },
    { code: "+356", country: "Malta", flag: "🇲🇹", minLength: 8, maxLength: 8 },
    { code: "+357", country: "Cyprus", flag: "🇨🇾", minLength: 8, maxLength: 8 },
    {
      code: "+358",
      country: "Finland",
      flag: "🇫🇮",
      minLength: 9,
      maxLength: 10,
    },
    {
      code: "+359",
      country: "Bulgaria",
      flag: "🇧🇬",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+370",
      country: "Lithuania",
      flag: "🇱🇹",
      minLength: 8,
      maxLength: 8,
    },
    { code: "+371", country: "Latvia", flag: "🇱🇻", minLength: 8, maxLength: 8 },
    {
      code: "+372",
      country: "Estonia",
      flag: "🇪🇪",
      minLength: 7,
      maxLength: 8,
    },
    {
      code: "+373",
      country: "Moldova",
      flag: "🇲🇩",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+374",
      country: "Armenia",
      flag: "🇦🇲",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+375",
      country: "Belarus",
      flag: "🇧🇾",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+376",
      country: "Andorra",
      flag: "🇦🇩",
      minLength: 6,
      maxLength: 6,
    },
    { code: "+377", country: "Monaco", flag: "🇲🇨", minLength: 8, maxLength: 9 },
    {
      code: "+378",
      country: "San Marino",
      flag: "🇸🇲",
      minLength: 10,
      maxLength: 10,
    },
    {
      code: "+380",
      country: "Ukraine",
      flag: "🇺🇦",
      minLength: 9,
      maxLength: 9,
    },
    { code: "+381", country: "Serbia", flag: "🇷🇸", minLength: 9, maxLength: 9 },
    {
      code: "+382",
      country: "Montenegro",
      flag: "🇲🇪",
      minLength: 8,
      maxLength: 8,
    },
    { code: "+383", country: "Kosovo", flag: "🇽🇰", minLength: 8, maxLength: 8 },
    {
      code: "+385",
      country: "Croatia",
      flag: "🇭🇷",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+386",
      country: "Slovenia",
      flag: "🇸🇮",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+387",
      country: "Bosnia and Herzegovina",
      flag: "🇧🇦",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+389",
      country: "North Macedonia",
      flag: "🇲🇰",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+420",
      country: "Czech Republic",
      flag: "🇨🇿",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+421",
      country: "Slovakia",
      flag: "🇸🇰",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+423",
      country: "Liechtenstein",
      flag: "🇱🇮",
      minLength: 7,
      maxLength: 7,
    },
    {
      code: "+500",
      country: "Falkland Islands",
      flag: "🇫🇰",
      minLength: 5,
      maxLength: 5,
    },
    { code: "+501", country: "Belize", flag: "🇧🇿", minLength: 7, maxLength: 7 },
    {
      code: "+502",
      country: "Guatemala",
      flag: "🇬🇹",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+503",
      country: "El Salvador",
      flag: "🇸🇻",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+504",
      country: "Honduras",
      flag: "🇭🇳",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+505",
      country: "Nicaragua",
      flag: "🇳🇮",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+506",
      country: "Costa Rica",
      flag: "🇨🇷",
      minLength: 8,
      maxLength: 8,
    },
    { code: "+507", country: "Panama", flag: "🇵🇦", minLength: 8, maxLength: 8 },
    { code: "+509", country: "Haiti", flag: "🇭🇹", minLength: 8, maxLength: 8 },
    {
      code: "+591",
      country: "Bolivia",
      flag: "🇧🇴",
      minLength: 8,
      maxLength: 8,
    },
    { code: "+592", country: "Guyana", flag: "🇬🇾", minLength: 7, maxLength: 7 },
    {
      code: "+593",
      country: "Ecuador",
      flag: "🇪🇨",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+594",
      country: "French Guiana",
      flag: "🇬🇫",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+595",
      country: "Paraguay",
      flag: "🇵🇾",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+596",
      country: "Martinique",
      flag: "🇲🇶",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+597",
      country: "Suriname",
      flag: "🇸🇷",
      minLength: 7,
      maxLength: 7,
    },
    {
      code: "+598",
      country: "Uruguay",
      flag: "🇺🇾",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+599",
      country: "Curaçao",
      flag: "🇨🇼",
      minLength: 7,
      maxLength: 7,
    },
    {
      code: "+852",
      country: "Hong Kong",
      flag: "🇭🇰",
      minLength: 8,
      maxLength: 8,
    },
    { code: "+853", country: "Macau", flag: "🇲🇴", minLength: 8, maxLength: 8 },
    {
      code: "+855",
      country: "Cambodia",
      flag: "🇰🇭",
      minLength: 9,
      maxLength: 9,
    },
    { code: "+856", country: "Laos", flag: "🇱🇦", minLength: 9, maxLength: 10 },
    {
      code: "+880",
      country: "Bangladesh",
      flag: "🇧🇩",
      minLength: 10,
      maxLength: 10,
    },
    { code: "+886", country: "Taiwan", flag: "🇹🇼", minLength: 9, maxLength: 9 },
    {
      code: "+960",
      country: "Maldives",
      flag: "🇲🇻",
      minLength: 7,
      maxLength: 7,
    },
    {
      code: "+961",
      country: "Lebanon",
      flag: "🇱🇧",
      minLength: 8,
      maxLength: 8,
    },
    { code: "+962", country: "Jordan", flag: "🇯🇴", minLength: 9, maxLength: 9 },
    { code: "+963", country: "Syria", flag: "🇸🇾", minLength: 9, maxLength: 9 },
    { code: "+964", country: "Iraq", flag: "🇮🇶", minLength: 10, maxLength: 10 },
    { code: "+965", country: "Kuwait", flag: "🇰🇼", minLength: 8, maxLength: 8 },
    {
      code: "+966",
      country: "Saudi Arabia",
      flag: "🇸🇦",
      minLength: 9,
      maxLength: 9,
    },
    { code: "+967", country: "Yemen", flag: "🇾🇪", minLength: 9, maxLength: 9 },
    { code: "+968", country: "Oman", flag: "🇴🇲", minLength: 8, maxLength: 8 },
    {
      code: "+970",
      country: "Palestine",
      flag: "🇵🇸",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+971",
      country: "United Arab Emirates",
      flag: "🇦🇪",
      minLength: 9,
      maxLength: 9,
    },
    { code: "+972", country: "Israel", flag: "🇮🇱", minLength: 9, maxLength: 9 },
    {
      code: "+973",
      country: "Bahrain",
      flag: "🇧🇭",
      minLength: 8,
      maxLength: 8,
    },
    { code: "+974", country: "Qatar", flag: "🇶🇦", minLength: 8, maxLength: 8 },
    { code: "+975", country: "Bhutan", flag: "🇧🇹", minLength: 8, maxLength: 8 },
    {
      code: "+976",
      country: "Mongolia",
      flag: "🇲🇳",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+977",
      country: "Nepal",
      flag: "🇳🇵",
      minLength: 10,
      maxLength: 10,
    },
    {
      code: "+992",
      country: "Tajikistan",
      flag: "🇹🇯",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+993",
      country: "Turkmenistan",
      flag: "🇹🇲",
      minLength: 8,
      maxLength: 8,
    },
    {
      code: "+994",
      country: "Azerbaijan",
      flag: "🇦🇿",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+995",
      country: "Georgia",
      flag: "🇬🇪",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+996",
      country: "Kyrgyzstan",
      flag: "🇰🇬",
      minLength: 9,
      maxLength: 9,
    },
    {
      code: "+998",
      country: "Uzbekistan",
      flag: "🇺🇿",
      minLength: 9,
      maxLength: 9,
    },
  ];

  // Validate phone number based on country
  const validatePhone = (phone: string, countryCode: string): boolean => {
    const country = countryCodes.find((c) => c.code === countryCode);
    if (!country) return true;

    const digitsOnly = phone.replace(/\D/g, "");

    if (digitsOnly.length === 0) {
      setPhoneError("");
      return true;
    }

    if (digitsOnly.length < country.minLength) {
      setPhoneError(
        `Phone must be ${country.minLength} digits for ${country.country}`
      );
      return false;
    }

    if (digitsOnly.length > country.maxLength) {
      setPhoneError(
        `Phone must not exceed ${country.maxLength} digits for ${country.country}`
      );
      return false;
    }

    setPhoneError("");
    return true;
  };

  // Rate limiting check
  const checkRateLimit = (): boolean => {
    const submissions: number[] = JSON.parse(
      localStorage.getItem("formSubmissions") || "[]"
    );
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentSubmissions = submissions.filter(
      (time: number) => time > oneHourAgo
    );

    if (recentSubmissions.length >= 3) {
      setRateLimitError(
        "Too many submissions. Please wait an hour and try again."
      );
      return false;
    }

    return true;
  };

  // Record submission
  const recordSubmission = (): void => {
    const submissions: number[] = JSON.parse(
      localStorage.getItem("formSubmissions") || "[]"
    );
    submissions.push(Date.now());
    localStorage.setItem("formSubmissions", JSON.stringify(submissions));
  };

  // Generate security token
  const generateToken = (): string => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "phone" || name === "countryCode") {
      const phone = name === "phone" ? value : formData.phone;
      const code = name === "countryCode" ? value : formData.countryCode;
      validatePhone(phone, code);
    }
  };

  // Sanitize input
  const sanitizeInput = (input: string): string => {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  };

  const handleSubmit = async () => {
    // Check rate limit
    if (!checkRateLimit()) {
      return;
    }

    // Validate required fields
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.serviceInterest ||
      !formData.message
    ) {
      setRateLimitError("Please fill in all required fields.");
      return;
    }

    // Validate phone if provided
    if (
      formData.phone &&
      !validatePhone(formData.phone, formData.countryCode)
    ) {
      return;
    }

    setSubmitting(true);
    setRateLimitError("");

    try {
      const securityToken = generateToken();
      const timestamp = Date.now();

      const sanitizedData = {
        fullName: sanitizeInput(formData.fullName),
        email: sanitizeInput(formData.email),
        companyName: sanitizeInput(formData.companyName),
        phone: formData.phone
          ? `${formData.countryCode}${formData.phone.replace(/\D/g, "")}`
          : "",
        serviceInterest: sanitizeInput(formData.serviceInterest),
        projectBudget: sanitizeInput(formData.projectBudget),
        projectTimeline: sanitizeInput(formData.projectTimeline),
        message: sanitizeInput(formData.message),
        howHeard: sanitizeInput(formData.howHeard),
        securityToken,
        timestamp,
        userAgent: navigator.userAgent,
      };

      const response = await fetch(`/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Security-Token": securityToken,
        },
        body: JSON.stringify(sanitizedData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      recordSubmission();
      setFormSubmitted(true);

      setTimeout(() => {
        setFormSubmitted(false);
        setFormData({
          fullName: "",
          email: "",
          companyName: "",
          phone: "",
          countryCode: "+44",
          serviceInterest: "",
          projectBudget: "",
          projectTimeline: "",
          message: "",
          howHeard: "",
        });
        setSubmitting(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to submit form:", error);
      setRateLimitError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-16 bg-linear-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Let's Start Your Digital Transformation
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ready to discuss your project? Our expert team is here to answer
            your questions and provide tailored solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                Send Us a Message
              </h3>

              {rateLimitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {rateLimitError}
                </div>
              )}

              {formSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} className="text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-green-600">
                    Thank You!
                  </h4>
                  <p className="text-gray-600 text-center">
                    We've received your message and will get back to you within
                    24 hours.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      maxLength={100}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Business Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      maxLength={100}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      maxLength={100}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your Company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                        className="px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`flex-1 px-4 py-3 border ${
                          phoneError ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="7749101623"
                      />
                    </div>
                    {phoneError && (
                      <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Service Interest <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="serviceInterest"
                      value={formData.serviceInterest}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select a service</option>
                      <option value="it-consulting-advisory">
                        IT Consulting & Advisory
                      </option>
                      <option value="software-development">
                        Business & Domestic Software Development
                      </option>
                      <option value="education-training">
                        Education & Training
                      </option>
                      <option value="social-care">
                        Social Care & Community Support
                      </option>
                      <option value="data-science-ai">
                        Data Science, AI & Predictive Analytics
                      </option>
                      <option value="multiple">Multiple Services</option>
                      <option value="not-sure">Not Sure Yet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Project Budget Range
                    </label>
                    <select
                      name="projectBudget"
                      value={formData.projectBudget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select budget range</option>
                      <option value="prefer-discuss">Prefer to Discuss</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Project Timeline
                    </label>
                    <select
                      name="projectTimeline"
                      value={formData.projectTimeline}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select timeline</option>
                      <option value="urgent">Urgent (Within 1 month)</option>
                      <option value="short-term">
                        Short-term (1-3 months)
                      </option>
                      <option value="medium-term">
                        Medium-term (3-6 months)
                      </option>
                      <option value="long-term">Long-term (6+ months)</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      maxLength={1000}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Tell us about your project..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      How did you hear about us?
                    </label>
                    <select
                      name="howHeard"
                      value={formData.howHeard}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select an option</option>
                      <option value="google">Google Search</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="referral">Referral</option>
                      <option value="social-media">Social Media</option>
                      <option value="event">Event/Conference</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <p className="text-xs text-gray-600">
                    By submitting this form, you agree to our Privacy Policy.
                  </p>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !!phoneError}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                Direct Contact
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Phone className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h5 className="font-semibold mb-1">Phone</h5>
                    <p className="text-gray-600">+44 7749 101623</p>
                    <p className="text-sm text-gray-500">
                      Mon-Fri, 9AM-5PM GMT
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Mail className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h5 className="font-semibold mb-1">Email</h5>
                    <p className="text-gray-600">admin@acciannginfo.com</p>
                    <p className="text-sm text-gray-500">Response within 24h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Clock className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h5 className="font-semibold mb-1">Business Hours</h5>
                    <p className="text-gray-600">Mon-Fri: 9AM-5PM GMT</p>
                    <p className="text-gray-600">Sat: By Appointment</p>
                    <p className="text-gray-600">Sun: Closed</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <MapPin className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h5 className="font-semibold mb-1">Location</h5>
                    <p className="text-gray-600">🇬🇧 United Kingdom</p>
                    <p className="text-sm text-gray-500">
                      Serving clients worldwide
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-blue-900 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
              <h4 className="text-xl font-bold mb-4">Ready to Get Started?</h4>
              <p className="text-blue-100 mb-6">
                Schedule a free consultation to discuss your project.
              </p>
              <button className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold w-full hover:bg-blue-50 transition-colors">
                Fill the Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
