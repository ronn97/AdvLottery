<script>
    let running = 0;
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
</script>

<div id="main" class="wall"></div>

<style lang="scss">
    .wall {
        width: 100%;
        min-width: 1200px;
        height: 100%;
        box-sizing: border-box;
        margin: 0;
        background-image: url("@/assets/wall.jpg");
        overflow: hidden;
        background-color: #121936;
        background-size: 100% 100%;
        background-position: center center;
        background-repeat: no-repeat;
    }
</style>
