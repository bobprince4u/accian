import {
  Lightbulb,
  Code,
  GraduationCap,
  Heart,
  Shield,
  FileSearch,
  Database,
  TrendingUp,
  CheckCircle2,
  Target,
  Zap,
  Users,
} from "lucide-react";

export const detailedServices = [
  {
    id: "it-consulting",
    icon: Lightbulb,
    title: "IT Consulting & Advisory",
    overview:
      "Strategic technology guidance to support growth and efficiency. We help organisations plan, implement, and optimise their IT systems through expert advice and practical solutions.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    deliverables: [
      {
        icon: Target,
        name: "IT strategy and digital transformation",
        description:
          "Comprehensive planning and roadmaps for digital evolution and technology adoption",
      },
      {
        icon: FileSearch,
        name: "Systems analysis and architecture design",
        description:
          "In-depth evaluation and design of scalable, efficient system architectures",
      },
      {
        icon: Shield,
        name: "Cybersecurity and data protection advisory",
        description:
          "Expert guidance on security frameworks, compliance, and data protection strategies",
      },
      {
        icon: Database,
        name: "Cloud and infrastructure consulting",
        description:
          "Strategic advice on cloud migration, infrastructure optimization, and modernization",
      },
      {
        icon: CheckCircle2,
        name: "Technology project management",
        description:
          "End-to-end management of technology initiatives with proven methodologies",
      },
    ],
    keyBenefits: [
      "Align technology with business objectives",
      "Reduce operational costs and improve efficiency",
      "Minimize security risks and ensure compliance",
      "Future-proof your technology infrastructure",
    ],
  },
  {
    id: "software-development",
    icon: Code,
    title: "Business & Domestic Software Development",
    overview:
      "Custom software solutions built around real-world needs. We design, develop, and maintain secure, scalable software for businesses and individuals.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    deliverables: [
      {
        icon: Code,
        name: "Web and mobile application development",
        description:
          "Responsive, user-friendly applications for web and mobile platforms",
      },
      {
        icon: Zap,
        name: "Custom business systems and automation",
        description:
          "Tailored solutions to streamline operations and automate workflows",
      },
      {
        icon: TrendingUp,
        name: "SaaS product development",
        description:
          "End-to-end development of cloud-based software-as-a-service platforms",
      },
      {
        icon: CheckCircle2,
        name: "Software maintenance and support",
        description:
          "Ongoing updates, bug fixes, and technical support for your applications",
      },
      {
        icon: Database,
        name: "Integration with third-party platforms",
        description:
          "Seamless connectivity with existing tools and external services",
      },
    ],
    techStack: {
      Frontend: ["React", "Next.js", "Vue.js", "React Native"],
      Backend: ["Node.js", "Python", ".NET", "PHP"],
      Database: ["PostgreSQL", "MongoDB", "MySQL"],
      Cloud: ["AWS", "Azure", "Google Cloud"],
    },
  },
  {
    id: "education-training",
    icon: GraduationCap,
    title: "Education & Training",
    overview:
      "Practical learning for skills, careers, and personal development. We deliver flexible education and training programmes tailored to professional and community needs.",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    deliverables: [
      {
        icon: GraduationCap,
        name: "Professional and vocational training",
        description:
          "Industry-recognized certifications and skills development for career advancement",
      },
      {
        icon: Code,
        name: "Digital and technology skills courses",
        description:
          "Hands-on training in programming, data analysis, cybersecurity, and more",
      },
      {
        icon: Users,
        name: "Workshops, seminars, and online learning",
        description:
          "Flexible learning formats including live sessions and self-paced courses",
      },
      {
        icon: TrendingUp,
        name: "Business and personal development programmes",
        description:
          "Leadership, communication, and professional skills enhancement",
      },
    ],
    keyBenefits: [
      "Flexible learning formats to suit your schedule",
      "Expert instructors with real-world experience",
      "Recognized certifications and qualifications",
      "Tailored programmes for organizations and individuals",
    ],
  },
  {
    id: "social-care",
    icon: Heart,
    title: "Social Care & Community Support",
    overview:
      "Supporting independence, wellbeing, and quality of life. We provide compassionate, person-centered care services that help individuals thrive in their own homes and communities.",
    image:
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
    deliverables: [
      {
        icon: Heart,
        name: "Domiciliary and home-based support",
        description:
          "Professional care services delivered in the comfort of your own home",
      },
      {
        icon: CheckCircle2,
        name: "Personal care and daily living assistance",
        description:
          "Support with personal hygiene, meals, medication, and daily activities",
      },
      {
        icon: Users,
        name: "Companionship and wellbeing support",
        description:
          "Social interaction, emotional support, and activities to enhance quality of life",
      },
      {
        icon: Shield,
        name: "Community-based social work services",
        description:
          "Professional social work support for individuals and families",
      },
      {
        icon: Target,
        name: "Support for independent living",
        description:
          "Enabling individuals to maintain independence and dignity in their homes",
      },
    ],
    keyBenefits: [
      "Person-centered, compassionate care",
      "Qualified and experienced care professionals",
      "Flexible support tailored to individual needs",
      "Promoting dignity, independence, and wellbeing",
    ],
  },
];

