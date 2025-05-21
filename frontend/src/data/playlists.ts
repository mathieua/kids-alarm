import type { Playlist } from "../types/audio";

export const playlists: Playlist[] = [
    {
        id: "1",
        name: "Noah's fav",
        songs: [
            {
                id: "1",
                title: "A Sky Full of Stars",
                artist: "Coldplay",
                album: "Ghost Stories",
                filePath: "media/A Sky Full of Stars.mp3",
                thumbnail: "media/A Sky Full of Stars.jpeg",
            },
            {
                id: "2",
                title: "Sweet Dreams (are made of this)",
                artist: "Eurythmics",
                album: "Sweet Dreams (Are Made of This)",
                filePath: "media/Sweet Dreams (are made of this).mp3",
                thumbnail: "media/Sweet Dreams (are made of this).webp",
            },
            {
                id: "3",
                title: "Waka Waka (This Time for Africa)",
                artist: "Shakira",
                album: "Sale el Sol",
                filePath: "media/Waka Waka (This Time for Africa).mp3",
                thumbnail: "media/Waka waka.jpeg",
            },
            {
                id: "4",
                title: "Last Christmas",
                artist: "Wham!",
                album: "Last Christmas",
                filePath: "media/Last Christmas.mp3",
                thumbnail: "media/Last Christmas.jpg",
            },
        ],
    }
        
];
