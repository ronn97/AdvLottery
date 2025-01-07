import { writable, derived } from 'svelte/store';

interface PrizeState {
    name: string;
    label: string;
    url: string;
    person: string[];
    number: number;
}

const initialState: PrizeState[] = [
    {
        name: "TBox 茶合",
        label: "四等奖",
        url: "img/prize/a11.png",
        person: [],
        number: 5,
    },
    {
        name: "美的电饭煲",
        label: "三等奖",
        url: "img/prize/a10.png",
        person: [],
        number: 3,
    },
     {
        name: "拍立得",
        label: "二等奖",
        url: "img/prize/a4.png",
        person: [],
        number: 2,
    },
    {
        name: "iPhone 16",
        label: "一等奖",
        url: "img/prize/a1.png",
        person: [],
        number: 1,
    }
];

const prizeKey = 'prizeStore';
const progressKey = 'progressStore';
const initProgress = 0;

function loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
    }
}

function saveToStorage<T>(key: string, value: T) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

const prizeStore = writable<PrizeState[]>(loadFromStorage(prizeKey, JSON.parse(JSON.stringify(initialState))));
prizeStore.subscribe((value) => {
    saveToStorage(prizeKey, value);
});

export const prizeListStore = derived(prizeStore, ($prizeStore) => $prizeStore);
export const selectedPersonStore = derived(prizeStore, ($prizeStore) => {
    return $prizeStore.reduce((prev, curr) => [...prev, ...curr.person], []);
});

const progressStore = writable<number>(loadFromStorage(progressKey, initProgress));
progressStore.subscribe((value) => {
    saveToStorage(progressKey, value);
});

export const progressNumberStore = derived(progressStore, ($progressStore) => $progressStore);

// Export store methods and prizeStore itself
export const prizeStoreMethods = {
    subscribe: prizeStore.subscribe,
    setPrizeList: (list: PrizeState[]) => prizeStore.set(list),
    initPrizeList: () => prizeStore.set(JSON.parse(JSON.stringify(initialState))),
};

export const progressStoreMethods = {
    subscribe: progressStore.subscribe,
    setProgress: (progress: number) => progressStore.set(progress),
    initProgress: () => progressStore.set(initProgress),
};

// Directly export prizeStore if needed
export { prizeStore };
