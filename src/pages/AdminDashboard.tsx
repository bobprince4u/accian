import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DashboardView from "../components/DashboardView";
import ContactsView from "../components/ContactsView";
import ProjectsView from "../components/ProjectsView";
import ServicesView from "../components/ServicesView";
import TestimonialsView from "../components/TestimonialsView";
import ContactModal from "../components/ContactModal";
import ResourceError from "../components/ResourceError";
import { useResource } from "../hooks/useResource";
import { adminLogout } from "../services/adminService";
import {
  classifyApiFailure,
  describeApiFailure,
  shouldForceLogout,
} from "../services/apiConfig";
import * as api from "../services/resourceService";
import {
  Contact,
  Project,
  Service,
  Testimonial,
  DashboardStats,
  ViewType,
} from "../types";

function AdminDashboard() {
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // -----------------------------------------
  // LOGOUT
  // -----------------------------------------
  const handleLogout = useCallback(async () => {
    // Revokes the refresh token server-side before clearing local state.
    await adminLogout();
    navigate("/");
  }, [navigate]);

  /**
   * Passed to every resource, but only ever invoked for a genuine 401 — one
   * that already survived the API client's refresh attempt. A 403, 500 or
   * network failure leaves the session intact.
   */
  const handleSessionLost = useCallback(() => {
    void handleLogout();
  }, [handleLogout]);

  // -----------------------------------------
  // RESOURCES — each loads and fails independently
  // -----------------------------------------
  const contacts = useResource<Contact>(
    api.fetchContacts,
    "contacts",
    handleSessionLost
  );
  const projects = useResource<Project>(
    api.fetchProjects,
    "projects",
    handleSessionLost
  );
  const services = useResource<Service>(
    api.fetchServices,
    "services",
    handleSessionLost
  );
  const testimonials = useResource<Testimonial>(
    api.fetchTestimonials,
    "testimonials",
    handleSessionLost
  );

  // -----------------------------------------
  // STATS (derived — never stale)
  // -----------------------------------------
  const contactList = contacts.data;
  const converted = contactList.filter((c) => c.status === "Converted").length;

  const stats: DashboardStats = {
    totalContacts: contactList.length,
    newInquiries: contactList.filter((c) => c.status === "New").length,
    // The API serializes `projects.published` (BOOLEAN) to "Published"/"Draft",
    // so this now compares against a value the API actually emits. It used to
    // test `project.status === "Published"` against a field the API never
    // returned, so the count was permanently 0.
    activeProjects: projects.data.filter((p) => p.status === "Published").length,
    conversionRate:
      contactList.length > 0
        ? Math.round((converted / contactList.length) * 100)
        : 0,
  };

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentView]);

  /** Shared wrapper for write actions: report the failure, never swallow it. */
  const runAction = async (action: () => Promise<void>, description: string) => {
    setActionError(null);
    try {
      await action();
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;
      const kind = classifyApiFailure(status);

      if (shouldForceLogout(kind)) {
        void handleLogout();
        return;
      }

      // Status only — the response body can echo submitted contact details.
      console.error(`${description} failed (status: ${status ?? "none"})`);
      setActionError(describeApiFailure(kind, description));
    }
  };

  // -----------------------------------------
  // CONTACT HANDLERS
  // -----------------------------------------
  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: Contact["status"]) =>
    runAction(async () => {
      await api.updateContactStatus(id, status);

      contacts.patch((current) =>
        current.map((c) =>
          c.id === id
            ? { ...c, status, lastUpdated: new Date().toISOString() }
            : c
        )
      );

      if (selectedContact?.id === id) {
        setSelectedContact((prev) => (prev ? { ...prev, status } : null));
      }
    }, "the contact status");

  // -----------------------------------------
  // PROJECT HANDLERS
  // -----------------------------------------
  const handleAddProject = async (projectData: Omit<Project, "id">) =>
    runAction(async () => {
      const created = await api.createProject(projectData);
      projects.patch((current) => [created, ...current]);
    }, "the new project");

  const handleUpdateProject = async (
    id: string,
    projectData: Omit<Project, "id">
  ) =>
    runAction(async () => {
      const updated = await api.updateProject(id, projectData);
      projects.patch((current) =>
        current.map((p) => (p.id === id ? updated : p))
      );
    }, "the project");

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    return runAction(async () => {
      await api.deleteProject(id);
      projects.patch((current) => current.filter((p) => p.id !== id));
    }, "the project deletion");
  };

  // -----------------------------------------
  // SERVICE HANDLERS
  // -----------------------------------------
  const handleAddService = async (serviceData: Omit<Service, "id">) =>
    runAction(async () => {
      const created = await api.createService(serviceData);
      services.patch((current) => [created, ...current]);
    }, "the new service");

  const handleUpdateService = async (
    id: string,
    serviceData: Omit<Service, "id">
  ) =>
    runAction(async () => {
      const updated = await api.updateService(id, serviceData);
      services.patch((current) =>
        current.map((s) => (s.id === Number(id) ? updated : s))
      );
    }, "the service");

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    return runAction(async () => {
      await api.deleteService(id);
      services.patch((current) => current.filter((s) => s.id !== Number(id)));
    }, "the service deletion");
  };

  // -----------------------------------------
  // TESTIMONIAL HANDLERS
  // -----------------------------------------
  const handleAddTestimonial = async (
    testimonialData: Omit<Testimonial, "id">
  ) =>
    runAction(async () => {
      const created = await api.createTestimonial(testimonialData);
      testimonials.patch((current) => [created, ...current]);
    }, "the new testimonial");

  const handleUpdateTestimonial = async (
    id: string,
    testimonialData: Omit<Testimonial, "id">
  ) =>
    runAction(async () => {
      const updated = await api.updateTestimonial(id, testimonialData);
      testimonials.patch((current) =>
        current.map((t) => (t.id === id ? updated : t))
      );
    }, "the testimonial");

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    return runAction(async () => {
      await api.deleteTestimonial(id);
      testimonials.patch((current) => current.filter((t) => t.id !== id));
    }, "the testimonial deletion");
  };

  // -----------------------------------------
  // HEADER TITLES
  // -----------------------------------------
  const getViewTitle = () => {
    switch (currentView) {
      case "dashboard":
        return "Dashboard";
      case "contacts":
        return "Contact Management";
      case "projects":
        return "Portfolio Projects";
      case "services":
        return "Service Offerings";
      case "testimonials":
        return "Client Testimonials";
      default:
        return "Dashboard";
    }
  };

  const getViewSubtitle = () => {
    switch (currentView) {
      case "dashboard":
        return "Overview of your business metrics and recent activities";
      case "contacts":
        return "Manage and track all client inquiries and leads";
      case "projects":
        return "Showcase your completed and ongoing projects";
      case "services":
        return "Manage your service catalog and offerings";
      case "testimonials":
        return "Collect and showcase client feedback";
      default:
        return "";
    }
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        newInquiriesCount={stats.newInquiries}
        onLogout={handleLogout}
      />

      <div className="flex-1 lg:ml-0">
        <Header title={getViewTitle()} subtitle={getViewSubtitle()} />

        <main className="p-6">
          {actionError && (
            <ResourceError
              message={actionError}
              onDismiss={() => setActionError(null)}
            />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentView === "dashboard" && (
                <>
                  {contacts.error && (
                    <ResourceError
                      message={contacts.error.message}
                      onRetry={contacts.retry}
                    />
                  )}
                  {projects.error && (
                    <ResourceError
                      message={projects.error.message}
                      onRetry={projects.retry}
                    />
                  )}
                  <DashboardView
                    stats={stats}
                    recentContacts={contacts.data}
                    onViewContact={handleViewContact}
                    loading={contacts.loading || projects.loading}
                  />
                </>
              )}

              {currentView === "contacts" && (
                <>
                  {contacts.error && (
                    <ResourceError
                      message={contacts.error.message}
                      onRetry={contacts.retry}
                    />
                  )}
                  <ContactsView
                    contacts={contacts.data}
                    onViewContact={handleViewContact}
                    onUpdateStatus={handleUpdateStatus}
                    loading={contacts.loading}
                  />
                </>
              )}

              {currentView === "projects" && (
                <>
                  {projects.error && (
                    <ResourceError
                      message={projects.error.message}
                      onRetry={projects.retry}
                    />
                  )}
                  <ProjectsView
                    projects={projects.data}
                    onAdd={handleAddProject}
                    onUpdate={handleUpdateProject}
                    onDelete={handleDeleteProject}
                    loading={projects.loading}
                  />
                </>
              )}

              {currentView === "services" && (
                <>
                  {services.error && (
                    <ResourceError
                      message={services.error.message}
                      onRetry={services.retry}
                    />
                  )}
                  <ServicesView
                    services={services.data}
                    onAdd={handleAddService}
                    onUpdate={handleUpdateService}
                    onDelete={handleDeleteService}
                    loading={services.loading}
                  />
                </>
              )}

              {currentView === "testimonials" && (
                <>
                  {testimonials.error && (
                    <ResourceError
                      message={testimonials.error.message}
                      onRetry={testimonials.retry}
                    />
                  )}
                  <TestimonialsView
                    testimonials={testimonials.data}
                    onAdd={handleAddTestimonial}
                    onUpdate={handleUpdateTestimonial}
                    onDelete={handleDeleteTestimonial}
                    loading={testimonials.loading}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ContactModal
        contact={selectedContact}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

export default AdminDashboard;
