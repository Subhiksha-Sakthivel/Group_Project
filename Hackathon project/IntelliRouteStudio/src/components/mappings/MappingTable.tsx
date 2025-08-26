import { SetStateAction, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { editMapping, deleteMapping, getMappingById, getTable, createMapping } from "../../service/mappingsService";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../../components/common/Button";
import Label from "../form/Label";
// import Input from "../form/input/InputField";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { MappingTable } from "../../model/MappingTable";
import { Mapping } from "../../model/Mapping";

export default function MappingsTable() {
  const [mappings, setMappings] = useState<MappingTable[]>([]);
  const { isOpen: isCreateOpen, openModal: openCreateModal, closeModal: closeCreateModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [selectedMapping, setSelectedMapping] = useState<MappingTable | null>(null);
  const [editForm, setEditForm] = useState<Mapping | null>(null);
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2">("tab1");
  const [createForm, setCreateForm] = useState<Mapping>({
    id: "", // will be auto-generated
    operation: "",
    version: 1,
    status: "Enabled",
    lastModified: new Date(),
    soapEndpoint: "",
    soapHeaders: "",
    soapRequestPayload: "",
    soapResponsePayload: "",
    restEndpoint: "",
    restHeaders: "",
    restRequestPayload: "",
    restResponsePayload: "",
    restSourceEndpoint: "",
    restSourceHeaders: "",
    restSourceRequestPayload: "",
    restSourceResponsePayload: "",
    restDestinationEndpoint: "",
    restDestinationHeaders: "",
    restDestinationRequestPayload: "",
    restDestinationResponsePayload: ""
  });


  function handleAI(): void {
    console.log("Handle AI api calling here");
  }

  const handleDeleteConfirm = async () => {
  if (selectedMapping) {
    try {
      await deleteMapping(selectedMapping.id);
      setMappings((prev) => prev.filter((m) => m.id !== selectedMapping.id));
    } catch (error) {
      console.error("Failed to delete Mapping:", error);
    }
    setSelectedMapping(null);
    closeDeleteModal();
  }
};

const handleEditConfirm = async () => {
  if (selectedMapping) {
    try {
      await editMapping(selectedMapping.id,editForm!);
      setMappings((prev) =>
        prev.map((m) =>
          m.id === selectedMapping.id ? { ...m, ...editForm } : m
        )
      );
    } catch (error) {
      console.error("Failed to edit Mapping:", error);
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
      soapEndpoint: "",
      soapHeaders: "",
      soapRequestPayload: "",
      soapResponsePayload: "",
      restEndpoint: "",
      restHeaders: "",
      restRequestPayload: "",
      restResponsePayload: "",
    });

    closeCreateModal();
  } catch (error) {
    console.error("Failed to create Mapping:", error);
  }
};


  useEffect(() => {
  getTable()
    .then((data: SetStateAction<MappingTable[]>) => {
      console.log("API getMappings response:", data);
      setMappings(data);
    })
    .catch((error) => {
      console.error("Failed to fetch mappings:", error);
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
                    <TableCell isHeader className="px-5 py-3 text-start">Version</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">Last Modified</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">Actions</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {mappings.map((MappingTable, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4">{MappingTable.operation}</TableCell>
                      <TableCell className="px-5 py-4">{MappingTable.version}</TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" color={getStatusColor(MappingTable.status)}>
                          {MappingTable.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {new Date(MappingTable.lastModified).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-5 py-4 flex gap-2">
                        <button
                          onClick={async () => {
                            const fullMapping = await getMappingById(MappingTable.id);
                            setEditForm(fullMapping);
                            setSelectedMapping(MappingTable);
                            openEditModal();
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
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
                        <button
                          onClick={() => {
                            setSelectedMapping(MappingTable);
                            openDeleteModal();
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
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
                        value={createForm.soapEndpoint}
                        onChange={(e) => setCreateForm({ ...createForm, soapEndpoint: e.target.value })}
                        placeholder="/GetCustomerList"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Endpoint</Label>
                      <input
                        type="text"
                        value={createForm.restEndpoint}
                        onChange={(e) => setCreateForm({ ...createForm, restEndpoint: e.target.value })}
                        placeholder="/Customers"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>SOAP Headers</Label>
                      <textarea
                        value={createForm.soapHeaders}
                        onChange={(e) => setCreateForm({ ...createForm, soapHeaders: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Headers</Label>
                      <textarea
                        value={createForm.restHeaders}
                        onChange={(e) => setCreateForm({ ...createForm, restHeaders: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>SOAP Request Payload</Label>
                      <textarea
                        value={createForm.soapRequestPayload}
                        onChange={(e) => setCreateForm({ ...createForm, soapRequestPayload: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Request Payload</Label>
                      <textarea
                        value={createForm.restRequestPayload}
                        onChange={(e) => setCreateForm({ ...createForm, restRequestPayload: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>SOAP Response Payload</Label>
                      <textarea
                        value={createForm.soapResponsePayload}
                        onChange={(e) => setCreateForm({ ...createForm, soapResponsePayload: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Response Payload</Label>
                      <textarea
                        value={createForm.restResponsePayload}
                        onChange={(e) => setCreateForm({ ...createForm, restResponsePayload: e.target.value })}
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
                        value={createForm.restSourceEndpoint}
                        onChange={(e) => setCreateForm({ ...createForm, restSourceEndpoint: e.target.value })}
                        placeholder="/SourceCustomers"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Endpoint</Label>
                      <input
                        type="text"
                        value={createForm.restDestinationEndpoint}
                        onChange={(e) => setCreateForm({ ...createForm, restDestinationEndpoint: e.target.value })}
                        placeholder="/DestinationCustomers"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Source Headers</Label>
                      <textarea
                        value={createForm.restSourceHeaders}
                        onChange={(e) => setCreateForm({ ...createForm, restSourceHeaders: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Headers</Label>
                      <textarea
                        value={createForm.restDestinationHeaders}
                        onChange={(e) => setCreateForm({ ...createForm, restDestinationHeaders: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Source Request Payload</Label>
                      <textarea
                        value={createForm.restSourceRequestPayload}
                        onChange={(e) => setCreateForm({ ...createForm, restSourceRequestPayload: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Request Payload</Label>
                      <textarea
                        value={createForm.restDestinationRequestPayload}
                        onChange={(e) => setCreateForm({ ...createForm, restDestinationRequestPayload: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>
                    <div>
                      <Label>REST Source Response Payload</Label>
                      <textarea
                        value={createForm.restSourceResponsePayload}
                        onChange={(e) => setCreateForm({ ...createForm, restSourceResponsePayload: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Response Payload</Label>
                      <textarea
                        value={createForm.restDestinationResponsePayload}
                        onChange={(e) => setCreateForm({ ...createForm, restDestinationResponsePayload: e.target.value })}
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
                {editForm?.soapEndpoint || editForm?.restEndpoint ? (
                  <>
                    <div>
                      <Label>SOAP Endpoint</Label>
                      <input
                        type="text"
                        value={editForm?.soapEndpoint || ""}
                        onChange={(e) => setEditForm({ ...editForm!, soapEndpoint: e.target.value })}
                        placeholder="/GetCustomerList"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Endpoint</Label>
                      <input
                        type="text"
                        value={editForm?.restEndpoint || ""}
                        onChange={(e) => setEditForm({ ...editForm!, restEndpoint: e.target.value })}
                        placeholder="/Customers"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>SOAP Headers</Label>
                      <textarea
                        value={editForm?.soapHeaders || ""}
                        onChange={(e) => setEditForm({ ...editForm!, soapHeaders: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Headers</Label>
                      <textarea
                        value={editForm?.restHeaders || ""}
                        onChange={(e) => setEditForm({ ...editForm!, restHeaders: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>SOAP Request Payload</Label>
                      <textarea
                        value={editForm?.soapRequestPayload || ""}
                        onChange={(e) => setEditForm({ ...editForm!, soapRequestPayload: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Request Payload</Label>
                      <textarea
                        value={editForm?.restRequestPayload || ""}
                        onChange={(e) => setEditForm({ ...editForm!, restRequestPayload: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>SOAP Response Payload</Label>
                      <textarea
                        value={editForm?.soapResponsePayload || ""}
                        onChange={(e) => setEditForm({ ...editForm!, soapResponsePayload: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Response Payload</Label>
                      <textarea
                        value={editForm?.restResponsePayload || ""}
                        onChange={(e) => setEditForm({ ...editForm!, restResponsePayload: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>
                  </>
                ) : null}

                {/* Tab2 Fields (REST Source↔REST Destination) */}
                {editForm?.restSourceEndpoint || editForm?.restDestinationEndpoint ? (
                  <>
                    <div>
                      <Label>REST Source Endpoint</Label>
                      <input
                        type="text"
                        value={editForm?.restSourceEndpoint || ""}
                        onChange={(e) => setEditForm({ ...editForm!, restSourceEndpoint: e.target.value })}
                        placeholder="/SourceCustomers"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Endpoint</Label>
                      <input
                        type="text"
                        value={editForm?.restDestinationEndpoint || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm!, restDestinationEndpoint: e.target.value })
                        }
                        placeholder="/DestinationCustomers"
                        className="h-11 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Source Headers</Label>
                      <textarea
                        value={editForm?.restSourceHeaders || ""}
                        onChange={(e) => setEditForm({ ...editForm!, restSourceHeaders: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Headers</Label>
                      <textarea
                        value={editForm?.restDestinationHeaders || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm!, restDestinationHeaders: e.target.value })
                        }
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Source Request Payload</Label>
                      <textarea
                        value={editForm.restSourceRequestPayload || ""}
                        onChange={(e) => setEditForm({ ...editForm, restSourceRequestPayload: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Request Payload</Label>
                      <textarea
                        value={editForm.restDestinationRequestPayload || ""}
                        onChange={(e) => setEditForm({ ...editForm, restDestinationRequestPayload: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>
                    <div>
                      <Label>REST Source Response Payload</Label>
                      <textarea
                        value={editForm.restSourceResponsePayload || ""}
                        onChange={(e) => setEditForm({ ...editForm, restSourceResponsePayload: e.target.value })}
                        className="h-20 w-[285px] rounded-lg border px-3"
                      />
                    </div>

                    <div>
                      <Label>REST Destination Response Payload</Label>
                      <textarea
                        value={editForm.restDestinationResponsePayload || ""}
                        onChange={(e) => setEditForm({ ...editForm, restDestinationResponsePayload: e.target.value })}
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} className="max-w-sm m-4">
        <div className="p-6 bg-white rounded-3xl dark:bg-gray-900">
          <h4 className="text-lg font-semibold mb-4">Are you sure you want to delete?</h4>
          <div className="flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={closeDeleteModal}>Cancel</Button>
            <Button size="sm" variant="primary" onClick={handleDeleteConfirm}>OK</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
