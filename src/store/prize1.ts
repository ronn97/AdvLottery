import {defineStore} from 'pinia';

interface PrizeState {
    name: string,
    label: string,
    url: string,
    person: string[],
    number: number,
}

export const usePrizeStore = defineStore('prize', {
    state: () => ({
        _prizeList: [
            {
                name: "TBox 茶合", //奖品名称
                label: "三等奖",//奖品别称
                url: "img/prize/a11.png", //奖品
                person: [],//中奖人列表
                number: 3, //奖品数量
            },
            {
                name: "美的电饭煲", //奖品名称
                label: "二等奖",//奖品别称
                url: "img/prize/a10.png", //奖品
                person: [],//中奖人列表
                number: 2, //奖品数量
            }
        ]
    }),
    getters: {
        prizeList: (state) => state._prizeList,
        selectedPerson: (state) => {
            return state._prizeList.reduce((prev, curr) => {
                return [...prev, ...curr.person];
            }, []);
        }
    },
    actions: {
        setPrizeList(list: PrizeState[]) {
            this._prizeList = list;
        }
    },
    persist: true,
})