<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import "@/assets/js/tagcanvas.js";
    import { member } from "@/assets/js/member.js";

    /*默认的抽奖人数*/
    let selected = 1;
    /*是否正在抽奖*/
    let running = 0;
    let fullState = "全屏";
    /*抽奖步骤*/
    let status = ["抽奖", "停！", "继续"];
    let prizes = [
        {
            name: "TBox 茶合",
            prize: "三等奖 ",
            level: 3,
            url: "img/prize/a11.png",
            person: "",
        },
    ];
    let position = 0; /*正在抽第几个奖*/
    let showResult: boolean = false; /*是否展示抽奖信息*/

    // 定义用户数据的类型
    interface UserItem {
        name: string;
        index?: number;
    }

    let userData: UserItem[] = [];

    let tagCanvasInstance;
    let speed = function () {
        return [0.2, 0.08];
    };

    /*从本地存储获取当前被选中过的人员名单*/
    const choosedStr = localStorage.getItem("choosed");
    var choosed = choosedStr ? JSON.parse(choosedStr) : {};
    // var choosed = JSON.parse(localStorage.getItem("choosed")) || {};

    /*创建名单列表*/
    const createHTML = (self: any) => {
        /*创建词云列表*/
        var html = ["<ul>"];
        /*遍历存储好的人员名单*/
        let max = userData.length;
        userData.forEach(function (item: any, index: number) {
            item["index"] = index;
            /*如何已经被抽奖抽中了，显示黄色的名字*/
            console.log(!choosed[item.name]);

            if (!choosed[item.name]) {
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

    const buildData = () => {
        member.forEach((item: any, index: number) => {
            userData.push({ name: item, index: index });
        });
        /*清除抽奖记录*/
        localStorage.clear();

        /*监控窗口大小变化，及时重绘canvas*/
        window.onresize = function () {
            /*窗口大小发生变化*/

            /*移除词云*/
            const canvasElement = document.getElementById("myCanvas");
            if (canvasElement) {
                const parentElement = canvasElement.parentElement;
                if (parentElement) {
                    parentElement.removeChild(canvasElement);
                }
            }

            /*移除遮罩*/
            const mainElement = document.getElementById("main");
            if (mainElement) {
                // 移除遮罩
                mainElement.classList.remove("mask");
            }

            /*重新创建词云*/
            createCanvas();

            /*将抽奖状态归0*/
            running = 0;
        };
    };

    const removeMask = () => {
        const mainElement = document.getElementById("main");
        if (mainElement) {
            mainElement.classList.remove("mask");
        }
    };

    const addMask = () => {
        const mainElement = document.getElementById("main");
        if (mainElement) {
            mainElement.classList.add("mask");
        }
    };

    const handleOfToggle = () => {
        if (position >= prizes.length) {
            /*所有奖品抽完了，当前奖品等级0*/
            running = 0;

            alert("所有奖品都抽完了！");
            return;
        }

        /*判断是否正在抽奖*/

        /*是否展示了抽奖结果*/
        if (showResult) {
            showResult = !showResult;
            /*进入待抽奖的状态*/
            running = 0;

            removeMask();
            return;
        }

        /*如果正在抽奖*/
        if (running == 1) {
            /*将词云的速度转换为正常速度*/
            (window as any).TagCanvas.SetSpeed("myCanvas", speed());

            /*随机生成抽奖名单*/
            // var ret = lottery(selected);
            let ret = userData;

            /*如果所有人都被抽中了，提示无可抽奖人员*/
            if (ret.length === 0) {
                alert("所有人都中奖了！");
                running = 0;
                return;
            } else {
                addMask();
                let level = "";

                console.log("当前奖品等级：", prizes);
                console.log("当前奖品等级：", position);
                console.log("当前奖品等级：", level);
                /*判断当前的奖品等级*/
                switch (prizes[position].level) {
                    case 1:
                        level = "一等奖";
                        break;
                    case 2:
                        level = "二等奖";
                        break;
                    case 3:
                        level = "三等奖";
                        break;
                    default:
                }

                /*中奖信息*/
                prizes[position].person = ret[0].name;

                /*重新加载人员名单*/
                /*移除词云*/
                const canvasElement = document.getElementById("myCanvas");
                if (canvasElement) {
                    const parentElement = canvasElement.parentElement;
                    if (parentElement) {
                        parentElement.removeChild(canvasElement);
                    }
                }
                /*重新创建词云*/
                createCanvas();

                /*记录中奖时间和名单到本地*/
                localStorage.setItem(new Date().toString(), ret[0].name);
            }

            running = 2;

            /*进入中奖结果公式状态*/
        } else if (running == 2) {
            /*隐藏滤镜*/
            removeMask();

            /*进入待抽奖的状态*/
            running = 0;

            position++; //下一个待抽奖品
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

        if (showResult) {
            removeMask();
        } else {
            addMask();
        }

        /*改变显示的状态*/
        showResult = !showResult;
    };

    const handleOfReset = () => {
        /*如果不是待抽奖状态*/
        if (running != 0) {
            return;
        }

        const isConfirm = confirm("确定要重置么？所有之前的抽奖历史将被清除！");
        if (isConfirm) {
            location.reload();
        }
    };

    onMount(() => {
        buildData();
        createCanvas();
    });

    onDestroy(() => {
        // stopTagCanvas();
    });
</script>

<div class="wall" id="main"></div>

<!--显示右下角的工具按钮-->
<div class="tools">
    <button
        on:click={handleOfToggle}
        class="pure-button"
        class:button-error={running !== 1}
        class:button-secondary={running === 1}
    >
        {showResult ? "继续" : status[running]}
    </button>
    <button class="pure-button button-success" on:click={handleOfFullScreen}
        >{fullState}</button
    >
    <!--显示抽奖结果-->
    <button class="pure-button button-secondary" on:click={handleOfShowList}
        >结果</button
    >
    <button
        class="pure-button button-warning"
        style="font-family: myfont;"
        on:click={handleOfReset}>重置</button
    >
</div>

<!--展示页面-->
{#if running == 2}
    <div id="result" class="result">
        {#if !showResult}
            <div class="display">
                <!--输出抽奖结果-->
                <img src={prizes[position].url} />
                <div class="down">
                    <div class="item1">
                        {prizes[position].prize + " " + prizes[position].name}
                    </div>
                    <div class="item2">{prizes[position].person}</div>
                </div>
            </div>
        {/if}
    </div>
{/if}

<style lang="scss">
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
            zoom: 1;
            line-height: normal;
            white-space: nowrap;
            vertical-align: middle;
            text-align: center;
            cursor: pointer;
            -webkit-user-drag: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            font-family: inherit;
            font-size: 100%;
            padding: 0.5em 1em;
            color: rgba(0, 0, 0, 0.8);
            border: unset;
            background-color: #e6e6e6;
            text-decoration: none;
            border-radius: 2px;
            position: relative;
            z-index: 9999;
            display: inline-block;
            margin: 5px;
            padding: 10px 0;
            text-align: center;
            width: 50px;

            &:focus {
                outline: 0;
            }

            &.button-success,
            &.button-error,
            &.button-warning,
            &.button-secondary {
                color: white;
                border-radius: 4px;
                text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
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
            align-items: center;
            justify-content: center;
            align-content: center;
            flex-wrap: wrap;
            img {
                width: 25%;
                margin-top: 20%;
                margin-left: 39.5%;
                margin-right: 40.5%;
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
            ul {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                align-content: center;
                justify-content: space-between;
                li {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-wrap: wrap;
                    margin: 20px 10px;
                    background-image: url("@/assets/img/bg.png");
                    background-size: 100% 100%;
                    img {
                        width: 50%;
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
