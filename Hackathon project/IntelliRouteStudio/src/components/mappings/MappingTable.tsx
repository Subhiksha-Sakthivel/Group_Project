import { SetStateAction, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { editMapping, deleteMapping, getMappingById, getTable } from "../../service/mappingsService";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
// import Input from "../form/input/InputField";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { MappingTable } from "../../model/MappingTable";
import { Mapping } from "../../model/Mapping";

export default function MappingsTable() {
  const [mappings, setMappings] = useState<MappingTable[]>([]);
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [selectedMapping, setSelectedMapping] = useState<MappingTable | null>(null);
  const [editForm, setEditForm] = useState<Mapping | null>(null);

  const handleSave = async() => {
    if (!editForm) return;
    // Handle save logic here
    if (selectedMapping) {
    try {
      await editMapping(selectedMapping.id, editForm);
    } catch (error) {
      console.error("Failed to edit Mapping:", error);
    }
    closeEditModal();
  }
  };

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
        <ComponentCard title="MappingTable Table">
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
      <Modal isOpen={isEditOpen} onClose={closeEditModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="flex items-center justify-between px-2 pr-14 mb-6">
            <h4 className="inline-block mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Mapping
            </h4>
            {/* <div className="flex items-center gap-3 px-2 mt-2 lg:justify-end"> */}
                <Button size="sm" onClick={handleSave}>Regenerate with AI</Button>
            {/* </div> */}
            {/* <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7"> */}
            {/* Update your details to keep your profile up-to-date. */}
            {/* </p> */}
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>SOAP Endpoint</Label>
                  {/* <Input type="text" value="/GetCustomerList" /> */}
                  {/* <input
                    type="text"
                    placeholder="/GetCustomerList"
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                  /> */}
                  <input
                    type="text"
                    value={editForm?.soapEndpoint || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm!, soapEndpoint: e.target.value })
                    }
                    placeholder="/GetCustomerList"
                    className="h-11 w-[285px] rounded-lg border border-gray-200 bg-transparent py-2.5 pl-3 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>

                <div>
                  <Label>REST Endpoints</Label>
                  {/* <Input type="text" value="/Customers" /> */}
                  {/* <input
                    type="text"
                    placeholder="/Customers"
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                  /> */}
                  <input
                    type="text"
                    value={editForm?.restEndpoint || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm!, restEndpoint: e.target.value })
                    }
                    placeholder="/Customers"
                    className="h-11 w-[285px] rounded-lg border border-gray-200 bg-transparent py-2.5 pl-3 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />

                </div>

                <div>
                  <Label>SOAP Headers</Label>
                  {/* <Input type="text" value="" /> */}
                  <input
                    type="text"
                    value={editForm?.soapHeaders || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm!, soapHeaders: e.target.value })
                    }
                    // placeholder="/Customers"
                    className="h-11 w-[285px] rounded-lg border border-gray-200 bg-transparent py-2.5 pl-3 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>

                <div>
                  <Label>REST Headers</Label>
                  {/* <Input type="text" value="" /> */}
                  <input
                    type="text"
                    value={editForm?.restHeaders || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm!, restHeaders: e.target.value })
                    }
                    // placeholder="/Customers"
                    className="h-11 w-[285px] rounded-lg border border-gray-200 bg-transparent py-2.5 pl-3 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div>
                  <Label>SOAP Request Payload</Label>
                  {/* <Input type="text" value="" /> */}
                  <input
                    type="text"
                    value={editForm?.soapRequestPayload || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm!, soapRequestPayload: e.target.value })
                    }
                    // placeholder="/Customers"
                    className="h-11 w-[285px] rounded-lg border border-gray-200 bg-transparent py-2.5 pl-3 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div>
                  <Label>REST Request Payload</Label>
                  {/* <Input type="text" value="" /> */}
                  <input
                    type="text"
                    value={editForm?.restRequestPayload || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm!, restRequestPayload: e.target.value })
                    }
                    // placeholder="/Customers"
                    className="h-11 w-[285px] rounded-lg border border-gray-200 bg-transparent py-2.5 pl-3 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div>
                  <Label>SOAP Response Payload</Label>
                  {/* <Input type="text" value="" /> */}
                  <input
                    type="text"
                    value={editForm?.soapResponsePayload || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm!, soapResponsePayload: e.target.value })
                    }
                    // placeholder="/Customers"
                    className="h-11 w-[285px] rounded-lg border border-gray-200 bg-transparent py-2.5 pl-3 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div>
                  <Label>REST Response Payload</Label>
                  {/* <Input type="text" value="" /> */}
                  <input
                    type="text"
                    value={editForm?.restResponsePayload || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm!, restResponsePayload: e.target.value })
                    }
                    // placeholder="/Customers"
                    className="h-11 w-[285px] rounded-lg border border-gray-200 bg-transparent py-2.5 pl-3 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeEditModal}>Close</Button>
              <Button size="sm" onClick={handleSave}>Save Mapping</Button>
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
