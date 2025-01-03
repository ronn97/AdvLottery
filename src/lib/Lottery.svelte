<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import "@/assets/js/tagcanvas.js";
    import confetti from "canvas-confetti";
    // import { member } from "js/member.js";
    import {
        prizeListStore,
        selectedPersonStore,
        prizeStoreMethods,
        progressStoreMethods,
        progressNumberStore,
    } from "@/store/prize";

    /*是否正在抽奖*/
    let running = 0;
    let fullState = "全屏";
    /*抽奖步骤*/
    let status = ["抽奖", "停!", "继续"];
    // let prizeList = prizeStore.prizeList;
    let prizeList: any[] = [],
        selectedPerson: string[] = [];
    let progress = 0; /*正在抽第几个奖*/
    let showResult: boolean = false; /*是否展示抽奖信息*/

    // 定义用户数据的类型
    interface UserItem {
        name: string;
        index: number;
    }

    let userData: UserItem[] = [];

    let tagCanvasInstance;
    let speed = function () {
        return [0.2, 0.08];
    };

    /*创建名单列表*/
    const createHTML = (self: any) => {
        /*创建词云列表*/
        var html = ["<ul>"];
        /*遍历存储好的人员名单*/
        userData.forEach(function (item: any, index: number) {
            item["index"] = index;
            /*如何已经被抽奖抽中了，显示黄色的名字*/
            if (!selectedPerson.includes(item.name)) {
                html.push('<li><a href="#">' + item.name + "</a></li>");
            }
        });
        html.push("</ul>");
        return html.join("");
    };
    /*创建并重绘画布*/
    const createCanvas = () => {
        /*创建画布*/
        let canvas = document.createElement("canvas");
        /*设置好ID*/
        canvas.id = "myCanvas";
        /*设置画布的大小*/
        canvas.width = document.body.offsetWidth;
        /*设置画布的高度*/
        canvas.height = document.body.offsetHeight;
        /*将画布添加到网页渲染*/
        const mainElement = document.getElementById("main");
        if (mainElement) {
            mainElement.appendChild(canvas);
            /*设置画布的内部html*/
            canvas.innerHTML = createHTML(self);

            if ((window as any).TagCanvas) {
                tagCanvasInstance = (window as any).TagCanvas.Start(
                    "myCanvas",
                    "",
                    {
                        textColour: "#FFD700",
                        initial: speed(),
                        textHeight: 42,
                        zoom: 1.05,
                        dragControl: true,
                    },
                );
            }
        } else {
            console.error("Element with ID 'main' not found.");
        }
    };

    // 重新创建画布
    const reCreateCanvas = () => {
        /*移除词云*/
        const canvasElement = document.getElementById("myCanvas");
        if (canvasElement) {
            const parentElement = canvasElement.parentElement;
            if (parentElement) {
                parentElement.removeChild(canvasElement);
            }
        }

        createCanvas();
    };

    const calculateWidth = (person: number) => {
        if (!person || person === 0) {
            return "25%";
        }
        return `${person * 15}%`;
    };

    const lottery = (count: number): any[] => {
        const resUserData = userData
            /*过滤成员，如果没有在已被抽中的名单内，则返回该元素组成新数组*/
            .filter((item: any) => {
                return !selectedPerson.includes(item.name);
            })
            .map((m) => {
                /*作为新元素*/
                return {
                    ...m,
                    score: Math.random(),
                };
            })
            /*排序*/
            .sort(function (a, b) {
                return a.score - b.score;
            })
            /*截取数组*/
            .slice(0, count);
        return resUserData;
    };

    const handleOfToggle = () => {
        if (progress >= prizeList.length) {
            /*所有奖品抽完了，当前奖品等级0*/
            running = 0;
            alert("所有奖品都抽完了！");
            return;
        }

        /*是否展示了抽奖结果*/
        if (showResult) {
            showResult = !showResult;
            /*进入待抽奖的状态*/
            running = 0;
            return;
        }

        /*如果正在抽奖*/
        if (running == 1) {
            /*将词云的速度转换为正常速度*/
            (window as any).TagCanvas.SetSpeed("myCanvas", speed());
            //获取当前奖品数量
            const positionNum = prizeList[progress].number;
            /*随机生成抽奖名单*/
            let ret = lottery(positionNum);
            // let ret = userData;

            /*如果所有人都被抽中了，提示无可抽奖人员*/
            if (ret?.length == 0) {
                alert("所有人都中奖了！");
                running = 0;
                return;
            } else {
                /*中奖信息*/
                prizeList[progress].person = ret.map((item: any) => {
                    return item.name;
                });

                confettiFire();
                /*重新加载人员名单*/
                /*重新创建词云*/
                reCreateCanvas();

                /*奖品名单记录到本地*/
                prizeStoreMethods.setPrizeList(prizeList);

                progress++; //下一个待抽奖品
                progressStoreMethods.setProgress(progress);
            }

            running = 2;
            /*进入中奖结果公式状态*/
        } else if (running == 2) {
            // 中奖结果公式状态

            /*进入待抽奖的状态*/
            running = 0;

            // progress++; //下一个待抽奖品
            // progressStoreMethods.setProgress(progress);
        } else {
            /*加快词云的旋转速度*/
            (window as any).TagCanvas.SetSpeed("myCanvas", [5, 1]);
            /*进入抽奖的状态*/
            running = 1;
        }
    };

    const handleOfFullScreen = () => {
        /*如果不是待抽奖状态*/
        if (running != 0) {
            return;
        }

        /*是否处于全屏*/
        if (!document.fullscreenElement) {
            fullState = "小屏";
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                fullState = "全屏";
                document.exitFullscreen();
            }
        }
    };

    const handleOfShowList = () => {
        /*如果正在抽奖*/
        if (running == 1) {
            return;
        }

        /*进入待抽奖的状态*/
        running = 0;

        /*改变显示的状态*/
        showResult = !showResult;
    };

    const handleOfReset = () => {
        /*如果正在抽奖*/
        if (running == 1) {
            return;
        }
        // /*如果不是待抽奖状态*/
        // if (running != 0) {
        //     return;
        // }

        const isConfirm = confirm("确定要重置么？所有之前的抽奖历史将被清除！");
        if (isConfirm) {
            running = 0;

            prizeStoreMethods.initPrizeList();
            progressStoreMethods.initProgress();

            reCreateCanvas();
        }
    };

    // 庆祝动画
    const confettiFire = () => {
        const duration = 3 * 1000;
        const end = Date.now() + duration;
        (function frame() {
            // launch a few confetti from the left edge
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
            });
            // and launch a few from the right edge
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
            });

            // keep going until we are out of time
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();
        centerFire(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        centerFire(0.2, {
            spread: 60,
        });
        centerFire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
        });
        centerFire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
        });
        centerFire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    };
    const centerFire = (particleRatio: number, opts: any) => {
        const count = 200;
        confetti({
            origin: { y: 0.7 },
            ...opts,
            particleCount: Math.floor(count * particleRatio),
        });
    };

    const getData = async () => {
        try {
            const response = await fetch("member.json");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            data?.member?.forEach((item: any, index: number) => {
                userData.push({ name: item, index: index });
            });
        } catch (error) {
            console.error(
                "There has been a problem with your fetch operation:",
                error,
            );
        }
    };

    const buildCanvas = async () => {
        createCanvas();
        /*监控窗口大小变化，及时重绘canvas*/
        window.onresize = function () {
            /*重新创建词云*/
            reCreateCanvas();
        };
    };

    onMount(async () => {
        prizeListStore.subscribe((value: any) => {
            prizeList = value;
            console.log("Updated prizeList:", prizeList); // 调试信息
        });
        selectedPersonStore.subscribe((value: any) => {
            selectedPerson = value;
            console.log("Updated selectedPerson:", selectedPerson);
        });
        progressNumberStore.subscribe((value: number) => {
            progress = value;
            console.log("Updated progress:", progress);
        });

        await getData();
        await buildCanvas();
    });

    onDestroy(() => {
        // stopTagCanvas();
    });
