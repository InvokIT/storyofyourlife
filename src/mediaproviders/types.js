//@flow

export type Album = {
    name: string
}

export type MediaItem = {
    name: string,
    mimeType: string,
    data: ArrayBuffer
}

export interface MediaProvider {
    getAlbums(): Promise<[Album]>,
    getMedia(album: ?Album, pageSize: ?number): Generator<Promise<[MediaItem]>, void, void>
}
