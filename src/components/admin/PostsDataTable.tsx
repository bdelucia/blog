"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    Row,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import {
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconLayoutColumns,
    IconGripVertical,
    IconCirclePlusFilled,
    IconEye,
    IconEdit,
    IconTrash,
} from "@tabler/icons-react";
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type Article = {
    id: number;
    title: string;
    summary: string | null;
    image: string | null;
    tags: string[] | null;
    datePosted: string | null;
    status: "draft" | "published";
    content: string | null;
    slug: string;
    order: number | null;
    createdAt: string;
    updatedAt: string;
};

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
    const { attributes, listeners } = useSortable({
        id,
    });

    return (
        <Button
            {...attributes}
            {...listeners}
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7 hover:bg-transparent cursor-pointer"
        >
            <IconGripVertical className="text-muted-foreground size-3" />
            <span className="sr-only">Drag to reorder</span>
        </Button>
    );
}

function DraggableRow({ row }: { row: Row<Article> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    });

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    );
}

const createColumns = (
    router: AppRouterInstance,
    onDeleteClick: (article: Article) => void
): ColumnDef<Article>[] => [
    {
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <div className="font-medium max-w-[200px] truncate">
                {row.getValue("title")}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge
                    variant={status === "published" ? "default" : "secondary"}
                >
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => {
            const tags = row.getValue("tags") as string[] | null;
            if (!tags || tags.length === 0)
                return <div className="text-muted-foreground">No tags</div>;

            return (
                <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 2).map((tag, index) => (
                        <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                        >
                            {tag}
                        </Badge>
                    ))}
                    {tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                            +{tags.length - 2}
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "datePosted",
        header: "Date Posted",
        cell: ({ row }) => {
            const date = row.getValue("datePosted") as string | null;
            return (
                <div>
                    {date
                        ? new Date(date).toLocaleDateString()
                        : "Not published"}
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
            const date = row.getValue("createdAt") as string;
            return <div>{new Date(date).toLocaleDateString()}</div>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const article = row.original;
            return (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer"
                        onClick={() =>
                            window.open(`/${article.slug}`, "_blank")
                        }
                        title="View post"
                    >
                        <IconEye className="h-4 w-4" />
                        <span className="sr-only">View post</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer"
                        onClick={() =>
                            router.push(
                                `/admin/posts/edit-post/${article.slug}`
                            )
                        }
                        title="Edit post"
                    >
                        <IconEdit className="h-4 w-4" />
                        <span className="sr-only">Edit post</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        title="Delete post"
                        onClick={() => onDeleteClick(article)}
                    >
                        <IconTrash className="h-4 w-4" />
                        <span className="sr-only">Delete post</span>
                    </Button>
                </div>
            );
        },
    },
];

interface PostsDataTableProps {
    data: Article[];
}

export function PostsDataTable({ data: initialData }: PostsDataTableProps) {
    const router = useRouter();
    const [data, setData] = React.useState(() => initialData);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [postToDelete, setPostToDelete] = React.useState<Article | null>(
        null
    );
    const [isDeleting, setIsDeleting] = React.useState(false);

    // Update data when initialData prop changes
    React.useEffect(() => {
        setData(initialData);
    }, [initialData]);

    // Handle delete post
    const handleDeletePost = async () => {
        if (!postToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch("/api/admin/delete-post", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    postId: postToDelete.id,
                    imagePath: postToDelete.image,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete post");
            }

            // Remove the post from local state
            setData((prevData) =>
                prevData.filter((post) => post.id !== postToDelete.id)
            );

            // Close dialog and reset state
            setDeleteDialogOpen(false);
            setPostToDelete(null);
        } catch (error) {
            console.error("Error deleting post:", error);
            // You could add a toast notification here
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle delete button click
    const handleDeleteClick = (article: Article) => {
        setPostToDelete(article);
        setDeleteDialogOpen(true);
    };

    const sortableId = React.useId();
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    );

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => data?.map(({ id }) => id) || [],
        [data]
    );

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = dataIds.indexOf(active.id);
            const newIndex = dataIds.indexOf(over.id);

            // Update local state immediately for responsive UI
            const newData = arrayMove(data, oldIndex, newIndex);
            setData(newData);

            // Save the new order to the database
            try {
                const response = await fetch("/api/admin/reorder-posts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        items: newData.map((item, index) => ({
                            id: item.id,
                            order: index,
                        })),
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to save order");
                }
            } catch (error) {
                console.error("Failed to update post order:", error);
                // Revert the local state on error
                setData(data);
            }
        }
    }

    const columns = createColumns(router, handleDeleteClick);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Posts</CardTitle>
                <div className="flex flex-col [@media(min-width:1050px)]:flex-row [@media(min-width:1050px)]:items-center [@media(min-width:1050px)]:justify-between mt-4 gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                        <Input
                            placeholder="Filter posts..."
                            value={
                                (table
                                    .getColumn("title")
                                    ?.getFilterValue() as string) ?? ""
                            }
                            onChange={(event) =>
                                table
                                    .getColumn("title")
                                    ?.setFilterValue(event.target.value)
                            }
                            className="w-full sm:w-auto sm:max-w-sm [@media(min-width:1050px)]:max-w-sm"
                        />
                        <Select
                            value={
                                (table
                                    .getColumn("status")
                                    ?.getFilterValue() as string) ?? ""
                            }
                            onValueChange={(value) =>
                                table
                                    .getColumn("status")
                                    ?.setFilterValue(
                                        value === "all" ? "" : value
                                    )
                            }
                        >
                            <SelectTrigger className="w-full sm:w-[140px] [@media(min-width:1050px)]:w-[180px]">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All statuses
                                </SelectItem>
                                <SelectItem value="published">
                                    Published
                                </SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="cursor-pointer w-full sm:w-auto"
                                >
                                    <IconLayoutColumns className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        View
                                    </span>
                                    <IconChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(
                                                        !!value
                                                    )
                                                }
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Button
                        onClick={() => router.push("/admin/posts/create-post")}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground cursor-pointer w-full sm:w-auto"
                    >
                        <IconCirclePlusFilled className="w-4 h-4 mr-2" />
                        Create Post
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                        id={sortableId}
                    >
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    colSpan={header.colSpan}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column
                                                                  .columnDef
                                                                  .header,
                                                              header.getContext()
                                                          )}
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    <SortableContext
                                        items={dataIds}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {table.getRowModel().rows.map((row) => (
                                            <DraggableRow
                                                key={row.id}
                                                row={row}
                                            />
                                        ))}
                                    </SortableContext>
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No posts found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DndContext>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s)
                        selected.
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <IconChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <IconChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Post</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "
                            {postToDelete?.title}"? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeletePost}
                            disabled={isDeleting}
                            className="cursor-pointer"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