export const industries = [
  {
    icon: "🏥",
    name: "Healthcare",
    description:
      "Secure, compliant solutions for healthcare providers and care organizations",
  },
  {
    icon: "🏦",
    name: "Financial Services",
    description:
      "Robust systems with advanced security for banking and finance",
  },
  {
    icon: "🏪",
    name: "Retail & E-commerce",
    description: "Scalable platforms for online retail and customer engagement",
  },
  {
    icon: "🎓",
    name: "Education",
    description:
      "Learning management systems and educational technology solutions",
  },
  {
    icon: "🏭",
    name: "Manufacturing",
    description: "Process automation and supply chain optimization solutions",
  },
  {
    icon: "🏛️",
    name: "Public Sector",
    description:
      "Government and public service digital transformation initiatives",
  },
];

export const comparisonData = [
  {
    service: "IT Consulting & Advisory",
    bestFor: "Organizations seeking strategic technology guidance and planning",
    timeline: "2-12 weeks",
    investment: "£5,000 - £50,000",
  },
  {
    service: "Software Development",
    bestFor: "Businesses needing custom applications or system automation",
    timeline: "2-6 months",
    investment: "£10,000 - £100,000+",
  },
  {
    service: "Education & Training",
    bestFor: "Teams and individuals seeking skills development",
    timeline: "1 day - 12 weeks",
    investment: "£500 - £10,000",
  },
  {
    service: "Social Care Support",
    bestFor: "Individuals and families requiring care services",
    timeline: "Ongoing",
    investment: "£15 - £40/hour",
  },
];

export const processSteps = [
  {
    number: "01",
    title: "Discovery",
    description:
      "We start by understanding your needs, challenges, and objectives through detailed consultation.",
  },
  {
    number: "02",
    title: "Planning",
    description:
      "We develop a tailored strategy and roadmap aligned with your goals and resources.",
  },
  {
    number: "03",
    title: "Delivery",
    description:
      "Our expert team executes the solution with regular updates and collaboration.",
  },
  {
    number: "04",
    title: "Support",
    description:
      "We provide ongoing maintenance, training, and support to ensure continued success.",
  },
];

export const faqs = [
  {
    question: "What areas do you serve?",
    answer:
      "We provide IT consulting and software development services across the UK, Nigeria, and internationally. Our education and training programmes are available both in-person and online. Social care services are currently available in select UK regions.",
  },
  {
    question: "How do you ensure quality and security?",
    answer:
      "We follow industry best practices, including secure development methodologies, regular testing, compliance frameworks (GDPR, ISO standards), and ongoing monitoring. All our care staff are DBS-checked and fully trained.",
  },
  {
    question: "Can you work with our existing systems?",
    answer:
      "Absolutely. We specialize in integrating with existing infrastructure and can work with legacy systems, third-party platforms, and various technology stacks.",
  },
  {
    question: "What is your pricing model?",
    answer:
      "Pricing varies by service type. IT consulting and software development are typically project-based or retainer agreements. Training can be per-course or corporate packages. Care services are hourly or package-based. Contact us for a detailed quote.",
  },
  {
    question: "Do you offer ongoing support after project completion?",
    answer:
      "Yes, we offer comprehensive support packages including maintenance, updates, training, and helpdesk services. Support terms are tailored to each project and client needs.",
  },
];
