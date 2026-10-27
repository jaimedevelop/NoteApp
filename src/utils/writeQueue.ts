/** Keep dependent writes ordered while independent ledgers save concurrently. */
export class WriteQueue {
    private tails = new Map<string, Promise<void>>()

    enqueue(key: string, write: () => Promise<unknown>): Promise<void> {
        const operation = (this.tails.get(key) ?? Promise.resolve()).then(async () => { await write() })
        const settled = operation.catch(() => {})
        this.tails.set(key, settled)
        void settled.then(() => {
            if (this.tails.get(key) === settled) this.tails.delete(key)
        })
        return operation
    }
}
