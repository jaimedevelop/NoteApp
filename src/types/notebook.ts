export interface NotebookList {
    id: string;
    name: string;
    order: number;
}

export interface NotebookEntry {
    id: string;
    listId: string;
    text: string;
    done: boolean;
    order: number;
    dueDate?: string; // YYYY-MM-DD, optional
    createdAt: number; // epoch ms
}

export type CreateListPayload = Omit<NotebookList, 'id'>;
export type CreateEntryPayload = Omit<NotebookEntry, 'id'>;
export type UpdateEntryPayload = Partial<Omit<NotebookEntry, 'id' | 'listId' | 'createdAt'>>;