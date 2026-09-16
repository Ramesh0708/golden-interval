declare module 'page-flip' {
  export class PageFlip {
    constructor(el: HTMLElement, options: Record<string, unknown>)
    loadFromImages(images: string[]): void
    destroy(): void
    flipNext(): void
    flipPrev(): void
    getPageCount(): number
    getCurrentPageIndex(): number
    on(event: string, cb: (e: { data: number }) => void): void
  }
}
