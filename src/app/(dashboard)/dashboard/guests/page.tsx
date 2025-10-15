"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  uploadDocument,
  deleteGuestDocument,
  fetchGuestDocuments,
  updateSearchCache,
  setLastSearchTerm,
} from "@/store/slices/guestSlice";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Filter } from "lucide-react";
import { useNotification } from "@/hooks/useNotification";
import type { AxiosError } from "axios";
import { handleApiError } from "@/lib/api/error-handler";
import type { Guest, CreateGuestData, UpdateGuestData } from "@/types";
import { FileType } from "@/types";

// Import extracted components
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { GuestStatsCards } from "@/components/features/guests/GuestStatsCards";
import { GuestTableRow } from "@/components/features/guests/GuestTableRow";
import { GuestForm } from "@/components/features/guests/GuestForm";
import { GuestDetailsDialog } from "@/components/features/guests/GuestDetailsDialog";

export default function GuestsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    guests,
    loading,
    pagination,
    searchCache,
    lastSearchTerm,
    isSearching,
  } = useSelector((state: RootState) => state.guest);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loyaltyFilter, setLoyaltyFilter] = useState("all");
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Separate state for stats that don't change during search
  const [statsData, setStatsData] = useState({
    totalGuests: 0,
    vipGuests: 0,
    newThisMonth: 0,
    activeGuests: 0,
  });

  const { success, error } = useNotification();

  // Function to fetch and update stats
  const fetchStatsData = async () => {
    try {
      const response = await dispatch(
        fetchGuests({
          page: 1,
          limit: 1000, // Get all guests for stats calculation
          search: undefined,
          loyaltyTier: undefined,
        })
      ).unwrap();

      const responseData = response as unknown as {
        data?: { guests?: Guest[] };
      };
      const allGuests = Array.isArray(responseData?.data?.guests)
        ? responseData.data.guests
        : [];
      const now = new Date();

      setStatsData({
        totalGuests: allGuests.length,
        vipGuests: allGuests.filter((g: Guest) => g.loyaltyTier === "PLATINUM")
          .length,
        newThisMonth: allGuests.filter((g: Guest) => {
          const created = new Date(g.createdAt);
          return (
            created.getMonth() === now.getMonth() &&
            created.getFullYear() === now.getFullYear()
          );
        }).length,
        activeGuests: allGuests.filter((g: Guest) => g.isActive).length,
      });
    } catch (e) {
      console.error("Failed to fetch stats data:", e);
    }
  };

  // Fetch overall stats data on mount
  useEffect(() => {
    fetchStatsData();
  }, [dispatch]);

  // Optimistic search - show cached results immediately
  useEffect(() => {
    if (searchTerm.trim() && searchCache[searchTerm]) {
      dispatch(
        updateSearchCache({
          term: searchTerm,
          results: searchCache[searchTerm],
        })
      );
      dispatch(setLastSearchTerm(searchTerm));
    }
  }, [searchTerm, searchCache, dispatch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch with pagination
  useEffect(() => {
    dispatch(
      fetchGuests({
        page,
        limit,
        search: debouncedSearch || undefined,
        loyaltyTier: loyaltyFilter === "all" ? undefined : loyaltyFilter,
      })
    );
  }, [dispatch, debouncedSearch, loyaltyFilter, page, limit]);

  const handleCreateGuest = async (
    data: CreateGuestData & { documents?: { front?: File; back?: File } }
  ) => {
    try {
      // Extract documents from form data
      const { documents, ...guestData } = data;

      // Create guest first
      const createResult = await dispatch(createGuest(guestData)).unwrap();
      const guestId = createResult.data?.id;

      if (!guestId) {
        throw new Error("Failed to create guest");
      }

      // Upload documents if provided
      if (documents && documents.front && documents.back) {
        try {
          // Upload front ID card
          await dispatch(
            uploadDocument({
              id: guestId,
              data: {
                file: documents.front,
                fileType: FileType.ID_CARD,
                description: "ID Card Front",
              },
            })
          ).unwrap();

          // Upload back ID card
          await dispatch(
            uploadDocument({
              id: guestId,
              data: {
                file: documents.back,
                fileType: FileType.ID_CARD,
                description: "ID Card Back",
              },
            })
          ).unwrap();

          success("Guest created with documents uploaded successfully");
        } catch (uploadError) {
          // If document upload fails, show error but guest was created
          const uploadApiErr = handleApiError(uploadError as AxiosError);
          error(
            `Guest created but document upload failed: ${uploadApiErr.message}`
          );
        }
      } else {
        success("Guest created");
      }

      setOpenCreate(false);

      // Refresh stats immediately
      fetchStatsData();

      // refetch with current search term
      dispatch(
        fetchGuests({
          page: 1,
          limit: 10,
          search: debouncedSearch || undefined,
          loyaltyTier: loyaltyFilter === "all" ? undefined : loyaltyFilter,
        })
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const handleEditGuest = async (data: UpdateGuestData) => {
    if (!selectedGuest) return;
    try {
      await dispatch(updateGuest({ id: selectedGuest.id, data })).unwrap();
      success("Guest updated");
      setOpenEdit(false);
      setSelectedGuest(null);

      // Refresh stats immediately (in case loyalty tier or active status changed)
      fetchStatsData();

      // refetch with current search term
      dispatch(
        fetchGuests({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          loyaltyTier: loyaltyFilter === "all" ? undefined : loyaltyFilter,
        })
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const handleDeleteGuest = async () => {
    if (!selectedGuest) return;
    try {
      // First, get guest documents to delete them
      try {
        const documentsResponse = await dispatch(
          fetchGuestDocuments(selectedGuest.id)
        ).unwrap();
        // Delete all documents
        if (Array.isArray(documentsResponse)) {
          for (const doc of documentsResponse) {
            await dispatch(deleteGuestDocument(doc.id)).unwrap();
          }
        }
      } catch (docError) {
        // Log error but continue with guest deletion
        console.error("Failed to delete some documents:", docError);
      }

      // Then delete the guest
      await dispatch(deleteGuest(selectedGuest.id)).unwrap();
      success("Guest and associated documents deleted");
      setOpenDelete(false);
      setSelectedGuest(null);

      // Refresh stats immediately
      fetchStatsData();

      // refetch with current search term
      dispatch(
        fetchGuests({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          loyaltyTier: loyaltyFilter === "all" ? undefined : loyaltyFilter,
        })
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const columns = [
    { key: "guest", label: "Guest", width: "w-[200px]" },
    { key: "contact", label: "Contact", width: "w-[180px]" },
    { key: "location", label: "Location", width: "w-[150px]" },
    { key: "loyaltyTier", label: "Loyalty Tier", width: "w-[120px]" },
    { key: "createdAt", label: "Member Since", width: "w-[120px]" },
    { key: "isActive", label: "Status", width: "w-[100px]" },
    { key: "actions", label: "Actions", width: "w-[120px]", sortable: false },
  ];

  const renderGuestRow = (guest: Guest) => (
    <GuestTableRow
      key={guest.id}
      guest={guest}
      onView={(g) => {
        setSelectedGuest(g);
        setOpenView(true);
      }}
      onEdit={(g) => {
        setSelectedGuest(g);
        setOpenEdit(true);
      }}
      onDelete={(g) => {
        setSelectedGuest(g);
        setOpenDelete(true);
      }}
    />
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Guests"
        description="Manage guest profiles and information"
      >
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              New Guest
            </Button>
          </DialogTrigger>
          <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Guest</DialogTitle>
            </DialogHeader>
            <GuestForm
              onSubmit={handleCreateGuest}
              onCancel={() => setOpenCreate(false)}
              loading={loading}
              isCreating={true}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats Cards */}
      <GuestStatsCards stats={statsData} />

      {/* Data Table with integrated search and filters */}
      <DataTable
        title="Guests"
        description="Manage and view all guest profiles"
        columns={columns}
        data={guests || []}
        loading={loading}
        emptyMessage="No guests found"
        searchBar={
          <SearchBar
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={setSearchTerm}
            loading={isSearching}
          />
        }
        filters={
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={loyaltyFilter} onValueChange={setLoyaltyFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Loyalty Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="BRONZE">Bronze</SelectItem>
                <SelectItem value="SILVER">Silver</SelectItem>
                <SelectItem value="GOLD">Gold</SelectItem>
                <SelectItem value="PLATINUM">Platinum</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        }
        renderRow={renderGuestRow}
        pagination={{
          page,
          limit,
          total: pagination?.total,
          totalPages: pagination?.totalPages,
          onPageChange: (p) => setPage(Math.max(1, p)),
          onLimitChange: (l) => {
            setLimit(l);
            setPage(1);
          },
        }}
      />

      {/* View Guest Dialog */}
      <GuestDetailsDialog
        guest={selectedGuest}
        open={openView}
        onOpenChange={(open) => {
          setOpenView(open);
          if (!open) setSelectedGuest(null);
        }}
      />

      {/* Edit Guest Dialog */}
      <Dialog
        open={openEdit}
        onOpenChange={(open) => {
          setOpenEdit(open);
          if (!open) setSelectedGuest(null);
        }}
      >
        <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
          </DialogHeader>
          {selectedGuest && (
            <GuestForm
              guest={selectedGuest}
              onSubmit={handleEditGuest}
              onCancel={() => setOpenEdit(false)}
              loading={loading}
              isCreating={false}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openDelete}
        onOpenChange={(open) => {
          setOpenDelete(open);
          if (!open) setSelectedGuest(null);
        }}
        title="Delete Guest"
        description={`Are you sure you want to delete ${selectedGuest
          ? `${selectedGuest.firstName} ${selectedGuest.lastName}`
          : "this guest"
          }? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteGuest}
        loading={loading}
      />
    </div>
  );
}
