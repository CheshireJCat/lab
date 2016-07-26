var windowWidth = 1920;
var windowHeight = 1080;
tm.main(function() {
    var app = tm.hybrid.Application("#canvas2d", "#canvas3d");
    app.fps = 60;
    app.resize(windowWidth, windowHeight).fitWindow().run();
    app.enableStats();
    
    app.replaceScene(tm.game.LoadingScene({
        width: windowWidth, height: windowHeight,
        assets: {
            hiyoko: "assets/hiyoco_nomal_full.png",
            bgm: "assets/jljt.mp3",

            //urlをモデルデータ、モーションデータの順に指定
            //There is a need to specify the PMD and VMD together to play the MMD
            miku: {
                type: "mmd",
                //url: ["assets/pmd/miku_v2.pmd", "assets/pmd/jl2.vmd"],
                url: ["assets/pmd/miku.pmd", "assets/pmd/jl2.vmd"],
            },
            //分けて読み込みも可能
            haku:   "assets/pmd/haku.pmd",
            neru:   "assets/pmd/neru.pmd",
            wave:   "assets/pmd/jl2.vmd",
            wave2:   "assets/pmd/jl1.vmd",
        },
        nextScene: MikuOnStage,
    }));
});

tm.define("MikuOnStage", {
    superClass: "tm.hybrid.Scene", // tm.app.Sceneの3D向け拡張
    init: function() {
        this.superInit();

        // カメラ調整
        this.camera.setPosition(0, 10, 60);
        this.camera.lookAt(new THREE.Vector3(0, 15, 0));
        
        // ライトを動かす
        this.directionalLight.setPosition(0, 100, -80);

        // メッシュを表示する
        var miku = tm.hybrid.MMDMesh("miku")
            .addChildTo(this)
            .setPosition(0, 0, 20)
            .on("enterframe", function() {
                if (this.rolling) this.rotationY += 180; // Y軸回転
            });

        //分割読み込みからメッシュを生成
        var neru = tm.hybrid.createMeshFromMMD("neru", "wave")
            .addChildTo(this)
            .setPosition(-20, 0, 0)
            .setRotation(0, 0, 0)
            .on("enterframe", function() {
                if (this.rolling) this.rotationY += 90; // Y軸回転
            });
        var haku = tm.hybrid.createMeshFromMMD("haku", "wave2")
            .addChildTo(this)
            .setPosition(20, 0, 0)
            .setRotation(0, 0, 0)
            .on("enterframe", function() {
                if (this.rolling) this.rotationY += 90; // Y軸回転
            });

        // 2Dスプライトとの併用も可能
        var hiyoko = tm.display.Sprite("hiyoko", 32, 32)
            .setScale(4)
            .setFrameIndex(0)
//            .addChildTo(this)
            .on("enterframe", function() {
                this.x += this.vx * 10;
                this.y += this.vy * 10;
                if (this.x < 0 || windowWidth < this.x) this.vx *= -1;
                if (this.y < 0 || windowHeight < this.y) this.vy *= -1;
                
                this.frameIndex = (this.frameIndex + 1) % 4;
                this.rotation += 2;
            });
        hiyoko.vx = 1;
        hiyoko.vy = 1;

        var btn = tm.ui.FlatButton({ text: "スタート" })
            .setPosition(320, windowHeight * 0.5)
            .addChildTo(this)
            .on("push", function() {
                btn.visible = false;
            }.bind(this));

        this.bgm = tm.asset.AssetManager.get("bgm");
        THREE.AnimationHandler.update(0);

        this.start = false;

        this.time = 0;
    },
    update: function(app) {
        if (!this.start) return;
        var t = this.bgm.context.currentTime;
        var delta = t - this.beforeTime;
        THREE.AnimationHandler.update(app.deltaTime/1000);
        this.beforeTime = t;
    },
    ontouchstart: function(e) {
        if (!this.start) {
            tm.sound.WebAudio.unlock();
            this.bgm.context.currentTime = 0;
            this.bgm.play();
            this.start = true;
            this.beforeTime = 0;
        }
    },
});