</script>

<header>
    {#if running == 1}
        <div class="boxWrap">{"正在抽取-" + prizeList[progress].label}</div>
    {:else}
        <div class="boxWrap">上海灵擎网络-抽奖系统</div>
    {/if}
</header>
<div class="bodyBox">
    <div class="wall" class:mask={running === 2} id="main"></div>

    <!--显示右下角的工具按钮-->
    <div class="tools">
        <button
            on:click={handleOfToggle}
            class="pure-button"
            class:button-error={running !== 1}
            class:button-secondary={running === 1}
            disabled={progress >= prizeList.length}
        >
            {showResult ? "继续" : status[running]}
        </button>
        <button
            class="pure-button button-success"
            disabled={running == 1}
            on:click={handleOfFullScreen}>{fullState}</button
        >
        <!--显示抽奖结果-->
        <button
            class="pure-button button-secondary"
            disabled={running == 1}
            on:click={handleOfShowList}
            >结果
        </button>
        <button
            class="pure-button button-warning"
            disabled={running == 1}
            on:click={handleOfReset}
            >重置
        </button>
    </div>

    <!--展示页面-->
    {#if running == 2}
        <div id="result" class="result">
            {#if !showResult}
                <div class="display">
                    <!--输出抽奖结果-->
                    <img
                        src={prizeList[progress - 1].url}
                        alt={prizeList[progress - 1].label +
                            " " +
                            prizeList[progress - 1].name}
                    />
                    <div class="down">
                        <div class="item1">
                            {prizeList[progress - 1].label +
                                " " +
                                prizeList[progress - 1].name}
                        </div>
                        <div class="item2">
                            {prizeList[progress - 1].person}
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
    <!--结果页面-->
    {#if showResult}
        <div class="result2">
            <div class="list">
                <!--循环输出结果-->
                <ul>
                    {#each prizeList as item, index}
                        <li
                            style="width: {calculateWidth(item.person?.length)}"
                        >
                            <div class="title">{item.name}</div>
                            <img src={item.url} alt={item.name} />
                            <div class="footer">
                                {item.person?.length ? item.person : item.label}
                            </div>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
    {/if}
</div>

<style scoped lang="scss">
    header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50px;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        color: #fff;
        .boxWrap {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    /*画布滤镜用于模糊显示*/
    .mask {
        -webkit-filter: blur(5px);
        filter: blur(5px);
    }

    /*过渡效果*/
    #main {
        -webkit-transition: all 1s;
        transition: all 1s;
    }

    .wall {
        width: 100%;
        min-width: 1200px;
        height: 100%;
        box-sizing: border-box;
        margin: 0;
        background-image: url("@/assets/img/wall.jpg");
        overflow: hidden;
        background-color: #121936;
        background-size: 100% 100%;
        background-position: center center;
        background-repeat: no-repeat;
    }

    .tools {
        position: absolute;
        bottom: 20px;
        right: 20px;
        text-align: center;

        .pure-button {
            text-align: center;
            cursor: pointer;
            color: white;
            background-color: #e6e6e6;
            border-radius: 4px;
            position: relative;
            z-index: 9999;
            display: block;
            margin: 5px;
            font-size: 16px;
            line-height: 40px;
            padding: 0 1em;
            min-width: 50px;
            text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);

            &.button-success,
            &.button-error,
            &.button-warning,
            &.button-secondary {
                width: 64px;
            }

            &.button-success {
                background: rgb(28, 184, 65);
            }

            &.button-error {
                background: rgb(202, 60, 60);
            }

            &.button-warning {
                background: rgb(223, 117, 20);
            }

            &.button-secondary {
                background: rgb(66, 184, 221);
            }

            &:disabled {
                background: #ccc;
                opacity: 0.85;
                cursor: no-drop;
            }
        }
    }

    /*显示抽奖结果的样式*/
    .result {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(92, 92, 92, 0.25);
        display: flex;
        justify-content: center;
        align-items: center;

        background-image: url("@/assets/img/alert.png");
        background-size: 50%;
        background-repeat: no-repeat;
        background-position: center;

        .display {
            width: 50%;
            height: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            img {
                width: 25%;
                margin-top: 22%;
            }

            .down {
                margin-top: 3%;
                margin-right: 0.5%;

                .item1 {
                    text-align: center;
                    font-size: 25px;
                    font-weight: bold;
                }

                .item2 {
                    font-size: 25px;
                    margin-top: 20px;
                    font-weight: bold;
                    color: #fff100;
                    background-color: red;
                    padding: 10px 18px;
                    border-radius: 10px;
                    text-align: center;
                }
            }
        }
    }

    /*显示抽奖结果的样式*/
    .result2 {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-image: url("@/assets/img/alert2.png");
        background-size: 100% 100%;
        background-repeat: no-repeat;
        display: flex;
        justify-content: center;
        align-items: center;

        .list {
            width: 85vw;
            height: 70vh;
            margin-top: 20vh;
            display: flex;
            align-items: center;
            justify-content: center;

            ul {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                align-content: center;
                justify-content: center;
                width: 100%;
                padding: 0;
                margin: 0;

                li {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-wrap: wrap;
                    margin: 20px 10px;
                    background-image: url("@/assets/img/bg.png");
                    background-size: 100% 100%;
                    text-align: center;

                    img {
                        //width: 50%;
                        height: 140px;
                        margin: 10px 25%;
                    }

                    .title {
                        width: 100%;
                        margin-top: 15px;
                        color: #a90808;
                        font-size: 28px;
                    }

                    .footer {
                        width: 80%;
                        background-image: url("@/assets/img/bg2.png");
                        margin-bottom: 0;
                        background-size: 100% 100%;
                        color: #ffffff;
                        font-size: 25px;
                        padding: 3px;
                    }
                }
            }
        }
    }
</style>
