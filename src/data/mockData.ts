
import { 
  Project, 
  ProjectStatus, 
  User, 
  PaymentStatus, 
  Payment,
  ProjectWithPayments
} from "@/types";

export const users: User[] = [
  {
    id: "1",
    name: "Ana Silva",
    email: "ana.silva@example.com",
    role: "admin",
    avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    id: "2",
    name: "Carlos Oliveira",
    email: "carlos.oliveira@example.com",
    role: "developer",
    avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg"
  },
  {
    id: "3",
    name: "Marina Costa",
    email: "marina.costa@example.com",
    role: "developer",
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: "4",
    name: "Rafael Santos",
    email: "rafael.santos@example.com",
    role: "finance",
    avatarUrl: "https://randomuser.me/api/portraits/men/45.jpg"
  }
];

export const projects: Project[] = [
  {
    id: "1",
    name: "Website E-commerce",
    client: "Loja Virtual Ltda",
    totalValue: 15000,
    status: ProjectStatus.NEW,
    teamMembers: ["2", "3"],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    description: "Desenvolvimento de uma loja virtual completa com catálogo de produtos, carrinho e pagamento.",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: "2",
    name: "App Mobile",
    client: "Delivery Express",
    totalValue: 25000,
    status: ProjectStatus.IN_PROGRESS,
    teamMembers: ["2"],
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    description: "Aplicativo de entrega para iOS e Android com recursos de geolocalização e pagamentos.",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: "3",
    name: "Sistema de Gestão",
    client: "Consultoria SA",
    totalValue: 30000,
    status: ProjectStatus.IN_PRODUCTION,
    teamMembers: ["2", "3"],
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description: "Sistema para gestão de clientes, projetos e faturamento.",
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
  },
  {
    id: "4",
    name: "Portal Educacional",
    client: "Instituto Educação",
    totalValue: 18000,
    status: ProjectStatus.ACTIVE,
    teamMembers: ["3"],
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Already delivered
    description: "Portal para cursos online com vídeos, exercícios e certificados.",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  },
  {
    id: "5",
    name: "Landing Page",
    client: "Startup Inovação",
    totalValue: 5000,
    status: ProjectStatus.NEW,
    teamMembers: ["2"],
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    description: "Landing page para captação de leads para novo produto.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: "6",
    name: "Sistema de Reservas",
    client: "Hotel Paraíso",
    totalValue: 22000,
    status: ProjectStatus.IN_PROGRESS,
    teamMembers: ["2", "3"],
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    description: "Sistema para gerenciamento de reservas, check-in e check-out.",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
  },
  {
    id: "7",
    name: "Blog Corporativo",
    client: "Empresa Tecnologia",
    totalValue: 8000,
    status: ProjectStatus.ACTIVE,
    teamMembers: ["3"],
    deadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Already delivered
    description: "Blog para publicação de artigos e notícias da empresa.",
    createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000)
  },
  {
    id: "8",
    name: "CRM Customizado",
    client: "Vendas Diretas",
    totalValue: 28000,
    status: ProjectStatus.IN_PRODUCTION,
    teamMembers: ["2", "3"],
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description: "CRM personalizado para equipe de vendas com relatórios e dashboards.",
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000)
  }
];

export const payments: Payment[] = [
  {
    id: "1",
    projectId: "1",
    amount: 5000,
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: PaymentStatus.PAID,
    paidDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    description: "Entrada - Website E-commerce"
  },
  {
    id: "2",
    projectId: "1",
    amount: 10000,
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    status: PaymentStatus.PENDING,
    description: "Parcela final - Website E-commerce"
  },
  {
    id: "3",
    projectId: "2",
    amount: 12500,
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: PaymentStatus.PAID,
    paidDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    description: "Primeira parcela - App Mobile"
  },
  {
    id: "4",
    projectId: "2",
    amount: 12500,
    dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    status: PaymentStatus.PENDING,
    description: "Segunda parcela - App Mobile"
  },
  {
    id: "5",
    projectId: "3",
    amount: 15000,
    dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    status: PaymentStatus.PAID,
    paidDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    description: "Primeira parcela - Sistema de Gestão"
  },
  {
    id: "6",
    projectId: "3",
    amount: 15000,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: PaymentStatus.PENDING,
    description: "Segunda parcela - Sistema de Gestão"
  },
  {
    id: "7",
    projectId: "4",
    amount: 18000,
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: PaymentStatus.PAID,
    paidDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    description: "Pagamento único - Portal Educacional"
  },
  {
    id: "8",
    projectId: "5",
    amount: 2500,
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: PaymentStatus.OVERDUE,
    description: "Entrada - Landing Page"
  },
  {
    id: "9",
    projectId: "5",
    amount: 2500,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    status: PaymentStatus.PENDING,
    description: "Parcela final - Landing Page"
  }
];

// Helper function to get projects with their related payments
export const getProjectsWithPayments = (): ProjectWithPayments[] => {
  return projects.map(project => {
    const projectPayments = payments.filter(payment => payment.projectId === project.id);
    const paidAmount = projectPayments
      .filter(payment => payment.status === PaymentStatus.PAID)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    return {
      ...project,
      payments: projectPayments,
      paidAmount,
      remainingAmount: project.totalValue - paidAmount
    };
  });
};

// Helper function to get assigned team members for a project
export const getProjectTeamMembers = (project: Project): User[] => {
  return users.filter(user => project.teamMembers.includes(user.id));
};
