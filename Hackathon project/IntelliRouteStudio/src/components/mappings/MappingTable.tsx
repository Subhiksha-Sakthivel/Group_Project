import { SetStateAction, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { editMapping, getMappingById, getTable, createMapping, softDeleteMapping, restoreMapping } from "../../service/mappingsService";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../../components/common/Button";
import Label from "../form/Label";
// import Input from "../form/input/InputField";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { MappingTable } from "../../model/MappingTable";
import { Mapping, RestConfig } from "../../model/Mapping";
import Alert from "../ui/alert/Alert";
import { useNotifications } from "../../context/NotificationContext";

export default function MappingsTable() {
  const [mappings, setMappings] = useState<MappingTable[]>([]);
  const { isOpen: isCreateOpen, openModal: openCreateModal, closeModal: closeCreateModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isSoftDeleteOpen, openModal: openSoftDeleteModal, closeModal: closeSoftDeleteModal } = useModal();
  const { isOpen: isPreviewOpen, openModal: openPreviewModal, closeModal: closePreviewModal } = useModal();
  const [selectedMapping, setSelectedMapping] = useState<MappingTable | null>(null);
  const [editForm, setEditForm] = useState<Mapping | null>(null);
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2">("tab1");
  const { addNotification } = useNotifications();
  const [createForm, setCreateForm] = useState<Mapping>({
    id: "", // will be auto-generated
    operation: "",
    version: 1,
    status: "Enabled",
    lastModified: new Date(),
    soap: {
      endpoint: "",
      headers: "",
      requestPayload: "",
      responsePayload: ""},
    rest : {
      endpoint: "",
      headers: "",
      requestPayload: "",
      responsePayload: ""},
    restSource : {
      endpoint: "",
      headers: "",
      requestPayload: "",
      responsePayload: ""},
    restDestination : {
      endpoint: "",
      headers: "",
      requestPayload: "",
      responsePayload: ""},
  });

  // Alert state
  const [alert, setAlert] = useState<
    | { variant: "success" | "error" | "warning" | "info"; title: string; message: string }
    | null
  >(null);

  const showSuccess = (title: string, message: string) => {
    setAlert({ variant: "success", title, message });
    // Add to notification system
    addNotification({ variant: "success", title, message });
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };
  
  const showError = (title: string, message: string) => {
    setAlert({ variant: "error", title, message });
    // Add to notification system
    addNotification({ variant: "error", title, message });
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };
  
  const clearAlert = () => setAlert(null);


  function handleAI(): void {
    console.log("Handle AI api calling here");
  }

    const handleSoftDeleteConfirm = async () => {
    if (selectedMapping) {
      try {
        await softDeleteMapping(selectedMapping.id);
        // Update the mapping status in the local state
        setMappings((prev) =>
          prev.map((m) =>
            m.id === selectedMapping.id 
              ? { ...m, status: "Disabled", isDeleted: true, deletedAt: new Date() }
              : m
          )
        );
        showSuccess("Mapping disabled", `Mapping ${selectedMapping.operation} is disabled.`);
      } catch (error) {
        console.error("Failed to soft delete Mapping:", error);
        showError("Failed to disable mapping", String(error));
      }
      setSelectedMapping(null);
      closeSoftDeleteModal();
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreMapping(id);
      // Update the mapping status in the local state
      setMappings((prev) =>
        prev.map((m) =>
          m.id === id 
            ? { ...m, status: "Enabled", isDeleted: false, deletedAt: undefined }
            : m
        )
      );
      showSuccess("Mapping restored", "The mapping is active again.");
    } catch (error) {
      console.error("Failed to restore Mapping:", error);
      showError("Failed to restore mapping", String(error));
    }
  };

const handleEditConfirm = async () => {
  if (selectedMapping) {
    try {
      await editMapping(selectedMapping.id,editForm!);
      setMappings((prev) =>
        prev.map((m) =>
          m.id === selectedMapping.id
            ? {
                ...m,
                operation: editForm?.operation ?? m.operation,
                version: editForm?.version ?? m.version,
                status: editForm?.status ?? m.status,
                lastModified: new Date(),
              }
            : m
        )
      );
      showSuccess("Mapping updated", "Changes saved successfully.");
    } catch (error) {
      console.error("Failed to edit Mapping:", error);
      showError("Failed to update mapping", String(error));
    }
    setSelectedMapping(null);
    closeEditModal();
  }
};

const handleCreateConfirm = async () => {
  try {
    // find max id from current mappings
    const lastId = mappings.length > 0 ? Math.max(...mappings.map(m => parseInt(m.id))) : 0;

    const newMapping: Mapping = {
      ...createForm,
      id: (lastId + 1).toString(),
      lastModified: new Date(),
    };

    await createMapping(newMapping);

    setMappings(prev => [...prev, {
      id: newMapping.id,
      operation: newMapping.operation,
      version: newMapping.version,
      status: newMapping.status,
      lastModified: newMapping.lastModified,
    }]);

    setCreateForm({
      id: "",
      operation: "",
      version: 1,
      status: "Enabled",
      lastModified: new Date(),
      soap: {
        endpoint: "",
        headers: "",
        requestPayload: "",
        responsePayload: ""},
      rest : {
        endpoint: "",
        headers: "",
        requestPayload: "",
        responsePayload: ""},
      restSource : {
        endpoint: "",
        headers: "",
        requestPayload: "",
        responsePayload: ""},
      restDestination : {
        endpoint: "",
        headers: "",
        requestPayload: "",
        responsePayload: ""},
    });

    closeCreateModal();
    showSuccess("Mapping created", `Created ${newMapping.operation}.`);
  } catch (error) {
    console.error("Failed to create Mapping:", error);
    showError("Failed to create mapping", String(error));
  }
};

  const updateNested = (key: string, subKey: string, value: string) => {
    setEditForm(prev => {
      if (!prev) return null;
      const currentSection = prev[key as keyof Mapping] as RestConfig | null;
      if (!currentSection) return prev;
      return {
        ...prev,
        [key]: {
          ...currentSection,
          [subKey]: value
        }
      };
    });
  };

  const updateCreateNested = (key: string, subKey: string, value: string) => {
    setCreateForm(prev => {
      const currentSection = prev[key as keyof Mapping] as RestConfig;
      return {
        ...prev,
        [key]: {
          ...currentSection,
          [subKey]: value
        }
      };
    });
  };


  useEffect(() => {
  getTable()
    .then((data: SetStateAction<MappingTable[]>) => {
      console.log("API getMappings response:", data);
      setMappings(data);
      showSuccess("Loaded", "Mappings loaded successfully.");
    })
    .catch((error) => {
      console.error("Failed to fetch mappings:", error);
      showError("Failed to load mappings", String(error));
    });
}, []);


  const getStatusColor = (status: string): "success" | "warning" | "error" => {
  if (status.toLowerCase() === "enabled") return "success";
  if (status.toLowerCase().includes("review")) return "warning";
  if (status.toLowerCase() === "disabled") return "error";
  return "error"; // default to error if unknown
};


  return (
    <>
      {alert && (
        <div 
          className="fixed top-20 right-4 z-50 max-w-sm animate-in slide-in-from-right-2 duration-300"
        >
          <div className="relative">
            <button
              onClick={clearAlert}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Alert variant={alert.variant} title={alert.title} message={alert.message} />
          </div>
        </div>
      )}
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Mappings" />
      <div className="space-y-6">
        <ComponentCard
          title={
            <div className="flex items-center justify-between w-full">
              <span>Mapping Table</span>
              <Button type="button" onClick={openCreateModal}>
                + Create New
              </Button>
            </div>
          }
        >
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start">Operation</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-center">Version</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-center">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">Last Modified</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-center">Actions</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {mappings.map((MappingTable, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4">{MappingTable.operation}</TableCell>
                      <TableCell className="px-5 py-4 text-center">{MappingTable.version}</TableCell>
                      <TableCell className="px-5 py-4 text-center">
                        <div className="flex flex-col gap-1">
                          <Badge size="sm" color={getStatusColor(MappingTable.status)}>
                            {MappingTable.status}
                          </Badge>
                          {MappingTable.isDeleted && MappingTable.deletedAt && (
                            <div className="text-xs text-gray-500">
                              Disabled: {new Date(MappingTable.deletedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {new Date(MappingTable.lastModified).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                        {MappingTable.isDeleted ? (
                          // Show preview button for deleted mappings
                          <button
                            onClick={async () => {
                              const fullMapping = await getMappingById(MappingTable.id);
                              setEditForm(fullMapping);
                              setSelectedMapping(MappingTable);
                              openPreviewModal();
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 shadow-theme-xs hover:bg-blue-100 hover:text-blue-800 dark:border-blue-700 dark:bg-blue-800/20 dark:text-blue-400 dark:hover:bg-blue-800/30 lg:inline-flex lg:w-auto"
                            title="Preview Mapping"
                          >
                            <svg
                              className="fill-current"
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9 3C4.5 3 0.75 6.75 0.75 12C0.75 17.25 4.5 21 9 21C13.5 21 17.25 17.25 17.25 12C17.25 6.75 13.5 3 9 3ZM9 19.5C5.4 19.5 2.25 16.35 2.25 12C2.25 7.65 5.4 4.5 9 4.5C12.6 4.5 15.75 7.65 15.75 12C15.75 16.35 12.6 19.5 9 19.5ZM9 6C6.75 6 4.5 8.25 4.5 12C4.5 15.75 6.75 18 9 18C11.25 18 13.5 15.75 13.5 12C13.5 8.25 11.25 6 9 6ZM9 16.5C7.35 16.5 6 15.15 6 13.5C6 11.85 7.35 10.5 9 10.5C10.65 10.5 12 11.85 12 13.5C12 15.15 10.65 16.5 9 16.5Z"
                                fill=""
                              />
                            </svg>
                          </button>
                        ) : (
                          // Show edit button for active mappings
                          <button
                            onClick={async () => {
                              const fullMapping = await getMappingById(MappingTable.id);
                              setEditForm(fullMapping);
                              setSelectedMapping(MappingTable);
                              openEditModal();
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                            title="Edit Mapping"
                          >
                            <svg
                              className="fill-current"
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                                fill=""
                              />
                            </svg>
                          </button>
                        )}
                        {MappingTable.isDeleted ? (
                          // Show restore button for deleted mappings with new icon
                          <button
                            onClick={() => handleRestore(MappingTable.id)}
                            className="flex w-full items-center justify-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-theme-xs hover:bg-green-100 hover:text-green-800 dark:border-green-700 dark:bg-green-800/20 dark:text-green-400 dark:hover:bg-green-800/30 lg:inline-flex lg:w-auto"
                            title="Restore Mapping"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.07 0 9.25-3.79 9.95-8.72.08-.54-.35-1.02-.9-1.02-.45 0-.84.33-.91.77C19.67 17.37 16.17 20.5 12 20.5c-4.69 0-8.5-3.81-8.5-8.5S7.31 3.5 12 3.5c2.35 0 4.47.96 5.97 2.5H15c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1v2.11C17.83 2.84 15.07 2 12 2Z" />
                            </svg>
                          </button>
                        ) : (
                          // Show soft delete button for active mappings
                          <button
                            onClick={() => {
                              setSelectedMapping(MappingTable);
                              openSoftDeleteModal();
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                            title="Disable Mapping"
                          >
                            <svg
                              className="fill-current"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.5 3.333V2.5C7.5 1.57953 8.24619 0.833344 9.16667 0.833344H10.8333C11.7538 0.833344 12.5 1.57953 12.5 2.5V3.33334H16.6667C17.1269 3.33334 17.5 3.70643 17.5 4.16668C17.5 4.62692 17.1269 5.00001 16.6667 5.00001H3.33333C2.8731 5.00001 2.5 4.62692 2.5 4.16668C2.5 3.70643 2.8731 3.33334 3.33333 3.33334H7.5ZM4.16667 6.66668H15.8333L15.197 17.1803C15.1518 17.9369 14.5192 18.5417 13.7619 18.5417H6.23814C5.48083 18.5417 4.84823 17.9369 4.80302 17.1803L4.16667 6.66668Z"
                                fill=""
                              />
                            </svg>
                          </button>
                        )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
      </div>
      {/* Create Model */}
      <Modal isOpen={isCreateOpen} onClose={closeCreateModal} className="max-w-[800px] w-full m-4">
        <div className="relative flex flex-col w-full max-h-[90vh] p-4 overflow-y-auto bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="flex items-center justify-between px-2 pr-14 mb-6 shrink-0">
            <h4 className="inline-block mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create Mapping
            </h4>
            <Button size="sm" onClick={handleAI}>Regenerate with AI</Button>
          </div>

          {/* Tabs Header */}
        <div className="flex border-b border-gray-300 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "tab1" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"
            }`}
            onClick={() => setActiveTab("tab1")}
          >
            SOAP ↔ REST
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "tab2" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"
            }`}
            onClick={() => setActiveTab("tab2")}
          >
            REST Source ↔ REST Destination
          </button>
        </div>

          <form className="flex flex-col flex-1 overflow-hidden">
            <div className="px-2 overflow-y-auto custom-scrollbar">

              {/* Shared General Fields */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 mb-6">
                <div>
                  <Label>Operation</Label>
                  <input
                    type="text"
                    value={createForm.operation}
                    onChange={(e) => setCreateForm({ ...createForm, operation: e.target.value })}
                    placeholder="GetCustomers"
                    className="h-11 w-[285px] rounded-lg border px-3"
                  />
                </div>

                <div>
                  <Label>Version</Label>
                  <input
                    type="number"
                    value={createForm.version}
                    onChange={(e) => setCreateForm({ ...createForm, version: parseInt(e.target.value) })}
                    className="h-11 w-[285px] rounded-lg border px-3"
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="h-11 w-[285px] rounded-lg border px-3"
                  >
                    <option value="Enabled">Enabled</option>
                    <option value="Disabled">Disabled</option>
                    <option value="Ready for Review">Ready for Review</option>
                  </select>
                </div>
              </div>

                {/* --- Tab 1: SOAP ↔ REST --- */}
                {activeTab === "tab1" && (
                <>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">

                    <div>
                      <Label>SOAP Endpoint</Label>
                      <input
                        type="text"
                        value={createForm.soap?.endpoint || ""}
                        onChange={(e) => updateCreateNested("soap", "endpoint", e.target.value)}
                        placeholder="/GetCustomerList"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Endpoint</Label>
                      <input
                        type="text"
                        value={createForm.rest?.endpoint || ""}
                        onChange={(e) => updateCreateNested("rest", "endpoint", e.target.value)}
                        placeholder="/Customers"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>SOAP Headers</Label>
                      <textarea
                        value={createForm.soap?.headers || ""}
                        onChange={(e) => updateCreateNested("soap", "headers", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Headers</Label>
                      <textarea
                        value={createForm.rest?.headers || ""}
                        onChange={(e) => updateCreateNested("rest", "headers", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>SOAP Request Payload</Label>
                      <textarea
                        value={createForm.soap?.requestPayload || ""}
                        onChange={(e) => updateCreateNested("soap", "requestPayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Request Payload</Label>
                      <textarea
                        value={createForm.rest?.requestPayload || ""}
                        onChange={(e) => updateCreateNested("rest", "requestPayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>SOAP Response Payload</Label>
                      <textarea
                        value={createForm.soap?.responsePayload || ""}
                        onChange={(e) => updateCreateNested("soap", "responsePayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Response Payload</Label>
                      <textarea
                        value={createForm.rest?.responsePayload || ""}
                        onChange={(e) => updateCreateNested("rest", "responsePayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>
                  </div>
                </>
              )}

                {/* --- Tab 2: REST Source ↔ REST Destination --- */}
                {activeTab === "tab2" && (
                <>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">

                    <div>
                      <Label>REST Source Endpoint</Label>
                      <input
                        type="text"
                        value={createForm.restSource?.endpoint || ""}
                        onChange={(e) => updateCreateNested("restSource", "endpoint", e.target.value)}
                        placeholder="/SourceCustomers"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Endpoint</Label>
                      <input
                        type="text"
                        value={createForm.restDestination?.endpoint || ""}
                        onChange={(e) => updateCreateNested("restDestination", "endpoint", e.target.value)}
                        placeholder="/DestinationCustomers"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Source Headers</Label>
                      <textarea
                        value={createForm.restSource?.headers || ""}
                        onChange={(e) => updateCreateNested("restSource", "headers", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Headers</Label>
                      <textarea
                        value={createForm.restDestination?.headers || ""}
                        onChange={(e) => updateCreateNested("restDestination", "headers", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Source Request Payload</Label>
                      <textarea
                        value={createForm.restSource?.requestPayload || ""}
                        onChange={(e) => updateCreateNested("restSource", "requestPayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Request Payload</Label>
                      <textarea
                        value={createForm.restDestination?.requestPayload || ""}
                        onChange={(e) => updateCreateNested("restDestination", "requestPayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>
                    <div>
                      <Label>REST Source Response Payload</Label>
                      <textarea
                        value={createForm.restSource?.responsePayload || ""}
                        onChange={(e) => updateCreateNested("restSource", "responsePayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Response Payload</Label>
                      <textarea
                        value={createForm.restDestination?.responsePayload || ""}
                        onChange={(e) => updateCreateNested("restDestination", "responsePayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-3 px-2 mt-6 shrink-0 lg:justify-end">
              <Button type="button" onClick={closeCreateModal}>Close</Button>
              <Button type="button" onClick={handleCreateConfirm}>Save mapping</Button>
            </div>
          </form>
        </div>
      </Modal>


      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={closeEditModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="flex items-center justify-between px-2 pr-14 mb-6">
            <h4 className="inline-block mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Mapping
            </h4>
            <Button size="sm" onClick={handleAI}>Regenerate with AI</Button>
          </div>

          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 mb-6">
                {/* Shared General Fields */}
                <div>
                  <Label>Operation</Label>
                  <input
                    type="text"
                    value={editForm?.operation || ""}
                    onChange={(e) => setEditForm({ ...editForm!, operation: e.target.value })}
                    placeholder="GetCustomers"
                    className="h-11 w-[285px] rounded-lg border px-3"
                  />
                </div>

                <div>
                  <Label>Version</Label>
                  <input
                    type="number"
                    value={editForm?.version || ""}
                    onChange={(e) => setEditForm({ ...editForm!, version: parseInt(e.target.value) })}
                    className="h-11 w-[285px] rounded-lg border px-3"
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    value={editForm?.status || ""}
                    onChange={(e) => setEditForm({ ...editForm!, status: e.target.value })}
                    className="h-11 w-[285px] rounded-lg border px-3"
                  >
                    <option value="Enabled">Enabled</option>
                    <option value="Disabled">Disabled</option>
                    <option value="Ready for Review">Ready for Review</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Tab1 Fields (SOAP↔REST) */}
                {editForm?.soap?.endpoint || editForm?.rest?.endpoint ? (
                  <>
                    <div>
                      <Label>SOAP Endpoint</Label>
                      <input
                        type="text"
                        value={editForm?.soap?.endpoint || ""}
                        onChange={(e) => updateNested("soap", "endpoint", e.target.value)}
                        placeholder="/GetCustomerList"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Endpoint</Label>
                      <input
                        type="text"
                        value={editForm?.rest?.endpoint || ""}
                        onChange={(e) => updateNested("rest", "endpoint", e.target.value)}
                        placeholder="/Customers"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>SOAP Headers</Label>
                      <textarea
                        value={editForm?.soap?.headers || ""}
                        onChange={(e) => updateNested("soap", "headers", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Headers</Label>
                      <textarea
                        value={editForm?.rest?.headers || ""}
                        onChange={(e) => updateNested("rest", "headers", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>SOAP Request Payload</Label>
                      <textarea
                        value={editForm?.soap?.requestPayload || ""}
                        onChange={(e) => updateNested("soap", "requestPayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Request Payload</Label>
                      <textarea
                        value={editForm?.rest?.requestPayload || ""}
                        onChange={(e) => updateNested("rest", "requestPayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>SOAP Response Payload</Label>
                      <textarea
                        value={editForm?.soap?.responsePayload || ""}
                        onChange={(e) => updateNested("soap", "responsePayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Response Payload</Label>
                      <textarea
                        value={editForm?.rest?.responsePayload || ""}
                        onChange={(e) => updateNested("rest", "responsePayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>
                  </>
                ) : null}

                {/* Tab2 Fields (REST Source↔REST Destination) */}
                {editForm?.restSource?.endpoint || editForm?.restDestination?.endpoint ? (
                  <>
                    <div>
                      <Label>REST Source Endpoint</Label>
                      <input
                        type="text"
                        value={editForm?.restSource?.endpoint || ""}
                        onChange={(e) => updateNested("restSource", "endpoint", e.target.value)}
                        placeholder="/SourceCustomers"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Endpoint</Label>
                      <input
                        type="text"
                        value={editForm?.restDestination?.endpoint || ""}
                        onChange={(e) => updateNested("restDestination", "endpoint", e.target.value)}
                        placeholder="/DestinationCustomers"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Source Headers</Label>
                      <textarea
                        value={editForm?.restSource?.headers || ""}
                        onChange={(e) => updateNested("restSource", "headers", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Headers</Label>
                      <textarea
                        value={editForm?.restDestination?.headers || ""}
                        onChange={(e) => updateNested("restDestination", "headers", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Source Request Payload</Label>
                      <textarea
                        value={editForm?.restSource?.requestPayload || ""}
                        onChange={(e) => updateNested("restSource", "requestPayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Request Payload</Label>
                      <textarea
                        value={editForm?.restDestination?.requestPayload || ""}
                        onChange={(e) => updateNested("restDestination", "requestPayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>
                    <div>
                      <Label>REST Source Response Payload</Label>
                      <textarea
                        value={editForm?.restSource?.responsePayload || ""}
                        onChange={(e) => updateNested("restSource", "responsePayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Response Payload</Label>
                      <textarea
                        value={editForm?.restDestination?.responsePayload || ""}
                        onChange={(e) => updateNested("restDestination", "responsePayload", e.target.value)}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button type="button" onClick={closeEditModal}>Close</Button>
              <Button type="button" onClick={handleEditConfirm}>Save mapping</Button>
            </div>
          </form>
        </div>
      </Modal>

             {/* Soft Delete Confirmation Modal */}
       <Modal isOpen={isSoftDeleteOpen} onClose={closeSoftDeleteModal} className="max-w-sm m-4">
         <div className="p-6 bg-white rounded-3xl dark:bg-gray-900">
           <h4 className="text-lg font-semibold mb-4 text-orange-600">Disable Mapping</h4>
           <p className="text-gray-600 mb-4">
             This will disable the mapping and hide it from active operations. 
             The mapping will be permanently deleted after 30 days if not restored.
           </p>
           <div className="flex justify-end gap-3">
             <Button size="sm" variant="outline" onClick={closeSoftDeleteModal}>Cancel</Button>
             <Button size="sm" variant="primary" onClick={handleSoftDeleteConfirm} className="bg-orange-500 hover:bg-orange-600">Disable</Button>
           </div>
         </div>
       </Modal>

       {/* Preview Modal for Deleted Mappings */}
       <Modal isOpen={isPreviewOpen} onClose={closePreviewModal} className="max-w-[700px] m-4">
         <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
           <div className="flex items-center justify-between px-2 pr-14 mb-6">
             <h4 className="inline-block mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
               Preview Mapping (Read Only)
             </h4>
           </div>

           <div className="px-2 overflow-y-auto custom-scrollbar">
             <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 mb-6">
               {/* General Fields */}
               <div>
                 <Label>Operation</Label>
                 <div className="h-11 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                   {editForm?.operation || ""}
                 </div>
               </div>

               <div>
                 <Label>Version</Label>
                 <div className="h-11 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                   {editForm?.version || ""}
                 </div>
               </div>

               <div>
                 <Label>Status</Label>
                 <div className="h-11 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                   {editForm?.status || ""}
                 </div>
               </div>
             </div>

             {/* SOAP Configuration */}
             {editForm?.soap?.endpoint && (
               <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 mb-6">
                 <div>
                   <Label>SOAP Endpoint</Label>
                   <div className="h-11 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.soap.endpoint}
                   </div>
                 </div>

                 <div>
                   <Label>REST Endpoint</Label>
                   <div className="h-11 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.rest?.endpoint}
                   </div>
                 </div>

                 <div>
                   <Label>SOAP Headers</Label>
                   <div className="h-20 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.soap?.headers}
                   </div>
                 </div>

                 <div>
                   <Label>REST Headers</Label>
                   <div className="h-20 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.rest?.headers}
                   </div>
                 </div>

                 <div>
                   <Label>SOAP Request Payload</Label>
                   <div className="h-20 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.soap?.requestPayload}
                   </div>
                 </div>

                 <div>
                   <Label>REST Request Payload</Label>
                   <div className="h-20 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.rest?.requestPayload}
                   </div>
                 </div>

                 <div>
                   <Label>SOAP Response Payload</Label>
                   <div className="h-20 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.soap?.responsePayload}
                   </div>
                 </div>

                 <div>
                   <Label>REST Response Payload</Label>
                   <div className="h-20 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.rest?.responsePayload}
                   </div>
                 </div>
               </div>
             )}

             {/* REST Source/Destination Configuration */}
             {editForm?.restSource?.endpoint && (
               <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                 <div>
                   <Label>REST Source Endpoint</Label>
                   <div className="h-11 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.restSource.endpoint}
                   </div>
                 </div>

                 <div>
                   <Label>REST Destination Endpoint</Label>
                   <div className="h-11 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.restDestination?.endpoint}
                   </div>
                 </div>

                 <div>
                   <Label>REST Source Headers</Label>
                   <div className="h-20 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.restSource?.headers}
                   </div>
                 </div>

                 <div>
                   <Label>REST Destination Headers</Label>
                   <div className="h-20 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.restDestination?.headers}
                   </div>
                 </div>

                 <div>
                   <Label>REST Source Request Payload</Label>
                   <div className="h-20 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.restSource?.requestPayload}
                   </div>
                 </div>

                 <div>
                   <Label>REST Destination Request Payload</Label>
                   <div className="h-20 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.restDestination?.requestPayload}
                   </div>
                 </div>

                 <div>
                   <Label>REST Source Response Payload</Label>
                   <div className="h-20 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.restSource?.responsePayload}
                   </div>
                 </div>

                 <div>
                   <Label>REST Destination Response Payload</Label>
                   <div className="h-20 w-[285px] rounded-lg border px-3 py-2 bg-gray-50 text-gray-700">
                     {editForm.restDestination?.responsePayload}
                   </div>
                 </div>
               </div>
             )}
           </div>

           <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
             <Button type="button" onClick={closePreviewModal}>Close</Button>
           </div>
         </div>
       </Modal>
    </>
  );
}
